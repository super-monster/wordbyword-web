// D-15 (b) pseudo-locale scan (doc 06 §3.7, §4.4; ENG-11, R59): every leaf string of every locale is wrapped in
// ⟦…⟧, all routes are rendered with those strings, and any Latin word of three or more letters outside ⟦…⟧ in a
// text node or in an alt / aria-label / title / text-meta `content` attribute is a hard-coded interface string.
//
// Not wrapped (data, not copy): ids, refs, image keys, demo.sourceLang — and demo.lookup.word, which must match the
// source sentence verbatim (it is allow-listed on its page instead). seo.* is never rendered.
// Allow-listed: brand and product names (doc 06 D-15: "品牌与产品名、App Store、Chrome 等"), language autonyms
// (LOCALES[].native, product.wbw.targetLanguageNames), SITE.name / makerName.
// Skipped: <script>/<style>, the verbatim legal bodies (.legal-body, src/legal/*.html — en-only documents), and the
// drawn App Store badge placeholder (.asb-text) while assets/badges/*.svg does not exist (D-11 warns about it).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseHTML, elements, hasClass, closest } from './dom.mjs';
import { mapLeaves, keyMatchAny } from './keypath.mjs';
import { err, warn } from './validate-util.mjs';
import { listFiles, pendingInputs } from './validate-dist.mjs';

export const OPEN = '⟦';
export const CLOSE = '⟧';

const RAW_KEYS = ['*.id', 'features[*].id', 'faq.items[*].id', 'gallery.items[*].id', 'about.sections[*].id', 'chromeExtension.features[*].id',
  'chromeExtension.faq[*].id', 'chromeExtension.shots[*].id', 'about.links[*].ref', 'about.family.links[*].ref', 'demo.sourceLang',
  'features[*].image', 'chromeExtension.features[*].image', 'demo.lookup.word', 'seo.'];
const isRaw = (path) => keyMatchAny(RAW_KEYS, path) || /(^|\.)(id|ref|image)$/.test(path);

export const wrap = (s) => `${OPEN}${s}${CLOSE}`;

export function pseudoStrings(strings) {
  const out = {};
  for (const [code, t] of Object.entries(strings)) out[code] = mapLeaves(t, (v, path) => (!v || isRaw(path) ? v : wrap(v)));
  return out;
}

export function pseudoNotice(notice) {
  return { ...notice, copy: mapLeaves(notice.copy ?? {}, (v) => (v ? wrap(v) : v)) };
}

const BRAND_PHRASES = ['WordByWord Translate', 'Apple Vision Pro', 'Vision Pro', 'App Store', 'Chrome Web Store', 'Microsoft Edge', 'Google Chrome',
  'Google Gemini', 'Action Flow'];
const BRAND_WORDS = ['WordByWord', 'SurfEnglish', 'iPhone', 'iPad', 'iPadOS', 'Mac', 'macOS', 'iOS', 'Apple', 'Chrome', 'Edge', 'Google', 'Azure',
  'Microsoft', 'Plus', 'Safari', 'Twitter', 'OpenAI', 'Gemini', 'App', 'Store'];

function allowList(cfg) {
  const words = new Set(BRAND_WORDS);
  const add = (s) => { for (const w of String(s ?? '').match(/\p{L}+/gu) ?? []) words.add(w); };
  [cfg.SITE.name, cfg.SITE.makerName, cfg.SIBLING?.name].forEach(add);
  for (const l of cfg.LOCALES) add(l.native);
  for (const n of cfg.product?.wbw?.targetLanguageNames ?? []) add(n);
  return words;
}

// Remove ⟦…⟧ spans (innermost first, they nest when a wrapped value is filled into a wrapped placeholder).
function unwrap(text) {
  let s = text;
  for (let prev = ''; prev !== s;) { prev = s; s = s.replace(/⟦[^⟦⟧]*⟧/g, ' '); }
  return s;
}

export function hardCodedWords(text, allow, extraAllow = new Set()) {
  let s = unwrap(String(text));
  for (const ph of BRAND_PHRASES) s = s.split(ph).join(' ');
  const out = [];
  for (const m of s.matchAll(/\p{Script=Latin}{3,}/gu)) if (!allow.has(m[0]) && !extraAllow.has(m[0])) out.push(m[0]);
  return [...new Set(out)];
}

const TEXT_META = /^(description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description)$/;

// Scan a pseudo-rendered dist. ctx = { cfg, routes, strings (the real strings, for the raw-key allow list) }.
export function scanPseudoDist(dir, ctx, issues) {
  const { cfg, routes } = ctx;
  const allow = allowList(cfg);
  const pending = pendingInputs(cfg);
  const byFile = new Map(routes.map((r) => [r.outFile, r]));
  let pages = 0;
  for (const f of listFiles(dir).filter((x) => x.endsWith('.html'))) {
    pages++;
    const r = byFile.get(f);
    const at = r ? `${r.publicUrl} (${r.locale.code})` : f;
    const extra = new Set();
    const word = ctx.strings?.[r?.locale.code]?.demo?.lookup?.word;
    if (word) for (const w of String(word).match(/\p{L}+/gu) ?? []) extra.add(w);
    const doc = parseHTML(readFileSync(join(dir, f), 'utf8'));
    const skip = (e) => e.tag === 'script' || e.tag === 'style' || hasClass(e, 'legal-body') || (pending.noBadges && hasClass(e, 'asb-text'));
    const found = new Map(); // where → Set(words)
    const note = (where, words) => { if (!words.length) return; if (!found.has(where)) found.set(where, new Set()); words.forEach((w) => found.get(where).add(w)); };
    // text nodes (joined per element so that markup inside a wrapped string does not split ⟦ … ⟧)
    let text = '';
    const rec = (n) => {
      for (const c of n.children ?? []) {
        if (c.type === 'text') { text += c.text; continue; }
        if (skip(c)) { text += ' '; continue; }
        text += ' ';
        rec(c);
        text += ' ';
      }
    };
    rec(doc);
    note('text', hardCodedWords(text, allow, extra));
    for (const e of elements(doc)) {
      if (closest(e, skip)) continue;
      for (const a of ['alt', 'aria-label', 'title']) if (a in e.attrs) note(a, hardCodedWords(e.attrs[a], allow, extra));
      if (e.tag === 'meta' && TEXT_META.test(e.attrs.name ?? e.attrs.property ?? '')) note('meta content', hardCodedWords(e.attrs.content, allow, extra));
    }
    for (const [where, words] of found) err(issues, 'D-15', `${at}: hard-coded interface text in ${where}: ${[...words].map((w) => `"${w}"`).join(', ')} — move it into the locale JSON (pseudo-locale scan)`);
  }
  if (!pages) warn(issues, 'D-15', 'pseudo-locale scan found no pages to scan');
  return pages;
}
