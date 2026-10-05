// 404.html — en only in Phase 1 (R21): noindex, no canonical/hreflang, links to every locale home.

import { esc } from '../lib/html.mjs';
import { localePath } from '../lib/links.mjs';
import { layout } from './layout.mjs';

export function notfound(ctx) {
  const n = ctx.t.notfound;
  const list = ctx.locales.map((L) => `<li><a href="${localePath(L)}" lang="${L.hreflang}" hreflang="${L.hreflang}"${L.dir === 'rtl' ? ' dir="rtl"' : ''} data-ga-event="language_switch" data-ga-label="404:${L.code}">${esc(L.native)}</a></li>`).join('');
  return layout(ctx, {
    title: `${n.title} — WordByWord`,
    description: n.text,
    main: `
<section class="section section--end notfound" aria-labelledby="nf-h">
  <div class="container">
    <h1 id="nf-h">${esc(n.title)}</h1>
    <p class="lede">${esc(n.text)} <a href="/">${esc(n.home)}</a></p>
    <h2 class="footer-heading">${esc(n.languages)}</h2>
    <ul class="lang-list">${list}</ul>
  </div>
</section>`,
  });
}
