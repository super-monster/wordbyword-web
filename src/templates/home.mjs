// Locale home page (doc 06 §5.2; section order doc 02 §7.5: hero → features → screenshots → languages →
// pricing → surfenglish → faq → cta). Markup mirrors the validated design prototype so src/css applies as-is.

import { esc, head, mk, plain } from '../lib/html.mjs';
import { appStoreLink } from '../lib/links.mjs';
import { layout } from './layout.mjs';
import { demo } from './partials/demo.mjs';
import { picture, deviceShot, icon } from './partials/picture.mjs';
import { badge, mosaicEdge, mosaicStrip, mosaicSquare } from './partials/brand.mjs';
import { siblingCard } from './partials/sibling.mjs';
import { faqItems } from './partials/faq.mjs';

const POST_ACTIONS = '<p class="post-actions" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M3.5 9.5a6.5 6 0 1 1 3 5.1L3 16l1.2-3.2a6 6 0 0 1-.7-3.3z"/></svg><svg viewBox="0 0 20 20"><path d="M5 7.5 7.5 5 10 7.5M7.5 5.5V13a2 2 0 0 0 2 2H12M15 12.5 12.5 15 10 12.5M12.5 14.5V7a2 2 0 0 0-2-2H8"/></svg><svg viewBox="0 0 20 20"><path d="M10 16s-6-3.6-6-8a3.2 3.2 0 0 1 6-1.6A3.2 3.2 0 0 1 16 8c0 4.4-6 8-6 8z"/></svg><svg viewBox="0 0 20 20"><path d="M10 3v10M6.5 6.5 10 3l3.5 3.5M4 12v4h12v-4"/></svg></p>';

// Image set per locale (doc 06 §5.2): ja and zh-Hans have localized screenshots; everyone else uses en (R33).
export const imageSet = (l) => (l.code === 'ja' ? 'ja' : l.code === 'zh-Hans' ? 'zh-hans' : 'en');

const TARGETS = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['zh-Hans', '简体中文'], ['zh-Hant', '繁體中文'], ['ja', '日本語'],
  ['ko', '한국어'], ['es', 'Español'], ['pt-BR', 'Português (Brasil)'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['ru', 'Русский'], ['tr', 'Türkçe'], ['uk', 'Українська'],
  ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia'], ['ar', 'العربية'], ['hi', 'हिन्दी'],
];

