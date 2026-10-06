// Build-time validation — doc 06 §3.7 (38 rules: L-1…L-14 on locale JSON and data files, D-1…D-24 on dist),
// §3.8 signatures. E = error (build fails), W = warning (printed, never blocks).
//
//   validateConfig(cfg, issues)            SITE / LOCALES / CONTRACTS / ALIASES / SIBLING / notice (D-10, D-11, D-12
//                                          self-test over every flag combination, D-17, D-22, D-24, L-11)
//   validateLocales(cfg, strings, issues)  L-1 … L-14 for every published locale
//   validateDist(dist, ctx, issues)        D-1 … D-24 (src/lib/validate-dist.mjs)
//
// cfg = loadConfig(root) from src/lib/context.mjs; issues = { error: [], warn: [] }; every message starts with the
// rule id ("L-8 ja meta.title too long …"). Inputs that do not exist yet in this milestone (glossary for a published
// locale, the simplified-only character list) produce a single W instead of an error.

import { join } from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

import { buildRedirects } from './seo.mjs';
import { textLength, graphemes, wuLimit, unitLabel } from './text-length.mjs';
import { shape, leaves, getPath, keyMatch, keyMatchAny, isObj } from './keypath.mjs';
import {
  err, warn, newIssues, loadData, re, compileAll, escapeRe, hasToken, displayText, makeVars, rendered,
  primaryLang, publishedLocales, PAGE_KEY_ROOT, RICH_LINK,
} from './validate-util.mjs';
import { checkRedirectRules, expectedRedirects, readRedirectFixture, simulatedDistFiles } from './validate-dist.mjs';

export { validateDist } from './validate-dist.mjs';

// ———————————————————————————— constants (doc 06 §3.1–3.3, §4.1–4.3) ————————————————————————————

const SCRIPTS = new Set(['latn', 'cyrl', 'cjk', 'thai', 'deva', 'arab']);
const RESERVED_PATHS = ['about', 'guides', 'chrome-extension', 'legal', '.well-known', 'assets', 'icons']; // doc 02 §2.5
const CHROME_STORE_RE = /^https:\/\/chromewebstore\.google\.com\/detail\/[a-z0-9-]+\/[a-p]{32}$/; // doc 06 §3.1
const PLACEMENTS = ['card', 'faq', 'footer', 'about'];                 // R42: no placement ③ (langHint)
const PER_LOCALE_KEYS = ['card', 'availabilityNote', 'uiNote'];
// doc 06 §8.5 defines `outage`; `maintenance` and `info` are accepted as neutral variants of the same banner.
const NOTICE_LEVELS = ['outage', 'maintenance', 'info'];
const NOTICE_PAGES = ['all', 'home'];
const REDIRECT_FLAGS = ['indexHtmlRule', 'experimentL', 'experimentC'];

// L-1: keys removed from the schema (doc 06 §4.2 "已删除的键", §4.5 rename table and R77 notes; R74, R77).
const DELETED_KEYS = [
  'meta.keywords', 'sibling.languagesTip', 'sibling.section', 'sibling.footerLabel', 'sibling.footerLinkText', 'sibling.faq',
  'pricing.free.points', 'pricing.plus.points', 'common.closeUpSuffix', 'faq.items[*].aS1', 'demo.headline', 'demo.more',
  'demo.ui.modeAuto', 'features[*].sample.post', 'features[*].sample.author', 'features[*].sample.lang', 'features[x].sample.label',
];
// L-1: optional keys (`?` in doc 06 §4.2): absent in a locale is fine.
const OPTIONAL_KEYS = [
  'nav.downloadShort', 'hero.ledeShort', 'demo.byline', 'demo.lookup', 'features[*].note', 'features[*].sample.name',
  'gallery.items[*].hidden', 'faq.items[*].hidden', 'faq.items[*].aExtLive',
];
// L-2: arrays aligned by id; L-2 also pins the feature id set and the FAQ ids other documents link to.
const ID_ARRAYS = ['features', 'faq.items', 'gallery.items', 'chromeExtension.features', 'chromeExtension.faq', 'chromeExtension.shots'];
const FEATURE_IDS = ['swipe', 'lookup', 'x', 'chunks', 'speech', 'syntax', 'engines', 'display', 'history', 'devices'];
const FAQ_REQUIRED = ['what-is', 'english-learner', 'devices', 'account', 'restore', 'android'];
// L-5: values that are empty by design (an unused keyboard key; the row-header column of the about table).
const EMPTY_OK = ['chromeExtension.features[*].key', 'about.family.table.head[0]'];
// Keys that hold codes or data rather than copy (not translated, not measured).
const NON_COPY = ['*.id', 'features[*].id', 'faq.items[*].id', 'gallery.items[*].id', 'about.sections[*].id', 'chromeExtension.features[*].id',
  'chromeExtension.faq[*].id', 'chromeExtension.shots[*].id', 'demo.sourceLang', 'features[*].image', 'chromeExtension.features[*].image',
  'about.links[*].ref', 'about.family.links[*].ref', 'chromeExtension.features[*].key'];
const isNonCopy = (path) => keyMatchAny(NON_COPY, path) || /(^|\.)(id|ref|image)$/.test(path);

// L-7: [[ ]] keys (R65) and the heading-type fields where {wbr} may appear (doc 06 §4.1, R61).
const KW_EXACTLY_ONE = ['hero.title', 'chromeExtension.hero.title'];
const KW_AT_MOST_ONE = ['meta.ogHeadline'];
const WBR_FIELDS = ['hero.title', 'featuresIntro.title', 'features[*].title', 'gallery.title', 'languages.title', 'pricing.title',
  'sibling.card.title', 'faq.title', 'cta.title', 'chromeExtension.hero.title',
  'chromeExtension.howTitle', 'chromeExtension.shotsTitle', 'chromeExtension.languages.title', 'chromeExtension.faqTitle', 'chromeExtension.iosBand.title',
  // "及各按钮文字" — button labels
  'nav.download', 'nav.downloadShort', 'hero.secondaryCta', 'chromeExtension.cta.available', 'chromeExtension.cta.contact',
  'chromeExtension.iosBand.link', 'sibling.card.linkText', 'sibling.card.appStoreLinkText'];
// L-7: rich fields (`**strong**`, `[text](@ref)`, blank-line paragraphs) and the ref whitelist (doc 06 §4.1, doc 08 S16/S26).
const RICH_FIELDS = ['faq.items[*].a', 'faq.items[*].aExtLive', 'about.lede', 'about.sections[*].text', 'about.sections[*].steps',
  'about.facts[*].value', 'about.timeline.items[*].text', 'about.maker.text', 'about.family.text', 'about.family.closing',
  'about.disambiguation.text', 'about.contact.text', 'chromeExtension.faq[*].a'];
export const REF_WHITELIST = ['@appstore', '@se-site', '@se-appstore', '@se-maker', '@support', '@support-mail', '@privacy', '@about',
  '@chrome', '@home', '@features', '@faq', '@appstore-dev'];

// L-8: length rules (doc 06 §4.2 first, doc 08 §7.6 where §4.2 is silent). First match wins.
//   n: limit in the script's own unit (Latin/Cyrillic/Arabic graphemes; Thai/Devanagari visible characters) — CJK
//      uses `cjk` (full-width) or n / 2; wu: doc 08 width units (CJK = wu / 2); words: Latin word count.
const LENGTH_RULES = [
  { keys: ['features[engines].text', 'features[display].text', 'features[history].text', 'features[devices].text'], n: 80, cjk: 40, why: 'spec list, R78' },
  { keys: ['hero.title'], n: 75, cjk: 32, why: 'H1' },
  { keys: ['common.figLabel', 'common.noteLabel'], wu: 8 },
  { keys: ['common.langFallbackNote'], skip: true },
  { keys: ['common.*'], wu: 40 },
  { keys: ['nav.ariaMain', 'nav.ariaLanguages'], skip: true },
  { keys: ['nav.downloadShort'], wu: 10 },
  { keys: ['nav.*'], wu: 16 },
  { keys: ['footer.ariaNav'], wu: 16 },
  { keys: ['hero.eyebrow'], wu: 60 },
  { keys: ['hero.lede'], n: 150, cjk: 70 },
  { keys: ['hero.ledeShort'], n: 90, cjk: 45 },
  { keys: ['hero.ctaNote'], wu: 40 },
  { keys: ['hero.how'], n: 220 },
  { keys: ['hero.platformNote'], wu: 140 },
  { keys: ['hero.secondaryCta'], n: 24 },
  { keys: ['demo.articleTitle'], n: 60 },
  { keys: ['demo.byline'], n: 40 },
  { keys: ['features[*].kicker'], wu: 32, why: 'room for the app\'s own feature name in Latin scripts (owner, 2026-10-06)' },
  { keys: ['features[*].title'], wu: 70 },
  { keys: ['features[*].text'], n: 320 },
  { keys: ['features[*].bullets[*]'], wu: 80 },
  { keys: ['features[x].sample.source'], n: 100 },
  { keys: ['features[x].sample.translation'], n: 120, cjk: 50, thai: 110 },
  { keys: ['features[x].sample.name'], wu: 24 },
  { keys: ['features[x].sample.time'], wu: 8 },
  { keys: ['faq.items[*].q'], n: 120 },
  { keys: ['faq.items[*].a', 'faq.items[*].aExtLive'], n: 600 },
  { keys: ['languages.title', 'cta.title'], wu: 70 },
  { keys: ['cta.recap'], n: 90 },
  { keys: ['pricing.summary'], wu: 100 },
  { keys: ['sibling.card.title'], n: 60, cjk: 24 },
  { keys: ['sibling.card.points[*]'], wu: 45 },
  { keys: ['sibling.card.linkText', 'sibling.card.appStoreLinkText'], n: 60, cjk: 30, enSite: 80 },
  { keys: ['sibling.card.body'], words: 45, cjk: 110 },
];
const ALT_KEY = /^(alt|\w*Alt)$/; // last key segment: alt, ogImageAlt, shotAlt, appStoreBadgeAlt …

