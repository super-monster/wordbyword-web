// Page shell (doc 06 §5.1): <head> SEO block, header with language switcher, notice slot, footer.

import { esc, plain } from '../lib/html.mjs';
import { wu } from '../lib/text-length.mjs';
import { localePath, appStoreLink, seSite } from '../lib/links.mjs';
import { jsonld } from './partials/jsonld.mjs';
import { icon } from './partials/picture.mjs';
import { SVG } from './partials/brand.mjs';
import { SIBLING } from '../data/sibling.mjs';

// ———————————————————————————— <head> (doc 06 §5.1.1) ————————————————————————————

function head(ctx, { title, description, ogTitle, ogDescription, ogAlt }) {
  const { SITE, route, absUrl, assets } = ctx;
  const l = route.locale;
  const robots = route.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow';
  const url = absUrl(route.publicUrl);
  const cluster = ctx.alternates;
  const ogAlternates = [...new Set(ctx.routes
    .filter((r) => r.page.id === route.page.id && r.indexable && r.locale.code !== l.code).map((r) => r.locale.og))];
  const og = ctx.og;
  const isRoot = route.page.id === 'home' && l.code === 'en';
  const banner = SITE.smartBanner ? `<meta name="apple-itunes-app" content="app-id=${SITE.appStoreId}${SITE.pt ? `, affiliate-data=pt=${SITE.pt}&amp;ct=wbw-sab` : ''}">\n` : '';
  const consent = SITE.consentMode === 'off' ? ''
    : "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});";
  const verify = isRoot ? Object.entries({ 'google-site-verification': SITE.verification.google, 'msvalidate.01': SITE.verification.bing,
    'yandex-verification': SITE.verification.yandex, 'naver-site-verification': SITE.verification.naver })
    .filter(([, v]) => v).map(([n, v]) => `<meta name="${n}" content="${esc(v)}">\n`).join('') : '';

  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(plain(title))}</title>
