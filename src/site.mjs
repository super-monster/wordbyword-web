// Site configuration shared by build.mjs and scripts/*.mjs.
// Spec: design doc 06 §3.1–3.3 (branch design-docs, docs/redesign-2026/06-技术架构与工程方案.md).
// Rulings referenced as R#; facts as F#.

import { readFileSync } from 'node:fs';

export const SITE = {
  // — Identity —
  url: 'https://www.word-by-word.app',          // canonical host; the only absolute-URL prefix
  name: 'WordByWord',
  alternateNames: ['Word by Word', 'WordByWord Translate'],
  supportEmail: 'app.wordbyword@gmail.com',
  xHandle: '@JinlongDev',                       // H15 default

  // — Maker entity (U4, F19, R17) —
  makerName: 'Jinlong',
  makerAltName: 'Chi Jinlong',                  // JSON-LD alternateName only, never visible text (R81)
  makerId: 'https://surfenglish.app/about/#maker',
  makerUrl: 'https://surfenglish.app/about/',
  makerSameAs: ['https://x.com/JinlongDev', 'https://apps.apple.com/developer/id1794902022'],
  artistId: '1794902022',

  // — App —
  appStoreId: '6741724502',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'iOS 18.0 or later',
  smartBanner: true,

  // — Chrome extension (U3, H4, R2): null/'' → S0 (noindex, hidden from header nav) —
  chromeStoreUrl: null,

  // — App Store attribution (F28, H3, R3, R55) —
  pt: '127618337',                              // App Store provider token (H3, 2026-10-07); null → plain /app/id<ID> links + build warning
  ct: { maxLen: 30, maxDistinct: 10 },

  // — Analytics (F9, H6) —
  gaId: 'G-QS1CJY8YWL',
  consentMode: 'off',

  // — Search engines —
  verification: { google: null, bing: null, yandex: null, naver: null },
  indexNowKey: '7e821565917eb89c0908b806e7ec1aca', // public by design: the build serves /<key>.txt (doc 03 §6.3)

  // — Hosting & redirects (doc 02 §5.2.1) —
  pagesProject: 'wordbyword-web',
  contractMode: 'proxy',                        // 'proxy' = C-1 | 'file' = C-2 | per-contract object
  redirectFlags: { indexHtmlRule: true, experimentL: true, experimentC: true },
  // The preview measurement behind each switch (M1-03; ops/decision-log.md on the design-docs branch). D-12 refuses
  // experimentC without one (a case-insensitive _redirects would loop) and warns for experimentL.
  redirectEvidence: { indexHtmlRule: 'M1-03 2026-10-06', experimentL: 'M1-03 2026-10-06', experimentC: 'M1-03 2026-10-06' },
  legacySitemap: true,                          // true from T0 until GSC shows every URL redirected or 6 weeks pass

  // — SEO —
  robots: { extra: [] },

  // — Visual (doc 05 §2) —
  themeColor: { light: '#FBF8F3', dark: '#121010' },
};

// code = locale file name & GA page_locale; path = URL segment; hreflang = BCP 47; og = ll_CC;
// script = <html data-script> (R60); contentLanguage = <meta http-equiv> value (R47);
// legacy = old "<x>-top.html" prefixes; badge = Apple badge locale (F28, I18-15).
const L = (code, path, hreflang, og, native, script, contentLanguage, legacy, badge, extra = {}) =>
  ({ code, path, hreflang, og, native, dir: 'ltr', script, contentLanguage, legacy, badge, ...extra });

export const LOCALES = [
  L('en',      '',        'en',      'en_US', 'English',            'latn', 'en',    ['en'],       'en-us'),
  L('zh-Hans', 'zh-hans', 'zh-Hans', 'zh_CN', '简体中文',            'cjk',  'zh-cn', ['cn', 'zh'], 'zh-cn'),
  L('zh-Hant', 'zh-hant', 'zh-Hant', 'zh_TW', '繁體中文',            'cjk',  'zh-tw', ['tw'],       'zh-tw'),
  L('ja',      'ja',      'ja',      'ja_JP', '日本語',              'cjk',  'ja',    ['ja'],       'ja-jp'),
  L('ko',      'ko',      'ko',      'ko_KR', '한국어',              'cjk',  'ko',    ['ko'],       'ko-kr'),
  L('es',      'es',      'es',      'es_ES', 'Español',            'latn', 'es',    ['es'],       'es-es'),
  L('pt-BR',   'pt-br',   'pt-BR',   'pt_BR', 'Português (Brasil)', 'latn', 'pt-br', ['pt'],       'pt-br', { hreflangExtra: ['pt'] }),
  L('fr',      'fr',      'fr',      'fr_FR', 'Français',           'latn', 'fr',    ['fr'],       'fr-fr'),
  L('de',      'de',      'de',      'de_DE', 'Deutsch',            'latn', 'de',    ['de'],       'de-de'),
  L('it',      'it',      'it',      'it_IT', 'Italiano',           'latn', 'it',    ['it'],       'it-it'),
  L('nl',      'nl',      'nl',      'nl_NL', 'Nederlands',         'latn', 'nl',    ['nl'],       'nl-nl'),
  L('pl',      'pl',      'pl',      'pl_PL', 'Polski',             'latn', 'pl',    ['pl'],       'pl-pl'),
  L('ru',      'ru',      'ru',      'ru_RU', 'Русский',            'cyrl', 'ru',    ['ru'],       'ru-ru'),
  L('tr',      'tr',      'tr',      'tr_TR', 'Türkçe',             'latn', 'tr',    ['tr'],       'tr-tr'),
  L('uk',      'uk',      'uk',      'uk_UA', 'Українська',         'cyrl', 'uk',    ['uk'],       'uk-ua'),
  L('vi',      'vi',      'vi',      'vi_VN', 'Tiếng Việt',         'latn', 'vi',    ['vi'],       'vi-vn'),
  L('th',      'th',      'th',      'th_TH', 'ไทย',                'thai', 'th',    ['th'],       'th-th'),
  L('id',      'id',      'id',      'id_ID', 'Bahasa Indonesia',   'latn', 'id',    ['id'],       'id-id'),
  L('ar',      'ar',      'ar',      'ar_AR', 'العربية',            'arab', 'ar',    ['ar'],       'en-us', { dir: 'rtl' }),
  L('hi',      'hi',      'hi',      'hi_IN', 'हिन्दी',              'deva', 'hi',    ['hi'],       'en-us'),
].map((l) => ({ publish: true, ...l }));