function limitFor(rule, script) {
  if (rule.wu !== undefined) return wuLimit(rule.wu, script);
  if (rule[script] !== undefined) return rule[script];
  if (script === 'cjk') return rule.n / 2;
  return rule.n;
}

// L-9: zones (doc 03 §1.4: title / H1 / description / OG / features H2) for SurfEnglish-owned words, per page.
const SE_ZONE = ['meta.title', 'meta.description', 'meta.ogHeadline', 'meta.ogSubline', 'meta.ogImageAlt', 'hero.title', 'featuresIntro.title',
  'about.meta.title', 'about.meta.description', 'about.h1', 'chromeExtension.meta.title', 'chromeExtension.meta.description',
  'chromeExtension.meta.ogImageAlt', 'chromeExtension.hero.title'];
const HOWTO_ZONE = ['meta.title', 'hero.title', 'meta.description', 'cta.title'];      // home title, H1, description, #cta H2
const PAGE_TITLE_H1 = { home: ['meta.title', 'hero.title'], about: ['about.meta.title', 'about.h1'],
  'chrome-extension': ['chromeExtension.meta.title', 'chromeExtension.hero.title'] };

// L-12: placeholders that hold counts (R62) and locales that must use plural objects.
const COUNT_PLACEHOLDERS = /^(uiLanguages|targetLanguages|se\.uiLanguages|se\.targetLanguages|ext\.targetLanguages|quota\.[\w]+\.(free|plus)|n)$/;
const PLURAL_LOCALES = ['ru', 'uk', 'pl', 'ar'];

// L-4: brand / product words that need no translation (doc 06 L-4 list + obvious proper names).
const BRAND_WORDS = ['WordByWord Translate', 'WordByWord Plus', 'WordByWord', 'SurfEnglish', 'Apple Vision Pro', 'Vision Pro', 'App Store', 'iPhone',
  'iPad', 'Mac', 'Plus', 'Chunks', 'Action Flow', 'Azure', 'Google', 'Apple', 'iOS', 'macOS', 'Chrome', 'Microsoft Edge', 'Safari', 'Twitter', 'X',
  'AI', 'OpenAI', 'Gemini', 'Jinlong'];
const L4_EXPECTED = ['demo.ui.domain', 'features[chunks].sample.sentence', 'features[chunks].sample.chunks', 'features[chunks].sample.flowLabel',
  'features[chunks].sample.flow', 'meta.appStoreName', 'pricing.plus.name', 'footer.copyright', 'features[x].sample.handle'];

const URL_RE = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|app|co|jp|cn|uk|de|fr|es|me|tv|ly|gl|gg|ai|dev)\b/i;
const SCRIPT_OF_LANG = {
  zh: /\p{Script=Han}/u, ja: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u, ko: /\p{Script=Hangul}/u,
  ru: /\p{Script=Cyrillic}/u, uk: /\p{Script=Cyrillic}/u, ar: /\p{Script=Arabic}/u, th: /\p{Script=Thai}/u, hi: /\p{Script=Devanagari}/u,
};
const scriptReFor = (lang) => SCRIPT_OF_LANG[primaryLang(lang)] ?? /\p{Script=Latin}/u;

// Share of letters written in the script of `lang` (L-10 "written in demo.sourceLang").
function scriptShare(text, lang) {
  const want = scriptReFor(lang);
  let letters = 0, hits = 0;
  for (const ch of String(text)) {
    if (!/\p{L}/u.test(ch)) continue;
    letters++;
    if (want.test(ch)) hits++;
  }
  return letters ? hits / letters : 1;
}

// ———————————————————————————— validateConfig ————————————————————————————

