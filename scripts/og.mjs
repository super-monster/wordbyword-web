#!/usr/bin/env node
// OG images — doc 06 §7.4, doc 05 §7.8 (R9, R34, R59, R79; ENG-12). For every published page × locale of OG_PAGES:
//   src/templates/og.mjs → HTML ─▶ local Chrome headless screenshot (1200×630, DPR 1, R34) ─▶ sips JPEG q82
//   ─▶ assets/og/<page>-<locale, lower-case>.jpg, then assets/og/og.json — the D-23 contract of validate-dist.mjs:
//   { template: <h12 of src/templates/og.mjs>, images: { "<page>-<locale>": { file, width, height, sha256, inputs } } }
//   with inputs = { ...ogInputs(page, locale, copy), template } and sha256 = ogInputHash(inputs).
// build.mjs fingerprints the JPEGs to /assets/og/<page>-<locale>.<h8>.jpg for og:image and the sitemap (R9).
//
// Chrome also dumps the DOM: the card measures itself in the page (headline / sub-line fit, text boxes) and this script
// asserts the 05 §7.8 safe zone (x 72–700, y 60–570, mirrored for rtl), no text over the panel, ≤ 1 .kw phrase (R65),
// 1200×630 (else a node crop, never `sips -c`, R79) and ≤ 200 KB (A11; the quality steps down from 82 if needed).
// A card that fails is not registered (og.json keeps the last good entry, so D-23 keeps failing) and the intermediates
// stay in $TMPDIR. og.json carries no bytes or dates: a re-run without copy / template changes leaves it identical.
//
// macOS + Chrome only; the outputs are committed. Env: CHROME_BIN overrides the Chrome executable.
// Usage: node scripts/og.mjs [--only <page>-<locale>] [--keep-tmp]
//   --only KEY   re-render one image; the other og.json entries are kept as they are
//   --keep-tmp   keep the HTML / PNG intermediates in $TMPDIR/wbw-og-* for inspection
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadConfig, loadStrings, expandRoutes } from '../src/lib/context.mjs';
import { entryVariants, registryEntries, resolveRegistryPath } from '../src/lib/image-registry.mjs';
import { OG_PAGES, jpegSize, ogInputHash, ogKey, readOgRegistry } from '../src/lib/validate-dist.mjs';
import { OG_CARD, ogCard, ogCopy, ogFill, ogSiteCss } from '../src/templates/og.mjs';
import { crop, decodePNG, encodePNG, pngSize } from './lib/png.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = join(ROOT, 'assets/og');
const TEMPLATE = join(ROOT, 'src/templates/og.mjs');
const MAX_BYTES = 200 * 1024;                       // doc 05 A11: each OG ≤ 200 KB
const QUALITY = [82, 78, 74, 70, 66, 62];           // q82 (05 §7.8), stepped down only when over MAX_BYTES
const { w: W, h: H, safe: SAFE } = OG_CARD;
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1); };
const ONLY = opt('--only');
const KEEP = args.includes('--keep-tmp');
const t0 = Date.now();

const die = (msg) => { console.error(`og.mjs: ${msg}`); process.exit(1); };
if (process.platform !== 'darwin') die('needs macOS (sips) and the local Chrome (R34). The outputs are committed; the build only checks them (D-23).');
if (!existsSync(CHROME)) die(`Chrome not found at ${CHROME} (set CHROME_BIN)`);

// ———————————————————————————— inputs ————————————————————————————

const cfg = loadConfig(ROOT);
const { strings } = loadStrings(cfg);
const { SITE, product } = cfg;
const template = createHash('sha256').update(readFileSync(TEMPLATE)).digest('hex').slice(0, 12);   // = checkOg's tplHash

const regFile = join(ROOT, 'assets/img/images.json');
if (!existsSync(regFile)) die('assets/img/images.json missing — run `npm run images` first');
const registry = new Map(registryEntries(JSON.parse(readFileSync(regFile, 'utf8'))));
const siteCss = ogSiteCss(Object.fromEntries(['tokens', 'base', 'demo'].map((n) => [n, readFileSync(join(ROOT, `src/css/${n}.css`), 'utf8')])));

