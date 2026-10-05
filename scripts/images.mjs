#!/usr/bin/env node
// Image pipeline — doc 06 §7 (script, paths, naming, checks), doc 05 §7 (sources, crops, sizes, quality; R8),
// rulings R44, R58, R67, R70, R71, R79. Port of the prototype's tools/build-images.mjs (design-docs branch,
// docs/redesign-2026/prototype) into the production layout.
//
//   source ─ sips decode (+ Display P3 → sRGB) ─▶ node crop: screen minus status bar / 16:9 excerpt / crop rectangle
//          ─▶ sips resample (intermediate PNG) ─▶ node even trim + white matte ─▶ sips encode AVIF / JPEG / PNG
//          ─▶ assets/img/<group>/<set>/<subject>-<w>.<ext>  +  assets/img/images.json
//   app icon ─▶ public/favicon.ico (16 + 32), public/icons/*.png, public/site.webmanifest (doc 06 §7.4, R70)
//
// R79: every crop — including the even trim — happens in node on decoded pixels (scripts/lib/png.mjs); sips only
// decodes / converts colour, resamples and encodes (`sips -c … --cropOffset 0 0` silently centres the crop, and a crop
// touching the bottom edge returns the uncropped image). R8: sips writes AVIFs with a side > 1024px as 512px-tile
// grids and Chrome renders such a grid fully transparent when a side is odd, so every output is trimmed to even.
//
// images.json (generated, do not edit; build.mjs D-21 verifies it): key → { src, srcHash, preset?, region?, crop,
//   alpha, statusBg?, statusTone?, pins?, ring?, edge?, variants: [{ format, w, h, bytes, path }] } with `path`
//   relative to the repo root (assets/img/…; build.mjs fingerprints it to /assets/img/…<h8>.<ext>, doc 06 §3.5).
//
// macOS only. Zero npm deps. Sources are only read (git sources via `git show <rev>:<path>`); temporary files go to
// $TMPDIR/wbw-images (deleted at the end unless --keep-tmp). sips encodes byte-identically, so a re-run without source
// changes leaves git clean.
//
// Usage: node scripts/images.mjs [--prune] [--keep-tmp]
//   --prune   delete files under assets/img that images.json does not register (otherwise they are only listed)
// Then:  node scripts/check-images.mjs --render     (structure + Chrome decode gate, R79; `npm run images` chains both)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avifInfo, avifProblems } from '../src/lib/avif.mjs';
import { crop, decodePNG, encodePNG, flatten, icoEntries, inkShare, jpegSize, opaqueShare, pngSize, rowStd } from './lib/png.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_FILE = join(ROOT, 'scripts/images.manifest.json');
const OUT = join(ROOT, 'assets/img');
const REGISTRY_FILE = join(OUT, 'images.json');
const TMP = join(process.env.WBW_IMG_TMP || tmpdir(), 'wbw-images');   // os.tmpdir() honours $TMPDIR
const SRGB = '/System/Library/ColorSync/Profiles/sRGB Profile.icc';
const STATUS = 54 / 874;            // iOS status bar share of a 402×874pt screen (R67, doc 05 §7.1)
const KEY_RE = /^(shot|ext|se|brand)\/(en|ja|zh-hans|common)\/[a-z0-9]+(-[a-z0-9]+)*$/;   // doc 06 §7.3, D-16
const FIELDS = new Set(['key', 'src', 'preset', 'crop', 'region', 'widths', 'jpeg', 'formats', 'alpha', 'statusBg', 'statusTone', 'pins', 'ring', 'quality', 'note']);
const args = new Set(process.argv.slice(2));
const t0 = Date.now();

const die = (msg) => { console.error(`images.mjs: ${msg}`); process.exit(1); };

// ———————————————————————————— environment (doc 06 §7.5 check 7) ————————————————————————————