export function validateConfig(cfg, issues) {
  const { SITE, LOCALES, CONTRACTS, ALIASES, SIBLING } = cfg;
  const E = (id, m) => err(issues, id, m);
  const W = (id, m) => warn(issues, id, m);

  // ——— D-22: LOCALES assertions (doc 06 §3.2) ———
  for (const field of ['code', 'path', 'hreflang', 'og']) {
    const seen = new Map();
    for (const l of LOCALES) {
      const v = String(l[field]).toLowerCase();
      if (seen.has(v)) E('D-22', `LOCALES ${field} "${l[field]}" is used by both ${seen.get(v)} and ${l.code}`);
      else seen.set(v, l.code);
    }
  }
  const legacySeen = new Map();
  const aliasFrom = new Set(ALIASES.map((a) => a.from));
  for (const l of LOCALES) {
    const at = `LOCALES ${l.code}`;
    if (!SCRIPTS.has(l.script)) E('D-22', `${at}: script "${l.script}" is not one of ${[...SCRIPTS].join('|')} (R60)`);
    if (!/^[a-z]{2,3}(-[a-z]{2})?$/.test(l.contentLanguage ?? '')) E('D-22', `${at}: contentLanguage "${l.contentLanguage}" must match ^[a-z]{2,3}(-[a-z]{2})?$ (R47)`);
    if (l.dir !== 'ltr' && l.dir !== 'rtl') E('D-22', `${at}: dir "${l.dir}" must be ltr or rtl`);
    if (l.path !== '' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.path ?? '')) E('D-22', `${at}: path "${l.path}" must be lower-case a-z0-9 with hyphens`);
    if (RESERVED_PATHS.includes(l.path) || aliasFrom.has(l.path)) E('D-22', `${at}: path "${l.path}" collides with a reserved path or locale alias (doc 02 §2.5)`);
    if (!/^[a-z]{2,3}(-([A-Z][a-z]{3}|[A-Z]{2}))?$/.test(l.hreflang ?? '')) E('D-22', `${at}: hreflang "${l.hreflang}" is not a BCP 47 language[-Script|-REGION] tag`);
    if (!/^[a-z]{2,3}_[A-Z]{2}$/.test(l.og ?? '')) E('D-22', `${at}: og "${l.og}" must look like ll_CC`);
    if (!/^[a-z]{2}-[a-z]{2}$/.test(l.badge ?? '')) E('D-22', `${at}: badge "${l.badge}" must look like ll-cc (F28)`);
    if (typeof l.publish !== 'boolean') E('D-22', `${at}: publish must be a boolean`);
    if (!Array.isArray(l.legacy)) E('D-22', `${at}: legacy must be an array of legacy file prefixes`);
    for (const x of l.hreflangExtra ?? []) {
      if (LOCALES.some((o) => o.hreflang.toLowerCase() === String(x).toLowerCase())) E('D-22', `${at}: hreflangExtra "${x}" duplicates a locale hreflang (R53)`);
    }
    for (const old of l.legacy ?? []) {
      if (legacySeen.has(old)) E('D-22', `${at}: legacy prefix "${old}" is also used by ${legacySeen.get(old)}`);
      legacySeen.set(old, l.code);
    }
  }
  const en = LOCALES.find((l) => l.code === 'en');
  if (!en) E('D-22', 'LOCALES has no en entry');
  else {
    if (en.path !== '') E('D-22', 'en must live at / (path "")');
    if (!en.publish) E('D-22', 'en must be published (doc 06 §3.2)');
  }
  const aliasSeen = new Set();
  for (const a of ALIASES) {
    if (!LOCALES.some((l) => l.code === a.to)) E('D-12', `alias /${a.from}/ points to unknown locale "${a.to}"`);
    if (LOCALES.some((l) => l.path && l.path === a.from)) E('D-12', `alias /${a.from}/ collides with a locale path`);
    if (aliasSeen.has(a.from)) E('D-12', `alias /${a.from}/ is listed twice`);
    aliasSeen.add(a.from);
  }

  // ——— D-24: Chrome extension store URL (doc 06 §3.1, R2) ———
  const u = SITE.chromeStoreUrl;
  if (u !== null && u !== undefined && u !== '' && !CHROME_STORE_RE.test(String(u))) {
    E('D-24', `SITE.chromeStoreUrl "${u}" must be null/'' (S0) or match ${CHROME_STORE_RE.source} (S1)`);
  }

  // ——— D-10: the canonical origin ———
  if (!/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(SITE.url ?? '')) E('D-10', `SITE.url "${SITE.url}" must be an https origin without a trailing slash`);
  if (/pages\.dev/.test(SITE.url ?? '')) E('D-10', 'SITE.url must not be a pages.dev host');

  // ——— D-12: contract mode and redirect switches (doc 02 §5.2.1) ———
  const cm = SITE.contractMode;
  if (typeof cm === 'string') { if (!['proxy', 'file'].includes(cm)) E('D-12', `SITE.contractMode "${cm}" must be 'proxy' or 'file'`); }
  else if (isObj(cm)) {
    for (const [k, v] of Object.entries(cm)) {
      if (!CONTRACTS.some((c) => c.id === k)) E('D-12', `SITE.contractMode has unknown contract "${k}"`);
      if (!['proxy', 'file'].includes(v)) E('D-12', `SITE.contractMode.${k} "${v}" must be 'proxy' or 'file'`);
    }
  } else E('D-12', 'SITE.contractMode must be a string or a per-contract object');
  const flags = SITE.redirectFlags ?? {};
  for (const k of REDIRECT_FLAGS) if (typeof flags[k] !== 'boolean') E('D-12', `SITE.redirectFlags.${k} must be a boolean`);
  for (const k of Object.keys(flags)) if (!REDIRECT_FLAGS.includes(k)) E('D-12', `SITE.redirectFlags has unknown switch "${k}"`);
  // a switch away from the doc 02 §5.2.1 default needs its preview measurement (M1-03); C without one could loop
  const evidence = SITE.redirectEvidence ?? {};
  for (const k of Object.keys(evidence)) if (!REDIRECT_FLAGS.includes(k)) E('D-12', `SITE.redirectEvidence has unknown switch "${k}"`);
  if (flags.experimentC && !evidence.experimentC) E('D-12', 'SITE.redirectFlags.experimentC is on without a preview measurement in SITE.redirectEvidence: a case-insensitive _redirects match would loop (doc 02 §5.3-5, Q22)');
  if (flags.experimentL && !evidence.experimentL) W('D-12', 'SITE.redirectFlags.experimentL is on without a preview measurement in SITE.redirectEvidence (doc 02 §5.4)');
  if (SITE.indexNowKey != null && !/^[A-Za-z0-9-]{8,128}$/.test(SITE.indexNowKey)) E('D-14', `SITE.indexNowKey "${SITE.indexNowKey}" is not a valid IndexNow key (8–128 characters from a-z A-Z 0-9 -)`);
  for (const c of CONTRACTS) {
    const at = `contract ${c.id}`;
    if (!/^\/[a-z0-9/-]+\.html$/.test(c.public ?? '')) E('D-12', `${at}: public "${c.public}" must be a .html path`);
    if (c.bare !== c.public?.replace(/\.html$/, '')) E('D-12', `${at}: bare must be public without .html`);
    if (c.bareSlash !== `${c.bare}/`) E('D-12', `${at}: bareSlash must be bare + "/"`);
    if (!/^\/legal\/[a-z0-9-]+\/$/.test(c.internal ?? '')) E('D-12', `${at}: internal "${c.internal}" must be /legal/<slug>/`);
    const src = join(cfg.root ?? '.', c.source ?? '');
    if (!c.source || !existsSync(src)) E('D-14', `${at}: legal source ${c.source} missing`);
    else if (!/^<!--\s*updated:\s*\d{4}-\d{2}-\d{2}\s*-->$/.test(readFileSync(src, 'utf8').split('\n', 1)[0])) {
      E('D-14', `${at}: first line of ${c.source} must be "<!-- updated: YYYY-MM-DD -->" (ENG-14)`);
    }
  }

  // ——— D-11: App Store attribution (H3, R3, R55) ———
  if (!SITE.pt) W('D-11', 'SITE.pt (App Store provider token, H3) is not set: App Store links are plain /app/id<ID> links without campaign attribution');
  if (!(SITE.ct?.maxLen <= 30)) E('D-11', 'SITE.ct.maxLen must be ≤ 30 (App Store ct limit)');
  if (!(SITE.ct?.maxDistinct >= 1)) E('D-11', 'SITE.ct.maxDistinct must be a positive number');

  // ——— L-11: SurfEnglish recommendation config (doc 04 §3.7, doc 06 §4.3; R42, R43) ———
  for (const k of Object.keys(SIBLING.placements ?? {})) {
    if (!PLACEMENTS.includes(k)) E('L-11', k === 'langHint' ? 'SIBLING.placements.langHint: placement ③ was removed (R42)' : `SIBLING.placements has unknown placement "${k}"`);
  }
  for (const k of PLACEMENTS) if (typeof SIBLING.placements?.[k] !== 'boolean') E('L-11', `SIBLING.placements.${k} must be a boolean`);
  for (const [code, v] of Object.entries(SIBLING.perLocale ?? {})) {
    if (!LOCALES.some((l) => l.code === code)) E('L-11', `SIBLING.perLocale has unregistered locale "${code}"`);
    for (const k of Object.keys(v ?? {})) if (!PER_LOCALE_KEYS.includes(k)) E('L-11', `SIBLING.perLocale.${code}.${k} is not a known field (${PER_LOCALE_KEYS.join(', ')})`);
  }
  for (const code of Object.keys(SIBLING.seLocalePath ?? {})) if (!LOCALES.some((l) => l.code === code)) E('L-11', `SIBLING.seLocalePath has unregistered locale "${code}"`);
  if ('badgeLocale' in SIBLING) E('L-11', 'SIBLING.badgeLocale: SurfEnglish uses no App Store badge (R43)');
  const reviewed = SIBLING.copyReviewedAt;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewed ?? '')) E('L-11', 'SIBLING.copyReviewedAt must be YYYY-MM-DD');
  else {
    const now = cfg.now ? new Date(cfg.now) : new Date();
    const days = Math.floor((now - new Date(`${reviewed}T00:00:00Z`)) / 86400000);
    if (days > 180) W('L-11', `SIBLING.copyReviewedAt ${reviewed} is ${days} days old (> 180): re-review the SurfEnglish copy (doc 04 §3.7)`);
  }

  // ——— D-17: site notice (doc 06 §8.5) ———
  const n = cfg.notice ?? {};
  if (typeof n.enabled !== 'boolean') E('D-17', 'notice.enabled must be a boolean');
  if (!NOTICE_LEVELS.includes(n.level)) E('D-17', `notice.level "${n.level}" must be one of ${NOTICE_LEVELS.join(', ')}`);
  if (!NOTICE_PAGES.includes(n.pages)) E('D-17', `notice.pages "${n.pages}" must be one of ${NOTICE_PAGES.join(', ')}`);
  if (n.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(n.updated)) E('D-17', 'notice.updated must be YYYY-MM-DD');
  if ('suppressSibling' in n) E('D-17', 'notice.suppressSibling was removed: SIBLING.suppressWhenNotice hides placement ① only (R35)');
  if (!n.copy?.en) E('D-17', 'notice.copy.en is required (fallback copy)');
  for (const [code, c] of Object.entries(n.copy ?? {})) {
    if (!LOCALES.some((l) => l.code === code)) E('D-17', `notice.copy has unregistered locale "${code}"`);
    for (const f of ['eyebrow', 'title', 'message']) if (typeof c?.[f] !== 'string' || !c[f].trim()) E('D-17', `notice.copy.${code}.${f} must be a non-empty string`);
  }
  if (n.enabled) {
    const missing = LOCALES.filter((l) => l.publish && !n.copy?.[l.code]).map((l) => l.code);
    if (missing.length) W('D-17', `notice is enabled but has no copy for ${missing.join(' ')}: falls back to en`);
  }

  // ——— D-12 self-test: every switch combination must generate a valid _redirects (doc 02 §5.5 (g), ENG-02) ———
  redirectsSelfTest(cfg, issues);
}

