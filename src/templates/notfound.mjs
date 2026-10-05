// 404.html — en only in Phase 1 (R21): noindex, no canonical/hreflang, links to every locale home.

import { esc } from '../lib/html.mjs';
import { layout } from './layout.mjs';

export function notfound(ctx) {
  const homes = ctx.routes.filter((r) => r.page.id === 'home');
  const list = homes.map((r) => `<li><a href="${esc(r.publicUrl)}" lang="${r.locale.hreflang}" hreflang="${r.locale.hreflang}" data-ga-label="404:${r.locale.code}">${esc(r.locale.native)}</a></li>`).join('\n');
  return layout(ctx, {
    title: 'Page not found — WordByWord',
    body: `<main>
<h1>Page not found</h1>
<p>The page you were looking for does not exist. <a href="/">Go to the WordByWord home page</a>.</p>
<ul>
${list}
</ul>
</main>`,
  });
}
