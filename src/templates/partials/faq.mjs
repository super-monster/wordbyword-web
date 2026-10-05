// FAQ (doc 06 §5.7): native <details>, rich answers, no FAQPage JSON-LD (R5).
// "devices" switches to aExtLive in state S1 (R45); "english-learner" is placement ② and obeys SIBLING (zh-Hans
// appends sibling.availability, R42).

import { esc, rich } from '../../lib/html.mjs';
import { SIBLING, seMode } from '../../data/sibling.mjs';
import { richRefs } from '../../lib/links.mjs';

export function faqItems(ctx, items, { openFirst = true } = {}) {
  const { SITE, route, t } = ctx;
  const refs = richRefs({ SITE, locale: route.locale, seMode: seMode(route.locale) });
  return items.filter((q) => !q.hidden)
    .filter((q) => q.id !== 'english-learner' || (SIBLING.enabled && SIBLING.placements.faq))
    .map((q, i) => {
      let answer = SITE.chromeStoreUrl && q.aExtLive ? q.aExtLive : q.a;
      if (q.id === 'english-learner' && seMode(route.locale) === 'no-card' && t.sibling?.availability) answer += ` ${t.sibling.availability}`;
      return `
<details class="faq-item" id="faq-${esc(q.id)}" data-faq-id="${esc(q.id)}"${openFirst && i === 0 ? ' open' : ''}><summary><span class="faq-q">${esc(ctx.f(q.q))}</span></summary><div class="faq-a"><p>${rich(ctx.f(answer), refs)}</p></div></details>`;
    }).join('');
}
