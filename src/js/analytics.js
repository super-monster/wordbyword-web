/* WordByWord GA4 event tracking (doc 06 §8.2). Ported from the legacy js/analytics.js; event names and
   parameters are kept for report continuity. Changes: Chrome Web Store detection (F9), language_switch with
   from/to locale (R38), faq_toggle, surfenglish_promo_view impressions (R3). Silent when gtag is absent. */
(function () {
  const TRACKED_SELECTOR = 'a, button, [role="button"], [data-ga-event]';
  const MAX_LABEL_LENGTH = 100;
  const APP_STORE_HOSTS = ['apps.apple.com', 'itunes.apple.com'];

  const send = (name, params) => { if (typeof window.gtag === 'function') window.gtag('event', name, params); };
  const pageLocale = () => document.documentElement.lang || '';

  function sanitizeEventName(name) {
    return String(name || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  }

  function compactText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL_LENGTH);
  }

  function getElementLabel(element) {
    const explicitLabel = element.getAttribute('data-ga-label');
    if (explicitLabel) return compactText(explicitLabel);
    const text = compactText(element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent);
    if (text) return text;
    const image = element.querySelector('img[alt]');
    return compactText(image ? image.getAttribute('alt') : '');
  }

  function getElementLocation(element) {
    if (element.closest('header')) return 'header';
    if (element.closest('footer')) return 'footer';
    const section = element.closest('section[id], aside[id]');
    return section && section.id ? section.id : 'body';
  }

  function parseLink(element) {
    const href = (element.getAttribute('href') || '').trim();
    const info = {
      href, url: '', domain: '', targetSection: '', type: element.tagName.toLowerCase(),
      isAppStore: false, isChromeStore: false, isEmail: href.toLowerCase().startsWith('mailto:'),
      isHashLink: href.startsWith('#'), isInternalLink: false, isOutbound: false,
    };
    if (!href) return info;
    try {
      const url = new URL(href, window.location.href);
      info.url = url.href;
      info.domain = url.hostname;
      info.targetSection = info.isHashLink ? href.slice(1) : url.hash.replace(/^#/, '');
      info.isAppStore = APP_STORE_HOSTS.includes(url.hostname);
      info.isChromeStore = url.hostname === 'chromewebstore.google.com'
        || (url.hostname === 'chrome.google.com' && url.pathname.startsWith('/webstore'));
      info.isInternalLink = url.origin === window.location.origin && !info.isHashLink;
      info.isOutbound = /^https?:$/.test(url.protocol) && url.origin !== window.location.origin;
    } catch (error) {
      info.url = href;
    }
    return info;
  }

  function resolveEventName(element, linkInfo, location) {
    const explicitEvent = sanitizeEventName(element.getAttribute('data-ga-event'));
    if (explicitEvent) return explicitEvent;
    if (linkInfo.isAppStore) return 'app_store_click';
    if (linkInfo.isChromeStore) return 'chrome_store_click';
    if (linkInfo.isEmail) return 'contact_email_click';
    if (location === 'header' || element.closest('nav')) return 'nav_click';
    if (location === 'footer') return 'footer_link_click';
    if (linkInfo.isHashLink && linkInfo.targetSection === 'cta') return 'cta_click';
    if (linkInfo.isHashLink) return 'section_anchor_click';
    if (linkInfo.isInternalLink) return 'internal_link_click';
    if (linkInfo.isOutbound) return 'outbound_link_click';
    if (element.tagName.toLowerCase() === 'button' || element.getAttribute('role') === 'button') return 'button_click';
    return 'site_click';
  }

  function buildEventParams(element, linkInfo, location, label, eventName) {
    const params = {
      event_category: 'site_interaction',
      event_label: label || linkInfo.href || location,
      link_text: label,
      link_url: linkInfo.url || linkInfo.href,
      link_domain: linkInfo.domain,
      link_type: linkInfo.type,
      page_path: window.location.pathname,
      page_title: document.title,
      page_locale: pageLocale(),
      element_location: location,
      target_section: linkInfo.targetSection,
      outbound: linkInfo.isOutbound ? 'true' : 'false',
      transport_type: 'beacon',
    };
    if (eventName === 'language_switch') { // R38
      params.from_locale = pageLocale();
      params.to_locale = element.getAttribute('hreflang') || '';
    }
    Object.keys(params).forEach((key) => { if (params[key] === '') delete params[key]; });
    return params;
  }

  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest(TRACKED_SELECTOR);
    if (!element) return;
    const location = getElementLocation(element);
    const linkInfo = parseLink(element);
    const eventName = resolveEventName(element, linkInfo, location);
    if (eventName === 'language_switch' && element.getAttribute('aria-current') === 'page') return; // current language
    send(eventName, buildEventParams(element, linkInfo, location, getElementLabel(element), eventName));
  }, true);

  // FAQ open/close (doc 06 §8.2): <details data-faq-id> toggles do not bubble, so listen in the capture phase.
  document.addEventListener('toggle', function (event) {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.dataset.faqId || !details.open) return;
    send('faq_toggle', { event_category: 'site_interaction', event_label: details.dataset.faqId, page_locale: pageLocale(), element_location: 'faq' });
  }, true);

  // SurfEnglish card impression (R3): fire once per page when ≥50% of a [data-ga-view] element is visible.
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver(function (entries) {
      for (const entry of entries) {
        const el = entry.target;
        if (!entry.isIntersecting || seen.has(el)) continue;
        seen.add(el);
        io.unobserve(el);
        send(sanitizeEventName(el.getAttribute('data-ga-view')), {
          event_category: 'site_interaction', event_label: el.getAttribute('data-ga-label') || '',
          page_locale: pageLocale(), element_location: el.id || 'body',
        });
      }
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-ga-view]').forEach((el) => io.observe(el));
  }
})();