function redirectsSelfTest(cfg, issues) {
  const fixtureFile = join(cfg.root ?? '.', 'scripts/fixtures/redirects.default.txt');
  if (!existsSync(fixtureFile)) { err(issues, 'D-12', 'scripts/fixtures/redirects.default.txt missing (doc 02 §5.2.2 fixture, R54)'); return; }
  const fixture = readRedirectFixture(fixtureFile);
  const failures = [];
  const ids = cfg.CONTRACTS.map((c) => c.id);
  for (let f = 0; f < 8; f++) {
    const redirectFlags = { indexHtmlRule: Boolean(f & 1), experimentL: Boolean(f & 2), experimentC: Boolean(f & 4) };
    for (let m = 0; m < 1 << ids.length; m++) {
      const contractMode = Object.fromEntries(ids.map((id, i) => [id, m & (1 << i) ? 'file' : 'proxy']));
      const site = { ...cfg.SITE, contractMode, redirectFlags };
      let gen;
      try { gen = buildRedirects({ SITE: site, LOCALES: cfg.LOCALES, CONTRACTS: cfg.CONTRACTS, ALIASES: cfg.ALIASES }); } catch (e) {
        failures.push(`${JSON.stringify(redirectFlags)} ${JSON.stringify(contractMode)}: generator threw ${e.message}`);
        continue;
      }
      const local = newIssues();
      checkRedirectRules(gen.rules, {
        cfg, site, files: simulatedDistFiles(cfg, site), expected: expectedRedirects(fixture, { cfg, site }),
        counts: { static: gen.static, dynamic: gen.dynamic }, label: 'self-test',
      }, local);
      for (const e of local.error) failures.push(`flags ${JSON.stringify(redirectFlags)} modes ${JSON.stringify(contractMode)}: ${e}`);
    }
  }
  for (const f of failures.slice(0, 5)) err(issues, 'D-12', `self-test ${f}`);
  if (failures.length > 5) err(issues, 'D-12', `self-test: ${failures.length - 5} more failures`);
}

// ———————————————————————————— validateLocales ————————————————————————————

export function validateLocales(cfg, strings, issues) {
  if (cfg && !cfg.LOCALES && strings?.LOCALES) [cfg, strings] = [strings, cfg]; // doc 06 §3.8 writes (strings, cfg, issues)
  const E = (id, m) => err(issues, id, m);
  const W = (id, m) => warn(issues, id, m);
  const data = loadData(cfg);
  const en = strings?.en;
  if (!en) { E('L-1', 'src/locales/en.json missing — en is the structural master (doc 06 §4.4)'); return; }

  const unpublished = cfg.LOCALES.filter((l) => !l.publish).map((l) => l.code);
  if (unpublished.length) W('L-1', `not published yet (no copy): ${unpublished.join(' ')}`);
  for (const code of Object.keys(strings)) if (!cfg.LOCALES.some((l) => l.code === code)) E('L-1', `locale file ${code}.json is not a registered locale`);
  // loadStrings only opens registered codes, so a misnamed file (zh-hans.json, pt-br.json) would never publish silently
  const localeDir = join(cfg.root ?? '.', 'src/locales');
  const files = existsSync(localeDir) ? readdirSync(localeDir).filter((f) => f.endsWith('.json')) : [];
  for (const f of files) if (!cfg.LOCALES.some((l) => `${l.code}.json` === f)) E('L-1', `src/locales/${f} is not a registered locale file — codes are case-sensitive (LOCALES in src/site.mjs)`);

  const X = {
    cfg, data, E, W, en, enShape: shape(en),
    agg: { identical: new Map(), extras: new Map(), uncovered: new Map(), howtoUncovered: [], glossaryMissing: [] },
    pageRoots: pageRoots(cfg),
  };
  const pub = publishedLocales(cfg, strings);

  checkMasterIds(X);
  for (const l of pub) {
    const t = strings[l.code];
    const c = { l, code: l.code, t, script: l.script, vars: makeVars(cfg, l, t), seMode: cfg.seMode(l), leaves: leaves(t) };
    ruleL1(X, c);
    ruleL2(X, c);
    ruleL3(X, c);
    if (l.code !== 'en') ruleL4(X, c);
    ruleL5(X, c);
    ruleL6(X, c);
    ruleL7(X, c);
    ruleL8(X, c);
    ruleL9(X, c);
    ruleL10(X, c);
    ruleL11(X, c);
    ruleL12(X, c);
    ruleL13(X, c);
    ruleL14(X, c);
  }

  // aggregated warnings (one line per locale; lists longer than 20 keys are cut, `check.mjs --keys` lists extra keys in full)
  const list = (a) => (a.length > 20 ? `${a.slice(0, 20).join(', ')} … (+${a.length - 20} more)` : a.join(', '));
  for (const [code, keys] of X.agg.extras) W('L-1', `${code}: ${keys.length} key(s) not in en: ${list(keys)}`);
  for (const [code, { expected, review }] of X.agg.identical) {
    const parts = [];
    if (review.length) parts.push(`review: ${list(review)}`);
    if (expected.length) parts.push(`expected (doc 08 §1.5): ${list(expected)}`);
    W('L-4', `${code}: ${expected.length + review.length} value(s) identical to en — ${parts.join('; ')}`);
  }
  for (const [code, rules] of X.agg.uncovered) W('L-14', `${code}: claims-lint rules without ${code} or '*' patterns (not covered, review by hand): ${rules.join(', ')}`);
  if (X.agg.howtoUncovered.length) W('L-9', `no reserved G1 how-to patterns in keyword-map.json for: ${X.agg.howtoUncovered.join(' ')} (doc 03 §3.8)`);
  if (X.agg.glossaryMissing.length) W('L-13', `src/data/glossary/<code>.json missing for published locale(s): ${X.agg.glossaryMissing.join(' ')} — glossary checks ①② skipped`);
  const needSimplified = pub.filter((l) => l.code === 'zh-Hant' || l.code === 'ja').map((l) => l.code);
  if (needSimplified.length && !data.simplifiedOnly) {
    W('L-13', `src/data/glossary/_simplified-only.txt missing (OpenCC-derived list, doc 06 §4.3) — simplified-character check ④ skipped for ${needSimplified.join(' ')}`);
  } else if (needSimplified.includes('ja') && data.simplifiedOnly && !data.simplifiedOnlyJa) {
    W('L-13', 'src/data/glossary/_simplified-only-ja.txt missing (ja subset without Jōyō kanji) — check ④ skipped for ja');
  }

  uniquePrimary(X, pub, strings);
}

// Page-specific key roots (L-3) and the locales that must provide them.
function pageRoots(cfg) {
  const roots = {};
  for (const p of cfg.PAGES) {
    const root = PAGE_KEY_ROOT[p.id];
    if (!root || p.locales === '*') continue;
    roots[root] = (roots[root] ?? []).concat(p.locales);
  }
  return roots;
}

const SPECIFIC = (X) => [...Object.keys(X.pageRoots), 'sibling.card', 'sibling.availability'];
const under = (root, path) => path === root || path.startsWith(`${root}.`) || path.startsWith(`${root}[`);

// ——— L-2 (master): fixed feature ids, required FAQ ids, unique ids in en ———
function checkMasterIds(X) {
  const { en, E } = X;
  const fids = (en.features ?? []).map((f) => f.id);
  const missing = FEATURE_IDS.filter((id) => !fids.includes(id));
  const extra = fids.filter((id) => !FEATURE_IDS.includes(id));
  if (missing.length || extra.length) E('L-2', `en features[] id set must be ${FEATURE_IDS.join(',')} (doc 06 §4.2)${missing.length ? `; missing ${missing.join(',')}` : ''}${extra.length ? `; unexpected ${extra.join(',')}` : ''}`);
  const qids = (en.faq?.items ?? []).map((q) => q.id);
  const qmiss = FAQ_REQUIRED.filter((id) => !qids.includes(id));
  if (qmiss.length) E('L-2', `en faq.items[] must include ${qmiss.join(', ')} (doc 06 §4.2, R73)`);
}

// ——— L-1: key consistency with en, removed keys, fixed-length arrays ———
function ruleL1(X, c) {
  const { E } = X;
  const ls = shape(c.t);
  for (const [p] of ls) if (keyMatchAny(DELETED_KEYS, p)) E('L-1', `${c.code} ${p}: removed key (doc 06 §4.2 / §4.5, R74, R77)`);

  // fixed-length arrays (doc 06 L-1)
  const lb = getPath(c.t, 'features[lookup].bullets');
  const eb = getPath(X.en, 'features[lookup].bullets');
  if (Array.isArray(lb) && Array.isArray(eb) && lb.length !== eb.length) E('L-1', `${c.code} features[lookup].bullets has ${lb.length} items, en has ${eb.length} (pins ①②③)`);
  const lim = getPath(c.t, 'languages.limits');
  if (lim !== undefined && (!Array.isArray(lim) || lim.length !== 2)) E('L-1', `${c.code} languages.limits must have exactly 2 items (F15)`);

  if (c.code === 'en') return;
  const specific = SPECIFIC(X);
  const reported = [];
  const isReported = (p) => reported.some((r) => under(r, p));
  const enIdArrays = new Map();
  for (const [p, info] of X.enShape) if (info.kind === 'array:id') enIdArrays.set(p, info.ids);
  // a subtree of an id that is absent on either side is L-2's business
  const foreignId = (p, sh, other) => {
    for (const [arr, ids] of sh) {
      if (!p.startsWith(`${arr}[`)) continue;
      const id = p.slice(arr.length + 1).split(']')[0];
      const otherIds = other.get(arr);
      if (otherIds && !otherIds.includes(id)) return true;
    }
    return false;
  };
  const locIdArrays = new Map();
  for (const [p, info] of ls) if (info.kind === 'array:id') locIdArrays.set(p, info.ids);

  for (const [p, info] of X.enShape) {
    if (specific.some((r) => under(r, p)) || isReported(p) || foreignId(p, enIdArrays, locIdArrays)) continue;
    const mine = ls.get(p);
    if (!mine) {
      if (keyMatchAny(OPTIONAL_KEYS, p)) { reported.push(p); continue; }
      E('L-1', `${c.code} ${p}: missing (no per-key fallback to en, doc 06 §4.4)`);
      reported.push(p);
      continue;
    }
    if (!compatibleKind(info, mine)) {
      E('L-1', `${c.code} ${p}: type ${describeKind(mine)} differs from en ${describeKind(info)}`);
      reported.push(p);
    }
  }
  const extras = [];
  for (const [p] of ls) {
    if (X.enShape.has(p) || specific.some((r) => under(r, p)) || foreignId(p, locIdArrays, enIdArrays) || keyMatchAny(DELETED_KEYS, p)) continue;
    if ([...extras].some((x) => under(x, p))) continue;
    extras.push(p);
  }
  if (extras.length) X.agg.extras.set(c.code, extras);
}

