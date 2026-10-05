#!/usr/bin/env node
// Local stand-in for Cloudflare Pages serving dist/ (doc 06 §11.1). Zero dependencies, Node ≥ 22.
// It only approximates CF: acceptance is always the CF preview (research 09 §5.10).
//
// Usage: node scripts/serve.mjs [--port 4580] [--dir dist] [--emulate-host <hostname>] [--flat-404] [--quiet]
//   --dir           output directory (default: <repo>/dist)
//   --emulate-host  treat every request as sent to <hostname> instead of the Host header, so that host rules in
//                   _headers apply: e.g. main.wordbyword-web.pages.dev (preview: X-Robots-Tag: noindex)
//   --flat-404      serve only /404.html. Default: the nearest <dir>/404.html first, as CF does (doc 02 §6.9; verified
//                   on this project's previews in M1-03, 2026-10-06: /ja/missing served /ja/404.html).
//
// Modelled on CF's asset server (workers-sdk packages/pages-shared/asset-server/handler.ts) and checked against a
// live Pages site. Order per request:
//  1. _redirects, first match wins. A 3xx answers with a relative Location (target path + the request's query when
//     the target has none). A 200 is a rewrite: the URL stays, the target is served. Rules beat existing files.
//  2. Methods other than GET/HEAD → 405.
//  3. Pretty URLs, case-sensitive (macOS APFS is not; CF is): /x/ serves x/index.html; /x/index.html → 308 /x/;
//     /x.html → 308 /x unless /x is itself a file; /x serves x.html, or → 308 /x/ when x/index.html exists;
//     /x/index → 308 /x/. The query is kept.
//  4. Not found → /404.html with status 404. Without any 404.html CF assumes an SPA: /index.html with 200 (D-14).
//  5. Headers: CF defaults (access-control-allow-origin, referrer-policy, nosniff, etag,
//     cache-control: public, max-age=0, must-revalidate; x-robots-tag: noindex on *.<project>.pages.dev previews),
//     then every matching _headers rule in file order: the first rule that sets a name replaces it, later rules add one
//     more field line each (CF sends separate lines, M1-03); "! Name" removes it. Applied to every response, redirects
//     and 404s included (verified on a live Pages site); a 404 always ends with cache-control: no-store.
// Not emulated: compression, early hints, http→https, Pages Functions, _routes.json, zone features.

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) { console.error(`serve.mjs: ${name} needs a value`); process.exit(2); }
  return args[i + 1];
};
if (args.includes('--help') || args.includes('-h')) {
  console.log('node scripts/serve.mjs [--port 4580] [--dir dist] [--emulate-host <hostname>] [--flat-404] [--quiet]');
  process.exit(0);
}
const PORT = Number(opt('--port', 4580));
const DIR = resolve(opt('--dir', join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')));
const AS_HOST = opt('--emulate-host', null);
const NESTED_404 = !args.includes('--flat-404');
const QUIET = args.includes('--quiet');
if (!Number.isInteger(PORT) || PORT <= 0) { console.error('serve.mjs: --port needs a number'); process.exit(2); }
if (!existsSync(DIR)) { console.error(`serve.mjs: ${DIR} does not exist — run node build.mjs first`); process.exit(1); }

// Content types as CF assigns them at upload (wrangler: mime + "; charset=utf-8" for text/*).
const TYPES = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript',
  mjs: 'application/javascript', json: 'application/json', map: 'application/json',
  webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', ico: 'image/vnd.microsoft.icon', woff2: 'font/woff2',
  woff: 'font/woff', pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm',
};
const NOT_SERVED = ['/_headers', '/_redirects', '/_routes.json', '/_worker.js']; // CF never uploads these
const IGNORED = new Set(['.DS_Store', '.git', 'node_modules']);

// ———————————————————————————— rules (_redirects, _headers) ————————————————————————————

// CF pattern → RegExp: `*` is a greedy splat (:splat), `:name` one path segment (one host label in https:// rules).
function compile(pattern) {
  const host = pattern.startsWith('https://');
  let src = pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('(?<splat>.*)');
  if (host) src = src.replace(/^https:\/\/[^/]*/, (h) => h.replace(/:(\w+)/g, '(?<$1>[^/.]+)'));
  return { host, re: new RegExp(`^${src.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`) };
}
const test = (rule, url) => { const m = rule.re.exec(rule.host ? `https://${url.hostname}${url.pathname}` : url.pathname); return m && (m.groups ?? {}); };
const fill = (s, groups) => Object.entries(groups).reduce((t, [k, v]) => t.replaceAll(`:${k}`, v ?? ''), s);

function parseRedirects(text, warnings) {
  const rules = [], seen = new Set(), count = { static: 0, dynamic: 0 };
  text.split('\n').forEach((line, i) => {
    const t = line.trim().split(/\s+/);
    const c = t.findIndex((x) => x.startsWith('#'));
    if (c >= 0) t.length = c; // a token starting with # opens a comment
    if (!t[0]) return;
    const [from, to, code = '302'] = t, status = Number(code);
    const kind = /[*:]/.test(from.replace(/^https:\/\//, '')) ? 'dynamic' : 'static';
    const why = t.length < 2 || t.length > 3 ? 'expected "from to [status]"'
      : ![200, 301, 302, 303, 307, 308].includes(status) ? `status ${code} not allowed`
      : !/^(\/|https:\/\/)/.test(from) ? 'from must start with / or https://'
      : status === 200 && !to.startsWith('/') ? 'a 200 proxy needs a relative target'
      : seen.has(from) ? 'duplicate from (the first one wins)'
      : ++count[kind] > (kind === 'static' ? 2000 : 100) ? `over the ${kind} rule limit` : null;
    if (why) return warnings.push(`_redirects:${i + 1} ignored (${why}): ${line.trim()}`);
    seen.add(from);
    rules.push({ from, to, status, ...compile(from) });
  });
  return rules;
}

function parseHeaders(text, warnings) {
  const rules = [];
  let rule = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    if (/^([^\s]+:\/\/|\/)/.test(line)) return void rules.push(rule = { set: {}, unset: [], ...compile(line) });
    if (!rule) return warnings.push(`_headers:${i + 1} ignored (no path line above): ${line}`);
    if (!line.includes(':')) {
      if (line.startsWith('! ')) rule.unset.push(line.slice(2).trim().toLowerCase());
      else warnings.push(`_headers:${i + 1} ignored (expected "Name: value" or "! Name"): ${line}`);
      return;
    }
    const k = line.slice(0, line.indexOf(':')).trim().toLowerCase(), v = line.slice(line.indexOf(':') + 1).trim();
    rule.set[k] = rule.set[k] ? `${rule.set[k]}, ${v}` : v; // same name twice in one rule: joined
  });
  if (rules.length > 100) warnings.push(`_headers: ${rules.length} rules, CF allows 100`);
  return rules;
}

// dist is re-read at most once a second, so a rebuild is picked up without a restart.
let site = null, loadedAt = 0, lastWarnings = '';
function load() {
  if (site && Date.now() - loadedAt < 1000) return site;
  const files = new Set();
  (function walk(dir, rel) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED.has(e.name)) continue;
      if (e.isDirectory()) walk(join(dir, e.name), `${rel}/${e.name}`); else files.add(`${rel}/${e.name}`);
    }
  })(DIR, '');
  NOT_SERVED.forEach((f) => files.delete(f));
  const read = (f) => (existsSync(join(DIR, f)) ? readFileSync(join(DIR, f), 'utf8') : '');
  const warnings = [];
  site = { files, redirects: parseRedirects(read('_redirects'), warnings), headers: parseHeaders(read('_headers'), warnings) };
  if (warnings.join('\n') !== lastWarnings) warnings.forEach((w) => console.warn(`warn  ${w}`));
  lastWarnings = warnings.join('\n');
  loadedAt = Date.now();
  return site;
}

