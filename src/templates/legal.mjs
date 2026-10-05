// Shared shell for the three contract pages (doc 06 §5.5). Body = src/legal/<doc>.html verbatim.

import { readFileSync } from 'node:fs';
import { esc } from '../lib/html.mjs';
import { layout } from './layout.mjs';

const TITLES = { privacy: 'Privacy Policy', support: 'Support', 'extension-privacy': 'Privacy Policy — WordByWord Chrome Extension' };

export function legal(ctx) {
  const { page } = ctx.route;
  const source = readFileSync(page.contract.source, 'utf8');
  const updated = page.updated();
  const body = source.replace(/^<!--[\s\S]*?-->\n/gm, '').trim();
  return layout(ctx, {
    title: `${TITLES[page.doc]} — WordByWord`,
    body: `<main>
<h1>${esc(TITLES[page.doc])}</h1>
<p><small>Last updated: <time datetime="${updated}">${updated}</time></small></p>
${body}
<p><a href="/">WordByWord home</a></p>
</main>`,
  });
}
