// WordByWord website generator — zero dependencies, Node ≥ 22 (CF Pages: `node build.mjs`, output `dist/`).
// Spec: design doc 06 (branch design-docs). M1 skeleton: routes, SEO artifacts and the core build gates.

import { mkdirSync, rmSync, writeFileSync, readdirSync, statSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';

import { SITE, LOCALES, PAGES, CONTRACTS, ALIASES, contractModeOf } from './src/site.mjs';
import { buildRedirects, readRedirectFixture, buildHeaders, buildSitemap, buildRobots, alternatesFor, gitInfo } from './src/lib/seo.mjs';
import { fill, placeholderVars } from './src/lib/html.mjs';
import { emitAssets } from './src/lib/assets.mjs';
import { home } from './src/templates/home.mjs';
import { about } from './src/templates/about.mjs';
import { chromeExtension } from './src/templates/chrome-extension.mjs';
import { legal } from './src/templates/legal.mjs';
import { notfound } from './src/templates/notfound.mjs';

const t0 = performance.now();
const ROOT = dirname(new URL(import.meta.url).pathname);
const DIST = join(ROOT, 'dist');
const CACHE = join(ROOT, '.cache');
const TEMPLATES = { home, about, chromeExtension, legal, notfound };

// ———————————————————————————— issues ————————————————————————————

const issues = { error: [], warn: [] };
const err = (id, msg) => issues.error.push(`${id}  ${msg}`);
const warn = (id, msg) => issues.warn.push(`${id}  ${msg}`);

// ———————————————————————————— helpers ————————————————————————————

const absUrl = (p) => SITE.url + p;
const write = (file, data) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, data); };

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  for (const name of readdirSync(src)) {
    if (name.startsWith('.')) continue; // skip dotfiles (.DS_Store etc.)
    const s = join(src, name), d = join(dest, name);
    if (statSync(s).isDirectory()) { mkdirSync(d, { recursive: true }); copyDir(s, d); } else copyFileSync(s, d);
  }
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

// Image registry resolver: key → { avif:[{url,w,h}], fallback:{url,w,h}, meta, variant(w, fmt) } (doc 06 §3.5, §7.3).
// Returns null when the registry or key is missing (placeholders during M1; D-21 turns this into an error in M2).
function imageResolver(assets) {
  const reg = assets.registry;
  const cache = new Map();
  return (key) => {
    if (!reg) return null;
    if (cache.has(key)) return cache.get(key);
    const entry = reg.images?.[key] ?? reg[key];
    if (!entry) { warn('IMG', `image key not in registry: ${key}`); cache.set(key, null); return null; }
    const variants = (entry.variants ?? []).map((v) => ({ ...v, url: assets.publish(v.path) }));
    const avif = variants.filter((v) => v.format === 'avif').sort((a, b) => a.w - b.w);
    const fallbacks = variants.filter((v) => v.format !== 'avif').sort((a, b) => b.w - a.w);
    const fallback = fallbacks.find((v) => v.w === entry.fallbackWidth) ?? fallbacks[0];
    const res = {
      avif, fallback, meta: entry,
      variant: (w, fmt) => variants.find((v) => v.w === w && v.format === fmt)?.url ?? null,
    };
    cache.set(key, res);
    return res;
  };
}

// ———————————————————————————— routes (doc 06 §3.4) ————————————————————————————

function expandRoutes() {
  const routes = [];
  for (const page of PAGES) {
    const locs = page.locales === '*' ? LOCALES.filter((l) => l.publish)
      : page.locales.map((c) => LOCALES.find((l) => l.code === c)).filter((l) => l && l.publish);
    for (const locale of locs) {
      let outFile, publicUrl;
      if (page.contract && contractModeOf(page.contract.id) === 'file') { // C-2: real file, CF strips .html
        outFile = page.contract.public.slice(1);
        publicUrl = page.contract.bare;
      } else if (page.file) {
        outFile = page.file;
        publicUrl = '/' + page.file;
      } else {
        const path = page.path(locale);
        outFile = path + 'index.html';
        publicUrl = page.publicUrl ?? '/' + path;
      }
      const indexable = typeof page.indexable === 'function' ? Boolean(page.indexable(locale)) : page.indexable;
      routes.push({ page, locale, outFile, publicUrl, indexable });
    }
  }
  return routes;
}

// ———————————————————————————— build ————————————————————————————