export const localeByCode = (code) => LOCALES.find((l) => l.code === code);

const extLive = () => Boolean(SITE.chromeStoreUrl); // S1 (R2)

// Contract URLs (F12): must stay reachable. C-1 serves them with 200 rewrites from /legal/<slug>/.
export const CONTRACTS = [
  { id: 'privacy', public: '/privacy.html', bare: '/privacy', bareSlash: '/privacy/',
    internal: '/legal/privacy/', source: 'src/legal/privacy.html' },
  { id: 'support', public: '/support.html', bare: '/support', bareSlash: '/support/',
    internal: '/legal/support/', source: 'src/legal/support.html' },
  { id: 'extension-privacy', public: '/chrome-extension/privacy.html', bare: '/chrome-extension/privacy',
    bareSlash: '/chrome-extension/privacy/', internal: '/legal/extension-privacy/',
    source: 'src/legal/extension-privacy.html', indexable: extLive },
];

// Doc 02 §5.2 group D: output order = array order; each item yields /x and /x/ (static) and /x/* (splat, last).
export const ALIASES = [
  { from: 'en', to: 'en' },
  { from: 'zh', to: 'zh-Hans' }, { from: 'cn', to: 'zh-Hans' }, { from: 'zh-cn', to: 'zh-Hans' },
  { from: 'tw', to: 'zh-Hant' }, { from: 'zh-tw', to: 'zh-Hant' },
  { from: 'pt', to: 'pt-BR' },
];

// First line of a legal source must be "<!-- updated: YYYY-MM-DD -->" (ENG-14): never the git date.
export function legalUpdated(source) {
  const first = readFileSync(source, 'utf8').split('\n', 1)[0];
  const m = first.match(/^<!--\s*updated:\s*(\d{4}-\d{2}-\d{2})\s*-->$/);
  return m ? m[1] : null;
}

const tpl = (name) => `src/templates/${name}.mjs`;

export const PAGES = [
  { id: 'home', template: 'home', locales: '*',
    path: (l) => (l.path ? `${l.path}/` : ''),
    indexable: true, contentGroup: 'home', sibling: 'full', notice: true,
    sources: (l) => [tpl('home'), 'src/templates/partials/demo.mjs', 'src/templates/partials/sibling.mjs',
      `src/locales/${l.code}.json`, 'src/data/product.json', 'src/data/sibling.mjs'] },
  { id: 'about', template: 'about', locales: ['en'], path: () => 'about/',
    indexable: true, contentGroup: 'about', sibling: 'about', notice: true,
    sources: () => [tpl('about'), 'src/locales/en.json', 'src/data/product.json', 'src/data/sibling.mjs'] },
  { id: 'chrome-extension', template: 'chromeExtension', locales: ['en', 'zh-Hans'], // R1
    path: (l) => (l.path ? `${l.path}/chrome-extension/` : 'chrome-extension/'),
    indexable: extLive, contentGroup: 'chrome_extension', sibling: 'footer-only', notice: true,
    sources: (l) => [tpl('chrome-extension'), `src/locales/${l.code}.json`, 'src/data/product.json'] },
  ...CONTRACTS.map((c) => ({
    id: c.id, template: 'legal', doc: c.id, locales: ['en'],
    path: () => c.internal.slice(1), publicUrl: c.public, contract: c,
    indexable: c.indexable ?? true, contentGroup: 'legal', sibling: 'footer-only', notice: true,
    sources: () => [c.source, tpl('legal')],
    updated: () => legalUpdated(c.source),
  })),
  // M4-12 (R21): one 404 per locale; CF serves the nearest <dir>/404.html (doc 02 §6.9, verified in M1-03)
  { id: '404', template: 'notfound', locales: '*', file: (l) => `${l.path ? `${l.path}/` : ''}404.html`,
    indexable: false, sitemap: false, contentGroup: '404', sibling: 'footer-only', notice: true,
    sources: (l) => [tpl('notfound'), `src/locales/${l.code}.json`] },
];

// Contract mode for one contract id: 'proxy' (C-1) or 'file' (C-2).
export function contractModeOf(id) {
  const m = SITE.contractMode;
  return typeof m === 'string' ? m : (m[id] ?? 'proxy');
}