// ———————————————————————————— routing (CF order) ————————————————————————————

function route({ files, redirects }, method, url) {
  let path = url.pathname, rewrite;
  for (const rule of redirects) {
    const groups = test(rule, url);
    if (!groups) continue;
    const to = new URL(fill(rule.to, groups), url);
    if (rule.status === 200) { path = rewrite = to.pathname; break; }
    const query = to.search || url.search;
    const location = to.origin === url.origin ? `${to.pathname}${query}${to.hash}`
      : `${to.href.slice(0, to.href.length - to.search.length - to.hash.length)}${query}${to.hash}`;
    return { status: rule.status, location };
  }
  if (!/^(GET|HEAD)$/i.test(method)) return { status: 405 };
  try { path = decodeURIComponent(path); } catch {}
  const has = (p) => files.has(p);
  const ok = (file) => ({ status: 200, file, rewrite });
  const moved = (p) => ({ status: 308, location: p.split('/').map(encodeURIComponent).join('/') + url.search });
  if (path.endsWith('/')) {
    if (has(`${path}index.html`)) return ok(`${path}index.html`);
    if (path.endsWith('/index/')) return moved(path.slice(0, -'index/'.length));
    if (has(`${path.slice(0, -1)}.html`)) return moved(path.slice(0, -1));
    return notFound(files, path);
  }
  if (has(path)) {
    if (!path.endsWith('.html')) return ok(path);
    const bare = path.slice(0, -'.html'.length);
    if (bare.endsWith('/index')) return moved(bare.slice(0, -'index'.length));
    return has(bare) || bare === '/' ? ok(path) : moved(bare);
  }
  if (path.endsWith('/index')) return moved(path.slice(0, -'index'.length));
  if (has(`${path}.html`)) return ok(`${path}.html`);
  if (has(`${path}/index.html`)) return moved(`${path}/`);
  return notFound(files, path);
}

