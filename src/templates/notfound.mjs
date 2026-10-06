// 404.html — en only in Phase 1 (R21): noindex, no canonical/hreflang, links to every locale home.
// Doc 05 §6.7: the page is itself a bilingual sample — the English sentence set in the serif "original", its
// translations under the red bar (the FAQ answers' .faq-a: the same "translation" motif), each line with its own
// lang; then Home, the language grid and a 96px mosaic (hidden < 560).

import { esc } from '../lib/html.mjs';
import { localePath } from '../lib/links.mjs';
import { layout } from './layout.mjs';
import { mosaicSquare } from './partials/brand.mjs';

// The three translated lines of the 05 §6.7 wireframe, in its order; a locale shows once it is published.
const SAMPLE = ['ja', 'zh-Hans', 'es'];

export function notfound(ctx) {
  const n = ctx.t.notfound;
  const list = ctx.locales.map((L) => `<li><a href="${localePath(L)}" lang="${L.hreflang}" hreflang="${L.hreflang}"${L.dir === 'rtl' ? ' dir="rtl"' : ''} data-ga-event="language_switch" data-ga-label="404:${L.code}">${esc(L.native)}</a></li>`).join('');
  const lines = SAMPLE.map((code) => ctx.locales.find((L) => L.code === code))
    .filter((L) => L && ctx.strings[L.code]?.notfound?.title)
    .map((L) => `<p lang="${L.hreflang}"${L.dir === 'rtl' ? ' dir="rtl"' : ''}>${esc(ctx.strings[L.code].notfound.title)}</p>`).join('');
  return layout(ctx, {
    title: `${n.title} — WordByWord`,
    description: n.text,
    main: `
<section class="section section--end nf" aria-labelledby="nf-h">
  <div class="container flow">
    <h1 id="nf-h">${esc(n.title)}</h1>${lines ? `
    <div class="faq-a nf-tr">${lines}</div>` : ''}
    <p class="lede">${esc(n.text)}</p>
    <p><a class="btn" href="/">${esc(n.home)}</a></p>
    <h2 class="footer-heading">${esc(n.languages)}</h2>
    <ul class="lang-list">${list}</ul>
    ${mosaicSquare('nf-mosaic', 96)}
  </div>
</section>`,
  });
}