// SPIKE BRANCH ONLY (spike/unshallow): can the Cloudflare build image deepen its depth-1 clone? Never merge.
const __unshallow = (() => {
  if (!process.env.CF_PAGES) return { skipped: 'not a Cloudflare build' };
  const red = (s) => String(s ?? '').replace(/\/\/[^@/\s]+@/g, '//***@').slice(0, 600);
  const g = (a) => { try { return { ok: true, out: red(execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 90000 }).trim()) }; } catch (e) { return { ok: false, out: red(e.stderr || e.message) }; } };
  const d = { remoteHost: g(['remote', 'get-url', 'origin']), before: g(['rev-parse', '--is-shallow-repository']), countBefore: g(['rev-list', '--count', 'HEAD']) };
  const t = performance.now();
  d.fetch = g(['fetch', '--unshallow', '--quiet', 'origin']);
  d.fetchMs = Math.round(performance.now() - t);
  d.after = g(['rev-parse', '--is-shallow-repository']);
  d.countAfter = g(['rev-list', '--count', 'HEAD']);
  d.aboutDate = g(['log', '-1', '--format=%cs', '--', 'src/locales/en.json', 'src/templates/about.mjs']);
  return d;
})();
const git = gitInfo();

// Locale copy: a locale without src/locales/<code>.json is not published yet (doc 06 §4.4: no per-key fallback
// to English). Its legacy URLs temporarily 302 to / until the translation lands (doc 02 §5.2.3).
const strings = {};
for (const l of LOCALES) {
  const file = join(ROOT, `src/locales/${l.code}.json`);
  if (existsSync(file)) strings[l.code] = JSON.parse(readFileSync(file, 'utf8'));
  else if (l.publish) { l.publish = false; }
}
const unpublished = LOCALES.filter((l) => !l.publish).map((l) => l.code);
if (unpublished.length) warn('L-1', `not published yet (no copy): ${unpublished.join(' ')}`);
const product = JSON.parse(readFileSync(join(ROOT, 'src/data/product.json'), 'utf8'));
const notice = JSON.parse(readFileSync(join(ROOT, 'src/notice.json'), 'utf8'));
const year = new Date().getUTCFullYear();

const routes = expandRoutes();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
copyDir(join(ROOT, 'public'), DIST); // public/ first; generated artifacts are written last (ENG-16)
for (const f of ['_headers', '_redirects']) if (existsSync(join(ROOT, 'public', f))) err('D-14', `public/${f} must not exist (generated)`);

if (git.shallow) warn('SITEMAP', 'shallow git clone: <lastmod> omitted from sitemap.xml');
const lastmodFor = (r) => {
  if (git.shallow || !git.available) return null;
  const sources = r.page.sources(r.locale).filter((p) => existsSync(join(ROOT, p)));
  return git.lastDate(sources);
};
const assets = emitAssets(ROOT, DIST, issues);
const img = imageResolver(assets);
const publishedLocales = LOCALES.filter((l) => l.publish);

