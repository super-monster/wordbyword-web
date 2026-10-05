// D-1 … D-24 — checks on the built site (doc 06 §3.7, doc 02 §5.5 / §6, doc 03 §3.8).
//
//   validateDist(dist, ctx, issues)   ctx = { cfg, routes?, strings }   (routes default to expandRoutes(cfg))
//
// Exported helpers are shared with validateConfig's D-12 self-test (checkRedirectRules, expectedRedirects, …) and with
// scripts/og.mjs (ogInputs / ogInputHash define the D-23 contract).
//
// Inputs that do not exist yet in this milestone produce ONE warning each and switch their checks off:
// assets/img/images.json (D-6 placeholders, D-7, D-21), public/icons/ (icon links, D-4), assets/badges/*.svg (official
// App Store badges, D-11), assets/og/og.json (D-23). Once an input exists the full rule applies.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { avifInfo, avifProblems } from './avif.mjs';
import { expandRoutes, modeOf } from './context.mjs';
import { parseHTML, elements, findAll, find, byTag, hasClass, closest, textOf, normSpace, idIndex } from './dom.mjs';
import { registryEntries, entryVariants, resolveRegistryPath } from './image-registry.mjs';
import { getPath } from './keypath.mjs';
import { err, warn, loadData, compileAll, makeVars, rendered } from './validate-util.mjs';

// ———————————————————————————— shared constants ————————————————————————————

const HOME_SECTION_IDS = ['hero', 'features', 'screenshots', 'languages', 'pricing', 'faq', 'cta']; // doc 02 §7.5
// Google-supported SoftwareApplication categories (D-9).
const APP_CATEGORIES = new Set(['GameApplication', 'SocialNetworkingApplication', 'TravelApplication', 'ShoppingApplication',
  'SportsApplication', 'LifestyleApplication', 'BusinessApplication', 'DesignApplication', 'DeveloperApplication', 'DriverApplication',
  'EducationalApplication', 'HealthApplication', 'FinanceApplication', 'SecurityApplication', 'BrowserApplication',
  'CommunicationApplication', 'DesktopEnhancementApplication', 'EntertainmentApplication', 'MultimediaApplication', 'HomeApplication',
  'UtilitiesApplication', 'ReferenceApplication']);
// App Store ct values by placement (doc 06 §8.3; R3, R55).
const WBW_CT = ['wbw-header', 'wbw-hero', 'wbw-pricing', 'wbw-cta', 'wbw-footer', 'wbw-about', 'wbw-ext', 'wbw-sab'];
const SE_CT = ['wbw-card', 'wbw-about'];
// Size budgets (doc 06 §6.3, D-18): bytes raw / gzip.
const BUDGET = { js: [10 * 1024, 4 * 1024], css: [50 * 1024, 12 * 1024], home: [80 * 1024, 20 * 1024] };
const IMG_BUDGET = { eager: 150 * 1024, page: 1200 * 1024 };   // D-7 (baseline §E)
const OG_SIZE = { w: 1200, h: 630 };
export const OG_PAGES = ['home', 'about', 'chrome-extension'];  // doc 06 §7.4 output list

// ———————————————————————————— files ————————————————————————————

export function listFiles(dir, base = dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, base));
    else out.push(p.slice(base.length + 1).split('\\').join('/'));
  }
  return out;
}

// Resolve a site path against a set of dist files with Cloudflare Pages semantics (doc 02 §5.5 (a), §5.3; F24):
// "/x/" → x/index.html; "/x" → x (asset) or x.html (pretty URL); "/x.html", "/x/index.html" and "/x" for a directory
// are served after an automatic 308, so they resolve but are not canonical.
export function resolvePath(p, files) {
  const clean = String(p).split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return {};
  if (clean === '/') return files.has('index.html') ? { file: 'index.html', canonical: true } : {};
  const rel = clean.slice(1);
  if (clean.endsWith('/')) return files.has(`${rel}index.html`) ? { file: `${rel}index.html`, canonical: true } : {};
  if (files.has(rel)) return rel.endsWith('.html') ? { file: rel, canonical: false, why: 'Cloudflare strips .html with a 308' } : { file: rel, canonical: true };
  if (files.has(`${rel}.html`)) return { file: `${rel}.html`, canonical: true };
  if (files.has(`${rel}/index.html`)) return { file: `${rel}/index.html`, canonical: false, why: `Cloudflare 308s ${clean} to ${clean}/` };
  return {};
}

// ———————————————————————————— _redirects (D-12; doc 02 §5.2, §5.5; R54) ————————————————————————————

export function readRedirectFixture(file) {
  return readFileSync(file, 'utf8').split('\n')
    .filter((l) => l.trim() && !l.trimStart().startsWith('#'))
    .map((l) => { const [id, from, to, code] = l.trim().split(/\s+/); return { id, from, to, code: Number(code) }; });
}

export function parseRedirects(text) {
  return String(text).split('\n').map((l, i) => ({ l: l.trim(), line: i + 1 }))
    .filter(({ l }) => l && !l.startsWith('#'))
    .map(({ l, line }) => { const [from, to, code] = l.split(/\s+/); return { from, to, code: code ? Number(code) : 302, line }; });
}

const isDynamic = (from) => /\*|\/:[a-zA-Z]/.test(from);

// Expected rules = the doc 02 §5.2.2 fixture with the §5.2.3 deltas applied for the current switches.
export function expectedRedirects(fixture, { cfg, site }) {
  const F = site.redirectFlags ?? {};
  let rules = fixture.map((r) => ({ ...r }));
  const proxy = (c) => modeOf(site, c.id) === 'proxy';
  // contract k in C-2: drop its 200 rule and both variants, add `<bareSlash> <bare> 301` in the variants' place
  cfg.CONTRACTS.forEach((c, i) => {
    if (proxy(c)) return;
    rules = rules.filter((r) => !(r.code === 200 && r.from === c.public));
    const isVariant = (r) => r.code !== 200 && r.to === c.public && (r.from === c.bare || r.from === c.bareSlash);
    const pos = rules.findIndex(isVariant);
    rules = rules.filter((r) => !isVariant(r));
    rules.splice(pos < 0 ? rules.length : pos, 0, { id: `A${5 + 2 * i}'`, from: c.bareSlash, to: c.bare, code: 301 });
  });
  // experiment L: /legal/<slug>/ → contract URL, after the A group and before B
  if (F.experimentL) {
    const at = rules.findIndex((r) => /^B\d/.test(r.id));
    const add = cfg.CONTRACTS.map((c, i) => ({ c, i })).filter(({ c }) => proxy(c)).map(({ c, i }) => ({ id: `L${i + 1}`, from: c.internal, to: c.public, code: 301 }));
    rules.splice(at < 0 ? rules.length : at, 0, ...add);
  }
  if (!F.indexHtmlRule) rules = rules.filter((r) => r.from !== '/index.html' && r.from !== '/index');
  // unpublished locales: C and D rules that target /<path>/ go to / with 302
  for (const l of cfg.LOCALES) {
    if (l.publish || !l.path) continue;
    const home = `/${l.path}/`;
    rules = rules.map((r) => (/^[CD]\d/.test(r.id) && (r.to === home || r.to === `${home}:splat`) ? { ...r, to: '/', code: 302 } : r));
  }
  // experiment C: case aliases of published locales whose hreflang differs from the path
  if (F.experimentC) {
    const cased = cfg.LOCALES.filter((l) => l.publish && l.path && l.hreflang !== l.path);
    const statics = cased.flatMap((l, i) => [
      { id: `X${2 * i + 1}`, from: `/${l.hreflang}`, to: `/${l.path}/`, code: 301 },
      { id: `X${2 * i + 2}`, from: `/${l.hreflang}/`, to: `/${l.path}/`, code: 301 }]);
    const splats = cased.map((l, i) => ({ id: `X${2 * cased.length + i + 1}`, from: `/${l.hreflang}/*`, to: `/${l.path}/:splat`, code: 301 }));
    const firstSplat = rules.findIndex((r) => isDynamic(r.from));
    rules.splice(firstSplat < 0 ? rules.length : firstSplat, 0, ...statics);
    rules.push(...splats);
  }
  return rules;
}

// The dist file set a configuration would produce (used by the D-12 self-test, which does not render pages).
export function simulatedDistFiles(cfg, site) {
  const files = new Set(['robots.txt', 'sitemap.xml', '_redirects', '_headers', 'favicon.ico']);
  for (const r of expandRoutes(cfg, site)) files.add(r.outFile);
  return files;
}

