#!/usr/bin/env node
// Image checks — doc 06 §7.5 (R58 as amended by R79, ENG-05), doc 05 A19. Zero deps. The two layers together are
// the AVIF gate (R79):
//
//   ① structure (default; any OS, also the Linux CI / CF build box): assets/img/images.json ↔ files — every file
//      exists with the registered byte count and size, AVIFs parse (src/lib/avif.mjs) with an even width/height
//      (Chrome renders an odd-sized 512px-tile grid fully transparent, R8), sRGB colour, no alpha plane when
//      alpha:false; PNG/JPEG headers; recorded excerpt edges; L2 pins/ring; orphans; the public/ icons and
//      site.webmanifest declared in scripts/images.manifest.json.
//   ② --render (macOS + Chrome; required before committing images, M2-09): serves the files over http (file:// would
//      taint the canvas), decodes every registered image in headless Chrome, draws it to a canvas and samples alpha
//      at 5 points (centre + corners inset 10%) plus the transparent share (alpha ≤ 8). Fails when an alpha:false
//      image has a transparent sample point or > 1% transparent pixels, an alpha:true image is transparent at all 5
//      points, the decoded size differs from images.json, the image is blank (luminance σ < 1), or an excerpt's
//      first/last 4 rows contain ink (doc 05 §7.1).
//   --sips (macOS, auxiliary, never a gate — R79: ImageIO does not reproduce Chrome's "white board" bug): decodes
//      each AVIF with sips and reports its transparent share.
//
// Usage: node scripts/check-images.mjs [--render] [--sips] [file.avif …]
//   With file arguments only those files are checked (treated as opaque), e.g. a counter-example:
//   sips -s format avif odd-720x1485.png --out /tmp/odd.avif && node scripts/check-images.mjs --render /tmp/odd.avif
// Env: CHROME_BIN overrides the Chrome executable (default: /Applications/Google Chrome.app/…/Google Chrome).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avifInfo, avifProblems } from '../src/lib/avif.mjs';
import { decodePNG, icoEntries, jpegSize, pngSize, transparentShare } from './lib/png.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_FILE = join(ROOT, 'assets/img/images.json');
const MANIFEST_FILE = join(ROOT, 'scripts/images.manifest.json');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAX_TRANSPARENT = 0.01;    // doc 06 §7.5 ②: alpha:false images may have at most 1% pixels with alpha ≤ 8
const MAX_EDGE_INK = 0.005;      // excerpt edge rows: ≤ 0.5% ink (prototype G4 / inkShare)
const argv = process.argv.slice(2);
const RENDER = argv.includes('--render');
const SIPS = argv.includes('--sips');
const adhoc = argv.filter((a) => !a.startsWith('--')).map((f) => resolve(f));

let errors = 0, warnings = 0;
const fail = (m) => { errors++; console.log(`  ✗ ${m}`); };
const warn = (m) => { warnings++; console.log(`  ! ${m}`); };
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const pct = (x) => `${(x * 100).toFixed(2)}%`;
const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)])) : []);
const FORMAT_OF = { '.avif': 'avif', '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png' };

// ———————————————————————————— targets: registry variants, or ad-hoc files ————————————————————————————

// { file (absolute), label, format, expect: { w, h } | null, alpha, excerpt }
const targets = [];
let registry = null;
if (adhoc.length) {
  for (const f of adhoc) {
    if (!existsSync(f)) { fail(`no such file: ${f}`); continue; }
    targets.push({ file: f, label: f, format: FORMAT_OF[extname(f).toLowerCase()] || 'unknown', expect: null, alpha: false, excerpt: false });
  }
} else {
  if (!existsSync(REGISTRY_FILE)) { console.log('✗ assets/img/images.json is missing — run node scripts/images.mjs on a Mac'); process.exit(1); }
  registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8'));
  for (const [key, e] of Object.entries(registry)) {
    for (const v of e.variants || []) {
      targets.push({ file: join(ROOT, v.path), label: v.path, key, entry: e, v, format: v.format, expect: { w: v.w, h: v.h }, alpha: e.alpha === true, excerpt: !!e.region });
    }
  }
}

// ———————————————————————————— ① structure ————————————————————————————