if (process.platform !== 'darwin') die('needs macOS (sips). The outputs are committed; other machines only run scripts/check-images.mjs.');
{
  let formats = '';
  try { formats = execFileSync('sips', ['--formats'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch { die('sips not found'); }
  for (const f of ['avif', 'jpeg', 'png', 'ico']) if (!new RegExp(`\\b${f}\\s+Writable`).test(formats)) die(`this sips cannot write ${f} (sips --formats)`);
}

// ———————————————————————————— issues ————————————————————————————

const errors = [], warnings = [];
const err = (k, m) => { errors.push(`${k}: ${m}`); console.log(`    ✗ ${m}`); };
const warn = (k, m) => { warnings.push(`${k}: ${m}`); console.log(`    ! ${m}`); };

// ———————————————————————————— helpers ————————————————————————————

const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const kb = (n) => `${(n / 1024).toFixed(1)}K`;
let seq = 0;
const tmp = (name) => join(TMP, `${String(++seq).padStart(4, '0')}-${name}`);
const sips = (...a) => execFileSync('sips', a.map(String), { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const profileOf = (f) => (sips('-g', 'profile', f).match(/profile: (.*)/) || [])[1]?.trim() || '<nil>';
const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)])) : []);

// roots: "$ENV|default" — the environment variable wins; a relative default resolves against the repo root
function rootDir(kind) {
  const spec = manifest.roots[kind];
  if (!spec) throw new Error(`no root "${kind}" in images.manifest.json`);
  const [env, def] = spec.includes('|') ? spec.split('|') : [null, spec];
  const v = env?.startsWith('$') ? process.env[env.slice(1)] : null;
  return { dir: resolve(ROOT, v || def), env: env?.slice(1) };
}

// deny list (doc 06 §7.1, doc 05 §7.9): `*` = within a path segment, `**` = across segments
const globRe = (g) => new RegExp('^' + g.normalize('NFC').split(/(\*\*|\*|\?)/)
  .map((p) => (p === '**' ? '.*' : p === '*' ? '[^/]*' : p === '?' ? '[^/]' : p.replace(/[.+^${}()|[\]\\]/g, '\\$&'))).join('') + '$');
const DENY = manifest.deny.map((g) => [g, globRe(g)]);
const deniedBy = (src) => DENY.find(([, re]) => re.test(src.normalize('NFC')))?.[0];

