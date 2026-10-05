// Asset emission & fingerprinting (doc 06 §3.5). Everything under /assets/ is content-hashed and cached immutably.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';

const hash = (buf, n) => createHash('sha256').update(buf).digest('hex').slice(0, n);

const CSS_ORDER = ['tokens', 'base', 'layout', 'components', 'demo', 'legal'];
const JS_ORDER = ['analytics', 'main'];

// CSS: concatenate in order, drop comments, blank lines and leading indentation (D-18 measures this output).
function bundleCss(root) {
  return CSS_ORDER.map((n) => readFileSync(join(root, `src/css/${n}.css`), 'utf8')).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.trim()).filter(Boolean).join('\n') + '\n';
}

const bundleJs = (root) => JS_ORDER.map((n) => readFileSync(join(root, `src/js/${n}.js`), 'utf8')).join('\n');

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
  const js = Buffer.from(bundleJs(root));
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
