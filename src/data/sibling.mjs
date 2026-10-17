// SurfEnglish recommendation — the single configuration source (doc 04 §3.7, doc 06 §4.3; rulings R3, R35, R40–R44).
export const SIBLING = {
  enabled: true,                       // false hides ① card and ② FAQ (the recommendation); ④⑤ are family facts and stay
  // placement ③ was removed (R42); ⑦ strip = the one-line pointer under the hero that scrolls to ① (2026-10-17, owner)
  placements: { card: true, faq: true, footer: true, about: true, strip: true },
  name: 'SurfEnglish',
  appStoreId: '6787367021',
  siteOrigin: 'https://surfenglish.app',
  seLocalePath: {
    en: '', 'zh-Hans': 'zh-hans', 'zh-Hant': 'zh-hant', ja: 'ja', ko: 'ko',
    es: 'es', 'pt-BR': 'pt-br', vi: 'vi', id: 'id', th: 'th', hi: 'hi', ar: 'ar',
  },                                   // locales not listed → SurfEnglish English home ('en-site')
  platforms: ['iPhone', 'iPad'],
  perLocale: {
    // R42 as revised 2026-10-17 (owner): zh-Hans shows the card like every other locale, with no availability note on
    // it; the english-learner FAQ answer still ends with sibling.availability (SE is not on the China mainland store).
    'zh-Hans': { availabilityNote: true },
    de: { uiNote: true }, fr: { uiNote: true }, it: { uiNote: true }, nl: { uiNote: true },
    pl: { uiNote: true }, ru: { uiNote: true }, tr: { uiNote: true }, uk: { uiNote: true },
  },
  cardImage: 'se/common/games',        // games-home.jpg top crop (R44)
  ctMode: 'placement',                 // R3: ct per placement only (wbw-card, wbw-about)
  suppressWhenNotice: true,            // R35: hide ① while a site notice is on
  copyReviewedAt: '2026-10-17',        // build warns after 180 days (L-11)
};

// 'no-card' | 'local' | 'en-site'
export function seMode(locale) {
  if (SIBLING.perLocale[locale.code]?.card === false) return 'no-card';
  return locale.code in SIBLING.seLocalePath ? 'local' : 'en-site';
}
