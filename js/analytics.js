(function () {
  const TRACKED_SELECTOR = 'a, button, [role="button"], [data-ga-event]';
  const MAX_LABEL_LENGTH = 100;
  const STORE_DOMAINS = {
    appStore: ['apps.apple.com', 'itunes.apple.com'],
    chromeStore: ['chrome.google.com', 'chromewebstore.google.com'],
  };

  function sanitizeEventName(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
  }

  function compactText(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_LABEL_LENGTH);
  }

  function getElementLabel(element) {
    const explicitLabel = element.getAttribute('data-ga-label');
    if (explicitLabel) {
      return compactText(explicitLabel);
    }

    const ariaLabel = element.getAttribute('aria-label');
    const title = element.getAttribute('title');
    const text = compactText(ariaLabel || title || element.textContent);
    if (text) {
      return text;
    }

    const image = element.querySelector('img[alt]');
    return compactText(image ? image.getAttribute('alt') : '');
  }

  function getElementLocation(element) {
    if (element.closest('header')) {
      return 'header';
    }

    if (element.closest('footer')) {
      return 'footer';
    }

    const section = element.closest('section[id]');
    if (section && section.id) {
      return section.id;
    }

    return 'body';
  }

  function parseLink(element) {
    const href = element.getAttribute('href') || '';
    const trimmedHref = href.trim();
    const info = {
      href: trimmedHref,
      url: '',
      domain: '',
      targetSection: '',
      type: element.tagName.toLowerCase(),
      isAppStore: false,
      isChromeStore: false,
      isEmail: trimmedHref.toLowerCase().startsWith('mailto:'),
      isHashLink: trimmedHref.startsWith('#'),
      isInternalLink: false,
      isOutbound: false,
    };

    if (!trimmedHref) {
      return info;
    }

    try {
      const url = new URL(trimmedHref, window.location.href);
      info.url = url.href;
      info.domain = url.hostname;
      info.targetSection = info.isHashLink ? trimmedHref.slice(1) : url.hash.replace(/^#/, '');
      info.isAppStore = STORE_DOMAINS.appStore.includes(url.hostname);
      info.isChromeStore =
        STORE_DOMAINS.chromeStore.includes(url.hostname) && url.pathname.includes('webstore');
      info.isInternalLink = url.origin === window.location.origin && !info.isHashLink;
      info.isOutbound = /^https?:$/.test(url.protocol) && url.origin !== window.location.origin;
    } catch (error) {
      info.url = trimmedHref;
    }

    return info;
  }

  function resolveEventName(element, linkInfo, location) {
    const explicitEvent = sanitizeEventName(element.getAttribute('data-ga-event'));
    if (explicitEvent) {
      return explicitEvent;
    }

    if (linkInfo.isAppStore) {
      return 'app_store_click';
    }

    if (linkInfo.isChromeStore) {
      return 'chrome_store_click';
    }

    if (linkInfo.isEmail) {
      return 'contact_email_click';
    }

    if (location === 'header' || element.closest('nav')) {
      return 'nav_click';
    }

    if (location === 'footer') {
      return 'footer_link_click';
    }

    if (linkInfo.isHashLink && linkInfo.targetSection === 'cta') {
      return 'cta_click';
    }

    if (linkInfo.isHashLink) {
      return 'section_anchor_click';
    }

    if (linkInfo.isInternalLink) {
      return 'internal_link_click';
    }

    if (linkInfo.isOutbound) {
      return 'outbound_link_click';
    }

    if (element.tagName.toLowerCase() === 'button' || element.getAttribute('role') === 'button') {
      return 'button_click';
    }

    return 'site_click';
  }

  function buildEventParams(element, linkInfo, location, label) {
    const params = {
      event_category: 'site_interaction',
      event_label: label || linkInfo.href || location,
      link_text: label,
      link_url: linkInfo.url || linkInfo.href,
      link_domain: linkInfo.domain,
      link_type: linkInfo.type,
      page_path: window.location.pathname,
      page_title: document.title,
      page_locale: document.documentElement.lang || '',
      element_location: location,
      target_section: linkInfo.targetSection,
      outbound: linkInfo.isOutbound ? 'true' : 'false',
      transport_type: 'beacon',
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    return params;
  }

  function sendClickEvent(element) {
    if (typeof window.gtag !== 'function') {
      return;
    }

    const location = getElementLocation(element);
    const linkInfo = parseLink(element);
    const label = getElementLabel(element);
    const eventName = resolveEventName(element, linkInfo, location);
    const params = buildEventParams(element, linkInfo, location, label);

    window.gtag('event', eventName, params);
  }

  document.addEventListener(
    'click',
    function (event) {
      if (!(event.target instanceof Element)) {
        return;
      }

      const trackedElement = event.target.closest(TRACKED_SELECTOR);
      if (!trackedElement) {
        return;
      }

      sendClickEvent(trackedElement);
    },
    true
  );
})();
