#!/usr/bin/env node
// One-off (M3-01): the legacy site's copy → translation memory (TM) in src/locales/_legacy/ for the M3 translations
// (doc 08 §7.1 input list, §7.10 prompt template; doc 06 §2.2, §4.5; doc 04 §9 step 2). Zero dependencies, Node ≥ 22.
//
//   node scripts/extract-legacy.mjs
//
// Reads the frozen `legacy-pages` branch with `git show` (never checks it out) and rewrites
//   src/locales/_legacy/<code>.json   one per locale with a legacy home page: index.html + the <x>-top.html pages
//                                     (<x> → locale through LOCALES[].legacy), aligned segment by segment with
//                                     index.html, plus the js/site-notice.js strings of that locale
//   src/locales/_legacy/sibling-tm.json  the I18N table of js/surfenglish-promo.js (20 languages), aligned with en
//
// Deterministic: no timestamps; locale maps sorted by code; records in a fixed field order; segments in document
// order. Re-running on the same legacy commit and claims-lint.json yields byte-identical files.
//
// The TM is NOT part of the build — src/lib/context.mjs only reads src/locales/<code>.json, never a subdirectory —
// and it is not reviewed: it repeats the legacy site's outdated or wrong product facts (doc 06 §4.5, F11). Each
// segment carries the known problems (doc 08 §8, doc 01 §2.9) and the claims-lint rules its text trips.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALES } from '../src/site.mjs';
import { parseHTML, elements, closest, hasClass } from '../src/lib/dom.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/locales/_legacy');
const BRANCH = 'legacy-pages';
const MASTER = 'index.html'; // the en page every <x>-top.html translates

// ———————————————————————————— git ————————————————————————————

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });

