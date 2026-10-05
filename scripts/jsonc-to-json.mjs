// One-off import: copy the finalized JSONC copy deck from design doc 08 into src/locales/<code>.json.
// After import, src/locales/*.json is the single source of copy; doc 08 stays as the design reference.
// Usage: node scripts/jsonc-to-json.mjs [path/to/08-文案底稿.md]   (default: docs/redesign-2026/08-文案底稿.md)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const DOC = process.argv[2] ?? 'docs/redesign-2026/08-文案底稿.md';
const md = readFileSync(DOC, 'utf8');

// Strip // comments outside of strings (doc 08 §1.2).
function stripJsonc(t) {
  let o = '', s = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (s) { o += c; if (c === '\\') o += t[++i]; else if (c === '"') s = false; continue; }
    if (c === '"') { s = true; o += c; continue; }
    if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; o += '\n'; continue; }
    o += c;
  }
  return o;
}

function block(heading) {
  const h = md.indexOf(heading);
  if (h < 0) throw new Error(`heading not found in doc 08: ${heading}`);
  const s = md.indexOf('```jsonc\n', h);
  const e = md.indexOf('\n```', s + 9);
  return JSON.parse(stripJsonc(md.slice(s + 9, e)));
}

const OUT = {
  en: [block('## 2. 首页文案 · en'), block('### 5.2 文案'), block('### 6.3 en')],
  ja: [block('## 3. 首页文案 · ja')],
  'zh-Hans': [block('## 4. 首页文案 · zh-Hans'), block('### 6.4 zh-Hans')],
};

mkdirSync('src/locales', { recursive: true });
for (const [code, parts] of Object.entries(OUT)) {
  const merged = Object.assign({}, ...parts);
  writeFileSync(`src/locales/${code}.json`, JSON.stringify(merged, null, 2) + '\n');
  console.log(`src/locales/${code}.json  keys: ${Object.keys(merged).join(', ')}`);
}
