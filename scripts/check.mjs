#!/usr/bin/env node
// Checks on an already built dist/ (doc 06 §11.1–11.2). Zero dependencies, Node ≥ 22.
//
//   node scripts/check.mjs               D-1…D-24 (validateDist) + HTML basics: doctype, <html lang>, nested <a>,
//                                        <details>/<summary> structure (ids and <img> attributes are D-5 / D-6)
//   node scripts/check.mjs --keys [code] keys each locale is missing / has extra vs en.json — the translation hand-off
//                                        list for `npm run check:keys` (doc 06 §4.4); always exits 0
//   node scripts/check.mjs --external    HEAD (then GET) every external link with a timeout; 2xx/3xx pass, 4xx/5xx
//                                        fail. Third-party status flaps, so this is never part of CI (doc 06 §11.1)
//
// Options: --dist DIR (default dist/), --timeout MS (default 10000), --concurrency N (default 6).

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig, loadStrings, expandRoutes } from '../src/lib/context.mjs';
import { parseHTML, elements, closest } from '../src/lib/dom.mjs';
import { shape, keyMatchAny } from '../src/lib/keypath.mjs';
import { validateDist, listFiles } from '../src/lib/validate-dist.mjs';
import { PAGE_KEY_ROOT } from '../src/lib/validate-util.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); const v = i >= 0 ? args[i + 1] : args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1); return v ?? dflt; };
const DIST = resolve(opt('--dist', join(ROOT, 'dist')));

const cfg = loadConfig(ROOT);
const { strings } = loadStrings(cfg);

if (args.includes('--keys')) process.exit(keys());
if (args.includes('--external')) process.exit(await external());
process.exit(check());

// ———————————————————————————— default: validateDist + HTML basics ————————————————————————————

function check() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error(`error  ${DIST} has no index.html — run \`node build.mjs\` first`);
    return 1;
  }
  const issues = { error: [], warn: [] };
  validateDist(DIST, { cfg, routes: expandRoutes(cfg), strings }, issues);
  const files = listFiles(DIST).filter((f) => f.endsWith('.html'));
  for (const f of files) {
    const html = readFileSync(join(DIST, f), 'utf8');
    const E = (m) => issues.error.push(`HTML ${f}: ${m}`);
    if (!/^<!doctype html>/i.test(html.trimStart())) E('missing <!doctype html>');
    const doc = parseHTML(html);
    const els = [...elements(doc)];
    const root = els.find((e) => e.tag === 'html');
    if (!root?.attrs.lang) E('<html> without lang');
    for (const a of els.filter((e) => e.tag === 'a')) if (closest(a.parent, (p) => p.tag === 'a')) E(`nested <a> (${a.attrs.href ?? ''})`);
    for (const d of els.filter((e) => e.tag === 'details')) {
      const first = d.children.find((c) => c.type === 'el');
      if (first?.tag !== 'summary') E('<details> whose first child is not <summary>');
    }
    for (const s of els.filter((e) => e.tag === 'summary')) if (s.parent?.tag !== 'details') E('<summary> outside <details>');
    for (const t of ['title', 'main']) { const n = els.filter((e) => e.tag === t).length; if (n !== 1) E(`${n} <${t}> elements, expected 1`); }
  }
  for (const w of issues.warn) console.warn(`warn   ${w}`);
  for (const e of issues.error) console.error(`error  ${e}`);
  console.log(`${issues.error.length ? '✗' : '✓'} check: ${files.length} HTML files in ${DIST} — ${issues.error.length} errors, ${issues.warn.length} warnings`);
  return issues.error.length ? 1 : 0;
}

// ———————————————————————————— --keys ————————————————————————————