function resolveCommit() {
  for (const ref of [BRANCH, `origin/${BRANCH}`]) {
    try { return git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`).trim(); } catch { /* try the next ref */ }
  }
  throw new Error(`branch ${BRANCH} not found (git fetch origin ${BRANCH}:${BRANCH})`);
}
const COMMIT = resolveCommit();
const show = (path) => git('show', `${COMMIT}:${path}`);
const blobOf = (path) => git('rev-parse', `${COMMIT}:${path}`).trim();

// ———————————————————————————— shared output parts ————————————————————————————

const META = (what) => ({
  generatedBy: 'scripts/extract-legacy.mjs',
  source: `${BRANCH} @ ${COMMIT}`,
  content: what,
  warning: 'Translation memory (TM) for reference only — outdated, not reviewed, not used by the build. The legacy copy '
    + 'contains outdated or wrong product facts: use it for established terms and phrasing, never as a source of facts. '
    + 'Doc 08 (§1.1 fact red lines, §7 translation brief) always wins over this file.',
  rule: 'TM 不参与构建，也不保证事实正确（F11）— doc 06 §4.5；已过时，仅作术语参考 — doc 04 §9',
});

// Field documentation written into every file (_meta.fields): top-level fields, then the segment record fields.
const PAGE_FIELDS = {
  legacy: 'legacy file prefixes of this locale (LOCALES[].legacy in src/site.mjs)',
  sources: 'legacy files of this locale (blob = git object id); a further file names the one it duplicates and whether it is byte-identical',
  lang: '<html lang> of the legacy page',
  dir: '<html dir> of the legacy page; null = not set (left to right)',
  title: '<title> of the legacy page (also segment head.title)',
  description: '<meta name="description"> of the legacy page (also segment head.description)',
  alignment: `pairing report against ${MASTER}: enOnly = en segments without a counterpart here; structure = element counts per section that differ from ${MASTER} (inline elements such as <br> do not affect pairing)`,
  segments: 'the page copy in document order (head, header, hero, features, screenshots, cta, faq, footer)',
  notice: 'js/site-notice.js strings (service-outage banner, off on the legacy site; already migrated to src/notice.json)',
};
const PAIR_FIELDS = {
  id: 'stable segment id: <section>[.<n> of a repeated block].<role>[.<n>]; the same id is the same slot in every legacy/<code>.json',
  kind: '', // filled per file with the kinds that occur
  en: 'the index.html segment in the same slot (<br> kept as \\n, inline emphasis as plain text, whitespace collapsed)',
  target: 'this locale\'s text, normalised the same way',
  aligned: 'true = slot verified: same structural path with equal sibling counts, same link target and same images in its repeated block; false = paired by section + position only (see note)',
  note: 'why a pair is not verified, or other alignment remarks',
  warnings: 'known problems: "doc …" entries come from the design docs (doc 08 §1.1 / §8, doc 01 §2.9, doc 04 §5.7); "found at extraction" entries were spotted while building this TM; "claims-lint <rule>" entries are hits of src/data/claims-lint.json patterns for this locale in the text, at extraction time',
};

// ———————————————————————————— text helpers ————————————————————————————

// HTML whitespace (not U+3000 or NBSP) collapses to one space; <br> becomes \n.
const norm = (s) => String(s).split('\n').map((l) => l.replace(/[ \t\n\f\r]+/g, ' ').trim()).filter(Boolean).join('\n');
const stripTags = (s) => String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');

// Unicode decimal digits of the scripts we publish → ASCII, then the numbers of a string.
const DIGIT_ZEROS = [0x30, 0x660, 0x6f0, 0x966, 0xe50, 0xff10];
const numbersOf = (s) => (String(s).replace(/\p{Nd}/gu, (ch) => {
  const cp = ch.codePointAt(0);
  const zero = DIGIT_ZEROS.find((z) => cp >= z && cp <= z + 9);
  return zero === undefined ? ch : String(cp - zero);
}).match(/\d+/g) ?? []).sort();
const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ———————————————————————————— legacy HTML → segments ————————————————————————————

const SKIP = new Set(['script', 'style', 'svg', 'noscript', 'template']);
// Elements whose text is one segment (inline children such as <strong> or <br> are flattened into it).
const CONTAINERS = new Set(['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'a', 'button', 'span', 'label',
  'figcaption', 'td', 'th', 'dt', 'dd', 'summary', 'blockquote', 'option']);
const ATTRS = [['alt', 'alt'], ['aria-label', 'aria'], ['title', 'tooltip'], ['placeholder', 'placeholder']];

function flatText(el) {
  let s = '';
  const rec = (n) => {
    for (const c of n.children) {
      if (c.type === 'text') s += c.raw ? '' : c.text;
      else if (c.tag === 'br') s += '\n';
      else if (!SKIP.has(c.tag)) rec(c);
    }
  };
  rec(el);
  return norm(s);
}
const directText = (el) => el.children.some((c) => c.type === 'text' && !c.raw && c.text.trim());

function kindOf(el) {
  const inFaq = closest(el, (p) => hasClass(p, 'faq-item'));
  if (el.tag === 'title') return 'title';
  if (/^h[1-6]$/.test(el.tag)) return inFaq ? 'faq-q' : el.tag;
  if (el.tag === 'p') return inFaq ? 'faq-a' : 'p';
  if (el.tag === 'a') return /\bbtn/.test(el.attrs.class ?? '') ? 'button' : closest(el, (p) => p.tag === 'nav') ? 'nav' : 'link';
  if (el.tag === 'span' && hasClass(el, 'app-title')) return 'brand';
  return el.tag;
}

// Section = the nearest <section> (its id), <header>, <footer> or <head>.
const SECTIONS = new Set(['section', 'header', 'footer', 'head']);
const sectionOf = (el) => {
  const s = closest(el, (p) => SECTIONS.has(p.tag));
  return s ? (s.tag === 'section' ? (s.attrs.id || s.attrs.class?.split(/\s+/)[0] || 'section') : s.tag) : 'body';
};
const stepKey = (el) => `${el.tag}.${(el.attrs.class ?? '').trim().split(/\s+/)[0]}`;

// Structural path from the section element down to `el`: tag + first class, index among same-key siblings, count.
function pathOf(el) {
  const steps = [];
  for (let e = el; e && e.type === 'el' && e.parent; e = e.parent) {
    if (SECTIONS.has(e.tag)) break;
    const sibs = e.parent.children.filter((c) => c.type === 'el' && stepKey(c) === stepKey(e));
    steps.unshift({ key: stepKey(e), idx: sibs.indexOf(e), count: sibs.length, el: e });
  }
  return steps;
}

// Anchor of a segment: link target or image file (basename; img/en/x.png and img/x.png are the same image slot).
const anchorOf = (el) => (el.tag === 'a' ? `href:${el.attrs.href ?? ''}`
  : el.tag === 'img' ? `img:${(el.attrs.src ?? '').split(/[?#]/)[0].split('/').pop()}` : null);

function pageSegments(html) {
  const root = parseHTML(html);
  const htmlEl = [...elements(root)].find((e) => e.tag === 'html');
  const segs = [];
  const push = (el, kind, text, attr = null) => {
    if (!text) return;
    const section = sectionOf(el);
    if (kind === 'meta') { // identified by its name, not by its position among the <meta> elements
      segs.push({ el, kind, text, attr, section, steps: [], slot: `${section}/meta[name=${attr}]`, anchor: null });
      return;
    }
    const steps = pathOf(el);
    segs.push({ el, kind, text, attr, section, steps,
      slot: `${section}/${steps.map((s) => `${s.key}[${s.idx}]`).join('/')}${attr ? `@${attr}` : ''}`,
      anchor: anchorOf(el) });
  };
  const attrSegs = (el) => { for (const [a, kind] of ATTRS) if (el.attrs[a] !== undefined) push(el, kind, norm(el.attrs[a]), a); };
  const visit = (node, textAllowed) => {
    for (const c of node.children) {
      if (c.type === 'text') { if (textAllowed && !c.raw && c.text.trim()) push(node, 'text', norm(c.text)); continue; }
      if (SKIP.has(c.tag)) continue;
      attrSegs(c);
      if (c.tag === 'meta' && /^(description|keywords)$/i.test(c.attrs.name ?? '')) { push(c, 'meta', norm(c.attrs.content ?? ''), c.attrs.name.toLowerCase()); continue; }
      if (!CONTAINERS.has(c.tag)) { visit(c, true); continue; }
      const descend = !directText(c) && c.children.every((k) => k.type !== 'el' || CONTAINERS.has(k.tag) || !flatText(k));
      if (descend || !flatText(c)) { visit(c, false); continue; }
      push(c, kindOf(c), flatText(c));
      for (const d of elements(c)) if (!SKIP.has(d.tag)) attrSegs(d); // e.g. an <img alt> inside a link
    }
  };
  visit(root, false);
  return { lang: htmlEl?.attrs.lang ?? null, dir: htmlEl?.attrs.dir ?? null, segs, tags: tagCounts(root) };
}

// Element counts per section and tag (every element, inline ones included) — the structure report.
function tagCounts(root) {
  const out = {};
  for (const e of elements(root)) {
    if (e.tag === 'html' || e.tag === 'body') continue;
    const sec = sectionOf(e);
    out[sec] ??= {};
    out[sec][e.tag] = (out[sec][e.tag] ?? 0) + 1;
  }
  return out;
}

// Readable ids from the en structure: <section>[.<n> per repeated ancestor].<role>[.<n> when the element itself
// repeats]; ids that still collide get .1, .2 … in document order.
function assignIds(segs) {
  const raw = segs.map((s) => {
    if (s.kind === 'meta') return `${s.section}.${s.attr}`;
    const role = s.kind.startsWith(`${s.section}-`) ? s.kind.slice(s.section.length + 1) : s.kind;
    const last = s.steps[s.steps.length - 1];
    const outer = s.steps.slice(0, -1).filter((st) => st.count > 1).map((st) => st.idx + 1);
    return [s.section, ...outer, role, ...(last && last.count > 1 ? [last.idx + 1] : [])].join('.');
  });
  const seen = new Map();
  raw.forEach((id) => seen.set(id, (seen.get(id) ?? 0) + 1));
  const k = new Map();
  return raw.map((id) => (seen.get(id) > 1 ? `${id}.${k.set(id, (k.get(id) ?? 0) + 1).get(id)}` : id));
}

// The repeated block (outermost ancestor with same-key siblings) a segment belongs to, and its anchors.
const blockOf = (s) => s.steps.slice(0, -1).find((st) => st.count > 1)?.el ?? null;
function blockAnchors(segs) {
  const m = new Map();
  for (const s of segs) {
    const b = blockOf(s);
    if (b && s.anchor) m.set(b, [...(m.get(b) ?? []), s.anchor]);
  }
  return m;
}

// ———————————————————————————— alignment with index.html ————————————————————————————

function align(en, page) {
  const enBySlot = new Map(en.segs.map((s, i) => [s.slot, i]));
  const enBlocks = blockAnchors(en.segs);
  const pgBlocks = blockAnchors(page.segs);
  const used = new Set();
  const pairs = page.segs.map((s) => {
    const i = enBySlot.get(s.slot);
    if (i === undefined || used.has(i) || en.segs[i].kind !== s.kind) return { s, i: null };
    used.add(i);
    const e = en.segs[i];
    const notes = [];
    const groups = s.steps.map((st, n) => [st, e.steps[n]]).filter(([a, b]) => a.count !== b.count);
    for (const [a, b] of groups) notes.push(`${a.key.replace(/\.$/, '')} ×${a.count} here, ×${b.count} in ${MASTER}: paired by position`);
    if (s.anchor !== e.anchor) notes.push(`${s.el.tag === 'a' ? 'link target' : 'image'} differs: ${e.anchor} in ${MASTER}, ${s.anchor} here`);
    const eb = blockOf(e), pb = blockOf(s);
    const blockDiffers = eb && pb && JSON.stringify(enBlocks.get(eb) ?? []) !== JSON.stringify(pgBlocks.get(pb) ?? []);
    if (blockDiffers) notes.push(`its repeated block has different links/images (${(pgBlocks.get(pb) ?? []).join(' ')} vs ${(enBlocks.get(eb) ?? []).join(' ')})`);
    const ne = numbersOf(e.text), nt = numbersOf(s.text);
    if (ne.join() !== nt.join()) notes.push(`numbers differ: [${ne.join(', ')}] in ${MASTER}, [${nt.join(', ')}] here`);
    const aligned = !groups.length && !blockDiffers && !(s.el.tag === 'a' && s.anchor !== e.anchor);
    return { s, i, aligned, notes };
  });
  // Fallback for slots without an exact match: section + kind + position among the unmatched ones.
  const rest = (list, pick) => {
    const m = new Map();
    list.forEach((x, n) => { if (pick(x, n)) { const k = `${x.section}|${x.kind}`; m.set(k, [...(m.get(k) ?? []), n]); } });
    return m;
  };
  const enRest = rest(en.segs, (_, n) => !used.has(n));
  const pgRest = rest(page.segs, (_, n) => pairs[n].i === null);
  for (const [k, list] of pgRest) {
    const cand = enRest.get(k) ?? [];
    list.forEach((n, j) => {
      if (j >= cand.length) return;
      used.add(cand[j]);
      pairs[n] = { s: page.segs[n], i: cand[j], aligned: false, notes: [`structure differs from ${MASTER}: paired by section + kind + position`] };
    });
  }
  return { pairs, enOnly: en.segs.map((_, n) => n).filter((n) => !used.has(n)) };
}

// Section/tag counts that differ from index.html (inline-only differences are reported too: they do not move pairs).
function structureDiff(en, page) {
  const out = [];
  for (const sec of [...new Set([...Object.keys(en.tags), ...Object.keys(page.tags)])]) {
    const a = page.tags[sec] ?? {}, b = en.tags[sec] ?? {};
    const diffs = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((t) => (a[t] ?? 0) !== (b[t] ?? 0))
      .map((t) => `${t} ${a[t] ?? 0} (en ${b[t] ?? 0})`);
    if (diffs.length) out.push(`${sec}: ${diffs.join(', ')}`);
  }
  return out;
}

// ———————————————————————————— warnings ————————————————————————————

// Known problems of the legacy home template, by segment id (every locale translates the same claim). Sources:
// doc 08 §8.1 (reuse / rewrite / delete table), doc 01 §2.9 (C-01…C-17), doc 08 §1.1 (fact red lines).
const HOME_WARNINGS = {
  'head.title': 'doc 08 §8.1: generic "smart assistant" title, dropped; only the positioning "reading assistant for language learners" survives (hero.lede / meta.description, R39; doc 03 §3.1)',
  'head.description': 'doc 08 §8.1: deleted — "swiping text in your browser" reads as a browser extension: it is the built-in browser of an iPhone/iPad app (C-08); "sentence-by-sentence alignment" is jargon (C-16)',
  'hero.h1': 'doc 08 §8.1: deleted — the new H1 never splits off "Word by Word" and follows doc 03 §3.9 (F11)',
  'hero.p': 'doc 08 §8.1: "over 20 language pairs" is wrong — {uiLanguages} interface languages, translation into {targetLanguages} languages (C-07); "no need to switch apps" contradicts the product (an app with its own browser); "intelligent assistant" is a generic phrase — keep only "for language learners" (R39)',
  'hero.button.1': 'doc 08 §8.1: linked to #cta, not to the App Store (C-15); the new CTA is Apple\'s official badge (common.appStoreBadgeAlt)',
  'features.1.h3': 'doc 08 §8.1: "Sentence Alignment" is jargon (C-16, research 07 §2.3) → features[swipe] without it',
  'features.1.p': 'doc 08 §8.1: reusable for features[swipe] ("detects complete sentences" = Auto mode), except the "alignment" wording (C-16)',
  'features.2.p': 'doc 08 §8.1: reusable for features[lookup]; it omits the limitation that double-tap lookup does not work on Chinese, Japanese or Korean source text (F15)',
  'features.3.h3': 'doc 08 §1.1: "Listen & Speak" is wrong — the app has no speaking practice; features[speech] keeps AI Read + Local Read only',
  'features.3.p': 'doc 08 §1.1: "improve … speaking skills" is wrong (no speaking practice); the two voices (AI / on-device iOS) are right',
  'features.4.h3': 'doc 08 §8.1: deleted — duplicates the double-tap lookup (merged into features[lookup]; F8)',
  'features.4.p': 'doc 08 §8.1: deleted — duplicates the double-tap lookup (merged into features[lookup]; F8)',
  'features.5.h3': 'doc 08 §8.1: "Auto Grouping" (by date) is wrong — history is saved with the original sentence and can be cleared (→ features[history])',
  'features.5.p': 'doc 08 §8.1: "grouped by date" is wrong — history is saved with the original sentence and can be cleared (→ features[history])',
  'features.6.h3': 'doc 08 §8.1: deleted — the iOS app has no shortcuts, volume control or theme colours (C-03); features[display] / features[engines] describe the real settings',
  'features.6.p': 'doc 08 §8.1: wrong — no shortcuts, no volume control, no theme colours on iOS (C-03)',
  'cta.h2': 'doc 08 §8.1: rewritten as pricing.title (F16)',
  'cta.p.1': 'doc 08 §8.1: rewritten as pricing.lede (F16); quotas and prices are placeholders in the new copy, never literal numbers (doc 08 §1.4)',
  'cta.li.1': 'doc 08 §8.1: deleted — the higher daily quotas go into pricing.summary (F16)',
  'cta.li.2': 'doc 08 §8.1: wrong — Plus has daily AI-voice limits; never "unlimited AI pronunciation" (C-01)',
  'cta.li.3': 'doc 08 §8.1: wrong — syntax explanation is not Plus-only, the free plan has a daily quota (C-04)',
  'cta.li.4': 'doc 08 §8.1: wrong — custom themes and dark mode do not exist in the app (C-02)',
  'cta.li.5': 'doc 08 §8.1: wrong — "early access to new features" has no implementation in the app (doc 08 §1.1)',
  'cta.alt': 'doc 01 C-14: the legacy badge was the English artwork with an English alt on every page; the new site uses Apple\'s localized badges',
  'cta.p.2': 'doc 08 §8.1: wrong — subscriptions are managed or cancelled in the Apple account settings, not in the app (→ pricing.note)',
  'faq.1.a': 'doc 08 §8.1: "with your finger or mouse" is wrong (C-10); the left swipe that removes a translation is real but must not be mentioned (claims-lint swipe-left)',
  'faq.3.a': 'doc 08 §8.1: wrong quota — "20 AI pronunciations per day" (C-05); quotas are placeholders in the new copy (faq[free] + pricing table)',
  'faq.4.a': 'doc 08 §8.1: deleted — "initial version" (C-06); the app detects the source language, not the target language (C-06); "over 20 languages / language pairs" (C-07); "prompt template" is internal jargon (C-17)',
  'faq.5.a': 'doc 08 §8.1: deleted — history is not grouped by date; the history location described here is not reused (→ features[history])',
  'footer.p': 'doc 08 §8.1: "© 2025 WordByWord. All rights reserved." → footer.copyright "© {yearRange} Jinlong" (C-12); "No personal data is collected" is wrong — the app uses Firebase Analytics and the site GA4 (C-11); only "independently developed" survives (footer.madeBy)',
};
// Problems of single legacy pages that claims-lint does not catch (doc 01 C-09, C-17; the uk one was found here).
const LOCALE_WARNINGS = {
  'zh-Hans': {
    'faq.4.a': 'doc 01 C-17: English left in the copy ("target language", "Prompt 模板")',
    'faq.5.a': 'doc 01 C-17: English left in the copy ("Word History")',
  },
  'zh-Hant': {
    'faq.4.a': 'doc 01 C-17: English left in the copy ("Prompt 模板")',
    'faq.5.a': 'doc 01 C-17: English left in the copy ("Word History")',
  },
  ja: { 'footer.p': 'doc 01 C-17: "All rights reserved." left in English' },
  uk: { 'cta.p.2': 'found at extraction: English left in the copy ("iOS in-app purchase")' },
};
// doc 01 C-09, research 07 §2.3: translations that call the gesture "selecting text". claims-lint knows only some of
// these phrasings, so the stems found on the legacy pages are checked here too (ar: not يحدد = "identifies").
const SELECT_WORDING = { it: /selezion/iu, 'pt-BR': /selecion/iu, pl: /zaznacz/iu, tr: /seç/iu, hi: /चुन/u,
  ar: /حدد نص|عند تحديد/u, uk: /виділ/iu, ru: /выдел/iu };
function homeWarnings(id, code, text) {
  const hits = lint(text, code);
  const sel = SELECT_WORDING[code]?.exec(text);
  const c09 = sel && !hits.some((h) => h.startsWith('claims-lint selection-translate'))
    ? `doc 01 C-09: describes the gesture as selecting text ("${sel[0]}…") — it is a right swipe (research 07 §2.3)` : null;
  return [HOME_WARNINGS[id], LOCALE_WARNINGS[code]?.[id], c09, ...hits].filter(Boolean);
}

// SurfEnglish promo (doc 08 §8.3; doc 04 §5.7 T1–T8; rulings R40–R43, R76; doc 01 P3/P4).
const SIBLING_WARNINGS = {
  label: 'doc 08 §8.3: deleted — no "New" framing (doc 04 §5.7 T1; R40)',
  'bar.text': 'doc 08 §8.3: deleted with the announcement bar — outdated positioning, "faster" claim, "WordByWord team" (T1)',
  'bar.short': 'doc 08 §8.3: deleted with the announcement bar — outdated positioning (T1)',
  'promo.eyebrow': 'doc 04 §5.7 T2: reuse without the "New ·" prefix; "makers / team" → the developer (singular, third person)',
  'promo.tagline': 'doc 08 §8.3: deleted — outdated SE tagline (T1)',
  'promo.title': 'doc 08 §8.3: deleted — outdated SE positioning; the new title starts with "SurfEnglish: " + English news at your level (T1, T3; R40)',
  'promo.lead': 'doc 08 §8.3: deleted — outdated positioning; "X posts and podcasts" and the on-device voice are not used as SE selling points (T1; R41)',
  'promo.chips[2]': 'doc 04 §5.7 T1/T5: not used — an on-device / offline voice is not an SE-only selling point (R41)',
  'promo.site': 'doc 04 §5.7 T7: the new link text is SE\'s core phrase + brand, never the bare domain (R76)',
  'promo.store': 'doc 04 §5.7 T8: SE gets a text link "Get SurfEnglish on the App Store", never the black badge (R43); reuse only the verb',
  'promo.alts[0]': 'doc 04 §6 / R44: the screenshots changed (games-home crop); these alts describe images that are no longer used',
  'promo.alts[1]': 'doc 04 §6 / R44: the screenshots changed (games-home crop); these alts describe images that are no longer used',
  'promo.alts[2]': 'doc 04 §6 / R44: the screenshots changed (games-home crop); these alts describe images that are no longer used',
};
const SIBLING_LOCALE_WARNINGS = {
  'promo.note': (code) => (['de', 'fr', 'it', 'nl', 'pl', 'ru', 'tr', 'uk'].includes(code)
    ? 'doc 08 §8.3: "App in 12 <languages>" misleads — SurfEnglish has no interface in this language; use the doc 04 §5.7 uiNote instead (T6; P3, F10)'
    : 'doc 08 §1.4: language counts are placeholders ({se.uiLanguages}, {se.targetLanguages}) in the new copy'),
};
const SIBLING_ENTRY_WARNINGS = {
  'zh-Hans': 'SurfEnglish is not on the China mainland App Store (F18): zh-Hans shows no card and no App Store link, only FAQ / footer / about (R42; doc 08 §8.3)',
};

// claims-lint.json (L-14) on the TM text: rule ids whose patterns for this locale (or '*') match. Rules limited by
// `only` to other key paths are skipped; the SurfEnglish rules (only: sibling.*) apply to sibling-tm.json.
const CLAIMS = JSON.parse(readFileSync(join(ROOT, 'src/data/claims-lint.json'), 'utf8'));
function lint(text, code, { sibling = false } = {}) {
  const hits = [];
  for (const rule of CLAIMS.rules) {
    if (rule.only && !(sibling && rule.only.some((p) => p.startsWith('sibling.')))) continue;
    const pats = [...(rule.patterns?.[code] ?? []), ...(rule.patterns?.['*'] ?? [])];
    for (const src of pats) {
      const m = String(text).match(new RegExp(src, `u${rule.caseSensitive ? '' : 'i'}`));
      if (m) { hits.push(`claims-lint ${rule.id}: "${m[0]}"`); break; }
    }
  }
  return hits;
}

// A record in fixed field order; empty optional fields are left out.
function record({ id, kind, en, target, aligned, note, warnings }) {
  const r = { id, kind, en };
  if (target !== undefined) r.target = target;
  if (aligned !== undefined) r.aligned = aligned;
  if (note) r.note = note;
  if (warnings?.length) r.warnings = warnings;
  return r;
}

// ———————————————————————————— JS literal reader (I18N tables) ————————————————————————————

// Plain-data JS literals only: objects (bare or quoted keys), arrays, strings, numbers, true/false/null, trailing
// commas and comments. Anything else (identifiers, calls, template literals, concatenation) throws.
function readLiteral(src, start) {
  let i = start;
  const fail = (msg) => { throw new Error(`${msg} at offset ${i}: ${JSON.stringify(src.slice(i, i + 40))}`); };
  const ws = () => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src.startsWith('//', i)) { const e = src.indexOf('\n', i); i = e < 0 ? src.length : e + 1; continue; }
      if (src.startsWith('/*', i)) { const e = src.indexOf('*/', i + 2); if (e < 0) fail('unterminated comment'); i = e + 2; continue; }
      return;
    }
  };
  const ESC = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' };
  const str = () => {
    const q = src[i++];
    let out = '';
    while (i < src.length && src[i] !== q) {
      const c = src[i++];
      if (c === '\n') fail('newline in string');
      if (c !== '\\') { out += c; continue; }
      const e = src[i++];
      if (e in ESC) out += ESC[e];
      else if (e === 'x') { out += String.fromCharCode(parseInt(src.slice(i, i + 2), 16)); i += 2; }
      else if (e === 'u' && src[i] === '{') { const end = src.indexOf('}', i); out += String.fromCodePoint(parseInt(src.slice(i + 1, end), 16)); i = end + 1; }
      else if (e === 'u') { out += String.fromCharCode(parseInt(src.slice(i, i + 4), 16)); i += 4; }
      else if (e !== '\n') out += e; // \' \" \\ ; a backslash-newline is a line continuation
    }
    if (src[i] !== q) fail('unterminated string');
    i++;
    return out;
  };
  const list = (close, item) => {
    i++;
    for (;;) {
      ws();
      if (src[i] === close) { i++; return; }
      item();
      ws();
      if (src[i] === ',') { i++; continue; }
      if (src[i] === close) { i++; return; }
      fail(`expected "," or "${close}"`);
    }
  };
  const value = () => {
    ws();
    const c = src[i];
    if (c === '{') {
      const obj = {};
      list('}', () => {
        let key;
        if (src[i] === "'" || src[i] === '"') key = str();
        else { const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 200)); if (!m) fail('expected a key'); key = m[0]; i += key.length; }
        ws();
        if (src[i] !== ':') fail('expected ":"');
        i++;
        obj[key] = value();
      });
      return obj;
    }
    if (c === '[') { const arr = []; list(']', () => arr.push(value())); return arr; }
    if (c === "'" || c === '"') return str();
    const m = /^(-?\d+(\.\d+)?|true|false|null)(?![\w$])/.exec(src.slice(i, i + 40));
    if (!m) fail('unsupported syntax');
    i += m[0].length;
    return JSON.parse(m[0]);
  };
  return value();
}
function literalAfter(src, marker, file) {
  const at = src.indexOf(marker);
  if (at < 0) throw new Error(`${file}: "${marker}" not found`);
  return readLiteral(src, src.indexOf('{', at));
}

// Legacy locale keys of the JS tables (en, zh-CN, zh-TW, pt, …) → our locale codes.
function codeOfLegacyKey(key) {
  const k = key.toLowerCase();
  const l = LOCALES.find((x) => x.code.toLowerCase() === k) ?? LOCALES.find((x) => x.contentLanguage === k)
    ?? LOCALES.find((x) => x.legacy.includes(k));
  if (!l) throw new Error(`legacy locale key "${key}" matches no entry of LOCALES`);
  return l.code;
}

// ———————————————————————————— extraction ————————————————————————————

// 1) Legacy home pages and their locales.
const rootFiles = git('ls-tree', '--name-only', COMMIT).split('\n').filter(Boolean);
const pageFiles = rootFiles.filter((f) => f === MASTER || /^[a-z]{2}-top\.html$/.test(f));
if (!pageFiles.includes(MASTER)) throw new Error(`${MASTER} missing on ${BRANCH}`);
const sourcesOf = new Map(); // code → [file …] (index.html first for en, then LOCALES[].legacy order)
for (const l of LOCALES) {
  const files = l.legacy.map((p) => `${p}-top.html`).filter((f) => pageFiles.includes(f));
  if (l.code === 'en') files.unshift(MASTER);
  if (files.length) sourcesOf.set(l.code, files);
}
const unmapped = pageFiles.filter((f) => ![...sourcesOf.values()].some((fs) => fs.includes(f)));
if (unmapped.length) throw new Error(`legacy pages without a locale in LOCALES[].legacy: ${unmapped.join(' ')}`);

const pages = new Map(); // file → { blob, html, lang, dir, segs, tags }
for (const f of pageFiles) {
  const html = show(f);
  pages.set(f, { blob: blobOf(f), html, ...pageSegments(html) });
}
const en = pages.get(MASTER);
const enIds = assignIds(en.segs);
const headText = (p, kind, attr = null) => p.segs.find((s) => s.section === 'head' && s.kind === kind && s.attr === attr)?.text ?? null;

// 2) site-notice.js (also migrated to src/notice.json) and surfenglish-promo.js.
const NOTICE_FILE = 'js/site-notice.js';
const PROMO_FILE = 'js/surfenglish-promo.js';
const noticeT = literalAfter(show(NOTICE_FILE), 'const config =', NOTICE_FILE).translations;
const notice = new Map(Object.entries(noticeT).map(([k, v]) => [codeOfLegacyKey(k), v]));
const NOTICE_FIELDS = [['eyebrow', 'eyebrow'], ['title', 'heading'], ['message', 'p']]; // rendered as div / p / p
const promo = literalAfter(show(PROMO_FILE), 'const I18N =', PROMO_FILE);

function noticeSegments(code) {
  const mine = notice.get(code);
  const base = notice.get('en');
  if (!mine) return [];
  return NOTICE_FIELDS.map(([f, kind]) => record({
    id: `notice.${f}`, kind, en: norm(stripTags(base[f])),
    ...(code === 'en' ? { warnings: lint(base[f], 'en') } : { target: norm(stripTags(mine[f])), aligned: true, warnings: lint(mine[f], code) }),
  }));
}

// 3) Per-locale TM files.
const summary = [];
mkdirSync(OUT, { recursive: true });
const write = (name, obj) => writeFileSync(join(OUT, name), JSON.stringify(obj, null, 2) + '\n');
const noComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ');
const copyKey = (p) => JSON.stringify(p.segs.map((s) => [s.slot, s.kind, s.text]));
const kindsOf = (segments) => [...new Set(segments.map((s) => s.kind))].join(' | ');
const fieldDocs = (names, segments, extra = {}) => ({
  ...Object.fromEntries(names.map((n) => [n, n === 'kind' ? kindsOf(segments) : PAIR_FIELDS[n]])), ...extra });

for (const [code, files] of [...sourcesOf].sort(([a], [b]) => byCode(a, b))) {
  const primary = pages.get(files[0]);
  // Further pages of the same locale: byte-identical, or with the same copy, or (never on the frozen branch) own segments.
  const sources = files.map((f, n) => {
    const p = pages.get(f);
    const src = { file: f, blob: p.blob };
    if (n === 0) return src;
    src.duplicateOf = files[0];
    src.byteIdentical = p.blob === primary.blob;
    if (!src.byteIdentical) {
      src.difference = noComments(p.html) === noComments(primary.html) ? 'only HTML comments and whitespace differ; the extracted copy is identical'
        : copyKey(p) === copyKey(primary) ? 'markup differs; the extracted copy is identical'
          : 'the extracted copy differs: its segments are listed too, marked with "source"';
    }
    if (p.lang !== primary.lang) src.lang = p.lang;
    if (p.dir !== primary.dir) src.dir = p.dir;
    return src;
  });
  const distinct = files.filter((f, n) => n === 0 || copyKey(pages.get(f)) !== copyKey(primary));

  let segments = [];
  let alignment = null;
  if (code === 'en') {
    if (distinct.length > 1) throw new Error(`${distinct.slice(1).join(' ')}: copy differs from ${MASTER} — extend the en branch of this script`);
    segments = en.segs.map((s, n) => record({ id: enIds[n], kind: s.kind, en: s.text, warnings: homeWarnings(enIds[n], 'en', s.text) }));
  } else {
    const enOnly = [];
    const structure = [];
    for (const f of distinct) {
      const p = pages.get(f);
      const res = align(en, p);
      const pageIds = assignIds(p.segs);
      for (const [n, { s, i, aligned, notes }] of res.pairs.entries()) {
        const rec = i === null
          ? record({ id: `${pageIds[n]}.extra`, kind: s.kind, en: null, target: s.text, aligned: false, // .extra never collides with an en id
            note: `no counterpart in ${MASTER}`, warnings: homeWarnings(null, code, s.text) })
          : record({ id: enIds[i], kind: s.kind, en: en.segs[i].text, target: s.text, aligned, note: notes.join('; '),
            warnings: homeWarnings(enIds[i], code, s.text) });
        if (distinct.length > 1) rec.source = f;
        segments.push(rec);
      }
      enOnly.push(...res.enOnly.map((n) => enIds[n]));
      structure.push(...structureDiff(en, p).map((d) => (distinct.length > 1 ? `${f}: ${d}` : d)));
    }
    const aligned = segments.filter((s) => s.aligned).length;
    alignment = { reference: MASTER, pairs: segments.length, aligned, unaligned: segments.length - aligned, enOnly, structure };
  }
  const noticeSegs = noticeSegments(code);
  const isEn = code === 'en';
  write(`${code}.json`, {
    _meta: {
      ...META(isEn
        ? `Legacy en home page (${MASTER}) — the "en" side of every pair in the other files — plus the ${NOTICE_FILE} strings.`
        : `Legacy ${code} home page (${files.join(', ')}) aligned segment by segment with ${MASTER}, plus the ${NOTICE_FILE} strings.`),
      fields: {
        ...Object.fromEntries(Object.entries(PAGE_FIELDS).filter(([k]) => !isEn || k !== 'alignment')),
        ...fieldDocs(isEn ? ['id', 'kind', 'en', 'warnings'] : Object.keys(PAIR_FIELDS), [...segments, ...noticeSegs],
          isEn ? { en: 'the legacy en text (<br> kept as \\n, inline emphasis as plain text, whitespace collapsed)' } : {}),
      },
    },
    locale: code,
    legacy: LOCALES.find((l) => l.code === code).legacy,
    sources,
    lang: primary.lang,
    dir: primary.dir,
    title: headText(primary, 'title'),
    description: headText(primary, 'meta', 'description'),
    ...(alignment ? { alignment } : {}),
    segments,
    notice: noticeSegs,
  });
  summary.push({ code, files, segments: segments.length, unaligned: alignment?.unaligned ?? 0, enOnly: alignment?.enOnly.length ?? 0,
    structure: alignment?.structure ?? [] });
}

// 4) sibling-tm.json — js/surfenglish-promo.js I18N, flattened in table order.
function flatten(entry, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(entry)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (['sitePath', 'badge', 'dir'].includes(key)) continue; // configuration, reported per locale
    if (Array.isArray(v)) v.forEach((x, n) => out.push([`${key}[${n}]`, x]));
    else if (v && typeof v === 'object') out.push(...flatten(v, key));
    else out.push([key, v]);
  }
  return out;
}
// Kinds follow the element each string was rendered into (mountSection / mountBar of the promo script).
const SIBLING_KINDS = { label: 'label', 'bar.text': 'bar', 'bar.short': 'bar', 'bar.cta': 'link', 'bar.more': 'link',
  'bar.close': 'aria', 'promo.eyebrow': 'eyebrow', 'promo.tagline': 'tagline', 'promo.title': 'h2', 'promo.lead': 'p',
  'promo.site': 'link', 'promo.note': 'note', 'promo.store': 'alt' };
