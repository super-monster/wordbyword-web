// Dump ICU (Chrome-equivalent) Thai word segmentation of every copy leaf, to review mis-segmentations.
import { readFileSync } from 'node:fs';
const t = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const seg = new Intl.Segmenter('th', { granularity: 'word' });
const walk = (o, p = '') => {
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${p}[${o[i]?.id ?? i}]`));
  if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => walk(v, p ? `${p}.${k}` : k));
  if (typeof o !== 'string' || !/[฀-๿]/.test(o)) return;
  if (p.startsWith('seo.')) return;
  const d = o.replace(/\[\[|\]\]/g, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\(@[a-z-]+\)/g, '$1');
  const out = [...seg.segment(d)].map((x) => x.segment).join('|').replace(/\|? \|?/g, ' ').replace(/⁠/g, '~');
  console.log(`${p}\n   ${out}`);
};
walk(t);