export function home(ctx) {
  const { t, f, SITE, route, product } = ctx;
  const l = route.locale;
  const set = imageSet(l);
  const F = Object.fromEntries(t.features.map((x) => [x.id, x]));
  const app = (placement) => appStoreLink(SITE, SITE.appStoreId, placement);

  // ———— hero (doc 05 §5.2.1, R69): H1 → definition → CTA + ctaNote → sample → how → platformNote ————
  const ledeShort = t.hero.ledeShort && t.hero.ledeShort !== t.hero.lede
    ? `<p class="hero-lede lede hero-lede--long">${esc(f(t.hero.lede))}</p><p class="hero-lede lede hero-lede--short">${esc(f(t.hero.ledeShort))}</p>`
    : `<p class="hero-lede lede">${esc(f(t.hero.lede))}</p>`;
  const hero = `
<section id="hero" class="hero" aria-labelledby="hero-h">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">${esc(t.hero.eyebrow)}</p>
        <h1 id="hero-h" class="h-display">${mk(t.hero.title)}</h1>
        ${ledeShort}
        <div class="cta-row">
          ${badge(ctx, { href: app('hero'), gaLabel: 'hero' })}
          <a class="link-arrow" href="#features">${esc(t.hero.secondaryCta)}</a>
        </div>
        <p class="hero-cta-note">${esc(f(t.hero.ctaNote))}</p>
      </div>
      <div class="hero-demo">${demo(ctx)}
      </div>
      <div class="hero-after">
        ${t.hero.how ? `<p class="hero-how">${esc(f(t.hero.how))}</p>` : ''}
        <p class="platform-note">${esc(f(t.hero.platformNote))}</p>
      </div>
    </div>
    ${mosaicEdge()}
  </div>
</section>`;

  // ———— features (doc 05 §5.4) ————
  const sw = F.swipe, lk = F.lookup;
  const l1 = `
    <div class="feature feat-l1">
      <div class="l1-copy">
        <p class="eyebrow"><span class="eyebrow-n">01</span> ${esc(sw.kicker)}</p>
        <h3 class="h-sub" id="f-swipe">${head(sw.title)}</h3>
        <p class="feat-text">${esc(f(sw.text))}</p>
        <ol class="points">${sw.bullets.map((b, i) => `<li><span class="points-n" aria-hidden="true">0${i + 1}</span><span>${esc(f(b))}</span></li>`).join('')}</ol>
      </div>
      <figure class="l1-media">
        ${deviceShot(ctx, `shot/${set}/swipe`, { size: 'l', sizes: '(min-width: 900px) 340px, min(320px, 80vw)', alt: sw.alt })}
        <figcaption class="media-cap">${esc(t.common.screenshotLabel)}</figcaption>
      </figure>
    </div>`;

  const lmeta = ctx.img(`shot/${set}/lookup`)?.meta ?? {};
  const pins = lmeta.pins ?? [{ n: 1, side: 'start', y: 0.42 }, { n: 2, side: 'start', y: 0.62 }, { n: 3, side: 'end', y: 0.74 }];
  const pinsHtml = pins.map((p) => `<span class="pin pin--${p.side}" style="--y:${p.y}" aria-hidden="true">${p.n}</span>`).join('');
  const ringHtml = lmeta.ring ? `<span class="ring" style="--rx:${lmeta.ring.x};--ry:${lmeta.ring.y};--rw:${lmeta.ring.w};--rh:${lmeta.ring.h}" aria-hidden="true"></span>` : '';
  const anno = (i) => {
    const p = pins[i];
    return `<li class="anno anno--${p.side}" style="--y:${p.y}"><span class="anno-n" aria-hidden="true">${p.n}</span><span class="anno-t">${esc(f(lk.bullets[i]))}</span><span class="anno-line" aria-hidden="true"></span></li>`;
  };
  const l2 = `
    <div class="feature feat-l2">
      <div class="l2-head">
        <p class="eyebrow"><span class="eyebrow-n">02</span> ${esc(lk.kicker)}</p>
        <h3 class="h-sub" id="f-lookup">${head(lk.title)}</h3>
        <p class="lede">${esc(f(lk.text))}</p>
        ${lk.note ? `<p class="limit"><span class="tag tag--note">${esc(t.common.noteLabel)}</span> ${esc(f(lk.note))}</p>` : ''}
      </div>
      <div class="spread">
        <figure class="spread-device">
          ${deviceShot(ctx, `shot/${set}/lookup`, { size: 'l', sizes: '(min-width: 900px) 340px, min(320px, 80vw)', alt: lk.alt, screenExtra: ringHtml, deviceExtra: pinsHtml })}
          <figcaption class="media-cap">${esc(t.common.screenshotLabel)}</figcaption>
        </figure>
        <ol class="spread-col spread-col--start">${pins.slice(0, 2).map((_, i) => anno(i)).join('')}</ol>
        <ol class="spread-col spread-col--end" start="3">${pins.slice(2).map((_, i) => anno(i + 2)).join('')}</ol>
      </div>
    </div>`;

  // M grid: X post sample (R71, every locale) · chunks illustration · read-aloud & syntax excerpts
  const xs = F.x.sample;
  if (!xs?.handle?.includes('example')) throw new Error(`features[x].sample.handle must be fictitious (contain "example") for ${l.code}`);
  const xName = xs.name ?? xs.author ?? '';
  const mX = `
      <article class="m-card" aria-labelledby="f-x">
        <figure class="m-media">
          <div class="canvas post-sample" dir="ltr">
            <div class="post" role="img" aria-label="${esc(`${plain(F.x.title)}: ${xs.source} — ${xs.translation}`)}">
              <p class="post-head" aria-hidden="true"><span class="post-avatar">${esc([...(xName || xs.handle.replace(/^@/, ''))][0].toUpperCase())}</span>${xName ? `<b>${esc(xName)}</b> ` : ''}<span class="post-handle">${esc(xs.time ? `${xs.handle} · ${xs.time}` : xs.handle)}</span></p>
              <p class="post-src" lang="${esc(t.demo.sourceLang)}">${esc(xs.source)}</p>
              <p class="post-tr" lang="${l.hreflang}"${l.dir === 'rtl' ? ' dir="rtl"' : ''}>${esc(xs.translation)}</p>
              ${POST_ACTIONS}
            </div>
          </div>
          <figcaption class="media-cap">${esc(F.chunks.sample.label)}</figcaption>
        </figure>
        <p class="eyebrow eyebrow--plain">${esc(F.x.kicker)}</p>
        <h3 id="f-x">${head(F.x.title)}</h3>
        <p>${esc(f(F.x.text))}</p>
      </article>`;
  const ch = F.chunks;
  let sent = esc(ch.sample.sentence);
  ch.sample.chunks.forEach((k, i) => { sent = sent.replace(esc(k), `<span class="ck ck-${i + 1}">${esc(k)}</span>`); });
  const mChunks = `
      <article class="m-card" aria-labelledby="f-chunks">
        <figure class="m-media">
          <div class="canvas ck-canvas" dir="ltr" role="img" aria-label="${esc(`${ch.sample.sentence} — ${ch.sample.gloss} — ${ch.sample.flowLabel}: ${ch.sample.flow}`)}">
            <div class="ck-sample" aria-hidden="true" lang="en">
              <p class="ck-sentence">${sent}</p>
              <p class="ck-gloss" lang="${l.hreflang}">${esc(ch.sample.gloss)}</p>
              <p class="ck-flow"><span class="ck-flow-label">${esc(ch.sample.flowLabel)}</span> <span>${esc(ch.sample.flow)}</span></p>
            </div>
          </div>
          <figcaption class="media-cap">${esc(ch.sample.label)}</figcaption>
        </figure>
        <p class="eyebrow eyebrow--plain">${esc(ch.kicker)} <span class="tag tag--en-only">${esc(t.pricing.table.englishOnly)}</span></p>
        <h3 id="f-chunks">${head(ch.title)}</h3>
        <p>${esc(f(ch.text))}</p>
      </article>`;
  const mShot = (feat, img) => `
      <article class="m-card" aria-labelledby="f-${feat.id}">
        <figure class="m-media"><div class="shot">${picture(ctx, `shot/${set}/${img}`, { sizes: '(min-width: 900px) 512px, calc(100vw - 32px)', alt: feat.alt })}</div>
          <figcaption class="media-cap">${esc(t.common.screenshotExcerptLabel)}</figcaption></figure>
        <p class="eyebrow eyebrow--plain">${esc(feat.kicker)}</p>
        <h3 id="f-${feat.id}">${head(feat.title)}</h3>
        <p>${esc(f(feat.text))}</p>
      </article>`;
  const mGrid = `<div class="feature m-grid">${mX}${mChunks}${mShot(F.speech, 'tts-ex')}${mShot(F.syntax, 'syntax-ex')}</div>`;

  const swatches = '<span class="swatches" aria-hidden="true"><i class="sw sw--quote">Aa</i><i class="sw sw--bg">Aa</i><i class="sw sw--border">Aa</i><i class="sw sw--under">Aa</i></span>';
  const spec = `<ul class="spec">${['engines', 'display', 'history', 'devices'].map((id) => `
      <li class="spec-row"><p class="spec-label" aria-hidden="true">${esc(F[id].kicker)}</p><h3 class="h-4">${head(F[id].title)}${id === 'display' ? ` ${swatches}` : ''}</h3><p class="spec-fact">${esc(f(F[id].text))}</p></li>`).join('')}
    </ul>`;

  const features = `
<section id="features" class="section section--features" aria-labelledby="features-h">
  <div class="container">
    <header class="section-head">
      <h2 id="features-h">${head(t.featuresIntro.title)}</h2>
      <p class="lede">${esc(f(t.featuresIntro.lede))}</p>
    </header>${l1}${l2}
    ${mGrid}
    ${spec}
  </div>
</section>`;

  // ———— gallery (doc 05 §5.5) ————
  const galIds = { settings: 'settings', dictionary: 'dictionary', languages: 'languages', languageList: 'language-list' };
  const gItems = t.gallery.items.filter((g) => !g.hidden);
  const gSize = gItems.length <= 2 ? 'md' : 'sm';
  const gSizes = gSize === 'md' ? '(min-width: 900px) 302px, 58vw' : '(min-width: 900px) 226px, 58vw';
  const gallery = `
<section id="screenshots" class="section section--end" aria-labelledby="gallery-h">
  <div class="container">
    <h2 id="gallery-h" class="h-sub">${head(t.gallery.title)}</h2>
    <div class="gallery" data-count="${gItems.length}" role="region" aria-labelledby="gallery-h" tabindex="0">${gItems.map((g, i) => `
      <figure class="gallery-item">${deviceShot(ctx, `shot/${set}/${galIds[g.id] ?? g.id}`, { size: gSize, sizes: gSizes, alt: g.alt })}
        <figcaption><span class="fig-no">${esc(t.common.figLabel)} ${i + 1}</span> ${esc(f(g.caption))}</figcaption></figure>`).join('')}
    </div>
  </div>
</section>`;

  // ———— languages (doc 05 §5.6) ————
  const languages = `
<section id="languages" class="section section--band" aria-labelledby="languages-h">
  <div class="container langs-layout">
    <div class="langs-main">
      <h2 id="languages-h">${head(f(t.languages.title))}</h2>
      <p class="lede">${esc(f(t.languages.lede))}</p>
      <ul class="facts">
        <li>${esc(f(t.languages.uiCount))}</li>
        <li>${esc(f(t.languages.targetCount))}</li>
        <li>${esc(f(t.languages.sourceNote))}</li>
      </ul>
      <h3 class="chips-label" id="targets-h">${esc(t.languages.targetListLabel)}</h3>
      <ul class="chips" aria-labelledby="targets-h">${TARGETS.map(([code, name]) => `<li class="chip" lang="${code}"${code === 'ar' ? ' dir="rtl"' : ''}>${esc(name)}</li>`).join('')}</ul>
    </div>
    <aside class="side-notes">
      <ol>${t.languages.limits.map((s) => `<li class="side-note">${esc(f(s))}</li>`).join('')}</ol>
    </aside>
  </div>
</section>`;

  // ———— pricing (doc 05 §5.7, R43/R68): one table + summary + note + the WBW badge ————
  const tb = t.pricing.table;
  const q = product.wbw.quota;
  // "$3.99 / month (US)", "月額$3.99（米国の価格）": wrap only before the parenthesis, never inside a word (05 A7)
  const priceLines = (s) => {
    const i = s.search(/[（(]/);
    if (i <= 0) return esc(s);
    const a = s.slice(0, i);
    return `<span class="nw">${esc(a.trimEnd())}</span>${a.endsWith(' ') ? ' ' : '<wbr>'}<span class="nw">${esc(s.slice(i))}</span>`;
  };
  const val = (v) => (v === '∞' ? `<span class="nolimit">${esc(tb.noLimit)}</span>` : `<span class="q-val">${esc(f(tb.perDay, { n: v }))}</span>`);
  const groups = [['translate', ['cloudSwipe', 'localSwipe']], ['lookup', ['lookup', 'more']], ['listen', ['lookupSpeech', 'swipeSpeech', 'localVoice']], ['sentence', ['chunks', 'actionFlow', 'syntax']]];
  const tbody = groups.map(([g, rows]) => `
          <tbody><tr class="grp"><th colspan="3" scope="colgroup">${esc(tb.groups[g])}</th></tr>${rows.map((row) => `
            <tr><th scope="row">${esc(tb.rows[row])}${row === 'chunks' || row === 'actionFlow' ? ` <span class="tag tag--en-only">${esc(tb.englishOnly)}</span>` : ''}</th><td>${val(q[row].free)}</td><td>${val(q[row].plus)}</td></tr>`).join('')}</tbody>`).join('');
  const pricing = `
<section id="pricing" class="section" aria-labelledby="pricing-h">
  <div class="container">
    <header class="section-head">
      <h2 id="pricing-h">${head(t.pricing.title)}</h2>
      <p class="lede">${esc(f(t.pricing.lede))}</p>
    </header>
    <div class="pricing-body">
      <div class="table-wrap">
        <table class="quota">
          <caption>${esc(tb.caption)}</caption>
          <thead><tr><th scope="col">${esc(tb.colFeature)}</th><th scope="col">${esc(tb.colFree)}</th><th scope="col" class="col-plus">${mosaicStrip('plus-mosaic')}<span class="plus-name">${esc(tb.colPlus)}</span><span class="plus-price">${priceLines(f(t.pricing.plus.price))}</span></th></tr></thead>${tbody}
        </table>
      </div>
      ${t.pricing.summary ? `<p class="pricing-summary">${esc(f(t.pricing.summary))}</p>` : ''}
      <p class="pricing-note">${esc(f(t.pricing.note))}</p>
      <div class="pricing-cta">${badge(ctx, { href: app('pricing'), gaLabel: 'pricing' })}</div>
    </div>
  </div>
</section>`;

  // ———— FAQ & final CTA ————
  const faq = `
<section id="faq" class="section section--end" aria-labelledby="faq-h">
  <div class="container faq-layout">
    <div class="faq-head"><h2 id="faq-h" class="h-sub">${head(t.faq.title)}</h2></div>
    <div class="faq-list">${faqItems(ctx, t.faq.items)}
    </div>
  </div>
</section>`;
  const cta = `
<section id="cta" class="section section--band final-cta" aria-labelledby="cta-h">
  <div class="container cta-layout">
    <div class="cta-mark" aria-hidden="true">${icon(ctx, 'brand/common/icon', 80, { cls: 'cta-icon' })}${mosaicSquare('mosaic mosaic--cta')}</div>
    <div class="cta-copy">
      <h2 id="cta-h">${head(t.cta.title)}</h2>
      <p class="lede cta-recap">${esc(f(t.cta.recap ?? t.cta.text))}</p>
      ${badge(ctx, { href: app('cta'), gaLabel: 'cta' })}${t.cta.recap ? `
      <p class="cta-note">${esc(f(t.cta.text))}</p>` : ''}
    </div>
  </div>
</section>`;

  return layout(ctx, {
    title: t.meta.title,
    description: f(t.meta.description),
    ogTitle: t.meta.ogHeadline ? plain(t.meta.ogHeadline) : t.meta.title,
    ogAlt: t.meta.ogImageAlt,
    main: hero + features + gallery + languages + pricing + siblingCard(ctx) + faq + cta,
  });
}