console.log(`== ① structure (${adhoc.length ? `${targets.length} file(s)` : `assets/img/images.json: ${Object.keys(registry).length} keys, ${targets.length} files`})`);
let avifCount = 0, gridCount = 0;
const sets = {};
for (const t of targets) {
  if (!existsSync(t.file)) { fail(`${t.label}: missing (registered in images.json)`); continue; }
  const buf = readFileSync(t.file);
  if (t.v) {
    if (buf.length !== t.v.bytes) fail(`${t.label}: ${buf.length} bytes, images.json says ${t.v.bytes} — the image changed but scripts/images.mjs was not re-run (D-21)`);
    const want = `assets/img/${t.key}-${t.v.w}.${t.v.format}`;
    if (t.v.path !== want) fail(`${t.label}: path should be ${want} (doc 06 §7.3, D-16)`);
    const set = t.key.split('/').slice(0, 2).join('/');
    const s = (sets[set] ||= { files: 0, bytes: 0, byFormat: {} });
    s.files++; s.bytes += buf.length; s.byFormat[t.format] = (s.byFormat[t.format] || 0) + buf.length;
  }
  try {
    if (t.format === 'avif') {
      avifCount++;
      const info = avifInfo(buf);
      if (info.grid) gridCount++;
      for (const p of avifProblems(info, t.expect && { width: t.expect.w, height: t.expect.h })) fail(`${t.label}: ${p}`);
      if (info.alpha && !t.alpha) fail(`${t.label}: carries an alpha plane but the entry is alpha:false`);
    } else if (t.format === 'jpg') {
      const s = jpegSize(buf);
      if (t.expect && (s.width !== t.expect.w || s.height !== t.expect.h)) fail(`${t.label}: ${s.width}x${s.height}, images.json says ${t.expect.w}x${t.expect.h}`);
    } else if (t.format === 'png') {
      const s = pngSize(buf);
      if (t.expect && (s.width !== t.expect.w || s.height !== t.expect.h)) fail(`${t.label}: ${s.width}x${s.height}, images.json says ${t.expect.w}x${t.expect.h}`);
      if (s.hasAlpha && !t.alpha) fail(`${t.label}: PNG has an alpha channel but the entry is alpha:false`);
    } else fail(`${t.label}: unknown format`);
  } catch (e) { fail(`${t.label}: unreadable ${t.format} (${e.message})`); }
}

