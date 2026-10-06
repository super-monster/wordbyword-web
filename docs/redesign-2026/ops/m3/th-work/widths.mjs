// Page overflow, pricing-table overflow and header overlap across 21 widths (as the lead checked in 54afac8).
import { openChrome } from '../cdp.mjs';
const url = process.argv[2];
const c = await openChrome();
await c.send('Network.enable');
await c.send('Network.setBlockedURLs', { urls: ['https://*'] });
const out = [];
for (const w of [320, 340, 360, 375, 390, 400, 414, 430, 480, 520, 560, 600, 640, 700, 768, 820, 900, 1024, 1180, 1280, 1440]) {
  await c.goto(url, w, 800);
  await c.sleep(200);
  out.push(await c.evaluate(`(() => {
    const wrap = document.querySelector('.table-wrap');
    const hdr = [...document.querySelectorAll('.header-inner > *')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect());
    let overlap = false;
    for (let i = 0; i < hdr.length; i++) for (let j = i + 1; j < hdr.length; j++) { const a = hdr[i], b = hdr[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlap = true; }
    return { w: innerWidth, page: document.documentElement.scrollWidth - innerWidth, table: wrap.scrollWidth - wrap.clientWidth, overlap, h: document.documentElement.scrollHeight };
  })()`));
}
c.close();
console.log(out.map((r) => `${r.w}: page +${r.page} table +${r.table}${r.overlap ? ' HEADER OVERLAP' : ''} h${r.h}`).join('\n'));
