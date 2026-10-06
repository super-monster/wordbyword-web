// Shared helpers for the build-time validator (src/lib/validate.mjs, validate-dist.mjs, pseudo.mjs).

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fill, plain, placeholderVars } from './html.mjs';

// ———————————————————————————— issues ————————————————————————————
// issues = { error: string[], warn: string[] }. Every message starts with its rule id: "L-8 ja meta.title …".

export const err = (issues, id, msg) => { issues.error.push(`${id} ${msg}`); };
export const warn = (issues, id, msg) => { issues.warn.push(`${id} ${msg}`); };
export const newIssues = () => ({ error: [], warn: [] });

// ———————————————————————————— data files ————————————————————————————
// claims-lint.json, keyword-map.json, glossary/<code>.json, glossary/_simplified-only*.txt. Tests inject them through
// cfg.data = { claims, keywordMap, glossary: { code: obj | null }, simplifiedOnly, simplifiedOnlyJa }.

const readJsonIf = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null);

// Characters of a list file: one or more per line, '#' starts a comment, whitespace ignored.
function readCharList(file) {
  if (!existsSync(file)) return null;
  const set = new Set();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const body = line.replace(/#.*$/, '');
    for (const ch of body) if (!/\s/.test(ch)) set.add(ch);
  }
  return set;
}

export function loadData(cfg) {
  if (cfg._data) return cfg._data;
  const inj = cfg.data ?? {};
  const dir = join(cfg.root ?? '.', 'src/data');
  const glossaryCache = new Map(Object.entries(inj.glossary ?? {}));
  const data = {
    claims: inj.claims ?? readJsonIf(join(dir, 'claims-lint.json')) ?? { rules: [] },
    keywordMap: inj.keywordMap ?? readJsonIf(join(dir, 'keyword-map.json')) ?? {},
    glossary(code) {
      if (!glossaryCache.has(code)) glossaryCache.set(code, readJsonIf(join(dir, 'glossary', `${code}.json`)));
      return glossaryCache.get(code);
    },
    simplifiedOnly: 'simplifiedOnly' in inj ? inj.simplifiedOnly : readCharList(join(dir, 'glossary/_simplified-only.txt')),
    simplifiedOnlyJa: 'simplifiedOnlyJa' in inj ? inj.simplifiedOnlyJa : readCharList(join(dir, 'glossary/_simplified-only-ja.txt')),
  };
  Object.defineProperty(cfg, '_data', { value: data, enumerable: false, configurable: true });
  return data;
}

// ———————————————————————————— patterns ————————————————————————————

const reCache = new Map();
export function re(source, flags = 'iu') {
  const k = `${flags}\u0000${source}`;
  let r = reCache.get(k);
  if (!r) { r = new RegExp(source, flags); reCache.set(k, r); }
  return r;
}

// Data patterns (claims-lint, keyword-map) are written for every script, so with the u flag \w, \W and \b mean letters,
// marks and digits of any script, not ASCII only: "zaznacz\w* tekst" must see "zaznaczyć tekst", "\bíntegra" must
// match after a space. Inside a character class only \w is widened (the data has no \W or \b there).
const WORD = '\\p{L}\\p{M}\\p{N}_';
export function unicodeWords(src) {
  let out = '';
  let cls = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\' && i + 1 < src.length) {
      const nx = src[++i];
      if (nx === 'w') out += cls ? WORD : `[${WORD}]`;
      else if (nx === 'W' && !cls) out += `[^${WORD}]`;
      else if (nx === 'b' && !cls) out += `(?:(?<=[${WORD}])(?![${WORD}])|(?<![${WORD}])(?=[${WORD}]))`;
      else out += ch + nx;
      continue;
    }
    if (ch === '[' && !cls) cls = true;
    else if (ch === ']' && cls) cls = false;
    out += ch;
  }
  return out;
}

// Compile a list of regex sources; an invalid regex is reported (once) instead of crashing the build.
export function compileAll(list, flags, onBad) {
  const out = [];
  for (const src of list ?? []) {
    try { out.push(re(flags.includes('u') ? unicodeWords(src) : src, flags)); } catch (e) { onBad?.(src, e.message); }
  }
  return out;
}

export const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Token match (doc 03 §1.6, §3.8 hasToken): case-insensitive; latn / cyrl / arab tokens match whole words with
// Unicode boundaries (not ASCII \b, so "ứng dụng" works and "App" does not match "appears"); cjk / thai / deva
// tokens match substrings.
export function hasToken(text, token, script) {
  const t = String(token);
  if (script === 'cjk' || script === 'thai' || script === 'deva') return String(text).toLowerCase().includes(t.toLowerCase());
  return re(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, 'iu').test(String(text));
}

// ———————————————————————————— copy helpers ————————————————————————————

export const RICH_LINK = /\[([^\]]+)\]\(([^)]*)\)/g;

// What a reader sees: markup removed ([[ ]], {wbr}, **, [text](@ref) → text).
// Invisible format characters (soft hyphen, zero-width space, word joiner, BOM) steer line breaking only (th joins
// words with U+2060, doc 05 §3.5); they must not let a banned word or a keyword slip past a pattern or a length.
export const INVISIBLE = /[\u00ad\u200b\u2060\ufeff]/g;
export const displayText = (s) => plain(String(s ?? '').replace(RICH_LINK, '$1')).replace(INVISIBLE, '');

export const YEAR = new Date().getUTCFullYear();

export const dateLong = (code, iso) => new Intl.DateTimeFormat(code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

// Placeholder values for a locale (the same namespace the templates use) plus the template-local placeholders
// {n} (pricing.table.perDay) and {set} (features[].image) with representative values.
export function makeVars(cfg, locale, t, { n = 500, set = 'en' } = {}) {
  const p = cfg.product;
  const extra = {
    appStoreName: t?.meta?.appStoreName ?? cfg.SITE.name,
    appStoreSubtitle: t?.meta?.appStoreSubtitle ?? '',
    releaseDate: dateLong(locale.code, p.wbw.releaseDate),
    versionDate: dateLong(locale.code, p.wbw.versionDate),
    updated: dateLong(locale.code, new Date().toISOString().slice(0, 10)),
  };
  return { ...placeholderVars({ product: p, SITE: cfg.SITE, locale, year: YEAR, extra }), n, set };
}

// fill() that never throws (L-6 reports broken placeholders; other rules measure the raw text instead).
export function fillSafe(s, vars, code) {
  try { return fill(s, vars, code); } catch { return String(s ?? ''); }
}

// Leaf value as rendered text: placeholders filled, markup stripped.
export const rendered = (s, vars, code) => displayText(fillSafe(s, vars, code));

export const primaryLang = (tag) => String(tag ?? '').toLowerCase().split('-')[0];

export function publishedLocales(cfg, strings) {
  return cfg.LOCALES.filter((l) => l.publish && strings?.[l.code]);
}

// Page id → the locale-JSON subtree that holds its copy (doc 06 §4.2; L-3).
export const PAGE_KEY_ROOT = { about: 'about', 'chrome-extension': 'chromeExtension', '404': 'notfound',
  privacy: 'legal', support: 'legal', 'extension-privacy': 'legal' };
