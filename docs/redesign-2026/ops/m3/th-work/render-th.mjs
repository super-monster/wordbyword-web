// Thai rendering check (wave 2 notes + doc 08 §7.7): horizontal overflow, SE card height, page height, red bar,
// and the rendered LINES of every heading-like element, so breaks inside Thai words can be reviewed.
// Usage: node render-th.mjs <base-url> [path=/th/] [shotsDir] [--only-lines] [--widths 320,375,390]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openChrome } from '../cdp.mjs';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const pos = args.filter((a) => !a.startsWith('--'));
const [base, path = '/th/', shots] = pos;
const wArg = flags.find((f) => f.startsWith('--widths='));
const H = { 1280: 900, 390: 844, 375: 812, 320: 700 };
const widths = wArg ? wArg.slice(9).split(',').map(Number) : [1280, 390, 375, 320];
const c = await openChrome();
await c.send('Network.enable');
await c.send('Network.setBlockedURLs', { urls: ['https://*', 'http://*.com/*', 'http://*.app/*'] });
const out = [];
for (const w of widths) {
  const h = H[w] ?? 900;
  await c.goto(base + path, w, h);
  await c.sleep(500);
  const r = await c.evaluate(`(() => {
    const vw = innerWidth;
    const wider = [];
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { clipped = true; break; } p = p.parentElement; }
      if (!clipped && (b.right > vw + 0.5 || b.left < -0.5)) wider.push(el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\\s+/).join('.') + ' [' + Math.round(b.left) + '→' + Math.round(b.right) + ']');
    }
    // rendered lines of an element: group characters by the top of their client rect
    const linesOf = (el) => {
      if (!el || !el.getClientRects().length) return null;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return null;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const chars = [];
      let n;
      while ((n = walker.nextNode())) {
        const t = n.nodeValue;
        for (let i = 0; i < t.length; i++) {
          const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
          const rs = rg.getClientRects();
          if (!rs.length) { chars.push({ ch: t[i], top: null }); continue; }
          chars.push({ ch: t[i], top: Math.round(rs[0].top), bottom: Math.round(rs[0].bottom) });
        }
      }
      const lines = []; let cur = null, lastTop = null;
      for (const x of chars) {
        if (x.top === null) { if (cur !== null) cur += x.ch; continue; }
        if (lastTop === null || Math.abs(x.top - lastTop) > 4) { if (cur !== null) lines.push(cur); cur = x.ch; lastTop = x.top; }
        else cur += x.ch;
      }
      if (cur !== null) lines.push(cur);
      return lines.map((s) => s.replace(/\\u2060/g, '⁠'));
    };
    const sel = [
      ['eyebrow', '.hero .eyebrow'], ['H1', '#hero-h'], ['lede', '.hero-lede'], ['ctaNote', '.hero-cta-note'],
      ['how', '.hero-how'], ['platform', '.platform-note'], ['secCta', '.hero .link-arrow'],
      ['featuresH2', '#features-h'], ['f-swipe', '#f-swipe'], ['f-lookup', '#f-lookup'], ['f-x', '#f-x'], ['f-chunks', '#f-chunks'],
      ['f-speech', '#f-speech'], ['f-syntax', '#f-syntax'], ['galleryH2', '#gallery-h'], ['languagesH2', '#languages-h'],
      ['targetsH3', '#targets-h'], ['pricingH2', '#pricing-h'], ['seH2', '#se-h'], ['faqH2', '#faq-h'], ['ctaH2', '#cta-h'], ['ctaRecap', '.cta-recap'],
      ['seLink', '.sibling__link'], ['seStore', '.sibling__store'], ['seNote', '.sibling__note'], ['seEyebrow', '.sibling__eyebrow'],
    ];
    const lines = {};
    for (const [k, s] of sel) lines[k] = linesOf(document.querySelector(s));
    document.querySelectorAll('.spec-row h3').forEach((e, i) => { lines['spec' + i] = linesOf(e); });
    document.querySelectorAll('.feature .eyebrow, .m-card .eyebrow').forEach((e, i) => { lines['kicker' + i] = linesOf(e); });
    document.querySelectorAll('.anno-t').forEach((e, i) => { lines['anno' + i] = linesOf(e); });
    document.querySelectorAll('.faq-q').forEach((e, i) => { lines['faq' + i] = linesOf(e); });
    document.querySelectorAll('.quota tbody th[scope=row]').forEach((e, i) => { lines['row' + i] = linesOf(e); });
    document.querySelectorAll('.quota tr.grp th').forEach((e, i) => { lines['grp' + i] = linesOf(e); });
    document.querySelectorAll('.gallery-item figcaption').forEach((e, i) => { lines['gcap' + i] = linesOf(e); });
    document.querySelectorAll('.side-note').forEach((e, i) => { lines['limit' + i] = linesOf(e); });
    document.querySelectorAll('.sibling__points li').forEach((e, i) => { lines['sePoint' + i] = linesOf(e); });
    document.querySelectorAll('.media-cap').forEach((e, i) => { lines['mcap' + i] = linesOf(e); });
    document.querySelectorAll('.spec-fact').forEach((e, i) => { lines['specFact' + i] = linesOf(e); });
    lines.nav = [...document.querySelectorAll('.main-nav a')].map((a) => linesOf(a)?.join(' ⏎ '));
    lines.dl = linesOf(document.querySelector('.site-header .btn'));
    lines.cue = linesOf(document.querySelector('.cue-label'));
    lines.sampleCap = linesOf(document.querySelector('#sample-cap'));
    lines.wbtr = linesOf(document.querySelector('.wb-tr'));
    lines.wbcard = [...document.querySelectorAll('.wb-card p')].map((p) => linesOf(p)?.join(' ⏎ '));
    lines.post = linesOf(document.querySelector('.post-tr'));
    lines.ckgloss = linesOf(document.querySelector('.ck-gloss'));
    const q = (s) => document.querySelector(s);
    const rect = (s) => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height), w: Math.round(b.width) }; };
    const badge = q('.hero .cta-row a'), more = q('.hero .cta-row .link-arrow');
    return {
      vw, scrollW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight,
      wider: wider.slice(0, 15), widerCount: wider.length,
      tableOver: (() => { const w = document.querySelector('.table-wrap'); return w ? w.scrollWidth - w.clientWidth : null; })(), seCard: rect('#surfenglish'), redBarTop: rect('.wb-tr-wrap')?.top, heroH1: rect('#hero-h'),
      ctaRowWrapped: badge && more ? Math.abs(badge.getBoundingClientRect().top - more.getBoundingClientRect().top) > 30 : null,
      lines,
    };
  })()`);
  out.push({ w, h, ...r });
  if (shots) {
    mkdirSync(shots, { recursive: true });
    const { data } = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: r.pageH, scale: 1 } });
    writeFileSync(join(shots, `th-${w}.png`), Buffer.from(data, 'base64'));
  }
}
c.close();
for (const r of out) {
  console.log(`\n=== ${r.w}×${r.h}  scrollWidth ${r.scrollW} (vw ${r.vw})  page height ${r.pageH}`);
  console.log(`  overflow elements: ${r.widerCount}${r.wider.length ? '\n    ' + r.wider.join('\n    ') : ''}`);
  console.log(`  pricing table overflow: ${r.tableOver}px  SE card: ${JSON.stringify(r.seCard)}  H1: ${JSON.stringify(r.heroH1)}  red bar top: ${r.redBarTop}  cta row wrapped: ${r.ctaRowWrapped}`);
  for (const [k, v] of Object.entries(r.lines)) {
    if (!v) continue;
    const s = Array.isArray(v) ? v.join(' ⏎ ') : String(v);
    console.log(`  ${k.padEnd(11)} ${Array.isArray(v) && k !== 'nav' && k !== 'wbcard' ? `[${v.length}] ` : ''}${s}`);
  }
}
