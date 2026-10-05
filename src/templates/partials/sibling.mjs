// SurfEnglish recommendation placements (doc 04, doc 06 §5.7; R40–R45): ① card · ② FAQ (faq.mjs) ·
// ④ footer (layout.mjs) · ⑤ about family section (about.mjs). No placement ③ (R42), no SE badge (R43).

import { esc, head } from '../../lib/html.mjs';
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
  const levels = String(ctx.product.se.levels);
  return `
<aside class="sibling" id="surfenglish" aria-labelledby="se-h" data-ga-view="surfenglish_promo_view" data-ga-label="card">
  <div class="container">
    <div class="sibling__inner">
      <div class="sibling__text">
        <p class="sibling__eyebrow">${icon(ctx, 'se/common/icon', 32, { cls: 'sibling__icon' })}<span>${esc(sb.eyebrow)}</span></p>
        <h2 id="se-h" class="h-3">${head(sb.title)}</h2>
        <p class="sibling__body">${esc(ctx.f(sb.body))}</p>
        <ul class="sibling__points">${sb.points.map((p) => `<li>${esc(ctx.f(p)).replace(levels, `<bdi>${levels}</bdi>`)}</li>`).join('')}</ul>
        <p class="sibling__note">${esc(ctx.f(note))}</p>
        <p class="sibling__actions">
          <a class="sibling__store" href="${esc(appStoreLink(SITE, SIBLING.appStoreId, 'card'))}" data-ga-event="surfenglish_promo" data-ga-label="card_appstore">${esc(sb.appStoreLinkText)}<span aria-hidden="true">&#160;→</span></a>
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