if (registry) {
  for (const [key, e] of Object.entries(registry)) {
    if (!Array.isArray(e.variants) || !e.variants.length) fail(`${key}: no variants`);
    if (typeof e.alpha !== 'boolean') fail(`${key}: alpha must be true or false`);
    if (e.statusBg !== undefined && (!/^#[0-9A-F]{6}$/.test(e.statusBg) || !['dark', 'light'].includes(e.statusTone))) fail(`${key}: statusBg/statusTone ${e.statusBg}/${e.statusTone}`);
    for (const p of e.pins || []) if (!['start', 'end'].includes(p.side) || !(p.y >= 0.07 && p.y <= 1)) fail(`${key}: pin ${JSON.stringify(p)} (side start|end, 0.07 ≤ y ≤ 1)`);
    if (e.ring && !(e.ring.x >= 0 && e.ring.y >= 0.07 && e.ring.x + e.ring.w <= 1 && e.ring.y + e.ring.h <= 1)) fail(`${key}: ring outside the screen`);
    if (e.region) {
      const g = e.edge;
      if (!g) fail(`${key}: excerpt without recorded edge metrics`);
      else if (g.inkTop > MAX_EDGE_INK || g.inkBottom > MAX_EDGE_INK) fail(`${key}: excerpt edge cuts through content (ink ${pct(g.inkTop)} / ${pct(g.inkBottom)})`);
    }
  }
  // files nobody registered (images.mjs --prune deletes them)
  const known = new Set(targets.map((t) => t.label));
  for (const f of walk(join(ROOT, 'assets/img')).map((x) => relative(ROOT, x).split(sep).join('/'))) {
    if (f !== 'assets/img/images.json' && !f.split('/').some((p) => p.startsWith('.')) && !known.has(f)) warn(`${f}: not registered in images.json (node scripts/images.mjs --prune)`);
  }
  // fixed-path icons and the web manifest (doc 06 §2.1, §7.4; doc 05 §7.8; R70)
  const icons = existsSync(MANIFEST_FILE) ? JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')).icons : null;
  if (icons) {
    for (const o of icons.outputs) {
      const f = join(ROOT, o.file);
      if (!existsSync(f)) { fail(`${o.file}: missing`); continue; }
      const buf = readFileSync(f);
      try {
        if (o.file.endsWith('.ico')) {
          const got = icoEntries(buf).map((e) => `${e.w}x${e.h}`).join(',');
          if (got !== o.sizes.map((n) => `${n}x${n}`).join(',')) fail(`${o.file}: entries ${got} (expected ${o.sizes.join('+')})`);
        } else {
          const p = pngSize(buf);
          if (p.width !== o.sizes[0] || p.height !== o.sizes[0]) fail(`${o.file}: ${p.width}x${p.height} (expected ${o.sizes[0]})`);
          if (o.shape === 'square' && p.hasAlpha) fail(`${o.file}: must be opaque (full-bleed square)`);
          if (o.shape === 'rounded' && !p.hasAlpha) fail(`${o.file}: rounded icon without alpha`);
        }
      } catch (e) { fail(`${o.file}: ${e.message}`); }
    }
    const wmFile = join(ROOT, icons.webmanifest.file);
    try {
      const wm = JSON.parse(readFileSync(wmFile, 'utf8'));
      if (!wm.name || !wm.theme_color || !wm.background_color || !Array.isArray(wm.icons)) fail(`${icons.webmanifest.file}: needs name, theme_color, background_color, icons`);
      for (const ic of wm.icons || []) {
        const f = join(ROOT, 'public', ic.src);
        const [w, h] = String(ic.sizes).split('x').map(Number);
        const p = existsSync(f) ? pngSize(readFileSync(f)) : null;
        if (!p || p.width !== w || p.height !== h) fail(`${icons.webmanifest.file}: icon ${ic.src} ${ic.sizes} missing or wrong size`);
      }
    } catch (e) { fail(`${icons.webmanifest.file}: ${e.message}`); }
  }
}
console.log(`  ${avifCount} AVIF (${gridCount} tiled grids), all parsed${errors ? '' : '; every AVIF even-sized, sRGB, no stray alpha'} · ${targets.length - avifCount} JPEG/PNG headers checked`);
if (registry) {
  let files = 0, bytes = 0;
  for (const [set, s] of Object.entries(sets)) {
    files += s.files; bytes += s.bytes;
    console.log(`  ${set.padEnd(16)} ${String(s.files).padStart(3)} files ${kb(s.bytes).padStart(10)}  (${Object.entries(s.byFormat).map(([f, b]) => `${f} ${kb(b)}`).join(', ')})`);
  }
  console.log(`  ${'total'.padEnd(16)} ${String(files).padStart(3)} files ${kb(bytes).padStart(10)}`);
}

// ———————————————————————————— auxiliary: sips decode (R79: hint only) ————————————————————————————

if (SIPS) {
  console.log('\n== sips decode (auxiliary, not a gate — R79)');
  if (process.platform !== 'darwin') warn('--sips needs macOS');
  else {
    const dir = mkdtempSync(join(tmpdir(), 'wbw-sips-'));
    let worst = 0;
    try {
      for (const t of targets.filter((x) => x.format === 'avif' && existsSync(x.file))) {
        const out = join(dir, 'd.png');
        execFileSync('sips', ['-s', 'format', 'png', t.file, '--out', out], { stdio: 'ignore' });
        const share = transparentShare(decodePNG(readFileSync(out)));
        worst = Math.max(worst, share);
        if (!t.alpha && share > MAX_TRANSPARENT) warn(`sips: ${t.label} ${pct(share)} transparent`);
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
    console.log(`  max transparent share after sips decode: ${pct(worst)}`);
  }
}

// ———————————————————————————— ② render (Chrome headless) ————————————————————————————

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// In-page analysis: decode, draw, sample. Runs inside Chrome (serialised with Function.prototype.toString).
async function analyse(items) {
  const lum = (d, o) => 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
  const ink = (d, w, y0, y1) => {
    let n = 0, k = 0;
    for (let y = y0; y < y1; y++) {
      const row = [];
      for (let x = 0; x < w; x++) row.push(lum(d, (y * w + x) * 4));
      const med = [...row].sort((a, b) => a - b)[row.length >> 1];
      for (const l of row) { n++; if (Math.abs(l - med) > 48) k++; }
    }
    return k / n;
  };
  const out = [];
  for (const it of items) {
    try {
      const img = new Image();
      img.src = it.url;
      await img.decode();
      const w = img.naturalWidth, h = img.naturalHeight;
      const c = new OffscreenCanvas(w, h);
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, w, h).data;
      let t = 0, s = 0, s2 = 0;
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] <= 8) t++; const l = lum(d, i); s += l; s2 += l * l; }
      const n = w * h, mean = s / n;
      const samples = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]
        .map(([fx, fy]) => d[(Math.min(h - 1, Math.floor(fy * h)) * w + Math.min(w - 1, Math.floor(fx * w))) * 4 + 3]);
      const r = { w, h, transparent: t / n, samples, std: Math.sqrt(Math.max(0, s2 / n - mean * mean)) };
      if (it.excerpt) { r.inkTop = ink(d, w, 0, 4); r.inkBottom = ink(d, w, h - 4, h); }
      out.push(r);
    } catch (e) { out.push({ error: String(e && e.message || e) }); }
  }
  return out;
}

