// Pricing table fit at narrow widths: does .table-wrap need to scroll? Tries per-day label variants in the live DOM.
// Usage: node table-fit.mjs <url>
import { openChrome } from '../cdp.mjs';
const url = process.argv[2];
const c = await openChrome();
await c.send('Network.enable');
await c.send('Network.setBlockedURLs', { urls: ['https://*'] });
const variants = [
  ['current', null],
  ['{n} ครั้ง/วัน', (n) => `${n} ครั้ง/วัน`],
  ['{n}/วัน', (n) => `${n}/วัน`],
  ['{n} ครั้ง', (n) => `${n} ครั้ง`],
];
for (const w of [320, 360, 375, 390, 414, 560, 768]) {
  await c.goto(url, w, 800);
  await c.sleep(300);
  const r = await c.evaluate(`(() => {
    const wrap = document.querySelector('.table-wrap');
    const vals = [...document.querySelectorAll('.quota .q-val')];
    const orig = vals.map((v) => v.textContent);
    const out = {};
    const variants = ${JSON.stringify(variants.map(([k]) => k))};
    for (const k of variants) {
      vals.forEach((v, i) => { const n = orig[i].match(/\\d+/)?.[0] ?? ''; v.textContent = k === 'current' ? orig[i] : k.replace('{n}', n); });
      out[k] = { scroll: wrap.scrollWidth, client: wrap.clientWidth, over: wrap.scrollWidth - wrap.clientWidth,
        col1: Math.round(document.querySelector('.quota tbody th[scope=row]').getBoundingClientRect().width),
        tableH: Math.round(document.querySelector('.quota').getBoundingClientRect().height) };
    }
    vals.forEach((v, i) => { v.textContent = orig[i]; });
    return out;
  })()`);
  console.log(`${w}px: ` + Object.entries(r).map(([k, v]) => `${k}: over ${v.over}px (col1 ${v.col1}, table h ${v.tableH})`).join(' | '));
}
c.close();