function compatibleKind(a, b) {
  if (a.kind === b.kind) return a.kind !== 'array:scalar' || b.elem.split('|').every((k) => a.elem.split('|').includes(k));
  const arrays = (k) => k.startsWith('array:');
  if (arrays(a.kind) && arrays(b.kind) && (a.kind === 'array:empty' || b.kind === 'array:empty')) return true;
  return false;
}
const describeKind = (i) => (i.kind === 'array:scalar' ? `array of ${i.elem}` : i.kind.replace('array:id', 'array of objects with id').replace('array:object', 'array of objects'));

// ——— L-2: id sets of the arrays aligned by id ———
function ruleL2(X, c) {
  const { E, W } = X;
  for (const path of ID_ARRAYS) {
    const mine = getPath(c.t, path);
    const master = getPath(X.en, path);
    if (!Array.isArray(mine)) continue;
    const ids = mine.map((x) => (isObj(x) ? x.id : undefined));
    if (ids.some((id) => typeof id !== 'string' || !id)) E('L-2', `${c.code} ${path}: every item needs a string id`);
    const dup = ids.filter((id, i) => id && ids.indexOf(id) !== i);
    if (dup.length) E('L-2', `${c.code} ${path}: duplicate id(s) ${[...new Set(dup)].join(', ')}`);
    if (c.code === 'en' || !Array.isArray(master)) continue;
    const mids = master.map((x) => x.id);
    const missing = mids.filter((id) => !ids.includes(id));
    const extra = ids.filter((id) => id && !mids.includes(id));
    if (missing.length) E('L-2', `${c.code} ${path}: id(s) missing vs en: ${missing.join(', ')} (hide an item with "hidden": true instead of deleting it)`);
    if (extra.length) E('L-2', `${c.code} ${path}: id(s) not in en: ${extra.join(', ')}`);
    if (!missing.length && !extra.length && ids.join() !== mids.join()) W('L-2', `${c.code} ${path}: same ids as en but a different order`);
  }
}

// ——— L-3: page- and placement-specific keys ———
function ruleL3(X, c) {
  const { E } = X;
  const SIB = X.cfg.SIBLING;
  for (const [root, locs] of Object.entries(X.pageRoots)) {
    const required = locs.includes(c.code);
    const mine = getPath(c.t, root);
    if (required && mine === undefined) { E('L-3', `${c.code} ${root}.* is required for this locale (${{ chromeExtension: 'R1', notfound: 'R21', legal: 'contract pages are en-only, doc 06 §5.5' }[root] ?? 'about is en-only'})`); continue; }
    if (mine === undefined || c.code === 'en') continue;
    compareSubtree(X, c, root, required ? 'E' : 'W');
  }
  // sibling.card.* — placement ① renders only where seMode ≠ 'no-card' (R42)
  const cardVisible = SIB.enabled && SIB.placements?.card && c.seMode !== 'no-card';
  const card = getPath(c.t, 'sibling.card');
  if (cardVisible && card === undefined) E('L-3', `${c.code} sibling.card.* is required (placement ① renders for this locale)`);
  else if (cardVisible && c.code !== 'en') compareSubtree(X, c, 'sibling.card', 'E', ['sibling.card.uiNote']);
  if (c.seMode === 'en-site' && cardVisible && !String(getPath(c.t, 'sibling.card.uiNote') ?? '').trim()) {
    E('L-3', `${c.code} sibling.card.uiNote is required when seMode = 'en-site' (doc 06 §4.2)`);
  }
  if (SIB.perLocale?.[c.code]?.availabilityNote && !String(getPath(c.t, 'sibling.availability') ?? '').trim()) {
    E('L-3', `${c.code} sibling.availability is required (SIBLING.perLocale.${c.code}.availabilityNote, R42)`);
  }
}

function compareSubtree(X, c, root, level, ignore = []) {
  const enSub = [...X.enShape].filter(([p]) => under(root, p) && !ignore.some((i) => under(i, p)));
  const mine = shape(c.t);
  const out = [];
  for (const [p, info] of enSub) {
    if (out.some((r) => under(r, p))) continue;
    const m = mine.get(p);
    if (!m) { if (!keyMatchAny(OPTIONAL_KEYS, p)) out.push(p); continue; }
    if (!compatibleKind(info, m)) X.E('L-3', `${c.code} ${p}: type ${describeKind(m)} differs from en ${describeKind(info)}`);
  }
  if (!out.length) return;
  const msg = `${c.code} ${root}: missing ${out.join(', ')}`;
  if (level === 'E') X.E('L-3', msg); else X.W('L-3', `${msg} (optional page copy for this locale)`);
}

// ——— L-4: values identical to en ———
function ruleL4(X, c) {
  const enLeaves = new Map(leaves(X.en).map((x) => [x.path, x.value]));
  const expected = [], review = [];
  const strip = (s) => {
    let v = String(s).replace(/\{[^{}]*\}/g, ' ').replace(RICH_LINK, '$1');
    for (const w of BRAND_WORDS) v = v.replace(re(`(?<![\\p{L}])${escapeRe(w)}(?![\\p{L}])`, 'gu'), ' ');
    return v.replace(/\[\[|\]\]|\*\*/g, '').replace(/[\p{P}\p{S}\p{N}\s]/gu, '');
  };
  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string' || !value.trim() || isNonCopy(path) || path.startsWith('seo.')) continue;
    if (enLeaves.get(path) !== value || !strip(value)) continue;
    (keyMatchAny(L4_EXPECTED, path) ? expected : review).push(path);
  }
  if (expected.length || review.length) X.agg.identical.set(c.code, { expected, review });
}

// ——— L-5: empty values and leftovers ———
function ruleL5(X, c) {
  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string') continue;
    if (!value.trim()) { if (!keyMatchAny(EMPTY_OK, path)) X.E('L-5', `${c.code} ${path}: empty string`); continue; }
    // upper-case markers only (Spanish "todo" is a word), "lorem" in any case
    const m = value.match(/(?<![\p{L}])(TODO|TBD|XXX|FIXME)(?![\p{L}])/u) ?? value.match(/lorem ipsum|\blorem\b/iu);
    if (m) X.E('L-5', `${c.code} ${path}: placeholder text "${m[0]}"`);
  }
}

// ——— L-6: placeholders and plural syntax (R62) ———

// Matching close brace for "{" at i (nested ICU branches); -1 when unbalanced.
function closeBrace(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return j;
  }
  return -1;
}

// Walk the placeholders of a string: onName(name), onPlural(name, branches{sel: text}), onError(msg).
export function scanPlaceholders(str, { onName, onPlural, onError }) {
  const s = String(str ?? '');
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '}') { onError('unbalanced "}"'); continue; }
    if (s[i] !== '{') continue;
    const end = closeBrace(s, i);
    if (end < 0) { onError('unbalanced "{"'); return; }
    const body = s.slice(i + 1, end);
    i = end;
    if (body === 'wbr') continue;
    const icu = body.match(/^\s*([\w.]+)\s*,\s*(\w+)\s*,(.*)$/s);
    if (!icu) { onName(body.trim()); continue; }
    const [, name, type, rest] = icu;
    if (type !== 'plural') { onError(`{${name}, ${type}, …}: only "plural" is supported`); continue; }
    const branches = {};
    let k = 0;
    while (k < rest.length) {
      if (/\s/.test(rest[k])) { k++; continue; }
      const m = rest.slice(k).match(/^([^\s{}]+)\s*\{/);
      if (!m) { onError(`{${name}, plural, …}: malformed branch near "${rest.slice(k, k + 12)}"`); break; }
      const open = k + m[0].length - 1;
      const close = closeBrace(rest, open);
      if (close < 0) { onError(`{${name}, plural, …}: unbalanced branch "${m[1]}"`); break; }
      branches[m[1]] = rest.slice(open + 1, close);
      k = close + 1;
    }
    onPlural(name, branches);
  }
}