// source → file on disk (git sources are extracted from history, never re-added to the repo) + its sRGB PNG decode
const sources = new Map();
function source(src) {
  if (sources.has(src)) return sources.get(src);
  const m = src.match(/^(git|res|se|ios):(.+)$/);
  if (!m) throw new Error(`source "${src}" must start with git:, res:, se: or ios:`);
  const [, kind, path] = m;
  const deny = deniedBy(src);
  if (deny) throw new Error(`source is on the deny list (${deny})`);
  let file;
  if (kind === 'git') {
    const rev = manifest.roots.git;
    let buf;
    try { buf = execFileSync('git', ['-C', ROOT, 'show', `${rev}:${path}`], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { throw new Error(`git show ${rev}:${path} failed: ${String(e.stderr || e.message).trim()}`); }
    file = tmp(`src${extname(path).toLowerCase()}`);
    writeFileSync(file, buf);
  } else {
    const r = rootDir(kind);
    file = join(r.dir, path);
    if (!existsSync(file)) throw new Error(`missing source ${file}${r.env ? ` (override the root with $${r.env})` : ''}`);
  }
  const profile = profileOf(file);
  const convert = profile !== '<nil>' && !/sRGB/i.test(profile);    // Display P3 (RES) → sRGB, doc 05 §7.1
  const png = tmp('decoded.png');
  sips('-s', 'format', 'png', ...(convert ? ['--matchTo', SRGB] : []), file, '--out', png);
  const out = { file, png, profile, convert, hash: sha(readFileSync(file)).slice(0, 16) };
  sources.set(src, out);
  return out;
}

// crop rectangle in source pixels (doc 06 §7.2): screen = preset minus 54/874 status bar (R67); excerpt = 16:9 band
function regionOf(job, img) {
  if (job.crop) return { ...job.crop };
  if (!job.preset) return { x: 0, y: 0, w: img.width, h: img.height };
  const p = manifest.presets[job.preset];
  if (!p) throw new Error(`unknown preset "${job.preset}"`);
  if (job.region) {
    const y = p.y + Math.round(job.region.y * p.h);
    return { x: p.x, y, w: p.w, h: Math.min(Math.round(job.region.h * p.h), p.y + p.h - y) };
  }
  const cut = Math.round(STATUS * p.h);
  return { x: p.x, y: p.y + cut, w: p.w, h: p.h - cut };
}

// status-bar colour = median of the crop's first 4 rows (x 20–80%), tone = text colour on it (doc 05 §7.1, R67)
function statusOf(img) {
  const px = [];
  for (let y = 0; y < Math.min(4, img.height); y++) for (let x = Math.round(img.width * 0.2); x < img.width * 0.8; x += 3) {
    const o = (y * img.width + x) * 4; px.push([img.data[o], img.data[o + 1], img.data[o + 2]]);
  }
  const med = [0, 1, 2].map((c) => px.map((p) => p[c]).sort((a, b) => a - b)[px.length >> 1]);
  const lum = (0.2126 * med[0] + 0.7152 * med[1] + 0.0722 * med[2]) / 255;
  return { statusBg: hex(med), statusTone: lum > 0.5 ? 'dark' : 'light' };
}

// excerpt edges (doc 05 §7.1, VIS-10): first/last 4 rows must be blank. Gate = ink share ≤ 0.5% (prototype G4); σ is a
// hint only — a blank row crossing a light-grey card on white measures σ ≈ 5–6 without any text.
const edgeOf = (img) => ({
  inkTop: inkShare(img, 0, 4), inkBottom: inkShare(img, img.height - 4, img.height),
  stdTop: rowStd(img, 0, 4), stdBottom: rowStd(img, img.height - 4, img.height),
});

function budgetFor(width, format) {
  const keys = Object.keys(manifest.budget || {}).map(Number).sort((a, b) => a - b);
  const k = keys.find((x) => x >= width) ?? keys[keys.length - 1];
  return k === undefined ? undefined : manifest.budget[k]?.[format];
}

function sizeOf(format, buf) {
  if (format === 'avif') return avifInfo(buf);
  if (format === 'jpg') return jpegSize(buf);
  return pngSize(buf);
}

// ———————————————————————————— screenshots, SE window, brand icons → assets/img ————————————————————————————

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const registry = {};
const seen = new Set();
console.log(`images.mjs — ${manifest.images.length} entries → ${relative(ROOT, OUT)}/ (tmp ${TMP})`);

for (const job of manifest.images) {
  const key = job.key;
  console.log(`  ${key}`);
  try {
    // ---- manifest sanity ----
    if (!KEY_RE.test(key || '')) throw new Error(`key must match <shot|ext|se|brand>/<en|ja|zh-hans|common>/<subject> in lowercase ASCII (D-16)`);
    if (seen.has(key)) throw new Error('duplicate key');
    seen.add(key);
    for (const f of Object.keys(job)) if (!FIELDS.has(f)) warn(key, `unknown field "${f}" (typo?)`);
    if (job.crop && job.preset) throw new Error('use either preset or crop');
    if (job.region && !job.preset) throw new Error('region needs a preset');
    if (job.region && !(job.region.y >= 0.07 && job.region.h > 0 && job.region.y + job.region.h <= 1)) {
      throw new Error(`region ${JSON.stringify(job.region)} must lie inside the screen below the status bar (y ≥ 0.07, doc 05 §7.1)`);
    }
    if (!Array.isArray(job.widths) || !job.widths.length || job.widths.some((w) => !Number.isInteger(w) || w <= 0 || w % 2)) throw new Error('widths must be even positive integers');
    const formats = job.formats || (job.jpeg ? ['avif', 'jpg'] : ['avif']);
    if (formats.some((f) => !['avif', 'jpg', 'png'].includes(f))) throw new Error(`formats ${formats} (allowed: avif, jpg, png)`);
    if (formats.includes('jpg') && !(Number.isInteger(job.jpeg) && job.jpeg % 2 === 0)) throw new Error('jpg needs an even "jpeg" width');
    const alpha = job.alpha === true;

    // ---- source → crop (node) ----
    const s = source(job.src);
    const full = decodePNG(readFileSync(s.png));
    const rect = regionOf(job, full);
    let base = crop(full, rect, job.src);
    if (s.convert) console.log(`    colour: ${s.profile} → sRGB`);
    const opaque = opaqueShare(base);
    if (!alpha && opaque < 1) {
      base = flatten(base);                              // white matte (doc 06 §7.2); e.g. the demo screens' rounded bottom corners
      console.log(`    matte: ${((1 - opaque) * 100).toFixed(3)}% non-opaque pixels flattened onto white`);
    }
    if (rowStd(base, 0, base.height) < 2) err(key, 'crop is blank (luminance σ < 2) — wrong preset/crop?');
    const baseFile = tmp('crop.png');
    writeFileSync(baseFile, encodePNG(base.width, base.height, base.data, { alpha, level: 1 }));

    const entry = { src: job.src, srcHash: s.hash };
    if (job.preset) entry.preset = job.preset;
    if (job.region) entry.region = job.region;
    entry.crop = rect;
    entry.alpha = alpha;

    // ---- screens: status bar colour (R67); L2 pins / ring (doc 05 §5.4.2) ----
    if (job.preset && !job.region) {
      const st = statusOf(base);
      if (job.statusBg && (job.statusBg.toUpperCase() !== st.statusBg || (job.statusTone && job.statusTone !== st.statusTone))) {
        warn(key, `statusBg/statusTone override ${job.statusBg}/${job.statusTone} differs from the sampled ${st.statusBg}/${st.statusTone}`);
      }
      entry.statusBg = (job.statusBg || st.statusBg).toUpperCase();
      entry.statusTone = job.statusTone || st.statusTone;
    }
    if (job.pins) {
      for (const p of job.pins) if (!['start', 'end'].includes(p.side) || !(p.y >= 0.07 && p.y <= 1)) err(key, `pin ${JSON.stringify(p)}: side start|end, y in [0.07, 1] (full-screen ratio, doc 05 §7.1)`);
      entry.pins = job.pins;
    }
    if (job.ring) {
      const r = job.ring;
      if (!(r.x >= 0 && r.y >= 0.07 && r.w > 0 && r.h > 0 && r.x + r.w <= 1 && r.y + r.h <= 1)) err(key, `ring ${JSON.stringify(r)} outside the screen`);
      entry.ring = r;
    }

    // ---- variants ----
    const q = {
      avif: job.quality?.avif ?? (key.startsWith('se/') ? manifest.quality.avifSe : manifest.quality.avif),
      jpg: job.quality?.jpg ?? manifest.quality.jpg,
    };
    const plan = [];
    for (const f of formats) {
      if (f === 'jpg') plan.push({ format: 'jpg', width: job.jpeg });
      else for (const w of [...job.widths].sort((a, b) => a - b)) plan.push({ format: f, width: w });
    }
    const inter = new Map();                             // width → { file, img }
    const subject = key.split('/')[2];
    const variants = [];
    let edge = null;
    for (const { format, width } of plan) {
      if (width > base.width) throw new Error(`width ${width} > source crop width ${base.width} (never upscale)`);
      if (!inter.has(width)) {
        let img = base;
        if (width !== base.width) {
          const r = tmp(`w${width}.png`);
          sips('-s', 'format', 'png', '--resampleWidth', width, baseFile, '--out', r);
          img = decodePNG(readFileSync(r));
          if (!alpha) img = flatten(img);
        }
        const ew = img.width - (img.width % 2), eh = img.height - (img.height % 2);   // R8 even trim, in node (R79)
        if (ew !== img.width || eh !== img.height) img = crop(img, { x: 0, y: 0, w: ew, h: eh }, `even trim ${key}`);
        const file = tmp(`e${width}.png`);
        writeFileSync(file, encodePNG(img.width, img.height, img.data, { alpha, level: 1 }));
        inter.set(width, { file, img });
        if (job.region) {                                // worst edge across the encoded sizes
          const e = edgeOf(img);
          edge = edge ? Object.fromEntries(Object.entries(e).map(([k, v]) => [k, Math.max(v, edge[k])])) : e;
        }
      }
      const { file, img } = inter.get(width);
      const ext = format;
      const path = `assets/img/${key.split('/').slice(0, 2).join('/')}/${subject}-${width}.${ext}`;   // repo-relative (build.mjs publishes it)
      const abs = join(ROOT, path);
      const o = tmp(`out.${ext}`);
      sips('-s', 'format', format === 'jpg' ? 'jpeg' : format, ...(format === 'png' ? [] : ['-s', 'formatOptions', q[format]]), file, '--out', o);
      if (!existsSync(o)) throw new Error(`sips wrote no ${format} for ${path}`);
      mkdirSync(dirname(abs), { recursive: true });
      copyFileSync(o, abs);

      // ---- doc 06 §7.5 check 3 (+ structure, colour, alpha) on the written file ----
      const buf = readFileSync(abs);
      const info = sizeOf(format, buf);
      const v = { format, w: info.width, h: info.height, bytes: buf.length, path };
      if (info.width !== img.width || info.height !== img.height) err(key, `${path}: ${info.width}x${info.height}, expected ${img.width}x${img.height}`);
      if (info.width % 2 || info.height % 2) err(key, `${path}: odd size ${info.width}x${info.height} (R8)`);
      if (Math.abs((info.width / info.height) / (rect.w / rect.h) - 1) > 0.005) err(key, `${path}: aspect ratio off by more than 0.5% from the crop ${rect.w}x${rect.h}`);
      if (format === 'avif') {
        for (const p of avifProblems(info)) err(key, `${path}: ${p}`);
        if (info.alpha && !alpha) err(key, `${path}: has an alpha plane although alpha:false`);
      } else {
        const prof = profileOf(abs);
        if (prof !== '<nil>' && !/sRGB/i.test(prof)) err(key, `${path}: colour profile "${prof}" (expected sRGB)`);
        if (format === 'png' && info.hasAlpha && !alpha) err(key, `${path}: PNG has an alpha channel although alpha:false`);
      }
      const budget = budgetFor(width, format);
      if (budget && buf.length > budget) warn(key, `${path}: ${kb(buf.length)} over the ${kb(budget)} budget (doc 06 §7.1)`);
      variants.push(v);
    }
    // doc 06 §7.5 check 5: every declared format present
    for (const f of formats) if (!variants.some((v) => v.format === f)) err(key, `no ${f} variant`);

    if (edge) {
      entry.edge = Object.fromEntries(Object.entries(edge).map(([k, v]) => [k, +v.toFixed(k.startsWith('ink') ? 4 : 2)]));
      if (edge.inkTop > 0.005 || edge.inkBottom > 0.005) err(key, `excerpt edge cuts through content: ink ${(edge.inkTop * 100).toFixed(2)}% / ${(edge.inkBottom * 100).toFixed(2)}% (move region.y)`);
      else if (edge.stdTop >= 4 || edge.stdBottom >= 4) console.log(`    note: edge σ ${edge.stdTop.toFixed(1)}/${edge.stdBottom.toFixed(1)} without ink (two-tone blank row, prototype G4)`);
    }
    entry.variants = variants;
    registry[key] = entry;
    console.log(`    ${variants.map((v) => `${v.format} ${v.w}x${v.h} ${kb(v.bytes)}`).join(' · ')}${entry.statusBg ? ` · status ${entry.statusBg}/${entry.statusTone}` : ''}${entry.edge ? ` · edge ink ${entry.edge.inkTop}/${entry.edge.inkBottom} σ ${entry.edge.stdTop}/${entry.edge.stdBottom}` : ''}`);
  } catch (e) {
    err(key || '(no key)', e.message);
  }
}

// ———————————————————————————— icons → public/ (doc 06 §7.4, doc 05 §7.8, R70) ————————————————————————————

// coverage of pixel (px, py) by a rounded square at (x0, y0) with side `size` and corner radius r (4×4 supersampled)
function roundedCover(px, py, x0, y0, size, r) {
  let c = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
    const x = px + (sx + 0.5) / 4 - x0, y = py + (sy + 0.5) / 4 - y0;
    if (x < 0 || y < 0 || x > size || y > size) continue;
    const dx = Math.max(r - x, 0, x - (size - r)), dy = Math.max(r - y, 0, y - (size - r));
    if (dx * dx + dy * dy <= r * r) c++;
  }
  return c / 16;
}
// rounded icon on transparent; ring = [r, g, b, a] draws a 1px outline around it (dark-mode favicon, R70)
function drawRounded(icon, S, radius, ring) {
  const inset = ring ? 1 : 0, inner = S - 2 * inset;
  const out = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const o = (y * S + x) * 4;
    const ci = roundedCover(x, y, inset, inset, inner, inner * radius);
    let r = 0, g = 0, b = 0, a = 0;
    if (ring) {                                          // ring = outer rounded square minus the icon
      const co = roundedCover(x, y, 0, 0, S, S * radius);
      [r, g, b] = ring; a = Math.max(0, co - ci) * ring[3];
    }
    if (ci > 0) {
      const ix = Math.min(inner - 1, Math.max(0, x - inset)), iy = Math.min(inner - 1, Math.max(0, y - inset));
      const io = (iy * inner + ix) * 4;
      const ai = (icon.data[io + 3] / 255) * ci;
      const at = ai + a * (1 - ai);
      if (at > 0) {
        r = (icon.data[io] * ai + r * a * (1 - ai)) / at;
        g = (icon.data[io + 1] * ai + g * a * (1 - ai)) / at;
        b = (icon.data[io + 2] * ai + b * a * (1 - ai)) / at;
      }
      a = at;
    }
    out[o] = Math.round(r); out[o + 1] = Math.round(g); out[o + 2] = Math.round(b); out[o + 3] = Math.round(a * 255);
  }
  return out;
}
// sips writes one image per .ico; node only concatenates the single-image directories into one file (16 + 32)
function mergeIco(parts) {
  const entries = [], images = [];
  for (const p of parts) {
    if (p.readUInt16LE(0) !== 0 || p.readUInt16LE(2) !== 1) throw new Error('sips output is not an ICO');
    for (let i = 0, n = p.readUInt16LE(4); i < n; i++) {
      const e = 6 + i * 16;
      entries.push(Buffer.from(p.subarray(e, e + 16)));
      images.push(p.subarray(p.readUInt32LE(e + 12), p.readUInt32LE(e + 12) + p.readUInt32LE(e + 8)));
    }
  }
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2); head.writeUInt16LE(entries.length, 4);
  let off = 6 + entries.length * 16;
  entries.forEach((e, i) => { e.writeUInt32LE(images[i].length, 8); e.writeUInt32LE(off, 12); off += images[i].length; });
  return Buffer.concat([head, ...entries, ...images]);
}
const icons = manifest.icons;
const iconFiles = [];
if (icons) {
  console.log('  icons');
  try {
    const s = source(icons.src);
    const ringRGBA = icons.ring;
    for (const o of icons.outputs) {
      const abs = join(ROOT, o.file);
      const pngs = [];
      for (const size of o.sizes) {
        let data, alpha;
        if (o.shape === 'square') {                       // full bleed, opaque: iOS / maskable apply their own mask
          const r = tmp(`icon${size}.png`);
          sips('-s', 'format', 'png', '-z', size, size, s.png, '--out', r);
          const img = flatten(decodePNG(readFileSync(r)));
          data = img.data; alpha = false;
        } else if (o.shape === 'rounded') {               // 22.4% corner radius on transparent (doc 05 §7.8)
          const inner = size - (o.ring ? 2 : 0);
          const r = tmp(`icon${inner}.png`);
          sips('-s', 'format', 'png', '-z', inner, inner, s.png, '--out', r);
          data = drawRounded(decodePNG(readFileSync(r)), size, icons.radius, o.ring ? ringRGBA : null); alpha = true;
        } else throw new Error(`${o.file}: unknown shape "${o.shape}"`);
        const f = tmp(`icon-${size}.png`);
        writeFileSync(f, encodePNG(size, size, data, { alpha, level: 1 }));
        pngs.push({ size, file: f });
      }
      mkdirSync(dirname(abs), { recursive: true });
      if (o.file.endsWith('.ico')) {
        const parts = pngs.map(({ size, file }) => { const t = tmp(`icon-${size}.ico`); sips('-s', 'format', 'ico', file, '--out', t); return readFileSync(t); });
        writeFileSync(abs, mergeIco(parts));
        const got = icoEntries(readFileSync(abs)).map((e) => `${e.w}x${e.h}/${e.bits}bit`);
        const want = o.sizes.map((n) => `${n}x${n}/32bit`);
        if (got.join() !== want.join()) err('icons', `${o.file}: entries ${got} (expected ${want})`);
      } else {
        if (o.sizes.length !== 1) throw new Error(`${o.file}: a PNG has exactly one size`);
        const t = tmp('icon-out.png');
        sips('-s', 'format', 'png', pngs[0].file, '--out', t);
        copyFileSync(t, abs);
        const p = pngSize(readFileSync(abs));
        if (p.width !== o.sizes[0] || p.height !== o.sizes[0]) err('icons', `${o.file}: ${p.width}x${p.height}, expected ${o.sizes[0]}`);
        if (o.shape === 'square' && p.hasAlpha) err('icons', `${o.file}: square icons must be opaque (no alpha channel)`);
        if (o.shape === 'rounded' && !p.hasAlpha) err('icons', `${o.file}: rounded icons need an alpha channel`);
      }
      iconFiles.push(o.file);
      console.log(`    ${o.file} ${o.sizes.join('+')}px ${o.shape}${o.ring ? ' + ring' : ''} ${kb(statSync(abs).size)}`);
    }
    // maskable safe zone (doc 05 §7.8: the white T and speed lines must sit inside the central 80% circle)
    const big = icons.outputs.find((o) => o.shape === 'square' && o.sizes[0] >= 192);
    if (big) {
      const img = decodePNG(readFileSync(join(ROOT, big.file)));
      const n = img.width, c = n / 2;
      let rmax = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const o = (y * n + x) * 4, r = img.data[o], g = img.data[o + 1], b = img.data[o + 2];
        if (Math.min(r, g, b) > 200) rmax = Math.max(rmax, Math.hypot(x + 0.5 - c, y + 0.5 - c) / n);
      }
      const msg = `maskable safe zone: light foreground reaches ${(rmax * 100).toFixed(1)}% of the side from the centre (limit 40%)`;
      if (rmax > 0.4) warn('icons', msg); else console.log(`    ${msg} ✓`);
    }
    // site.webmanifest (doc 05 §7.8: name, theme_color, background_color; icons 192/512 "any maskable", doc 06 §7.4)
    const wm = icons.webmanifest;
    for (const ic of wm.content.icons) {
      const f = join(ROOT, 'public', ic.src);
      const [w, h] = ic.sizes.split('x').map(Number);
      const p = existsSync(f) ? pngSize(readFileSync(f)) : null;
      if (!p || p.width !== w || p.height !== h) err('icons', `site.webmanifest icon ${ic.src} ${ic.sizes}: file missing or wrong size`);
    }
    writeFileSync(join(ROOT, wm.file), JSON.stringify(wm.content, null, 2) + '\n');
    iconFiles.push(wm.file);
    console.log(`    ${wm.file}`);
  } catch (e) {
    err('icons', e.message);
  }
}

