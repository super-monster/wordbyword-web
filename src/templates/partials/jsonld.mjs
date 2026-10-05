// JSON-LD @graph (doc 06 §5.1.3, doc 03 §5). No FAQPage (R5). Person shared with SurfEnglish by @id (R17).
// Nodes that share an @id across locales carry identical, language-neutral (English) content.

import { plain } from '../../lib/html.mjs';

export function jsonld(ctx) {
  const { SITE, route, routes, absUrl, product, enStrings } = ctx;
  const page = route.page.id;
  const l = route.locale;
  const pageUrl = absUrl(route.publicUrl);
  const appStore = `https://apps.apple.com/app/id${SITE.appStoreId}`;
  const published = routes.filter((r) => r.page.id === 'home').map((r) => r.locale.hreflang);

  const person = {
    '@type': 'Person', '@id': SITE.makerId, name: SITE.makerName, alternateName: SITE.makerAltName,
    url: SITE.makerUrl, sameAs: SITE.makerSameAs,
  };
  const website = {
    '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name,
    alternateName: ['WordByWord Translate', 'Word by Word'], inLanguage: published, publisher: { '@id': SITE.makerId },
  };
  const shot = ctx.imgUrl?.(`shot/en/swipe`, 540, 'jpg');
  const app = {
    '@type': 'MobileApplication', '@id': `${SITE.url}/#app`, name: SITE.name,
    alternateName: ['WordByWord Translate', 'WordByWord翻譯', 'WordByWord Переводчик', 'Word by Word'],
    description: plain(`${enStrings.hero.lede} ${enStrings.hero.how}`),
    url: `${SITE.url}/`,
    operatingSystem: 'iOS 18.0 or later, iPadOS 18.0 or later',
    applicationCategory: SITE.applicationCategory,
    softwareVersion: product.wbw.version, datePublished: product.wbw.releaseDate,
    image: `${SITE.url}/icons/icon-512.png`,
    ...(shot ? { screenshot: [absUrl(shot)] } : {}),
    featureList: enStrings.features.map((f) => plain(f.title)),
    inLanguage: published, isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', url: appStore,
      description: 'Free download with daily free limits; optional WordByWord Plus monthly subscription' },
    downloadUrl: appStore, installUrl: appStore, sameAs: [appStore],
    creator: { '@id': SITE.makerId }, publisher: { '@id': SITE.makerId },
  };

  const graph = [];
  if (page === 'home') {
    if (l.code === 'en') graph.push(website);
    graph.push({
      '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl,
      name: plain(ctx.t.meta.title), description: plain(ctx.f(ctx.t.meta.description)), inLanguage: l.hreflang,
      isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': `${SITE.url}/#app` }, mainEntity: { '@id': `${SITE.url}/#app` },
      ...(ctx.og ? { primaryImageOfPage: absUrl(ctx.og.url) } : {}),
    });
    graph.push({ ...app, mainEntityOfPage: l.code === 'en' ? { '@id': `${pageUrl}#webpage` } : undefined });
  } else if (page === 'about') {
    graph.push({
      '@type': 'AboutPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: plain(ctx.t.about.meta.title),
      description: plain(ctx.f(ctx.t.about.meta.description)), inLanguage: 'en',
      isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': `${SITE.url}/#app` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    });
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: plain(ctx.t.about.h1), item: pageUrl },
      ],
    });
    graph.push(app);
  } else if (page === 'chrome-extension') {
    const live = Boolean(SITE.chromeStoreUrl);
    graph.push({
      '@type': 'SoftwareApplication', '@id': `${SITE.url}/chrome-extension/#app`, name: 'WordByWord Translate',
      applicationCategory: 'BrowserApplication', operatingSystem: 'Google Chrome, Microsoft Edge',
      softwareVersion: product.ext.version, isAccessibleForFree: true,
      ...(live ? { installUrl: SITE.chromeStoreUrl, url: SITE.chromeStoreUrl } : {}),
      creator: { '@id': SITE.makerId },
    });
  } else {
    return ''; // legal pages and 404: no JSON-LD
  }
  graph.push(person);
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
