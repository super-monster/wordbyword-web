// CSS minification of the bundle (src/lib/assets.mjs, D-18): only whitespace that cannot change the meaning goes.
// Run: npm test   (node --test scripts/tests/*.test.mjs, one process per file)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minifyCss } from '../../src/lib/assets.mjs';

test('minifyCss keeps descendant combinators, calc spacing, strings and url()', () => {
  const css = `/* c */\nhtml[data-script="cjk"] :is(h1, h2) { word-break: keep-all; }\n.a::before { content: " / "; }
.b { top: calc(10px + var(--y) * 739.2px - 14px); background: url("x y.svg") no-repeat; }
@media (min-width: 900px) {\n  .c, .d > .e { margin: 0 auto; }\n}\n.f { font-family: "SF Pro", system-ui; }`;
  assert.equal(minifyCss(css),
    'html[data-script="cjk"] :is(h1,h2){word-break:keep-all}.a::before{content:" / "}'
    + '.b{top:calc(10px + var(--y) * 739.2px - 14px);background:url("x y.svg") no-repeat}'
    + '@media (min-width:900px){.c,.d > .e{margin:0 auto}}.f{font-family:"SF Pro",system-ui}\n');
});

test('minifyCss leaves semicolons and braces inside strings alone', () => {
  assert.equal(minifyCss('.q { content: "a; } b"; quotes: "«" "»"; }'), '.q{content:"a; } b";quotes:"«" "»"}\n');
});
