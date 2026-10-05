// Reader for assets/img/images.json (doc 06 §7.3), shared by build.mjs (image resolver) and the validator (D-6, D-7, D-21).
// The registry is produced by scripts/images.mjs. Accepted variant shapes, so the reader does not break while the
// pipeline settles:
//   doc 06 §7.3  { "<key>": { …, "variants": [ { "w", "h", "avif": "shot/en/lookup-360.avif", "jpg"?: "…", "bytes": { "avif", "jpg" } } ] } }
//   path form    { "<key>": { "variants": [ { "path": "assets/img/…", "format": "avif", "w", "h", "bytes"? } ], "fallbackWidth"? } }
//   prototype    { "<key>": { "avif": [ { "file", "w", "h", "bytes" } ], "jpeg": { "file", … }, "png": { "file", … } } }
// A top-level { "images": { … } } wrapper is accepted too. File paths may be relative to the repository root,
// to assets/img/ or to assets/.

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const FORMATS = ['avif', 'jpg', 'jpeg', 'png', 'webp'];
const norm = (f) => (f === 'jpeg' ? 'jpg' : f);

// Repository-relative path for a registry path (first candidate that exists, else the most likely one).
export function resolveRegistryPath(root, p) {
  const clean = String(p).replace(/^\/+/, '');
  const candidates = clean.startsWith('assets/') ? [clean] : [`assets/img/${clean}`, `assets/${clean}`, clean];
  return candidates.find((c) => existsSync(join(root, c))) ?? candidates[0];
}

export function registryEntries(reg) {
  const map = isObj(reg?.images) ? reg.images : reg;
  return Object.entries(isObj(map) ? map : {}).filter(([k, v]) => isObj(v) && !k.startsWith('$'));
}

// → [{ format, w, h, path (as written), bytes? }]
export function entryVariants(entry) {
  const out = [];
  for (const v of Array.isArray(entry.variants) ? entry.variants : []) {
    if (!isObj(v)) continue;
    if (typeof v.path === 'string') out.push({ format: norm(v.format ?? v.path.split('.').pop()), w: v.w, h: v.h, path: v.path, bytes: typeof v.bytes === 'number' ? v.bytes : v.bytes?.[v.format] });
    for (const f of FORMATS) {
      if (typeof v[f] === 'string') out.push({ format: norm(f), w: v.w, h: v.h, path: v[f], bytes: isObj(v.bytes) ? v.bytes[f] ?? v.bytes[norm(f)] : undefined });
    }
  }
  for (const f of FORMATS) {
    const x = entry[f];
    for (const y of Array.isArray(x) ? x : isObj(x) ? [x] : []) {
      if (isObj(y) && typeof y.file === 'string') out.push({ format: norm(f), w: y.w, h: y.h, path: y.file, bytes: y.bytes });
    }
  }
  return out;
}