// D-12 (a)–(g) on a rule list. ctx = { cfg, site, files: Set, expected?: rules, counts?: {static, dynamic}, label? }
export function checkRedirectRules(rules, ctx, issues) {
  const { cfg, site, files } = ctx;
  const E = (m) => err(issues, 'D-12', m);
  const W = (m) => warn(issues, 'D-12', m);
  const r3 = rules.filter((r) => r.code >= 300 && r.code < 400);
  const r200 = rules.filter((r) => r.code === 200);
  const matches = (path, r) => (r.from.includes('*') ? path.startsWith(r.from.slice(0, r.from.indexOf('*'))) : path === r.from);
  const contractUrls = new Set(cfg.CONTRACTS.map((c) => (modeOf(site, c.id) === 'file' ? c.bare : c.public)));
  // (f) unique sources; no indexable page is redirected
  const seen = new Set();
  for (const r of rules) {
    if (seen.has(r.from)) E(`source ${r.from} appears twice (only the first rule would apply)`);
    seen.add(r.from);
    if (![200, 301, 302, 303, 307, 308, 404].includes(r.code)) E(`${r.from}: unsupported status ${r.code}`);
  }
  const indexable = new Set(expandRoutes(cfg, site).filter((r) => r.indexable).map((r) => r.publicUrl));
  for (const r of r3) if (indexable.has(r.from)) E(`${r.from} → ${r.to}: redirects an indexable page's canonical URL (f)`);
  // (a) (b) (d) (e) 3xx targets
  for (const r of r3) {
    if (/^https?:\/\//.test(r.to)) continue;
    const dynamic = /:[a-zA-Z]|\*/.test(r.to);
    const prefix = dynamic ? r.to.replace(/:[a-zA-Z]+.*$/, '').replace(/\*.*$/, '') : r.to;
    const res = resolvePath(prefix, files);
    const proxy = r200.find((p) => p.from === prefix);
    if (!res.file && !(proxy && resolvePath(proxy.to, files).file)) E(`${r.from} → ${r.to}: target does not resolve to a file in dist (a)`);
    const chain = r3.find((s) => s !== r && matches(prefix, s));
    if (chain) E(`${r.from} → ${r.to}: target is itself redirected by ${chain.from} → ${chain.to} (b, no chains)`);
    if (!dynamic && !prefix.endsWith('/') && !contractUrls.has(prefix)) E(`${r.from} → ${r.to}: target is not canonical — must end in "/" or be a contract URL (e)`);
    if (res.file && res.canonical === false) E(`${r.from} → ${r.to}: ${res.why} — two hops (e)`);
  }
  // (c) 200 proxies
  for (const r of r200) {
    if (!r.to.endsWith('/')) E(`${r.from} → ${r.to} 200: proxy target must end in "/" (c)`);
    if (!resolvePath(r.to, files).file) E(`${r.from} → ${r.to} 200: proxy target does not resolve to a file in dist (c)`);
    if (files.has(r.from.slice(1))) E(`${r.from} 200: a file with the source's name exists in dist — Cloudflare would 308 it (c, doc 02 §5.5-4)`);
    const loop = r3.find((s) => matches(r.to, s));
    if (loop) W(`${r.from} → ${r.to} 200: the proxy target is also redirected (${loop.from} → ${loop.to}, experiment L) — needs the M1-03 measurement (c)`);
  }
  // counts (F24) and generator consistency
  const st = rules.filter((r) => !isDynamic(r.from)).length;
  const dyn = rules.length - st;
  if (st > 2000 || dyn > 100) E(`rule budget exceeded: ${st} static / ${dyn} dynamic (limits 2,000 / 100)`);
  if (ctx.counts && (ctx.counts.static !== st || ctx.counts.dynamic !== dyn)) E(`generator reports ${ctx.counts.static}/${ctx.counts.dynamic} rules, the list has ${st}/${dyn}`);
  // (g) fixture + deltas, line by line including order
  if (ctx.expected) {
    const exp = ctx.expected;
    const expSt = exp.filter((r) => !isDynamic(r.from)).length;
    if (exp.length !== rules.length) E(`${rules.length} rules (${st}/${dyn}), expected ${exp.length} (${expSt}/${exp.length - expSt}) from the doc 02 §5.2.2 fixture + §5.2.3 deltas (g)`);
    let shown = 0;
    for (let i = 0; i < Math.max(exp.length, rules.length) && shown < 5; i++) {
      const a = exp[i], b = rules[i];
      if (a && b && a.from === b.from && a.to === b.to && a.code === b.code) continue;
      E(`line ${i + 1}: expected ${a ? `${a.id ?? ''} ${a.from} ${a.to} ${a.code}`.trim() : 'nothing'}, got ${b ? `${b.from} ${b.to} ${b.code}` : 'nothing'} (g)`);
      shown++;
    }
  }
}

// ———————————————————————————— _headers (D-13) ————————————————————————————

export function parseHeaders(text) {
  const rules = [];
  const bad = [];
  let cur = null;
  String(text).split('\n').forEach((line, i) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: [], line: i + 1 }; rules.push(cur); return; }
    const m = line.trim().match(/^(!\s*)?([A-Za-z0-9-]+)\s*:\s*(.*)$/) ?? line.trim().match(/^!\s*([A-Za-z0-9-]+)$/);
    if (!cur || !m) { bad.push(i + 1); return; }
    if (m.length === 2) cur.headers.push({ name: m[1].toLowerCase(), value: '', detach: true });
    else cur.headers.push({ name: m[2].toLowerCase(), value: m[3], detach: Boolean(m[1]) });
  });
  return { rules, bad };
}

const hostOf = (p) => (/^https?:\/\//.test(p) ? p.replace(/^https?:\/\//, '').split('/')[0] : null);
const pathOf = (p) => (/^https?:\/\//.test(p) ? `/${p.replace(/^https?:\/\/[^/]+\/?/, '')}` : p);
const patRe = (p, host = false) => new RegExp(`^${p.split(/(\*|:[a-zA-Z]+)/).map((s) => (s === '*' ? '.*' : /^:[a-zA-Z]+$/.test(s) ? (host ? '[^.]+' : '[^/]+') : s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))).join('')}$`);
const sample = (p) => p.replace(/\*/g, 'x/y.z').replace(/:[a-zA-Z]+/g, 'v');
function canOverlap(a, b) {
  const ha = hostOf(a), hb = hostOf(b);
  if (ha && hb && !patRe(ha, true).test(sample(hb)) && !patRe(hb, true).test(sample(ha))) return false;
  const pa = pathOf(a), pb = pathOf(b);
  return patRe(pa).test(sample(pb)) || patRe(pb).test(sample(pa));
}

// ———————————————————————————— OG contract (D-23; doc 06 §7.4, ENG-12, R59) ————————————————————————————

const imageSet = (code) => (code === 'ja' ? 'ja' : code === 'zh-Hans' ? 'zh-hans' : 'en');

// Inputs of the OG image for one page in one locale. scripts/og.mjs must hash exactly these (ogInputHash).
export function ogInputs(pageId, locale, t) {
  if (pageId === 'home') return { headline: t?.meta?.ogHeadline ?? '', subline: t?.meta?.ogSubline ?? '', shot: `shot/${imageSet(locale.code)}/lookup` };
  if (pageId === 'about') return { headline: t?.about?.h1 ?? '', subline: t?.about?.meta?.description ?? '', shot: 'shot/en/lookup' };
  if (pageId === 'chrome-extension') return { headline: t?.chromeExtension?.hero?.title ?? '', subline: t?.chromeExtension?.meta?.description ?? '', shot: 'ext/common/hero' };
  return null;
}
export const ogInputHash = ({ headline, subline, shot, template }) =>
  createHash('sha256').update(JSON.stringify([headline ?? '', subline ?? '', shot ?? '', template ?? ''])).digest('hex');
export const ogKey = (pageId, code) => `${pageId}-${code}`;

export function readOgRegistry(root) {
  const file = join(root, 'assets/og/og.json');
  if (!existsSync(file)) return null;
  const og = JSON.parse(readFileSync(file, 'utf8'));
  return { template: og.template ?? null, images: og.images ?? og };
}

// JPEG width/height from the first SOFn marker.
export function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1];
    if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

// ———————————————————————————— pending inputs ————————————————————————————

export function pendingInputs(cfg) {
  const root = cfg.root ?? '.';
  const badgeDir = join(root, 'assets/badges');
  const badges = existsSync(badgeDir) ? readdirSync(badgeDir).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)) : [];
  return {
    images: !existsSync(join(root, 'assets/img/images.json')),
    icons: !existsSync(join(root, 'public/icons')),
    badges, noBadges: badges.length === 0,
    og: !existsSync(join(root, 'assets/og/og.json')),
  };
}

