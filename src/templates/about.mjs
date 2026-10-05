// /about/ — M1 skeleton placeholder (doc 06 §5.3; copy from doc 08 §5).

import { layout } from './layout.mjs';

export function about(ctx) {
  return layout(ctx, {
    title: 'About WordByWord',
    body: '<main><h1>About WordByWord</h1><p>Placeholder. <a href="/">Home</a></p></main>',
  });
}
