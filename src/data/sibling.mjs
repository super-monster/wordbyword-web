// SurfEnglish recommendation — the single configuration source (doc 04 §3.7, doc 06 §4.3; rulings R3, R35, R40–R44).
export const SIBLING = {
  enabled: true,                       // false hides ① card and ② FAQ (the recommendation); ④⑤ are family facts and stay
  placements: { card: true, faq: true, footer: true, about: true }, // placement ③ was removed (R42)
  name: 'SurfEnglish',
  appStoreId: '6787367021',
  siteOrigin: 'https://surfenglish.app',
  seLocalePath: {
    en: '', 'zh-Hans': 'zh-hans', 'zh-Hant': 'zh-hant', ja: 'ja', ko: 'ko',
    es: 'es', 'pt-BR': 'pt-br', vi: 'vi', id: 'id', th: 'th', hi: 'hi', ar: 'ar',
  },                                   // locales not listed → SurfEnglish English home ('en-site')
  platforms: ['iPhone', 'iPad'],
  perLocale: {
    'zh-Hans': { card: false, availabilityNote: true }, // R42: only ②④⑤; SE is not on the China mainland App Store
    de: { uiNote: true }, fr: { uiNote: true }, it: { uiNote: true }, nl: { uiNote: true },
    pl: { uiNote: true }, ru: { uiNote: true }, tr: { uiNote: true }, uk: { uiNote: true },
  },
  cardImage: 'se/common/games',        // games-home.jpg top crop (R44)
  ctMode: 'placement',                 // R3: ct per placement only (wbw-card, wbw-about)
  suppressWhenNotice: true,            // R35: hide ① while a site notice is on
  copyReviewedAt: '2026-10-05',        // build warns after 180 days (L-11)
};

// 'no-card' | 'local' | 'en-site'
export function seMode(locale) {
  if (SIBLING.perLocale[locale.code]?.card === false) return 'no-card';
  return locale.code in SIBLING.seLocalePath ? 'local' : 'en-site';
}
