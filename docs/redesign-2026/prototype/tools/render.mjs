#!/usr/bin/env node
// Renders ../index.html (en) and ../ja.html (ja) from the copy in ../../08-文案底稿.md (§2 en, §3 ja JSONC)
// and the image manifest written by build-images.mjs. Zero deps, Node 24.
// Prototype renderer v1.1 + v1.3 fixes (05 v1.1 + rulings R39–R84), NOT the production build.mjs (06). It exists so
// both pages share one template and the visible copy cannot drift from 08: since v1.3 every visible string, including
// the X post sample, the demo byline and the SE link texts, comes from 08 (R75, R77) — CFG below holds no copy.
// Usage: node docs/redesign-2026/prototype/tools/render.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = resolve(HERE, '..');
const COPY_DOC = resolve(PROTO, '../08-文案底稿.md');
const MANIFEST = JSON.parse(readFileSync(join(PROTO, 'assets/manifest.json'), 'utf8'));

// ---------- copy: extract JSONC from 08 ----------
function stripJsonc(t) {               // same algorithm as 08 §1.2 jsonc-to-json.mjs
  let o = '', s = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (s) { o += c; if (c === '\\') o += t[++i]; else if (c === '"') s = false; continue; }
    if (c === '"') { s = true; o += c; continue; }
    if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; o += '\n'; continue; }
    o += c;
  }
  return o;
}
function extract(md, heading) {
  const h = md.indexOf(heading);
  if (h < 0) throw new Error(`heading not found in 08: ${heading}`);
  const s = md.indexOf('```jsonc', h);
  const e = md.indexOf('\n```', s + 8);
  return JSON.parse(stripJsonc(md.slice(s + 8, e)));
}
const md = readFileSync(COPY_DOC, 'utf8');
const COPY = { en: extract(md, '## 2. 首页文案 · en'), ja: extract(md, '## 3. 首页文案 · ja') };

// ---------- product facts (F13–F18; 08 §1.4 product.json) ----------
const PRODUCT = {
  'plus.priceUS': '$3.99', minOS: 'iOS 18', minMacOS: 'macOS 15', uiLanguages: '20', targetLanguages: '21',
  'se.levels': 'A1–C1', 'se.uiLanguages': '12', 'se.targetLanguages': '21', yearRange: '2025–2026',
};
const QUOTA = {   // F16 FeatureQuotaManager.swift:63-84; localVoice per 08 §1.4
  cloudSwipe: [50, 500], localSwipe: [100, '∞'], lookup: [20, 500], more: [10, 500],
  lookupSpeech: [10, 200], swipeSpeech: [10, 100], localVoice: ['∞', '∞'],
  chunks: [30, 500], actionFlow: [20, 500], syntax: [5, 500],
};
for (const [k, [f, p]] of Object.entries(QUOTA)) { PRODUCT[`quota.${k}.free`] = String(f); PRODUCT[`quota.${k}.plus`] = String(p); }
const fill = (s, extra = {}) => String(s).replace(/\{([a-zA-Z.]+)\}/g, (m, k) => {
  if (k === 'wbr') return m;   // R61 line-break marker, resolved by head()/plain()
  const v = extra[k] ?? PRODUCT[k];
  if (v == null) throw new Error(`unknown placeholder ${m} in: ${s}`);
  return v;
});

// ---------- locales (02 §4.1 order) ----------
const LOCALES = [
  ['en', '/', 'English'], ['zh-Hans', '/zh-hans/', '简体中文'], ['zh-Hant', '/zh-hant/', '繁體中文'], ['ja', '/ja/', '日本語'],
  ['ko', '/ko/', '한국어'], ['es', '/es/', 'Español'], ['pt-BR', '/pt-br/', 'Português (Brasil)'], ['fr', '/fr/', 'Français'],
  ['de', '/de/', 'Deutsch'], ['it', '/it/', 'Italiano'], ['nl', '/nl/', 'Nederlands'], ['pl', '/pl/', 'Polski'],
  ['ru', '/ru/', 'Русский'], ['tr', '/tr/', 'Türkçe'], ['uk', '/uk/', 'Українська'], ['vi', '/vi/', 'Tiếng Việt'],
  ['th', '/th/', 'ไทย'], ['id', '/id/', 'Bahasa Indonesia'], ['ar', '/ar/', 'العربية'], ['hi', '/hi/', 'हिन्दी'],
].map(([code, path, native]) => ({ code, path, native, file: code === 'en' ? 'index.html' : code === 'ja' ? 'ja.html' : null }));

// 21 translation targets (research 05 §(b), LanguageData.swift:21-43), shown as native-name chips
const TARGETS = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['zh-Hans', '简体中文'], ['zh-Hant', '繁體中文'], ['ja', '日本語'],
  ['ko', '한국어'], ['es', 'Español'], ['pt-BR', 'Português (Brasil)'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['ru', 'Русский'], ['tr', 'Türkçe'], ['uk', 'Українська'],
  ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia'], ['ar', 'العربية'], ['hi', 'हिन्दी'],
];

const SITE = { origin: 'https://www.word-by-word.app', wbwAppId: '6741724502', seAppId: '6787367021', supportEmail: 'app.wordbyword@gmail.com', chromeStoreUrl: '' };

// Per-locale settings that are NOT copy (v1.3: the temporary en `xSample` is gone — 08 now ships features[x].sample
// for every locale, R71/R77). `badge` = the two lines of the placeholder App Store badge (production: Apple's SVG).
const CFG = {
  en: {
    lang: 'en', script: 'latn', set: 'en', contentLanguage: 'en', seSite: 'https://surfenglish.app/', seHreflang: 'en',
    badge: ['Download on the', 'App Store'],
  },
  ja: {
    lang: 'ja', script: 'cjk', set: 'ja', contentLanguage: 'ja', seSite: 'https://surfenglish.app/ja/', seHreflang: 'ja',
    badge: ['App Storeから', 'ダウンロード'],
  },
};

