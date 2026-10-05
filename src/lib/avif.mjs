// Zero-dependency AVIF (HEIF / ISOBMFF) container parser — doc 06 §3.8 `avifInfo()`, §7.5 layer ①, D-21; R8, R79.
// Reads box metadata only (ftyp, meta → hdlr / pitm / iinf / iref / iloc / iprp(ipco + ipma) / idat) and never
// decodes pixels, so it runs anywhere (Mac, Linux CI, the CF build machine).
//
// Why it exists (R8, prototype K1/G5, ENG-05): `sips` writes any AVIF whose side exceeds 1024px as a `grid` of
// 512px tiles, and Chrome (libavif) renders a 4:2:0 grid with an odd output width/height as a fully transparent
// image — a "white board" on the page. The pipeline (scripts/images.mjs) therefore trims every image to even
// dimensions before encoding; avifProblems() is the cheap structural gate that catches a regression without a browser.
//
//   avifInfo(buf)  → { width, height, grid, tiles?, alpha, chroma, depth, brand, brands, primaryType, items, … }
//   avifProblems(info, { width, height }?) → string[]   ([] = passes the structure gate)

const u8 = (b, o) => b[o];
const u16 = (b, o) => b.readUInt16BE(o);
const u32 = (b, o) => b.readUInt32BE(o);
const fourcc = (b, o) => b.toString('latin1', o, o + 4);

// read an unsigned big-endian integer of `n` bytes (0, 4 or 8 in iloc)
function uN(b, o, n) {
  if (n === 0) return 0;
  if (n === 4) return u32(b, o);
  if (n === 8) return Number(b.readBigUInt64BE(o));
  if (n === 2) return u16(b, o);
  if (n === 1) return u8(b, o);
  throw new Error(`unsupported field size ${n}`);
}

// iterate the boxes in [start, end): yields { type, start (header), body, end }
function* boxes(b, start, end) {
  let off = start;
  while (off + 8 <= end) {
    let size = u32(b, off), hdr = 8;
    const type = fourcc(b, off + 4);
    if (size === 1) { size = Number(b.readBigUInt64BE(off + 8)); hdr = 16; } else if (size === 0) size = end - off;
    if (type === 'uuid') hdr += 16;
    if (size < hdr || off + size > end) throw new Error(`malformed box "${type}" at ${off} (size ${size})`);
    yield { type, start: off, body: off + hdr, end: off + size };
    off += size;
  }
}
const child = (b, box, type, skip = 0) => {
  for (const c of boxes(b, box.body + skip, box.end)) if (c.type === type) return c;
  return null;
};
const cstring = (b, o, end) => { let e = o; while (e < end && b[e] !== 0) e++; return b.toString('utf8', o, e); };

const ALPHA_URNS = new Set(['urn:mpeg:mpegB:cicp:systems:auxiliary:alpha', 'urn:mpeg:hevc:2015:auxid:1']);