for (const route of routes) {
  const t = strings[route.locale.code];
  const updated = lastmodFor(route) ?? new Date().toISOString().slice(0, 10);
  const dateLong = (iso) => new Intl.DateTimeFormat(route.locale.code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  const vars = placeholderVars({ product, SITE, locale: route.locale, year, extra: {
    appStoreName: t.meta?.appStoreName ?? SITE.name, appStoreSubtitle: t.meta?.appStoreSubtitle ?? '',
    releaseDate: dateLong(product.wbw.releaseDate), versionDate: dateLong(product.wbw.versionDate), updated: dateLong(updated),
  } });
  const ctx = {
    SITE, route, routes, absUrl, product, notice, assets, img,
    imgUrl: (key, w, fmt) => img(key)?.variant?.(w, fmt) ?? null,
    og: null, // OG images land with the localized copy (R59, M3)
    t, enStrings: strings.en,
    f: (s, extra = {}) => fill(s, { ...vars, ...extra }, route.locale.code),
    dateLong, updated,
    locales: publishedLocales,
    alternates: alternatesFor(route, routes, absUrl),
    build: { head: git.head },
  };
  write(join(DIST, route.outFile), TEMPLATES[route.page.template](ctx));
}

const redirects = buildRedirects({ SITE, LOCALES, CONTRACTS, ALIASES });
write(join(DIST, '_redirects'), redirects.text);
write(join(DIST, '_headers'), buildHeaders({ SITE }));

write(join(DIST, 'sitemap.xml'), buildSitemap(routes, {
  absUrl, lastmodFor,
  alternates: (r) => alternatesFor(r, routes, absUrl),
  imagesFor: () => [], // images & OG land in M2 (doc 06 §3.6.1)
}));
write(join(DIST, 'robots.txt'), buildRobots({ SITE }));

// Preview-only build stamp (not emitted on the production branch): used by the M1-03 spike.
const branch = process.env.CF_PAGES_BRANCH;
if (branch && branch !== 'cloudflare-deploy') {
  write(join(DIST, '__build.json'), JSON.stringify({
    node: process.version, branch, commit: process.env.CF_PAGES_COMMIT_SHA ?? git.head,
    gitShallow: git.shallow, gitCommits: git.commits, builtAt: new Date().toISOString(),
  }, null, 2) + '\n');
}

const publicView = (r) => ({ page: r.page.id, locale: r.locale.code, outFile: r.outFile, publicUrl: r.publicUrl, indexable: r.indexable });
write(join(CACHE, 'routes.json'), JSON.stringify(routes.map(publicView), null, 2) + '\n');
write(join(CACHE, 'redirects.json'), JSON.stringify(redirects.rules, null, 2) + '\n');
write(join(CACHE, 'contracts.json'), JSON.stringify(CONTRACTS.map((c) => ({ ...c, mode: contractModeOf(c.id), source: undefined })), null, 2) + '\n');

// ———————————————————————————— core gates (subset of doc 06 §3.7) ————————————————————————————

// D-12(g): default flags must reproduce the doc 02 §5.2.2 fixture line by line.
const F = SITE.redirectFlags;
const defaults = SITE.contractMode === 'proxy' && F.indexHtmlRule && !F.experimentL && !F.experimentC && LOCALES.every((l) => l.publish);
if (defaults) {
  const fixture = readRedirectFixture(join(ROOT, 'scripts/fixtures/redirects.default.txt'));
  const got = redirects.rules;
  if (fixture.length !== got.length) err('D-12g', `rule count ${got.length} ≠ fixture ${fixture.length}`);
  fixture.forEach((f, i) => {
    const g = got[i];
    if (!g || g.id !== f.id || g.from !== f.from || g.to !== f.to || g.code !== f.code)
      err('D-12g', `line ${i + 1}: expected ${f.id} ${f.from} ${f.to} ${f.code}, got ${g ? `${g.id} ${g.from} ${g.to} ${g.code}` : 'nothing'}`);
  });
}
if (redirects.static > 2000 || redirects.dynamic > 100) err('D-12', `rule budget exceeded: ${redirects.static}/${redirects.dynamic}`);

// C-1: proxied contract files must not exist in dist (would trigger CF's automatic .html → 308).
for (const c of CONTRACTS) if (contractModeOf(c.id) === 'proxy' && existsSync(join(DIST, c.public)))
  err('D-12c', `${c.public} exists in dist while contract mode is proxy`);

// 404.html must exist at the root, otherwise CF serves the SPA fallback (doc 02 §5.5-5).
if (!existsSync(join(DIST, '404.html'))) err('D-14', 'dist/404.html missing');

// D-20: indexable ⇔ robots index ⇔ self canonical ⇔ in sitemap (R49).
const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
for (const r of routes) {
  const page = readFileSync(join(DIST, r.outFile), 'utf8');
  const robotsIndex = /<meta name="robots" content="index/.test(page);
  const canonical = page.match(/<link rel="canonical" href="([^"]+)">/)?.[1] ?? null;
  const inSitemap = sitemap.includes(`<loc>${absUrl(r.publicUrl)}</loc>`);
  const ok = r.indexable
    ? robotsIndex && canonical === absUrl(r.publicUrl) && inSitemap
    : !robotsIndex && !canonical && !inSitemap;
  if (!ok) err('D-20', `${r.publicUrl} indexable=${r.indexable} robots=${robotsIndex} canonical=${canonical} sitemap=${inSitemap}`);
}

// ———————————————————————————— report ————————————————————————————

for (const w of issues.warn) console.warn(`warn   ${w}`);
for (const e of issues.error) console.error(`error  ${e}`);
const files = walk(DIST).length;
console.log(`${issues.error.length ? '✗' : '✓'} ${routes.length} pages, ${files} files, _redirects ${redirects.static}/${redirects.dynamic} → ${relative(ROOT, DIST)}/ in ${Math.round(performance.now() - t0)} ms (node ${process.version})`);
writeFileSync(join(DIST, '__unshallow.json'), JSON.stringify(__unshallow, null, 2) + '\n'); // SPIKE
process.exit(issues.error.length ? 1 : 0);