// ---------- helpers ----------
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const plain = (s) => String(s).replace(/\[\[|\]\]/g, '').replaceAll('{wbr}', '').replace(/\*\*/g, '');
// headings: `{wbr}` -> <wbr> (R61); `[[ ]]` is honoured ONLY in the page H1 (R65, 05 §5.2.7) and stripped elsewhere
const head = (s) => esc(String(s).replace(/\[\[|\]\]/g, '')).replaceAll('{wbr}', '<wbr>');
const h1 = (s) => esc(s).replace(/\[\[(.+?)\]\]/, '<span class="kw">$1</span>').replace(/\[\[|\]\]/g, '').replaceAll('{wbr}', '<wbr>');
function rich(s, refs) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((@[a-z-]+)\)/g, (_, text, ref) => {
      const r = refs[ref];
      if (!r) throw new Error(`unknown ref ${ref}`);
      return `<a href="${r.href}"${r.attrs || ''}>${text}</a>`;
    });
}
// first sentence / rest. Fallback only (08 D19): hero renders hero.ledeShort + hero.how (R77); a locale that lacks
// them gets hero.lede split at its first sentence end (R69: the phone first screen shows only the definition)
function splitLede(s) {
  const m = String(s).match(/^(.+?[.!?。！？])\s*(.*)$/s);
  return m ? [m[1], m[2]] : [s, ''];
}
function pic(id, { sizes, alt, loading = 'lazy' }) {
  const m = MANIFEST[id];
  if (!m) throw new Error(`asset not in manifest: ${id}`);
  const srcset = m.avif.map((a) => (m.avif.length > 1 ? `${a.file} ${a.w}w` : a.file)).join(', ');
  // width/height = intrinsic size of the <img src> candidate (05 §8.2)
  return `<picture><source type="image/avif" srcset="${srcset}"${sizes && m.avif.length > 1 ? ` sizes="${sizes}"` : ''}><img src="${m.jpeg.file}" width="${m.jpeg.w}" height="${m.jpeg.h}" alt="${esc(alt)}" loading="${loading}" decoding="async"></picture>`;
}
const icon = (id, size, extra = '') => `<img src="${MANIFEST[id].png.file}" width="${size}" height="${size}"${extra}>`;
const APPLE = 'M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-.99-1.94.03-3.73 1.13-4.73 2.86-2.02 3.5-.52 8.68 1.45 11.52.96 1.39 2.11 2.95 3.61 2.9 1.45-.06 2-.94 3.75-.94s2.25.94 3.78.91c1.56-.03 2.55-1.42 3.5-2.81 1.1-1.61 1.56-3.17 1.58-3.25-.03-.02-3.04-1.17-3.09-4.64zM14.16 4.05c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.22-1.22 3.53 1.29.1 2.6-.65 3.41-1.61z';
// Placeholder App Store badge: production uses Apple's official localized SVG (05 §5.12, F28). WBW only (R43).
const badge = ({ href, label, lines, attrs = '' }) =>
  `<a class="asb" href="${href}" aria-label="${esc(label)}"${attrs}><svg class="asb-logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${APPLE}"/></svg><span class="asb-text" aria-hidden="true"><small>${esc(lines[0])}</small><b>${esc(lines[1])}</b></span></a>`;
// ct by placement only, never by locale (R3, R55); pt pending (H3)
const appStoreUrl = (id, ct) => `https://apps.apple.com/app/apple-store/id${id}?ct=${ct}&amp;mt=8`;

// ---------- mosaic (05 §5.13): AppIcon rows K K B O / O O O K / B B O C / K B K C; K follows --mosaic-k ----------
const MOSAIC = ['KKBO', 'OOOK', 'BBOC', 'KBKC'];
const CELL = { O: '#44111C', B: '#882239', C: '#CC3355' };
const cell = (ch, x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}"${ch === 'K' ? ' class="mk"' : ` fill="${CELL[ch]}"`}/>`;
const mosaicSquare = (cls) => `<svg class="${cls}" viewBox="0 0 4 4" aria-hidden="true" shape-rendering="crispEdges">${MOSAIC.flatMap((r, y) => [...r].map((ch, x) => cell(ch, x, y, 1))).join('')}</svg>`;
const mosaicStrip = (cls) => `<svg class="${cls}" viewBox="0 0 16 1" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">${[...MOSAIC.join('')].map((ch, x) => cell(ch, x, 0, 1)).join('')}</svg>`;
// hero edge: content width, 2 rows x 8px; row 1 = icon rows 1+2, row 2 = icon rows 3+4 (64x16 pattern)
const mosaicEdge = () => {
  const rows = [MOSAIC[0] + MOSAIC[1], MOSAIC[2] + MOSAIC[3]];
  const rects = rows.flatMap((r, y) => [...r].map((ch, x) => cell(ch, x * 8, y * 8, 8))).join('');
  return `<svg class="edge-mosaic" width="100%" height="16" aria-hidden="true" shape-rendering="crispEdges"><defs><pattern id="mosaic-edge" width="64" height="16" patternUnits="userSpaceOnUse">${rects}</pattern></defs><rect width="100%" height="16" fill="url(#mosaic-edge)"/></svg>`;
};

const SVG = {
  globe: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9"/></svg>',
  chevron: '<svg class="i i-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h14M3 12h17M8 17h12"/></svg>',
};

