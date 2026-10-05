// Page shell. M1 skeleton: SEO-correct <head> (robots/canonical/hreflang/lang) with placeholder body styling.
// The full layout (GA, OG, JSON-LD, header, footer, language switcher) lands in M1-08 (doc 06 §5.1).

import { esc, attrs, html } from '../lib/html.mjs';

export function layout(ctx, { title, description = '', body }) {
  const { route, SITE } = ctx;
  const l = route.locale;
  const robots = route.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow';
  return html`<!doctype html>
<html${attrs({ lang: l.hreflang, dir: l.dir, 'data-script': l.script })}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}<meta name="robots" content="${robots}">
${route.indexable ? `<link rel="canonical" href="${esc(ctx.absUrl(route.publicUrl))}">\n` : ''}${ctx.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}">\n`)}<meta http-equiv="content-language" content="${l.contentLanguage}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${SITE.themeColor.light}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${SITE.themeColor.dark}">
<link rel="icon" href="/favicon.ico" sizes="any">
<style>body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;max-width:46rem;margin:3rem auto;padding:0 1rem;color:#1b1714;background:#FBF8F3}a{color:#B32847}@media (prefers-color-scheme:dark){body{color:#efe9e1;background:#121010}a{color:#ff8fa8}}</style>
</head>
<body data-page="${esc(route.page.id)}">
${body}
</body>
</html>
`;
}