function ruleL6(X, c) {
  const { E } = X;
  const known = new Set(Object.keys(c.vars).filter((k) => k !== 'n' && k !== 'set'));
  const numeric = new Set(Object.entries(c.vars).filter(([k, v]) => typeof v === 'number' && k !== 'n').map(([k]) => k));
  let cats;
  try { cats = new Set(new Intl.PluralRules(c.code).resolvedOptions().pluralCategories); } catch { cats = new Set(['other']); }
  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string' || isNonCopy(path) && !keyMatch('features[*].image', path)) continue;
    const allowLocal = (name) => (name === 'n' && path === 'pricing.table.perDay') || (name === 'set' && keyMatch('features[*].image', path));
    const visit = (str) => scanPlaceholders(str, {
      onName: (name) => { if (!known.has(name) && !allowLocal(name)) E('L-6', `${c.code} ${path}: unknown placeholder {${name}}`); },
      onError: (msg) => E('L-6', `${c.code} ${path}: ${msg}`),
      onPlural: (name, branches) => {
        if (!numeric.has(name) && !(name === 'n' && path === 'pricing.table.perDay')) E('L-6', `${c.code} ${path}: {${name}, plural} needs a numeric placeholder`);
        if (!('other' in branches)) E('L-6', `${c.code} ${path}: {${name}, plural} has no "other" branch`);
        for (const [sel, text] of Object.entries(branches)) {
          if (!/^=\d+$/.test(sel) && !cats.has(sel)) E('L-6', `${c.code} ${path}: plural category "${sel}" is not one of ${[...cats].join('/')} for ${c.code}`);
          visit(text);
        }
      },
    });
    visit(value);
  }
}

// ——— L-7: markup ———
function ruleL7(X, c) {
  const { E, W } = X;
  const cjkWbr = ['ja', 'zh-Hans', 'zh-Hant'].includes(c.code);
  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string' || isNonCopy(path)) continue;
    // [[ ]] (R65)
    const opens = (value.match(/\[\[/g) ?? []).length;
    const closes = (value.match(/\]\]/g) ?? []).length;
    if (opens !== closes) E('L-7', `${c.code} ${path}: unbalanced [[ ]]`);
    if (KW_EXACTLY_ONE.includes(path)) { if (opens !== 1) E('L-7', `${c.code} ${path}: needs exactly one [[highlight]] (R65), found ${opens}`); }
    else if (KW_AT_MOST_ONE.includes(path)) { if (opens > 1) E('L-7', `${c.code} ${path}: at most one [[highlight]] (R65), found ${opens}`); }
    else if (opens) E('L-7', `${c.code} ${path}: [[ ]] is only allowed in hero.title, chromeExtension.hero.title and meta.ogHeadline (R65)`);
    // {wbr} (R61, I18-03)
    const isHeading = keyMatchAny(WBR_FIELDS, path);
    if (value.includes('{wbr}')) {
      if (!isHeading) E('L-7', `${c.code} ${path}: {wbr} is only allowed in heading-type fields (doc 06 §4.1)`);
      else if (c.code === 'ko') W('L-7', `${c.code} ${path}: {wbr} is not needed in Korean (spaces break lines, R61)`);
      else if (!cjkWbr) E('L-7', `${c.code} ${path}: {wbr} is only for ja / zh-Hans / zh-Hant (R61)`);
      if (c.code === 'ja') {
        const segs = value.split('{wbr}').slice(1, -1);
        for (const s of segs) {
          const len = graphemes(displayText(s));
          if (len > 10) W('L-7', `${c.code} ${path}: segment "${displayText(s)}" between two {wbr} is ${len} characters (> 10)`);
        }
      }
    }
    if (isHeading && value.includes('｜')) E('L-7', `${c.code} ${path}: full-width ｜ is a title separator, not a line break — use {wbr} (I18-03)`);
    // rich markup only in rich fields; refs from the whitelist
    const isRich = keyMatchAny(RICH_FIELDS, path);
    for (const m of value.matchAll(RICH_LINK)) {
      if (!isRich) E('L-7', `${c.code} ${path}: link markup [${m[1]}](${m[2]}) in a plain-text field`);
      else if (!REF_WHITELIST.includes(m[2])) E('L-7', `${c.code} ${path}: link target "${m[2]}" is not a whitelisted @ref (doc 06 §4.1)`);
    }
    if (!isRich && value.includes('**')) E('L-7', `${c.code} ${path}: **strong** markup in a plain-text field`);
    if (/(^|[^*\w])\*[^*\s][^*]*\*(?!\*)/.test(value.replace(/\*\*[^*]+\*\*/g, ''))) {
      W('L-7', `${c.code} ${path}: single-asterisk emphasis is not supported and renders literally (only **strong**)`);
    }
    if (/<\/?[a-z][a-z0-9]*[\s>/]/i.test(value)) W('L-7', `${c.code} ${path}: HTML markup is escaped and renders as text`);
  }
  for (const key of ['about.links', 'about.family.links']) {
    for (const [i, x] of (getPath(c.t, key) ?? []).entries()) {
      if (x?.ref && !REF_WHITELIST.includes(x.ref)) E('L-7', `${c.code} ${key}[${i}].ref "${x.ref}" is not a whitelisted @ref`);
    }
  }
}

// ——— L-8: lengths by writing system (R14, doc 03 §3.1) ———
function ruleL8(X, c) {
  const { E, W } = X;
  const u = unitLabel(c.script);
  const len = (s) => textLength(rendered(s, c.vars, c.code), c.script);
  const fmt = (n) => `${u}${Math.round(n * 10) / 10}`;
  const t = c.t;
  // meta.title (E), meta.description (W range, E beyond +25 %)
  const TITLE = { latn: 60, cyrl: 60, arab: 60, thai: 60, deva: 60, cjk: 32 }[c.script];
  const DESC = { latn: [120, 160], cyrl: [120, 160], arab: [120, 160], cjk: [50, 90], thai: [100, 160], deva: [100, 160] }[c.script];
  const checkTitle = (key) => {
    const v = getPath(t, key);
    if (typeof v !== 'string') return;
    const n = len(v);
    if (n > TITLE) E('L-8', `${c.code} ${key} too long: ${fmt(n)} > ${TITLE} (doc 03 §3.1)`);
  };
  const checkDesc = (key) => {
    const v = getPath(t, key);
    if (typeof v !== 'string') return;
    const n = len(v);
    if (n > DESC[1] * 1.25) E('L-8', `${c.code} ${key} too long: ${fmt(n)} > ${DESC[1]} + 25 %`);
    else if (n < DESC[0] || n > DESC[1]) W('L-8', `${c.code} ${key} length ${fmt(n)} outside ${DESC[0]}–${DESC[1]} (doc 03 §3.1)`);
  };
  checkTitle('meta.title'); checkDesc('meta.description');
  checkTitle('about.meta.title'); checkDesc('about.meta.description');
  checkTitle('chromeExtension.meta.title'); checkDesc('chromeExtension.meta.description');

  // [[ ]] phrase: ≤ 3 Latin words or ≤ 6 CJK characters (doc 08 §7.6, R65)
  for (const key of KW_EXACTLY_ONE) {
    const v = getPath(t, key);
    const m = typeof v === 'string' ? v.match(/\[\[(.+?)\]\]/) : null;
    if (!m) continue;
    const phrase = displayText(m[1]);
    if (c.script === 'cjk' ? graphemes(phrase.replace(/\s/g, '')) > 6 : phrase.trim().split(/\s+/).length > 3) {
      W('L-8', `${c.code} ${key}: highlighted phrase "${phrase}" is longer than ${c.script === 'cjk' ? '6 characters' : '3 words'} (R65)`);
    }
  }

  // arrays measured as a whole
  const total = (key, rule) => {
    const v = getPath(t, key);
    if (!Array.isArray(v)) return;
    const n = v.reduce((a, s) => a + len(s), 0);
    const max = rule[c.script] ?? (c.script === 'cjk' ? rule.cjk ?? rule.n / 2 : rule.n);
    if (n > max) W('L-8', `${c.code} ${key} total ${fmt(n)} > ${max}`);
  };
  total('demo.context', { n: 360 });
  total('demo.translation', { n: 180, cjk: 70, thai: 150 });
  if (Array.isArray(t.demo?.context) && (t.demo.context.length < 1 || t.demo.context.length > 2)) W('L-8', `${c.code} demo.context should have 1–2 paragraphs (R66)`);

  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string' || isNonCopy(path) || path.startsWith('seo.')) continue;
    if (ALT_KEY.test(path.split('.').pop())) {
      const n = graphemes(rendered(value, c.vars, c.code));
      if (n > 125) W('L-8', `${c.code} ${path}: alt text ${n} characters > 125`);
    }
    const rule = LENGTH_RULES.find((r) => keyMatchAny(r.keys, path));
    if (!rule || rule.skip) continue;
    if (rule.words && c.script !== 'cjk') {
      const words = rendered(value, c.vars, c.code).trim().split(/\s+/).length;
      if (words > rule.words) W('L-8', `${c.code} ${path}: ${words} words > ${rule.words}`);
      continue;
    }
    let max = rule.words ? rule.cjk : limitFor(rule, c.script);
    if (rule.enSite && c.seMode === 'en-site' && c.script !== 'cjk') max = rule.enSite;
    const n = len(value);
    if (n > max) W('L-8', `${c.code} ${path} too long: ${fmt(n)} > ${max}${rule.why ? ` (${rule.why})` : ''}`);
  }
}