// iOS status bar: one component for the hero sample AND every screenshot device (R67, 05 §5.3). Always 9:41,
// full signal / Wi-Fi / battery, no location arrow. Colour comes from data-tone; background from --status-bg.
const STATUS = (tone) => `<div class="ios-status" data-tone="${tone}" aria-hidden="true"><span class="ios-time">9:41</span><span class="ios-island"></span><span class="ios-sys"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.5 1.5a4.3 4.3 0 0 0-6 0zM1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.5 1.5a7.5 7.5 0 0 0-10.6 0z"/></svg><svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M25 4v4a2 2 0 0 0 0-4z" opacity=".4"/></svg></span></div>`;
// in-app browser toolbar + nav inside the hero sample (aria-hidden decoration; self-drawn, no SF Symbols — 05 §5.2.3)
const TOOLS = `<div class="wb-bottom" aria-hidden="true"><div class="wb-tools"><svg viewBox="0 0 26 26"><path d="M5 5h16v11H12l-5 4v-4H5z"/><circle cx="12" cy="10" r="2.6"/><path d="m14 12 2 2"/></svg><svg viewBox="0 0 26 26"><path d="M6 4h12a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2z"/><path d="M6 19a2 2 0 0 1 2-2h12"/><path d="m10.5 14 2.5-7 2.5 7m-4.2-2h3.4"/></svg><svg viewBox="0 0 26 26"><path d="M4 10h4l5-4v14l-5-4H4z"/><path d="M17 9.5a5 5 0 0 1 0 7M19.5 7a8.5 8.5 0 0 1 0 12"/></svg><svg viewBox="0 0 26 26"><rect x="3" y="8" width="14" height="12" rx="2"/><path d="M7 5h12a2 2 0 0 1 2 2v8"/><circle cx="20" cy="19" r="3.2"/></svg></div><div class="wb-nav"><svg viewBox="0 0 22 22"><path d="m14 4-7 7 7 7"/></svg><svg viewBox="0 0 22 22" class="dim"><path d="m8 4 7 7-7 7"/></svg><svg viewBox="0 0 22 22"><rect x="3" y="5" width="13" height="13" rx="2"/><path d="M7 2h10a3 3 0 0 1 3 3v10M9.5 8.5v6m-3-3h6"/></svg><svg viewBox="0 0 22 22"><rect x="3" y="3" width="16" height="16" rx="3"/><text x="11" y="15" text-anchor="middle" font-size="9" stroke="none">23</text></svg><svg viewBox="0 0 22 22"><circle cx="4" cy="11" r="1.6"/><circle cx="11" cy="11" r="1.6"/><circle cx="18" cy="11" r="1.6"/></svg></div><span class="wb-home"></span></div>`;
// generic post actions (reply / repost / like / share), not X's glyphs (05 §5.4.3)
const POST_ACTIONS = '<p class="post-actions" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M3.5 9.5a6.5 6 0 1 1 3 5.1L3 16l1.2-3.2a6 6 0 0 1-.7-3.3z"/></svg><svg viewBox="0 0 20 20"><path d="M5 7.5 7.5 5 10 7.5M7.5 5.5V13a2 2 0 0 0 2 2H12M15 12.5 12.5 15 10 12.5M12.5 14.5V7a2 2 0 0 0-2-2H8"/></svg><svg viewBox="0 0 20 20"><path d="M10 16s-6-3.6-6-8a3.2 3.2 0 0 1 6-1.6A3.2 3.2 0 0 1 16 8c0 4.4-6 8-6 8z"/></svg><svg viewBox="0 0 20 20"><path d="M10 3v10M6.5 6.5 10 3l3.5 3.5M4 12v4h12v-4"/></svg></p>';

// screenshot inside a CSS device (05 §5.3): status bar drawn by CSS, image = status-bar-free crop (402:820)
function deviceShot(id, { size, sizes, alt, extra = '' }) {
  const m = MANIFEST[id];
  return `<div class="device device--${size}" style="--status-bg:${m.statusBg}"><div class="device-screen">${STATUS(m.statusTone)}${pic(id, { sizes, alt })}${extra.screen || ''}</div>${extra.device || ''}</div>`;
}

