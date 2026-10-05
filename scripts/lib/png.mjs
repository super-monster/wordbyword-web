// Minimal PNG codec + pixel helpers, zero deps (Node ≥ 22). Ported from the prototype's tools/png.mjs
// (docs/redesign-2026/prototype, doc 06 §7.2, R79): every crop of the image pipeline happens here, on decoded pixels,
// because `sips -c … --cropOffset` silently ignores an offset of "0 0" and returns the uncropped image when the
// rectangle touches the bottom edge (prototype README G6).
//
// Changes from the prototype: encodePNG() can write RGB (colour type 2) so opaque images reach sips without an alpha
// channel (sips otherwise encodes a redundant alpha plane into the AVIF — measured +40–50% tiles on the prototype's
// demo-sourced screens); pngSize() reads IHDR only; crop() / flatten() / opaqueShare() are the pixel operations used
// by scripts/images.mjs.
import { inflateSync, deflateSync, crc32 } from 'node:zlib';

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// IHDR only: { width, height, depth, colorType, hasAlpha } — no inflate, cheap enough for every build.
export function pngSize(buf) {
  if (buf.length < 33 || !buf.subarray(0, 8).equals(SIG) || buf.toString('latin1', 12, 16) !== 'IHDR') throw new Error('not a PNG');
  const colorType = buf[25];
  let trns = false;
  for (let off = 8; off + 8 <= buf.length;) {
    const len = buf.readUInt32BE(off), type = buf.toString('latin1', off + 4, off + 8);
    if (type === 'tRNS') { trns = true; break; }
    if (type === 'IDAT' || type === 'IEND') break;
    off += 12 + len;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), depth: buf[24], colorType, hasAlpha: colorType === 4 || colorType === 6 || trns };
}

// Decode any non-interlaced PNG (1/2/4/8/16-bit; gray, RGB, palette, gray+alpha, RGBA) to RGBA8.
export function decodePNG(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('not a PNG');
  let off = 8, w = 0, h = 0, depth = 8, ctype = 6, interlace = 0, plte = null, trns = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    off += 12 + len;
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (interlace) throw new Error('interlaced PNG not supported');
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  const bitsPP = ch * depth;
  const bpp = Math.max(1, bitsPP >> 3);
  const stride = Math.ceil((w * bitsPP) / 8);
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255;
    }
    prev = cur;
  }
  // sample reader for any depth (1/2/4/8/16; 16-bit keeps the high byte)
  const maxv = (1 << Math.min(depth, 8)) - 1;
  const sample = (row, i) => {
    if (depth === 8) return row[i];
    if (depth === 16) return row[i * 2];
    const bit = i * depth, byte = row[bit >> 3], shift = 8 - depth - (bit & 7);
    return Math.round((((byte >> shift) & maxv) * 255) / maxv);
  };
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const row = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (ctype === 3) {
        const idx = depth === 8 ? row[x] : (row[(x * depth) >> 3] >> (8 - depth - ((x * depth) & 7))) & maxv;
        rgba[o] = plte[idx * 3]; rgba[o + 1] = plte[idx * 3 + 1]; rgba[o + 2] = plte[idx * 3 + 2];
        rgba[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      } else if (ctype === 0 || ctype === 4) {
        const g = sample(row, x * ch);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
        rgba[o + 3] = ctype === 4 ? sample(row, x * ch + 1) : 255;
      } else {
        rgba[o] = sample(row, x * ch); rgba[o + 1] = sample(row, x * ch + 1); rgba[o + 2] = sample(row, x * ch + 2);
        rgba[o + 3] = ctype === 6 ? sample(row, x * ch + 3) : 255;
      }
    }
  }
  return { width: w, height: h, data: rgba, hasAlphaChannel: ctype === 4 || ctype === 6 || !!trns };
}

