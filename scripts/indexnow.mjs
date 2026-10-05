// IndexNow push: tell Bing, Yandex, Naver, Seznam, Yep … (not Google) which production URLs to recrawl.
// Spec: doc 03 §6.3 and doc 06 §11.3 (SEO-10), branch design-docs. No diffing: every URL of the PRODUCTION sitemap
// is submitted after each release; the T0 first push adds every legacy URL (--legacy, doc 06 §10.2 step 12).
// Zero dependencies, Node ≥ 22. Run by .github/workflows/indexnow.yml after each push to cloudflare-deploy.
//
// Usage: node scripts/indexnow.mjs [--dry-run] [--legacy] [--sitemap <url> | --sitemap-file <path>] …  (--help)
//   node scripts/indexnow.mjs                                          submit https://www.word-by-word.app/sitemap.xml
//   node scripts/indexnow.mjs --legacy                                 … plus sitemap-legacy.xml (must exist)
//   node scripts/indexnow.mjs --dry-run --sitemap-file dist/sitemap.xml   offline: print the payload, send nothing
//
// Key: SITE.indexNowKey (src/site.mjs); null → notice, exit 0. A real run first checks that production serves the key
// file <SITE.url>/<key>.txt; while www is still on GitHub Pages (before the T0 DNS cutover) it skips with exit 0.
// Exit codes: 0 = submitted (HTTP 200/202) or nothing to do · 1 = failure · 2 = bad usage.

import { appendFileSync, existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { SITE } from '../src/site.mjs';

export const ENDPOINT = 'https://api.indexnow.org/indexnow';
export const MAX_URLS = 10_000;                 // protocol limit per POST
const KEY_RE = /^[A-Za-z0-9-]{8,128}$/;         // protocol key format
const TIMEOUT_MS = 30_000;
const UA = `wordbyword-web-indexnow (+${SITE.url}/)`;

const GHA = process.env.GITHUB_ACTIONS === 'true';
const log = (msg) => console.log(msg);
const notice = (msg) => console.log(GHA ? `::notice::${msg}` : `notice: ${msg}`);
const warning = (msg) => console.warn(GHA ? `::warning::${msg}` : `warning: ${msg}`);
const failure = (msg) => console.error(GHA ? `::error::${msg}` : `error: ${msg}`);
const summary = (...lines) => {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['### IndexNow', ...lines, ''].join('\n'));
};

const USAGE = `Usage: node scripts/indexnow.mjs [options]
  --sitemap <url>               sitemap to submit (default ${SITE.url}/sitemap.xml)
  --sitemap-file <path>         read the sitemap from a local file instead (offline, e.g. dist/sitemap.xml)
  --legacy                      also submit every URL of sitemap-legacy.xml (T0 first push; the file must exist)
  --legacy-sitemap <url>        legacy sitemap URL (default: sitemap-legacy.xml next to the sitemap)
  --legacy-sitemap-file <path>  local legacy sitemap (implies --legacy)
  --endpoint <url>              IndexNow endpoint (default ${ENDPOINT})
  --batch-size <n>              URLs per POST, 1–${MAX_URLS} (default ${MAX_URLS})
  --dry-run                     print what would be sent; no POST, and no network at all with *-file sources
  -h, --help`;

// IndexNow response codes (indexnow.org/documentation).
const MEANING = {
  200: 'OK, URLs submitted',
  202: 'Accepted, key validation pending',
  400: 'Bad Request, invalid format',
  403: 'Forbidden, key not valid (key file missing or not containing the key)',
  422: 'Unprocessable Entity, URLs not on the host or key not matching the protocol schema',
  429: 'Too Many Requests, potential spam: retry later',
};

// ———————————————————————————— helpers (exported for tests) ————————————————————————————

const decodeXml = (s) => s.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (_, e) => {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[e.toLowerCase()];
  if (named) return named;
  return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
});

