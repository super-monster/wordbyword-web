// Build-time validator (doc 06 §3.7): every rule L-1…L-14 and D-1…D-24 is caught by at least one deliberately broken
// sample (doc 07 M1 exit criterion ②), and the real content passes with 0 errors.
// Run: npm test   (node --test scripts/tests/*.test.mjs, one process per file; zero dependencies, Node ≥ 22)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig, loadStrings, expandRoutes } from '../../src/lib/context.mjs';
import { validateConfig, validateLocales, validateDist } from '../../src/lib/validate.mjs';
import {
  checkOg, checkRegistry, checkTemplateClaims, expectedRedirects, jpegSize, ogInputHash, ogInputs, parseRedirects,
  readRedirectFixture, resolvePath, stringLiterals,
} from '../../src/lib/validate-dist.mjs';
import { pseudoStrings, scanPseudoDist, hardCodedWords } from '../../src/lib/pseudo.mjs';
import { graphemes, textLength, wu } from '../../src/lib/text-length.mjs';
import { getPath, keyMatch, leaves, setPath, shape } from '../../src/lib/keypath.mjs';
import { parseHTML, textOf, idIndex } from '../../src/lib/dom.mjs';
import { hasToken, loadData, newIssues } from '../../src/lib/validate-util.mjs';
import { buildRedirects, buildLegacySitemap } from '../../src/lib/seo.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = mkdtempSync(join(tmpdir(), 'wbw-validate-'));
process.on('exit', () => rmSync(TMP, { recursive: true, force: true })); // not after(): on Node 22 a root hook can run early

const RULES = [...Array.from({ length: 14 }, (_, i) => `L-${i + 1}`), ...Array.from({ length: 24 }, (_, i) => `D-${i + 1}`)];
const caught = new Set();

// ———————————————————————————— fixtures ————————————————————————————

// The module-level LOCALES get their publish flags from the locale files exactly as in build.mjs.
const BASE = loadConfig(ROOT);
const REAL = loadStrings(BASE).strings;
const S = () => structuredClone(REAL);

function freshCfg() {
  const c = loadConfig(ROOT);
  return {
    ...c,
    SITE: structuredClone(c.SITE),
    LOCALES: c.LOCALES.map((l) => ({ ...l, legacy: [...l.legacy] })),
    CONTRACTS: c.CONTRACTS.map((x) => ({ ...x })),
    ALIASES: c.ALIASES.map((a) => ({ ...a })),
    SIBLING: structuredClone(c.SIBLING),
    product: structuredClone(c.product),
    notice: structuredClone(c.notice),
  };
}

const BUILT = join(TMP, 'built');
const BUILD = spawnSync(process.execPath, ['build.mjs', '--out', BUILT], { cwd: ROOT, encoding: 'utf8' });

let copies = 0;
function runDist(mutate, { cfgMut, strings } = {}) {
  const dir = join(TMP, `dist-${++copies}`);
  cpSync(BUILT, dir, { recursive: true });
  mutate?.(dir);
  const cfg = freshCfg();
  cfgMut?.(cfg);
  const issues = newIssues();
  validateDist(dir, { cfg, routes: expandRoutes(cfg), strings: strings ?? REAL }, issues);
  rmSync(dir, { recursive: true, force: true });
  return issues;
}
function runLocales(mutate, { cfgMut, data } = {}) {
  const cfg = freshCfg();
  if (data) cfg.data = data;
  cfgMut?.(cfg);
  const s = S();
  mutate?.(s, cfg);
  const issues = newIssues();
  validateLocales(cfg, s, issues);
  return issues;
}
function runConfig(mutate) {
  const cfg = freshCfg();
  mutate?.(cfg);
  const issues = newIssues();
  validateConfig(cfg, issues);
  return issues;
}
// Edit a dist file; fails loudly when the snippet the mutation relies on is no longer in the output.
function edit(dir, rel, fn) {
  const file = join(dir, rel);
  const before = readFileSync(file, 'utf8');
  const after = fn(before);
  assert.notEqual(after, before, `mutation of ${rel} did not apply — the template output changed`);
  writeFileSync(file, after);
}
const inMain = (snippet) => (h) => h.replace('<main id="main">', `<main id="main">${snippet}`);

function expectE(issues, id, re) {
  const hit = issues.error.some((m) => m.startsWith(`${id} `) && (!re || re.test(m)));
  assert.ok(hit, `expected error ${id}${re ? ` ~ ${re}` : ''}\n— errors:\n${issues.error.join('\n') || '(none)'}`);
  caught.add(id);
}
function expectW(issues, id, re) {
  const hit = issues.warn.some((m) => m.startsWith(`${id} `) && (!re || re.test(m)));
  assert.ok(hit, `expected warning ${id}${re ? ` ~ ${re}` : ''}\n— warnings:\n${issues.warn.join('\n') || '(none)'}`);
  caught.add(id);
}
const noErrors = (issues, id, re) => assert.ok(!issues.error.some((m) => m.startsWith(`${id} `) && (!re || re.test(m))), issues.error.join('\n'));

const feat = (t, id) => t.features.find((f) => f.id === id);
const faq = (t, id) => t.faq.items.find((q) => q.id === id);
const enSite = (cfg) => { const real = cfg.seMode; cfg.seMode = (l) => (l.code === 'ja' ? 'en-site' : real(l)); };

// ———————————————————————————— real content ————————————————————————————

test('real content: validateConfig + validateLocales report 0 errors', () => {
  const cfg = freshCfg();
  const i = newIssues();
  validateConfig(cfg, i);
  validateLocales(cfg, S(), i);
  assert.deepEqual(i.error, []);
  const simplified = i.warn.filter((w) => /_simplified-only\.txt missing/.test(w)).length;
  assert.equal(simplified, existsSync(join(ROOT, 'src/data/glossary/_simplified-only.txt')) ? 0 : 1, 'one warning while the OpenCC list is absent');
});

test('real content: node build.mjs exits 0 and validateDist reports 0 errors', () => {
  assert.equal(BUILD.status, 0, `${BUILD.stdout}\n${BUILD.stderr}`);
  assert.match(BUILD.stdout, /0 errors/);
  const i = runDist();
  assert.deepEqual(i.error, []);
  const once = (re, input) => assert.equal(i.warn.filter((w) => re.test(w)).length, existsSync(join(ROOT, input)) ? 0 : 1, `${re}\n${i.warn.join('\n')}`);
  once(/assets\/og\/og\.json missing/, 'assets/og/og.json');
  once(/assets\/img\/images\.json missing/, 'assets/img/images.json');
});

test('missing inputs of this milestone produce one warning each, never an error', () => {
  const root = join(TMP, 'bare-root');
  mkdirSync(join(root, 'public'), { recursive: true });
  symlinkSync(join(ROOT, 'src'), join(root, 'src'));
  symlinkSync(join(ROOT, 'scripts'), join(root, 'scripts'));
  copyFileSync(join(ROOT, 'public/favicon.ico'), join(root, 'public/favicon.ico'));
  const i = runDist((d) => {
    rmSync(join(d, 'icons'), { recursive: true, force: true });
    rmSync(join(d, 'site.webmanifest'), { force: true });
    edit(d, 'about/index.html', inMain('<span class="img-missing" data-img-key="shot/en/nothing" role="img" aria-label="x"></span>'));
  }, { cfgMut: (cfg) => { cfg.root = root; } });
  assert.deepEqual(i.error, []);
  for (const [id, re] of [['D-21', /images\.json missing/], ['D-4', /public\/icons\/ missing/], ['D-11', /assets\/badges\/\*\.svg missing/], ['D-23', /og\.json missing/]]) {
    assert.equal(i.warn.filter((w) => w.startsWith(`${id} `) && re.test(w)).length, 1, `${id} ${re}\n${i.warn.join('\n')}`);
  }
  const g = runLocales(null, { data: { glossary: { ja: null, 'zh-Hans': null } } });
  assert.equal(g.warn.filter((w) => /^L-13 .*glossary.*missing for published locale\(s\): zh-Hans ja/.test(w)).length, 1, g.warn.join('\n'));
  noErrors(g, 'L-13');
});

