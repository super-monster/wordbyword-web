#!/usr/bin/env node
// Prototype checker v1.1 + v1.3 fixes. Zero deps (Node 24; sips + Chrome on macOS for the image decode layers).
//  1. pages: every local reference exists, every <img> has width/height/alt, in-page anchors resolve, nothing loads
//     from another host, one <h1>, 40 crawlable language links, data-script on <html> (R60), the noindex meta is
//     marked prototype-only (R49), marker rule (R65 / A18), SE card has no badge and pricing has one (R43), every
//     device draws its own 9:41 status bar (R67), no loupe / overlay label / price cards (VIS-08/09/10).
//  2. CSS: physical properties only inside the @physical-ok block; A5 patterns (#007AFF, backdrop-filter, .reveal,
//     shadow on .device).
//  3. images (R8, R79, ENG-05, A19): every AVIF — GATE = structure (grid + odd size) + Chrome decode + alpha sample
//     (R79; --no-chrome skips the Chrome layer and says so); sips decode + alpha is auxiliary only (warning, R79:
//     ImageIO does not reproduce Chrome's "white board" bug); every 16:9 excerpt — first/last 4 rows must be blank
//     (ink share; σ reported).
//  4. sizes + estimated image bytes on the AVIF path at DPR 2 (05 §8.3: page <= 1.2 MB, first screen <= 150 KB).
// Usage: node docs/redesign-2026/prototype/tools/check.mjs [--no-chrome]
import { readFileSync, statSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avifStructure, sipsAlpha, chromeAlpha } from './avif-check.mjs';
import { decodePNG, rowStd, inkShare } from './png.mjs';

const PROTO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['index.html', 'ja.html'];
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].slice(1).map((m) => [m[1], m[2] ?? '']));
let errors = 0, warnings = 0;
const fail = (m) => { errors++; console.log('  ✗', m); };
const warn = (m) => { warnings++; console.log('  ! ', m); };
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));

// pick the srcset candidate a browser would use for a given CSS width at DPR 2
function pick(srcset, cssWidth) {
  const c = srcset.split(',').map((s) => s.trim().split(/\s+/)).map(([u, d]) => ({ u, w: d ? parseInt(d, 10) : Infinity }));
  if (c.length === 1) return c[0].u;
  return (c.find((x) => x.w >= cssWidth * 2) || c[c.length - 1]).u;
}
function sizeFor(sizes, vw) {
  for (const part of sizes.split(',').map((s) => s.trim())) {
    const m = part.match(/^\(min-width:\s*(\d+)px\)\s+(.+)$/);
    const expr = m ? (vw >= +m[1] ? m[2] : null) : part;
    if (expr) return evalLen(expr, vw);
  }
  return vw;
}
function evalLen(e, vw) {
  e = e.trim();
  let m;
  if ((m = e.match(/^(\d+(?:\.\d+)?)px$/))) return +m[1];
  if ((m = e.match(/^(\d+(?:\.\d+)?)vw$/))) return (vw * m[1]) / 100;
  if ((m = e.match(/^min\((.+),\s*(.+)\)$/))) return Math.min(evalLen(m[1], vw), evalLen(m[2], vw));
  if ((m = e.match(/^calc\(100vw\s*-\s*(\d+)px\)$/))) return vw - +m[1];
  return vw;
}

