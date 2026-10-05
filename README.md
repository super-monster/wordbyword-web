# wordbyword-web

Official website for **WordByWord** — https://www.word-by-word.app

Zero-dependency static generator (Node ≥ 22): `node build.mjs` renders `src/` into `dist/`, which is deployed by
Cloudflare Pages. The redesign plan and all design decisions live on the orphan branch
[`design-docs`](https://github.com/super-monster/wordbyword-web/tree/design-docs) (`docs/redesign-2026/00-README.md`).

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Development. Every push builds a Cloudflare Pages preview. |
| `cloudflare-deploy` | Production. Release with `git push origin main:cloudflare-deploy`. |
| `legacy-pages` | Frozen legacy site (= `7a389ba`), still served by GitHub Pages until the DNS cutover. Read-only. |
| `design-docs` | Design documents only (not built, never merged). |

## Develop

```bash
npm run build        # → dist/  (fails on any build-gate error: L-1…L-14 on the copy, D-1…D-24 on dist/)
npm run serve        # build + local Cloudflare Pages emulator on :4580
npm run check        # build with the pseudo-locale scan, then re-check dist/
npm test             # validator tests: a broken sample per rule
npm run check:keys   # missing / extra copy keys per locale
npm run images       # regenerate assets/img from the manifest (macOS: sips + Chrome decode check)
npm run og           # re-render the OG cards after changing their copy (macOS + Chrome; the build fails until you do)
npm run verify -- https://main.wordbyword-web.pages.dev --preview   # acceptance of a deployment
```

## Layout

```
build.mjs                 generator entry (routes → templates → SEO artifacts → gates)
src/site.mjs              SITE / LOCALES / PAGES / CONTRACTS / ALIASES
src/lib/                  html, seo (_redirects, _headers, sitemap, hreflang), validate*, assets …
src/locales/              copy per locale (en, ja, zh-Hans published; the rest arrive in M3)
src/data/                 product facts, SurfEnglish config, claims-lint, keyword map, glossaries
src/templates/            page templates (pure functions)
src/legal/                privacy / support / extension privacy bodies (first line: <!-- updated: YYYY-MM-DD -->)
scripts/fixtures/         _redirects fixture (single source of truth) and request-level cases
scripts/                  serve (CF emulator), verify-deploy, contract-test, spike-check, images, indexnow, check
assets/img/               generated images + images.json registry (fingerprinted into /assets/ at build time)
public/                   copied to dist/ as-is (no _headers/_redirects here — they are generated)
```

Contract URLs that must keep working: `/privacy.html`, `/support.html`, `/chrome-extension/privacy.html`
(hard-coded in the iOS app and App Store Connect).
