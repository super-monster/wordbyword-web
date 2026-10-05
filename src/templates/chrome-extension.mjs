// /chrome-extension/ and /zh-hans/chrome-extension/ (doc 06 §5.4; R1, R2, R16, R45).
// S0 (no SITE.chromeStoreUrl): noindex, status label + mailto instead of a store button — never link to the
// store home or search (F20, F27). S1: "Add to Chrome" → listing.

import { esc, mk, head, rich, plain } from '../lib/html.mjs';
import { richRefs, appStoreLink, localePath } from '../lib/links.mjs';
import { seMode } from '../data/sibling.mjs';
import { layout } from './layout.mjs';
import { picture } from './partials/picture.mjs';

export function chromeExtension(ctx) {
  const { t, f, SITE, route } = ctx;
  const c = t.chromeExtension;
  const l = route.locale;
  const live = Boolean(SITE.chromeStoreUrl);
  const refs = richRefs({ SITE, locale: l, seMode: seMode(l) });
  const R = (s) => rich(f(s), refs);
  const mail = `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(c.cta.contactSubject)}`;
  const cta = live
    ? `<a class="btn" href="${esc(SITE.chromeStoreUrl)}" data-ga-event="chrome_store_click" data-ga-label="ext_hero">${esc(c.cta.available)}</a>
       <p class="ext-status">${esc(f(c.status.available))}</p>`
    : `<p class="ext-status ext-status--soon"><span class="tag tag--note">${esc(c.status.unavailable)}</span></p>
       <p><a href="${mail}" data-ga-label="ext_contact">${esc(c.cta.contact)}</a></p>`;

  const features = c.features.map((x) => `
    <li class="ext-feature">
      ${x.key ? `<p class="spec-label"><kbd>${esc(x.key)}</kbd></p>` : ''}
      <h3 class="h-4">${head(x.title)}</h3>
      <p>${esc(f(x.text))}</p>
      ${x.image ? picture(ctx, x.image, { alt: x.alt ?? '', sizes: '(min-width: 900px) 520px, calc(100vw - 32px)', cls: 'ext-shot' }) : ''}
    </li>`).join('');

  const main = `
<section id="hero" class="hero ext-hero" aria-labelledby="ext-h">
  <div class="container">
    <p class="eyebrow">${esc(c.hero.eyebrow)}</p>
    <h1 id="ext-h" class="h-display">${mk(c.hero.title)}</h1>
    <p class="lede">${esc(f(c.hero.lede))}</p>
    <div class="cta-row">${cta}</div>
    <p class="platform-note">${esc(f(c.hero.worksWith))}</p>
  </div>
</section>
<section id="how" class="section" aria-labelledby="ext-how">
  <div class="container">
    <h2 id="ext-how">${head(c.howTitle)}</h2>
    <ul class="spec ext-features">${features}</ul>
  </div>
</section>
<section id="screenshots" class="section" aria-labelledby="ext-shots">
  <div class="container">
    <h2 id="ext-shots" class="h-sub">${head(c.shotsTitle)}</h2>
    <div class="ext-gallery">${c.shots.map((s) => picture(ctx, `shot/ext/${s.id}`, { alt: s.alt, sizes: '(min-width: 900px) 560px, calc(100vw - 32px)' })).join('')}</div>
    <p class="media-cap">${esc(c.shotsNote)}</p>
  </div>
</section>
<section id="languages" class="section section--band" aria-labelledby="ext-langs">
  <div class="container">
    <h2 id="ext-langs" class="h-3">${head(c.languages.title)}</h2>
    <p class="lede">${esc(f(c.languages.text))}</p>
  </div>
</section>
<section id="faq" class="section section--end" aria-labelledby="ext-faq">
  <div class="container faq-layout">
    <div class="faq-head"><h2 id="ext-faq" class="h-sub">${head(c.faqTitle)}</h2></div>
    <div class="faq-list">${c.faq.map((q, i) => `
      <details class="faq-item" id="faq-${esc(q.id)}" data-faq-id="ext-${esc(q.id)}"${i === 0 ? ' open' : ''}><summary><span class="faq-q">${esc(f(q.q))}</span></summary><div class="faq-a"><p>${R(q.a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>
<section id="ios" class="section section--band final-cta" aria-labelledby="ext-ios">
  <div class="container">
    <h2 id="ext-ios" class="h-3">${head(c.iosBand.title)}</h2>
    <p class="lede">${esc(f(c.iosBand.text))}</p>
    <p><a class="link-arrow" href="${localePath(l)}">${esc(c.iosBand.link)}</a> · <a href="${esc(appStoreLink(SITE, SITE.appStoreId, 'ext'))}" data-ga-label="chrome_ext">App Store</a></p>
    <p class="legal-updated"><a href="/chrome-extension/privacy.html"${l.code === 'en' ? '' : ' hreflang="en"'}>${esc(c.privacyLink)}</a> · ${esc(t.footer.notAffiliated)}</p>
  </div>
</section>`;

  return layout(ctx, { title: c.meta.title, description: f(c.meta.description), ogAlt: c.meta.ogImageAlt, main });
}