test('build.mjs --pseudo renders every route with the pseudo locale and scans it (D-15 b)', () => {
  const r = spawnSync(process.execPath, ['build.mjs', '--pseudo', '--out', join(TMP, 'pseudo-out')], { cwd: ROOT, encoding: 'utf8' });
  assert.ok([0, 1].includes(r.status), r.stderr);
  assert.match(r.stdout, /pseudo-locale scan \d+ pages/);
  assert.doesNotMatch(r.stderr, /pseudo-locale render/, 'every template renders with wrapped strings');
});

test('scripts/check.mjs: validateDist + HTML basics on a built dist, and --keys', () => {
  const r = spawnSync(process.execPath, ['scripts/check.mjs', '--dist', BUILT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  const k = spawnSync(process.execPath, ['scripts/check.mjs', '--keys'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(k.status, 0);
  const unpublished = BASE.LOCALES.find((l) => !l.publish); // none once all 20 locales are published (M3)
  if (unpublished) assert.match(k.stdout, new RegExp(`${unpublished.code} {2}\\(no src/locales/${unpublished.code}\\.json`));
});

// ———————————————————————————— L-1 … L-14 ————————————————————————————

test('L-1 a misnamed locale file in src/locales is an error (codes are case-sensitive)', () => {
  const root = join(TMP, 'stray-root');
  mkdirSync(join(root, 'src/locales'), { recursive: true });
  for (const f of ['en.json', 'zh-hans.json']) writeFileSync(join(root, 'src/locales', f), '{}');
  mkdirSync(join(root, 'src/locales/_legacy'), { recursive: true });
  writeFileSync(join(root, 'src/locales/_legacy/de.json'), '{}'); // the translation memory folder is ignored
  const i = runLocales(null, { cfgMut: (cfg) => { cfg.root = root; } });
  expectE(i, 'L-1', /src\/locales\/zh-hans\.json is not a registered locale file/);
  assert.ok(!i.error.some((m) => /_legacy|en\.json is not/.test(m)), i.error.join('\n'));
});

test('L-1 missing key, type, removed key, fixed-length arrays, extra keys', () => {
  let i = runLocales((s) => { delete s.ja.hero.lede; feat(s.ja, 'swipe').bullets = 'x'; });
  expectE(i, 'L-1', /^L-1 ja hero\.lede: missing/);
  expectE(i, 'L-1', /ja features\[swipe\]\.bullets: type string differs from en array of string/);
  i = runLocales((s) => { s.en.sibling.languagesTip = 'x'; s.ja.demo.headline = 'x'; });
  expectE(i, 'L-1', /en sibling\.languagesTip: removed key/);
  expectE(i, 'L-1', /ja demo\.headline: removed key/);
  i = runLocales((s) => { feat(s.ja, 'lookup').bullets.pop(); s['zh-Hans'].languages.limits.push('x'); });
  expectE(i, 'L-1', /ja features\[lookup\]\.bullets has 2 items, en has 3/);
  expectE(i, 'L-1', /zh-Hans languages\.limits must have exactly 2 items/);
  i = runLocales((s) => { s.ja.hero.extra = 'x'; delete s.ja.hero.ledeShort; });
  expectW(i, 'L-1', /^L-1 ja: 3 key\(s\) not in en: .*hero\.extra/);
  noErrors(i, 'L-1', /ledeShort/);
});

test('L-2 id sets of the arrays aligned by id', () => {
  let i = runLocales((s) => {
    s.ja.faq.items = s.ja.faq.items.filter((q) => q.id !== 'android');
    s['zh-Hans'].chromeExtension.faq.push({ ...s['zh-Hans'].chromeExtension.faq[0] });
  });
  expectE(i, 'L-2', /ja faq\.items: id\(s\) missing vs en: android/);
  expectE(i, 'L-2', /zh-Hans chromeExtension\.faq: duplicate id/);
  i = runLocales((s) => { s.en.features = s.en.features.filter((f) => f.id !== 'devices'); });
  expectE(i, 'L-2', /en features\[\] id set must be/);
  i = runLocales((s) => { const it = s.ja.faq.items; [it[0], it[1]] = [it[1], it[0]]; });
  expectW(i, 'L-2', /ja faq\.items: same ids as en but a different order/);
});

test('L-3 page- and placement-specific keys', () => {
  let i = runLocales((s) => { delete s['zh-Hans'].chromeExtension; delete s.en.about; });
  expectE(i, 'L-3', /zh-Hans chromeExtension\.\* is required/);
  expectE(i, 'L-3', /en about\.\* is required/);
  i = runLocales((s) => { delete s['zh-Hans'].chromeExtension.hero.lede; delete s['zh-Hans'].sibling.availability; });
  expectE(i, 'L-3', /zh-Hans chromeExtension: missing chromeExtension\.hero\.lede/);
  expectE(i, 'L-3', /zh-Hans sibling\.availability is required/);
  i = runLocales(null, { cfgMut: enSite });
  expectE(i, 'L-3', /ja sibling\.card\.uiNote is required when seMode = 'en-site'/);
});

test('L-4 values identical to en are reported once per locale', () => {
  const i = runLocales((s) => { s.ja.nav.features = s.en.nav.features; });
  expectW(i, 'L-4', /^L-4 ja: \d+ value\(s\) identical to en — review: nav\.features; expected/);
});

test('L-5 empty values and leftover markers', () => {
  const i = runLocales((s) => { s.ja.hero.eyebrow = ''; s.en.cta.text = 'TODO: final wording'; s.en.demo.context[1] += ' Abre todo el día.'; });
  expectE(i, 'L-5', /ja hero\.eyebrow: empty string/);
  expectE(i, 'L-5', /en cta\.text: placeholder text "TODO"/);
  noErrors(i, 'L-5', /demo\.context/);
});

test('L-6 placeholders and plural syntax (R62)', () => {
  const i = runLocales((s) => {
    s.en.languages.uiCount = 'App in {uiLangs} languages';
    s.en.languages.title = 'Translate into {targetLanguages, plural, one{# language}} — from more than English';
    s.ja.languages.title = '{targetLanguages, plural, one{#言語} other{#言語}}に{wbr}翻訳';
    s.en.hero.platformNote = 'Requires {minOS, plural, other{#}}';
    s.en.footer.copyright = '© {yearRange Jinlong';
    s.en.pricing.lede = 'Free {n} times a day.';
  });
  expectE(i, 'L-6', /en languages\.uiCount: unknown placeholder \{uiLangs\}/);
  expectE(i, 'L-6', /en languages\.title: \{targetLanguages, plural\} has no "other" branch/);
  expectE(i, 'L-6', /ja languages\.title: plural category "one" is not one of other for ja/);
  expectE(i, 'L-6', /en hero\.platformNote: \{minOS, plural\} needs a numeric placeholder/);
  expectE(i, 'L-6', /en footer\.copyright: unbalanced "\{"/);
  expectE(i, 'L-6', /en pricing\.lede: unknown placeholder \{n\}/);
  const ok = runLocales((s) => { s.en.languages.title = 'Translate into {targetLanguages, plural, one{# language} other{# languages}} — from more than English'; });
  noErrors(ok, 'L-6');
});

test('L-7 markup: [[ ]], {wbr}, ｜, rich refs, literal emphasis', () => {
  const i = runLocales((s) => {
    feat(s.en, 'swipe').title = 'Swipe to Translate: [[the translation]] appears right below the original';
    s.en.chromeExtension.hero.title = '[[Bilingual]] web translation in Chrome, [[with]] the original kept in place';
    s.en.hero.title = 'Swipe a paragraph{wbr} on [[any web page]]. Its translation appears right below.';
    s.ja.hero.lede = 'WordByWordは、{wbr}外国語を学びながらWebを読む人のためのiPhone・iPadアプリです。';
    s.ja.faq.title = 'WordByWordについて｜よくある質問';
    faq(s.en, 'what-is').a += ' [More](@nowhere)';
    s.en.cta.text = '**Free** on the App Store, for iPhone and iPad.';
    s.en.hero.how += ' [About](@about)';
    s.ja.cta.title = 'iPhoneで、{wbr}外国語のとても長いWebページを{wbr}対訳で読む';
  });
  expectE(i, 'L-7', /en features\[swipe\]\.title: \[\[ \]\] is only allowed in hero\.title/);
  expectE(i, 'L-7', /en chromeExtension\.hero\.title: needs exactly one \[\[highlight\]\]/);
  expectE(i, 'L-7', /en hero\.title: \{wbr\} is only for ja \/ zh-Hans \/ zh-Hant/);
  expectE(i, 'L-7', /ja hero\.lede: \{wbr\} is only allowed in heading-type fields/);
  expectE(i, 'L-7', /ja faq\.title: full-width ｜ is a title separator/);
  expectE(i, 'L-7', /en faq\.items\[what-is\]\.a: link target "@nowhere" is not a whitelisted @ref/);
  expectE(i, 'L-7', /en cta\.text: \*\*strong\*\* markup in a plain-text field/);
  expectE(i, 'L-7', /en hero\.how: link markup \[About\]\(@about\) in a plain-text field/);
  expectW(i, 'L-7', /ja cta\.title: segment "外国語のとても長いWebページを" between two \{wbr\} is 16 characters/);
  // rendered side: markup that reaches the HTML literally
  const d = runDist((dir) => edit(dir, 'about/index.html', inMain('<p>Swipe{wbr}here [[now]]</p>')));
  expectE(d, 'L-7', /\/about\/ \(en\): markup "\{wbr\}" rendered literally/);
});

test('L-8 lengths by writing system (R14, doc 03 §3.1)', () => {
  const i = runLocales((s) => {
    s.en.meta.title = 'WordByWord: Bilingual Web Page Translator App for iPhone, iPad and Mac';
    s.ja.meta.title = 'WordByWord｜iPhoneでWebページを翻訳・対訳表示する外国語学習者のためのアプリ';
    s['zh-Hans'].meta.description = 'WordByWord 是 iPhone 网页双语对照翻译 App。';
    s.en.about.meta.description = `${s.en.about.meta.description} ${'x'.repeat(60)}`;
    feat(s.en, 'engines').text = 'Cloud (Azure and Google) or iOS on-device translation; out of cloud swipes? Switch to the local engine and retry.';
    feat(s.en, 'swipe').alt = 'x '.repeat(70).trim();
  });
  expectE(i, 'L-8', /en meta\.title too long: n70 > 60/);
  expectE(i, 'L-8', /ja meta\.title too long: w37\.5 > 32/);
  expectW(i, 'L-8', /zh-Hans meta\.description length w21\.5 outside 50–90/);
  expectE(i, 'L-8', /en about\.meta\.description too long: n\d+ > 160 \+ 25 %/);
  expectW(i, 'L-8', /en features\[engines\]\.text too long: n\d+ > 80 \(spec list, R78\)/);
  expectW(i, 'L-8', /en features\[swipe\]\.alt: alt text 139 characters > 125/);
});

test('L-9 brand, title tokens, SurfEnglish words, G1 how-to, definition, platform, uniquePrimary', () => {
  let i = runLocales((s) => { s.en.meta.title = 'Bilingual Web Page Translator App for iPhone | WordByWord'; });
  expectE(i, 'L-9', /en meta\.title must start with "WordByWord"/);
  i = runLocales((s) => { s.en.meta.title = 'WordByWord: Bilingual Website Reader for iPhone'; });
  expectE(i, 'L-9', /en meta\.title lacks seo\.titleMust token\(s\): Web Page, App/);
  expectW(i, 'L-9', /en seo\.keywords\.K1 core token\(s\) App appear in neither meta\.title nor hero\.title/); // "web page" is in the H1
  i = runLocales((s) => { s.en.hero.title = 'Learn English: swipe a paragraph on [[any web page]].'; s.ja.meta.ogSubline = '英語学習に：段落を右にスワイプ'; });
  expectE(i, 'L-9', /en hero\.title: SurfEnglish-owned keyword/);
  expectE(i, 'L-9', /ja meta\.ogSubline: SurfEnglish-owned keyword/);
  // doc 03 §3.8 self-test: a #cta H2 that repeats the G1 guide title must fail
  i = runLocales((s) => { s.en.cta.title = 'Translate web pages on iPhone — and keep the original'; s['zh-Hans'].hero.title = '如何在 iPhone 上[[网页双语对照]]：向右滑动段落'; });
  expectE(i, 'L-9', /en cta\.title: how-to phrasing .* is reserved for guide G1/);
  expectE(i, 'L-9', /zh-Hans hero\.title: how-to phrasing/);
  i = runLocales((s) => {
    s.en.hero.eyebrow = 'Bilingual web reader for language learners';
    s.en.hero.lede = 'A reading assistant for language learners. WordByWord runs on iPhone and iPad.';
    s.ja.meta.description = s.ja.meta.description.replaceAll('iPhone', 'スマホ');
  });
  expectE(i, 'L-9', /en hero\.eyebrow must contain "WordByWord"/);
  expectE(i, 'L-9', /en hero\.lede: first sentence must contain "WordByWord"/);
  expectE(i, 'L-9', /ja meta\.description must mention iPhone/);
  i = runLocales((s) => { s.en.about.meta.title = 'About WordByWord — Web Page Translator App for iPhone'; });
  expectE(i, 'L-9', /en primary keyword of home \(Web Page \+ App \+ iPhone\) also in the title\/H1 of about/);
});

test('L-9 generic language-learning words are not SurfEnglish-owned (doc 03 §1.4 fixtures, R39, R83)', () => {
  const km = JSON.parse(readFileSync(join(ROOT, 'src/data/keyword-map.json'), 'utf8'));
  const cases = {
    en: ['language learners', 'learn languages by reading'], 'zh-Hans': ['外语学习者', '用网页学外语'], 'zh-Hant': ['外語學習者'],
    ja: ['外国語を学びながら', '外国語学習'], ko: ['외국어 공부'], es: ['aprender idiomas'], de: ['Sprachlernende'], ru: ['изучающих языки'],
    vi: ['người học ngoại ngữ'], th: ['ผู้เรียนภาษา'], ar: ['لمتعلمي اللغات'], hi: ['भाषा सीखने वालों'],
  };
  for (const [code, phrases] of Object.entries(cases)) {
    for (const p of phrases) for (const src of km.seOwned[code] ?? []) assert.ok(!new RegExp(src, 'iu').test(p), `${code} "${p}" matched /${src}/`);
  }
  const i = runLocales((s) => { s.en.hero.title = 'For language learners: swipe a paragraph on [[any web page]].'; });
  noErrors(i, 'L-9');
});

test('L-10 hero sample and X card sample (F15, R66, R71)', () => {
  let i = runLocales((s) => {
    s.en.demo.lookup.word = 'biblioteca';
    s.ja.demo.sourceLang = 'ja';
    s['zh-Hans'].demo.translation.pop();
    s.en.demo.context[0] += ' Más en https://example.com/biblioteca';
    feat(s.en, 'x').sample.handle = '@runner';
    feat(s.ja, 'x').sample.translation += '（x.com/runner）';
  });
  expectE(i, 'L-10', /en demo\.lookup\.word "biblioteca" must occur in demo\.source\[1\]/);
  expectE(i, 'L-10', /ja demo\.sourceLang "ja" equals the page language/);
  expectE(i, 'L-10', /zh-Hans demo\.source has 2 sentences, demo\.translation 1/);
  expectE(i, 'L-10', /en demo\.context\[0\] must not contain a URL/);
  expectE(i, 'L-10', /en features\[x\]\.sample\.handle "@runner" must start with @ and contain "example"/);
  expectE(i, 'L-10', /ja features\[x\]\.sample\.translation must not contain x\.com/);
  i = runLocales((s) => { s.en.demo.sourceLang = 'ja'; delete s.ja.demo.articleTitle; s.ja.demo.context = ['近所の図書館は土曜日の朝早くから開いています。']; s.en.demo.lookup.word = 'zzz'; });
  expectE(i, 'L-10', /en demo\.lookup must be absent for a ja source/);
  expectE(i, 'L-10', /ja demo\.articleTitle is required/);
  expectE(i, 'L-10', /ja demo\.context\[0\] is not written in demo\.sourceLang "en"/);
  expectE(i, 'L-10', /en demo\.lookup\.word "zzz" does not occur in demo\.source/);
});

test('L-11 SurfEnglish copy and SIBLING config (R40–R43)', () => {
  let i = runLocales((s) => {
    s.en.sibling.card.title = 'Learning English? Try SurfEnglish';
    s.ja.sibling.card.points.pop();
    s['zh-Hans'].sibling.availability = ' ';
    s.en.sibling.card.linkText = 'surfenglish.app';
  });
  expectE(i, 'L-11', /en sibling\.card\.title must start with "SurfEnglish"/);
  expectE(i, 'L-11', /ja sibling\.card\.points must have exactly 3 items/);
  expectE(i, 'L-11', /zh-Hans sibling\.availability must be non-empty/);
  expectE(i, 'L-11', /en sibling\.card\.linkText: a bare domain is not an anchor text/);
  i = runLocales((s) => { s.ja.sibling.card.uiNote = 'アプリ表示は{se.uiLanguages}言語'; }, { cfgMut: enSite });
  expectE(i, 'L-11', /ja sibling\.card\.uiNote must not claim an app interface/);
  i = runConfig((cfg) => { cfg.SIBLING.placements.langHint = true; cfg.SIBLING.perLocale.xx = { card: false }; cfg.SIBLING.copyReviewedAt = '2025-01-01'; });
  expectE(i, 'L-11', /SIBLING\.placements\.langHint: placement ③ was removed/);
  expectE(i, 'L-11', /SIBLING\.perLocale has unregistered locale "xx"/);
  expectW(i, 'L-11', /SIBLING\.copyReviewedAt 2025-01-01 is \d+ days old/);
});

test('L-12 plural objects in ru/uk/pl/ar and hard-coded product numbers', () => {
  const i = runLocales((s, cfg) => {
    cfg.LOCALES.find((l) => l.code === 'ru').publish = true;
    s.ru = structuredClone(s.en);
    s.ru.languages.title = 'Перевод на {targetLanguages} языков';
    s.en.pricing.lede = 'WordByWord is free to download: 50 cloud swipes a day.';
  });
  expectE(i, 'L-12', /ru languages\.title: \{targetLanguages\} next to a word must be a plural object/);
  expectW(i, 'L-12', /en pricing\.lede: hard-coded "50" equals a product\.json value/);
});

test('L-13 glossary, Korean Hanja, simplified-only characters, zh-Hant mainland terms (R64)', () => {
  let i = runLocales((s) => {
    feat(s.ja, 'swipe').kicker = 'スワイプ翻訳';
    faq(s.en, 'restore').a = faq(s.en, 'restore').a.replace('Restore Purchase', 'Restore');
    feat(s['zh-Hans'], 'speech').text += '支持滑动翻译。';
    feat(s.en, 'lookup').text += ' Double-click a word to see it.';
  });
  expectE(i, 'L-13', /ja features\[swipe\]\.kicker: "スワイプ翻訳" must be the app's name "右スワイプ翻訳"/);
  expectE(i, 'L-13', /en faq\.items\[restore\]\.a: must quote the app's "Restore Purchase"/);
  expectE(i, 'L-13', /zh-Hans features\[speech\]\.text: "滑动翻译" is banned/);
  expectE(i, 'L-13', /en features\[lookup\]\.text: "Double-click" is banned/);
  i = runLocales((s, cfg) => {
    cfg.LOCALES.find((l) => l.code === 'ko').publish = true;
    s.ko = structuredClone(s.en);
    s.ko.hero.how = '任意의 텍스트를 오른쪽으로 밀면 번역이 나와요.';
    s.ja.hero.how += '更多释义';
  }, { data: { simplifiedOnly: new Set(['释']), simplifiedOnlyJa: new Set(['释']), glossary: { ko: null } } });
  expectE(i, 'L-13', /ko hero\.how: Han characters "任意"/);
  expectE(i, 'L-13', /ja hero\.how: simplified-only character\(s\) 释/);
  expectW(i, 'L-13', /missing for published locale\(s\): ko/);
  const mainland = Array.from({ length: 40 }, (_, k) => ({ pattern: k ? `詞組${k}號` : '網絡', use: '網路' }));
  const zhHant = (s, cfg) => { cfg.LOCALES.find((l) => l.code === 'zh-Hant').publish = true; s['zh-Hant'] = structuredClone(s['zh-Hans']); s['zh-Hant'].hero.how = '在內建瀏覽器開啟網頁，網絡連線即可。'; };
  i = runLocales(zhHant, { data: { glossary: { 'zh-Hant': { mainlandTerms: mainland } } } });
  expectE(i, 'L-13', /zh-Hant hero\.how: "網絡" \(mainland term\) is banned — use "網路"/);
  i = runLocales(zhHant, { data: { glossary: { 'zh-Hant': { mainlandTerms: mainland.slice(0, 10) } } } });
  expectE(i, 'L-13', /zh-Hant glossary has 10 mainland-term groups; R64 requires ≥ 40/);
});

test('L-14 product-claim lint on leaf values, scoped rules, coverage warning', () => {
  let i = runLocales((s) => {
    feat(s.en, 'swipe').text += ' Or translate the whole page with one tap.';
    s.ja.hero.how += 'オフラインでも使えます。';
    s['zh-Hans'].sibling.card.body += '它可能更适合你。';
    s.en.sibling.card.body += ' New in 2026.';
    feat(s.en, 'engines').kicker = 'New engines';   // se-hype is scoped to the SurfEnglish copy
  });
  expectE(i, 'L-14', /en features\[swipe\]\.text: "translate the whole page" — whole-page/);
  expectE(i, 'L-14', /ja hero\.how: "オフライン" — offline/);
  expectE(i, 'L-14', /zh-Hans sibling\.card\.body: "可能更适合你" — replacement-tone/);
  expectE(i, 'L-14', /en sibling\.card\.body: "New" — se-hype/);
  noErrors(i, 'L-14', /features\[engines\]\.kicker/);
  i = runLocales(null, { data: { claims: { rules: [{ id: 'test-only-en', patterns: { en: ['zzzz'] } }] } } });
  expectW(i, 'L-14', /ja: claims-lint rules without ja or '\*' patterns \(not covered, review by hand\): test-only-en/);
});

// ———————————————————————————— D-1 … D-24 ————————————————————————————

test('D-1 canonical', () => {
  const i = runDist((d) => {
    edit(d, 'about/index.html', (h) => h.replace('<link rel="canonical" href="https://www.word-by-word.app/about/">\n', ''));
    edit(d, '404.html', (h) => h.replace('<meta name="robots" content="noindex,follow">', '<meta name="robots" content="noindex,follow">\n<link rel="canonical" href="https://www.word-by-word.app/404.html">'));
    edit(d, 'ja/index.html', (h) => h.replace('<link rel="canonical" href="https://www.word-by-word.app/ja/">', '<link rel="canonical" href="https://www.word-by-word.app/">'));
  });
  expectE(i, 'D-1', /\/about\/ \(en\): 0 canonical links, expected exactly 1/);
  expectE(i, 'D-1', /\/404\.html \(en\): noindex page must not have a canonical/);
  expectE(i, 'D-1', /\/ja\/ \(ja\): canonical https:\/\/www\.word-by-word\.app\/ ≠ https:\/\/www\.word-by-word\.app\/ja\//);
});

test('D-2 hreflang clusters (HL-1…HL-11)', () => {
  const i = runDist((d) => {
    edit(d, 'ja/index.html', (h) => h.replace('<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/">\n', ''));
    edit(d, 'about/index.html', (h) => h.replace('<meta property="og:type"', '<link rel="alternate" hreflang="en" href="https://surfenglish.app/">\n<meta property="og:type"'));
  });
  const n = (readFileSync(join(BUILT, 'ja/index.html'), 'utf8').match(/<link rel="alternate" hreflang=/g) ?? []).length; // grows with M3
  expectE(i, 'D-2', new RegExp(`/ja/ \\(ja\\): ${n - 1} hreflang links, expected ${n}`));
  expectE(i, 'D-2', /\/ja\/ \(ja\): expected hreflang zh-Hans → https:\/\/www\.word-by-word\.app\/zh-hans\/, got nothing/);
  expectE(i, 'D-2', /\/zh-hans\/ \(zh-Hans\): https:\/\/www\.word-by-word\.app\/ja\/ does not list this page back/);
  expectE(i, 'D-2', /\/about\/ \(en\): hreflang must never point to surfenglish\.app/);
});

test('D-3 sitemap ↔ HTML', () => {
  const i = runDist((d) => edit(d, 'sitemap.xml', (x) => x
    .replace('<loc>https://www.word-by-word.app/ja/</loc>', '<loc>https://www.word-by-word.app/ja/</loc>\n    <image:image><image:loc>https://www.word-by-word.app/assets/missing.jpg</image:loc></image:image>')
    .replace(/(<loc>https:\/\/www\.word-by-word\.app\/zh-hans\/<\/loc>[\s\S]*?hreflang="ja" href=")https:\/\/www\.word-by-word\.app\/ja\//, '$1https://www.word-by-word.app/jp/')
    .replace('</urlset>', '  <url>\n    <loc>https://www.word-by-word.app/404.html</loc>\n  </url>\n</urlset>')));
  expectE(i, 'D-3', /sitemap image:loc https:\/\/www\.word-by-word\.app\/assets\/missing\.jpg does not exist in dist/);
  expectE(i, 'D-3', /sitemap xhtml:link for https:\/\/www\.word-by-word\.app\/zh-hans\/ differ/);
  expectE(i, 'D-3', /sitemap <loc> https:\/\/www\.word-by-word\.app\/404\.html is not an indexable route/);
});

test('D-4 internal links resolve with Cloudflare semantics, case-sensitively', () => {
  const i = runDist((d) => edit(d, 'about/index.html', inMain('<p><a href="/legal/privacy/">a</a> <a href="/en/">b</a> <a href="/About/">c</a> <a href="#">d</a> <a href="/about">e</a> <a href="/ja/index.html">f</a></p>')));
  expectE(i, 'D-4', /links to the storage path \/legal\/privacy\//);
  expectE(i, 'D-4', /links to \/en\/, a redirect source \(\/en\/ → \/ 301\)/);
  expectE(i, 'D-4', /href \/About\/ does not exist in dist \(case-sensitive\)/);
  expectE(i, 'D-4', /<a href="#">/);
  expectE(i, 'D-4', /links to \/about — Cloudflare 308s \/about to \/about\//);
  expectE(i, 'D-4', /links to \/ja\/index\.html — Cloudflare strips \.html/);
});

test('D-5 anchors and id references', () => {
  const i = runDist((d) => {
    edit(d, 'about/index.html', inMain('<p><a href="#nope">a</a> <a href="/ja/#nope">b</a></p><span id="main"></span>'));
    edit(d, 'index.html', (h) => h.replace('<section id="pricing"', '<section id="pricing-x"'));
  });
  expectE(i, 'D-5', /\/about\/ \(en\): in-page anchor #nope has no target/);
  expectE(i, 'D-5', /\/ja\/#nope — no id "nope" on \/ja\//);
  expectE(i, 'D-5', /id "main" is used more than once/);
  expectE(i, 'D-5', /\/ \(en\): home page lacks the registered section id #pricing/);
});

test('D-6 <img> attributes, placeholders, srcset files', () => {
  const i = runDist((d) => edit(d, 'about/index.html', (h) => h
    .replace(/(<img [^>]*?) alt="[^"]*"/, '$1')
    .replace(/(<footer[\s\S]*?<img [^>]*?) loading="lazy"/, '$1')
    .replace('<main id="main">', '<main id="main"><picture><source type="image/avif" srcset="/assets/img/missing-360.avif 360w"></picture><span class="img-missing" data-img-key="shot/en/nothing" role="img" aria-label="x"></span>')));
  expectE(i, 'D-6', /\/about\/ \(en\): <img src="[^"]+"> has no alt attribute/);
  expectE(i, 'D-6', /is not the first image and lacks loading="lazy"/);
  expectE(i, 'D-6', /srcset \/assets\/img\/missing-360\.avif does not exist in dist/);
  if (existsSync(join(ROOT, 'assets/img/images.json'))) expectE(i, 'D-6', /image "shot\/en\/nothing" is not in assets\/img\/images\.json/);
});

test('D-6 one eager LCP image (fetchpriority="high") besides the first image', () => {
  // the extension page's hero screenshot is eager by design (doc 05 §8.2) and passes as built
  assert.ok(readFileSync(join(BUILT, 'chrome-extension/index.html'), 'utf8').includes('fetchpriority="high"'));
  assert.ok(!runDist().error.some((e) => e.includes('D-6')));
  const i = runDist((d) => edit(d, 'chrome-extension/index.html', (h) => h
    .replace(/(<footer[\s\S]*?<img [^>]*?) loading="lazy"/, '$1 fetchpriority="high"')
    .replace(/(<section id="screenshots"[\s\S]*?<img [^>]*?)>/, '$1 fetchpriority="high">')));
  expectE(i, 'D-6', /\/chrome-extension\/ \(en\): 3 images with fetchpriority="high"/);
  expectE(i, 'D-6', /has fetchpriority="high" but loading="lazy"/);
});

test('D-7 image budget', (t) => {
  if (!existsSync(join(ROOT, 'assets/img/images.json'))) return t.skip('image registry not generated yet (D-7 is skipped with a warning)');
  const i = runDist((d) => {
    const icon = readFileSync(join(d, 'about/index.html'), 'utf8').match(/<img src="(\/assets\/img\/brand\/[^"]+)"/)[1];
    writeFileSync(join(d, icon.slice(1)), Buffer.alloc(200 * 1024));
  });
  expectE(i, 'D-7', /\/about\/ \(en\): eager images 200\.0 KB > 150 KB/);
});

test('D-8 headings', () => {
  const i = runDist((d) => edit(d, 'about/index.html', inMain('<h1>Second</h1><h4>Skipped</h4>')));
  expectE(i, 'D-8', /\/about\/ \(en\): 2 <h1> elements, expected exactly 1/);
  expectW(i, 'D-8', /heading level skips from h1 to h4/);
});

test('D-9 JSON-LD', () => {
  const i = runDist((d) => {
    edit(d, 'index.html', (h) => h
      .replace('"isAccessibleForFree":true', '"aggregateRating":{"@type":"AggregateRating","ratingValue":5},"isAccessibleForFree":true')
      .replace('"@type":"WebPage"', '"@type":"FAQPage"')
      .replace('"applicationCategory":"EducationalApplication"', '"applicationCategory":"Education"')
      .replace('"name":"Jinlong"', '"name":"Chi Jinlong"')
      .replace('"about":{"@id":"https://www.word-by-word.app/#app"}', '"about":{"@id":"https://www.word-by-word.app/#nothing"}'));
    edit(d, 'ja/index.html', (h) => h.replace('<script type="application/ld+json">{', '<script type="application/ld+json">{,'));
    edit(d, 'about/index.html', inMain('<p>By Chi Jinlong</p>'));
  });
  expectE(i, 'D-9', /^D-9 \/ \(en\): JSON-LD must not contain aggregateRating/);
  expectE(i, 'D-9', /FAQPage structured data is not output \(R5\)/);
  expectE(i, 'D-9', /applicationCategory "Education" is not a Google-supported category/);
  expectE(i, 'D-9', /Person name "Chi Jinlong" ≠ SITE\.makerName "Jinlong"/);
  expectE(i, 'D-9', /reference .* → https:\/\/www\.word-by-word\.app\/#nothing is not defined on this site/);
  expectE(i, 'D-9', /ja\/index\.html: JSON-LD does not parse/);
  expectE(i, 'D-9', /\/about\/ \(en\): "Chi Jinlong" appears in visible text/);
});

test('D-10 absolute URL hygiene', () => {
  const i = runDist((d) => edit(d, 'about/index.html', inMain('<p>https://wordbyword-web.pages.dev/</p>')));
  expectE(i, 'D-10', /dist\/about\/index\.html contains "pages\.dev"/);
  const c = runConfig((cfg) => { cfg.SITE.url = 'https://wordbyword-web.pages.dev'; });
  expectE(c, 'D-10', /SITE\.url must not be a pages\.dev host/);
});

test('D-11 SurfEnglish placements and App Store attribution (R3, R35, R40, R42, R43, R55)', () => {
  const i = runDist((d) => {
    edit(d, 'index.html', (h) => {
      const card = h.match(/\n<aside class="sibling" id="surfenglish"[\s\S]*?<\/aside>/)[0];
      const moved = card
        .replace('<h2 id="se-h" class="h-3">SurfEnglish', '<h2 id="se-h" class="h-3">Learning English in particular? Meet SurfEnglish')
        .replace('<a class="sibling__store"', '<a class="asb"')
        .replace('href="https://surfenglish.app/"', 'href="https://surfenglish.app/?utm_source=wbw"');
      return h.replace(card, '').replace('<section id="pricing"', `${moved}\n<section id="pricing"`)
        .replace(/<div class="pricing-cta"><a class="asb[^"]*"/, '<div class="pricing-cta"><a class="btn"') // drawn or official badge
        .replace('<main id="main">', '<main id="main"><p data-ga-label="langhint_anchor" data-ga-view="x"><a href="https://apps.apple.com/app/apple-store/id6741724502?pt=1&ct=wbw-hero-en&mt=8">x</a></p>');
    });
    edit(d, 'zh-hans/index.html', inMain('<a href="https://apps.apple.com/app/id6787367021">SurfEnglish</a>'));
  });
  expectE(i, 'D-11', /\/ \(en\): #surfenglish must sit after #pricing and before #faq/);
  expectE(i, 'D-11', /the #surfenglish H2 must start with "SurfEnglish"/);
  expectE(i, 'D-8', /H2 "Learning English in particular\? Meet SurfEnglish.*" opens with a learn-English phrase/);
  expectE(i, 'D-11', /App Store badge inside #surfenglish/);
  expectE(i, 'D-11', /SurfEnglish link https:\/\/surfenglish\.app\/\?utm_source=wbw carries utm_ parameters/);
  expectE(i, 'D-11', /#pricing must contain the WordByWord App Store badge link/);
  expectE(i, 'D-11', /data-ga-label="langhint_anchor"/);
  expectE(i, 'D-11', /data-ga-view is only allowed on #surfenglish/);
  expectE(i, 'D-11', /ct "wbw-hero-en" is not a registered placement/);
  expectE(i, 'D-11', /\/zh-hans\/ \(zh-Hans\): SurfEnglish App Store link on a zh-Hans page/);
});

test('D-12 _redirects structure, fixture and the all-switches self-test (R54)', () => {
  const i = runDist((d) => edit(d, '_redirects', (x) => `${x.replace('/index.html  /  301\n', '')}/foo  /en  301\n/foo  /  301\n/bar  /nope/  301\n`));
  expectE(i, 'D-12', /\/foo → \/en: target is itself redirected by \/en → \/ \(b, no chains\)/);
  expectE(i, 'D-12', /source \/foo appears twice/);
  expectE(i, 'D-12', /\/bar → \/nope\/: target does not resolve to a file in dist \(a\)/);
  expectE(i, 'D-12', /expected B1 \/index\.html \/ 301, got \/index \/ 301 \(g\)/);
  const c = runConfig((cfg) => { cfg.ALIASES.push({ from: 'about', to: 'en' }); });
  expectE(c, 'D-12', /self-test .*\/about\/ → \/: redirects an indexable page's canonical URL \(f\)/);
  // the generator reproduces the doc 02 §5.2.2 fixture line by line under the default switches
  const fixture = readRedirectFixture(join(ROOT, 'scripts/fixtures/redirects.default.txt'));
  const cfg = freshCfg();
  cfg.LOCALES.forEach((l) => { l.publish = true; });
  cfg.SITE.contractMode = 'proxy';
  cfg.SITE.redirectFlags = { indexHtmlRule: true, experimentL: false, experimentC: false };
  assert.deepEqual(expectedRedirects(fixture, { cfg, site: cfg.SITE }).map((r) => `${r.from} ${r.to} ${r.code}`), fixture.map((r) => `${r.from} ${r.to} ${r.code}`));
  assert.equal(fixture.filter((r) => !r.from.includes('*')).length, 67);
  // all switches on: the doc 02 §5.2.3 count table says 76 static / 10 dynamic
  cfg.SITE.redirectFlags = { indexHtmlRule: true, experimentL: true, experimentC: true };
  const all = expectedRedirects(fixture, { cfg, site: cfg.SITE });
  assert.deepEqual([all.filter((r) => !r.from.includes('*')).length, all.filter((r) => r.from.includes('*')).length], [76, 10]);
  // the build of the real configuration equals the fixture plus the deltas of its own switches
  const real = freshCfg();
  assert.deepEqual(parseRedirects(readFileSync(join(BUILT, '_redirects'), 'utf8')).map((r) => `${r.from} ${r.to} ${r.code}`),
    expectedRedirects(fixture, { cfg: real, site: real.SITE }).map((r) => `${r.from} ${r.to} ${r.code}`));
});

test('D-13 _headers', () => {
  const i = runDist((d) => edit(d, '_headers', (x) => `${x.replace('/*\n', '/*\n  Content-Language: en\n  Cache-Control: no-store\n').replace('/assets/*\n', '/assets/*\n  X-Robots-Tag: noindex\n')}\n/assets/img/*\n  Cache-Control: public, max-age=60\n`));
  expectE(i, 'D-13', /\/\*: Content-Language must not be sent as a header/);
  expectE(i, 'D-13', /\/\*: Cache-Control in the \/\* block/);
  expectE(i, 'D-13', /\/assets\/\*: X-Robots-Tag is only allowed in the pages\.dev host rules/);
  expectE(i, 'D-13', /header cache-control is set by both "\/assets\/\*" and "\/assets\/img\/\*"/);
});

test('D-14 required and forbidden files', () => {
  const i = runDist((d) => {
    rmSync(join(d, '404.html'));
    writeFileSync(join(d, 'privacy.html'), '<!doctype html>');
    writeFileSync(join(d, 'assets/extra.css'), 'a{}');
  });
  expectE(i, 'D-14', /dist\/404\.html missing/);
  expectE(i, 'D-14', /dist\/privacy\.html exists while contract privacy is proxied/);
  expectE(i, 'D-14', /dist\/assets\/extra\.css: CSS\/JS outside the fingerprinted bundle/);
});

test('D-12 switches need their M1-03 evidence; D-14 IndexNow key and legacy sitemap', () => {
  const c = runConfig((cfg) => { delete cfg.SITE.redirectEvidence.experimentC; delete cfg.SITE.redirectEvidence.experimentL; cfg.SITE.redirectEvidence.typo = 'x'; });
  expectE(c, 'D-12', /experimentC is on without a preview measurement/);
  expectW(c, 'D-12', /experimentL is on without a preview measurement/);
  expectE(c, 'D-12', /SITE\.redirectEvidence has unknown switch "typo"/);
  noErrors(runConfig(), 'D-12');
  expectE(runConfig((cfg) => { cfg.SITE.indexNowKey = 'bad key!'; }), 'D-14', /not a valid IndexNow key/);
  const key = freshCfg().SITE.indexNowKey;
  assert.ok(key && existsSync(join(BUILT, `${key}.txt`)), 'the build publishes /<key>.txt');
  expectE(runDist((d) => rmSync(join(d, `${key}.txt`))), 'D-14', /must exist and contain the IndexNow key/);
  expectE(runDist(null, { cfgMut: (cfg) => { cfg.SITE.legacySitemap = true; } }), 'D-14', /sitemap-legacy\.xml missing/);
  // all locales published: /index.html, /en-top(.html) and the 40 C sources — 43 old URLs, absolute, in rule order
  const cfg = freshCfg();
  cfg.LOCALES.forEach((l) => { l.publish = true; });
  const xml = buildLegacySitemap(buildRedirects({ SITE: cfg.SITE, LOCALES: cfg.LOCALES, CONTRACTS: cfg.CONTRACTS, ALIASES: cfg.ALIASES }).rules, { absUrl: (p) => cfg.SITE.url + p });
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 43);
  assert.deepEqual(locs.slice(0, 4), ['/index.html', '/en-top.html', '/en-top', '/cn-top.html'].map((p) => cfg.SITE.url + p));
  const paths = locs.map((u) => u.slice(cfg.SITE.url.length));
  assert.ok(paths.every((p) => p === '/index.html' || /^\/[a-z]+-top(\.html)?$/.test(p)), paths.join(' ')); // no /index, /legal/*, X or splats
});

test('D-15 (a) product claims in template literals, SIBLING and notice copy', () => {
  const root = join(TMP, 'tpl-root');
  mkdirSync(join(root, 'src/templates'), { recursive: true });
  writeFileSync(join(root, 'src/templates/x.mjs'), 'export const x = (t) => `<p class="dark">${t}</p><p>Translate the whole page with one tap</p>`; // a dark mode comment is not a literal\nconst re = /"dark mode"/;\n');
  writeFileSync(join(root, 'src/templates/chrome-extension.mjs'), "export const y = 'Light, dark mode or automatic appearance';\n");
  const cfg = { ...freshCfg(), root };
  cfg.notice.copy.en.message += ' Offline translation keeps working.';
  const i = newIssues();
  checkTemplateClaims(cfg, loadData(freshCfg()), i);
  expectE(i, 'D-15', /src\/templates\/x\.mjs: "Translate the whole page" — whole-page/);
  expectE(i, 'D-15', /src\/notice\.json copy\.en\.message: "Offline" — offline/);
  assert.equal(i.error.filter((m) => /chrome-extension\.mjs|dark mode/.test(m)).length, 0, i.error.join('\n'));
  // wired into validateDist
  const d = runDist(null, { cfgMut: (c) => { c.notice.copy.ja.message += 'オフラインでも使えます。'; } });
  expectE(d, 'D-15', /src\/notice\.json copy\.ja\.message: "オフライン"/);
  assert.deepEqual(stringLiterals("const a = 'x', b = \"y\"; // 'no'\nconst r = /'z'/g; const t = `p ${q ? 'w' : `v`} s`;"), ['x', 'y', 'w', 'v', 'p   s']);
});

test('D-15 (b) pseudo-locale scan finds hard-coded interface strings', () => {
  const dir = join(TMP, 'pseudo-unit');
  mkdirSync(join(dir, 'about'), { recursive: true });
  writeFileSync(join(dir, 'about/index.html'), '<!doctype html><html lang="en"><head><title>⟦About⟧ — WordByWord</title><meta name="description" content="⟦x⟧ Hello there"><script>var notChecked = "Hidden words";</script></head><body><main><h1>⟦About <span class="kw">us</span> today⟧</h1><p>⟦ok⟧ Download now</p><img src="/x.png" alt="Close" width="1" height="1"><p>English · 日本語 · App Store · iPhone</p><div class="legal-body">Verbatim legal text</div></main></body></html>');
  const cfg = freshCfg();
  const i = newIssues();
  scanPseudoDist(dir, { cfg, routes: expandRoutes(cfg), strings: REAL }, i);
  expectE(i, 'D-15', /\/about\/ \(en\): hard-coded interface text in text: "Download", "now"/);
  expectE(i, 'D-15', /in alt: "Close"/);
  expectE(i, 'D-15', /in meta content: "Hello", "there"/);
  assert.equal(i.error.filter((m) => /Hidden|Verbatim|English|Store|iPhone|today/.test(m)).length, 0, i.error.join('\n'));
  const p = pseudoStrings(REAL);
  assert.equal(p.en.hero.title, `⟦${REAL.en.hero.title}⟧`);
  assert.equal(p.en.features[0].id, REAL.en.features[0].id);
  assert.equal(p.en.demo.lookup.word, REAL.en.demo.lookup.word);
  assert.deepEqual(hardCodedWords('⟦outer ⟦inner⟧ done⟧ WordByWord Translate stray', new Set(['WordByWord'])), ['stray']);
});

test('D-16 file names', () => {
  const i = runDist((d) => writeFileSync(join(d, 'assets/Foo Bar.png'), 'x'));
  expectE(i, 'D-16', /dist\/assets\/Foo Bar\.png: file names must be lower-case ASCII without spaces/);
});

test('D-17 site notice', () => {
  const c = runConfig((cfg) => { cfg.notice.level = 'panic'; cfg.notice.pages = 'some'; cfg.notice.enabled = true; delete cfg.notice.copy.ja; });
  expectE(c, 'D-17', /notice\.level "panic"/);
  expectE(c, 'D-17', /notice\.pages "some"/);
  expectW(c, 'D-17', /notice is enabled but has no copy for ja/);
  const i = runDist(null, { cfgMut: (cfg) => { cfg.notice.enabled = true; } });
  expectE(i, 'D-17', /\/ \(en\): notice is enabled but not rendered/);
  expectE(i, 'D-11', /#surfenglish must not render while the site notice is on \(R35\)/);
});

test('D-18 size budgets', () => {
  const i = runDist((d) => edit(d, 'ja/index.html', (h) => h.replace('</main>', `<p>${'あいうえお'.repeat(9000)}</p></main>`)));
  expectW(i, 'D-18', /dist\/ja\/index\.html: [\d.]+ KB \/ gzip [\d.]+ KB over the home budget 80 \/ 20 KB/);
});

test('D-19 no dotfiles', () => {
  const i = runDist((d) => writeFileSync(join(d, 'assets/.DS_Store'), 'x'));
  expectE(i, 'D-19', /dist\/assets\/\.DS_Store: dotfile in output/);
});

test('D-20 indexable ⇔ robots ⇔ canonical ⇔ sitemap (R49)', () => {
  const i = runDist((d) => {
    edit(d, 'about/index.html', (h) => h.replace('content="index,follow,max-image-preview:large"', 'content="noindex,follow"'));
    edit(d, 'ja/index.html', (h) => h.replace('content="index,follow,max-image-preview:large"', 'content="index,nofollow"'));
  });
  expectE(i, 'D-20', /\/about\/ \(en\): indexable=true but robots=noindex canonical=self sitemap=yes/);
  expectE(i, 'D-20', /\/ja\/ \(ja\): robots "index,nofollow" contains nofollow/);
});

test('D-21 image registry and AVIF structure (R8, R79)', (t) => {
  const src = ['assets/img/shot/en/swipe-360.avif', 'docs/redesign-2026/prototype/assets/app/en/swipe-360.avif'].map((p) => join(ROOT, p)).find(existsSync);
  if (!src) return t.skip('no AVIF sample in this checkout');
  const root = join(TMP, 'img-root');
  mkdirSync(join(root, 'assets/img'), { recursive: true });
  copyFileSync(src, join(root, 'assets/img/a.avif'));
  writeFileSync(join(root, 'assets/img/images.json'), JSON.stringify({ a: { variants: [
    { format: 'avif', w: 361, h: 734, bytes: 1, path: 'assets/img/a.avif' },
    { format: 'jpg', w: 360, h: 734, path: 'assets/img/missing.jpg' }] } }));
  const i = newIssues();
  checkRegistry({ root }, i);
  expectE(i, 'D-21', /a: assets\/img\/a\.avif is \d+ bytes, images\.json says 1 — image changed without re-running the pipeline/);
  expectE(i, 'D-21', /a: assets\/img\/a\.avif: size 360x734 differs from images\.json 361x734/);
  expectE(i, 'D-21', /a: assets\/img\/missing\.jpg is registered but missing/);
});

test('D-22 <html> attributes, content-language and the LOCALES assertions (R47, R60)', () => {
  const i = runDist((d) => edit(d, 'ja/index.html', (h) => h
    .replace('<html lang="ja" dir="ltr" data-script="cjk"', '<html lang="en" dir="ltr" data-script="latn"')
    .replace('<meta http-equiv="content-language" content="ja">', '<meta http-equiv="content-language" content="ja">\n<meta http-equiv="content-language" content="en">')));
  expectE(i, 'D-22', /\/ja\/ \(ja\): <html lang="en"> ≠ ja/);
  expectE(i, 'D-22', /\/ja\/ \(ja\): data-script="latn" ≠ cjk/);
  expectE(i, 'D-22', /\/ja\/ \(ja\): 2 content-language meta tags, expected 1/);
  const c = runConfig((cfg) => {
    cfg.LOCALES.find((l) => l.code === 'ko').script = 'hangul';
    cfg.LOCALES.find((l) => l.code === 'de').contentLanguage = 'de_DE';
    cfg.LOCALES.find((l) => l.code === 'pt-BR').hreflangExtra = ['es'];
  });
  expectE(c, 'D-22', /LOCALES ko: script "hangul" is not one of/);
  expectE(c, 'D-22', /LOCALES de: contentLanguage "de_DE"/);
  expectE(c, 'D-22', /LOCALES pt-BR: hreflangExtra "es" duplicates a locale hreflang/);
});

test('D-23 OG images match the copy (ENG-12, R59)', () => {
  const root = join(TMP, 'og-root');
  mkdirSync(join(root, 'assets/og'), { recursive: true });
  const jpeg = (w, h) => Buffer.from([0xFF, 0xD8, 0xFF, 0xC0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xD9]);
  assert.deepEqual(jpegSize(jpeg(1200, 630)), { w: 1200, h: 630 });
  const cfg = freshCfg();
  const L = (code) => cfg.LOCALES.find((l) => l.code === code);
  const good = ogInputs('home', L('en'), REAL.en);
  writeFileSync(join(root, 'assets/og/home-en.jpg'), jpeg(1200, 630));
  writeFileSync(join(root, 'assets/og/home-ja.jpg'), jpeg(100, 100));
  writeFileSync(join(root, 'assets/og/og.json'), JSON.stringify({ template: 'v1', images: {
    'home-en': { file: 'assets/og/home-en.jpg', inputs: { ...good, headline: 'old headline' }, sha256: ogInputHash({ ...good, headline: 'old headline', template: 'v1' }) },
    'home-ja': { file: 'assets/og/home-ja.jpg', sha256: ogInputHash({ ...ogInputs('home', L('ja'), REAL.ja), template: 'v1' }) },
  } }));
  const i = newIssues();
  checkOg({ ...cfg, root }, REAL, expandRoutes(cfg), { og: false }, i);
  expectE(i, 'D-23', /home-en: copy changed since the OG image was rendered \(headline\) — re-run npm run og/);
  expectE(i, 'D-23', /home-ja: assets\/og\/home-ja\.jpg is 100×100, expected 1200×630/);
  expectE(i, 'D-23', /home-zh-Hans: no OG image for a published page/);
  noErrors(i, 'D-23', /home-ja: copy changed/);
});

test('D-24 extension page header: own navigation and an honest main button (doc 02 §3.5, §7.1)', () => {
  const i = runDist((d) => edit(d, 'chrome-extension/index.html', (h) => h
    .replace(/<a class="btn btn-small" href="[^"]*" data-ga-label="chrome_ext">.*?<\/a>/, '<a class="btn btn-small" href="https://apps.apple.com/app/id6741724502" data-ga-label="header">Download</a>')
    .replaceAll('<li><a href="#features">', '<li><a href="/#features">')));
  expectE(i, 'D-24', /S0 — the header button must be the WBW App Store link labelled as the iPhone app, not "Download"/);
  expectE(i, 'D-24', /the extension page header must link #features/);
  noErrors(runDist(), 'D-24');
});

test('D-24 Chrome extension sub-site S0 / S1 (R2, R16, R45)', () => {
  let i = runDist((d) => {
    edit(d, 'index.html', (h) => h
      .replace('<nav class="main-nav" aria-label="Main"><ul>', '<nav class="main-nav" aria-label="Main"><ul><li><a href="/chrome-extension/">Chrome extension</a></li>')
      .replace('<main id="main">', '<main id="main"><a href="https://chromewebstore.google.com/detail/wordbyword/abcdefghijklmnopabcdefghijklmnop">x</a>'));
    edit(d, 'chrome-extension/index.html', (h) => h.replaceAll('WordByWord.io', 'another site'));
  });
  expectE(i, 'D-24', /\/ \(en\): S0 — the header navigation must not show the extension item/);
  expectE(i, 'D-24', /\/ \(en\): S0 — link to the Chrome Web Store/);
  expectE(i, 'D-24', /\/chrome-extension\/ \(en\): the extension page must state it is not affiliated with WordByWord\.io/);
  i = runDist(null, { cfgMut: (cfg) => { cfg.SITE.chromeStoreUrl = 'https://chromewebstore.google.com/detail/wordbyword-translate/abcdefghijklmnopabcdefghijklmnop'; } });
  expectE(i, 'D-24', /\/ \(en\): S1 — the header navigation must show the extension item/);
  expectE(i, 'D-24', /\/chrome-extension\/ \(en\): S1 — the extension CTA must link to SITE\.chromeStoreUrl/);
  expectE(i, 'D-24', /\/ \(en\): FAQ devices must use the S1 aExtLive answer/);
  const c = runConfig((cfg) => { cfg.SITE.chromeStoreUrl = 'https://chrome.google.com/webstore/search/wordbyword'; });
  expectE(c, 'D-24', /SITE\.chromeStoreUrl "https:\/\/chrome\.google\.com\/webstore\/search\/wordbyword" must be null/);
});

// ———————————————————————————— building blocks ————————————————————————————

test('text-length reproduces the measured values of doc 03 §3.9', () => {
  const cases = [
    ['latn', 'WordByWord: Bilingual Web Page Translator App for iPhone', 56],
    ['cjk', 'WordByWord：iPhone 网页双语对照翻译 App｜右滑即译，AI 语境查词', 31],
    ['cjk', 'WordByWord｜iPhoneでWebページを翻訳・対訳表示するアプリ', 27.5],
    ['cjk', 'Webページの段落を右スワイプで翻訳。原文はそのまま、訳文は下に', 30.5],
    ['cjk', 'WordByWord: 아이폰 웹페이지 번역 앱 | 원문·번역 같이 보기', 28.5],
    ['thai', 'WordByWord: แอปแปลเว็บไซต์สองภาษาบน iPhone', 40],
    ['deva', 'WordByWord: iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप', 47],
    ['arab', 'WordByWord: تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone', 60],
    ['arab', 'لمتعلمي اللغات: في متصفح WordByWord، اسحب أي فقرة إلى اليمين فتظهر ترجمتها أسفلها. انقر نقرًا مزدوجًا على كلمة لتعرف معناها حسب السياق. مجاني على iPhone وiPad.', 157],
    ['cyrl', 'WordByWord Переводчик: двуязычный перевод сайтов на iPhone', 58],
  ];
  for (const [script, s, n] of cases) assert.equal(textLength(s, script), n, `${script}: ${s}`);
  assert.equal(wu('日本語abc'), 9);
  assert.equal(graphemes('👍🏽é'), 2);
  assert.throws(() => textLength('x', 'klingon'));
});

test('key paths, token matching, HTML parsing and CF path resolution', () => {
  assert.equal(getPath(REAL.en, 'features[lookup].bullets[2]'), feat(REAL.en, 'lookup').bullets[2]);
  assert.ok(keyMatch('faq.items[whole-page]', 'faq.items[whole-page].a'));
  assert.ok(keyMatch('about.facts[*].value', 'about.facts[3].value'));
  assert.ok(keyMatch('chromeExtension.', 'chromeExtension.hero.title'));
  assert.ok(!keyMatch('features[*].text', 'features[x].sample.text'));
  const t = setPath(structuredClone(REAL.en), 'features[swipe].kicker', 'K');
  assert.equal(feat(t, 'swipe').kicker, 'K');
  assert.ok(leaves(REAL.en).some((x) => x.path === 'faq.items[what-is].q'));
  assert.equal(shape(REAL.en).get('features').kind, 'array:id');
  assert.ok(hasToken('Web Page App for iPhone', 'App', 'latn'));
  assert.ok(!hasToken('the translation appears', 'App', 'latn'));
  assert.ok(hasToken('iPhoneでWebページ', 'Webページ', 'cjk'));
  const doc = parseHTML('<!doctype html><p id="a">x <b>y</b><img src="i" alt=""><svg><path d="M0"/></svg> &amp; z</p><p id="a"></p><script>if (a < b) {}</script>');
  assert.equal(textOf(doc).trim(), 'x y & z');
  assert.deepEqual(idIndex(doc).dup, ['a']);
  const files = new Set(['index.html', 'about/index.html', 'privacy.html', 'favicon.ico']);
  assert.deepEqual(resolvePath('/about/', files), { file: 'about/index.html', canonical: true });
  assert.equal(resolvePath('/about', files).canonical, false);
  assert.equal(resolvePath('/privacy', files).file, 'privacy.html');
  assert.equal(resolvePath('/privacy.html', files).canonical, false);
  assert.equal(resolvePath('/About/', files).file, undefined);
});

test('every rule L-1…L-14 and D-1…D-24 was caught by a broken sample above', () => {
  assert.deepEqual(RULES.filter((r) => !caught.has(r)), []);
});