// <urlset> sitemap → [loc]. <image:loc> and xhtml:link alternates are ignored (alternates are listed as <loc> anyway).
export function parseSitemap(xml, label = 'sitemap') {
  if (/<sitemapindex[\s>]/.test(xml)) throw new Error(`${label}: sitemap index files are not supported`);
  if (!/<urlset[\s>]/.test(xml)) throw new Error(`${label}: not a sitemap (no <urlset>)`);
  const locs = [...xml.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((m) => decodeXml(m[1]));
  if (!locs.length) throw new Error(`${label}: no <loc> entries`);
  return locs;
}

// Keep absolute http(s) URLs on `host` (IndexNow rejects the whole POST with 422 otherwise); dedupe, keep order.
export function selectUrls(urls, host) {
  const seen = new Set();
  const list = [], dropped = [];
  for (const raw of urls) {
    let u;
    try { u = new URL(raw); } catch { dropped.push({ url: raw, why: 'not an absolute URL' }); continue; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') { dropped.push({ url: raw, why: `scheme ${u.protocol}` }); continue; }
    if (u.host !== host) { dropped.push({ url: raw, why: `host is not ${host}` }); continue; }
    if (!seen.has(u.href)) { seen.add(u.href); list.push(u.href); }
  }
  return { list, dropped };
}

// {kind:'file'|'url', ref} → { text, server } | { missing: true, why }. Throws on other HTTP errors.
export async function readSource(src) {
  if (src.kind === 'file') {
    return existsSync(src.ref) ? { text: readFileSync(src.ref, 'utf8'), server: null } : { missing: true, why: 'file not found' };
  }
  const res = await fetch(src.ref, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  const text = await res.text();
  const server = res.headers.get('server');
  if (res.status === 404 || res.status === 410) return { missing: true, why: `HTTP ${res.status}`, server };
  if (!res.ok) throw new Error(`GET ${src.ref} → HTTP ${res.status}`);
  return { text, server };
}

// The key file must be served at keyLocation with the key as its content, otherwise IndexNow answers 403.
export async function checkKeyFile(keyLocation, key) {
  let res;
  try {
    res = await fetch(keyLocation, { headers: { 'user-agent': UA }, redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    return { ok: false, reachable: false, server: '', detail: `request failed (${e.cause?.message ?? e.message})` };
  }
  const body = await res.text();
  const server = res.headers.get('server') ?? '';
  if (res.status !== 200) {
    const to = res.headers.get('location');
    return { ok: false, reachable: true, server, detail: `HTTP ${res.status}${to ? ` → ${to}` : ''}` };
  }
  if (body.trim() !== key) return { ok: false, reachable: true, server, detail: 'HTTP 200 but the body is not the key' };
  return { ok: true, reachable: true, server, detail: 'HTTP 200, key matches' };
}

// One POST; a network error or 5xx is retried once.
export async function submitBatch(endpoint, payload, { attempts = 2, retryDelayMs = 5_000 } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res, body;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8', 'user-agent': UA },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      body = (await res.text()).trim().slice(0, 500);
    } catch (e) {
      if (attempt < attempts) { await sleep(retryDelayMs); continue; }
      return { ok: false, status: 0, meaning: `network error (${e.cause?.message ?? e.message})`, body: '' };
    }
    if (res.status >= 500 && attempt < attempts) { await sleep(retryDelayMs); continue; }
    return { ok: res.status === 200 || res.status === 202, status: res.status, meaning: MEANING[res.status] ?? 'unexpected response', body };
  }
}

const isHttpUrl = (s, { loopbackHttp = false } = {}) => {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || (u.protocol === 'http:' && (!loopbackHttp || ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)));
  } catch { return false; }
};

// ———————————————————————————— main ————————————————————————————

export async function main(argv = process.argv.slice(2)) {
  let opt;
  try {
    ({ values: opt } = parseArgs({
      args: argv, strict: true, allowPositionals: false,
      options: {
        'dry-run': { type: 'boolean', default: false },
        legacy: { type: 'boolean', default: false },
        sitemap: { type: 'string' },
        'sitemap-file': { type: 'string' },
        'legacy-sitemap': { type: 'string' },
        'legacy-sitemap-file': { type: 'string' },
        endpoint: { type: 'string', default: ENDPOINT },
        'batch-size': { type: 'string', default: String(MAX_URLS) },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (e) {
    failure(e.message); console.error(USAGE); return 2;
  }
  if (opt.help) { log(USAGE); return 0; }
  const usage = (msg) => { failure(msg); console.error(USAGE); return 2; };
  if (opt.sitemap && opt['sitemap-file']) return usage('use either --sitemap or --sitemap-file');
  if (opt['legacy-sitemap'] && opt['legacy-sitemap-file']) return usage('use either --legacy-sitemap or --legacy-sitemap-file');
  for (const f of ['sitemap', 'legacy-sitemap']) if (opt[f] && !isHttpUrl(opt[f])) return usage(`--${f} must be an http(s) URL`);
  if (!isHttpUrl(opt.endpoint, { loopbackHttp: true })) return usage('--endpoint must be an https URL');
  const batchSize = Number(opt['batch-size']);
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_URLS) return usage(`--batch-size must be 1–${MAX_URLS}`);
  const dry = opt['dry-run'];
  const legacy = opt.legacy || Boolean(opt['legacy-sitemap'] || opt['legacy-sitemap-file']);

  // 1) Key (single source: SITE.indexNowKey; the build publishes it as /<key>.txt, doc 06 §3.4).
  const key = SITE.indexNowKey || null;
  if (!key) {
    notice('SITE.indexNowKey is not set in src/site.mjs: IndexNow is not configured, nothing to submit (doc 03 §6.3).');
    if (!dry) { summary('- skipped: `SITE.indexNowKey` is not set'); return 0; }
    log('dry run: continuing with a placeholder key to show the payload.');
  } else if (!KEY_RE.test(key)) {
    failure(`SITE.indexNowKey is not a valid IndexNow key (8–128 characters from a-z A-Z 0-9 -): "${key}"`);
    return 1;
  }
  const host = new URL(SITE.url).host;
  const keyLocation = `${SITE.url}/${key ?? '<key>'}.txt`;

  // 2) Sources: the production sitemap (or an override), plus the legacy sitemap next to it when --legacy.
  const primary = opt['sitemap-file'] ? { kind: 'file', ref: opt['sitemap-file'] }
    : { kind: 'url', ref: opt.sitemap ?? `${SITE.url}/sitemap.xml` };
  const legacySrc = !legacy ? null
    : opt['legacy-sitemap-file'] ? { kind: 'file', ref: opt['legacy-sitemap-file'] }
    : opt['legacy-sitemap'] ? { kind: 'url', ref: opt['legacy-sitemap'] }
    : primary.kind === 'file' ? { kind: 'file', ref: join(dirname(primary.ref), 'sitemap-legacy.xml') }
    : { kind: 'url', ref: new URL('sitemap-legacy.xml', primary.ref).href };

  try {
    // 3) A real run needs the key file live on production. Not served by Cloudflare yet = before T0: skip quietly.
    if (dry) {
      log(`dry run: a real run first checks that ${keyLocation} serves the key`);
    } else {
      const k = await checkKeyFile(keyLocation, key);
      if (!k.ok && k.reachable && !/cloudflare/i.test(k.server)) {
        notice(`${keyLocation}: ${k.detail}, served by "${k.server || 'unknown'}" rather than Cloudflare Pages. www has not been cut over yet (T0, doc 06 §10.2), skipping.`);
        summary(`- skipped: production is not on Cloudflare Pages yet (\`${keyLocation}\` → ${k.detail}, server \`${k.server || 'unknown'}\`)`);
        return 0;
      }
      if (!k.ok) {
        failure(`${keyLocation}: ${k.detail}.${k.reachable ? ' Production must serve the key file (SITE.indexNowKey → dist/<key>.txt) before IndexNow can verify it.' : ''}`);
        summary(`- **failed**: key file \`${keyLocation}\` → ${k.detail}`);
        return 1;
      }
      log(`key file ok: ${keyLocation} (${k.detail}, server ${k.server || 'unknown'})`);
    }

    // 4) Collect URLs.
    const read = async (src, label) => {
      const r = await readSource(src);
      if (r.missing) return r;
      const urls = parseSitemap(r.text, src.ref);
      log(`${label}: ${src.ref} → ${urls.length} URL(s)${r.server ? ` (server ${r.server})` : ''}`);
      if (src.kind === 'url' && r.server && !/cloudflare/i.test(r.server))
        warning(`${src.ref} is served by "${r.server}", not Cloudflare Pages: this is not the new site's sitemap yet.`);
      return { urls };
    };
    const m = await read(primary, 'sitemap');
    if (m.missing) { failure(`sitemap not found: ${primary.ref} (${m.why})`); return 1; }
    let legacyUrls = [];
    if (legacySrc) {
      const l = await read(legacySrc, 'legacy sitemap');
      if (l.missing) {
        failure(`--legacy: ${legacySrc.ref} not found (${l.why}). Release with SITE.legacySitemap = true first (doc 06 §10.2 step 12).`);
        return 1;
      }
      legacyUrls = l.urls;
    }
    const { list, dropped } = selectUrls([...m.urls, ...legacyUrls], host);
    for (const d of dropped) warning(`not submitted: ${d.url} (${d.why})`);
    if (!list.length) { failure(`no URL on ${host} to submit`); return 1; }

    // 5) Submit (one POST unless the list exceeds the batch size).
    const batches = [];
    for (let i = 0; i < list.length; i += batchSize) batches.push(list.slice(i, i + batchSize));
    log(`IndexNow: ${list.length} URL(s) on ${host} in ${batches.length} POST(s) → ${opt.endpoint}${dry ? ' (dry run)' : ''}`);
    const results = [];
    for (const [i, urlList] of batches.entries()) {
      const payload = { host, key: key ?? '<SITE.indexNowKey>', keyLocation, urlList };
      const tag = `POST ${i + 1}/${batches.length} (${urlList.length} URL${urlList.length === 1 ? '' : 's'})`;
      if (dry) { log(`dry run: would ${tag} to ${opt.endpoint}:`); log(JSON.stringify(payload, null, 2)); continue; }
      const r = await submitBatch(opt.endpoint, payload);
      results.push(`- ${tag}: HTTP ${r.status} ${r.meaning}`);
      if (!r.ok) {
        failure(`${tag}: HTTP ${r.status} ${r.meaning}${r.body ? `: ${r.body}` : ''}`);
        summary(`- endpoint: ${opt.endpoint}`, ...results);
        return 1;
      }
      log(`${tag}: HTTP ${r.status} ${r.meaning}`);
    }
    if (!dry) summary(`- endpoint: ${opt.endpoint}`, `- URLs: ${list.length} (sitemap ${m.urls.length}${legacySrc ? `, legacy ${legacyUrls.length}` : ''})`, ...results);
    return 0;
  } catch (e) {
    failure(e.cause ? `${e.message} (${e.cause.message ?? e.cause})` : e.message);
    return 1;
  }
}

const invokedDirectly = (() => {
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();
if (invokedDirectly) process.exitCode = await main();
