// Measure rendered lengths of the th copy against doc 08 §7.6 / doc 03 §3.1 limits (and L-8).
// Usage: node measure.mjs <repo-copy-root> [code]
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] ?? '.');
const code = process.argv[3] ?? "th";
const imp = (p) => import(pathToFileURL(resolve(root, p)).href);
const { loadConfig, loadStrings } = await imp('src/lib/context.mjs');
const { makeVars, rendered } = await imp('src/lib/validate-util.mjs');
const { textLength, wu } = await imp('src/lib/text-length.mjs');
const { getPath, leaves } = await imp('src/lib/keypath.mjs');

const cfg = loadConfig(root);
const { strings } = loadStrings(cfg);
const l = cfg.LOCALES.find((x) => x.code === code);
const t = strings[code];
const vars = makeVars(cfg, l, t);
const R = (s) => rendered(s, vars, code);
const n = (s) => textLength(R(s), l.script);

const checks = [
  ['meta.title', 60], ['meta.description', [120, 160]], ['hero.title', 75], ['hero.eyebrow', 60, 'wu'], ['hero.lede', 150],
  ['hero.ledeShort', 90], ['hero.ctaNote', 40, 'wu'], ['hero.how', 180, 'wu'], ['hero.platformNote', 140, 'wu'], ['hero.secondaryCta', 24],
  ['featuresIntro.title', null], ['languages.title', 70, 'wu'], ['cta.title', 70, 'wu'], ['cta.recap', 90], ['pricing.summary', 100, 'wu'],
  ['sibling.card.title', 60], ['sibling.card.linkText', 80], ['sibling.card.appStoreLinkText', 60], ['sibling.card.uiNote', null], ['sibling.card.note', null],
  ['nav.downloadShort', 10, 'wu'], ['demo.articleTitle', 60], ['demo.byline', 40], ['meta.ogHeadline', null], ['meta.ogSubline', null],
  ['features[x].sample.translation', 120], ['features[x].sample.name', 24, 'wu'], ['features[x].sample.time', 8, 'wu'],
];
const out = [];
for (const [k, lim, unit] of checks) {
  const v = getPath(t, k);
  if (typeof v !== 'string') { out.push(`${k}: (missing)`); continue; }
  const len = unit === 'wu' ? wu(R(v)) : n(v);
  const ok = lim === null ? '' : Array.isArray(lim) ? (len >= lim[0] && len <= lim[1] ? 'ok' : 'OUT') : (len <= lim ? 'ok' : 'OVER');
  out.push(`${k}: ${len}${unit === 'wu' ? 'wu' : ''}${lim === null ? '' : ` / ${Array.isArray(lim) ? lim.join('–') : lim} ${ok}`}  «${R(v)}»`);
}
// features
for (const f of t.features) {
  out.push(`features[${f.id}].kicker: ${wu(R(f.kicker))}wu / 24 ${wu(R(f.kicker)) <= 24 ? 'ok' : 'OVER'}`);
  out.push(`features[${f.id}].title: ${wu(R(f.title))}wu / 70 ${wu(R(f.title)) <= 70 ? 'ok' : 'OVER'}`);
  const lim = ['engines', 'display', 'history', 'devices'].includes(f.id) ? 80 : 320;
  out.push(`features[${f.id}].text: ${n(f.text)} / ${lim} ${n(f.text) <= lim ? 'ok' : 'OVER'}${lim === 80 ? `  «${R(f.text)}»` : ''}`);
  for (const [i, b] of (f.bullets ?? []).entries()) out.push(`features[${f.id}].bullets[${i}]: ${wu(R(b))}wu / 80 ${wu(R(b)) <= 80 ? 'ok' : 'OVER'}`);
}
for (const [i, p] of t.sibling.card.points.entries()) out.push(`sibling.card.points[${i}]: ${wu(R(p))}wu / 45 ${wu(R(p)) <= 45 ? 'ok' : 'OVER'}  «${R(p)}»`);
out.push(`sibling.card.body words: ${R(t.sibling.card.body).trim().split(/\s+/).length} / 45`);
out.push(`demo.translation total: ${t.demo.translation.reduce((a, s) => a + n(s), 0)} / 180`);
for (const q of t.faq.items) {
  out.push(`faq[${q.id}].q: ${n(q.q)} / 120;  a: ${n(q.a)} / 600${q.aExtLive ? `;  aExtLive: ${n(q.aExtLive)}` : ''}`);
}
// alts
for (const { path, value } of leaves(t)) {
  if (typeof value !== 'string') continue;
  const last = path.split('.').pop();
  if (/^(alt|\w*Alt)$/.test(last)) out.push(`ALT ${path}: ${[...new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(R(value))].length} / 125`);
}
for (const [k, v] of Object.entries(t.nav)) out.push(`nav.${k}: ${wu(R(v))}wu / ${k === 'downloadShort' ? 10 : 16}`);
for (const [k, v] of Object.entries(t.common)) out.push(`common.${k}: ${wu(R(v))}wu / ${['figLabel', 'noteLabel'].includes(k) ? 8 : 40}`);
out.push(`footer.ariaNav: ${wu(R(t.footer.ariaNav))}wu / 16`);
console.log(out.join('\n'));