function notFound(files, path) {
  for (let dir = path; dir;) { // CF walks up from the request path; only /404.html with --flat-404
    dir = dir.slice(0, dir.lastIndexOf('/'));
    if ((NESTED_404 || !dir) && files.has(`${dir}/404.html`)) return { status: 404, file: `${dir}/404.html` };
  }
  return files.has('/index.html') ? { status: 200, file: '/index.html', spa: true } : { status: 404 };
}

// ———————————————————————————— server ————————————————————————————

const isPreview = (hostname) => hostname.endsWith('.pages.dev') && hostname.split('.').length > 3;

function handle(req, res) {
  let s, url;
  try { s = load(); } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end(`serve.mjs: cannot read ${DIR} (${e.code ?? e.message}); run node build.mjs\n`);
  }
  try { url = new URL(`http://${AS_HOST ?? req.headers.host ?? 'localhost'}${req.url}`); } catch {
    res.writeHead(400); return res.end();
  }
  const r = route(s, req.method, url);
  const h = new Map(); // lower-case name → field values, one line each (CF does not join across rules, M1-03)
  const set = (k, v) => h.set(k, [v]);
  let body = null;
  if (r.location) set('location', r.location);
  if (r.file) {
    body = readFileSync(join(DIR, r.file));
    set('content-type', TYPES[extname(r.file).slice(1).toLowerCase()] ?? 'application/octet-stream');
    if (r.status === 200) {
      const etag = `"${createHash('md5').update(body).digest('hex')}"`;
      if (req.headers['if-none-match'] === etag) { r.status = 304; body = null; }
      set('etag', etag);
      set('cache-control', 'public, max-age=0, must-revalidate');
      if (isPreview(url.hostname)) set('x-robots-tag', 'noindex');
    }
  } else if (r.status >= 400) {
    body = Buffer.from(r.status === 404 ? 'Not Found\n' : 'Method Not Allowed\n');
    set('content-type', 'text/plain; charset=utf-8');
  }
  set('access-control-allow-origin', '*');
  set('referrer-policy', 'strict-origin-when-cross-origin');
  if (h.has('content-type')) set('x-content-type-options', 'nosniff');
  const done = new Set();
  for (const rule of s.headers) {
    const groups = test(rule, url); // matched against the requested URL, not the rewrite target
    if (!groups) continue;
    rule.unset.forEach((k) => h.delete(k));
    for (const [k, v] of Object.entries(rule.set)) {
      if (done.has(k)) h.get(k).push(fill(v, groups)); else { set(k, fill(v, groups)); done.add(k); }
    }
  }
  if (r.status === 404) set('cache-control', 'no-store');
  if (body) set('content-length', String(body.length));
  res.writeHead(r.status, Object.fromEntries([...h].map(([k, v]) => [k, v.length > 1 ? v : v[0]])));
  res.end(req.method === 'HEAD' || !body ? undefined : body);
  if (!QUIET) {
    const note = r.location ? ` → ${r.location}` : r.rewrite ? ` (200 rewrite → ${r.rewrite})` : r.spa ? ' (SPA fallback: no 404.html)' : '';
    console.log(`${r.status} ${req.method} ${req.url}${note}`);
  }
}

createServer(handle)
  .on('error', (e) => { console.error(`serve.mjs: ${e.message}`); process.exit(1); })
  .listen(PORT, '127.0.0.1', () => {
    const extras = [AS_HOST && `as host ${AS_HOST}`, !NESTED_404 && 'flat 404'].filter(Boolean).join(', ');
    console.log(`serve.mjs: ${DIR} on http://127.0.0.1:${PORT}/${extras ? ` (${extras})` : ''} — approximates Cloudflare Pages; acceptance is the CF preview`);
  });