// Registered variants of a key that exist on disk, widest first, as file:// URLs (Chrome decodes the AVIFs; R8/R79
// made sure they render). The device gets the 720w screen (05 §7.8 "lookup-720"), the icon the 160 PNG.
function variants(key) {
  const entry = registry.get(key);
  if (!entry) die(`${key}: not in assets/img/images.json (npm run images)`);
  const list = entryVariants(entry)
    .map((v) => ({ ...v, file: join(ROOT, resolveRegistryPath(ROOT, v.path)) }))
    .filter((v) => existsSync(v.file))
    .map((v) => ({ ...v, url: pathToFileURL(v.file).href }))
    .sort((a, b) => b.w - a.w);
  if (!list.length) die(`${key}: no variant file on disk (npm run images)`);
  return { entry, list };
}
function shotFor(key) {
  const { entry, list } = variants(key);
  const avif = list.find((v) => v.format === 'avif');
  const flat = list.find((v) => v.format !== 'avif') ?? avif;
  if (key.startsWith('shot/')) {
    return { kind: 'device', key, avif: avif ? [{ url: avif.url, w: avif.w, h: avif.h }] : [], fallback: { url: flat.url, w: flat.w, h: flat.h }, meta: entry };
  }
  const best = avif ?? flat;
  return { kind: 'window', key, src: best.url, w: best.w, h: best.h };
}
const icon = { src: variants('brand/common/icon').list.find((v) => v.format === 'png')?.url ?? die('brand/common/icon has no PNG variant') };

// One card per OG page × published locale, in route order (new locales are picked up from LOCALES / src/locales).
const targets = [];
for (const r of expandRoutes(cfg)) {
  const key = ogKey(r.page.id, r.locale.code);
  if (OG_PAGES.includes(r.page.id) && !targets.some((x) => x.key === key)) targets.push({ key, page: r.page.id, locale: r.locale });
}
if (ONLY && !targets.some((x) => x.key === ONLY)) die(`--only ${ONLY}: not a published OG page (${targets.map((x) => x.key).join(', ')})`);

// ———————————————————————————— render ————————————————————————————