export function avifInfo(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  const top = [...boxes(buf, 0, buf.length)];
  const ftyp = top.find((x) => x.type === 'ftyp');
  if (!ftyp) throw new Error('not an ISOBMFF file (no ftyp box)');
  const brand = fourcc(buf, ftyp.body);
  const brands = [brand];
  for (let o = ftyp.body + 8; o + 4 <= ftyp.end; o += 4) brands.push(fourcc(buf, o));
  const meta = top.find((x) => x.type === 'meta');
  if (!meta) throw new Error('no meta box');

  // ---- items: pitm, iinf/infe ----
  const metaKids = [...boxes(buf, meta.body + 4, meta.end)];        // meta is a FullBox
  const find = (t) => metaKids.find((x) => x.type === t);
  const hdlr = find('hdlr');
  const handler = hdlr ? fourcc(buf, hdlr.body + 8) : null;
  const pitm = find('pitm');
  if (!pitm) throw new Error('no pitm (primary item) box');
  const primaryId = u8(buf, pitm.body) === 0 ? u16(buf, pitm.body + 4) : u32(buf, pitm.body + 4);

  const items = new Map();                                            // id → { type, hidden }
  const iinf = find('iinf');
  if (iinf) {
    const v = u8(buf, iinf.body);
    for (const infe of boxes(buf, iinf.body + 4 + (v === 0 ? 2 : 4), iinf.end)) {
      if (infe.type !== 'infe') continue;
      const iv = u8(buf, infe.body), flags = u32(buf, infe.body) & 0xffffff;
      if (iv < 2) continue;                                           // v0/v1 carry no item_type (not used by AVIF)
      const idLen = iv === 2 ? 2 : 4;
      const id = idLen === 2 ? u16(buf, infe.body + 4) : u32(buf, infe.body + 4);
      items.set(id, { type: fourcc(buf, infe.body + 4 + idLen + 2), hidden: (flags & 1) === 1 });
    }
  }

  // ---- references: iref (dimg = grid tiles, auxl = auxiliary/alpha) ----
  const refs = [];                                                    // { type, from, to: [] }
  const iref = find('iref');
  if (iref) {
    const wide = u8(buf, iref.body) !== 0;
    for (const r of boxes(buf, iref.body + 4, iref.end)) {
      let o = r.body;
      const from = wide ? u32(buf, o) : u16(buf, o); o += wide ? 4 : 2;
      const n = u16(buf, o); o += 2;
      const to = [];
      for (let i = 0; i < n; i++) { to.push(wide ? u32(buf, o) : u16(buf, o)); o += wide ? 4 : 2; }
      refs.push({ type: r.type, from, to });
    }
  }

  // ---- properties: ipco (1-based list) + ipma (item → property indices) ----
  const props = [];
  const assoc = new Map();                                            // id → [property index]
  const iprp = find('iprp');
  if (iprp) {
    const ipco = child(buf, iprp, 'ipco');
    if (ipco) for (const p of boxes(buf, ipco.body, ipco.end)) props.push(p);
    for (const ipma of boxes(buf, iprp.body, iprp.end)) {
      if (ipma.type !== 'ipma') continue;
      const v = u8(buf, ipma.body), flags = u32(buf, ipma.body) & 0xffffff;
      let o = ipma.body + 4;
      const n = u32(buf, o); o += 4;
      for (let i = 0; i < n; i++) {
        const id = v < 1 ? u16(buf, o) : u32(buf, o); o += v < 1 ? 2 : 4;
        const cnt = u8(buf, o); o += 1;
        const list = assoc.get(id) || [];
        for (let k = 0; k < cnt; k++) {
          const idx = flags & 1 ? u16(buf, o) & 0x7fff : u8(buf, o) & 0x7f; o += flags & 1 ? 2 : 1;
          if (idx) list.push(idx);
        }
        assoc.set(id, list);
      }
    }
  }
  const propsOf = (id) => (assoc.get(id) || []).map((i) => props[i - 1]).filter(Boolean);
  const prop = (id, type) => propsOf(id).find((p) => p.type === type) || null;
  const ispeOf = (id) => { const p = prop(id, 'ispe'); return p ? { w: u32(buf, p.body + 4), h: u32(buf, p.body + 8) } : null; };
  const av1COf = (id) => {
    const p = prop(id, 'av1C');
    if (!p) return null;
    const b2 = u8(buf, p.body + 2);
    const high = (b2 >> 6) & 1, twelve = (b2 >> 5) & 1, mono = (b2 >> 4) & 1, sx = (b2 >> 3) & 1, sy = (b2 >> 2) & 1;
    return { depth: high ? (twelve ? 12 : 10) : 8, chroma: mono ? '4:0:0' : sx && sy ? '4:2:0' : sx ? '4:2:2' : '4:4:4' };
  };
  const auxType = (id) => { const p = prop(id, 'auxC'); return p ? cstring(buf, p.body + 4, p.end) : null; };

  // ---- item data locations: iloc (+ idat) — needed for the grid descriptor ----
  const iloc = find('iloc');
  const idat = find('idat');
  const itemData = (id) => {
    if (!iloc) return null;
    const v = u8(buf, iloc.body);
    let o = iloc.body + 4;
    const s1 = u8(buf, o), s2 = u8(buf, o + 1); o += 2;
    const offSize = s1 >> 4, lenSize = s1 & 15, baseSize = s2 >> 4, idxSize = v === 1 || v === 2 ? s2 & 15 : 0;
    const count = v < 2 ? u16(buf, o) : u32(buf, o); o += v < 2 ? 2 : 4;
    for (let i = 0; i < count; i++) {
      const itemId = v < 2 ? u16(buf, o) : u32(buf, o); o += v < 2 ? 2 : 4;
      let method = 0;
      if (v === 1 || v === 2) { method = u16(buf, o) & 15; o += 2; }
      o += 2;                                                         // data_reference_index
      const base = uN(buf, o, baseSize); o += baseSize;
      const nExt = u16(buf, o); o += 2;
      const parts = [];
      for (let e = 0; e < nExt; e++) {
        o += idxSize;
        const off = uN(buf, o, offSize); o += offSize;
        const len = uN(buf, o, lenSize); o += lenSize;
        parts.push({ off: base + off, len });
      }
      if (itemId !== id) continue;
      const src = method === 1 ? (idat ? buf.subarray(idat.body, idat.end) : null) : method === 0 ? buf : null;
      if (!src) return null;
      return Buffer.concat(parts.map((p) => src.subarray(p.off, p.len ? p.off + p.len : src.length)));
    }
    return null;
  };

  // ---- primary image ----
  const primary = items.get(primaryId);
  if (!primary) throw new Error(`primary item ${primaryId} has no infe entry`);
  const size = ispeOf(primaryId);
  const info = {
    brand, brands, handler,
    primaryType: primary.type,
    items: items.size,
    width: size ? size.w : 0,                                         // displayed size (after clap / irot, below)
    height: size ? size.h : 0,
    coded: size ? { w: size.w, h: size.h } : null,                    // ispe
    grid: primary.type === 'grid',
    alpha: false,
    chroma: null,
    depth: null,
  };

  if (info.grid) {
    const dimg = refs.find((r) => r.type === 'dimg' && r.from === primaryId);
    const tileIds = dimg ? dimg.to : [];
    const t = tileIds.length ? ispeOf(tileIds[0]) : null;
    const tiles = { count: tileIds.length, w: t ? t.w : 0, h: t ? t.h : 0, rows: 0, cols: 0, uniform: true };
    for (const id of tileIds.slice(1)) {
      const s = ispeOf(id);
      if (!s || s.w !== tiles.w || s.h !== tiles.h) tiles.uniform = false;
    }
    const g = itemData(primaryId);                                    // ImageGrid: version, flags, rows-1, cols-1, w, h
    const wide = g && g.length >= 2 && (g[1] & 1) === 1;
    if (g && g.length >= (wide ? 12 : 8)) {
      tiles.rows = g[2] + 1; tiles.cols = g[3] + 1;
      tiles.outW = wide ? g.readUInt32BE(4) : g.readUInt16BE(4);
      tiles.outH = wide ? g.readUInt32BE(8) : g.readUInt16BE(6);
    }
    info.tiles = tiles;
    const c = tileIds.length ? av1COf(tileIds[0]) : null;
    if (c) Object.assign(info, c);
  } else {
    const c = av1COf(primaryId);
    if (c) Object.assign(info, c);
  }

  // alpha = an auxiliary item (auxl → primary) whose auxC is the alpha URN
  for (const r of refs) {
    if (r.type === 'auxl' && r.to.includes(primaryId) && ALPHA_URNS.has(auxType(r.from))) info.alpha = true;
  }

  // colour: nclx code points (sips: sRGB input → nclx 2/2/6 "unspecified"; Display P3 input → embedded ICC "prof")
  const tile0 = info.grid ? refs.find((r) => r.type === 'dimg' && r.from === primaryId)?.to[0] : null;
  const colr = prop(primaryId, 'colr') || (tile0 ? prop(tile0, 'colr') : null);
  if (colr) {
    const kind = fourcc(buf, colr.body);
    info.colr = kind === 'nclx'
      ? { type: kind, primaries: u16(buf, colr.body + 4), transfer: u16(buf, colr.body + 6), matrix: u16(buf, colr.body + 8), fullRange: (u8(buf, colr.body + 10) >> 7) === 1 }
      : { type: kind, bytes: colr.end - colr.body - 4, description: iccDescription(buf.subarray(colr.body + 4, colr.end)) };
  }

  // transforms that change the displayed size. sips writes `irot` 0 and, for an odd size, pads the coded image (ispe)
  // to even and adds a `clap` crop back to the odd size — so width/height report the DISPLAYED size (what the
  // browser lays out) and `coded` keeps the ispe size.
  const clap = prop(primaryId, 'clap');
  if (clap) {
    const wN = u32(buf, clap.body), wD = u32(buf, clap.body + 4), hN = u32(buf, clap.body + 8), hD = u32(buf, clap.body + 12);
    info.clap = { w: wD ? wN / wD : 0, h: hD ? hN / hD : 0 };
    info.width = info.clap.w; info.height = info.clap.h;
  }
  const irot = prop(primaryId, 'irot');
  if (irot) {
    info.rotation = (u8(buf, irot.body) & 3) * 90;
    if (info.rotation % 180) [info.width, info.height] = [info.height, info.width];
  }
  return info;
}

