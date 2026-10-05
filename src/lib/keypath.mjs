// Key paths into locale JSON (doc 06 §3.7 L-1 array semantics; claims-lint `exempt`, glossary keys).
//
//   objects                               → a.b
//   arrays of objects that all carry `id` → a[id]        e.g. faq.items[whole-page].a, features[lookup].bullets
//   other arrays of objects               → a[0]         e.g. about.facts[3].value
//   arrays of scalars                     → one node `a` (L-1 compares element types only); leaves expand to a[0] …
//
// Patterns (keyMatch): `*` matches one segment or one bracket selector (`features[*].kicker`, `pricing.table.rows.*`);
// a pattern ending in "." is a prefix (`chromeExtension.`); any pattern also matches the subtree below it
// (`faq.items[whole-page]` covers its `.q` and `.a`).

export const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const kindOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

function arrayKind(v) {
  if (!v.length) return 'array:empty';
  if (v.every(isObj)) return v.every((x) => typeof x.id === 'string' && x.id) ? 'array:id' : 'array:object';
  if (v.some(isObj) || v.some(Array.isArray)) return 'array:mixed';
  return 'array:scalar';
}

// shape(obj) → Map(path → { kind, ids?, length?, elem? })
export function shape(obj) {
  const out = new Map();
  const visit = (p, v) => {
    if (Array.isArray(v)) {
      const kind = arrayKind(v);
      if (kind === 'array:id') {
        out.set(p, { kind, ids: v.map((x) => x.id), length: v.length });
        for (const x of v) visitObj(`${p}[${x.id}]`, x);
      } else if (kind === 'array:object') {
        out.set(p, { kind, length: v.length });
        v.forEach((x, i) => visitObj(`${p}[${i}]`, x));
      } else {
        out.set(p, { kind, length: v.length, elem: [...new Set(v.map(kindOf))].sort().join('|') });
      }
    } else if (isObj(v)) {
      out.set(p, { kind: 'object' });
      visitObj(p, v, true);
    } else out.set(p, { kind: kindOf(v) });
  };
  const visitObj = (p, o, already = false) => {
    if (!already) out.set(p, { kind: 'object' });
    for (const [k, v] of Object.entries(o)) visit(p ? `${p}.${k}` : k, v);
  };
  for (const [k, v] of Object.entries(obj ?? {})) visit(k, v);
  return out;
}

// leaves(obj) → [{ path, value }] for every scalar (scalar-array elements as a[i]).
export function leaves(obj) {
  const out = [];
  const visit = (p, v) => {
    if (Array.isArray(v)) {
      const kind = arrayKind(v);
      v.forEach((x, i) => visit(kind === 'array:id' ? `${p}[${x.id}]` : `${p}[${i}]`, x));
    } else if (isObj(v)) {
      for (const [k, c] of Object.entries(v)) visit(p ? `${p}.${k}` : k, c);
    } else out.push({ path: p, value: v });
  };
  visit('', obj ?? {});
  return out;
}

// Parse "a.b[id].c[0]" → ['a', 'b', ['id'], 'c', ['0']]  (bracket selectors are 1-element arrays)
export function parsePath(path) {
  const segs = [];
  const re = /([^.[\]]+)|\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(path))) segs.push(m[1] !== undefined ? m[1] : [m[2]]);
  return segs;
}

function step(v, seg) {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(seg)) {
    if (!Array.isArray(v)) return undefined;
    const sel = seg[0];
    const byId = v.find((x) => isObj(x) && x.id === sel);
    if (byId) return byId;
    return /^\d+$/.test(sel) ? v[Number(sel)] : undefined;
  }
  return isObj(v) ? v[seg] : undefined;
}

export const getPath = (obj, path) => parsePath(path).reduce(step, obj);
export const hasPath = (obj, path) => getPath(obj, path) !== undefined;

// setPath(obj, 'features[lookup].kicker', 'x'); value === undefined deletes the key / array element.
export function setPath(obj, path, value) {
  const segs = parsePath(path);
  let v = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    let next = step(v, segs[i]);
    if (next === undefined) {
      next = Array.isArray(segs[i + 1]) && /^\d+$/.test(segs[i + 1][0]) ? [] : {};
      if (Array.isArray(segs[i])) throw new Error(`setPath: no element ${segs[i][0]} in ${path}`);
      v[segs[i]] = next;
    }
    v = next;
  }
  const last = segs[segs.length - 1];
  if (Array.isArray(last)) {
    const idx = v.findIndex((x) => isObj(x) && x.id === last[0]);
    const i = idx >= 0 ? idx : Number(last[0]);
    if (value === undefined) v.splice(i, 1); else v[i] = value;
  } else if (value === undefined) delete v[last];
  else v[last] = value;
  return obj;
}

const reCache = new Map();
function patternRe(pattern) {
  let re = reCache.get(pattern);
  if (!re) {
    const src = pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^.\\[\\]]*');
    re = new RegExp(`^${src}(?=$|[.[])`);
    reCache.set(pattern, re);
  }
  return re;
}

export function keyMatch(pattern, path) {
  if (pattern.endsWith('.')) return path.startsWith(pattern);
  return patternRe(pattern).test(path);
}

export const keyMatchAny = (patterns, path) => (patterns ?? []).some((p) => keyMatch(p, path));

// Deep copy with every string leaf passed through fn(value, path); `skip(path)` keeps a leaf unchanged.
export function mapLeaves(obj, fn, path = '') {
  if (Array.isArray(obj)) {
    const kind = arrayKind(obj);
    return obj.map((x, i) => mapLeaves(x, fn, kind === 'array:id' ? `${path}[${x.id}]` : `${path}[${i}]`));
  }
  if (isObj(obj)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = mapLeaves(v, fn, path ? `${path}.${k}` : k);
    return out;
  }
  return typeof obj === 'string' ? fn(obj, path) : obj;
}
