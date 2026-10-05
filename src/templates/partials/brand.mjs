// Brand marks drawn in SVG (doc 05 §5.13): the app icon's 4×4 mosaic, App Store badge (WBW only, R43), UI icons.

import { esc } from '../../lib/html.mjs';

// AppIcon rows K K B O / O O O K / B B O C / K B K C; K follows --mosaic-k so it flips with the theme.
const MOSAIC = ['KKBO', 'OOOK', 'BBOC', 'KBKC'];
const CELL = { O: '#44111C', B: '#882239', C: '#CC3355' };
const cell = (ch, x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}"${ch === 'K' ? ' class="mk"' : ` fill="${CELL[ch]}"`}/>`;

export const mosaicSquare = (cls) => `<svg class="${cls}" viewBox="0 0 4 4" aria-hidden="true" shape-rendering="crispEdges">${MOSAIC.flatMap((r, y) => [...r].map((ch, x) => cell(ch, x, y, 1))).join('')}</svg>`;
export const mosaicStrip = (cls) => `<svg class="${cls}" viewBox="0 0 16 1" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">${[...MOSAIC.join('')].map((ch, x) => cell(ch, x, 0, 1)).join('')}</svg>`;
export function mosaicEdge() {
  const rows = [MOSAIC[0] + MOSAIC[1], MOSAIC[2] + MOSAIC[3]];
  const rects = rows.flatMap((r, y) => [...r].map((ch, x) => cell(ch, x * 8, y * 8, 8))).join('');
  return `<svg class="edge-mosaic" width="100%" height="16" aria-hidden="true" shape-rendering="crispEdges"><defs><pattern id="mosaic-edge" width="64" height="16" patternUnits="userSpaceOnUse">${rects}</pattern></defs><rect width="100%" height="16" fill="url(#mosaic-edge)"/></svg>`;
}

export const SVG = {
  globe: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9"/></svg>',
  chevron: '<svg class="i i-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h14M3 12h17M8 17h12"/></svg>',
};

const APPLE = 'M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-.99-1.94.03-3.73 1.13-4.73 2.86-2.02 3.5-.52 8.68 1.45 11.52.96 1.39 2.11 2.95 3.61 2.9 1.45-.06 2-.94 3.75-.94s2.25.94 3.78.91c1.56-.03 2.55-1.42 3.5-2.81 1.1-1.61 1.56-3.17 1.58-3.25-.03-.02-3.04-1.17-3.09-4.64zM14.16 4.05c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.22-1.22 3.53 1.29.1 2.6-.65 3.41-1.61z';

// WordByWord App Store badge. Apple's official localized SVG replaces the drawn placeholder once
// assets/badges/<badge>.svg is present (doc 06 §7.4; fetching the badges needs the owner's OK).
const BADGE_LINES = {
  'en-us': ['Download on the', 'App Store'], 'ja-jp': ['App Storeから', 'ダウンロード'], 'zh-cn': ['从 App Store', '下载'],
  'zh-tw': ['在 App Store', '下載'], 'ko-kr': ['App Store에서', '다운로드'],
};
export function badge(ctx, { href, gaLabel }) {
  const l = ctx.route.locale;
  const label = ctx.t.common.appStoreBadgeAlt;
  const official = ctx.badgeUrl?.(l.badge);
  if (official) {
    return `<a class="asb asb--official" href="${esc(href)}" data-ga-label="${gaLabel}"><img src="${official.url}" width="${official.w}" height="${official.h}" alt="${esc(label)}"></a>`;
  }
  const [small, big] = BADGE_LINES[l.badge] ?? BADGE_LINES['en-us'];
  return `<a class="asb" href="${esc(href)}" aria-label="${esc(label)}" data-ga-label="${gaLabel}"><svg class="asb-logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${APPLE}"/></svg><span class="asb-text" aria-hidden="true"><small>${esc(small)}</small><b>${esc(big)}</b></span></a>`;
}
