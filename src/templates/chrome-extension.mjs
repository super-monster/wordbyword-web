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
  // S1: "Add to Chrome" + version line. S0: the status tag sits on the eyebrow line, the CTA falls back to the
  // mailto contact (05 §5.11, §6.4; R2, H12)
  const cta = live
    ? `<a class="btn" href="${esc(SITE.chromeStoreUrl)}" data-ga-event="chrome_store_click" data-ga-label="ext_hero">${esc(c.cta.available)}</a>
       <p class="hero-cta-note">${esc(f(c.status.available))}</p>`
    : `<a class="link-arrow" href="${mail}" data-ga-label="ext_contact">${esc(c.cta.contact)}</a>`;
  const status = live ? '' : ` <span class="tag tag--status">${esc(c.status.unavailable)}</span>`;

  // Window screenshots carry their own Chrome UI: .browser only clips and outlines them (05 §5.11). The hero shot is
  // the page's LCP image — eager with fetchpriority="high" (05 §8.2); it is not repeated in the gallery (A2).
  const shot = (s, opts) => picture(ctx, `ext/common/${s.id}`, { alt: s.alt, cls: 'shot browser', ...opts });
  const heroShot = c.shots.find((s) => s.id === 'hero');
  // "How it works" (05 §6.4): one hairline row per feature with an evidence strip — key cap, title and text beside
  // the excerpt, labelled underneath (05 §5.11 .strip), on the home page's L1 grid (copy cols 1–5 | media 7–12);
  // the features without a strip follow as plain hairline rows (.points)
  const strips = c.features.filter((x) => x.image).map((x) => `
    <li class="feat-l1 ext-row">
      <div class="l1-copy flow">${x.key ? `<p><kbd class="tag tag--key">${esc(x.key)}</kbd></p>` : ''}
        <h3 class="h-4">${head(x.title)}</h3>
        <p class="feat-text">${esc(f(x.text))}</p>
      </div>
      <figure class="l1-media">${picture(ctx, x.image.replace(/^chrome\//, 'ext/common/'), { alt: x.alt ?? '', cls: 'shot strip' })}<figcaption class="media-cap">${esc(c.excerptLabel)}</figcaption></figure>
    </li>`).join('');
  const more = c.features.filter((x) => !x.image).map((x) => `
    <li><div><h3 class="h-4">${head(x.title)}</h3><p class="spec-fact feat-text">${esc(f(x.text))}</p></div></li>`).join('');

  const main = `
<section id="hero" class="hero ext-hero" aria-labelledby="ext-h">
  <div class="container ext-hero-grid flow">
    <div class="ext-hero-head">
      <p class="eyebrow">${esc(c.hero.eyebrow)}${status}</p>
      <h1 id="ext-h">${mk(c.hero.title)}</h1>
    </div>
    <div class="ext-hero-copy flow">
      <p class="lede">${esc(f(c.hero.lede))}</p>
      <div class="cta-row">${cta}</div>
      <p class="platform-note">${esc(f(c.hero.worksWith))}</p>
    </div>
    ${heroShot ? shot(heroShot, { eager: true, sizes: '(min-width: 1200px) 603px, (min-width: 900px) 55vw, calc(100vw - 32px)' }) : ''}
    <p class="rule-note ext-note">${esc(t.footer.notAffiliated)}</p>
  </div>
</section>
<section id="features" class="section" aria-labelledby="ext-how">
  <div class="container">
    <h2 id="ext-how" class="h-sub section-head">${head(c.howTitle)}</h2>
    <ul>${strips}</ul>
    <ul class="points">${more}</ul>
  </div>
</section>
<section id="screenshots" class="section" aria-labelledby="ext-shots">
  <div class="container">
    <h2 id="ext-shots" class="h-sub section-head">${head(c.shotsTitle)}</h2>
    <div class="m-grid">${c.shots.filter((s) => s !== heroShot).map((s) => shot(s, { sizes: '(min-width: 1200px) 512px, (min-width: 900px) 46vw, calc(100vw - 32px)' })).join('')}</div>
    <p class="media-cap">${esc(c.shotsNote)}</p>
  </div>
</section>
<section id="languages" class="section section--band" aria-labelledby="ext-langs">
  <div class="container flow">
    <h2 id="ext-langs" class="h-sub">${head(c.languages.title)}</h2>
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
<section id="ios" class="section section--band" aria-labelledby="ext-ios">
  <div class="container flow">
    <h2 id="ext-ios" class="h-3">${head(c.iosBand.title)}</h2>
    <p class="lede">${esc(f(c.iosBand.text))}</p>
    <p class="cta-row"><a class="link-arrow" href="${localePath(l)}">${esc(c.iosBand.link)}</a><a href="${esc(appStoreLink(SITE, SITE.appStoreId, 'ext'))}" data-ga-label="chrome_ext">App Store</a></p>
    <p class="media-cap"><a href="/chrome-extension/privacy.html"${l.code === 'en' ? '' : ' hreflang="en"'}>${esc(c.privacyLink)}</a></p>
  </div>
</section>`;

  return layout(ctx, { title: c.meta.title, description: f(c.meta.description), ogAlt: c.meta.ogImageAlt, main });
}
