// Locale home page. M1 skeleton placeholder; real sections arrive in M2 (doc 06 §5.2, doc 05, doc 08).

import { esc } from '../lib/html.mjs';
import { layout } from './layout.mjs';

export function home(ctx) {
  const { route, routes } = ctx;
  const homes = routes.filter((r) => r.page.id === 'home');
  const list = homes.map((r) => `<li><a href="${esc(r.publicUrl)}" lang="${r.locale.hreflang}" hreflang="${r.locale.hreflang}">${esc(r.locale.native)}</a></li>`).join('\n');
  return layout(ctx, {
    title: `WordByWord (${route.locale.native}) — new site in progress`,
    body: `<main>
<h1>WordByWord</h1>
<p>New site under construction (skeleton build ${esc(ctx.build.head ?? '')}).</p>
<nav aria-label="Languages"><ul>
${list}
</ul></nav>
<p><a href="/about/">About</a> · <a href="/chrome-extension/">Chrome extension</a> · <a href="/privacy.html">Privacy</a> · <a href="/support.html">Support</a></p>
</main>`,
  });
}
