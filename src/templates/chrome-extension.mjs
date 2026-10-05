// /chrome-extension/ and /zh-hans/chrome-extension/ — M1 skeleton placeholder (doc 06 §5.4, R1, R2).

import { layout } from './layout.mjs';

export function chromeExtension(ctx) {
  return layout(ctx, {
    title: 'WordByWord for Chrome',
    body: '<main><h1>WordByWord for Chrome</h1><p>Placeholder. <a href="/chrome-extension/privacy.html">Privacy</a> · <a href="/">Home</a></p></main>',
  });
}
