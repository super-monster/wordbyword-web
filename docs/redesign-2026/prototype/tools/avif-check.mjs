#!/usr/bin/env node
// AVIF verification (R8, R58 as amended by R79, ENG-05). Three layers, cheapest first. GATE = layer 1 + layer 3
// (R79); layer 2 (sips) is auxiliary and only reported:
//   1. structure  — zero-dep ISOBMFF parse: `grid` items + `ispe` sizes. A grid (sips tiles anything > 1024px into
//                   512px tiles) or a side > 1024 with an odd output width/height is an error: Chrome/libavif renders
//                   such 4:2:0 grids fully transparent. Runs anywhere (also on a Linux CI box).
//   2. sips       — macOS: `sips -s format png` decodes the AVIF, then png.mjs counts transparent pixels. Auxiliary only
//                   (R79): ImageIO does not reproduce the Chrome bug; this layer hints at broken/empty encodes.
//   3. chrome     — macOS + Chrome: serves the files over http (file:// would taint the canvas), decodes every AVIF in
//                   headless Chrome, draws it to a canvas and counts alpha <= 8 pixels. This is the layer that sees the
//                   "white board" bug.
// CLI:  node tools/avif-check.mjs [--chrome] <file.avif> ...      (exit 1 when a gate layer fails; pass --chrome for
//       the full R79 gate)
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePNG, transparentShare } from './png.mjs';

export const MAX_TRANSPARENT = 0.005;   // screenshots are opaque: > 0.5 % transparent pixels = broken image
export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export function avifStructure(buf) {
  const items = [], ispe = [];
  const walk = (start, end) => {
    let off = start;
    while (off + 8 <= end) {
      let size = buf.readUInt32BE(off), hdr = 8;
      const type = buf.toString('latin1', off + 4, off + 8);
      if (size === 1) { size = Number(buf.readBigUInt64BE(off + 8)); hdr = 16; } else if (size === 0) size = end - off;
      if (size < hdr) break;
      const body = off + hdr, bend = Math.min(off + size, end);
      if (type === 'meta') walk(body + 4, bend);                                   // FullBox
      else if (type === 'iprp' || type === 'ipco') walk(body, bend);
      else if (type === 'iinf') { const v = buf[body]; walk(body + 4 + (v === 0 ? 2 : 4), bend); }
      else if (type === 'infe') {
        const v = buf[body];
        if (v >= 2) { const idLen = v === 2 ? 2 : 4; items.push(buf.toString('latin1', body + 4 + idLen + 2, body + 4 + idLen + 6)); }
      } else if (type === 'ispe') ispe.push({ w: buf.readUInt32BE(body + 4), h: buf.readUInt32BE(body + 8) });
      off = off + size;
    }
  };
  walk(0, buf.length);
  const out = ispe.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a), { w: 0, h: 0 });
  const grid = items.includes('grid');
  const risky = grid || Math.max(out.w, out.h) > 1024;
  const ok = out.w > 0 && (!risky || (out.w % 2 === 0 && out.h % 2 === 0));
  return { ok, grid, width: out.w, height: out.h, items: items.length };
}

export function sipsAlpha(file) {
  const dir = mkdtempSync(join(tmpdir(), 'avif-sips-'));
  try {
    const out = join(dir, 'd.png');
    execFileSync('sips', ['-s', 'format', 'png', file, '--out', out], { stdio: 'ignore' });
    const img = decodePNG(readFileSync(out));
    const t = transparentShare(img);
    return { ok: t <= MAX_TRANSPARENT, transparent: t, width: img.width, height: img.height };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

const TYPES = { '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.html': 'text/html' };
// files: absolute paths under `root`; returns Map(file -> { ok, transparent, width, height } | { ok:false, error })
export async function chromeAlpha(files, root) {
  if (!existsSync(CHROME)) return null;
  const server = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = resolve(root, '.' + p);
    if (p === '/' || !f.startsWith(root) || !existsSync(f)) { res.writeHead(p === '/' ? 200 : 404, { 'content-type': 'text/html' }); res.end('<!doctype html><title>avif check</title>'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  const dbgPort = 9700 + Math.floor(Math.random() * 200);
  const profile = mkdtempSync(join(tmpdir(), 'avif-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${dbgPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    let tabs = [];
    for (let i = 0; i < 60 && !tabs.length; i++) { try { tabs = (await (await fetch(`http://127.0.0.1:${dbgPort}/json`)).json()).filter((t) => t.type === 'page'); } catch { /* starting */ } if (!tabs.length) await sleep(200); }
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0; const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Page.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/` });
    await sleep(600);
    const urls = files.map((f) => '/' + relative(root, f).split('/').map(encodeURIComponent).join('/'));
    const expr = `(async (urls) => { const out = []; for (const u of urls) { try { const img = new Image(); img.src = u; await img.decode();
      const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight), x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let t = 0; for (let i = 3; i < d.length; i += 4) if (d[i] <= 8) t++;
      out.push({ w: img.naturalWidth, h: img.naturalHeight, t: t / (c.width * c.height) }); } catch (e) { out.push({ error: String(e) }); } } return out; })(${JSON.stringify(urls)})`;
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    ws.close();
    const vals = r.result?.result?.value || [];
    return new Map(files.map((f, i) => {
      const v = vals[i] || { error: 'no result' };
      return [f, v.error ? { ok: false, error: v.error } : { ok: v.t <= MAX_TRANSPARENT, transparent: v.t, width: v.w, height: v.h }];
    }));
  } finally {
    proc.kill(); server.close();
    await sleep(300); rmSync(profile, { recursive: true, force: true });
  }
}

// ---- CLI ----
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const useChrome = args.includes('--chrome');
  const files = args.filter((a) => !a.startsWith('--')).map((f) => resolve(f));
  let bad = 0;
  const pct = (x) => `${(x * 100).toFixed(2)}%`;
  for (const f of files) {
    const s = avifStructure(readFileSync(f)), d = sipsAlpha(f);
    if (!s.ok) bad++;   // R79: structure is a gate, sips is not
    console.log(`${s.ok ? '✓' : '✗'} ${f}\n   structure: ${s.width}x${s.height}${s.grid ? ' grid (512px tiles)' : ''} ${s.ok ? 'ok' : 'ODD SIZE IN GRID/>1024 → Chrome renders transparent'} · sips decode (auxiliary): ${pct(d.transparent)} transparent${d.ok ? '' : ' (!)'}`);
  }
  if (useChrome) {
    const root = dirname(files[0]);
    const m = await chromeAlpha(files, files.every((f) => f.startsWith(root)) ? root : '/');
    if (!m) console.log('chrome: not found, skipped');
    else for (const [f, v] of m) { if (!v.ok) bad++; console.log(`${v.ok ? '✓' : '✗'} chrome ${f}: ${v.error || `${v.width}x${v.height}, ${pct(v.transparent)} transparent`}`); }
  }
  process.exit(bad ? 1 : 0);
}