<meta name="description" content="${esc(plain(description))}">
<meta http-equiv="content-language" content="${l.contentLanguage}">
<meta name="robots" content="${robots}">
${route.indexable ? `<link rel="canonical" href="${esc(url)}">\n` : ''}${cluster.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}">\n`).join('')}<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(plain(ogTitle ?? title))}">
<meta property="og:description" content="${esc(plain(ogDescription ?? description))}">
<meta property="og:url" content="${esc(url)}">
${og ? `<meta property="og:image" content="${esc(absUrl(og.url))}">
<meta property="og:image:width" content="${og.w}">
<meta property="og:image:height" content="${og.h}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="${esc(plain(ogAlt ?? ''))}">
` : ''}<meta property="og:locale" content="${l.og}">
${ogAlternates.map((o) => `<meta property="og:locale:alternate" content="${o}">\n`).join('')}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="${SITE.xHandle}">
${banner}<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${SITE.themeColor.light}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${SITE.themeColor.dark}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" href="/icons/favicon-32.png" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" href="/icons/favicon-32-dark.png" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="${assets.css}">
<script defer src="${assets.js}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}${consent}gtag('js',new Date());gtag('config','${SITE.gaId}',{content_group:'${route.page.contentGroup}',page_locale:'${l.code}'});</script>
${jsonld(ctx)}
${verify}</head>`;
}

// ———————————————————————————— language links ————————————————————————————

// Target = the same page in that language when it exists, otherwise that language's home (doc 02 §7.2).
function langLinks(ctx, where) {
  const { route, routes } = ctx;
  return ctx.locales.map((L) => {
    const same = routes.find((r) => r.page.id === route.page.id && r.locale.code === L.code && !r.page.file);
    const href = same ? same.publicUrl : localePath(L);
    const current = L.code === route.locale.code;
    return `<li><a href="${esc(href)}" hreflang="${L.hreflang}" lang="${L.hreflang}"${L.dir === 'rtl' ? ' dir="rtl"' : ''}${current ? ' aria-current="page"' : ''} data-ga-event="language_switch" data-ga-label="${where}:${L.code}">${esc(L.native)}</a></li>`;
  }).join('');
}

// ———————————————————————————— header (doc 06 §5.1.2, R16) ————————————————————————————

function header(ctx) {
  const { t, route, SITE } = ctx;
  const l = route.locale;
  const home = localePath(l);
  const onHome = route.page.id === 'home';
  const anchor = (id) => (onHome ? `#${id}` : `${home}#${id}`);
  const extHref = l.code === 'zh-Hans' ? '/zh-hans/chrome-extension/' : '/chrome-extension/';
  const extLang = l.code === 'en' || l.code === 'zh-Hans' ? '' : ' hreflang="en"';
  // Extension pages (doc 02 §3.5, §7.1): iPhone app → home, the page's own #features / #faq; the main button is
  // "Add to Chrome" in S1 and, in S0, the WBW App Store link labelled as the iPhone app (ct=wbw-ext, R55).
  const onExt = route.page.id === 'chrome-extension';
  const navItems = onExt
    ? `<li><a href="${home}">${esc(t.nav.iphoneApp)}</a></li><li><a href="#features">${esc(t.nav.features)}</a></li><li><a href="#faq">${esc(t.nav.faq)}</a></li>`
    : `<li><a href="${anchor('features')}">${esc(t.nav.features)}</a></li><li><a href="${anchor('languages')}">${esc(t.nav.languages)}</a></li><li><a href="${anchor('pricing')}">${esc(t.nav.pricing)}</a></li><li><a href="${anchor('faq')}">${esc(t.nav.faq)}</a></li>${SITE.chromeStoreUrl ? `<li><a href="${extHref}"${extLang}>${esc(t.nav.chromeExtension)}</a></li>` : ''}`;
  // < 560 the button shows its short label (R77, 05 §5.1; on the extension page nav.iphoneApp, else the long label
  // crowds the brand at 375). The visible text is the accessible name (WCAG 2.5.3): CSS shows one of the two spans.
  const label = (long, short) => (short && short !== long
    ? `<span class="dl-long">${esc(long)}</span><span class="dl-short">${esc(short)}</span>` : esc(long));
  const mainButton = !onExt
    ? `<a class="btn btn-small" href="${esc(appStoreLink(SITE, SITE.appStoreId, 'header'))}" data-ga-label="header">${label(t.nav.download, t.nav.downloadShort)}</a>`
    : SITE.chromeStoreUrl
      ? `<a class="btn btn-small" href="${esc(SITE.chromeStoreUrl)}" data-ga-event="chrome_store_click" data-ga-label="ext_header">${esc(t.chromeExtension.cta.available)}</a>`
      : `<a class="btn btn-small" href="${esc(appStoreLink(SITE, SITE.appStoreId, 'ext'))}" data-ga-label="chrome_ext">${label(t.chromeExtension.cta.iosApp, t.nav.iphoneApp)}</a>`;
  // a page that exists in one language only says so at the top of the menu (doc 02 §7.2)
  const versions = ctx.routes.filter((r) => r.page.id === route.page.id && !r.page.file).length;
  const langNote = versions === 1 && t.common.langFallbackNote ? `<p class="lang-note">${esc(t.common.langFallbackNote)}</p>` : '';
  return `<div class="header-sentinel" aria-hidden="true"></div>
<header class="site-header">
  <div class="container header-inner">
    ${brandLink(ctx, false)}
    <nav class="main-nav" aria-label="${esc(t.nav.ariaMain)}"><ul>${navItems}</ul></nav>
    <div class="header-tools">
      <details class="lang-switch">
        <summary aria-label="${esc(t.common.languageLabel)}: ${esc(l.native)}">${SVG.globe}<span class="lang-current" lang="${l.hreflang}">${esc(l.native)}</span>${SVG.chevron}</summary>
        <nav class="lang-menu" aria-label="${esc(t.nav.ariaLanguages)}">${langNote}<ul>${langLinks(ctx, 'header')}</ul></nav>
      </details>
      ${mainButton}
      <details class="nav-menu">
        <summary aria-label="${esc(t.common.menu)}">${SVG.menu}</summary>
        <nav class="nav-menu-panel" aria-label="${esc(t.nav.ariaMain)}"><ul>${navItems}</ul></nav>
      </details>
    </div>
  </div>
</header>`;
}

function brandLink(ctx, lazy) {
  return `<a class="brand" href="${localePath(ctx.route.locale)}">${icon(ctx, 'brand/common/icon', 28, { alt: 'WordByWord', cls: 'brand-icon', lazy })}<span class="brand-name" aria-hidden="true">WordByWord</span></a>`;
}

// ———————————————————————————— notice (doc 06 §8.5, doc 05 §5.15) ————————————————————————————

// The message shows at most 2 lines (05 §5.15); longer ones fold into <details> under the title. Without JS the
// fold cannot follow the viewport, so the build measures against the narrowest layout: two 15px lines at a 375px
// phone ≈ 2 × 43 width units (wu: Latin 1, CJK 2 ≈ 7.5px each).
const NOTICE_FOLD_WU = 86;