const TMP = mkdtempSync(join(tmpdir(), 'wbw-og-'));
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function shoot(key, html) {
  const htmlFile = join(TMP, `${key}.html`);
  const png = join(TMP, `${key}.png`);
  writeFileSync(htmlFile, html);
  // The R34 command line plus sRGB output and no network; --dump-dom returns the fit report. No --user-data-dir:
  // headless Chrome already runs on a throwaway profile, and with an explicit one Chrome 154 never exits.
  const r = spawnSync(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${W},${H}`,
    `--screenshot=${png}`, '--dump-dom', '--force-color-profile=srgb', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking', '--disable-component-update',
    pathToFileURL(htmlFile).href], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000 });
  if (r.error) die(`${key}: Chrome failed (${r.error.message})`);
  if (!existsSync(png)) die(`${key}: Chrome wrote no screenshot\n${String(r.stderr).slice(-600)}`);
  const m = String(r.stdout).match(/<html[^>]*\sdata-og="([^"]*)"/);
  if (!m) die(`${key}: the card did not report its layout (no data-og in the dumped DOM)`);
  return { png, report: JSON.parse(unescape(m[1])) };
}

// 05 §7.8 layout assertions on the in-page report.
function layoutProblems(report, locale, hasKw) {
  const out = [];
  const rtl = locale.dir === 'rtl';
  const x0 = rtl ? W - SAFE.x1 : SAFE.x0, x1 = rtl ? W - SAFE.x0 : SAFE.x1;
  if (!report.fit) out.push('the copy does not fit the card even at the smallest headline / sub-line size');
  for (const t of report.texts) {
    if (t.x === undefined) { out.push(`${t.sel} missing`); continue; }
    if (t.x < x0 || t.r > x1 || t.y < SAFE.y0 || t.b > SAFE.y1) out.push(`${t.sel} [${t.x},${t.y} → ${t.r},${t.b}] leaves the safe zone x ${x0}–${x1}, y ${SAFE.y0}–${SAFE.y1}`);
    const p = report.panel;
    if (p && t.x < p.r && t.r > p.x && t.y < p.b && t.b > p.y) out.push(`${t.sel} overlaps the mosaic panel`);
  }
  if (report.hLines > 3) out.push(`headline wraps to ${report.hLines} lines`);
  if (report.kw !== (hasKw ? 1 : 0)) out.push(`${report.kw} highlighter phrase(s), expected ${hasKw ? 1 : 0} (R65)`);
  return out;
}

// Exactly W×H: Chrome's --window-size is the viewport today; if a version ever returns more, crop in node (R79).
function exactSize(key, png) {
  const buf = readFileSync(png);
  const { width, height } = pngSize(buf);
  if (width === W && height === H) return null;
  if (width < W || height < H) die(`${key}: Chrome returned ${width}×${height}, smaller than ${W}×${H}`);
  const img = crop(decodePNG(buf), { x: 0, y: 0, w: W, h: H }, key);
  writeFileSync(png, encodePNG(W, H, img.data, { alpha: false, level: 1 }));
  return `cropped ${width}×${height} → ${W}×${H}`;
}

function jpeg(key, png) {
  const out = join(TMP, `${key}.jpg`);
  for (const q of QUALITY) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(q), png, '--out', out], { stdio: ['ignore', 'pipe', 'pipe'] });
    const bytes = statSync(out).size;
    if (bytes <= MAX_BYTES) return { file: out, q, bytes };
  }
  die(`${key}: still over ${MAX_BYTES / 1024} KB at q${QUALITY[QUALITY.length - 1]}`);
}

const previous = (() => { try { return readOgRegistry(ROOT); } catch { return null; } })();
const images = {};
const notes = [];
let failed = 0;
mkdirSync(OUT, { recursive: true });
console.log(`OG template ${template} · ${ONLY ? `--only ${ONLY}` : `${targets.length} images`} → assets/og/`);

for (const { key, page, locale } of targets) {
  if (ONLY && key !== ONLY) continue;
  const t = strings[locale.code];
  const copy = ogCopy(page, locale, t, { f: ogFill({ product, SITE, year: new Date().getUTCFullYear() }, locale, t), SITE });
  const html = ogCard({ locale, copy, icon, shot: shotFor(copy.inputs.shot), siteCss });
  const { png, report } = shoot(key, html);
  const problems = layoutProblems(report, locale, /\[\[.+?\]\]/.test(copy.inputs.headline));
  const cropped = exactSize(key, png);
  const out = jpeg(key, png);
  const size = jpegSize(readFileSync(out.file));
  if (!size || size.w !== W || size.h !== H) problems.push(`JPEG is ${size ? `${size.w}×${size.h}` : 'unreadable'}, expected ${W}×${H}`);
  const spec = report.hs === 64 && report.hLines <= 2 ? '' : '  (05 §7.8: 64 px, ≤ 2 lines)';
  console.log(`  ${problems.length ? '✗' : '✓'} ${key.padEnd(26)} headline ${report.hs}px × ${report.hLines}  sub ${report.ss}px × ${report.sLines}  q${out.q} ${(out.bytes / 1024).toFixed(1)} KB${spec}`);
  if (problems.length) {
    for (const p of problems) console.log(`      ✗ ${p}`);
    if (previous?.images?.[key]) images[key] = previous.images[key];
    failed++;
    continue;
  }
  // Keys keep the locale code (ogKey: "home-zh-Hans"); file names are lower-case for D-16 and the R9 URL
  // /assets/og/home-<locale>.<h8>.jpg. Unlink first: on a case-insensitive disk a copy would keep an old "zh-Hans" name.
  const rel = `assets/og/${key.toLowerCase()}.jpg`;
  rmSync(join(ROOT, rel), { force: true });
  copyFileSync(out.file, join(ROOT, rel));
  const inputs = { ...copy.inputs, template };
  images[key] = { file: rel, width: W, height: H, sha256: ogInputHash(inputs), inputs };
  if (out.q !== QUALITY[0]) notes.push(`${key}: over ${MAX_BYTES / 1024} KB at q${QUALITY[0]}, written at q${out.q}`);
  if (cropped) notes.push(`${key}: ${cropped}`);
}

// og.json: route order, then any key a partial run kept from the previous file; no bytes / dates (deterministic).
const order = targets.map((x) => x.key);
const merged = ONLY ? { ...(previous?.images ?? {}), ...images } : images;
const sorted = Object.fromEntries(Object.keys(merged)
  .sort((a, b) => (order.indexOf(a) < 0 ? 1e9 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 1e9 : order.indexOf(b)) || a.localeCompare(b))
  .map((k) => [k, merged[k]]));
writeFileSync(join(OUT, 'og.json'), JSON.stringify({ template, images: sorted }, null, 2) + '\n');

const stale = Object.entries(sorted).filter(([, e]) => e.inputs?.template !== template).map(([k]) => k);
const orphans = readdirSync(OUT).filter((f) => f.endsWith('.jpg') && !Object.values(sorted).some((e) => e.file === `assets/og/${f}`));
for (const n of notes) console.log(`  ! ${n}`);
if (stale.length) console.log(`  ! rendered with an older template (D-23 will fail until they are re-rendered): ${stale.join(', ')}`);
if (orphans.length) console.log(`  ! not in og.json (delete them): ${orphans.join(', ')}`);
if (KEEP || failed) console.log(`  intermediates kept in ${TMP}`); else rmSync(TMP, { recursive: true, force: true });
const done = ONLY ? 1 - failed : targets.length - failed;
console.log(`${failed ? '✗' : '✓'} assets/og/og.json — ${done} rendered, ${failed} not registered (layout problems) in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(failed ? 1 : 0);