// Encode RGBA8 pixels. alpha:false writes colour type 2 (RGB) and drops the alpha bytes — callers flatten() first
// when the image is not fully opaque. level: zlib level (intermediates use 1: they are read once by sips).
export function encodePNG(w, h, rgba, { alpha = true, level = 9 } = {}) {
  const cpp = alpha ? 4 : 3, stride = w * cpp;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    const dst = y * (stride + 1) + 1;
    if (alpha) rgba.copy(raw, dst, y * w * 4, (y + 1) * w * 4);
    else for (let x = 0, s = y * w * 4, d = dst; x < w; x++, s += 4, d += 3) { raw[d] = rgba[s]; raw[d + 1] = rgba[s + 1]; raw[d + 2] = rgba[s + 2]; }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = alpha ? 6 : 2;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level })), chunk('IEND', Buffer.alloc(0))]);
}

// Exact pixel crop (row copies). Throws when the rectangle leaves the image (doc 06 §7.5 check 2).
export function crop(img, { x, y, w, h }, label = '') {
  if (![x, y, w, h].every(Number.isInteger) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > img.width || y + h > img.height) {
    throw new Error(`crop ${x},${y} ${w}x${h} outside ${img.width}x${img.height}${label ? `: ${label}` : ''}`);
  }
  const out = Buffer.alloc(w * h * 4);
  for (let r = 0; r < h; r++) img.data.copy(out, r * w * 4, ((y + r) * img.width + x) * 4, ((y + r) * img.width + x + w) * 4);
  return { width: w, height: h, data: out, hasAlphaChannel: img.hasAlphaChannel };
}

// Composite over an opaque colour (default white, doc 06 §7.2 "JPEG 回退把透明区压成白色"); returns a new image.
export function flatten(img, [br, bg, bb] = [255, 255, 255]) {
  const d = Buffer.from(img.data);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 255) continue;
    d[i] = Math.round((d[i] * a + br * (255 - a)) / 255);
    d[i + 1] = Math.round((d[i + 1] * a + bg * (255 - a)) / 255);
    d[i + 2] = Math.round((d[i + 2] * a + bb * (255 - a)) / 255);
    d[i + 3] = 255;
  }
  return { width: img.width, height: img.height, data: d, hasAlphaChannel: false };
}

// share of fully opaque pixels (alpha = 255)
export function opaqueShare(img) {
  let n = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] === 255) n++;
  return n / (img.width * img.height);
}

// luminance standard deviation of rows [y0, y1) — "excerpt edges fall on blank rows" hint (doc 05 §7.1, A19);
// over the whole image it doubles as a blank-image detector.
export function rowStd(img, y0, y1) {
  let n = 0, s = 0, s2 = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < img.width; x++) {
    const o = (y * img.width + x) * 4;
    const l = 0.2126 * img.data[o] + 0.7152 * img.data[o + 1] + 0.0722 * img.data[o + 2];
    n++; s += l; s2 += l * l;
  }
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
}

// share of pixels with alpha <= `max` (0 = fully transparent)
export function transparentShare(img, max = 8) {
  let t = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] <= max) t++;
  return t / (img.width * img.height);
}

// share of "ink" pixels in rows [y0, y1): luminance differs from the row median by more than `thr`.
// The excerpt-edge GATE (prototype G4): a blank row crossing a light-grey card on white has σ ≈ 5–6 but no ink, so
// σ < 4 (doc 05 A19 as written) would reject the doc's own coordinates; σ stays a hint.
export function inkShare(img, y0, y1, thr = 48) {
  let ink = 0, n = 0;
  for (let y = y0; y < y1; y++) {
    const row = [];
    for (let x = 0; x < img.width; x++) { const o = (y * img.width + x) * 4; row.push(0.2126 * img.data[o] + 0.7152 * img.data[o + 1] + 0.0722 * img.data[o + 2]); }
    const med = [...row].sort((a, b) => a - b)[row.length >> 1];
    for (const l of row) { n++; if (Math.abs(l - med) > thr) ink++; }
  }
  return ink / n;
}