// ———————————————————————————— registry, orphans, summary ————————————————————————————

// one entry field per line, one variant per line (diff-friendly)
function formatRegistry(reg) {
  const keys = Object.keys(reg);
  const body = keys.map((k) => {
    const e = reg[k];
    const fields = Object.entries(e).map(([f, v]) => (Array.isArray(v) && v.length && typeof v[0] === 'object'
      ? `    ${JSON.stringify(f)}: [\n${v.map((x) => `      ${JSON.stringify(x)}`).join(',\n')}\n    ]`
      : `    ${JSON.stringify(f)}: ${JSON.stringify(v)}`));
    return `  ${JSON.stringify(k)}: {\n${fields.join(',\n')}\n  }`;
  });
  return `{\n${body.join(',\n')}\n}\n`;
}

if (!errors.length) writeFileSync(REGISTRY_FILE, formatRegistry(registry));

// doc 06 §7.5 check 6: files under assets/img that the registry does not know
{
  const registered = new Set(Object.values(registry).flatMap((e) => e.variants.map((v) => v.path)));
  const orphans = walk(OUT).map((f) => relative(ROOT, f).split(sep).join('/'))
    .filter((f) => f !== 'assets/img/images.json' && !f.split('/').some((p) => p.startsWith('.')) && !registered.has(f));
  if (orphans.length && !errors.length) {
    if (args.has('--prune')) {
      for (const f of orphans) rmSync(join(ROOT, f));
      const prune = (d) => { for (const c of readdirSync(d, { withFileTypes: true })) if (c.isDirectory()) prune(join(d, c.name)); if (d !== OUT && !readdirSync(d).length) rmSync(d, { recursive: true }); };
      prune(OUT);
      console.log(`\npruned ${orphans.length} unregistered file(s): ${orphans.join(', ')}`);
    } else {
      for (const f of orphans) warn('orphans', `${f} is not in images.json (run with --prune to delete)`);
    }
  }
}

