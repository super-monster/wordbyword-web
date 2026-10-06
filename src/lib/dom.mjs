// Minimal HTML parser for the build-time validator (doc 06 §3.7 D-group). Zero dependencies.
// It only has to read the HTML this generator writes (well-formed, every non-void element closed), so it is a plain
// stack parser: void elements, `/>` self-closing (inline SVG), raw-text <script>/<style>, comments and the doctype.
//
//   parseHTML(html) → root { type:'root', children }
//   element node    → { type:'el', tag, attrs, children, parent, start }      (attrs: decoded values, lower-case names)
//   text node       → { type:'text', text, parent, start }                    (decoded text)

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', mdash: '—', ndash: '–', hellip: '…', rarr: '→', middot: '·' };

export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

export function parseHTML(html) {
  const root = { type: 'root', tag: '#root', attrs: {}, children: [], parent: null, start: 0 };
  let cur = root;
  let i = 0;
  const n = html.length;
  const pushText = (from, to) => {
    if (to > from) cur.children.push({ type: 'text', text: decodeEntities(html.slice(from, to)), parent: cur, start: from });
  };
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { pushText(i, n); break; }
    pushText(i, lt);
    i = lt;
    if (html.startsWith('<!--', i)) { const e = html.indexOf('-->', i + 4); i = e < 0 ? n : e + 3; continue; }
    if (html[i + 1] === '!' || html[i + 1] === '?') { const e = html.indexOf('>', i); i = e < 0 ? n : e + 1; continue; }
    if (html[i + 1] === '/') {
      const e = html.indexOf('>', i);
      const tag = html.slice(i + 2, e < 0 ? n : e).trim().toLowerCase();
      let p = cur;
      while (p && p.type !== 'root' && p.tag !== tag) p = p.parent;
      if (p && p.type !== 'root') cur = p.parent; // stray end tags are ignored
      i = e < 0 ? n : e + 1;
      continue;
    }
    const m = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(i, i + 80));
    if (!m) { pushText(i, i + 1); i++; continue; } // a literal "<" in text
    const tag = m[1].toLowerCase();
    let j = i + m[0].length;
    const attrs = {};
    let selfClose = false;
    while (j < n) {
      while (j < n && /\s/.test(html[j])) j++;
      if (html[j] === '>') { j++; break; }
      if (html[j] === '/' && html[j + 1] === '>') { selfClose = true; j += 2; break; }
      const am = /^[^\s=/>]+/.exec(html.slice(j, j + 200));
      if (!am) { j++; continue; }
      const name = am[0].toLowerCase();
      j += am[0].length;
      while (j < n && /\s/.test(html[j])) j++;
      let value = '';
      if (html[j] === '=') {
        j++;
        while (j < n && /\s/.test(html[j])) j++;
        const q = html[j];
        if (q === '"' || q === "'") {
          const e = html.indexOf(q, j + 1);
          value = html.slice(j + 1, e < 0 ? n : e);
          j = e < 0 ? n : e + 1;
        } else {
          const um = /^[^\s>]+/.exec(html.slice(j, j + 2000));
          value = um ? um[0] : '';
          j += value.length;
        }
      }
      if (!(name in attrs)) attrs[name] = decodeEntities(value);
    }
    const el = { type: 'el', tag, attrs, children: [], parent: cur, start: i };
    cur.children.push(el);
    i = j;
    if (RAW.has(tag) && !selfClose) {
      const endRe = new RegExp(`</${tag}`, 'gi'); // not html.toLowerCase(): "İ" lowercases to two code units, shifting every index after it
      endRe.lastIndex = i;
      const close = endRe.exec(html)?.index ?? -1;
      const end = close < 0 ? n : close;
      if (end > i) el.children.push({ type: 'text', text: html.slice(i, end), parent: el, start: i, raw: true });
      const gt = close < 0 ? n : html.indexOf('>', close);
      i = gt < 0 ? n : gt + 1;
      continue;
    }
    if (!VOID.has(tag) && !selfClose) cur = el;
  }
  return root;
}

// ———————————————————————————— traversal helpers ————————————————————————————

export function* elements(node) {
  for (const c of node.children ?? []) {
    if (c.type !== 'el') continue;
    yield c;
    yield* elements(c);
  }
}

export const findAll = (node, pred) => [...elements(node)].filter(pred);
export const find = (node, pred) => { for (const e of elements(node)) if (pred(e)) return e; return null; };
export const byTag = (node, tag) => findAll(node, (e) => e.tag === tag);
export const hasClass = (el, cls) => (el.attrs?.class ?? '').split(/\s+/).includes(cls);

export function closest(el, pred) {
  for (let p = el; p && p.type === 'el'; p = p.parent) if (pred(p)) return p;
  return null;
}

export const isInside = (el, ancestor) => { for (let p = el; p; p = p.parent) if (p === ancestor) return true; return false; };

// Concatenated text of a subtree. Script/style content is skipped; `sep` is inserted at element boundaries so that
// words of adjacent elements do not run together.
export function textOf(node, { sep = '' , skip = null } = {}) {
  let out = '';
  const rec = (n) => {
    for (const c of n.children ?? []) {
      if (c.type === 'text') { if (!c.raw) out += c.text; continue; }
      if (c.tag === 'script' || c.tag === 'style' || (skip && skip(c))) continue;
      out += sep;
      rec(c);
      out += sep;
    }
  };
  rec(node);
  return out;
}

export const normSpace = (s) => String(s).replace(/[\u00ad\u200b\u2060\ufeff]/g, '').replace(/\s+/g, ' ').trim(); // invisible break controls are not text

// Map id → first element carrying it, plus the list of duplicated ids.
export function idIndex(root) {
  const ids = new Map();
  const dup = new Set();
  for (const e of elements(root)) {
    const id = e.attrs.id;
    if (id === undefined) continue;
    if (ids.has(id)) dup.add(id); else ids.set(id, e);
  }
  return { ids, dup: [...dup] };
}