// ---------- page ----------
function render(code) {
  const t = COPY[code];
  const c = CFG[code];
  const L = LOCALES.find((l) => l.code === code);
  const F = Object.fromEntries(t.features.map((f) => [f.id, f]));
  const set = c.set;
  const home = L.file;
  const enOnlyAttr = code === 'en' ? '' : ' hreflang="en"';
  const prod = (p) => ` data-prod-href="${p}"`;
  const appLink = (placement) => appStoreUrl(SITE.wbwAppId, `wbw-${placement}`);
  const seAppLink = appStoreUrl(SITE.seAppId, 'wbw-card');
  const ui = {
    fig: t.common.figLabel, shot: t.common.screenshotLabel, shotEx: t.common.screenshotExcerptLabel, note: t.common.noteLabel,
    demo: t.common.demoLabel, illustration: F.chunks.sample.label, mainNav: t.nav.ariaMain, langNav: t.nav.ariaLanguages, footerNav: t.footer.ariaNav,
  };
  const refs = {
    '@about': { href: '#', attrs: prod('/about/') + enOnlyAttr },
    '@chrome': { href: '#', attrs: prod('/chrome-extension/') + enOnlyAttr },
    '@se-site': { href: c.seSite, attrs: ` hreflang="${c.seHreflang}" data-ga-event="surfenglish_promo" data-ga-label="faq_site"` },
  };
  const langLinks = (where) => LOCALES.map((l) =>
    `<li><a href="${l.file || '#'}"${prod(l.path)} hreflang="${l.code}" lang="${l.code}"${l.code === 'ar' ? ' dir="rtl"' : ''}${l.code === code ? ' aria-current="page"' : ''} data-ga-event="language_switch" data-ga-label="${where}:${l.code}">${esc(l.native)}</a></li>`).join('');
  // header nav (R16): Chrome extension only in state S1 (SITE.chromeStoreUrl set, R2); the prototype is S0
  const navItems = `<li><a href="#features">${esc(t.nav.features)}</a></li><li><a href="#languages">${esc(t.nav.languages)}</a></li><li><a href="#pricing">${esc(t.nav.pricing)}</a></li><li><a href="#faq">${esc(t.nav.faq)}</a></li>${SITE.chromeStoreUrl ? `<li><a href="#"${prod('/chrome-extension/')}${enOnlyAttr}>${esc(t.nav.chromeExtension)}</a></li>` : ''}`;

  // ----- hero (05 §5.2.1, R69): H1 -> ledeShort -> CTA + ctaNote -> sample -> how -> platformNote -----
  // 08 D19 / R77 (v1.3 acceptance fix): lede = definition sentence only (= ledeShort in en/ja/zh-Hans), how after the
  // sample; split lede only if a locale lacks ledeShort/how (fallback)
  const [ledeFirst, ledeRest] = t.hero.ledeShort && t.hero.how ? [t.hero.ledeShort, t.hero.how] : splitLede(t.hero.lede);
  const d = t.demo;
  const wordRe = new RegExp(`\\b${d.lookup.word}\\b`);
  if (!wordRe.test(d.source[1])) throw new Error('demo.lookup.word must appear in source[1] (06 L-10)');
  const s2html = esc(d.source[1]).replace(wordRe, `<span class="w">${esc(d.lookup.word)}</span>`);
  const sample = `
      <figure class="sample is-static" id="sample" aria-labelledby="sample-cap" data-loops="2">
        <div class="device device--hero" role="group" aria-label="${esc(ui.demo)}">
          <div class="device-screen sample-screen" dir="ltr" data-nosnippet>
            ${STATUS('dark')}
            <div class="wb-addr" aria-hidden="true"><svg viewBox="0 0 20 20" class="wb-star"><path d="m10 2.5 2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.7z"/></svg><span>${esc(d.ui.domain)}</span><svg viewBox="0 0 20 20" class="wb-reload"><path d="M15.5 10a5.5 5.5 0 1 1-1.8-4.1M14 2.5v3.6h-3.6"/></svg></div>
            <article class="wb-page" lang="${d.sourceLang}">
              <p class="wb-title">${esc(d.articleTitle)}</p>${d.byline ? `
              <p class="wb-byline" aria-hidden="true">${esc(d.byline)}</p>` : ''}
              <p class="wb-src"><span class="s s1">${esc(d.source[0])}</span> <span class="s s2">${s2html}</span></p>
              <div class="wb-tr-wrap"><p class="wb-tr" lang="${code}">${d.translation.map(esc).join(c.script === 'cjk' ? '' : ' ')}</p></div>
              ${d.context.map((p) => `<p class="wb-more" aria-hidden="true">${esc(p)}</p>`).join('')}
            </article>
            <aside class="wb-card" lang="${code}">
              <p class="wb-card-head"><b class="wb-word" lang="${d.sourceLang}">${esc(d.lookup.word)}</b> <span class="wb-pos">${esc(d.lookup.pos)}</span><svg class="wb-speaker" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.2 5.5a6.4 6.4 0 0 1 0 9" fill="none"/></svg></p>
              <p class="wb-def">${esc(d.lookup.meaning)}</p>
              <p class="wb-note">${esc(d.lookup.note)}</p>
              <p class="wb-more-link">${esc(d.ui.more)}</p>
            </aside>
            ${TOOLS}
            <span class="cue cue-swipe" aria-hidden="true"><span class="cue-label">${esc(d.ui.swipeCue)}</span><span class="cue-dot"></span></span>
            <span class="cue cue-tap" aria-hidden="true"></span>
          </div>
        </div>
        <figcaption class="sample-cap"><span id="sample-cap">${esc(d.caption)}</span> <button class="sample-toggle" type="button" hidden data-pause="${esc(d.ui.pause)}" data-replay="${esc(d.ui.replay)}">${esc(d.ui.pause)}</button></figcaption>
      </figure>`;

  // ----- features (05 §5.4) -----
  const sw = F.swipe, lk = F.lookup;
  const l1 = `
        <div class="feature feat-l1">
          <div class="l1-copy">
            <p class="eyebrow"><span class="eyebrow-n">01</span> ${esc(sw.kicker)}</p>
            <h3 class="h-sub" id="f-swipe">${head(sw.title)}</h3>
            <p class="feat-text">${esc(sw.text)}</p>
            <ol class="points">${sw.bullets.map((b, i) => `<li><span class="points-n" aria-hidden="true">0${i + 1}</span><span>${esc(b)}</span></li>`).join('')}</ol>
          </div>
          <figure class="l1-media">
            ${deviceShot(`app/${set}/swipe`, { size: 'l', sizes: '(min-width: 900px) 340px, min(320px, 80vw)', alt: sw.alt })}
            <figcaption class="media-cap">${esc(ui.shot)}</figcaption>
          </figure>
        </div>`;

  // L2 "annotated spread" (05 §5.4.2, VIS-09): pins on the bezel edge at the target's height, ring on the word, no loupe
  const lm = MANIFEST[`app/${set}/lookup`];
  const pinsHtml = lm.pins.map((p) => `<span class="pin pin--${p.side}" style="--y:${p.y}" aria-hidden="true">${p.n}</span>`).join('');
  const r = lm.ring;
  const ringHtml = `<span class="ring" style="--rx:${r.x};--ry:${r.y};--rw:${r.w};--rh:${r.h}" aria-hidden="true"></span>`;
  const anno = (i) => {
    const p = lm.pins[i];
    return `<li class="anno anno--${p.side}" style="--y:${p.y}"><span class="anno-n" aria-hidden="true">${p.n}</span><span class="anno-t">${esc(lk.bullets[i])}</span><span class="anno-line" aria-hidden="true"></span></li>`;
  };
  const l2 = `
        <div class="feature feat-l2">
          <div class="l2-head">
            <p class="eyebrow"><span class="eyebrow-n">02</span> ${esc(lk.kicker)}</p>
            <h3 class="h-sub" id="f-lookup">${head(lk.title)}</h3>
            <p class="lede">${esc(lk.text)}</p>
            <p class="limit"><span class="tag tag--note">${esc(ui.note)}</span> ${esc(lk.note)}</p>
          </div>
          <div class="spread">
            <figure class="spread-device">
              ${deviceShot(`app/${set}/lookup`, { size: 'l', sizes: '(min-width: 900px) 340px, min(320px, 80vw)', alt: lk.alt, extra: { screen: ringHtml, device: pinsHtml } })}
              <figcaption class="media-cap">${esc(ui.shot)}</figcaption>
            </figure>
            <ol class="spread-col spread-col--start">${anno(0)}${anno(1)}</ol>
            <ol class="spread-col spread-col--end" start="3">${anno(2)}</ol>
          </div>
        </div>`;

  // M grid (05 §5.4.3): X = HTML post sample (R71); chunks = HTML illustration; read-aloud + syntax = excerpts.
  // X sample = 08 S22 / 06 §4.2 features[x].sample {name, handle, time, source, translation}, every locale (R77);
  // source lang = demo.sourceLang, caption = chunks label (05 §5.4.3). Old 08 fields author/lang/label still accepted.
  const xs = F.x.sample;
  if (!xs || !xs.handle || !xs.source || !xs.translation) throw new Error(`08 features[x].sample incomplete for ${code} (R77)`);
  if (!/example/.test(xs.handle)) throw new Error(`X sample handle must be fictitious (contain "example", 05 §5.4.3): ${xs.handle}`);
  const xName = xs.author || xs.name || '';
  const xLabel = xs.label || ui.illustration;
  const mX = `
          <article class="m-card" aria-labelledby="f-x">
            <figure class="m-media">
              <div class="canvas post-sample" dir="ltr">
                <div class="post" role="img" aria-label="${esc(`${plain(F.x.title)}: ${xs.source} — ${xs.translation}`)}">
                  <p class="post-head" aria-hidden="true"><span class="post-avatar">${esc([...(xName || xs.handle.slice(1))][0].toUpperCase())}</span>${xName ? `<b>${esc(xName)}</b> ` : ''}<span class="post-handle">${esc(xs.time ? `${xs.handle} · ${xs.time}` : xs.handle)}</span></p>
                  <p class="post-src" lang="${xs.lang || d.sourceLang}">${esc(xs.source)}</p>
                  <p class="post-tr" lang="${code}">${esc(xs.translation)}</p>
                  ${POST_ACTIONS}
                </div>
              </div>
              <figcaption class="media-cap">${esc(xLabel)}</figcaption>
            </figure>
            <p class="eyebrow eyebrow--plain">${esc(F.x.kicker)}</p>
            <h3 id="f-x">${head(F.x.title)}</h3>
            <p>${esc(F.x.text)}</p>
          </article>`;
  const ch = F.chunks;
  let sent = esc(ch.sample.sentence);
  ch.sample.chunks.forEach((k, i) => { sent = sent.replace(esc(k), `<span class="ck ck-${i + 1}">${esc(k)}</span>`); });
  const mChunks = `
          <article class="m-card" aria-labelledby="f-chunks">
            <figure class="m-media">
              <div class="canvas ck-canvas" role="img" aria-label="${esc(`${ch.sample.sentence} — ${ch.sample.gloss} — ${ch.sample.flowLabel}: ${ch.sample.flow}`)}">
                <div class="ck-sample" aria-hidden="true" lang="en">
                  <p class="ck-sentence">${sent}</p>
                  <p class="ck-gloss" lang="${code}">${esc(ch.sample.gloss)}</p>
                  <p class="ck-flow"><span class="ck-flow-label">${esc(ch.sample.flowLabel)}</span> <span>${esc(ch.sample.flow)}</span></p>
                </div>
              </div>
              <figcaption class="media-cap">${esc(ch.sample.label)}</figcaption>
            </figure>
            <p class="eyebrow eyebrow--plain">${esc(ch.kicker)} <span class="tag tag--en-only">${esc(t.pricing.table.englishOnly)}</span></p>
            <h3 id="f-chunks">${head(ch.title)}</h3>
            <p>${esc(ch.text)}</p>
          </article>`;
  const mShot = (f, img) => `
          <article class="m-card" aria-labelledby="f-${f.id}">
            <figure class="m-media"><div class="shot">${pic(`app/${set}/${img}`, { sizes: '(min-width: 900px) 512px, calc(100vw - 32px)', alt: f.alt })}</div>
              <figcaption class="media-cap">${esc(ui.shotEx)}</figcaption></figure>
            <p class="eyebrow eyebrow--plain">${esc(f.kicker)}</p>
            <h3 id="f-${f.id}">${head(f.title)}</h3>
            <p>${esc(f.text)}</p>
          </article>`;
  const mGrid = `<div class="feature m-grid">${mX}${mChunks}${mShot(F.speech, 'tts-ex')}${mShot(F.syntax, 'syntax-ex')}</div>`;

  // spec sheet (05 §5.4.4, VIS-07): label + H3 + fact, hairlines, no icons; Aa samples only on "display"
  const swatches = '<span class="swatches" aria-hidden="true"><i class="sw sw--quote">Aa</i><i class="sw sw--bg">Aa</i><i class="sw sw--border">Aa</i><i class="sw sw--under">Aa</i></span>';
  // R78: spec-row text <= 80 Latin characters / <= 40 full-width units (ASCII = 0.5, as 08 §7.6) after placeholders
  for (const id of ['engines', 'display', 'history', 'devices']) {
    const s = [...fill(F[id].text)];
    const n = c.script === 'cjk' ? s.reduce((a, ch) => a + (ch.codePointAt(0) < 0x80 ? 0.5 : 1), 0) : s.length;
    const max = c.script === 'cjk' ? 40 : 80;
    if (n > max) throw new Error(`spec text too long (R78, ${n} > ${max}) in ${code} features[${id}]`);
  }
  const spec = `<ul class="spec">${['engines', 'display', 'history', 'devices'].map((id) => `
          <li class="spec-row"><p class="spec-label" aria-hidden="true">${esc(F[id].kicker)}</p><h3 class="h-4">${head(F[id].title)}${id === 'display' ? ` ${swatches}` : ''}</h3><p class="spec-fact">${esc(fill(F[id].text))}</p></li>`).join('')}
        </ul>`;

  // ----- gallery (05 §5.5; n<=2 = left/right layout, VIS-17) -----
  const galIds = { settings: 'settings', dictionary: 'dictionary', languages: 'languages', languageList: 'language-list' };
  const gItems = t.gallery.items.filter((g) => !g.hidden);
  const gSize = gItems.length <= 2 ? 'md' : 'sm';
  const gSizes = gSize === 'md' ? '(min-width: 900px) 302px, 58vw' : '(min-width: 900px) 226px, 58vw';
  const gallery = gItems.map((g, i) => `
          <figure class="gallery-item">${deviceShot(`app/${set}/${galIds[g.id]}`, { size: gSize, sizes: gSizes, alt: g.alt })}
            <figcaption><span class="fig-no">${esc(ui.fig)} ${i + 1}</span> ${esc(fill(g.caption))}</figcaption></figure>`).join('');

  // ----- pricing (05 §5.7, R43/R68): one table + one note + the WBW badge; price in the Plus header -----
  const tb = t.pricing.table;
  const val = (v) => (v === '∞' ? `<span class="nolimit">${esc(tb.noLimit)}</span>` : esc(fill(tb.perDay, { n: String(v) })));
  const groups = [['translate', ['cloudSwipe', 'localSwipe']], ['lookup', ['lookup', 'more']], ['listen', ['lookupSpeech', 'swipeSpeech', 'localVoice']], ['sentence', ['chunks', 'actionFlow', 'syntax']]];
  const tbody = groups.map(([g, rows]) => `
              <tbody><tr class="grp"><th colspan="3" scope="colgroup">${esc(tb.groups[g])}</th></tr>${rows.map((row) => `
                <tr><th scope="row">${esc(tb.rows[row])}${row === 'chunks' || row === 'actionFlow' ? ` <span class="tag tag--en-only">${esc(tb.englishOnly)}</span>` : ''}</th><td>${val(QUOTA[row][0])}</td><td>${val(QUOTA[row][1])}</td></tr>`).join('')}</tbody>`).join('');

  // ----- SE sibling card (04 §3.1 + 05 §5.9; R40–R44): paper card, SE window, TEXT links only (no badge) -----
  // 08 v1.3 keys sibling.card.* (R74); site link anchor = SE core-keyword phrase, never the bare domain (R76)
  const sb = t.sibling.card;
  const sibling = `
    <aside class="sibling" id="surfenglish" aria-labelledby="se-h" data-ga-view="surfenglish_promo_view" data-ga-label="card">
      <div class="container">
        <div class="sibling__inner">
          <div class="sibling__text">
            <p class="sibling__eyebrow">${icon('se/se-icon-64', 32, ' class="sibling__icon" alt="" loading="lazy" decoding="async"')}<span>${esc(sb.eyebrow)}</span></p>
            <h2 id="se-h" class="h-3">${head(sb.title)}</h2>
            <p class="sibling__body">${esc(sb.body)}</p>
            <ul class="sibling__points">${sb.points.map((p) => `<li>${esc(fill(p)).replace(PRODUCT['se.levels'], `<bdi>${PRODUCT['se.levels']}</bdi>`)}</li>`).join('')}</ul>
            <p class="sibling__note">${esc(fill(sb.note))}</p>
            <p class="sibling__actions">
              <a class="sibling__store" href="${seAppLink}" data-ga-event="surfenglish_promo" data-ga-label="card_appstore">${esc(sb.appStoreLinkText)}<span aria-hidden="true">&#160;→</span></a>
              <a class="sibling__link" href="${c.seSite}" hreflang="${c.seHreflang}" data-ga-event="surfenglish_promo" data-ga-label="card_site">${esc(sb.linkText)}</a>
            </p>
          </div>
          <figure class="sibling__window">
            ${pic('se/games', { alt: sb.shotAlt })}
            <figcaption>${esc(sb.shotCaption)}</figcaption>
          </figure>
        </div>
      </div>
    </aside>`;

  // ----- FAQ (05 §5.8): first question open, serif questions, red-bar answers; S0 answer for "devices" (R45) -----
  const faq = t.faq.items.map((q, i) => `
            <details class="faq-item" id="faq-${q.id}"${i === 0 ? ' open' : ''}><summary><span class="faq-q">${esc(q.q)}</span></summary><div class="faq-a"><p>${rich(fill(SITE.chromeStoreUrl && q.aExtLive ? q.aExtLive : q.a), refs)}</p></div></details>`).join('');

  const alternates = LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE.origin}${l.path}">`).join('\n  ') + `\n  <link rel="alternate" hreflang="x-default" href="${SITE.origin}/">`;
  const brandLink = (lazy) => `<a class="brand" href="${home}"${prod(L.path)}>${icon('brand/wbw-icon-64', 28, ` class="brand-icon" alt="WordByWord"${lazy ? ' loading="lazy"' : ''}`)}<span class="brand-name" aria-hidden="true">WordByWord</span></a>`;

  const html = `<!doctype html>
<html lang="${c.lang}" dir="ltr" data-script="${c.script}" data-page="home">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- @prototype-only: the next tag keeps this local design prototype out of search engines. It must NOT be copied
       into production templates: indexable pages output an index robots meta (06 §5.1.1, R49, SEO-06). -->
  <meta name="robots" content="noindex, nofollow" data-prototype-only>
  <title>${esc(plain(t.meta.title))}</title>
  <meta name="description" content="${esc(plain(t.meta.description))}">
  <meta http-equiv="content-language" content="${c.contentLanguage}">
  <link rel="canonical" href="${SITE.origin}${L.path}">
  ${alternates}
  <meta name="theme-color" content="#FBF8F3" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#121010" media="(prefers-color-scheme: dark)">
  <meta name="apple-itunes-app" content="app-id=${SITE.wbwAppId}">
  <link rel="icon" href="${MANIFEST['brand/favicon-32'].png.file}" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)">
  <link rel="icon" href="${MANIFEST['brand/favicon-32-dark'].png.file}" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)">
  <link rel="stylesheet" href="style.css">
  <script src="demo.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${esc(t.common.skipToContent)}</a>
  <div class="header-sentinel" aria-hidden="true"></div>
  <header class="site-header">
    <div class="container header-inner">
      ${brandLink(false)}
      <nav class="main-nav" aria-label="${esc(ui.mainNav)}"><ul>${navItems}</ul></nav>
      <div class="header-tools">
        <details class="lang-switch">
          <summary aria-label="${esc(t.common.languageLabel)}: ${esc(L.native)}">${SVG.globe}<span class="lang-current" lang="${code}">${esc(L.native)}</span>${SVG.chevron}</summary>
          <nav class="lang-menu" aria-label="${esc(ui.langNav)}"><ul>${langLinks('header')}</ul></nav>
        </details>
        <a class="btn btn-small" href="${appLink('header')}" data-ga-label="header_app_store">${t.nav.downloadShort && t.nav.downloadShort !== t.nav.download ? `<span class="dl-long">${esc(t.nav.download)}</span><span class="dl-short">${esc(t.nav.downloadShort)}</span>` : esc(t.nav.download)}</a>
        <details class="nav-menu">
          <summary aria-label="${esc(t.common.menu)}">${SVG.menu}</summary>
          <nav class="nav-menu-panel" aria-label="${esc(ui.mainNav)}"><ul>${navItems}</ul></nav>
        </details>
      </div>
    </div>
  </header>

  <main id="main">
    <section id="hero" class="hero" aria-labelledby="hero-h">
      <div class="container">
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">${esc(t.hero.eyebrow)}</p>
            <h1 id="hero-h" class="h-display">${h1(t.hero.title)}</h1>
            <p class="hero-lede lede">${esc(ledeFirst)}</p>
            <div class="cta-row">
              ${badge({ href: appLink('hero'), label: t.common.appStoreBadgeAlt, lines: c.badge, attrs: ' data-ga-label="hero"' })}
              <a class="link-arrow" href="#features">${esc(t.hero.secondaryCta)}</a>
            </div>
            <p class="hero-cta-note">${esc(t.hero.ctaNote)}</p>
          </div>
          <div class="hero-demo">${sample}
          </div>
          <div class="hero-after">
            ${ledeRest ? `<p class="hero-how">${esc(ledeRest)}</p>` : ''}
            <p class="platform-note">${esc(fill(t.hero.platformNote))}</p>
          </div>
        </div>
        ${mosaicEdge()}
      </div>
    </section>

    <section id="features" class="section section--features" aria-labelledby="features-h">
      <div class="container">
        <header class="section-head">
          <h2 id="features-h">${head(t.featuresIntro.title)}</h2>
          <p class="lede">${esc(t.featuresIntro.lede)}</p>
        </header>${l1}${l2}
        ${mGrid}
        ${spec}
      </div>
    </section>

    <section id="screenshots" class="section section--end" aria-labelledby="gallery-h">
      <div class="container">
        <h2 id="gallery-h" class="h-sub">${head(t.gallery.title)}</h2>
        <div class="gallery" data-count="${gItems.length}" role="region" aria-labelledby="gallery-h" tabindex="0">${gallery}
        </div>
      </div>
    </section>

    <section id="languages" class="section section--band" aria-labelledby="languages-h">
      <div class="container langs-layout">
        <div class="langs-main">
          <h2 id="languages-h">${head(fill(t.languages.title))}</h2>
          <p class="lede">${esc(t.languages.lede)}</p>
          <ul class="facts">
            <li>${esc(fill(t.languages.uiCount))}</li>
            <li>${esc(fill(t.languages.targetCount))}</li>
            <li>${esc(t.languages.sourceNote)}</li>
          </ul>
          <h3 class="chips-label" id="targets-h">${esc(t.languages.targetListLabel)}</h3>
          <ul class="chips" aria-labelledby="targets-h">${TARGETS.map(([l, n]) => `<li class="chip" lang="${l}"${l === 'ar' ? ' dir="rtl"' : ''}>${esc(n)}</li>`).join('')}</ul>
        </div>
        <aside class="side-notes">
          <ol>${t.languages.limits.map((s) => `<li class="side-note">${esc(s)}</li>`).join('')}</ol>
        </aside>
      </div>
    </section>

    <section id="pricing" class="section" aria-labelledby="pricing-h">
      <div class="container">
        <header class="section-head">
          <h2 id="pricing-h">${head(t.pricing.title)}</h2>
          <p class="lede">${esc(t.pricing.lede)}</p>
        </header>
        <div class="pricing-body">
          <div class="table-wrap">
            <table class="quota">
              <caption>${esc(tb.caption)}</caption>
              <thead><tr><th scope="col">${esc(tb.colFeature)}</th><th scope="col">${esc(tb.colFree)}</th><th scope="col" class="col-plus">${mosaicStrip('plus-mosaic')}<span class="plus-name">${esc(tb.colPlus)}</span><span class="plus-price">${esc(fill(t.pricing.plus.price))}</span></th></tr></thead>${tbody}
            </table>
          </div>
          ${t.pricing.summary ? `<p class="pricing-summary">${esc(fill(t.pricing.summary))}</p>
          ` : ''}<p class="pricing-note">${esc(t.pricing.note)}</p>
          <div class="pricing-cta">${badge({ href: appLink('pricing'), label: t.common.appStoreBadgeAlt, lines: c.badge, attrs: ' data-ga-label="pricing"' })}</div>
        </div>
      </div>
    </section>
${sibling}

    <section id="faq" class="section section--end" aria-labelledby="faq-h">
      <div class="container faq-layout">
        <div class="faq-head"><h2 id="faq-h" class="h-sub">${head(t.faq.title)}</h2></div>
        <div class="faq-list">${faq}
        </div>
      </div>
    </section>

    <section id="cta" class="section section--band final-cta" aria-labelledby="cta-h">
      <div class="container cta-layout">
        <div class="cta-mark" aria-hidden="true">${icon('brand/wbw-icon-160', 80, ' class="cta-icon" alt="" loading="lazy" decoding="async"')}${mosaicSquare('mosaic mosaic--cta')}</div>
        <div class="cta-copy">
          <h2 id="cta-h">${head(t.cta.title)}</h2>
          <p class="lede cta-recap">${esc(fill(t.cta.recap || t.cta.text))}</p>
          ${badge({ href: appLink('cta'), label: t.common.appStoreBadgeAlt, lines: c.badge, attrs: ' data-ga-label="cta"' })}${t.cta.recap ? `
          <p class="cta-note">${esc(fill(t.cta.text))}</p>` : ''}
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        ${brandLink(true)}
        <p class="footer-tagline">${esc(t.footer.tagline)}</p>
        <div class="family">
          <h2 class="footer-heading">${esc(t.sibling.footer.heading)}</h2>
          <a class="family-link" href="${c.seSite}" hreflang="${c.seHreflang}" data-ga-event="surfenglish_promo" data-ga-label="footer_site">
            <span class="family-mark" aria-hidden="true">${icon('brand/wbw-icon-64', 32, ' alt="" loading="lazy"')}<i class="family-line"></i>${icon('se/se-icon-64', 32, ' alt="" loading="lazy"')}</span>
            <span>${esc(t.sibling.footer.linkText)}</span></a>
        </div>
      </div>
      <nav class="footer-links" aria-label="${esc(ui.footerNav)}">
        <div>
          <h2 class="footer-heading">${esc(t.footer.product)}</h2>
          <ul>
            <li><a href="${appLink('footer')}">${esc(t.footer.iosApp)}</a></li>
            <li><a href="#"${prod('/chrome-extension/')}${enOnlyAttr}>${esc(t.footer.chromeExtension)}</a></li>
            <li><a href="#"${prod('/about/')}${enOnlyAttr}>${esc(t.footer.about)}</a></li>
            <li><a href="#faq">${esc(t.footer.faq)}</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-heading">${esc(t.footer.help)}</h2>
          <ul>
            <li><a href="#"${prod('/support.html')}${enOnlyAttr}>${esc(t.footer.support)}</a></li>
            <li><a href="#"${prod('/privacy.html')}${enOnlyAttr}>${esc(t.footer.privacy)}</a></li>
            <li><a href="mailto:${SITE.supportEmail}">${esc(t.footer.contact)}</a></li>
          </ul>
        </div>
      </nav>
      <nav class="footer-langs" aria-labelledby="footer-langs-h">
        <h2 class="footer-heading" id="footer-langs-h">${esc(t.footer.languagesTitle)}</h2>
        <ul class="lang-list">${langLinks('footer')}</ul>
      </nav>
    </div>
    <div class="container"><div class="footer-bottom">
      <p>${esc(fill(t.footer.copyright))} · <a href="#"${prod('/about/')}${enOnlyAttr}>${esc(t.footer.madeBy)}</a></p>
      <p class="footer-legal">${esc(t.footer.appleNotice)}</p>
    </div></div>
  </footer>
</body>
</html>
`;
  // sanity: banned phrases (05 §5.7, 08 §1.1, F11/F16) must not appear in visible copy
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  for (const bad of [/unlimited AI/i, /dark mode/i, /\btheme/i, /no personal data/i, /in your browser/i, /may suit you better/i, /\{wbr\}|\[\[|\]\]/]) {
    if (bad.test(visible)) throw new Error(`banned phrase ${bad} in ${code}`);
  }
  // A18: at most one .kw, inside the h1; no <mark>
  const kws = html.match(/class="kw"/g) || [];
  const h1Html = html.match(/<h1[\s\S]*?<\/h1>/)[0];
  if (kws.length > 1 || (kws.length === 1 && !h1Html.includes('class="kw"')) || /<mark\b/.test(html)) throw new Error(`marker rule (R65) broken in ${code}`);
  // R40: SE H2 starts with the brand
  if (!plain(sb.title).startsWith('SurfEnglish')) throw new Error(`SE H2 must start with SurfEnglish (R40): ${code}`);
  // R76: no link to SE uses the bare domain as its anchor; R81: "Chi Jinlong" never appears in visible text
  for (const a of [sb.linkText, sb.appStoreLinkText, t.sibling.footer.linkText]) if (/^\s*(https?:\/\/)?surfenglish\.app\/?\s*$/i.test(a)) throw new Error(`bare-domain SE anchor (R76) in ${code}: ${a}`);
  if (/Chi Jinlong/i.test(visible)) throw new Error(`"Chi Jinlong" in visible text (R81): ${code}`);
  return html;
}

for (const [code, file] of [['en', 'index.html'], ['ja', 'ja.html']]) {
  const out = render(code);
  writeFileSync(join(PROTO, file), out);
  console.log(`wrote ${file} (${Buffer.byteLength(out)} B)`);
}
