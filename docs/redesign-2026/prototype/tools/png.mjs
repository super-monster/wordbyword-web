// Minimal PNG codec (zero deps, Node 24): decode any non-interlaced PNG to RGBA8, encode RGBA8.
// Used by build-images.mjs (status-bar colour sampling, favicon rounding) and avif-check.mjs (R58 alpha check).
import { inflateSync, deflateSync, crc32 } from 'node:zlib';

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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

export function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// luminance standard deviation of rows [y0, y1) — used for "excerpt edges fall on blank rows" (05 §7.1, A19)
export function rowStd(img, y0, y1) {
  let n = 0, s = 0, s2 = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < img.width; x++) {
    const o = (y * img.width + x) * 4;
    const l = 0.2126 * img.data[o] + 0.7152 * img.data[o + 1] + 0.0722 * img.data[o + 2];
    n++; s += l; s2 += l * l;
  }
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
}

// share of pixels with alpha below `max` (0 = fully transparent)
export function transparentShare(img, max = 8) {
  let t = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] <= max) t++;
  return t / (img.width * img.height);
}

// share of "ink" pixels in rows [y0, y1): luminance differs from the row median by more than `thr`.
// Complements rowStd: a blank row that crosses a light-grey card on white has σ ≈ 5–6 but no ink (05 §7.1 / A19).
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
