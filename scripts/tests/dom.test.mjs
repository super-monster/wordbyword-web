// The HTML parser keeps raw-text offsets right whatever precedes them (tr: "İ" lowercases to two code units).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML, byTag } from '../../src/lib/dom.mjs';

const raw = (el) => el.children.map((c) => c.text).join(''); // textOf() skips script / style by design

test('script text is exact after a Turkish dotted capital İ in the head', () => {
  const json = '{"@type":"SoftwareApplication","name":"WordByWord"}';
  const doc = parseHTML(`<html><head><meta property="og:image:alt" content="İngilizce arayüz, İspanyolca metin"><script type="application/ld+json">${json}</script></head><body></body></html>`);
  const [script] = byTag(doc, 'script');
  assert.equal(raw(script), json);
  assert.doesNotThrow(() => JSON.parse(raw(script)));
});

test('the raw-text end tag still matches case-insensitively', () => {
  const doc = parseHTML('<style>a{}</STYLE><p>x</p>');
  assert.equal(raw(byTag(doc, 'style')[0]), 'a{}');
  assert.equal(byTag(doc, 'p').length, 1);
});
