// Contract pages: /privacy.html, /support.html, /chrome-extension/privacy.html (doc 06 §5.5).
// Body = src/legal/<doc>.html (verbatim); "Last updated" comes only from its first-line comment (ENG-14).

import { readFileSync } from 'node:fs';
import { esc } from '../lib/html.mjs';
import { layout } from './layout.mjs';

// Title and description are copy (en.json legal.*, keyed by the camel-cased contract id); the body stays verbatim.
const KEY = { privacy: 'privacy', support: 'support', 'extension-privacy': 'extensionPrivacy' };

export function legal(ctx) {
  const { page } = ctx.route;
  const source = readFileSync(page.contract.source, 'utf8');
  const updated = page.updated();
  const body = source.replace(/^<!--[\s\S]*?-->\n/gm, '').trim();
  const { title, description } = ctx.t.legal[KEY[page.doc]];
  return layout(ctx, {
    title: `${title} — WordByWord`,
    description,
    main: `
<article class="legal" data-legal="${esc(page.doc)}">
  <div class="container">
    <h1>${esc(title)}</h1>
    <p class="legal-updated">${esc(ctx.t.common.lastUpdated)} <time datetime="${updated}">${esc(ctx.dateLong(updated))}</time></p>
    <div class="legal-body">
${body}
    </div>
  </div>
</article>`,
  });
}
