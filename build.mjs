// WordByWord website generator — zero dependencies, Node ≥ 22 (CF Pages: `node build.mjs`, output `dist/`).
// Spec: design doc 06 (branch design-docs) §3.4: validate config + copy → render → SEO artifacts → validate dist.
//
//   node build.mjs              build dist/ and run every build gate (exit 1 on any error)
//   node build.mjs --pseudo     also render all routes with a pseudo locale and scan for hard-coded strings (D-15 b)
//   node build.mjs --out DIR    write the site to DIR instead of dist/ (tests)

import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readdirSync, statSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { buildRedirects, buildHeaders, buildSitemap, buildLegacySitemap, buildRobots, alternatesFor, gitInfo, deepenClone } from './src/lib/seo.mjs';
import { fill, placeholderVars } from './src/lib/html.mjs';
import { emitAssets } from './src/lib/assets.mjs';
import { loadConfig, loadStrings, expandRoutes, publicView, modeOf } from './src/lib/context.mjs';
import { entryVariants, registryEntries, resolveRegistryPath } from './src/lib/image-registry.mjs';
import { validateConfig, validateLocales, validateDist } from './src/lib/validate.mjs';
import { readOgRegistry, ogKey } from './src/lib/validate-dist.mjs';
import { pseudoStrings, pseudoNotice, scanPseudoDist, wrap } from './src/lib/pseudo.mjs';
import { home, imageSet } from './src/templates/home.mjs';
import { about } from './src/templates/about.mjs';
import { chromeExtension } from './src/templates/chrome-extension.mjs';
import { legal } from './src/templates/legal.mjs';
import { notfound } from './src/templates/notfound.mjs';

const t0 = performance.now();
const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argValue = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1); };
const PSEUDO = args.includes('--pseudo');
const DIST = argValue('--out') ? resolve(argValue('--out')) : join(ROOT, 'dist');
const CACHE = join(ROOT, '.cache');
const TEMPLATES = { home, about, chromeExtension, legal, notfound };

// ———————————————————————————— issues ————————————————————————————

const issues = { error: [], warn: [] };
const warn = (id, msg) => issues.warn.push(`${id} ${msg}`);

// ———————————————————————————— helpers ————————————————————————————

