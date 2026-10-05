// Hero bilingual sample (doc 05 §5.2, R66): an HTML replica of the in-app browser showing a self-written article.
// Server-rendered final frame (is-static); src/js/main.js animates it. Gesture cues are never mirrored (R63).

import { esc } from '../../lib/html.mjs';
import { STATUS } from './picture.mjs';

const TOOLS = `<div class="wb-bottom" aria-hidden="true"><div class="wb-tools"><svg viewBox="0 0 26 26"><path d="M5 5h16v11H12l-5 4v-4H5z"/><circle cx="12" cy="10" r="2.6"/><path d="m14 12 2 2"/></svg><svg viewBox="0 0 26 26"><path d="M6 4h12a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2z"/><path d="M6 19a2 2 0 0 1 2-2h12"/><path d="m10.5 14 2.5-7 2.5 7m-4.2-2h3.4"/></svg><svg viewBox="0 0 26 26"><path d="M4 10h4l5-4v14l-5-4H4z"/><path d="M17 9.5a5 5 0 0 1 0 7M19.5 7a8.5 8.5 0 0 1 0 12"/></svg><svg viewBox="0 0 26 26"><rect x="3" y="8" width="14" height="12" rx="2"/><path d="M7 5h12a2 2 0 0 1 2 2v8"/><circle cx="20" cy="19" r="3.2"/></svg></div><div class="wb-nav"><svg viewBox="0 0 22 22"><path d="m14 4-7 7 7 7"/></svg><svg viewBox="0 0 22 22" class="dim"><path d="m8 4 7 7-7 7"/></svg><svg viewBox="0 0 22 22"><rect x="3" y="5" width="13" height="13" rx="2"/><path d="M7 2h10a3 3 0 0 1 3 3v10M9.5 8.5v6m-3-3h6"/></svg><svg viewBox="0 0 22 22"><rect x="3" y="3" width="16" height="16" rx="3"/><text x="11" y="15" text-anchor="middle" font-size="9" stroke="none">23</text></svg><svg viewBox="0 0 22 22"><circle cx="4" cy="11" r="1.6"/><circle cx="11" cy="11" r="1.6"/><circle cx="18" cy="11" r="1.6"/></svg></div><span class="wb-home"></span></div>`;

export function demo(ctx) {
  const { t, route } = ctx;
  const d = t.demo;
  const code = route.locale.hreflang;
  // ar: the screen stays LTR, the translation and the lookup card run RTL; the red bar stays on the left (05 §5.2.6)
  const rtl = route.locale.dir === 'rtl' ? ' dir="rtl"' : '';
  const cjk = route.locale.script === 'cjk';
  const lookup = d.lookup ?? null;
  let s2 = esc(d.source[1] ?? '');
  if (lookup) {
    const re = new RegExp(`(^|[^\\p{L}])(${lookup.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=[^\\p{L}]|$)`, 'u');
    if (!re.test(d.source[1])) throw new Error(`demo.lookup.word "${lookup.word}" not in demo.source[1] (L-10) for ${route.locale.code}`);
    s2 = esc(d.source[1]).replace(re, `$1<span class="w">$2</span>`);
  }
  const card = lookup ? `
      <aside class="wb-card" lang="${code}"${rtl}>
        <p class="wb-card-head"><b class="wb-word" lang="${d.sourceLang}">${esc(lookup.word)}</b> <span class="wb-pos">${esc(lookup.pos)}</span><svg class="wb-speaker" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.2 5.5a6.4 6.4 0 0 1 0 9" fill="none"/></svg></p>
        <p class="wb-def">${esc(lookup.meaning)}</p>
        <p class="wb-note">${esc(lookup.note)}</p>
        <p class="wb-more-link">${esc(d.ui.more)}</p>
      </aside>` : '';
  return `
<figure class="sample is-static" id="sample" aria-labelledby="sample-cap" data-loops="2">
  <div class="device device--hero" role="group" aria-label="${esc(t.common.demoLabel)}">
    <div class="device-screen sample-screen" dir="ltr" data-nosnippet>
      ${STATUS('dark')}
      <div class="wb-addr" aria-hidden="true"><svg viewBox="0 0 20 20" class="wb-star"><path d="m10 2.5 2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.7z"/></svg><span>${esc(d.ui.domain)}</span><svg viewBox="0 0 20 20" class="wb-reload"><path d="M15.5 10a5.5 5.5 0 1 1-1.8-4.1M14 2.5v3.6h-3.6"/></svg></div>
      <article class="wb-page" lang="${d.sourceLang}">
        <p class="wb-title">${esc(d.articleTitle)}</p>${d.byline ? `
        <p class="wb-byline" aria-hidden="true">${esc(d.byline)}</p>` : ''}
        <p class="wb-src"><span class="s s1">${esc(d.source[0])}</span> <span class="s s2">${s2}</span></p>
        <div class="wb-tr-wrap"><p class="wb-tr" lang="${code}"${rtl}>${d.translation.map(esc).join(cjk ? '' : ' ')}</p></div>
        ${(d.context ?? []).map((p) => `<p class="wb-more" aria-hidden="true">${esc(p)}</p>`).join('')}
      </article>${card}
      ${TOOLS}
      <span class="cue cue-swipe" aria-hidden="true"><span class="cue-label">${esc(d.ui.swipeCue)}</span><span class="cue-dot"></span></span>
      <span class="cue cue-tap" aria-hidden="true"></span>
    </div>
  </div>
  <figcaption class="sample-cap"><span id="sample-cap">${esc(d.caption)}</span> <button class="sample-toggle" type="button" data-pause="${esc(d.ui.pause)}" data-replay="${esc(d.ui.replay)}">${esc(d.ui.pause)}</button></figcaption>
</figure>`;
}
