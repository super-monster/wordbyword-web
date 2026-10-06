// Build src/data/glossary/th.json from the plain template: L-13 compares exact strings, and the locale carries U+2060
// word joiners (glue-th.mjs), so each required / contains value is re-read from th.json — the same app name plus the
// joiners — after checking that it equals the app name once the joiners are removed.
import { readFileSync, writeFileSync } from 'node:fs';
const [tplFile, localeFile, out] = process.argv.slice(2);
const g = JSON.parse(readFileSync(tplFile, 'utf8'));
const t = JSON.parse(readFileSync(localeFile, 'utf8'));
const get = (path) => path.split(/\.(?![^[]*\])/).reduce((o, k) => {
  const m = k.match(/^(\w+)\[([^\]]+)\]$/);
  if (!m) return o?.[k];
  const arr = o?.[m[1]];
  return Array.isArray(arr) ? (arr.find((x) => x?.id === m[2]) ?? arr[Number(m[2])]) : undefined;
}, t);
const plain = (s) => s.replace(/⁠/g, '');
const problems = [];
for (const [k, want] of Object.entries(g.required)) {
  const got = get(k);
  if (typeof got !== 'string' || plain(got) !== want) { problems.push(`required ${k}: "${got}" ≠ "${want}"`); continue; }
  g.required[k] = got;
}
for (const [k, list] of Object.entries(g.contains)) {
  const got = get(k);
  g.contains[k] = list.map((frag) => {
    // locate frag in got, skipping joiners
    for (let i = 0; i < got.length; i++) {
      let j = i, n = 0;
      while (j < got.length && n < frag.length) { if (got[j] === '⁠' && j > i) { j++; continue; } if (got[j] !== frag[n]) break; j++; n++; }
      if (n === frag.length) return got.slice(i, j);
    }
    problems.push(`contains ${k}: "${frag}" not found`);
    return frag;
  });
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
writeFileSync(out, JSON.stringify(g, null, 2).replace(/⁠/g, '\\u2060') + '\n');
console.error('glossary written');
