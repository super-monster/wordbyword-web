#!/usr/bin/env node
// Prototype image pipeline v1.1 (05 §7.1 / §8; R8, R58, R67, R79): crop to the screen WITHOUT the status bar -> sRGB ->
// resample to PNG -> trim to even width/height -> AVIF + JPEG/PNG fallback; record statusBg/statusTone, pins, ring.
// R79: every crop (screen, excerpt, SE window, even trim) is done in node on decoded PNG pixels (png.mjs); sips only
// decodes / converts P3 -> sRGB, resamples and encodes.
// macOS only (uses `sips`, F33). Zero npm deps. Source files are only READ; outputs go to ../assets/ (wiped first).
// Usage: node docs/redesign-2026/prototype/tools/build-images.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { decodePNG, encodePNG, rowStd, inkShare } from './png.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = resolve(HERE, '..');
const OUT = join(PROTO, 'assets');
const WEB = resolve(PROTO, '../../..');                       // wordbyword-web
const RES = resolve(WEB, '../Resources');
const IOS = resolve(WEB, '../WordByWordPrototype');
const SEW = resolve(WEB, '../../SurfEnglish/SurfEnglishWebsite');
const TMP = join(process.env.WBW_IMG_TMP || tmpdir(), 'wbw-proto-img');
const SRGB = '/System/Library/ColorSync/Profiles/sRGB Profile.icc';
const STATUS = 54 / 874;                                       // iOS status bar share of a 402x874pt screen

// Full-screen area (x, y, w, h) inside each source kind (05 §7.1). Status-bar-free crops start STATUS * h lower.
const PRESET = {
  demo:      { x: 122, y: 120, w: 1286, h: 2795 },   // WEB/img/en/*_demo.png, more_definitions.png (1530x3036, framed)
  marketing: { x: 221, y: 819, w: 842,  h: 1830 },   // RES/wbw_*/*.00N.png (1284x2778)
  raw:       { x: 0,   y: 0,   w: 1206, h: 2622 },   // raw iPhone screenshots
};
// 05 §7.1 table: demo 122,293 1286x2622 · marketing 221,932 842x1717 · raw 0,162 1206x2460 (all 402:820)
const noStatus = (p) => { const cut = Math.round(STATUS * p.h); return { x: p.x, y: p.y + cut, w: p.w, h: p.h - cut }; };

// kind: screen (L1/L2 device) | sm (gallery n=4) | md (gallery n<=2) | ex (16:9 excerpt, full-screen ratio coords)
// pins: L2 number pins on the bezel edge (side start|end, y = full-screen ratio); ring: outline around the looked-up word.
const JOBS = [
  // ---- en set (05 §7.2) ----
  { id: 'app/en/swipe',         src: `${WEB}/img/en/feature_swipe_demo.png`,     preset: 'demo', kind: 'screen' },
  { id: 'app/en/lookup',        src: `${WEB}/img/en/feature_doubletap_demo.png`, preset: 'demo', kind: 'screen',
    pins: [{ n: 1, side: 'start', y: 0.403 }, { n: 2, side: 'start', y: 0.747 }, { n: 3, side: 'end', y: 0.83 }],
    ring: { x: 0.385, y: 0.388, w: 0.29, h: 0.032 } },
  { id: 'app/en/tts-ex',        src: `${WEB}/img/en/feature_tts_demo.png`,       preset: 'demo', kind: 'ex', y: 0.652 },
  { id: 'app/en/syntax-ex',     src: `${WEB}/img/en/feature_history_demo.png`,   preset: 'demo', kind: 'ex', y: 0.40 },
  { id: 'app/en/settings',      src: `${WEB}/img/en/feature_customize_demo.png`, preset: 'demo', kind: 'sm' },
  { id: 'app/en/dictionary',    src: `${WEB}/img/en/more_definitions.png`,       preset: 'demo', kind: 'sm' },
  { id: 'app/en/languages',     src: `${WEB}/img/en/language_setting_en.PNG`,    preset: 'raw',  kind: 'sm' },
  { id: 'app/en/language-list', src: `${WEB}/img/en/select_language_en.PNG`,     preset: 'raw',  kind: 'sm' },
  // ---- ja set (05 §7.3) ----
  { id: 'app/ja/swipe',         src: `${RES}/wbw_jp/wbw_jp.001.png`, preset: 'marketing', kind: 'screen' },
  { id: 'app/ja/lookup',        src: `${RES}/wbw_jp/wbw_jp.002.png`, preset: 'marketing', kind: 'screen',
    pins: [{ n: 1, side: 'start', y: 0.372 }, { n: 2, side: 'start', y: 0.733 }, { n: 3, side: 'end', y: 0.83 }],
    ring: { x: 0.025, y: 0.355, w: 0.19, h: 0.035 } },
  { id: 'app/ja/tts-ex',        src: `${RES}/wbw_jp/wbw_jp.003.png`, preset: 'marketing', kind: 'ex', y: 0.661 },   // 05: .658 — top row clips the red bar; scan → .661
  { id: 'app/ja/syntax-ex',     src: `${RES}/wbw_jp/wbw_jp.004.png`, preset: 'marketing', kind: 'ex', y: 0.54 },
  { id: 'app/ja/settings',      src: `${RES}/wbw_jp/wbw_jp.006.png`, preset: 'marketing', kind: 'md' },
  { id: 'app/ja/dictionary',    src: `${RES}/wbw_jp/wbw_jp.007.png`, preset: 'marketing', kind: 'md' },
  // X screenshots are not used any more (R31/R32/R71, 05 §7.2–7.4): the X card is an HTML post sample.
];

