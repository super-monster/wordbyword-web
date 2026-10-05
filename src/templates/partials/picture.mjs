// Images: <picture> from the registry, CSS device frames with a drawn iOS status bar (doc 05 §5.3, R67),
// app icons. ctx.img(key) returns { avif:[{url,w,h}], fallback:{url,w,h}, meta } or null (registry missing).

import { esc } from '../../lib/html.mjs';

export function picture(ctx, key, { alt, sizes, eager = false, cls = '' }) {
  const im = ctx.img(key);
  if (!im) return `<span class="img-missing${cls ? ` ${cls}` : ''}" data-img-key="${esc(key)}" role="img" aria-label="${esc(alt)}"></span>`;
  const srcset = im.avif.map((a) => (im.avif.length > 1 ? `${a.url} ${a.w}w` : a.url)).join(', ');
  const sz = sizes && im.avif.length > 1 ? ` sizes="${esc(sizes)}"` : '';
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${srcset}"${sz}>`
    + `<img src="${im.fallback.url}" width="${im.fallback.w}" height="${im.fallback.h}" alt="${esc(alt)}"`
    + `${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>`;
}

export function icon(ctx, key, size, { alt = '', cls = '', lazy = true } = {}) {
  const im = ctx.img(key);
  // Smallest PNG variant that covers 2× the display size (registry widths: 64, 160).
  const pngs = (im?.meta?.variants ?? []).filter((v) => v.format === 'png').map((v) => v.w).sort((a, b) => a - b);
  const w = pngs.find((x) => x >= size * 2) ?? pngs[pngs.length - 1];
  const src = (w && im.variant(w, 'png')) || '/icons/icon-192.png';
  return `<img src="${src}" width="${size}" height="${size}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${lazy ? ' loading="lazy"' : ''} decoding="async">`;
}

// iOS status bar: one component for the hero sample and every screenshot device (R67). Always 9:41, full bars.
export const STATUS = (tone) => `<div class="ios-status" data-tone="${tone}" aria-hidden="true"><span class="ios-time">9:41</span><span class="ios-island"></span><span class="ios-sys"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.5 1.5a4.3 4.3 0 0 0-6 0zM1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.5 1.5a7.5 7.5 0 0 0-10.6 0z"/></svg><svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M25 4v4a2 2 0 0 0 0-4z" opacity=".4"/></svg></span></div>`;

// Screenshot inside a CSS device (doc 05 §5.3): status bar drawn by CSS, image = status-bar-free crop.
export function deviceShot(ctx, key, { size, sizes, alt, screenExtra = '', deviceExtra = '' }) {
  const meta = ctx.img(key)?.meta ?? {};
  const bg = meta.statusBg ? ` style="--status-bg:${esc(meta.statusBg)}"` : '';
  return `<div class="device device--${size}"${bg}><div class="device-screen">${STATUS(meta.statusTone ?? 'dark')}${picture(ctx, key, { sizes, alt })}${screenExtra}</div>${deviceExtra}</div>`;
}
