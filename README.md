# wordbyword-web

Static marketing site for WordByWord — https://www.word-by-word.app (GitHub Pages, `main` branch, custom domain via `CNAME`).

- `index.html` + `<lang>-top.html` — localized landing pages (plain HTML, shared `css/style.css`)
- `privacy.html`, `support.html` — App Store pages
- `chrome-extension/` — Chrome extension landing page
- `js/analytics.js` — GA4 click tracking (auto-tags App Store / outbound links; honours `data-ga-event` / `data-ga-label`)
- `js/site-notice.js` — emergency service-status banner (off by default; `config.enabled`)

## SurfEnglish cross-promotion

`js/surfenglish-promo.js` + `css/surfenglish-promo.css` + `img/surfenglish/` promote the
SurfEnglish iOS app (https://surfenglish.app · App Store id6787367021) on every page:

1. a dismissible announcement bar pinned above the site header (dismissal is remembered for
   `CONFIG.dismissDays`, default 7 days), and
2. a promo section (icon, headline, 3 screenshots, localized App Store badge, link to the
   localized surfenglish.app page) inserted right after `#hero` on the landing pages.

Copy for all 20 site languages lives in the `I18N` table of the script; the locale is picked
from the page filename (`ja-top.html` → `ja`) or `<html lang>`. Tuning knobs at the top of the
script: `enabled`, `showBar`, `showSection`, `sectionAfter`, `dismissDays`, `appStoreUrl`,
`siteUrl`, `utm`. Clicks are reported to GA as `surfenglish_promo` with labels
`bar_app_store`, `bar_site`, `bar_dismiss`, `section_app_store`, `section_site`.

Every page includes the module with two lines in `<head>`:

```html
<link rel="stylesheet" href="css/surfenglish-promo.css" />
<script src="js/surfenglish-promo.js" defer></script>
```

## Preview locally

```bash
python3 -m http.server 8000
```
