// SurfEnglish recommendation placements (doc 04, doc 06 §5.7; R40–R45): ① card · ② FAQ (faq.mjs) ·
// ④ footer (layout.mjs) · ⑤ about family section (about.mjs) · ⑦ strip under the hero, pointing at ①
// (⑥ is the backlink on the SurfEnglish site, outside this repo).
// No placement ③ (R42), no SE badge (R43).

import { esc, head, rich } from '../../lib/html.mjs';
import { SIBLING, seMode } from '../../data/sibling.mjs';
import { appStoreLink, seSite } from '../../lib/links.mjs';
import { picture, icon } from './picture.mjs';

export function cardVisible(ctx) {
  const noticeOn = ctx.notice?.enabled && SIBLING.suppressWhenNotice;
  return SIBLING.enabled && SIBLING.placements.card && seMode(ctx.route.locale) !== 'no-card' && !noticeOn;
}

export function siblingCard(ctx) {
  if (!cardVisible(ctx)) return '';
  const { t, SITE, route } = ctx;
  const sb = t.sibling.card;
  const se = seSite(route.locale);
  const mode = seMode(route.locale);
  const note = mode === 'en-site' && sb.uiNote ? sb.uiNote : sb.note;
  return `
<aside class="sibling" id="surfenglish" aria-labelledby="se-h" data-ga-view="surfenglish_promo_view" data-ga-label="card">
  <div class="container">
    <div class="sibling__inner">
      <div class="sibling__text">
        <p class="sibling__eyebrow">${icon(ctx, 'se/common/icon', 32, { cls: 'sibling__icon' })}<span>${esc(sb.eyebrow)}</span></p>
        <h2 id="se-h" class="h-3">${head(sb.title)}</h2>
        <p class="sibling__body">${esc(ctx.f(sb.body))}</p>
        <ul class="sibling__points">${sb.points.map((p) => `<li>${esc(ctx.f(p))}</li>`).join('')}</ul>
        <p class="sibling__note">${esc(ctx.f(note))}</p>
        <p class="sibling__actions">
          <a class="sibling__store" href="${esc(appStoreLink(SITE, SIBLING.appStoreId, 'card'))}" data-ga-event="surfenglish_promo" data-ga-label="card_appstore">${esc(sb.appStoreLinkText)}<span aria-hidden="true">&#160;${route.locale.dir === 'rtl' ? '←' : '→'}</span></a>
          <a class="sibling__link" href="${esc(se.href)}" hreflang="${se.hreflang}" data-ga-event="surfenglish_promo" data-ga-label="card_site">${esc(sb.linkText)}</a>
        </p>
      </div>
      <figure class="sibling__window">
        ${picture(ctx, SIBLING.cardImage, { alt: sb.shotAlt })}
        <figcaption>${esc(sb.shotCaption)}</figcaption>
      </figure>
    </div>
  </div>
</aside>`;
}

// ⑦ (2026-10-17): one neutral line right under the hero's mosaic edge. It only scrolls to ① — no App Store link, no
// badge, not sticky — so it shows exactly where the card does (same notice and seMode rules).
export function siblingStrip(ctx) {
  if (!SIBLING.placements.strip || !cardVisible(ctx)) return '';
  const st = ctx.t.sibling.strip;
  return `
<aside class="se-strip" id="se-strip" aria-label="${esc(SIBLING.name)}" data-ga-view="surfenglish_promo_view" data-ga-label="strip">
  <div class="container">
    <a class="se-strip__link" href="#surfenglish" data-ga-event="surfenglish_promo" data-ga-label="strip">${icon(ctx, 'se/common/icon', 28, { cls: 'se-strip__icon' })}<span class="se-strip__text">${rich(ctx.f(st.text), {})}</span><span class="se-strip__cta">${esc(st.cta)}<span aria-hidden="true">&#160;↓</span></span></a>
  </div>
</aside>`;
}
