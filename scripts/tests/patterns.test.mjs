// Data patterns (claims-lint, keyword-map): \w, \W and \b are Unicode-aware under the u flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileAll, unicodeWords } from '../../src/lib/validate-util.mjs';

test('\\w, \\W and \\b see letters of every script', () => {
  const [w, b, lead, cls] = compileAll(['zaznacz\\w* tekst', '\\bíntegra\\b', '^\\W*Über', '[\\w-]+schutz'], 'iu');
  assert.ok(w.test('Zaznaczyć tekst'), 'Polish ć inside \\w*');
  assert.ok(b.test('la página íntegra.'), '\\b before a non-ASCII letter');
  assert.ok(!b.test('desintegración'), 'no \\b inside a word');
  assert.ok(!b.test('íntegramente'), 'no \\b before a following letter');
  assert.ok(lead.test('— Über uns'), '\\W skips punctuation only');
  assert.ok(!compileAll(['^\\W*ber'], 'iu')[0].test('Über'), '\\W does not swallow a letter');
  assert.ok(cls.test('Daten-schutz'), '\\w inside a class');
});

test('escapes other than \\w \\W \\b pass through; no u flag, no change', () => {
  assert.equal(unicodeWords('a\\.b\\\\w\\d'), 'a\\.b\\\\w\\d');
  const [plain] = compileAll(['\\bcafé'], 'i');
  assert.equal(plain.source, '\\bcafé');
});

test('invisible break controls do not hide a word from the checks', async () => {
  const { displayText } = await import('../../src/lib/validate-util.mjs');
  const { normSpace } = await import('../../src/lib/dom.mjs');
  const [re] = compileAll(['ออฟไลน์'], 'iu');
  assert.ok(re.test(displayText('ใช้งานออฟ⁠ไลน์ได้')), 'U+2060 inside a Thai word');
  assert.ok(re.test(normSpace('ใช้งาน ออฟ​ไลน์')), 'U+200B in dist text');
  assert.equal(displayText('off­line'), 'offline');
});

test('a Devanagari nukta letter matches in either encoding', async () => {
  const { displayText } = await import('../../src/lib/validate-util.mjs');
  const pre = 'फ़', dec = 'फ़'; // फ़ precomposed / फ + nukta
  const [a] = compileAll([`${pre}्री`], 'iu'); const [b] = compileAll([`${dec}्री`], 'iu');
  for (const re of [a, b]) for (const text of [`मु${pre}्री ऐप`, `मु${dec}्री ऐप`]) assert.ok(re.test(displayText(text)));
});
