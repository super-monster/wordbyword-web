// Asset emission & fingerprinting (doc 06 §3.5). Everything under /assets/ is content-hashed and cached immutably.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';

const hash = (buf, n) => createHash('sha256').update(buf).digest('hex').slice(0, n);

const CSS_ORDER = ['tokens', 'base', 'layout', 'components', 'demo', 'legal'];
const JS_ORDER = ['analytics', 'main'];

// CSS: concatenate in order, drop comments and the whitespace next to { } ; , and after ':' (D-18 measures this
// output). Strings and url() are set aside first. Spaces BEFORE ':' stay (`html :is(…)` is a descendant combinator),
// and so do spaces inside values (`calc(a - b)`). When introduced, Chrome's CSSOM parsed the old and the minified bundle
// into the same 425 rules, cssText for cssText; scripts/tests/assets.test.mjs keeps the tricky cases covered.
export function minifyCss(css) {
  const kept = [];
  const keep = (m) => `\u0000${kept.push(m) - 1}\u0000`;
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|url\([^)]*\)/g, keep)
    .replace(/\s+/g, ' ')
    .replace(/ ?([{};,]) ?/g, '$1')
    .replace(/: /g, ':')
    .replace(/;}/g, '}')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => kept[i])
    .trim() + '\n';
}

function bundleCss(root) {
  return minifyCss(CSS_ORDER.map((n) => readFileSync(join(root, `src/css/${n}.css`), 'utf8')).join('\n'));
}

// JS: the same safe subset per file — block comments that start a line, whole-line // comments, blank lines and
// indentation. Trailing comments stay (removing them needs a tokenizer: '//' also occurs in URLs). A file with a
// template literal spanning lines is left as is, because trimming would change the string (D-18 warns).
function bundleJs(root, issues) {
  return JS_ORDER.map((n) => {
    const src = readFileSync(join(root, `src/js/${n}.js`), 'utf8');
    if (src.split('\n').some((l) => (l.match(/`/g) ?? []).length % 2)) {
      issues?.warn.push(`D-18 src/js/${n}.js has a multi-line template literal: bundled without whitespace removal`);
      return src;
    }
    return src.replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, '')
      .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
  }).join('\n') + '\n';
}

export function emitAssets(root, dist, issues) {
  const out = { count: 0, bytes: {} };
  const emit = (rel, buf) => {
    const file = join(dist, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buf);
    out.count++;
    return '/' + rel;
  };

  const css = Buffer.from(bundleCss(root));
  out.css = emit(`assets/site.${hash(css, 12)}.css`, css);
  out.bytes.css = css.length;
  const js = Buffer.from(bundleJs(root, issues));
  out.js = emit(`assets/site.${hash(js, 12)}.js`, js);
  out.bytes.js = js.length;

  // Image registry (assets/img/images.json, produced by scripts/images.mjs). Until it exists, templates render
  // placeholders and the build warns (M1); from M2 on a missing key is an error (D-21).
  const regFile = join(root, 'assets/img/images.json');
  const registry = existsSync(regFile) ? JSON.parse(readFileSync(regFile, 'utf8')) : null;
  if (!registry) issues.warn.push('IMG    assets/img/images.json missing — image slots render as placeholders');
  const fingerprinted = new Map(); // source path → public URL
  const publish = (srcRel) => {
    if (fingerprinted.has(srcRel)) return fingerprinted.get(srcRel);
    const src = join(root, srcRel);
    const buf = readFileSync(src);
    const ext = extname(srcRel);
    const rel = srcRel.replace(/^assets\//, 'assets/').replace(new RegExp(`${ext.replace('.', '\\.')}$`), `.${hash(buf, 8)}${ext}`);
    const url = emit(rel, buf);
    fingerprinted.set(srcRel, url);
    return url;
  };
  out.registry = registry;
  out.publish = publish;
  out.copyRaw = (srcRel) => { const d = join(dist, srcRel); mkdirSync(dirname(d), { recursive: true }); copyFileSync(join(root, srcRel), d); return '/' + basename(srcRel); };
  return out;
}
