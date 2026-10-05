// OG card source (doc 05 §7.8, doc 06 §7.4; R9, R34, R59, R65, R67): one standalone 1200×630 HTML document per page
// × locale, screenshotted by scripts/og.mjs with the local Chrome. Never emitted into dist/.
// The first 12 hex of the sha256 of THIS FILE are the OG template version in assets/og/og.json (D-23): any edit here
// means `npm run og`. The site rules the card reuses (tokens, type, .kw, .device + .ios-status) are read from
// src/css at render time — re-run `npm run og` after changing those components too.
//
//   ogFill({ product, SITE, year }, locale, t) → fill() over the build's placeholder namespace for one locale
//   ogCopy(pageId, locale, t, { f, SITE })     → the strings drawn on the card (headline/subline = the D-23 inputs)
//   ogSiteCss({ tokens, base, demo })          → the reused site rules, light theme only
//   ogCard({ locale, copy, icon, shot, siteCss }) → the HTML document

import { esc, fill, mk, placeholderVars, plain } from '../lib/html.mjs';
import { ogInputs } from '../lib/validate-dist.mjs';
import { mosaicSquare } from './partials/brand.mjs';
import { deviceShot } from './partials/picture.mjs';

export const OG_CARD = { w: 1200, h: 630, safe: { x0: 72, x1: 700, y0: 60, y1: 570 } }; // text safe zone (05 §7.8)

// ———————————————————————————— copy ————————————————————————————

// The placeholder namespace of build.mjs renderAll (product facts, SITE, App Store name, dates in the locale's long
// format) minus the per-page {updated} date, which an OG string never uses.
export function ogFill({ product, SITE, year }, locale, t) {
  const date = (iso) => new Intl.DateTimeFormat(locale.code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  const vars = placeholderVars({ product, SITE, locale, year, extra: {
    appStoreName: t.meta?.appStoreName ?? SITE.name, appStoreSubtitle: t.meta?.appStoreSubtitle ?? '',
    releaseDate: date(product.wbw.releaseDate), versionDate: date(product.wbw.versionDate),
  } });
  return (s) => fill(s, vars, locale.code);
}

// headline / subline are exactly what ogInputs() hashes (D-23), placeholders filled as on the page (f = fill with
// the build's placeholderVars); [[ ]] → the one .kw phrase and {wbr} → <wbr> via mk() (R61, R65). A phrase that
// follows a full stop or colon starts its own line ("statement. [[promise.]]"), so the marker never trails a sentence.
// Platform line: the localized devices title for the app pages (features[devices].title), the browser names of
// chromeExtension.hero.worksWith for the extension. Domain = SITE.url without "www.".
export function ogCopy(pageId, locale, t, { f, SITE }) {
  const inputs = ogInputs(pageId, locale, t);
  if (!inputs) throw new Error(`no OG inputs for page "${pageId}"`);
  const devices = t.features?.find((x) => x.id === 'devices')?.title;
  const platform = pageId === 'chrome-extension' ? 'Chrome · Microsoft Edge' : plain(f(devices ?? 'iPhone · iPad · Mac · Vision Pro'));
  return {
    inputs,
    headline: mk(f(inputs.headline)).replace(/([.:!?。：！？])\s*<span class="kw">/u, '$1<br><span class="kw">'),
    subline: esc(plain(f(inputs.subline))),
    platform: esc(platform),
    domain: esc(new URL(SITE.url).hostname.replace(/^www\./, '')),
  };
}

// ———————————————————————————— reused site CSS ————————————————————————————

// Drop @media blocks whose prelude matches re (brace-matched; the site CSS has no nested braces beyond @media).
function dropMedia(css, re) {
  let out = '';
  let i = 0;
  for (;;) {
    const at = css.indexOf('@media', i);
    if (at < 0) return out + css.slice(i);
    const open = css.indexOf('{', at);
    if (open < 0) return out + css.slice(i);
    let depth = 0;
    let j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) break;
    }
    out += css.slice(i, at) + (re.test(css.slice(at, open)) ? '' : css.slice(at, j + 1));
    i = j + 1;
  }
}