const siblingKind = (id) => SIBLING_KINDS[id] ?? (id.startsWith('promo.chips[') ? 'li' : id.startsWith('promo.alts[') ? 'alt' : 'text');
const enPromo = new Map(flatten(promo.en));
const siblingLocales = {};
for (const [key, entry] of Object.entries(promo)) {
  const code = codeOfLegacyKey(key);
  const flat = flatten(entry);
  if (JSON.stringify(flat.map(([k]) => k)) !== JSON.stringify([...enPromo.keys()])) throw new Error(`${PROMO_FILE} I18N.${key}: keys differ from en`);
  siblingLocales[code] = {
    legacyKey: key,
    sitePath: entry.sitePath ?? null,
    badge: entry.badge ?? null,
    dir: entry.dir ?? null,
    ...(SIBLING_ENTRY_WARNINGS[code] ? { warning: SIBLING_ENTRY_WARNINGS[code] } : {}),
    segments: flat.map(([id, v]) => record({
      id, kind: siblingKind(id), en: norm(stripTags(enPromo.get(id))),
      ...(code === 'en' ? {} : { target: norm(stripTags(v)), aligned: true }),
      warnings: [SIBLING_WARNINGS[id], SIBLING_LOCALE_WARNINGS[id]?.(code), ...lint(stripTags(v), code, { sibling: true })].filter(Boolean),
    })),
  };
}
const allSibling = Object.values(siblingLocales).flatMap((l) => l.segments);
write('sibling-tm.json', {
  _meta: {
    ...META(`SurfEnglish cross-promotion of the legacy site (${PROMO_FILE}, I18N table: label, announcement bar, promo `
      + 'section) — the only existing de/fr/it/nl/pl/ru/tr/uk translations of SurfEnglish copy (research 04 §6.1). Rewrite '
      + 'into sibling.* per doc 08 §2 / §7.8 and doc 04 §5.7 T1–T10.'),
    fields: {
      locales: 'one entry per I18N language, keyed by our locale code',
      legacyKey: 'key of the I18N table (zh-CN, zh-TW and pt are zh-Hans, zh-Hant and pt-BR)',
      sitePath: 'surfenglish.app path the promo linked to; "" = the English home page, i.e. SurfEnglish had no page in this language',
      badge: 'Apple badge locale the promo used',
      dir: 'text direction set by the promo ("rtl" for ar), null = page direction',
      warning: 'a problem that concerns the whole language',
      segments: 'the strings in table order: label, bar.* (announcement bar), promo.* (promo section)',
      ...fieldDocs(['id', 'kind', 'en', 'target', 'aligned', 'warnings'], allSibling, {
        id: 'key path in the I18N table, arrays 0-based as doc 04 §5.7 cites them (promo.chips[2])',
        en: 'the I18N.en string with the same key (inline <strong> as plain text)',
        aligned: 'always true: the strings are paired by their key in the I18N table, and every language has exactly the keys of en (checked)',
      }),
    },
  },
  source: { file: PROMO_FILE, blob: blobOf(PROMO_FILE) },
  locales: Object.fromEntries(Object.entries(siblingLocales).sort(([a], [b]) => byCode(a, b))),
});

// 5) Report.
console.log(`${BRANCH} @ ${COMMIT.slice(0, 7)} → ${OUT.slice(ROOT.length + 1)}/`);
for (const s of summary) {
  console.log(`  ${s.code.padEnd(8)} ${s.files.join(' + ').padEnd(26)} ${String(s.segments).padStart(3)} segments`
    + (s.code === 'en' ? ' (reference)' : `, ${s.unaligned} unaligned, ${s.enOnly} en-only`)
    + (s.structure.length ? ` | vs ${MASTER}: ${s.structure.join('; ')}` : ''));
}
console.log(`  sibling-tm.json: ${Object.keys(siblingLocales).length} languages × ${enPromo.size} segments (${PROMO_FILE})`);
console.log(`  notice: ${notice.size} languages × ${NOTICE_FIELDS.length} segments (${NOTICE_FILE}), in each <code>.json`);
