// M1-03 spike additions — imported by build.mjs ONLY on the spike/lc branch (never merged into main).
// Adds synthetic fixtures for questions the docs leave open (doc 06 §10.2-2, doc 02 §5.3):
//   1. does _headers join a header that two rules both set?   (/spike-h/* and /spike-h/x/*)
//   2. final Cache-Control on /assets/* when /* sets none       (/assets/spike.txt)
//   3. does CF serve the nearest nested 404.html?                (/spike-404/404.html, /ja/404.html)
//   4. does a preview deployment get X-Robots-Tag by default?   (pages.dev noindex rules removed)

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const put = (dist, rel, data) => { const f = join(dist, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, data); };
const page = (id) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${id}</title></head><body data-page="${id}"><p>${id}</p></body></html>\n`;

export function applySpike(dist) {
  put(dist, 'spike-h/x/index.html', page('spike-h'));
  put(dist, 'assets/spike.txt', 'spike\n');
  put(dist, 'spike-404/404.html', page('spike-nested-404'));
  put(dist, 'ja/404.html', page('spike-ja-404'));

  const headersFile = join(dist, '_headers');
  const headers = readFileSync(headersFile, 'utf8')
    .split('\n\n').filter((block) => !block.includes('.pages.dev/*')).join('\n\n'); // drop our noindex host rules
  writeFileSync(headersFile, `${headers.trimEnd()}\n\n/spike-h/*\n  X-Spike: a\n\n/spike-h/x/*\n  X-Spike: b\n`);
}
