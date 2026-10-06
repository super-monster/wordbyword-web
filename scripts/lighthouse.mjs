#!/usr/bin/env node
// Lighthouse gate (doc 06 §11.2, R19; doc 07 M4-02): assert the mobile lab thresholds on saved Lighthouse JSON reports.
//   Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100; LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms.
// Usage:
//   npx --yes lighthouse <url> --output=json --output-path=<file> --chrome-flags="--headless=new"   (mobile is the default)
//   node scripts/lighthouse.mjs [--preview] <report.json> [...]
//   --preview  the audited URL is a preview host: its X-Robots-Tag: noindex fails the is-crawlable audit by design
//              (doc 02 §6.8), so SEO is judged on the other audits only.
// Lab scores vary between runs (network, CPU load, a cold CDN edge): a page that fails once is run again before it
// counts as a failure; report the median of three runs (doc 07 M4-02).
// Exit status 1 when any report misses a threshold, 2 on usage errors.

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const preview = args.includes('--preview');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('usage: node scripts/lighthouse.mjs [--preview] <report.json> [...]');
  process.exit(2);
}

const MIN = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 100 };
const MAX = { 'largest-contentful-paint': 2500, 'cumulative-layout-shift': 0.05, 'total-blocking-time': 200 };

// SEO without is-crawlable: the weighted mean of the remaining scored audits, as Lighthouse computes a category.
function seoScore(lhr) {
  const refs = lhr.categories.seo.auditRefs.filter((r) => r.weight > 0 && !(preview && r.id === 'is-crawlable'));
  let sum = 0, weight = 0;
  for (const r of refs) {
    const a = lhr.audits[r.id];
    if (!a || a.score === null) continue;
    sum += a.score * r.weight;
    weight += r.weight;
  }
  return weight ? Math.round((sum / weight) * 100) : null;
}

let failed = 0;
for (const file of files) {
  let lhr;
  try { lhr = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error(`${file}: ${e.message}`); process.exit(2); }
  const misses = [];
  for (const [id, min] of Object.entries(MIN)) {
    const cat = lhr.categories[id];
    if (!cat) continue; // the run left this category out (--only-categories)
    const score = id === 'seo' ? seoScore(lhr) : Math.round(cat.score * 100);
    if (score < min) misses.push(`${id} ${score} < ${min}`);
  }
  for (const [id, max] of Object.entries(MAX)) {
    const v = lhr.audits[id]?.numericValue;
    if (v !== undefined && v > max) misses.push(`${id} ${lhr.audits[id].displayValue} > ${id === 'cumulative-layout-shift' ? max : `${max} ms`}`);
  }
  const s = (id) => (lhr.categories[id] ? (id === 'seo' ? seoScore(lhr) : Math.round(lhr.categories[id].score * 100)) : '–');
  const line = `P ${s('performance')} A ${s('accessibility')} BP ${s('best-practices')} SEO ${s('seo')}${preview ? '*' : ''}`
    + ` · LCP ${lhr.audits['largest-contentful-paint']?.displayValue} CLS ${lhr.audits['cumulative-layout-shift']?.displayValue}`
    + ` TBT ${lhr.audits['total-blocking-time']?.displayValue}`;
  if (misses.length) failed++;
  console.log(`${misses.length ? '✗' : '✓'} ${lhr.finalDisplayedUrl ?? lhr.requestedUrl}  ${line}${misses.length ? `  — ${misses.join('; ')}` : ''}`);
}
if (preview) console.log('* SEO without is-crawlable (preview hosts carry noindex by design)');
process.exit(failed ? 1 : 0);