const KIND = {
  screen: { avif: [360, 540, 720], jpeg: 540, q: 45 },
  sm:     { avif: [360, 540],      jpeg: 540, q: 45 },
  md:     { avif: [360, 540, 720], jpeg: 540, q: 45 },
  ex:     { avif: [720, 1080],     jpeg: 720, q: 45, h: 0.259 },   // 16:9 of a 402:874 screen
};

const sips = (...args) => execFileSync('sips', args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const profileOf = (f) => (sips('-g', 'profile', f).match(/profile: (.*)/) || [])[1]?.trim() ?? '';
const bytes = (f) => statSync(f).size;
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const manifest = {};

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
for (const d of ['app', 'se', 'brand']) rmSync(join(OUT, d), { recursive: true, force: true });

// Resample to an intermediate PNG first, then trim to EVEN width/height, then encode without resampling.
// Why (R8, K1): sips writes AVIFs whose side exceeds 1024px as a grid of 512px tiles, and Chrome/libavif renders a
// 4:2:0 grid AVIF with an odd output dimension as fully transparent (seen: 720x1565, 540x1173, 1080x587).
function resampleEven(src, width) {
  const tmp = join(TMP, `r-${Math.random().toString(36).slice(2)}.png`);
  const a = ['-s', 'format', 'png'];
  if (width) a.push('--resampleWidth', String(width));
  a.push(src, '--out', tmp);
  sips(...a);
  // R79: the even trim is a crop too, so it is done in node (sips `-c … --cropOffset 0 0` ignores the offset)
  const img = decodePNG(readFileSync(tmp));
  const w = img.width, h = img.height;
  const ew = w - (w % 2), eh = h - (h % 2);
  if (ew !== w || eh !== h) {
    const out = Buffer.alloc(ew * eh * 4);
    for (let r = 0; r < eh; r++) img.data.copy(out, r * ew * 4, r * w * 4, (r * w + ew) * 4);
    writeFileSync(tmp, encodePNG(ew, eh, out));
  }
  return { file: tmp, w: ew, h: eh };
}
function encode(src, out, fmt, q, width) {
  mkdirSync(dirname(out), { recursive: true });
  const r = resampleEven(src, width);
  const a = ['-s', 'format', fmt];
  if (q != null) a.push('-s', 'formatOptions', String(q));
  a.push(r.file, '--out', out);
  sips(...a);
  return r;
}
// crop -> PNG in sRGB (Display P3 sources are converted once here, 05 §7.1).
// The crop itself is done in node, not with `sips -c … --cropOffset`: measured on this Mac, sips silently ignores
// the offset when it is "0 0" (falls back to a centred crop) and returns the uncropped image when the rectangle
// touches the bottom edge (raw preset 0,162 1206x2460 on a 1206x2622 shot) — both without an error.
const decoded = new Map();
function cropSRGB(src, { x, y, w, h }, name) {
  if (!decoded.has(src)) {
    const full = join(TMP, `src-${decoded.size}.png`);
    const a = ['-s', 'format', 'png'];
    if (/P3/i.test(profileOf(src))) a.push('--matchTo', SRGB);
    sips(...a, src, '--out', full);
    decoded.set(src, decodePNG(readFileSync(full)));
  }
  const img = decoded.get(src);
  if (x + w > img.width || y + h > img.height) throw new Error(`crop ${x},${y} ${w}x${h} outside ${img.width}x${img.height}: ${src}`);
  const out = Buffer.alloc(w * h * 4);
  for (let r = 0; r < h; r++) img.data.copy(out, r * w * 4, ((y + r) * img.width + x) * 4, ((y + r) * img.width + x + w) * 4);
  const crop = join(TMP, name + '.png');
  writeFileSync(crop, encodePNG(w, h, out));
  return crop;
}
// status bar colour = median of the crop's first rows (= 55/874 of the screen); tone = text colour on it
function statusOf(png) {
  const img = decodePNG(readFileSync(png));
  const px = [];
  for (let y = 0; y < Math.min(4, img.height); y++) for (let x = Math.round(img.width * 0.2); x < img.width * 0.8; x += 3) {
    const o = (y * img.width + x) * 4; px.push([img.data[o], img.data[o + 1], img.data[o + 2]]);
  }
  const med = [0, 1, 2].map((c) => px.map((p) => p[c]).sort((a, b) => a - b)[px.length >> 1]);
  const lum = (0.2126 * med[0] + 0.7152 * med[1] + 0.0722 * med[2]) / 255;
  return { statusBg: hex(...med), statusTone: lum > 0.5 ? 'dark' : 'light' };
}

for (const job of JOBS) {
  if (!existsSync(job.src)) throw new Error(`missing source: ${job.src}`);
  const full = PRESET[job.preset];
  const k = KIND[job.kind];
  let region;
  if (k.h) {                                        // excerpt: full width, band in full-screen ratio coords (05 §7.1)
    const y = full.y + Math.round(job.y * full.h);
    region = { x: full.x, y, w: full.w, h: Math.min(Math.round(k.h * full.h), full.y + full.h - y) };
  } else region = noStatus(full);                    // whole screen minus the status bar (R67)
  const crop = cropSRGB(job.src, region, job.id.replaceAll('/', '_'));
  const entry = { src: job.src.replace(resolve(WEB, '..') + '/', '../'), kind: job.kind, crop: region, avif: [], jpeg: null };
  if (!k.h) Object.assign(entry, statusOf(crop));
  else {
    const img = decodePNG(readFileSync(crop));
    entry.edge = { stdTop: +rowStd(img, 0, 4).toFixed(2), stdBottom: +rowStd(img, img.height - 4, img.height).toFixed(2),
      inkTop: +inkShare(img, 0, 4).toFixed(4), inkBottom: +inkShare(img, img.height - 4, img.height).toFixed(4) };
  }
  if (job.pins) { entry.pins = job.pins; entry.ring = job.ring; }
  const widths = [...new Set(k.avif.map((w) => Math.min(w, full.w)))];
  for (const w of widths) {
    const out = join(OUT, `${job.id}-${w}.avif`);
    const r = encode(crop, out, 'avif', k.q, w);
    entry.avif.push({ file: `assets/${job.id}-${w}.avif`, w: r.w, h: r.h, bytes: bytes(out) });
  }
  const jw = Math.min(k.jpeg, full.w);
  const jout = join(OUT, `${job.id}-${jw}.jpg`);
  const rj = encode(crop, jout, 'jpeg', 60, jw);
  entry.jpeg = { file: `assets/${job.id}-${jw}.jpg`, w: rj.w, h: rj.h, bytes: bytes(jout) };
  manifest[job.id] = entry;
  console.log(job.id.padEnd(20), entry.avif.map((a) => `${a.w}x${a.h} ${(a.bytes / 1024).toFixed(1)}K`).join(' | '), `| jpg ${(entry.jpeg.bytes / 1024).toFixed(1)}K`,
    entry.statusBg ? `| status ${entry.statusBg}/${entry.statusTone}` : `| edges σ ${entry.edge.stdTop}/${entry.edge.stdBottom} ink ${entry.edge.inkTop}/${entry.edge.inkBottom}`);
}

// ---- SurfEnglish window (05 §7.7, R44): games-home.jpg x0 y112 720x792 -> 400x440, AVIF q50 + JPEG q60 ----
{
  const src = `${SEW}/public/images/screenshots/games-home.jpg`;
  const crop = cropSRGB(src, { x: 0, y: 112, w: 720, h: 792 }, 'se-games');
  const a = join(OUT, 'se/se-games-400.avif'), j = join(OUT, 'se/se-games-400.jpg');
  const ra = encode(crop, a, 'avif', 50, 400);
  const rj = encode(crop, j, 'jpeg', 60, 400);
  manifest['se/games'] = { src: src.replace(resolve(WEB, '../..') + '/', '../../'), crop: { x: 0, y: 112, w: 720, h: 792 },
    avif: [{ file: 'assets/se/se-games-400.avif', w: ra.w, h: ra.h, bytes: bytes(a) }], jpeg: { file: 'assets/se/se-games-400.jpg', w: rj.w, h: rj.h, bytes: bytes(j) } };
  console.log('se/games'.padEnd(20), `avif ${ra.w}x${ra.h} ${(bytes(a) / 1024).toFixed(1)}K | jpg ${(bytes(j) / 1024).toFixed(1)}K`);
}

// ---- Icons (05 §7.8, 04 §6.2): PNG only; CSS adds the 22.4% rounded mask on the page ----
const WBW_ICON = `${IOS}/WordByWordPrototype/Assets.xcassets/AppIcon.appiconset/AppIcon~ios-marketing.png`;
const ICONS = [
  { id: 'brand/wbw-icon-64',  src: WBW_ICON, size: 64 },    // header 28px, footer family mark 32px
  { id: 'brand/wbw-icon-160', src: WBW_ICON, size: 160 },   // final CTA 80px @2x (R43)
  { id: 'se/se-icon-64',      src: `${SEW}/public/icons/appicon-1024.png`, size: 64 },   // SE card + footer, 32px
];
for (const ic of ICONS) {
  const out = join(OUT, `${ic.id}.png`);
  mkdirSync(dirname(out), { recursive: true });
  sips('-s', 'format', 'png', '-z', String(ic.size), String(ic.size), ic.src, '--out', out);
  manifest[ic.id] = { png: { file: `assets/${ic.id}.png`, w: ic.size, h: ic.size, bytes: bytes(out) } };
  console.log(ic.id.padEnd(20), `${(bytes(out) / 1024).toFixed(1)}K`);
}

// ---- favicons (05 §7.8, R70): 32px, rounded 22.4% on transparent; dark version adds a 1px rgb(242 236 230 / .40) ring ----
// Drawn here with 4x4 supersampled coverage (no Chrome needed); production may render the same spec with Chrome (R34).
function roundedCover(px, py, x0, y0, size, r) {    // coverage of pixel (px,py) by a rounded square
  let c = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
    const x = px + (sx + 0.5) / 4 - x0, y = py + (sy + 0.5) / 4 - y0;
    if (x < 0 || y < 0 || x > size || y > size) continue;
    const dx = Math.max(r - x, 0, x - (size - r)), dy = Math.max(r - y, 0, y - (size - r));
    if (dx * dx + dy * dy <= r * r) c++;
  }
  return c / 16;
}
function favicon(out, ring) {
  const S = 32, inset = ring ? 1 : 0, inner = S - 2 * inset;
  const tmp = join(TMP, `fav-${inner}.png`);
  sips('-s', 'format', 'png', '-z', String(inner), String(inner), WBW_ICON, '--out', tmp);
  const icon = decodePNG(readFileSync(tmp));
  const rgba = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const o = (y * S + x) * 4;
    const ci = roundedCover(x, y, inset, inset, inner, inner * 0.224);
    let r = 0, g = 0, b = 0, a = 0;
    if (ring) {                                       // ring = outer rounded square minus inner icon
      const co = roundedCover(x, y, 0, 0, S, S * 0.224);
      const ar = Math.max(0, co - ci) * 0.40;
      r = 242; g = 236; b = 230; a = ar;
    }
    if (ci > 0) {
      const ix = Math.min(inner - 1, Math.max(0, x - inset)), iy = Math.min(inner - 1, Math.max(0, y - inset));
      const io = (iy * inner + ix) * 4;
      const ai = (icon.data[io + 3] / 255) * ci;
      const at = ai + a * (1 - ai);
      if (at > 0) { r = (icon.data[io] * ai + r * a * (1 - ai)) / at; g = (icon.data[io + 1] * ai + g * a * (1 - ai)) / at; b = (icon.data[io + 2] * ai + b * a * (1 - ai)) / at; }
      a = at;
    }
    rgba[o] = Math.round(r); rgba[o + 1] = Math.round(g); rgba[o + 2] = Math.round(b); rgba[o + 3] = Math.round(a * 255);
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, encodePNG(S, S, rgba));
}
for (const [id, ring] of [['brand/favicon-32', false], ['brand/favicon-32-dark', true]]) {
  const out = join(OUT, `${id}.png`);
  favicon(out, ring);
  manifest[id] = { png: { file: `assets/${id}.png`, w: 32, h: 32, bytes: bytes(out) } };
  console.log(id.padEnd(20), `${(bytes(out) / 1024).toFixed(1)}K`);
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
rmSync(TMP, { recursive: true, force: true });
console.log('wrote', join(OUT, 'manifest.json'));