// ---------------- 1. pages ----------------
const summary = {};
for (const page of PAGES) {
  console.log(`\n== ${page}`);
  const html = readFileSync(join(PROTO, page), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [];
  for (const m of html.matchAll(/<(img|source|link|script|a)\b[^>]*>/g)) {
    const a = attrs(m[0]);
    const tag = m[1];
    if (tag === 'img') {
      refs.push(a.src);
      if (!a.width || !a.height) fail(`<img> without width/height: ${a.src}`);
      if (a.alt === undefined) fail(`<img> without alt: ${a.src}`);
    }
    if (tag === 'source') a.srcset.split(',').forEach((s) => refs.push(s.trim().split(/\s+/)[0]));
    if (tag === 'link' && a.href && /stylesheet|icon|preload/.test(a.rel)) refs.push(a.href);
    if (tag === 'script' && a.src) refs.push(a.src);
    if (tag === 'a' && a.href?.startsWith('#') && a.href.length > 1 && !ids.has(a.href.slice(1))) fail(`broken in-page anchor ${a.href}`);
  }
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail(`expected exactly 1 <h1>, found ${h1}`);
  for (const m of html.matchAll(/aria-labelledby="([^"]+)"/g)) for (const id of m[1].split(/\s+/)) if (!ids.has(id)) fail(`aria-labelledby target missing: #${id}`);
  const langLinks = [...html.matchAll(/<a [^>]*data-ga-event="language_switch"[^>]*>/g)];
  if (langLinks.length !== 40) fail(`expected 40 language links (header + footer), found ${langLinks.length}`);
  for (const l of langLinks) { const a = attrs(l[0]); if (!a.hreflang || !a.lang) fail(`language link without hreflang/lang: ${l[0]}`); }
  if (!/<html [^>]*data-script="(latn|cyrl|cjk|thai|deva|arab)"/.test(html)) fail('<html> without data-script (R60)');
  // R49 / SEO-06: the only noindex is the prototype guard, explicitly marked so nobody ports it into a template
  for (const m of html.matchAll(/<meta name="robots"[^>]*>/g)) if (/noindex/.test(m[0]) && !/data-prototype-only/.test(m[0])) fail(`unmarked noindex meta: ${m[0]}`);
  // R65 / A18: one marker phrase, inside the h1; never <mark>
  const kws = (html.match(/class="kw"/g) || []).length;
  const h1Html = (html.match(/<h1[\s\S]*?<\/h1>/) || [''])[0];
  if (kws > 1 || (kws === 1 && !h1Html.includes('class="kw"'))) fail(`marker phrases: ${kws} (max 1, inside h1)`);
  if (/<mark\b/.test(html)) fail('<mark> in output (05 §5.2.7 uses <span class="kw">)');
  // R43: WBW badge in hero, pricing and final CTA; no badge inside the SE card
  const se = (html.match(/<aside class="sibling"[\s\S]*?<\/aside>/) || [''])[0];
  if (/class="asb/.test(se)) fail('App Store badge inside #surfenglish (R43: text links only)');
  for (const sec of ['hero', 'pricing', 'cta']) {
    const s = (html.match(new RegExp(`<section id="${sec}"[\\s\\S]*?</section>`)) || [''])[0];
    if (!/class="asb"[^>]*href|href="[^"]*ct=wbw-/.test(s) || !s.includes('class="asb"')) fail(`#${sec} without the WBW App Store badge`);
  }
  if (!/<h2 id="se-h"[^>]*>SurfEnglish/.test(se)) fail('SE H2 must start with "SurfEnglish" (R40)');
  // R76: no link to SurfEnglish uses the bare domain as anchor text; R81: "Chi Jinlong" never in visible text
  for (const m of html.matchAll(/<a [^>]*href="https:\/\/surfenglish\.app[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^(https?:\/\/)?surfenglish\.app\/?$/i.test(text)) fail(`bare-domain anchor to SurfEnglish (R76): ${text}`);
  }
  if (/Chi Jinlong/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '))) fail('"Chi Jinlong" in visible text (R81)');
  if (/ct=wbw-[a-z]+-(en|ja)\b|ct=web-/.test(html)) fail('App Store ct carries a locale (R3/R55: by placement only)');
  // R67: every device draws a status bar; screenshots are status-bar-free 402:820 crops
  const devices = (html.match(/class="device device--/g) || []).length, bars = (html.match(/class="ios-status"/g) || []).length;
  if (devices !== bars) fail(`${devices} devices but ${bars} CSS status bars`);
  for (const pat of [/shot-label/, /loupe/, /class="plan\b/, /class="wb-ghost/, /se-tip/, /feed-chunks|feed-window|app\/(en|ja)\/x-ex/]) if (pat.test(html)) fail(`retired v1.0 element in output: ${pat}`);
  console.log(`  1 h1 · ${langLinks.length} language links · ${ids.size} ids · ${devices} devices with CSS status bar · ${kws} marker phrase`);
  let n = 0;
  for (const r of refs) {
    if (/^https?:|^\/\//.test(r)) { fail(`external resource (not allowed): ${r}`); continue; }
    n++;
    if (!existsSync(join(PROTO, r))) fail(`missing file: ${r}`);
  }
  console.log(`  ${n} local resource references checked`);

  // image bytes on the AVIF path at DPR 2; < 900px the SE window is display:none (lazy => not fetched)
  for (const vw of [390, 1280]) {
    let total = 0, aboveFold = 0, jpg = 0;
    const pics = [...html.matchAll(/<picture[^>]*>([\s\S]*?)<\/picture>/g)];
    for (const p of pics) {
      if (vw < 900 && p[1].includes('se-games')) continue;
      const src = attrs(p[1].match(/<source[^>]*>/)[0]);
      const css = src.sizes ? sizeFor(src.sizes, vw) : 200;
      total += statSync(join(PROTO, pick(src.srcset, css))).size;
      jpg += statSync(join(PROTO, attrs(p[1].match(/<img[^>]*>/)[0]).src)).size;
    }
    const pngs = [...new Set([...html.matchAll(/<img src="(assets\/[^"]+\.png)"/g)].map((m) => m[1]))];
    for (const f of pngs) { const s = statSync(join(PROTO, f)).size; total += s; jpg += s; if (f.includes('wbw-icon-64')) aboveFold += s; }
    const fav = statSync(join(PROTO, 'assets/brand/favicon-32.png')).size;
    total += fav; aboveFold += fav;
    summary[`${page} @${vw}`] = { avifPath: total, jpegPath: jpg, firstScreen: aboveFold };
  }
}

// ---------------- 2. CSS ----------------
{
  console.log('\n== style.css');
  const raw = readFileSync(join(PROTO, 'style.css'), 'utf8');
  const a = raw.indexOf('@physical-ok:start'), b = raw.indexOf('@physical-ok:end');
  if (a < 0 || b < a) fail('@physical-ok markers missing');
  const outside = (raw.slice(0, a) + raw.slice(b)).replace(/\/\*[\s\S]*?\*\//g, '');
  outside.split('\n').filter((l) => /(^|[\s;{])(margin|padding|border)-(left|right)\b|(^|[\s;{])(left|right)\s*:|text-align:\s*(left|right)|float:\s*(left|right)/.test(l))
    .forEach((l) => fail(`physical property outside the App replica: ${l.trim().slice(0, 90)}`));
  for (const pat of [/#007aff/i, /backdrop-filter/, /\.reveal\b/, /\bmark\.kw\b/]) outside.split('\n').filter((l) => pat.test(l)).forEach((l) => fail(`05 A5 pattern ${pat}: ${l.trim().slice(0, 80)}`));
  if (/\.device\s*\{[^}]*box-shadow/.test(raw.replace(/\/\*[\s\S]*?\*\//g, ''))) fail('.device has a box-shadow (VIS-20)');
  console.log('  physical-property / A5 scan done');
}

// ---------------- 3. images ----------------
{
  console.log('\n== images (R8 / R79 / A19)');
  const avifs = walk(join(PROTO, 'assets')).filter((f) => f.endsWith('.avif')).sort();
  let grid = 0, sipsWorst = 0;
  for (const f of avifs) {
    const s = avifStructure(readFileSync(f));
    if (s.grid) grid++;
    if (!s.ok) fail(`AVIF structure: ${f.slice(PROTO.length + 1)} ${s.width}x${s.height}${s.grid ? ' grid' : ''} — odd size in a tiled AVIF renders transparent in Chrome`);
    const d = sipsAlpha(f);   // auxiliary only (R79): a sips failure is a warning, never the gate
    if (!d.ok) warn(`sips decode (auxiliary): ${f.slice(PROTO.length + 1)} ${(d.transparent * 100).toFixed(2)}% transparent`);
    sipsWorst = Math.max(sipsWorst, d.transparent);
  }
  console.log(`  gate 1/2 structure: ${avifs.length} AVIF (${grid} tiled grids, all even-sized) · auxiliary sips decode: max transparent ${(sipsWorst * 100).toFixed(2)}%`);
  if (process.argv.includes('--no-chrome')) warn('--no-chrome: AVIF gate 2/2 (Chrome decode, R79) skipped — run without the flag before shipping images');
  else {
    const m = await chromeAlpha(avifs, PROTO);
    if (!m) warn('Chrome not found: AVIF gate 2/2 (Chrome decode, R79) skipped');
    else {
      let worst = 0;
      for (const [f, v] of m) { if (!v.ok) fail(`Chrome decode: ${f.slice(PROTO.length + 1)} ${v.error || `${(v.transparent * 100).toFixed(2)}% transparent`}`); else worst = Math.max(worst, v.transparent); }
      console.log(`  gate 2/2 Chrome decode + alpha: ${m.size} AVIF, max transparent share ${(worst * 100).toFixed(2)}%`);
    }
  }
  // excerpt edges must fall on blank rows (05 §7.1, VIS-10): ink share fails; luminance σ >= 4 is reported only,
  // because a blank row that crosses a light-grey card on white measures σ ≈ 5–6 without any text in it.
  const dir = mkdtempSync(join(tmpdir(), 'wbw-ex-'));
  for (const f of avifs.filter((x) => /-ex-\d+\.avif$/.test(x))) {
    const out = join(dir, 'e.png');
    execFileSync('sips', ['-s', 'format', 'png', f, '--out', out], { stdio: 'ignore' });
    const img = decodePNG(readFileSync(out));
    const e = { st: rowStd(img, 0, 4), sb: rowStd(img, img.height - 4, img.height), it: inkShare(img, 0, 4), ib: inkShare(img, img.height - 4, img.height) };
    const name = f.slice(PROTO.length + 1);
    if (e.it > 0.005 || e.ib > 0.005) fail(`excerpt edge cuts through content: ${name} ink ${(e.it * 100).toFixed(1)}% / ${(e.ib * 100).toFixed(1)}%`);
    else if (e.st >= 4 || e.sb >= 4) warn(`excerpt edge σ ${e.st.toFixed(1)}/${e.sb.toFixed(1)} (no ink — two-tone blank row): ${name}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log('  excerpt edges checked');
}

// ---------------- 4. sizes ----------------
console.log('\n== sizes (raw / gzip)');
for (const f of [...PAGES, 'style.css', 'demo.js']) {
  const b = readFileSync(join(PROTO, f));
  console.log(`  ${f.padEnd(12)} ${kb(b.length).padStart(9)} / ${kb(gzipSync(b).length).padStart(8)}`);
}
{
  const css = readFileSync(join(PROTO, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1');
  console.log(`  style.css minified (comments + whitespace stripped): ${kb(Buffer.byteLength(css))} / gzip ${kb(gzipSync(css).length)}`);
}
const assets = walk(join(PROTO, 'assets')).filter((f) => !f.endsWith('manifest.json'));
const byExt = {};
for (const f of assets) { const e = extname(f).slice(1); byExt[e] = (byExt[e] || 0) + statSync(f).size; }
console.log(`  assets/ (all variants, both locales): ${assets.length} files, ${kb(Object.values(byExt).reduce((x, y) => x + y, 0))} — ${Object.entries(byExt).map(([e, s]) => `${e} ${kb(s)}`).join(', ')}`);

console.log('\n== budget (05 §8.3: page images <= 1.2 MB, first screen <= 150 KB; DPR 2, AVIF path)');
for (const [k, v] of Object.entries(summary)) {
  const ok = v.avifPath <= 1.2 * 1024 * 1024 && v.firstScreen <= 150 * 1024;
  if (!ok) errors++;
  console.log(`  ${ok ? '✓' : '✗'} ${k.padEnd(18)} AVIF ${kb(v.avifPath)} · JPEG fallback ${kb(v.jpegPath)} · first-screen bitmaps ${kb(v.firstScreen)} (hero sample is HTML)`);
}
console.log(errors ? `\n${errors} problem(s), ${warnings} warning(s)` : `\nall checks passed (${warnings} warning(s))`);
process.exit(errors ? 1 : 0);
