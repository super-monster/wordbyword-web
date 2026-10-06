// /about/ — product & maker entity page, en only (doc 06 §5.3, doc 08 §5; R39, R40, R81).

import { esc, head, rich, plain } from '../lib/html.mjs';
import { richRefs, appStoreLink, seSite } from '../lib/links.mjs';
import { SIBLING, seMode } from '../data/sibling.mjs';
import { layout } from './layout.mjs';
import { icon } from './partials/picture.mjs';

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

  // "How it works": the numbered steps first, then the English-page add-on (doc 08 §5.1); numbered rows as on the
  // home page (.points, 05 §1.4 R10)
  const sections = a.sections.map((s) => `
<section class="about-block flow" id="${esc(s.id)}" aria-labelledby="about-${esc(s.id)}">
  <h2 id="about-${esc(s.id)}" class="h-3">${head(s.title)}</h2>${s.steps ? `
  <ol class="points">${s.steps.map((x, i) => `<li><span class="points-n" aria-hidden="true">0${i + 1}</span><span>${R(x)}</span></li>`).join('')}</ol>` : ''}
  <p>${R(s.text)}</p>
</section>`).join('');

  // Family module (05 §6.3): the two icons joined by a hairline, the relation, SE text links — never an SE badge (R43)
  const fam = a.family;
  const family = SIBLING.placements.about ? `
<section class="about-block flow" id="family" aria-labelledby="about-family">
  <span class="family-mark" aria-hidden="true">${icon(ctx, 'brand/common/icon', 32)}<i class="family-line"></i>${icon(ctx, 'se/common/icon', 32)}</span>
  <h2 id="about-family" class="h-3">${head(fam.title)}</h2>
  <p>${R(fam.text)}</p>
  <div class="table-wrap"><table class="quota quota--text about-table">
    <thead><tr>${fam.table.head.map((h) => (h ? `<th scope="col">${esc(h)}</th>` : '<td></td>')).join('')}</tr></thead>
    <tbody>${fam.table.rows.map((r) => `<tr><th scope="row">${esc(f(r.label))}</th><td>${esc(f(r.wbw))}</td><td>${esc(f(r.se))}</td></tr>`).join('')}</tbody>
  </table></div>
  <p>${R(fam.closing)}</p>
  ${linkList(fam.links)}
</section>` : '';

  // No visible breadcrumb in Phase 1 (doc 02 §7.4; 05 §6.3 draws one). The disambiguation note follows the lede: on
  // phones it is the "not affiliated" slip under the lede, from 1200px the 240px margin rail beside it (05 §6.3, R15).
  const main = `
<article class="about section section--end">
  <div class="container about-layout">
    <header class="about-head flow">
      <p class="eyebrow">${esc(a.eyebrow)}</p>
      <h1>${head(a.h1)}</h1>
      <p class="lede">${R(a.lede)}</p>
    </header>
    <aside class="about-block flow rule-note about-note" id="disambiguation" aria-labelledby="about-dis">
      <h2 id="about-dis" class="footer-heading">${head(a.disambiguation.title)}</h2>
      <p>${R(a.disambiguation.text)}</p>
    </aside>${sections}
    <section class="about-block flow" id="facts" aria-labelledby="about-facts">
      <h2 id="about-facts" class="h-3">${head(a.factsTitle)}</h2>
      <div class="table-wrap"><table class="quota quota--text about-facts">
        <tbody>${a.facts.map((x) => `<tr><th scope="row">${esc(f(x.label))}</th><td>${R(x.value)}</td></tr>`).join('')}</tbody>
      </table></div>
    </section>
    <section class="about-block flow" id="timeline" aria-labelledby="about-timeline">
      <h2 id="about-timeline" class="h-3">${head(a.timeline.title)}</h2>
      <ol class="points timeline">${a.timeline.items.map((x) => `<li><span class="points-n timeline-date">${esc(f(x.date))}</span> <span>${R(x.text)}</span></li>`).join('')}</ol>
    </section>
    <section class="about-block flow" id="maker" aria-labelledby="about-maker">
      <h2 id="about-maker" class="h-3">${head(a.maker.title)}</h2>
      <p>${R(a.maker.text)}</p>
    </section>${family}
    <section class="about-block flow" id="contact" aria-labelledby="about-contact">
      <h2 id="about-contact" class="h-3">${head(a.contact.title)}</h2>
      <p>${R(a.contact.text)}</p>
    </section>
    <section class="about-block flow" id="links" aria-labelledby="about-links">
      <h2 id="about-links" class="h-3">${head(a.linksTitle)}</h2>
      ${linkList(a.links)}
      <p class="media-cap">${esc(f(a.updated))}</p>
    </section>
  </div>
</article>`;

  return layout(ctx, { title: a.meta.title, description: f(a.meta.description), ogAlt: a.meta.ogImageAlt ?? plain(a.meta.title), main });
}