// ———————————————————————————— JS string literals (D-15a) ————————————————————————————

// String literals of a JS module: '…', "…" and the static parts of `…` template literals (expressions are scanned
// recursively). Comments and regex literals are skipped.
export function stringLiterals(src) {
  const out = [];
  let i = 0;
  let prev = '';
  const n = src.length;
  const regexAllowed = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|do|else|in|of|new|delete|void|throw|yield|await)$/.test(prev);
  const readQuoted = (q) => {
    let s = '';
    i++;
    while (i < n && src[i] !== q) {
      if (src[i] === '\\') { s += src[i + 1] === 'n' ? '\n' : src[i + 1]; i += 2; continue; }
      s += src[i++];
    }
    i++;
    return s;
  };
  const readTemplate = () => {
    let s = '';
    i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { s += src[i + 1]; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        const start = i + 2;
        let depth = 1;
        i += 2;
        while (i < n && depth) {
          const c = src[i];
          if (c === '{') depth++;
          else if (c === '}') depth--;
          else if (c === '\'' || c === '"') { readQuoted(c); continue; }
          else if (c === '`') { readTemplate(); continue; }
          if (depth) i++;
        }
        out.push(...stringLiterals(src.slice(start, i)));
        i++;
        s += ' ';
        continue;
      }
      s += src[i++];
    }
    i++;
    return s;
  };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '\'' || c === '"') { out.push(readQuoted(c)); prev = 'x'; continue; }
    if (c === '`') { out.push(readTemplate()); prev = 'x'; continue; }
    if (c === '/' && regexAllowed()) {
      i++;
      let cls = false;
      while (i < n && (cls || src[i] !== '/')) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false;
        if (src[i] === '\n') break;
        i++;
      }
      i++;
      while (i < n && /[a-z]/i.test(src[i])) i++;
      prev = 'x';
      continue;
    }
    if (!/\s/.test(c)) prev = (prev + c).slice(-12);
    i++;
  }
  return out;
}

const stripTags = (s) => String(s).replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

// ———————————————————————————— validateDist ————————————————————————————

