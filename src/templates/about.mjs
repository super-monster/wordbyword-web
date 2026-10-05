// /about/ — product & maker entity page, en only (doc 06 §5.3, doc 08 §5; R39, R40, R81).

import { esc, head, rich, plain } from '../lib/html.mjs';
import { richRefs, appStoreLink, seSite } from '../lib/links.mjs';
import { SIBLING, seMode } from '../data/sibling.mjs';
import { layout } from './layout.mjs';

export function about(ctx) {
  const { t, f, SITE, route } = ctx;
  const a = t.about;
  const refs = richRefs({ SITE, locale: route.locale, seMode: seMode(route.locale) });
  // Placement ⑤ links (doc 06 §8.3): SE site / SE App Store text link (ct=wbw-about) / SE maker.
  const se = seSite(route.locale);
  refs['@se-site'] = { href: se.href, attrs: { hreflang: se.hreflang, 'data-ga-event': 'surfenglish_promo', 'data-ga-label': 'about_site' } };
  refs['@se-appstore'] = { href: appStoreLink(SITE, SIBLING.appStoreId, 'about'), attrs: { 'data-ga-event': 'surfenglish_promo', 'data-ga-label': 'about_appstore' } };
  refs['@appstore'] = { href: appStoreLink(SITE, SITE.appStoreId, 'about'), attrs: { 'data-ga-label': 'about' } };
  const R = (s) => rich(f(s), refs);
  const linkList = (links) => `<ul class="about-links">${links.map((x) => {
    const r = refs[x.ref];
    return `<li>${r ? `<a href="${esc(r.href)}"${Object.entries(r.attrs ?? {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')}>${esc(f(x.text))}</a>` : esc(f(x.text))}</li>`;
  }).join('')}</ul>`;

  const sections = a.sections.map((s) => `
<section class="about-block" id="${esc(s.id)}" aria-labelledby="about-${esc(s.id)}">
  <h2 id="about-${esc(s.id)}" class="h-3">${head(s.title)}</h2>
  <p>${R(s.text)}</p>${s.steps ? `
  <ol class="about-steps">${s.steps.map((x) => `<li>${R(x)}</li>`).join('')}</ol>` : ''}
</section>`).join('');

  const fam = a.family;
  const family = SIBLING.placements.about ? `
<section class="about-block about-family" id="family" aria-labelledby="about-family">
  <h2 id="about-family" class="h-3">${head(fam.title)}</h2>
  <p>${R(fam.text)}</p>
  <div class="table-wrap"><table class="about-table">
    <thead><tr>${fam.table.head.map((h, i) => `<th scope="col"${i === 0 ? ' class="visually-hidden-head"' : ''}>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${fam.table.rows.map((r) => `<tr><th scope="row">${esc(f(r.label))}</th><td>${esc(f(r.wbw))}</td><td>${esc(f(r.se))}</td></tr>`).join('')}</tbody>
  </table></div>
  <p>${R(fam.closing)}</p>
  ${linkList(fam.links)}
</section>` : '';

  const main = `
<article class="about section section--end">
  <div class="container about-layout">
    <header class="about-head">
      <p class="eyebrow">${esc(a.eyebrow)}</p>
      <h1 class="h-display">${head(a.h1)}</h1>
      <p class="lede">${R(a.lede)}</p>
    </header>
    ${sections}
    <section class="about-block" id="facts" aria-labelledby="about-facts">
      <h2 id="about-facts" class="h-3">${head(a.factsTitle)}</h2>
      <dl class="facts-list">${a.facts.map((x) => `<div><dt>${esc(f(x.label))}</dt><dd>${R(x.value)}</dd></div>`).join('')}</dl>
    </section>
    <section class="about-block" id="timeline" aria-labelledby="about-timeline">
      <h2 id="about-timeline" class="h-3">${head(a.timeline.title)}</h2>
      <ol class="timeline">${a.timeline.items.map((x) => `<li><span class="timeline-date">${esc(f(x.date))}</span> <span>${R(x.text)}</span></li>`).join('')}</ol>
    </section>
    <section class="about-block" id="maker" aria-labelledby="about-maker">
      <h2 id="about-maker" class="h-3">${head(a.maker.title)}</h2>
      <p>${R(a.maker.text)}</p>
    </section>${family}
    <section class="about-block" id="disambiguation" aria-labelledby="about-dis">
      <h2 id="about-dis" class="h-3">${head(a.disambiguation.title)}</h2>
      <p>${R(a.disambiguation.text)}</p>
    </section>
    <section class="about-block" id="contact" aria-labelledby="about-contact">
      <h2 id="about-contact" class="h-3">${head(a.contact.title)}</h2>
      <p>${R(a.contact.text)}</p>
    </section>
    <section class="about-block" id="links" aria-labelledby="about-links">
      <h2 id="about-links" class="h-3">${head(a.linksTitle)}</h2>
      ${linkList(a.links)}
      <p class="legal-updated">${esc(f(a.updated))}</p>
    </section>
  </div>
</article>`;

  return layout(ctx, { title: a.meta.title, description: f(a.meta.description), ogAlt: plain(a.meta.title), main });
}