// Description of an embedded ICC profile ('desc' tag: v2 textDescriptionType or v4 multiLocalizedUnicodeType).
function iccDescription(icc) {
  try {
    const n = icc.readUInt32BE(128);
    for (let i = 0; i < n; i++) {
      const e = 132 + i * 12;
      if (icc.toString('latin1', e, e + 4) !== 'desc') continue;
      const off = icc.readUInt32BE(e + 4);
      const type = icc.toString('latin1', off, off + 4);
      if (type === 'desc') { const len = icc.readUInt32BE(off + 8); return icc.toString('latin1', off + 12, off + 12 + len).replace(/\0+$/, ''); }
      if (type === 'mluc') {
        const recLen = icc.readUInt32BE(off + 20), recOff = icc.readUInt32BE(off + 24);   // first record (lang, country, len, offset)
        const u16be = icc.subarray(off + recOff, off + recOff + recLen);
        let str = '';
        for (let k = 0; k + 1 < u16be.length; k += 2) str += String.fromCharCode(u16be.readUInt16BE(k));
        return str;
      }
    }
  } catch { /* malformed profile: fall through */ }
  return null;
}

// Structure gate (R8, R79; doc 06 §7.5 ①, D-21). Every AVIF must have an even width and height (strictly required
// for grids / sides > 1024, where an odd size makes Chrome render the image fully transparent; D-21 requires it for
// all). `expect` = { width, height } from images.json.
export function avifProblems(info, expect = null) {
  const out = [];
  if (!info.brands.some((b) => b === 'avif' || b === 'avis')) out.push(`brands ${info.brands.join('/')} do not include "avif"`);
  if (!['av01', 'grid'].includes(info.primaryType)) out.push(`primary item type "${info.primaryType}" (expected av01 or grid)`);
  if (!info.width || !info.height) out.push('primary item has no ispe (image size)');
  else if (info.width % 2 || info.height % 2) {
    out.push(info.grid || Math.max(info.width, info.height) > 1024
      ? `${info.width}x${info.height} is odd in a ${info.grid ? `grid of ${info.tiles.w}x${info.tiles.h} tiles` : '>1024px image'} — Chrome renders it fully transparent (R8)`
      : `${info.width}x${info.height} has an odd side (D-21 requires even width and height)`);
  }
  if (info.grid) {
    const t = info.tiles;
    if (!t.count || !t.w || !t.h) out.push('grid without tiles (dimg references / tile ispe missing)');
    else {
      if (!t.uniform) out.push('grid tiles have different sizes');
      if (t.rows && t.cols) {
        if (t.rows * t.cols !== t.count) out.push(`grid ${t.cols}x${t.rows} but ${t.count} tiles`);
        if (t.cols * t.w < info.width || t.rows * t.h < info.height) out.push(`tiles ${t.cols}x${t.rows} of ${t.w}x${t.h} do not cover ${info.width}x${info.height}`);
        const c = info.coded || { w: 0, h: 0 };
        if (t.outW !== undefined && (t.outW !== c.w || t.outH !== c.h)) out.push(`grid output ${t.outW}x${t.outH} differs from ispe ${c.w}x${c.h}`);
      }
    }
  }
  // every site image is sRGB (doc 05 §7.1: Display P3 sources are converted, else #CC3355 drifts from the CSS red)
  if (info.colr?.type === 'nclx' && ![1, 2].includes(info.colr.primaries)) out.push(`colour primaries ${info.colr.primaries} (expected 1 = sRGB/BT.709; P3 source not converted?)`);
  if (info.colr && info.colr.type !== 'nclx' && !/sRGB/i.test(info.colr.description || '')) out.push(`embedded ICC profile "${info.colr.description ?? '?'}" (expected sRGB; P3 source not converted?)`);
  if (info.clap) out.push(`unexpected clean-aperture crop (clap ${info.clap.w}x${info.clap.h})`);
  if (info.rotation) out.push(`unexpected rotation (irot ${info.rotation}°)`);
  if (expect && (expect.width !== info.width || expect.height !== info.height)) {
    out.push(`size ${info.width}x${info.height} differs from images.json ${expect.width}x${expect.height}`);
  }
  return out;
}