export function validateDist(dist, ctx, issues) {
  const cfg = ctx.cfg;
  const { SITE } = cfg;
  const root = cfg.root ?? '.';
  const strings = ctx.strings ?? {};
  const routes = ctx.routes ?? expandRoutes(cfg);
  const E = (id, m) => err(issues, id, m);
  const W = (id, m) => warn(issues, id, m);
  const absUrl = (p) => SITE.url + p;
  const files = listFiles(dist);
  const fileSet = new Set(files);
  const pending = pendingInputs(cfg);
  const data = loadData(cfg);

  const parsed = new Map();
  const page = (rel) => {
    if (!parsed.has(rel)) {
      const html = readFileSync(join(dist, rel), 'utf8');
      const doc = parseHTML(html);
      parsed.set(rel, { rel, html, doc, ...idIndex(doc) });
    }
    return parsed.get(rel);
  };
  const routeByFile = new Map(routes.map((r) => [r.outFile, r]));
  const builtRoutes = routes.filter((r) => fileSet.has(r.outFile));

  // ——— D-14: required and forbidden files ———
  for (const f of ['404.html', 'robots.txt', 'sitemap.xml', '_redirects', '_headers']) if (!fileSet.has(f)) E('D-14', `dist/${f} missing`);
  for (const f of ['_headers', '_redirects']) if (existsSync(join(root, 'public', f))) E('D-14', `public/${f} must not exist — it is generated (ENG-16)`);
  for (const c of cfg.CONTRACTS) if (modeOf(SITE, c.id) === 'proxy' && fileSet.has(c.public.slice(1))) E('D-14', `dist${c.public} exists while contract ${c.id} is proxied (C-1): Cloudflare would 308 it (doc 02 §5.5-4)`);
  for (const r of routes) if (!fileSet.has(r.outFile)) E('D-14', `${r.publicUrl} (${r.locale.code}): ${r.outFile} was not built`);
  for (const f of files) {
    if (/\.(css|js)$/.test(f) && !/\.[0-9a-f]{8,}\.(css|js)$/.test(f)) E('D-14', `dist/${f}: CSS/JS outside the fingerprinted bundle (doc 06 §3.5, A2)`);
    if (f.endsWith('.html') && !routeByFile.has(f)) W('D-14', `dist/${f} is not produced by a route (copied from public/?)`);
  }

  // ——— D-16 / D-19: file names ———
  for (const f of files) {
    const segs = f.split('/');
    if (segs.some((s) => s.startsWith('.'))) E('D-19', `dist/${f}: dotfile in output`);
    else if (segs.some((s) => !/^[a-z0-9._-]+$/.test(s))) E('D-16', `dist/${f}: file names must be lower-case ASCII without spaces`);
  }

  // ——— D-10: pages.dev never appears outside the host rules in _headers ———
  for (const f of files) {
    if (f === '_headers' || !/\.(html|xml|txt|json|webmanifest)$|^_redirects$/.test(f)) continue;
    if (readFileSync(join(dist, f), 'utf8').includes('pages.dev')) E('D-10', `dist/${f} contains "pages.dev" (only _headers host rules may name it)`);
  }

  // ——— D-13: _headers ———
  if (fileSet.has('_headers')) checkHeaders(readFileSync(join(dist, '_headers'), 'utf8'), issues);

  // ——— D-12: _redirects ———
  const redirectRules = fileSet.has('_redirects') ? parseRedirects(readFileSync(join(dist, '_redirects'), 'utf8')) : [];
  if (fileSet.has('_redirects')) {
    const fixtureFile = join(root, 'scripts/fixtures/redirects.default.txt');
    const expected = existsSync(fixtureFile) ? expectedRedirects(readRedirectFixture(fixtureFile), { cfg, site: SITE }) : null;
    if (!expected) E('D-12', 'scripts/fixtures/redirects.default.txt missing (R54)');
    checkRedirectRules(redirectRules, { cfg, site: SITE, files: fileSet, expected }, issues);
  }
  const redirect3xx = redirectRules.filter((r) => r.code >= 300 && r.code < 400);
  const proxy200 = redirectRules.filter((r) => r.code === 200);
  const redirectedBy = (path) => redirect3xx.find((r) => (r.from.includes('*') ? path.startsWith(r.from.slice(0, r.from.indexOf('*'))) : path === r.from));

  // ——— sitemap ———
  const sitemap = fileSet.has('sitemap.xml') ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
  const smUrls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: m[1].match(/<loc>([^<]*)<\/loc>/)?.[1] ?? '',
    lastmod: m[1].match(/<lastmod>([^<]*)<\/lastmod>/)?.[1] ?? null,
    alternates: [...m[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((a) => ({ hreflang: a[1], href: a[2].replace(/&amp;/g, '&') })),
    images: [...m[1].matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map((a) => a[1].replace(/&amp;/g, '&')),
  }));
  const smByLoc = new Map(smUrls.map((u) => [u.loc.replace(/&amp;/g, '&'), u]));

  // ——— per-route head checks: D-1, D-2, D-20, D-22, D-10 (og:url) ———
  const alternatesOf = new Map();
  for (const r of builtRoutes) {
    const p = page(r.outFile);
    const head = find(p.doc, (e) => e.tag === 'head') ?? p.doc;
    const links = byTag(head, 'link');
    const canon = links.filter((l) => (l.attrs.rel ?? '').split(/\s+/).includes('canonical'));
    const alts = links.filter((l) => (l.attrs.rel ?? '').split(/\s+/).includes('alternate') && 'hreflang' in l.attrs);
    alternatesOf.set(r.outFile, alts.map((a) => ({ hreflang: a.attrs.hreflang, href: a.attrs.href })));
    const at = `${r.publicUrl} (${r.locale.code})`;
    const self = absUrl(r.publicUrl);
    // D-1
    if (r.indexable) {
      if (canon.length !== 1) E('D-1', `${at}: ${canon.length} canonical links, expected exactly 1`);
      else if (canon[0].attrs.href !== self) E('D-1', `${at}: canonical ${canon[0].attrs.href} ≠ ${self}`);
    } else if (canon.length) E('D-1', `${at}: noindex page must not have a canonical (R49)`);
    for (const c of canon) if (!String(c.attrs.href).startsWith(`${SITE.url}/`)) E('D-10', `${at}: canonical ${c.attrs.href} is not on ${SITE.url}`);
    // D-20
    const robots = findAll(head, (e) => e.tag === 'meta' && e.attrs.name === 'robots');
    if (robots.length !== 1) E('D-20', `${at}: ${robots.length} robots meta tags, expected 1`);
    const content = (robots[0]?.attrs.content ?? '').toLowerCase();
    const isIndex = /(^|,)\s*index\b/.test(content) && !content.includes('noindex');
    if (content.includes('nofollow')) E('D-20', `${at}: robots "${content}" contains nofollow (R49)`);
    const inSitemap = smByLoc.has(self);
    const selfCanon = canon.length === 1 && canon[0].attrs.href === self;
    if (!(r.indexable === isIndex && r.indexable === selfCanon && r.indexable === inSitemap)) {
      E('D-20', `${at}: indexable=${r.indexable} but robots=${isIndex ? 'index' : 'noindex'} canonical=${selfCanon ? 'self' : 'none'} sitemap=${inSitemap ? 'yes' : 'no'} (must all agree, R49)`);
    }
    // D-22
    const html = find(p.doc, (e) => e.tag === 'html');
    const L = r.locale;
    if (!html) E('D-22', `${at}: no <html> element`);
    else {
      for (const a of ['lang', 'dir', 'data-script', 'data-page']) if (!(a in html.attrs)) E('D-22', `${at}: <html> lacks ${a}`);
      if (html.attrs.lang !== undefined && html.attrs.lang !== L.hreflang) E('D-22', `${at}: <html lang="${html.attrs.lang}"> ≠ ${L.hreflang}`);
      if (html.attrs.dir !== undefined && html.attrs.dir !== L.dir) E('D-22', `${at}: <html dir="${html.attrs.dir}"> ≠ ${L.dir}`);
      if (html.attrs['data-script'] !== undefined && html.attrs['data-script'] !== L.script) E('D-22', `${at}: data-script="${html.attrs['data-script']}" ≠ ${L.script} (R60)`);
      if (html.attrs['data-page'] !== undefined && html.attrs['data-page'] !== r.page.id) E('D-22', `${at}: data-page="${html.attrs['data-page']}" ≠ ${r.page.id}`);
    }
    const cl = findAll(head, (e) => e.tag === 'meta' && (e.attrs['http-equiv'] ?? '').toLowerCase() === 'content-language');
    if (cl.length !== 1) E('D-22', `${at}: ${cl.length} content-language meta tags, expected 1 (R47)`);
    else if (cl[0].attrs.content !== L.contentLanguage) E('D-22', `${at}: content-language "${cl[0].attrs.content}" ≠ ${L.contentLanguage} (R47)`);
    // D-10 og:url
    const ogUrl = find(head, (e) => e.tag === 'meta' && e.attrs.property === 'og:url');
    if (ogUrl && !String(ogUrl.attrs.content).startsWith(`${SITE.url}/`)) E('D-10', `${at}: og:url ${ogUrl.attrs.content} is not on ${SITE.url}`);
  }

  // ——— D-2: hreflang clusters (doc 02 §6.1 HL-1…HL-11) ———
  const routeByUrl = new Map(routes.map((r) => [absUrl(r.publicUrl), r]));
  for (const r of builtRoutes) {
    const at = `${r.publicUrl} (${r.locale.code})`;
    const got = alternatesOf.get(r.outFile) ?? [];
    const members = routes.filter((m) => m.page.id === r.page.id && m.indexable);
    const expected = [];
    if (r.indexable && members.length >= 2) {
      for (const m of members) {
        expected.push({ hreflang: m.locale.hreflang, href: absUrl(m.publicUrl) });
        for (const x of m.locale.hreflangExtra ?? []) expected.push({ hreflang: x, href: absUrl(m.publicUrl) });
      }
      const en = members.find((m) => m.locale.code === 'en');
      if (en) expected.push({ hreflang: 'x-default', href: absUrl(en.publicUrl) });
    }
    if (!r.indexable && got.length) E('D-2', `${at}: noindex page outputs ${got.length} hreflang links (HL-7)`);
    if (got.length !== expected.length) E('D-2', `${at}: ${got.length} hreflang links, expected ${expected.length} (members + extra codes + x-default)`);
    const codes = new Map();
    for (const a of got) {
      if (codes.has(a.hreflang)) E('D-2', `${at}: hreflang "${a.hreflang}" listed twice`);
      codes.set(a.hreflang, a.href);
      if (!String(a.href).startsWith(`${SITE.url}/`)) E('D-2', `${at}: hreflang ${a.hreflang} → ${a.href} is not on ${SITE.url} (HL-5)`);
      if (/surfenglish\.app/.test(a.href)) E('D-2', `${at}: hreflang must never point to surfenglish.app (HL-8)`);
    }
    for (const x of expected) if (codes.get(x.hreflang) !== x.href) E('D-2', `${at}: expected hreflang ${x.hreflang} → ${x.href}, got ${codes.get(x.hreflang) ?? 'nothing'}`);
    got.forEach((a, i) => {
      const extraOf = routes.find((m) => (m.locale.hreflangExtra ?? []).includes(a.hreflang));
      if (extraOf && got[i - 1]?.hreflang !== extraOf.locale.hreflang) E('D-2', `${at}: hreflang "${a.hreflang}" must directly follow ${extraOf.locale.hreflang} (HL-11)`);
      if (a.hreflang === 'x-default') return;
      const target = routeByUrl.get(a.href);
      if (!target) { E('D-2', `${at}: hreflang ${a.hreflang} → ${a.href} is not a page of this site`); return; }
      if (!target.indexable) E('D-2', `${at}: hreflang ${a.hreflang} → ${a.href} is a noindex page (HL-7)`);
      const back = alternatesOf.get(target.outFile) ?? [];
      if (target !== r && !back.some((b) => b.href === absUrl(r.publicUrl))) E('D-2', `${at}: ${a.href} does not list this page back (return link)`);
    });
    const p = page(r.outFile);
    for (const l of findAll(p.doc, (e) => e.tag === 'link' && 'hreflang' in e.attrs && 'media' in e.attrs)) E('D-2', `${at}: hreflang link with media="${l.attrs.media}" (HL-10)`);
  }

  // ——— D-3: sitemap ↔ HTML ———
  const seenLoc = new Set();
  for (const u of smUrls) {
    const loc = u.loc.replace(/&amp;/g, '&');
    if (seenLoc.has(loc)) E('D-3', `sitemap lists ${loc} twice`);
    seenLoc.add(loc);
    if (!loc.startsWith(`${SITE.url}/`)) E('D-10', `sitemap <loc> ${loc} is not on ${SITE.url}`);
    const r = routeByUrl.get(loc);
    if (!r || !r.indexable) { E('D-3', `sitemap <loc> ${loc} is not an indexable route${r ? ' (noindex page, R49)' : ''}`); continue; }
    const html = alternatesOf.get(r.outFile) ?? [];
    const same = html.length === u.alternates.length && html.every((a, i) => a.hreflang === u.alternates[i].hreflang && a.href === u.alternates[i].href);
    if (!same) E('D-3', `sitemap xhtml:link for ${loc} differ from the page's <link rel="alternate"> (${u.alternates.length} vs ${html.length}, HL-9)`);
    if (u.lastmod !== null && !/^\d{4}-\d{2}-\d{2}$/.test(u.lastmod)) E('D-3', `sitemap lastmod "${u.lastmod}" for ${loc} is not YYYY-MM-DD`);
    for (const img of u.images) {
      if (!img.startsWith(`${SITE.url}/`)) E('D-3', `sitemap image:loc ${img} is not on ${SITE.url}`);
      else if (!resolvePath(img.slice(SITE.url.length), fileSet).file) E('D-3', `sitemap image:loc ${img} does not exist in dist`);
    }
  }

  // ——— D-20: noindex pages outside every cluster ———
  for (const [file, alts] of alternatesOf) {
    for (const a of alts) {
      const t = routeByUrl.get(a.href);
      if (t && !t.indexable) E('D-20', `${routeByFile.get(file)?.publicUrl}: hreflang points to noindex page ${a.href} (R49)`);
    }
  }

  // ——— per page body checks (every HTML file in dist) ———
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  const siteIds = new Set();      // JSON-LD @ids defined anywhere on the site (D-9 site-wide closure)
  const jsonld = new Map();
  for (const f of htmlFiles) {
    const p = page(f);
    const blocks = [];
    for (const s of findAll(p.doc, (e) => e.tag === 'script' && (e.attrs.type ?? '') === 'application/ld+json')) {
      const raw = s.children[0]?.text ?? '';
      try { blocks.push(JSON.parse(raw)); } catch (e) { E('D-9', `${f}: JSON-LD does not parse (${e.message})`); }
      if (/\{wbr\}|<wbr>|\[\[|\]\]/.test(raw)) E('D-9', `${f}: markup token ({wbr}, <wbr>, [[ ]]) leaked into JSON-LD (R61)`);
    }
    const nodes = blocks.flatMap((b) => (Array.isArray(b['@graph']) ? b['@graph'] : [b]));
    for (const n of nodes) if (n && n['@id']) siteIds.add(n['@id']);
    jsonld.set(f, { blocks, nodes });
  }

  const imgPlaceholders = new Set();
  const iconPending = new Set();
  const ctValues = new Map();     // appId → Set(ct)
  const placeholderBadges = [];
  const seRoutes = [];

  for (const f of htmlFiles) {
    const p = page(f);
    const r = routeByFile.get(f);
    const at = r ? `${r.publicUrl} (${r.locale.code})` : f;
    const doc = p.doc;
    const allEls = [...elements(doc)];

    // ——— D-4: internal links ———
    const pagePublic = r ? r.publicUrl : `/${f}`;
    const refs = [];
    for (const e of allEls) {
      if (e.tag === 'link' && /\b(canonical|alternate)\b/.test(e.attrs.rel ?? '')) continue;
      if ('href' in e.attrs && e.tag !== 'base') refs.push({ e, url: e.attrs.href, attr: 'href' });
      if ('src' in e.attrs) refs.push({ e, url: e.attrs.src, attr: 'src' });
      if ('srcset' in e.attrs) for (const c of e.attrs.srcset.split(',')) { const u = c.trim().split(/\s+/)[0]; if (u) refs.push({ e, url: u, attr: 'srcset' }); }
      if (e.tag === 'meta' && ['og:image', 'twitter:image'].includes(e.attrs.property ?? e.attrs.name)) refs.push({ e, url: e.attrs.content, attr: 'content' });
    }
    for (const { e, url, attr } of refs) {
      if (url === undefined) continue;
      if (url === '' || url === '#') { E('D-4', `${at}: <${e.tag} ${attr}="${url}"> (F4)`); continue; }
      if (/^(mailto:|tel:|data:)/i.test(url)) continue;
      if (/^javascript:/i.test(url)) { E('D-4', `${at}: javascript: URL in <${e.tag}>`); continue; }
      let path;
      if (/^https?:\/\//i.test(url)) {
        if (!url.startsWith(`${SITE.url}/`) && url !== SITE.url) continue; // external: scripts/check.mjs --external
        path = url.slice(SITE.url.length) || '/';
      } else if (url.startsWith('//')) continue;
      else if (url.startsWith('#')) continue;   // D-5
      else path = url.startsWith('/') ? url : new URL(url, `${SITE.url}${pagePublic}`).pathname;
      const bare = path.split('#')[0].split('?')[0];
      if (bare.startsWith('/legal/')) { E('D-4', `${at}: links to the storage path ${bare} — use the contract URL (doc 06 §5.1.2)`); continue; }
      const via = redirectedBy(bare);
      if (via) { E('D-4', `${at}: links to ${bare}, a redirect source (${via.from} → ${via.to} ${via.code}) — link the target`); continue; }
      if (proxy200.some((x) => x.from === bare)) continue;  // contract URL served by a 200 rule
      const res = resolvePath(bare, fileSet);
      if (!res.file) {
        if (pending.icons && (/^\/icons\//.test(bare) || bare === '/site.webmanifest')) { iconPending.add(bare); continue; }
        E(attr === 'srcset' ? 'D-6' : 'D-4', `${at}: ${attr} ${bare} does not exist in dist (case-sensitive)`);
        continue;
      }
      if (!res.canonical) E('D-4', `${at}: links to ${bare} — ${res.why}; link the canonical URL`);
    }

    // ——— D-5: anchors and id references ———
    for (const d of p.dup) E('D-5', `${at}: id "${d}" is used more than once`);
    for (const e of allEls) {
      for (const a of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for']) {
        if (!(a in e.attrs) || (a === 'for' && e.tag !== 'label')) continue;
        for (const id of e.attrs[a].split(/\s+/).filter(Boolean)) if (!p.ids.has(id)) E('D-5', `${at}: ${a}="${id}" has no target`);
      }
      if (e.tag !== 'a' || !e.attrs.href?.includes('#') || e.attrs.href === '#') continue;
      const href = e.attrs.href;
      const [base, frag] = href.split('#');
      if (!frag) continue;
      if (!base) { if (!p.ids.has(frag)) E('D-5', `${at}: in-page anchor #${frag} has no target`); continue; }
      let path = base;
      if (/^https?:\/\//.test(base)) { if (!base.startsWith(SITE.url)) continue; path = base.slice(SITE.url.length) || '/'; }
      if (!path.startsWith('/')) continue;
      const proxied = proxy200.find((x) => x.from === path);
      const res = resolvePath(proxied ? proxied.to : path, fileSet);
      if (!res.file || !res.file.endsWith('.html')) continue; // D-4 reports
      if (!page(res.file).ids.has(frag)) E('D-5', `${at}: ${href} — no id "${frag}" on ${path}`);
    }
    if (r?.page.id === 'home') for (const id of HOME_SECTION_IDS) if (!p.ids.has(id)) E('D-5', `${at}: home page lacks the registered section id #${id} (doc 02 §7.5)`);

    // ——— D-6: <img> attributes ———
    const imgs = allEls.filter((e) => e.tag === 'img');
    imgs.forEach((img, i) => {
      const src = img.attrs.src ?? '?';
      for (const a of ['width', 'height']) if (!/^\d+$/.test(img.attrs[a] ?? '') || Number(img.attrs[a]) <= 0) E('D-6', `${at}: <img src="${src}"> needs a positive integer ${a}`);
      if (!('alt' in img.attrs)) E('D-6', `${at}: <img src="${src}"> has no alt attribute (decorative images use alt="")`);
      if (i > 0 && img.attrs.loading !== 'lazy') E('D-6', `${at}: <img src="${src}"> is not the first image and lacks loading="lazy"`);
    });
    for (const e of allEls) if ('data-img-key' in e.attrs) imgPlaceholders.add(e.attrs['data-img-key']);
    if (!pending.images) for (const e of allEls) if ('data-img-key' in e.attrs) E('D-6', `${at}: image "${e.attrs['data-img-key']}" is not in assets/img/images.json — a placeholder was rendered`);

    // ——— D-7: image budget (AVIF path) ———
    if (!pending.images) {
      let eager = 0, total = 0;
      const sizeOf = (u) => {
        const res = resolvePath(String(u).startsWith(SITE.url) ? u.slice(SITE.url.length) : u, fileSet);
        return res.file ? statSync(join(dist, res.file)).size : 0;
      };
      for (const img of imgs) {
        const pic = img.parent?.tag === 'picture' ? img.parent : null;
        let bytes = 0;
        const avif = pic && find(pic, (e) => e.tag === 'source' && (e.attrs.type ?? '') === 'image/avif');
        if (avif?.attrs.srcset) {
          const cands = avif.attrs.srcset.split(',').map((c) => c.trim().split(/\s+/)).map(([u, d]) => ({ u, w: d ? parseInt(d, 10) || 0 : 0 }));
          const big = cands.sort((a, b) => b.w - a.w)[0];
          bytes = sizeOf(big.u);
        } else bytes = sizeOf(img.attrs.src ?? '');
        total += bytes;
        if (img.attrs.loading !== 'lazy') eager += bytes;
      }
      if (eager > IMG_BUDGET.eager) E('D-7', `${at}: eager images ${(eager / 1024).toFixed(1)} KB > 150 KB`);
      if (total > IMG_BUDGET.page) E('D-7', `${at}: images ${(total / 1024).toFixed(1)} KB > 1.2 MB`);
    }

    // ——— D-8: headings ———
    const heads = allEls.filter((e) => /^h[1-6]$/.test(e.tag));
    const h1 = heads.filter((e) => e.tag === 'h1').length;
    if (h1 !== 1) E('D-8', `${at}: ${h1} <h1> elements, expected exactly 1`);
    let prev = 0;
    for (const h of heads) {
      const lvl = Number(h.tag[1]);
      if (prev && lvl > prev + 1) W('D-8', `${at}: heading level skips from h${prev} to h${lvl} ("${normSpace(textOf(h)).slice(0, 40)}")`);
      prev = lvl;
    }
    for (const sec of allEls.filter((e) => e.tag === 'section' && e.attrs.id && e.attrs.id !== 'hero')) {
      const first = find(sec, (e) => /^h[1-6]$/.test(e.tag));
      if (first && first.tag !== 'h2' && !(r?.page.id !== 'home' && first.tag === 'h1')) W('D-8', `${at}: section #${sec.attrs.id} starts with <${first.tag}>, sections use h2 (R13)`);
    }
    const featuresSec = p.ids.get('features');
    if (r?.page.id === 'home' && featuresSec) {
      for (const h of findAll(featuresSec, (e) => /^h[1-6]$/.test(e.tag))) {
        if (h.tag !== 'h2' && h.tag !== 'h3') W('D-8', `${at}: feature heading <${h.tag}> "${normSpace(textOf(h)).slice(0, 40)}" — feature blocks use h3 (R13)`);
      }
    }
    const lead = compileAll(Object.values(data.keywordMap?.seOwnedLead ?? {}).flat(), 'iu');
    for (const h of heads.filter((e) => e.tag === 'h2')) {
      const text = normSpace(textOf(h));
      if (lead.some((x) => x.test(text))) E('D-8', `${at}: H2 "${text}" opens with a learn-English phrase owned by SurfEnglish (R40)`);
    }

    // ——— D-9: JSON-LD ———
    const { nodes } = jsonld.get(f);
    const ids = new Map();
    for (const n of nodes) {
      if (!n?.['@id']) continue;
      if (ids.has(n['@id'])) E('D-9', `${at}: JSON-LD @id ${n['@id']} defined twice`);
      ids.set(n['@id'], n);
    }
    const walkLd = (v, path) => {
      if (Array.isArray(v)) { v.forEach((x, i) => walkLd(x, `${path}[${i}]`)); return; }
      if (!v || typeof v !== 'object') return;
      const keys = Object.keys(v);
      if (keys.length === 1 && keys[0] === '@id' && path) {
        const id = v['@id'];
        if (!ids.has(id) && !siteIds.has(id) && id !== SITE.makerId) E('D-9', `${at}: JSON-LD reference ${path} → ${id} is not defined on this site`);
      }
      for (const k of keys) {
        if (['aggregateRating', 'review', 'reviews'].includes(k)) E('D-9', `${at}: JSON-LD must not contain ${k} (F26)`);
        if (k === 'applicationCategory' && !APP_CATEGORIES.has(v[k])) E('D-9', `${at}: applicationCategory "${v[k]}" is not a Google-supported category`);
        if (k === '@type' && [].concat(v[k]).includes('FAQPage')) E('D-9', `${at}: FAQPage structured data is not output (R5)`);
        walkLd(v[k], `${path}.${k}`);
      }
    };
    nodes.forEach((n, i) => walkLd(n, `@graph[${i}]`));
    for (const n of nodes) {
      if (n?.['@id'] !== SITE.makerId) continue;
      if (n.name !== SITE.makerName) E('D-9', `${at}: Person name "${n.name}" ≠ SITE.makerName "${SITE.makerName}" (R17)`);
      if (n.alternateName !== SITE.makerAltName) E('D-9', `${at}: Person alternateName "${n.alternateName}" ≠ SITE.makerAltName (R17)`);
      if (JSON.stringify(n.sameAs) !== JSON.stringify(SITE.makerSameAs)) E('D-9', `${at}: Person sameAs must equal SITE.makerSameAs verbatim (R17)`);
    }
    const visible = textOf(doc, { sep: ' ' });
    if (SITE.makerAltName && visible.includes(SITE.makerAltName)) E('D-9', `${at}: "${SITE.makerAltName}" appears in visible text — JSON-LD alternateName only (R81)`);
    // markup leaks into what readers and crawlers see (R61; doc 03 §3.8)
    const title = normSpace(textOf(find(doc, (e) => e.tag === 'title') ?? { children: [] }));
    const metaText = findAll(doc, (e) => e.tag === 'meta' && /^(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$/.test(e.attrs.name ?? e.attrs.property ?? '')).map((e) => e.attrs.content ?? '').join(' ');
    if (/\{wbr\}|<wbr>|\[\[|\]\]/.test(`${title} ${metaText}`)) E('L-7', `${at}: markup token ({wbr}, [[ ]]) leaked into <title> or meta (R61)`);
    const leak = visible.match(/\{wbr\}|\[\[|\]\]|\]\(@[a-z-]+\)|\*\*\S/);
    if (leak) E('L-7', `${at}: markup "${leak[0]}" rendered literally — the field is output without mk()/head()/rich()`);

    // ——— D-11: recommendation and attribution rules ———
    const ga = allEls.filter((e) => 'data-ga-label' in e.attrs && e.attrs['data-ga-label'] === 'langhint_anchor');
    if (ga.length) E('D-11', `${at}: data-ga-label="langhint_anchor" — placement ③ was removed (R42)`);
    for (const e of allEls.filter((x) => 'data-ga-view' in x.attrs)) if (e.attrs.id !== 'surfenglish') E('D-11', `${at}: data-ga-view is only allowed on #surfenglish (doc 06 §8.2)`);
    const se = p.ids.get('surfenglish');
    const anchors = allEls.filter((e) => e.tag === 'a' && e.attrs.href);
    for (const a of anchors) {
      const href = a.attrs.href;
      if (/^https?:\/\/(www\.)?surfenglish\.app/.test(href)) {
        if (/[?&]utm_/.test(href)) E('D-11', `${at}: SurfEnglish link ${href} carries utm_ parameters (research 10 §2 C11)`);
        if (/\bnofollow\b/.test(a.attrs.rel ?? '')) E('D-11', `${at}: SurfEnglish link ${href} is rel="nofollow"`);
        const text = normSpace(textOf(a));
        if (/^(https?:\/\/)?(www\.)?surfenglish\.app\/?$/i.test(text)) E('D-11', `${at}: bare domain "${text}" as anchor text to SurfEnglish (R76)`);
      }
      const m = href.match(/^https:\/\/apps\.apple\.com\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id(\d+)(\?[^#]*)?/);
      if (!m) continue;
      const q = new URLSearchParams(m[2] ?? '');
      const ct = q.get('ct');
      if (SITE.pt && (!q.get('pt') || !ct)) E('D-11', `${at}: App Store link ${href} lacks pt/ct while SITE.pt is set (R55)`);
      if (ct !== null) {
        const list = m[1] === SITE.appStoreId ? WBW_CT : SE_CT;
        if (!/^[a-z0-9-]{1,30}$/.test(ct)) E('D-11', `${at}: ct "${ct}" must match ^[a-z0-9-]{1,30}$`);
        else if (!list.includes(ct)) E('D-11', `${at}: ct "${ct}" is not a registered placement for app ${m[1]} (doc 06 §8.3: ${list.join(', ')})`);
        if (!ctValues.has(m[1])) ctValues.set(m[1], new Set());
        ctValues.get(m[1]).add(ct);
      }
      if (m[1] === cfg.SIBLING.appStoreId) {
        if (r?.locale.code === 'zh-Hans') E('D-11', `${at}: SurfEnglish App Store link on a zh-Hans page (R42, F18)`);
        if (find(a, (e) => e.tag === 'img' || e.tag === 'svg') || hasClass(a, 'asb')) E('D-11', `${at}: the SurfEnglish App Store link must be a text link, not a badge (R43)`);
      }
    }
    for (const b of findAll(doc, (e) => e.tag === 'meta' && e.attrs.name === 'apple-itunes-app')) {
      if (!new RegExp(`app-id=${SITE.appStoreId}\\b`).test(b.attrs.content ?? '')) E('D-11', `${at}: Smart App Banner must carry only WordByWord's app id (${b.attrs.content})`);
    }
    if (se) {
      if (r?.page.id !== 'home') E('D-11', `${at}: #surfenglish is only allowed on home pages (contract pages, 404 and the extension pages have none, baseline §F)`);
      if (r?.locale.code === 'zh-Hans' || (r && cfg.seMode(r.locale) === 'no-card')) E('D-11', `${at}: #surfenglish must not render for ${r.locale.code} (R42)`);
      if (cfg.notice?.enabled && cfg.SIBLING.suppressWhenNotice) E('D-11', `${at}: #surfenglish must not render while the site notice is on (R35)`);
      if (find(se, (e) => hasClass(e, 'asb') || hasClass(e, 'asb--official') || (e.tag === 'img' && /badge/.test(e.attrs.src ?? '')))) E('D-11', `${at}: App Store badge inside #surfenglish (R43: text links only)`);
      const h2 = find(se, (e) => e.tag === 'h2');
      if (!h2 || !/^SurfEnglish/.test(normSpace(textOf(h2)))) E('D-11', `${at}: the #surfenglish H2 must start with "SurfEnglish" (R40)`);
      const pricing = p.ids.get('pricing');
      const faq = p.ids.get('faq');
      if (!pricing || !faq || !(pricing.start < se.start && se.start < faq.start)) E('D-11', `${at}: #surfenglish must sit after #pricing and before #faq (doc 02 §7.5)`);
      seRoutes.push(r);
    }
    if (r?.page.id === 'home') {
      const visibleCard = cfg.SIBLING.enabled && cfg.SIBLING.placements?.card && cfg.seMode(r.locale) !== 'no-card' && !(cfg.notice?.enabled && cfg.SIBLING.suppressWhenNotice);
      if (visibleCard && !se) E('D-11', `${at}: #surfenglish (placement ①) is missing`);
      const pricing = p.ids.get('pricing');
      const badge = pricing && find(pricing, (e) => e.tag === 'a' && hasClass(e, 'asb') && new RegExp(`id${SITE.appStoreId}\\b`).test(e.attrs.href ?? ''));
      if (!badge) E('D-11', `${at}: #pricing must contain the WordByWord App Store badge link (R43)`);
      const noCard = cfg.seMode(r.locale) === 'no-card';
      const availability = getPath(strings[r.locale.code], 'sibling.availability');
      const faqSe = p.ids.get('faq-english-learner');
      if (noCard && cfg.SIBLING.enabled && cfg.SIBLING.placements?.faq && availability && faqSe && !normSpace(textOf(faqSe)).includes(normSpace(availability))) {
        E('D-11', `${at}: the english-learner FAQ answer must end with sibling.availability (R42, F18)`);
      }
    }
    for (const b of allEls.filter((e) => e.tag === 'a' && hasClass(e, 'asb') && !hasClass(e, 'asb--official'))) placeholderBadges.push({ r, b });

    // ——— D-17: notice ———
    const notices = allEls.filter((e) => hasClass(e, 'site-notice'));
    if (r) {
      const want = cfg.notice?.enabled && r.page.notice && (cfg.notice.pages !== 'home' || r.page.id === 'home');
      if (want && !notices.length) E('D-17', `${at}: notice is enabled but not rendered`);
      if (!want && notices.length) E('D-17', `${at}: notice rendered although ${cfg.notice?.enabled ? `pages="${cfg.notice.pages}"` : 'notice.enabled is false'}`);
      for (const n of notices) {
        if (!('data-nosnippet' in n.attrs) || n.attrs.role !== 'status') E('D-17', `${at}: the notice needs role="status" and data-nosnippet (doc 06 §8.5)`);
        const header = find(doc, (e) => e.tag === 'header');
        if (header && n.start > header.start) E('D-17', `${at}: the notice must come before the header (doc 05 §5.15)`);
      }
    }

    // ——— D-24: Chrome extension sub-site states (R2, R16, R45) ———
    if (r) checkExtension(r, p, { cfg, strings, routes, E, at });
  }

  if (imgPlaceholders.size && pending.images) {
    W('D-21', `assets/img/images.json missing — ${imgPlaceholders.size} image slot(s) render as placeholders; D-6 placeholder, D-7 budget and D-21 registry/AVIF checks skipped until the image pipeline runs (doc 06 §7)`);
  } else if (pending.images) W('D-21', 'assets/img/images.json missing — D-7 and D-21 checks skipped');
  if (iconPending.size) W('D-4', `public/icons/ missing — ${[...iconPending].sort().join(', ')} not in dist yet (icon set from the image pipeline, doc 06 §7.4)`);
  for (const [app, set] of ctValues) if (set.size > SITE.ct.maxDistinct) E('D-11', `app ${app} uses ${set.size} distinct ct values (> ${SITE.ct.maxDistinct}, R55)`);

  // ——— D-11: official App Store badges (doc 06 §7.4) ———
  const neededBadges = [...new Set(cfg.LOCALES.filter((l) => l.publish).map((l) => l.badge))];
  if (pending.noBadges) W('D-11', `assets/badges/*.svg missing — drawn placeholder App Store badges are rendered (${neededBadges.join(', ')}; doc 06 §7.4)`);
  else {
    for (const b of neededBadges) if (!pending.badges.includes(b)) E('D-11', `assets/badges/${b}.svg missing for a published locale (doc 06 §7.4)`);
    for (const { r, b } of placeholderBadges) if (r && pending.badges.includes(r.locale.badge)) E('D-11', `${r.publicUrl} (${r.locale.code}): drawn placeholder badge rendered although assets/badges/${r.locale.badge}.svg exists`);
  }

  // ——— D-21: image registry and AVIF structure ———
  if (!pending.images) checkRegistry(cfg, issues);

  // ——— D-15 (a): claims in template literals, SIBLING and notice copy ———
  checkTemplateClaims(cfg, data, issues);

  // ——— D-18: size budgets ———
  for (const f of files) {
    const kind = /^assets\/site\.[0-9a-f]+\.css$/.test(f) ? 'css' : /^assets\/site\.[0-9a-f]+\.js$/.test(f) ? 'js' : routeByFile.get(f)?.page.id === 'home' ? 'home' : null;
    if (!kind) continue;
    const buf = readFileSync(join(dist, f));
    const gz = gzipSync(buf).length;
    const [maxRaw, maxGz] = BUDGET[kind];
    if (buf.length > maxRaw || gz > maxGz) W('D-18', `dist/${f}: ${(buf.length / 1024).toFixed(1)} KB / gzip ${(gz / 1024).toFixed(1)} KB over the ${kind} budget ${maxRaw / 1024} / ${maxGz / 1024} KB (doc 06 §6.3)`);
  }

  // ——— D-23: OG images match the copy ———
  checkOg(cfg, strings, routes, pending, issues);
}

// ——— D-13 ———
export function checkHeaders(text, issues) {
  const E = (m) => err(issues, 'D-13', m);
  const { rules, bad } = parseHeaders(text);
  for (const l of bad) E(`_headers line ${l}: not "Name: value" under a rule`);
  if (rules.length > 100) E(`${rules.length} rules (> 100)`);
  text.split('\n').forEach((l, i) => { if (l.length > 2000) E(`_headers line ${i + 1} is longer than 2,000 characters`); });
  for (const r of rules) {
    for (const h of r.headers) {
      if (h.name === 'content-language') E(`${r.pattern}: Content-Language must not be sent as a header (R47)`);
      if (h.name === 'x-robots-tag' && !/pages\.dev/.test(hostOf(r.pattern) ?? '')) E(`${r.pattern}: X-Robots-Tag is only allowed in the pages.dev host rules (SEO-06, R48)`);
    }
    if (r.pattern === '/*' && r.headers.some((h) => h.name === 'cache-control' && !h.detach)) E('/*: Cache-Control in the /* block would be joined with /assets/* (doc 06 §3.6.4)');
  }
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i], b = rules[j];
      if (!canOverlap(a.pattern, b.pattern)) continue;
      for (const h of a.headers) {
        const o = b.headers.find((x) => x.name === h.name && !x.detach && !h.detach);
        if (!o) continue;
        const bothHost = /pages\.dev/.test(a.pattern) && /pages\.dev/.test(b.pattern);
        if (bothHost && h.name === 'x-robots-tag' && h.value === o.value) continue;
        E(`header ${h.name} is set by both "${a.pattern}" and "${b.pattern}", which can match the same request — Cloudflare joins the values (ENG-07)`);
      }
    }
  }
}

// ——— D-21 ———
export function checkRegistry(cfg, issues) {
  const root = cfg.root ?? '.';
  const E = (m) => err(issues, 'D-21', m);
  let reg;
  try { reg = JSON.parse(readFileSync(join(root, 'assets/img/images.json'), 'utf8')); } catch (e) { E(`assets/img/images.json does not parse (${e.message})`); return; }
  for (const [key, entry] of registryEntries(reg)) {
    const vars = entryVariants(entry);
    if (!vars.length) { E(`${key}: no variants`); continue; }
    for (const v of vars) {
      const rel = resolveRegistryPath(root, v.path);
      const file = join(root, rel);
      if (!existsSync(file)) { E(`${key}: ${rel} is registered but missing`); continue; }
      const buf = readFileSync(file);
      if (typeof v.bytes === 'number' && v.bytes !== buf.length) E(`${key}: ${rel} is ${buf.length} bytes, images.json says ${v.bytes} — image changed without re-running the pipeline (npm run images)`);
      if (v.format !== 'avif') continue;
      try {
        const info = avifInfo(buf);
        const expect = Number.isInteger(v.w) && Number.isInteger(v.h) ? { width: v.w, height: v.h } : null;
        for (const prob of avifProblems(info, expect)) E(`${key}: ${rel}: ${prob}`);
      } catch (e) { E(`${key}: ${rel} is not a readable AVIF (${e.message})`); }
    }
  }
}

// ——— D-15 (a) ———
const TEMPLATE_KEY_PREFIX = { 'chrome-extension.mjs': 'chromeExtension.', 'about.mjs': 'about.', 'notfound.mjs': 'notfound.', 'faq.mjs': 'faq.', 'sibling.mjs': 'sibling.', 'demo.mjs': 'demo.' };

export function checkTemplateClaims(cfg, data, issues) {
  const root = cfg.root ?? '.';
  const rules = data.claims?.rules ?? [];
  const compiled = (codes) => rules.filter((r) => !r.only).map((r) => ({
    rule: r, regs: compileAll(codes.flatMap((c) => r.patterns?.[c] ?? []), `u${r.caseSensitive ? '' : 'i'}`),
  }));
  const enRules = compiled(['*', 'en']);
  const scan = (where, text, prefix, list = enRules) => {
    for (const { rule, regs } of list) {
      if (prefix && (rule.exemptPrefix ?? []).some((p) => p === prefix)) continue;
      for (const r of regs) {
        const m = text.match(r);
        if (m) { err(issues, 'D-15', `${where}: "${m[0]}" — ${rule.id}: ${rule.desc ?? ''}`.trim()); break; }
      }
    }
  };
  const tdir = join(root, 'src/templates');
  for (const rel of listFiles(tdir).filter((f) => f.endsWith('.mjs'))) {
    const src = readFileSync(join(tdir, rel), 'utf8');
    const prefix = TEMPLATE_KEY_PREFIX[rel.split('/').pop()] ?? '';
    for (const lit of stringLiterals(src)) {
      const text = stripTags(lit);
      if (text) scan(`src/templates/${rel}`, text, prefix);
    }
  }
  const sib = [];
  const collect = (v) => { if (typeof v === 'string') sib.push(v); else if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === 'object') Object.values(v).forEach(collect); };
  collect(cfg.SIBLING);
  for (const s of sib) scan('src/data/sibling.mjs', s, 'sibling.');
  for (const [code, copy] of Object.entries(cfg.notice?.copy ?? {})) {
    const list = compiled(['*', 'en', code]);
    for (const [k, v] of Object.entries(copy ?? {})) if (typeof v === 'string') scan(`src/notice.json copy.${code}.${k}`, v, '', list);
  }
}

// ——— D-23 ———
export function checkOg(cfg, strings, routes, pending, issues) {
  if (pending.og) { warn(issues, 'D-23', 'assets/og/og.json missing — OG images are not generated yet (npm run og, doc 06 §7.4); og:image is omitted and D-23 is skipped'); return; }
  const root = cfg.root ?? '.';
  const E = (m) => err(issues, 'D-23', m);
  let og;
  try { og = readOgRegistry(root); } catch (e) { E(`assets/og/og.json does not parse (${e.message})`); return; }
  const tplFile = join(root, 'src/templates/og.mjs');
  const tplHash = existsSync(tplFile) ? createHash('sha256').update(readFileSync(tplFile)).digest('hex').slice(0, 12) : null;
  const seen = new Set();
  for (const r of routes) {
    if (!OG_PAGES.includes(r.page.id) || seen.has(ogKey(r.page.id, r.locale.code))) continue;
    const key = ogKey(r.page.id, r.locale.code);
    seen.add(key);
    const entry = og.images?.[key];
    if (!entry) { E(`${key}: no OG image for a published page (npm run og)`); continue; }
    const rel = resolveRegistryPath(root, entry.file ?? `assets/og/${key}.jpg`);
    if (!existsSync(join(root, rel))) { E(`${key}: ${rel} missing`); continue; }
    const size = jpegSize(readFileSync(join(root, rel)));
    if (!size || size.w !== OG_SIZE.w || size.h !== OG_SIZE.h) E(`${key}: ${rel} is ${size ? `${size.w}×${size.h}` : 'not a JPEG'}, expected ${OG_SIZE.w}×${OG_SIZE.h}`);
    const inputs = ogInputs(r.page.id, r.locale, strings[r.locale.code]);
    const template = entry.inputs?.template ?? entry.template ?? og.template ?? '';
    if (tplHash && template && template !== tplHash) E(`${key}: OG template changed since the image was rendered — re-run npm run og`);
    if (entry.sha256 !== ogInputHash({ ...inputs, template })) {
      const changed = entry.inputs ? Object.keys(inputs).filter((k) => entry.inputs[k] !== inputs[k]) : [];
      E(`${key}: copy changed since the OG image was rendered${changed.length ? ` (${changed.join(', ')})` : ''} — re-run npm run og (ENG-12)`);
    }
  }
}

// ——— D-24 ———
function checkExtension(r, p, { cfg, strings, routes, E, at }) {
  const { SITE } = cfg;
  const live = Boolean(SITE.chromeStoreUrl);
  const extUrls = new Set(routes.filter((x) => x.page.id === 'chrome-extension').map((x) => x.publicUrl).concat(['/chrome-extension/', '/zh-hans/chrome-extension/']));
  const doc = p.doc;
  const header = find(doc, (e) => e.tag === 'header');
  const headerNavLinks = header ? findAll(header, (e) => e.tag === 'a' && closest(e, (x) => x.tag === 'nav') && !closest(e, (x) => hasClass(x, 'lang-switch'))) : [];
  const navHasExt = headerNavLinks.some((a) => extUrls.has(a.attrs.href));
  const footer = find(doc, (e) => e.tag === 'footer');
  const footerExt = footer && findAll(footer, (e) => e.tag === 'a' && extUrls.has(e.attrs.href) && !closest(e, (x) => hasClass(x, 'footer-langs'))).length > 0;
  if (!footerExt) E('D-24', `${at}: the footer must keep the Chrome extension link in both states (R2)`);
  const storeLinks = findAll(doc, (e) => e.tag === 'a' && /chromewebstore\.google\.com|chrome\.google\.com\/webstore/.test(e.attrs.href ?? ''));
  const isExt = r.page.id === 'chrome-extension';
  if (!live) {
    if (navHasExt) E('D-24', `${at}: S0 — the header navigation must not show the extension item (R16)`);
    if (storeLinks.length) E('D-24', `${at}: S0 — link to the Chrome Web Store (${storeLinks[0].attrs.href}) although the listing is not live (F20, F27)`);
    if (isExt && r.indexable) E('D-24', `${at}: S0 — the extension page must be noindex (R2)`);
    if (isExt && !findAll(doc, (e) => e.tag === 'a' && /^mailto:/.test(e.attrs.href ?? '') && closest(e, (x) => hasClass(x, 'cta-row'))).length) E('D-24', `${at}: S0 — the extension CTA must offer the mailto contact (doc 06 §5.4)`);
  } else {
    if (!isExt && !navHasExt) E('D-24', `${at}: S1 — the header navigation must show the extension item (R16)`);
    if (isExt && !findAll(doc, (e) => e.tag === 'a' && e.attrs.href === SITE.chromeStoreUrl && e.attrs['data-ga-event'] === 'chrome_store_click').length) {
      E('D-24', `${at}: S1 — the extension CTA must link to SITE.chromeStoreUrl with data-ga-event="chrome_store_click"`);
    }
  }
  if (r.page.id === 'extension-privacy' && !live && r.indexable) E('D-24', `${at}: S0 — the extension privacy page follows the extension page and is noindex (R2)`);
  if (isExt && !textOf(doc, { sep: ' ' }).includes('WordByWord.io')) E('D-24', `${at}: the extension page must state it is not affiliated with WordByWord.io (R2, R15)`);
  if (r.page.id === 'home') {
    const devices = p.ids.get('faq-devices');
    const t = strings[r.locale.code];
    const item = t?.faq?.items?.find((q) => q.id === 'devices');
    if (devices && item) {
      const vars = makeVars(cfg, r.locale, t);
      const want = normSpace(rendered(live && item.aExtLive ? item.aExtLive : item.a, vars, r.locale.code));
      const answer = find(devices, (e) => hasClass(e, 'faq-a'));
      const got = normSpace(textOf(answer ?? devices));
      if (!got.includes(want)) E('D-24', `${at}: FAQ devices must use the ${live ? 'S1 aExtLive' : 'S0'} answer (R45)`);
      if (!live && /WordByWord Translate/.test(got)) E('D-24', `${at}: S0 — FAQ devices names the extension (R45)`);
    }
  }
}

// Exposed for the tests: rule ids present in this module.
export const D_RULES = Array.from({ length: 24 }, (_, i) => `D-${i + 1}`);