const write = (file, data) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, data); };

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  for (const name of readdirSync(src)) {
    if (name.startsWith('.')) continue; // skip dotfiles (.DS_Store etc., D-19)
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
// null while assets/img/images.json is missing (placeholders; D-21 warns once) or when the key is not registered
// (D-6 turns the rendered placeholder into an error).
function imageResolver(assets) {
  const entries = assets.registry ? new Map(registryEntries(assets.registry)) : null;
  const cache = new Map();
  return (key) => {
    if (!entries) return null;
    if (cache.has(key)) return cache.get(key);
    const entry = entries.get(key);
    let res = null;
    if (entry) {
      const variants = entryVariants(entry)
        .map((v) => ({ ...v, rel: resolveRegistryPath(ROOT, v.path) }))
        .filter((v) => existsSync(join(ROOT, v.rel)))             // a missing file is a D-21 error, not a crash
        .map((v) => ({ ...v, url: assets.publish(v.rel) }));
      const avif = variants.filter((v) => v.format === 'avif').sort((a, b) => a.w - b.w);
      const fallbacks = variants.filter((v) => v.format !== 'avif').sort((a, b) => b.w - a.w);
      const fallback = fallbacks.find((v) => v.w === entry.fallbackWidth) ?? fallbacks[0] ?? avif[avif.length - 1];
      if (fallback) res = { avif, fallback, meta: entry, variant: (w, fmt) => variants.find((v) => v.w === w && v.format === fmt)?.url ?? null };
    }
    cache.set(key, res);
    return res;
  };
}

// Official Apple badge (doc 06 §3.5 / §7.4): assets/badges/<badge>.svg → fingerprinted URL, displayed 48 px high in
// all three places (doc 05 §7.x), width from the viewBox. null while a file is missing (the template draws a badge).
function badgeResolver(assets) {
  const cache = new Map();
  return (badge) => {
    if (cache.has(badge)) return cache.get(badge);
    const rel = `assets/badges/${badge}.svg`;
    let res = null;
    if (existsSync(join(ROOT, rel))) {
      const vb = readFileSync(join(ROOT, rel), 'utf8').match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
      res = { url: assets.publish(rel), w: vb ? Math.round((48 * Number(vb[1])) / Number(vb[2])) : 144, h: 48 };
    }
    cache.set(badge, res);
    return res;
  };
}

// OG image for a route (doc 06 §7.4): assets/og/og.json entry "<page>-<locale>" → fingerprinted URL. null until
// `npm run og` has produced the image (D-23 warns once while og.json is missing).
function ogResolver(assets) {
  let og = null;
  try { og = readOgRegistry(ROOT); } catch { og = null; } // D-23 reports a broken og.json
  return (route) => {
    const key = ogKey(route.page.id, route.locale.code);
    const entry = og?.images?.[key];
    if (!entry) return null;
    const rel = resolveRegistryPath(ROOT, entry.file ?? `assets/og/${key}.jpg`);
    if (!existsSync(join(ROOT, rel))) return null;
    return { url: assets.publish(rel), w: entry.width ?? 1200, h: entry.height ?? 630 };
  };
}

// ———————————————————————————— config, copy, validation of inputs ————————————————————————————

const cfg = loadConfig(ROOT);
const { SITE, LOCALES } = cfg;
const { strings } = loadStrings(cfg);
validateConfig(cfg, issues);
validateLocales(cfg, strings, issues);

const { product, notice } = cfg;
const year = new Date().getUTCFullYear();
const absUrl = (p) => SITE.url + p;
const routes = expandRoutes(cfg);
const publishedLocales = LOCALES.filter((l) => l.publish);
const deepened = process.env.CF_PAGES === '1' ? deepenClone() : null; // Cloudflare clones with depth 1
if (deepened === false) warn('D-3', 'git fetch --unshallow failed on Cloudflare: the clone stays shallow');
const git = gitInfo();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
copyDir(join(ROOT, 'public'), DIST); // public/ first; generated artifacts are written last (ENG-16)

if (git.shallow) warn('D-3', 'shallow git clone: <lastmod> omitted from sitemap.xml (doc 06 §3.6.1)');
const lastmodFor = (r) => {
  if (git.shallow || !git.available) return null;
  const sources = r.page.sources(r.locale).filter((p) => existsSync(join(ROOT, p)));
  return git.lastDate(sources);
};

const assetIssues = { error: [], warn: [] };
const assets = emitAssets(ROOT, DIST, assetIssues);
issues.error.push(...assetIssues.error);
issues.warn.push(...assetIssues.warn.filter((w) => !/images\.json missing/.test(w))); // D-21 reports it once
const img = imageResolver(assets);
const badgeUrl = badgeResolver(assets);
const ogFor = ogResolver(assets);

// ———————————————————————————— render ————————————————————————————

function renderAll(outDir, { copy, noticeData, pseudo = false }) {
  let n = 0;
  for (const route of routes) {
    const t = copy[route.locale.code];
    const updated = lastmodFor(route) ?? new Date().toISOString().slice(0, 10);
    const formatDate = (iso) => new Intl.DateTimeFormat(route.locale.code, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
    const dateLong = pseudo ? (iso) => wrap(formatDate(iso)) : formatDate; // dates are locale data, not hard-coded text
    const vars = placeholderVars({ product, SITE, locale: route.locale, year, extra: {
      appStoreName: t.meta?.appStoreName ?? SITE.name, appStoreSubtitle: t.meta?.appStoreSubtitle ?? '',
      releaseDate: formatDate(product.wbw.releaseDate), versionDate: formatDate(product.wbw.versionDate), updated: formatDate(updated),
    } });
    const ctx = {
      SITE, route, routes, absUrl, product, notice: noticeData, assets, img, badgeUrl,
      imgUrl: (key, w, fmt) => img(key)?.variant?.(w, fmt) ?? null,
      og: ogFor(route),
      t, enStrings: copy.en, strings: copy, // strings: every locale's copy (the 404's translated lines, doc 05 §6.7)
      f: (s, extra = {}) => fill(s, { ...vars, ...extra }, route.locale.code),
      dateLong, updated,
      locales: publishedLocales,
      alternates: alternatesFor(route, routes, absUrl),
      build: { head: git.head },
    };
    let html;
    try { html = TEMPLATES[route.page.template](ctx); } catch (e) {
      issues.error.push(`BUILD ${route.publicUrl} (${route.locale.code}): template "${route.page.template}" failed${pseudo ? ' in the pseudo-locale render' : ''}: ${e.message}`);
      continue;
    }
    write(join(outDir, route.outFile), html);
    n++;
  }
  return n;
}

renderAll(DIST, { copy: strings, noticeData: notice });

const redirects = buildRedirects({ SITE, LOCALES, CONTRACTS: cfg.CONTRACTS, ALIASES: cfg.ALIASES });
write(join(DIST, '_redirects'), redirects.text);
write(join(DIST, '_headers'), buildHeaders({ SITE }));

write(join(DIST, 'sitemap.xml'), buildSitemap(routes, {
  absUrl, lastmodFor,
  alternates: (r) => alternatesFor(r, routes, absUrl),
  // Home pages: the L1 screenshot (shot/<set>/swipe, its 540w JPEG fallback — the hero is HTML, ENG-15) and the OG
  // image, at the fingerprinted URLs the page and og:image use (doc 02 §6.7, doc 06 §3.6.1; R9). Other pages: none.
  imagesFor: (r) => (r.page.id === 'home'
    ? [img(`shot/${imageSet(r.locale)}/swipe`)?.fallback.url, ogFor(r)?.url].filter(Boolean).map(absUrl) : []),
}));
write(join(DIST, 'robots.txt'), buildRobots({ SITE }));
if (SITE.legacySitemap) write(join(DIST, 'sitemap-legacy.xml'), buildLegacySitemap(redirects.rules, { absUrl }));
if (SITE.indexNowKey) write(join(DIST, `${SITE.indexNowKey}.txt`), SITE.indexNowKey); // IndexNow key file (doc 03 §6.3)

// Preview-only build stamp (not emitted on the production branch): used by the M1-03 spike.
const branch = process.env.CF_PAGES_BRANCH;
if (branch && branch !== 'cloudflare-deploy') {
  write(join(DIST, '__build.json'), JSON.stringify({
    node: process.version, branch, commit: process.env.CF_PAGES_COMMIT_SHA ?? git.head,
    gitShallow: git.shallow, gitCommits: git.commits, builtAt: new Date().toISOString(),
  }, null, 2) + '\n');
}

write(join(CACHE, 'routes.json'), JSON.stringify(routes.map(publicView), null, 2) + '\n');
write(join(CACHE, 'redirects.json'), JSON.stringify(redirects.rules, null, 2) + '\n');
write(join(CACHE, 'contracts.json'), JSON.stringify(cfg.CONTRACTS.map((c) => ({ ...c, mode: modeOf(SITE, c.id), source: undefined })), null, 2) + '\n');

// ———————————————————————————— build gates on the output (doc 06 §3.7 D-1…D-24) ————————————————————————————

validateDist(DIST, { cfg, routes, strings }, issues);

let pseudoPages = 0;
if (PSEUDO) {
  const dir = mkdtempSync(join(tmpdir(), 'wbw-pseudo-')); // private dir: concurrent builds cannot clobber each other
  renderAll(dir, { copy: pseudoStrings(strings), noticeData: pseudoNotice(notice), pseudo: true });
  pseudoPages = scanPseudoDist(dir, { cfg, routes, strings }, issues);
  rmSync(dir, { recursive: true, force: true });
}

// ———————————————————————————— report ————————————————————————————

for (const w of issues.warn) console.warn(`warn   ${w}`);
for (const e of issues.error) console.error(`error  ${e}`);
const files = walk(DIST).length;
const where = relative(ROOT, DIST) || DIST;
console.log(`${issues.error.length ? '✗' : '✓'} ${routes.length} pages, ${files} files, _redirects ${redirects.static}/${redirects.dynamic}${PSEUDO ? `, pseudo-locale scan ${pseudoPages} pages` : ''} → ${where}/ — ${issues.error.length} errors, ${issues.warn.length} warnings in ${Math.round(performance.now() - t0)} ms (node ${process.version})`);
process.exit(issues.error.length ? 1 : 0);