async function renderCheck(list) {
  if (!existsSync(CHROME)) return { error: `Chrome not found at ${CHROME} (set CHROME_BIN)` };
  if (typeof WebSocket !== 'function') return { error: 'this Node has no global WebSocket (Node ≥ 22 required)' };
  // http only: file:// would taint the canvas. Only the listed files are served.
  const routes = new Map(list.map((t, i) => [`/f/${i}${extname(t.file).toLowerCase()}`, t.file]));
  const TYPES = { '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
  const server = createServer((req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    const f = routes.get(p);
    if (!f) { res.writeHead(p === '/' ? 200 : 404, { 'content-type': 'text/html' }); res.end('<!doctype html><title>image check</title>'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(tmpdir(), 'wbw-imgcheck-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-background-networking', '--disable-component-update', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  const exited = new Promise((r) => proc.once('exit', r));
  let ws;
  try {
    let port = null;
    for (let i = 0; i < 150 && !port; i++) {                       // Chrome writes the chosen port here
      try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim() || null; } catch { /* starting */ }
      if (!port) await sleep(100);
    }
    if (!port) throw new Error('Chrome did not open a DevTools port');
    let page = null;
    for (let i = 0; i < 50 && !page; i++) {
      try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* starting */ }
      if (!page) await sleep(100);
    }
    if (!page) throw new Error('no page target');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('DevTools WebSocket failed')); });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Page.enable');
    await send('Page.navigate', { url: `${base}/` });
    await sleep(500);
    const items = list.map((t, i) => ({ url: `/f/${i}${extname(t.file).toLowerCase()}`, excerpt: t.excerpt }));
    const r = await Promise.race([
      send('Runtime.evaluate', { expression: `(${analyse.toString()})(${JSON.stringify(items)})`, awaitPromise: true, returnByValue: true }),
      sleep(180000).then(() => ({ timeout: true })),
    ]);
    if (r.timeout) throw new Error('Chrome analysis timed out');
    if (r.result?.exceptionDetails) throw new Error(`page error: ${r.result.exceptionDetails.text}`);
    return { results: r.result?.result?.value || [] };
  } catch (e) {
    return { error: e.message };
  } finally {
    try { ws?.close(); } catch { /* closed */ }
    proc.kill('SIGTERM');
    const done = await Promise.race([exited.then(() => true), sleep(5000).then(() => false)]);
    if (!done) { proc.kill('SIGKILL'); await Promise.race([exited, sleep(2000)]); }
    server.close();
    rmSync(profile, { recursive: true, force: true });
  }
}

if (RENDER) {
  const list = targets.filter((t) => existsSync(t.file) && t.format !== 'unknown');
  console.log(`\n== ② render: Chrome headless decode + alpha sampling (${list.length} files)`);
  const { results, error } = await renderCheck(list);
  if (error) fail(`render layer not run: ${error}`);
  else {
    let worst = 0, minStd = Infinity, decoded = 0;
    list.forEach((t, i) => {
      const r = results[i] || { error: 'no result' };
      if (r.error) { fail(`${t.label}: Chrome could not decode it (${r.error})`); return; }
      decoded++;
      if (t.expect && (r.w !== t.expect.w || r.h !== t.expect.h)) fail(`${t.label}: Chrome decodes ${r.w}x${r.h}, images.json says ${t.expect.w}x${t.expect.h}`);
      if (t.alpha) {
        if (r.samples.every((a) => a === 0)) fail(`${t.label}: transparent at all 5 sample points`);
      } else {
        worst = Math.max(worst, r.transparent);
        if (r.samples.some((a) => a === 0) || r.transparent > MAX_TRANSPARENT) {
          fail(`${t.label}: Chrome renders ${pct(r.transparent)} transparent (sample alphas ${r.samples.join('/')}) — "white board" (R8/R79)`);
        }
      }
      minStd = Math.min(minStd, r.std);
      if (r.std < 1) fail(`${t.label}: blank image (luminance σ ${r.std.toFixed(2)})`);
      if (t.excerpt && (r.inkTop > MAX_EDGE_INK || r.inkBottom > MAX_EDGE_INK)) fail(`${t.label}: decoded excerpt edge has ink ${pct(r.inkTop)} / ${pct(r.inkBottom)} (doc 05 §7.1)`);
    });
    console.log(`  ${decoded}/${list.length} decoded · max transparent share (alpha:false) ${pct(worst)} · min luminance σ ${minStd === Infinity ? '—' : minStd.toFixed(1)}`);
  }
} else {
  console.log('\n  (layer ② skipped — run with --render on a Mac before committing images; R79 gate = ① + ②)');
}

console.log(errors ? `\n${errors} problem(s), ${warnings} warning(s)` : `\nall image checks passed${RENDER ? ' (structure + Chrome render)' : ' (structure)'}, ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