function notice(ctx) {
  const n = ctx.notice;
  if (!n?.enabled || !ctx.route.page.notice) return '';
  if (n.pages === 'home' && ctx.route.page.id !== 'home') return '';
  const copy = n.copy[ctx.route.locale.code] ?? n.copy.en;
  const l = ctx.route.locale;
  const body = wu(copy.message) > NOTICE_FOLD_WU
    ? `<details class="site-notice__more"><summary class="site-notice__title">${esc(copy.title)}</summary><p class="site-notice__message">${esc(copy.message)}</p></details>`
    : `<p class="site-notice__title">${esc(copy.title)}</p><p class="site-notice__message">${esc(copy.message)}</p>`;
  return `<div class="site-notice site-notice--${esc(n.level)}" role="status" data-nosnippet lang="${l.hreflang}" dir="${l.dir}">
  <div class="container"><div class="site-notice__body"><p class="site-notice__eyebrow">${esc(copy.eyebrow)}</p>${body}</div></div>
</div>`;
}

// ———————————————————————————— footer (doc 06 §5.1.2, doc 02 §7.3) ————————————————————————————

function footer(ctx) {
  const { t, SITE, route } = ctx;
  const l = route.locale;
  const home = localePath(l);
  const enOnly = l.code === 'en' ? '' : ' hreflang="en"';
  const extHref = l.code === 'zh-Hans' ? '/zh-hans/chrome-extension/' : '/chrome-extension/';
  const extLang = l.code === 'en' || l.code === 'zh-Hans' ? '' : ' hreflang="en"';
  const se = seSite(l);
  const family = SIBLING.placements.footer ? `
      <div class="family">
        <h2 class="footer-heading">${esc(t.sibling.footer.heading)}</h2>
        <a class="family-link" href="${esc(se.href)}" hreflang="${se.hreflang}" data-ga-event="surfenglish_promo" data-ga-label="footer_site">
          <span class="family-mark" aria-hidden="true">${icon(ctx, 'brand/common/icon', 32)}<i class="family-line"></i>${icon(ctx, 'se/common/icon', 32)}</span>
          <span>${esc(t.sibling.footer.linkText)}</span></a>
      </div>` : '';
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      ${brandLink(ctx, true)}
      <p class="footer-tagline">${esc(t.footer.tagline)}</p>${family}
    </div>
    <nav class="footer-links" aria-label="${esc(t.footer.ariaNav)}">
      <div>
        <h2 class="footer-heading">${esc(t.footer.product)}</h2>
        <ul>
          <li><a href="${esc(appStoreLink(SITE, SITE.appStoreId, 'footer'))}" data-ga-label="footer">${esc(t.footer.iosApp)}</a></li>
          <li><a href="${extHref}"${extLang}>${esc(t.footer.chromeExtension)}</a></li>
          <li><a href="/about/"${enOnly}>${esc(t.footer.about)}</a></li>
          <li><a href="${home}#faq">${esc(t.footer.faq)}</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-heading">${esc(t.footer.help)}</h2>
        <ul>
          <li><a href="/support.html"${enOnly}>${esc(t.footer.support)}</a></li>
          <li><a href="/privacy.html"${enOnly}>${esc(t.footer.privacy)}</a></li>
          <li><a href="mailto:${SITE.supportEmail}">${esc(t.footer.contact)}</a></li>
        </ul>
      </div>
    </nav>
    <nav class="footer-langs" aria-labelledby="footer-langs-h">
      <h2 class="footer-heading" id="footer-langs-h">${esc(t.footer.languagesTitle)}</h2>
      <ul class="lang-list">${langLinks(ctx, 'footer')}</ul>
    </nav>
  </div>
  <div class="container"><div class="footer-bottom">
    <p>${esc(ctx.f(t.footer.copyright))} · <a href="/about/"${enOnly}>${esc(t.footer.madeBy)}</a></p>
    <p class="footer-legal">${esc(t.footer.appleNotice)}</p>
  </div></div>
</footer>`;
}

// ———————————————————————————— shell ————————————————————————————

export function layout(ctx, { title, description, ogTitle, ogDescription, ogAlt, main }) {
  const l = ctx.route.locale;
  return `<!doctype html>
<html lang="${l.hreflang}" dir="${l.dir}" data-script="${l.script}" data-page="${esc(ctx.route.page.id)}">
${head(ctx, { title, description, ogTitle, ogDescription, ogAlt })}
<body data-page="${esc(ctx.route.page.id)}">
<a class="skip" href="#main">${esc(ctx.t.common.skipToContent)}</a>
${notice(ctx)}
${header(ctx)}
<main id="main">
${main}
</main>
${footer(ctx)}
</body>
</html>
`;
}
