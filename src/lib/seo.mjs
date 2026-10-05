// SEO & hosting artifacts: _redirects, _headers, sitemap.xml, robots.txt, hreflang clusters.
// Spec: doc 06 §3.6, doc 02 §5.2 (the _redirects fixture is the single source of truth, R54).

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// ———————————————————————————— _redirects (doc 02 §5.2, R54) ————————————————————————————

export function buildRedirects({ SITE, LOCALES, CONTRACTS, ALIASES }) {
  const st = [], sp = []; // static block / splat block (splats always last, doc 02 §5.3-2)
  const add = (seg, id, from, to, code) => seg.push({ id, from, to, code });
  const F = SITE.redirectFlags;
  const mode = (c) => (typeof SITE.contractMode === 'string' ? SITE.contractMode : SITE.contractMode[c.id] ?? 'proxy');
  const byCode = (code) => LOCALES.find((l) => l.code === code);
  const home = (l) => (l.path ? `/${l.path}/` : '/');
  const dest = (l, splat = false) => (l.publish
    ? { to: home(l) + (splat ? ':splat' : ''), code: 301 } : { to: '/', code: 302 });

  // A: contract 200 rewrites first (first match wins); C-2 contracts follow doc 02 §5.2.3
  CONTRACTS.forEach((c, i) => { if (mode(c) === 'proxy') add(st, `A${i + 1}`, c.public, c.internal, 200); });
  CONTRACTS.forEach((c, i) => {
    if (mode(c) === 'proxy') {
      add(st, `A${4 + 2 * i}`, c.bare, c.public, 301);
      add(st, `A${5 + 2 * i}`, c.bareSlash, c.public, 301);
    } else add(st, `A${5 + 2 * i}'`, c.bareSlash, c.bare, 301); // C-2: /x.html → /x is CF's automatic 308
  });
  if (F.experimentL) CONTRACTS.forEach((c, i) => { if (mode(c) === 'proxy') add(st, `L${i + 1}`, c.internal, c.public, 301); });
  // B: English home duplicates
  if (F.indexHtmlRule) { add(st, 'B1', '/index.html', '/', 301); add(st, 'B2', '/index', '/', 301); }
  add(st, 'B3', '/en-top.html', '/', 301); add(st, 'B4', '/en-top', '/', 301);
  // C: legacy flat language pages (.html and extensionless)
  let n = 0;
  for (const l of LOCALES) if (l.code !== 'en') for (const old of l.legacy) {
    const { to, code } = dest(l);
    add(st, `C${String(++n).padStart(2, '0')}`, `/${old}-top.html`, to, code);
    add(st, `C${String(++n).padStart(2, '0')}`, `/${old}-top`, to, code);
  }
  // D: aliases (static /x and /x/ first; splat /x/* last)
  let d = 0;
  for (const a of ALIASES) {
    const { to, code } = dest(byCode(a.to));
    add(st, `D${String(++d).padStart(2, '0')}`, `/${a.from}`, to, code);
    add(st, `D${String(++d).padStart(2, '0')}`, `/${a.from}/`, to, code);
  }
  // X (experiment C, static): locales whose hreflang differs from the path
  const cased = LOCALES.filter((l) => l.publish && l.path && l.hreflang !== l.path);
  if (F.experimentC) cased.forEach((l, i) => {
    add(st, `X${2 * i + 1}`, `/${l.hreflang}`, home(l), 301);
    add(st, `X${2 * i + 2}`, `/${l.hreflang}/`, home(l), 301);
  });
  for (const a of ALIASES) {
    const { to, code } = dest(byCode(a.to), true);
    add(sp, `D${String(++d).padStart(2, '0')}`, `/${a.from}/*`, to, code);
  }
  if (F.experimentC) cased.forEach((l, i) => add(sp, `X${2 * cased.length + i + 1}`, `/${l.hreflang}/*`, `${home(l)}:splat`, 301));

  const rules = [...st, ...sp];
  return {
    rules, static: st.length, dynamic: sp.length,
    text: rules.map((r) => `${r.from}  ${r.to}  ${r.code}`).join('\n') + '\n',
  };
}

// Parse scripts/fixtures/redirects.default.txt → [{id, from, to, code}]
export function readRedirectFixture(file) {
  return readFileSync(file, 'utf8').split('\n')
    .filter((l) => l.trim() && !l.trimStart().startsWith('#'))
    .map((l) => { const [id, from, to, code] = l.trim().split(/\s+/); return { id, from, to, code: Number(code) }; });
}

// ———————————————————————————— _headers (doc 06 §3.6.4) ————————————————————————————

export function buildHeaders({ SITE }) {
  return [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()',
    '  Strict-Transport-Security: max-age=31536000',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/icons/*',
    '  Cache-Control: public, max-age=604800',
    '',
    '/favicon.ico',
    '  Cache-Control: public, max-age=604800',
    '',
    `https://${SITE.pagesProject}.pages.dev/*`,
    '  X-Robots-Tag: noindex',
    '',
    `https://:version.${SITE.pagesProject}.pages.dev/*`,
    '  X-Robots-Tag: noindex',
    '',
  ].join('\n');
}

// ———————————————————————————— hreflang clusters (doc 02 §6.1) ————————————————————————————

// Cluster members = indexable routes of the same page id. ≥2 members → every member lists all members
// (+ extra codes such as pt, R53) and x-default (when an en member exists). 1 member → no hreflang.
export function alternatesFor(route, routes, absUrl) {
  const members = routes.filter((r) => r.page.id === route.page.id && r.indexable);
  if (members.length < 2 || !route.indexable) return [];
  const out = [];
  for (const m of members) {
    out.push({ hreflang: m.locale.hreflang, href: absUrl(m.publicUrl) });
    for (const extra of m.locale.hreflangExtra ?? []) out.push({ hreflang: extra, href: absUrl(m.publicUrl) });
  }
  const en = members.find((m) => m.locale.code === 'en');
  if (en) out.push({ hreflang: 'x-default', href: absUrl(en.publicUrl) });
  return out;
}

// ———————————————————————————— lastmod & sitemap (doc 06 §3.6.1) ————————————————————————————

export function gitInfo() {
  const run = (args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
  const shallow = run(['rev-parse', '--is-shallow-repository']);
  return {
    available: shallow !== null,
    shallow: shallow === 'true',
    commits: run(['rev-list', '--count', 'HEAD']),
    head: run(['rev-parse', '--short', 'HEAD']),
    dirty: (run(['status', '--porcelain']) ?? '') !== '',
    lastDate: (paths) => run(['log', '-1', '--format=%cs', '--', ...paths]) || null,
  };
}

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSitemap(routes, { absUrl, lastmodFor, alternates, imagesFor }) {
  const entries = routes.filter((r) => r.indexable && r.page.sitemap !== false).map((r) => {
    const lines = [`  <url>`, `    <loc>${xmlEsc(absUrl(r.publicUrl))}</loc>`];
    const lm = lastmodFor(r);
    if (lm) lines.push(`    <lastmod>${lm}</lastmod>`);
    for (const a of alternates(r)) lines.push(`    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEsc(a.href)}"/>`);
    for (const img of imagesFor(r)) lines.push(`    <image:image><image:loc>${xmlEsc(img)}</image:loc></image:image>`);
    lines.push('  </url>');
    return lines.join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobots({ SITE }) {
  return ['User-agent: *', 'Allow: /', ...SITE.robots.extra, '', `Sitemap: ${SITE.url}/sitemap.xml`, ''].join('\n');
}