// ——— L-9: brand, keyword ownership, how-to reservation, SEO lint (doc 03 §3.8; R27, R39, R40, R46) ———
function ruleL9(X, c) {
  const { E, W, data } = X;
  const t = c.t;
  const km = data.keywordMap ?? {};
  const val = (k) => { const v = getPath(t, k); return typeof v === 'string' ? rendered(v, c.vars, c.code) : null; };
  const badRe = (src, e) => E('L-9', `keyword-map.json: invalid pattern "${src}" (${e})`);

  const title = val('meta.title');
  if (title !== null) {
    if (!/^WordByWord/.test(title)) E('L-9', `${c.code} meta.title must start with "WordByWord" (brand position, doc 03 §3.1): "${title}"`);
    const must = getPath(t, 'seo.titleMust');
    if (!Array.isArray(must) || !must.length) E('L-9', `${c.code} seo.titleMust missing (doc 03 §3.8)`);
    else {
      const miss = must.filter((tok) => !hasToken(title, tok, c.script));
      if (miss.length) E('L-9', `${c.code} meta.title lacks seo.titleMust token(s): ${miss.join(', ')}`);
    }
  }
  // SurfEnglish-owned primary words (doc 03 §1.4)
  const se = compileAll(km.seOwned?.[c.code], 'iu', badRe);
  for (const key of SE_ZONE) {
    const v = val(key);
    if (v === null) continue;
    for (const r of se) if (r.test(v)) E('L-9', `${c.code} ${key}: SurfEnglish-owned keyword /${r.source}/ in "${v}" (baseline §B4, doc 03 §1.4)`);
  }
  // G1 how-to phrasing (R46)
  const g1 = km.reserved?.G1?.[c.code];
  if (!g1) X.agg.howtoUncovered.push(c.code);
  for (const r of compileAll(g1, 'iu', badRe)) {
    for (const key of HOWTO_ZONE) {
      const v = val(key);
      if (v !== null && r.test(v)) E('L-9', `${c.code} ${key}: how-to phrasing /${r.source}/ is reserved for guide G1 (R46): "${v}"`);
    }
  }
  // brand in eyebrow and the first sentence of the definition (R27, R39)
  const eyebrow = val('hero.eyebrow');
  if (eyebrow !== null && !eyebrow.includes('WordByWord')) E('L-9', `${c.code} hero.eyebrow must contain "WordByWord" (R27)`);
  for (const key of ['hero.lede', 'hero.ledeShort']) {
    const v = val(key);
    if (v === null) continue;
    const first = v.split(/(?<=[.!?。！？])\s*/u)[0];
    if (!first.includes('WordByWord')) E('L-9', `${c.code} ${key}: first sentence must contain "WordByWord" (R27, R39)`);
  }
  // description names the platform (SEO-11)
  const desc = val('meta.description');
  const platform = km.platform?.[c.code] ?? km.platform?.['*'] ?? ['iPhone'];
  if (desc !== null && !platform.some((p) => desc.includes(p))) E('L-9', `${c.code} meta.description must mention ${platform.join(' / ')} (SEO-11)`);
  // K1 primary core tokens in title or H1 (I18-06 ④)
  const tokens = km.primaryTokens?.home?.[c.code];
  if (tokens && title !== null) {
    const zone = `${title} ${val('hero.title') ?? ''}`;
    const miss = tokens.filter((tok) => !hasToken(zone, tok, c.script));
    if (miss.length) W('L-9', `${c.code} seo.keywords.K1 core token(s) ${miss.join(', ')} appear in neither meta.title nor hero.title (I18-06)`);
  }
}

// uniquePrimary (doc 03 §1.6): within a locale, only page X may carry all of X's primary tokens in its title or H1.
function uniquePrimary(X, pub, strings) {
  const km = X.data.keywordMap ?? {};
  for (const l of pub) {
    const t = strings[l.code];
    const vars = makeVars(X.cfg, l, t);
    const zone = (pageId) => (PAGE_TITLE_H1[pageId] ?? []).map((k) => { const v = getPath(t, k); return typeof v === 'string' ? rendered(v, vars, l.code) : ''; }).join(' ');
    const pages = Object.keys(PAGE_TITLE_H1).filter((p) => zone(p).trim());
    for (const pageId of pages) {
      const tokens = km.primaryTokens?.[pageId]?.[l.code];
      if (!tokens?.length) continue;
      const carriers = pages.filter((p) => tokens.every((tok) => hasToken(zone(p), tok, l.script)));
      const others = carriers.filter((p) => p !== pageId);
      if (others.length) X.E('L-9', `${l.code} primary keyword of ${pageId} (${tokens.join(' + ')}) also in the title/H1 of ${others.join(', ')} (doc 03 §1.6 uniquePrimary, R46)`);
    }
  }
}

// ——— L-10: the hero sample and the X card sample (F15, R66, R71, R77) ———
function ruleL10(X, c) {
  const { E, W } = X;
  const d = c.t.demo;
  if (!isObj(d)) return; // L-1 reports the missing key
  const src = primaryLang(d.sourceLang);
  const page = primaryLang(c.l.hreflang);
  if (!d.sourceLang) E('L-10', `${c.code} demo.sourceLang missing`);
  else {
    if (src === page) E('L-10', `${c.code} demo.sourceLang "${d.sourceLang}" equals the page language (en pages use a non-English source, other pages en)`);
    else if (c.code !== 'en' && src !== 'en') W('L-10', `${c.code} demo.sourceLang "${d.sourceLang}": pages other than en use an English source (doc 06 §4.2)`);
  }
  const source = Array.isArray(d.source) ? d.source : [];
  const translation = Array.isArray(d.translation) ? d.translation : [];
  if (source.length !== translation.length) E('L-10', `${c.code} demo.source has ${source.length} sentences, demo.translation ${translation.length}`);
  if (['zh', 'ja', 'ko'].includes(src) && d.lookup) E('L-10', `${c.code} demo.lookup must be absent for a ${d.sourceLang} source: double-tap lookup does not support CJK (F15)`);
  if (d.lookup) {
    const w = String(d.lookup.word ?? '');
    const wre = re(`(^|[^\\p{L}])${escapeRe(w)}(?=[^\\p{L}]|$)`, 'u');
    if (!w || !source.some((s) => wre.test(s))) E('L-10', `${c.code} demo.lookup.word "${w}" does not occur in demo.source`);
    else if (!wre.test(source[1] ?? '')) E('L-10', `${c.code} demo.lookup.word "${w}" must occur in demo.source[1] (the swiped sentence the card points at)`);
  }
  if (!String(d.articleTitle ?? '').trim()) E('L-10', `${c.code} demo.articleTitle is required (R66)`);
  if (!Array.isArray(d.context) || !d.context.length || d.context.length > 2) E('L-10', `${c.code} demo.context needs 1–2 paragraphs (R66)`);
  const srcTexts = { 'demo.articleTitle': d.articleTitle, 'demo.byline': d.byline, ...Object.fromEntries(source.map((s, i) => [`demo.source[${i}]`, s])),
    ...Object.fromEntries((d.context ?? []).map((s, i) => [`demo.context[${i}]`, s])) };
  for (const [k, v] of Object.entries(srcTexts)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    if (URL_RE.test(v)) E('L-10', `${c.code} ${k} must not contain a URL`);
    if (d.sourceLang && scriptShare(v, d.sourceLang) < 0.6) E('L-10', `${c.code} ${k} is not written in demo.sourceLang "${d.sourceLang}"`);
  }
  // X card sample (R71, R77)
  const x = getPath(c.t, 'features[x].sample');
  if (!isObj(x)) { E('L-10', `${c.code} features[x].sample is required for every locale (R71, R77)`); return; }
  if (!/^@/.test(x.handle ?? '') || !String(x.handle).includes('example')) E('L-10', `${c.code} features[x].sample.handle "${x.handle}" must start with @ and contain "example" (fictitious account, R71)`);
  for (const [k, v] of Object.entries(x)) {
    if (typeof v !== 'string') continue;
    if (/x\.com|twitter\.com/i.test(v) || (k !== 'handle' && URL_RE.test(v))) E('L-10', `${c.code} features[x].sample.${k} must not contain x.com, twitter.com or a URL`);
  }
  if (typeof x.source === 'string' && d.sourceLang && scriptShare(x.source, d.sourceLang) < 0.6) E('L-10', `${c.code} features[x].sample.source is not written in demo.sourceLang "${d.sourceLang}"`);
}