// tokens.css + base.css + demo.css, verbatim minus comments and the dark / forced-colours / motion blocks: headless
// Chrome follows the macOS appearance, and the card is always the light "paper & ink" theme (05 §9.1).
export function ogSiteCss({ tokens, base, demo }) {
  return [tokens, base, demo]
    .map((css) => dropMedia(css.replace(/\/\*[\s\S]*?\*\//g, ''), /prefers-color-scheme|forced-colors|prefers-reduced-motion/))
    .join('\n').split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
}

// ———————————————————————————— card CSS (05 §7.8) ————————————————————————————

// Text column = the safe zone x 72–700, y 60–570 (logical: mirrors with dir=rtl); the panel takes the inline end.
// Panel = band-deep with the AppIcon mosaic (05 §5.13 "OG 图：右侧面板"), never mirrored (05 §9.2), carrying the
// site's .device (9:41 status bar, R67) that bleeds off the bottom edge, or the extension's window screenshot
// (05 §5.11 .browser: r-2 clip + 1px hairline, no shadow) bleeding off right and bottom; the page's empty left margin
// slides under the first mosaic column (.og-edge) so the bilingual article fills the panel.
const CSS = `
:root { color-scheme: light; }
html, body { inline-size: 1200px; block-size: 630px; overflow: hidden; }
.og { --og-h: 64px; --og-s: 30px; --cell: 55px; position: relative; inline-size: 1200px; block-size: 630px; overflow: hidden; background: var(--paper); color: var(--ink); }
.og-text { position: absolute; inset-block: 60px; inset-inline-start: 72px; inline-size: 628px; }
.og-brand { display: flex; align-items: center; gap: 18px; block-size: 72px; }
.og-icon { inline-size: 72px; block-size: 72px; border-radius: 22.4%; }
.og-wordmark { font-size: 32px; font-weight: 700; line-height: 1; letter-spacing: -.01em; }
.og-title.h-display { margin-block-start: 28px; font-size: var(--og-h); text-wrap: pretty; }
.og-title .kw { white-space: nowrap; }
html:not([data-script="cjk"]) .og-title .kw { line-height: 1.3; }   /* a taller line box: the marker clears the descenders above */
.og-sub { margin-block-start: 24px; padding-inline-start: 18px; border-inline-start: var(--quote-bar); color: var(--ink-2); font-size: var(--og-s); line-height: 1.4; }
html[data-script="cjk"] .og-sub { line-height: 1.55; }
.og-foot { position: absolute; inset-block-end: 0; inset-inline-start: 0; font-size: 22px; line-height: 1.35; }
.og-platform { color: var(--ink-3); }
.og-domain { color: var(--accent-text); font-weight: 700; }
.og-panel { position: absolute; inset-block: 0; inset-inline-end: 0; inline-size: calc(8 * var(--cell)); overflow: hidden; background: var(--band-deep); }
.og-stage { position: absolute; inset: 0; }   /* dir=ltr here, not on .og-panel: its inset-inline-end must follow the page */
.og-mosaic { display: grid; grid-template-columns: repeat(2, calc(4 * var(--cell))); }
.og-mosaic svg { inline-size: calc(4 * var(--cell)); block-size: calc(4 * var(--cell)); max-inline-size: none; }
.og .mk { fill: var(--mosaic-k); }
/* physical top/left from here on: inside the ltr stage, never mirrored (05 §9.2). On the dark panel the device takes
   the site's dark-theme bezel + hairline (05 §5.3 "暗色下边框改为 #2E2826 并加 1px hairline"). */
.og-panel .device { --device-bezel: #2E2826; --device-line: rgb(242 236 230 / .12); position: absolute; top: var(--cell); left: var(--cell); inline-size: calc(6 * var(--cell)); }
.og-window { position: absolute; top: var(--cell); left: calc(var(--cell) - 200px); inline-size: 960px; overflow: hidden; border-radius: var(--r-2); outline: 1px solid rgb(242 236 230 / .24); }
.og-window img { inline-size: 100%; max-inline-size: none; block-size: auto; }
.og-edge { position: absolute; inset-block: 0; left: 0; inline-size: var(--cell); overflow: hidden; }
`;

// In-page fit (the copy of 20 locales has to fit one template): the largest headline size that keeps ≤ 2 lines at
// ≥ 52px, else ≤ 3 lines, with the largest sub-line size that leaves 20px above the platform line — first with the
// sub-line at ≥ 26px (it must stay clearly above the 22px footer), then down to 22px. The .kw phrase never wraps (R65)
// and must fit the column. The result is written to <html data-og> for scripts/og.mjs (--dump-dom).
const FIT = `(() => {
  const q = (s) => document.querySelector(s);
  const card = q('.og'), h = q('.og-title'), s = q('.og-sub'), foot = q('.og-foot'), kw = q('.og-title .kw'), col = q('.og-text');
  const box = (e) => e.getBoundingClientRect();
  const lines = (e) => Math.round(box(e).height / parseFloat(getComputedStyle(e).lineHeight));
  const set = (k, v) => card.style.setProperty(k, v + 'px');
  const fitsInline = () => h.scrollWidth <= h.clientWidth && (!kw || box(kw).width <= box(col).width + .5);
  const fitsBlock = () => box(s).bottom + 20 <= box(foot).top;
  const HS = [64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40], SS = [30, 28, 26, 24, 22];
  const search = (minSS) => {
    for (const max of [2, 3]) {
      for (const hs of HS) {
        if (max === 2 && hs < 52) break;
        set('--og-h', hs);
        if (lines(h) > max || !fitsInline()) continue;
        for (const ss of SS) { if (ss < minSS) break; set('--og-s', ss); if (fitsBlock()) return { hs, ss }; }
      }
    }
    return null;
  };
  const pick = search(26) ?? search(22);
  if (pick) { set('--og-h', pick.hs); set('--og-s', pick.ss); } else { set('--og-h', HS[HS.length - 1]); set('--og-s', SS[SS.length - 1]); }
  const r = (e) => { if (!e) return null; const b = box(e); return { x: Math.round(b.left), y: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; };
  const texts = ['.og-wordmark', '.og-title', '.og-sub', '.og-platform', '.og-domain'].map((sel) => ({ sel, ...r(q(sel)) }));
  document.documentElement.dataset.og = JSON.stringify({
    fit: Boolean(pick), hs: pick ? pick.hs : HS[HS.length - 1], ss: pick ? pick.ss : SS[SS.length - 1],
    hLines: lines(h), sLines: lines(s), kw: document.querySelectorAll('.kw').length, texts, panel: r(q('.og-panel')),
  });
})();`;

// ———————————————————————————— card ————————————————————————————

// shot = { kind: 'device', key, avif, fallback, meta } | { kind: 'window', src, w, h }; icon = { src };
// URLs are file:// URLs of the generated assets (assets/img, images.json).
export function ogCard({ locale, copy, icon, shot, siteCss }) {
  const mosaic = `<div class="og-mosaic">${Array.from({ length: 6 }, () => mosaicSquare('og-tile')).join('')}</div>`;
  const media = shot.kind === 'device'
    ? deviceShot({ img: () => ({ avif: shot.avif, fallback: shot.fallback, meta: shot.meta }) }, shot.key, { size: 'og', alt: '' })
      .replace(' loading="lazy"', '').replace(' decoding="async"', '')   // the screenshot needs it in the first frame
    : `<div class="og-window"><img src="${esc(shot.src)}" width="${shot.w}" height="${shot.h}" alt=""></div><div class="og-edge">${mosaic}</div>`;
  return `<!doctype html>
<html lang="${locale.hreflang}" dir="${locale.dir}" data-script="${locale.script}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1200">
<meta name="color-scheme" content="light">
<title>${copy.domain}</title>
<style>
${siteCss}
${CSS.trim()}
</style>
</head>
<body>
<div class="og">
  <div class="og-text">
    <div class="og-brand"><img class="og-icon" src="${esc(icon.src)}" width="72" height="72" alt=""><span class="og-wordmark" lang="en" dir="ltr">WordByWord</span></div>
    <h1 class="h-display og-title">${copy.headline}</h1>
    <p class="og-sub">${copy.subline}</p>
    <div class="og-foot"><p class="og-platform">${copy.platform}</p><p class="og-domain" dir="ltr">${copy.domain}</p></div>
  </div>
  <div class="og-panel" aria-hidden="true"><div class="og-stage" dir="ltr">
    ${mosaic}
    ${media}
  </div></div>
</div>
<script>${FIT}</script>
</body>
</html>
`;
}
