// Build context shared by build.mjs, scripts/check.mjs and the validator tests: configuration, locale copy, routes.
// Spec: doc 06 §3.3–3.4 (routes), §4.4 (a locale without src/locales/<code>.json is not published).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { SITE, LOCALES, PAGES, CONTRACTS, ALIASES } from '../site.mjs';
import { SIBLING, seMode } from '../data/sibling.mjs';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

// Contract mode for one contract under a given SITE ('proxy' = C-1, 'file' = C-2; doc 02 §5.2.3).
export function modeOf(site, id) {
  const m = site.contractMode;
  return typeof m === 'string' ? m : (m?.[id] ?? 'proxy');
}

// The configuration object handed to validateConfig / validateLocales / validateDist.
export function loadConfig(root) {
  return {
    root,
    SITE, LOCALES, PAGES, CONTRACTS, ALIASES, SIBLING, seMode,
    product: readJson(join(root, 'src/data/product.json')),
    notice: readJson(join(root, 'src/notice.json')),
  };
}

// Locale copy. A locale without src/locales/<code>.json is not published yet (doc 06 §4.4: no per-key fallback to
// English); its `publish` flag is switched off in place, so the redirects generator sends its legacy URLs 302 to /.
export function loadStrings(cfg) {
  const strings = {};
  const unpublished = [];
  for (const l of cfg.LOCALES) {
    const file = join(cfg.root, `src/locales/${l.code}.json`);
    if (existsSync(file)) strings[l.code] = readJson(file);
    if (!existsSync(file) && l.publish) l.publish = false;
    if (!l.publish) unpublished.push(l.code);
  }
  // Files for codes that are not in LOCALES are reported by validateLocales (L-1).
  const dir = join(cfg.root, 'src/locales');
  const stray = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json') && !cfg.LOCALES.some((l) => `${l.code}.json` === f)) : [];
  return { strings, unpublished, stray };
}

// Routes (doc 06 §3.4): `locales:'*'` → every published locale; explicit lists keep only published ones.
export function expandRoutes(cfg, site = cfg.SITE) {
  const routes = [];
  for (const page of cfg.PAGES) {
    const locs = page.locales === '*' ? cfg.LOCALES.filter((l) => l.publish)
      : page.locales.map((c) => cfg.LOCALES.find((l) => l.code === c)).filter((l) => l && l.publish);
    for (const locale of locs) {
      let outFile, publicUrl;
      if (page.contract && modeOf(site, page.contract.id) === 'file') { // C-2: real file, CF strips .html
        outFile = page.contract.public.slice(1);
        publicUrl = page.contract.bare;
      } else if (page.file) {
        outFile = page.file;
        publicUrl = '/' + page.file;
      } else {
        const path = page.path(locale);
        outFile = path + 'index.html';
        publicUrl = page.publicUrl ?? '/' + path;
      }
      const indexable = typeof page.indexable === 'function' ? Boolean(page.indexable(locale)) : Boolean(page.indexable);
      routes.push({ page, locale, outFile, publicUrl, indexable });
    }
  }
  return routes;
}

export const publicView = (r) => ({ page: r.page.id, locale: r.locale.code, outFile: r.outFile, publicUrl: r.publicUrl, indexable: r.indexable });