// ——— L-11: SurfEnglish copy (R40–R43, F10) ———
function ruleL11(X, c) {
  const { E } = X;
  const card = getPath(c.t, 'sibling.card');
  if (isObj(card)) {
    if (typeof card.title === 'string' && !/^SurfEnglish/.test(displayText(card.title))) E('L-11', `${c.code} sibling.card.title must start with "SurfEnglish" (R40): "${displayText(card.title)}"`);
    if (card.points !== undefined && (!Array.isArray(card.points) || card.points.length !== 3)) E('L-11', `${c.code} sibling.card.points must have exactly 3 items (doc 04 §5.1)`);
    for (const k of ['linkText', 'appStoreLinkText']) {
      if (typeof card[k] === 'string' && /^\s*(https?:\/\/)?surfenglish\.app\/?\s*$/i.test(card[k])) E('L-11', `${c.code} sibling.card.${k}: a bare domain is not an anchor text (R76)`);
    }
    if (typeof card.appStoreLinkText === 'string' && card.appStoreLinkText.includes('→')) E('L-11', `${c.code} sibling.card.appStoreLinkText must not contain "→" (the template appends it, doc 04 §3.7)`);
  }
  if (c.seMode === 'en-site') {
    const ui = String(getPath(c.t, 'sibling.card.uiNote') ?? '');
    if (ui && (ui === getPath(c.t, 'sibling.card.note') || ui.includes('{se.uiLanguages}'))) {
      E('L-11', `${c.code} sibling.card.uiNote must not claim an app interface in this language ("App in {se.uiLanguages} …", F10): write "English and N other languages"`);
    }
  }
  if (c.seMode === 'no-card' && !String(getPath(c.t, 'sibling.availability') ?? '').trim()) E('L-11', `${c.code} sibling.availability must be non-empty (seMode 'no-card', R42)`);
}

// ——— L-12: plural objects and hard-coded product numbers (R62, I18-02) ———
function productNumbers(product) {
  const nums = new Set();
  const visit = (v) => {
    if (typeof v === 'number' && (v >= 10 || !Number.isInteger(v))) nums.add(String(v));
    else if (Array.isArray(v)) v.forEach(visit);
    else if (isObj(v)) Object.values(v).forEach(visit);
  };
  visit(product);
  nums.add(String(product.wbw?.version ?? ''));
  nums.delete('');
  return [...nums].filter((n) => !/^\d{4}$/.test(n)); // years are dates, not facts copy would repeat
}

function ruleL12(X, c) {
  const { E, W } = X;
  if (PLURAL_LOCALES.includes(c.code)) {
    for (const { path, value } of c.leaves) {
      if (typeof value !== 'string' || path.startsWith('seo.')) continue;
      // simple {name} placeholders only (plural objects are fine)
      for (const m of value.matchAll(/\{([\w.]+)\}/g)) {
        if (!COUNT_PLACEHOLDERS.test(m[1])) continue;
        const before = value.slice(0, m.index);
        const after = value.slice(m.index + m[0].length);
        if (/\p{L}\s?$/u.test(before) || /^\s?\p{L}/u.test(after)) {
          E('L-12', `${c.code} ${path}: {${m[1]}} next to a word must be a plural object {${m[1]}, plural, one{…} few{…} many{…} other{…}} (R62)`);
        }
      }
    }
  }
  const nums = productNumbers(X.cfg.product);
  for (const { path, value } of c.leaves) {
    if (typeof value !== 'string' || path.startsWith('seo.') || path.startsWith('demo.') || keyMatch('features[*].sample', path) || isNonCopy(path)) continue;
    const plainText = value.replace(/\{[^{}]*\}/g, ' ');
    for (const n of nums) {
      if (re(`(?<![\\d.,])${escapeRe(n)}(?![\\d]|[.,]\\d)`, 'u').test(plainText)) W('L-12', `${c.code} ${path}: hard-coded "${n}" equals a product.json value — use the placeholder`);
    }
  }
}

// ——— L-13: glossary and writing system (R64, I18-06, I18-07) ———
function ruleL13(X, c) {
  const { E, data } = X;
  const g = data.glossary(c.code);
  const allLeaves = c.leaves.filter((x) => typeof x.value === 'string' && !isNonCopy(x.path));
  if (!g) X.agg.glossaryMissing.push(c.code);
  else {
    const required = { ...(g.appNames ?? {}), ...(g.required ?? {}) };
    for (const [key, want] of Object.entries(required)) {
      const got = getPath(c.t, key);
      if (got === undefined) continue; // L-1 / L-3 report missing keys
      if (got !== want) E('L-13', `${c.code} ${key}: "${got}" must be the app's name "${want}" (glossary)`);
    }
    for (const [key, list] of Object.entries(g.contains ?? {})) {
      const got = getPath(c.t, key);
      if (typeof got !== 'string') continue;
      for (const s of list) if (!got.includes(s)) E('L-13', `${c.code} ${key}: must quote the app's "${s}" verbatim (glossary)`);
    }
    const globalAllow = g.allowInKeys ?? [];
    const bans = [...(g.banned ?? []), ...(g.mainlandTerms ?? []).map((m) => ({ ...m, mainland: true }))];
    if (c.code === 'zh-Hant' && (g.mainlandTerms ?? []).length < 40) E('L-13', `zh-Hant glossary has ${(g.mainlandTerms ?? []).length} mainland-term groups; R64 requires ≥ 40`);
    for (const b of bans) {
      const src = b.regex ? b.pattern : escapeRe(b.pattern);
      let r;
      try { r = re(src, `u${(b.flags ?? '').replace(/[^imsy]/g, '')}`); } catch (e) { E('L-13', `${c.code} glossary pattern "${b.pattern}" is invalid (${e.message})`); continue; }
      for (const { path, value } of allLeaves) {
        if (keyMatchAny(globalAllow, path) || keyMatchAny(b.allowInKeys, path)) continue;
        const m = value.match(r);
        if (m) E('L-13', `${c.code} ${path}: "${m[0]}"${b.mainland ? ' (mainland term)' : ''} is banned — use "${b.use ?? b.note ?? '?'}" (glossary${b.note && b.use ? `: ${b.note}` : ''})`);
      }
    }
  }
  // ③ ko: no Han characters (X3)
  if (c.code === 'ko' || g?.script?.noHanja) {
    for (const { path, value } of allLeaves) {
      const m = value.match(/\p{Script=Han}+/u);
      if (m) E('L-13', `${c.code} ${path}: Han characters "${m[0]}" in Korean copy (e.g. the app's 「任意의」, X3)`);
    }
  }
  // ④ zh-Hant / ja: no simplified-only characters
  const list = c.code === 'zh-Hant' ? data.simplifiedOnly : c.code === 'ja' && data.simplifiedOnly ? data.simplifiedOnlyJa : null;
  if (list) {
    for (const { path, value } of allLeaves) {
      const bad = [...new Set([...value].filter((ch) => list.has(ch)))];
      if (bad.length) E('L-13', `${c.code} ${path}: simplified-only character(s) ${bad.join('')} (I18-07; e.g. the app's 更多释义 → 更多釋義, X1)`);
    }
  }
  // ⑤ zh-Hant: U+30FB katakana middle dot is not used (I18-07)
  if (c.code === 'zh-Hant') for (const { path, value } of allLeaves) if (value.includes('・')) E('L-13', `${c.code} ${path}: Japanese middle dot ・ (U+30FB) — use 、 or ／ (I18-07)`);
}

// ——— L-14: product-claim lint on leaf values (ENG-10) ———
function ruleL14(X, c) {
  const { E, data } = X;
  const uncovered = [];
  for (const rule of data.claims?.rules ?? []) {
    const own = rule.patterns?.[c.code] ?? [];
    const any = rule.patterns?.['*'] ?? [];
    if (!own.length && !any.length) { uncovered.push(rule.id); continue; }
    const flags = `u${rule.caseSensitive ? '' : 'i'}`;
    const regs = compileAll([...own, ...any], flags, (src, e) => E('L-14', `claims-lint.json rule ${rule.id}: invalid pattern "${src}" (${e})`));
    for (const { path, value } of c.leaves) {
      if (typeof value !== 'string' || isNonCopy(path) || path.startsWith('seo.')) continue;
      if (rule.only && !keyMatchAny(rule.only, path)) continue;
      if (keyMatchAny(rule.exempt, path) || (rule.exemptPrefix ?? []).some((p) => path.startsWith(p))) continue;
      const text = rendered(value, c.vars, c.code);
      for (const r of regs) {
        const m = text.match(r);
        if (m) { E('L-14', `${c.code} ${path}: "${m[0]}" — ${rule.id}: ${rule.desc ?? ''}`.trim()); break; }
      }
    }
  }
  if (uncovered.length && (data.claims?.coverage?.warnWhenMissing ?? true)) X.agg.uncovered.set(c.code, uncovered);
}