console.log('\n== totals (assets/img, all variants)');
{
  const sets = {};
  for (const [k, e] of Object.entries(registry)) {
    const set = k.split('/').slice(0, 2).join('/');
    const s = (sets[set] ||= { files: 0, bytes: 0, byFormat: {} });
    for (const v of e.variants) { s.files++; s.bytes += v.bytes; s.byFormat[v.format] = (s.byFormat[v.format] || 0) + v.bytes; }
  }
  let files = 0, bytes = 0;
  for (const [set, s] of Object.entries(sets)) {
    files += s.files; bytes += s.bytes;
    console.log(`  ${set.padEnd(16)} ${String(s.files).padStart(3)} files ${kb(s.bytes).padStart(9)}  (${Object.entries(s.byFormat).map(([f, b]) => `${f} ${kb(b)}`).join(', ')})`);
  }
  console.log(`  ${'all'.padEnd(16)} ${String(files).padStart(3)} files ${kb(bytes).padStart(9)}  + ${iconFiles.length} icon file(s) in public/`);
}

if (!args.has('--keep-tmp')) rmSync(TMP, { recursive: true, force: true });
console.log(`\n${errors.length ? `${errors.length} error(s) — images.json NOT written` : `wrote ${relative(ROOT, REGISTRY_FILE)}`}, ${warnings.length} warning(s), ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (errors.length) { for (const e of errors) console.log(`  ✗ ${e}`); process.exit(1); }
