// Enumerate Chrome's line-break opportunities for Thai strings: each string is laid out in a 1px-wide block
// (overflow-wrap: normal, word-break: normal), so every rendered line is one unbreakable segment.
// Usage: node breaks.mjs strings.json   (array of strings; U+2060 may be written as ⁠ in the output)
import { readFileSync } from 'node:fs';
import { openChrome } from '../cdp.mjs';

const list = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const font = process.argv[3] ?? '-apple-system, BlinkMacSystemFont, Thonburi, "Leelawadee UI", "Noto Sans Thai", sans-serif';
const c = await openChrome();
const html = `<!doctype html><html lang="th"><meta charset="utf-8"><body style="margin:0;font:400 20px/1.5 ${font.replace(/"/g, '&quot;')}"></body></html>`;
await c.goto('data:text/html;charset=utf-8,' + encodeURIComponent(html), 800, 600);
const res = await c.evaluate(`(() => {
  const list = ${JSON.stringify(list)};
  const out = [];
  for (const s of list) {
    const d = document.createElement('div');
    d.style.cssText = 'width:1px;overflow-wrap:normal;word-break:normal;white-space:normal;';
    d.textContent = s;
    document.body.appendChild(d);
    const n = d.firstChild, segs = [];
    let cur = '', lastTop = null;
    for (let i = 0; i < s.length; i++) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
      const rs = r.getClientRects();
      const top = rs.length ? Math.round(rs[0].top) : lastTop;
      if (lastTop !== null && top !== null && Math.abs(top - lastTop) > 4) { segs.push(cur); cur = ''; }
      cur += s[i]; if (top !== null) lastTop = top;
    }
    segs.push(cur);
    out.push(segs.map((x) => x.replace(/\\u2060/g, '~').trim()).join(' | '));
    d.remove();
  }
  return out;
})()`);
c.close();
for (let i = 0; i < list.length; i++) console.log(res[i]);
