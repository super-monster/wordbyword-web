#!/usr/bin/env node
// Self-check helper (dev only, macOS + Chrome, R34): headless Chrome over CDP, measures the page and optionally
// writes full-page screenshot segments. Serve the prototype first:  python3 -m http.server 8899 --bind 127.0.0.1
// usage: node tools/shoot.mjs <url> <outprefix|-> <width> <height> <light|dark> [segH] [reduce|no-preference]
// Prints JSON: first-screen boxes (h1, lede, CTA, device, translation bar), page height, horizontal overflow,
// broken images, SE card height, spec-sheet height, section heights, heading sizes, section gaps.
import { spawn } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, out, width = '1366', height = '900', scheme = 'light', seg = '1100', motion = 'reduce'] = process.argv.slice(2);
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9300 + Math.floor(Math.random() * 500);
const prof = join(tmpdir(), `wbw-shoot-${port}`);
const proc = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs; for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(200); }
const page = tabs.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: motion }] });
const mobile = +width < 600;
await send('Emulation.setDeviceMetricsOverride', { width: +width, height: +height, deviceScaleFactor: 1, mobile });
await send('Page.enable'); await send('Page.navigate', { url }); await sleep(2500);
// first screen, before any scrolling
const first = await ev(`(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height), w: Math.round(b.width) }; };
  return { vh: innerHeight, h1: r('h1'), lede: r('.hero-lede'), cta: r('.cta-row'), ctaNote: r('.hero-cta-note'), device: r('.device--hero'), tr: r('.wb-tr'), brandName: getComputedStyle(document.querySelector('.brand-name')).display };
})()`);
const H = await ev('document.documentElement.scrollHeight');
for (let y = 0; y < H; y += 500) { await ev(`scrollTo(0,${y})`); await sleep(120); }
await ev('scrollTo(0,0)'); await sleep(1200);
const m = await ev(`(async () => {
  await Promise.race([Promise.all([...document.images].filter((i) => i.offsetParent).map((i) => i.decode().catch(() => null))), new Promise((r) => setTimeout(r, 4000))]);
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(b.height); };
  const fs = (s) => { const e = document.querySelector(s); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10 : null; };
  const vw = document.documentElement.clientWidth;
  const over = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > vw + 1 || b.left < -1) && !e.closest('.gallery') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 6).map((e) => e.tagName + '.' + e.className.toString().slice(0, 40));
  const broken = [...document.images].filter((i) => i.offsetParent && (!i.complete || !i.naturalWidth)).map((i) => i.currentSrc || i.src);
  const sections = Object.fromEntries([...document.querySelectorAll('main > section, main > aside, footer, header.site-header')].map((s) => [s.id || s.className.split(' ')[0], Math.round(s.getBoundingClientRect().height)]));
  const gap = (a, b) => { const A = document.querySelector(a), B = document.querySelector(b); if (!A || !B) return null; return Math.round(B.getBoundingClientRect().top - A.getBoundingClientRect().bottom); };
  return {
    docH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, vw, overflow: over, broken,
    seCard: r('.sibling__inner'), seAside: r('#surfenglish'), seWindowShown: getComputedStyle(document.querySelector('.sibling__window')).display !== 'none',
    spec: r('.spec'), sections,
    font: { h1: fs('h1'), featuresH2: fs('#features-h'), l1H3: fs('#f-swipe'), galleryH2: fs('#gallery-h'), mH3: fs('#f-x'), specH3: fs('.spec-row h3'), langsH2: fs('#languages-h'), seH2: fs('#se-h'), faqH2: fs('#faq-h'), faqQ: fs('.faq-q'), ctaH2: fs('#cta-h') },
    gaps: { specToGallery: gap('.spec', '#gallery-h'), galleryToLangs: gap('.gallery', '#languages-h'), tableToSE: gap('.pricing-cta', '.sibling__inner'), seToFaq: gap('.sibling__inner', '#faq-h') },
    kw: document.querySelectorAll('.kw').length, imgs: document.images.length,
  };
})()`);
console.log(JSON.stringify({ url, width: +width, height: +height, scheme, first, ...m }));
if (out !== '-') {
  const HH = m.docH; let n = 0;
  for (let y = 0; y < HH; y += +seg) {
    const h = Math.min(+seg, HH - y);
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: +width, height: h, scale: 1 } });
    writeFileSync(`${out}-${String(n++).padStart(2, '0')}.png`, Buffer.from(r.data, 'base64'));
  }
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: +width, height: +height, scale: 1 } });
  writeFileSync(`${out}-first.png`, Buffer.from(r.data, 'base64'));
  console.error('segments', n);
}
ws.close(); proc.kill(); await sleep(300); try { rmSync(prof, { recursive: true, force: true }); } catch {}