function keys() {
  const en = strings.en;
  if (!en) { console.error('src/locales/en.json missing'); return 0; }
  const only = args[args.indexOf('--keys') + 1];
  const enShape = shape(en);
  const leafKinds = (sh) => [...sh].filter(([, i]) => !['object', 'array:id', 'array:object'].includes(i.kind)).map(([p]) => p);
  const enLeaves = leafKinds(enShape);
  const optional = ['nav.downloadShort', 'hero.ledeShort', 'demo.byline', 'demo.lookup', 'features[*].note', 'features[*].sample.name',
    'gallery.items[*].hidden', 'faq.items[*].hidden', 'faq.items[*].aExtLive'];
  const pageRoots = {};
  for (const p of cfg.PAGES) if (PAGE_KEY_ROOT[p.id] && p.locales !== '*') pageRoots[PAGE_KEY_ROOT[p.id]] = p.locales;
  const under = (r, p) => p === r || p.startsWith(`${r}.`) || p.startsWith(`${r}[`);
  for (const l of cfg.LOCALES) {
    if (l.code === 'en' || (only && !only.startsWith('--') && l.code !== only)) continue;
    // keys this locale must provide: every en key except page roots it does not render
    const wanted = enLeaves.filter((p) => !Object.entries(pageRoots).some(([r, locs]) => under(r, p) && !locs.includes(l.code)));
    const t = strings[l.code];
    if (!t) {
      console.log(`\n${l.code}  (no src/locales/${l.code}.json — publish:false) — ${wanted.length} keys to translate, starting from en.json`);
      continue;
    }
    const mine = shape(t);
    const missing = wanted.filter((p) => !mine.has(p) && !keyMatchAny(optional, p));
    const placementOnly = ['sibling.availability', 'sibling.card.uiNote']; // L-3: only some locales need these
    const extra = leafKinds(mine).filter((p) => !enShape.has(p) && !placementOnly.includes(p));
    console.log(`\n${l.code}  ${l.publish ? 'published' : 'not published'} — ${missing.length} missing, ${extra.length} not in en`);
    for (const p of missing) console.log(`  - ${p}`);
    for (const p of extra) console.log(`  + ${p}`);
  }
  return 0;
}

// ———————————————————————————— --external ————————————————————————————

async function external() {
  if (!existsSync(DIST)) { console.error(`error  ${DIST} missing — run \`node build.mjs\` first`); return 1; }
  const timeout = Number(opt('--timeout', 10000));
  const concurrency = Math.max(1, Number(opt('--concurrency', 6)));
  const urls = new Map(); // url → Set(pages)
  for (const f of listFiles(DIST).filter((x) => x.endsWith('.html'))) {
    for (const e of elements(parseHTML(readFileSync(join(DIST, f), 'utf8')))) {
      if (e.tag === 'link' && /\b(canonical|alternate)\b/.test(e.attrs.rel ?? '')) continue;
      for (const a of ['href', 'src']) {
        const u = e.attrs[a];
        if (!u || !/^https?:\/\//i.test(u) || u.startsWith(cfg.SITE.url)) continue;
        if (!urls.has(u)) urls.set(u, new Set());
        urls.get(u).add(f);
      }
    }
  }
  const list = [...urls.keys()].sort();
  const failures = [];
  let redirected = 0;
  const probe = async (u) => {
    for (const method of ['HEAD', 'GET']) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), timeout);
      try {
        const res = await fetch(u, { method, redirect: 'follow', signal: ac.signal, headers: { 'user-agent': 'wordbyword-web link check (+https://www.word-by-word.app)' } });
        res.body?.cancel?.();
        if (method === 'HEAD' && [403, 404, 405, 501].includes(res.status)) continue; // some hosts reject HEAD
        if (res.redirected) redirected++;
        return res.status < 400 ? null : `${res.status} ${res.statusText}`;
      } catch (e) {
        if (method === 'GET') return e.name === 'AbortError' ? `timeout after ${timeout} ms` : e.message;
      } finally { clearTimeout(timer); }
    }
    return 'no response';
  };
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const u = list[next++];
      const problem = await probe(u);
      if (problem) failures.push({ u, problem });
      console.log(`${problem ? '✗' : '✓'} ${u}${problem ? `  — ${problem}` : ''}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, worker));
  for (const { u, problem } of failures) console.error(`error  EXT ${u}: ${problem} (linked from ${[...urls.get(u)].join(', ')})`);
  console.log(`${failures.length ? '✗' : '✓'} ${list.length} external URLs, ${failures.length} failing, ${redirected} followed a redirect`);
  return failures.length ? 1 : 0;
}
