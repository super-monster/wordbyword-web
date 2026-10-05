// URL helpers (doc 06 §2.1 lib/links.mjs). Internal links always use public URLs (never /legal/*, D-4).

import { SIBLING } from '../data/sibling.mjs';

export const localePath = (l) => (l.path ? `/${l.path}/` : '/');

// App Store links: ct per placement only, never per locale (R3, R55). Without a provider token (H3) the build
// emits the plain /app/id<ID> link (campaign attribution off).
export function appStoreLink(SITE, appId, placement) {
  if (!SITE.pt) return `https://apps.apple.com/app/id${appId}`;
  const ct = `wbw-${placement}`;
  if (ct.length > SITE.ct.maxLen) throw new Error(`ct too long: ${ct}`);
  return `https://apps.apple.com/app/apple-store/id${appId}?pt=${encodeURIComponent(SITE.pt)}&ct=${ct}&mt=8`;
}

// SurfEnglish site URL & hreflang for a WordByWord locale ('local' → same-language page; otherwise English home).
export function seSite(locale) {
  const path = SIBLING.seLocalePath[locale.code];
  if (path === undefined) return { href: `${SIBLING.siteOrigin}/`, hreflang: 'en' };
  return { href: `${SIBLING.siteOrigin}/${path ? `${path}/` : ''}`, hreflang: locale.hreflang };
}

// Rich-text ref whitelist (doc 06 §4.1, doc 08 S16/S26). Values: {href, attrs} or null (render as plain text).
export function richRefs({ SITE, locale, seMode }) {
  const enOnly = locale.code === 'en' ? {} : { hreflang: 'en' };
  const se = seSite(locale);
  const seGa = (label) => ({ 'data-ga-event': 'surfenglish_promo', 'data-ga-label': label });
  return {
    '@home': { href: localePath(locale) },
    '@features': { href: `${localePath(locale)}#features` },
    '@faq': { href: `${localePath(locale)}#faq` },
    '@about': { href: '/about/', attrs: enOnly },
    // The extension page exists in en and zh-Hans (R1); other locales link to the English page.
    '@chrome': locale.code === 'zh-Hans' ? { href: '/zh-hans/chrome-extension/' } : { href: '/chrome-extension/', attrs: enOnly },
    '@support': { href: '/support.html', attrs: enOnly },
    '@privacy': { href: '/privacy.html', attrs: enOnly },
    '@support-mail': { href: `mailto:${SITE.supportEmail}` },
    '@appstore': { href: appStoreLink(SITE, SITE.appStoreId, 'cta'), attrs: { 'data-ga-label': 'faq' } },
    '@appstore-dev': { href: `https://apps.apple.com/developer/id${SITE.artistId}` },
    '@se-site': { href: se.href, attrs: { hreflang: se.hreflang, ...seGa('faq_site') } },
    '@se-appstore': seMode === 'no-card' ? null : { href: appStoreLink(SITE, SIBLING.appStoreId, 'about'), attrs: seGa('about_appstore') },
    '@se-maker': { href: `${SIBLING.siteOrigin}/about/#maker`, attrs: { hreflang: 'en', ...seGa('about_maker') } },
  };
}
