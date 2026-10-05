// Text length metrics per writing system (doc 03 §3.1, R14; doc 06 §3.8 `textLength`, §4.1, L-8).
//
//   latn / cyrl / arab → grapheme clusters (Intl.Segmenter): harakat, tanwin and other combining marks merge into the
//                        letter they sit on, so they are not counted on their own (doc 03 §3.1, consistency audit L10)
//   cjk                → full-width width: East Asian Wide / Fullwidth = 1 (kanji, kana, Hangul, ＝、。「」 …), anything
//                        else = 0.5 (Latin letters, digits, spaces, “ ” — ambiguous-width punctuation counts as narrow)
//   thai / deva        → visible characters: code points minus non-spacing / enclosing marks (Mn, Me). Spacing vowel
//                        signs (Mc, e.g. Devanagari ा ि ी) stay; this reproduces doc 03 §3.9 (hi title v47, th title v40)
//
// `wu(s)` is doc 08 §7.6's width unit: East Asian wide = 2, everything else = 1 (so CJK full-width width = wu / 2).

const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });

export function graphemes(s) {
  let n = 0;
  for (const _ of segmenter.segment(String(s ?? ''))) n++; // eslint-disable-line no-unused-vars
  return n;
}

// UAX #11 East Asian Wide (W) and Fullwidth (F) ranges — compact table covering CJK, kana, Hangul, fullwidth forms,
// CJK punctuation and the emoji blocks that are wide by default.
const WIDE = [
  [0x1100, 0x115F], [0x231A, 0x231B], [0x2329, 0x232A], [0x23E9, 0x23EC], [0x23F0, 0x23F0], [0x23F3, 0x23F3],
  [0x25FD, 0x25FE], [0x2614, 0x2615], [0x2648, 0x2653], [0x267F, 0x267F], [0x2693, 0x2693], [0x26A1, 0x26A1],
  [0x26AA, 0x26AB], [0x26BD, 0x26BE], [0x26C4, 0x26C5], [0x26CE, 0x26CE], [0x26D4, 0x26D4], [0x26EA, 0x26EA],
  [0x26F2, 0x26F3], [0x26F5, 0x26F5], [0x26FA, 0x26FA], [0x26FD, 0x26FD], [0x2705, 0x2705], [0x270A, 0x270B],
  [0x2728, 0x2728], [0x274C, 0x274C], [0x274E, 0x274E], [0x2753, 0x2755], [0x2757, 0x2757], [0x2795, 0x2797],
  [0x27B0, 0x27B0], [0x27BF, 0x27BF], [0x2B1B, 0x2B1C], [0x2B50, 0x2B50], [0x2B55, 0x2B55],
  [0x2E80, 0x303E], [0x3041, 0x33FF], [0x3400, 0x4DBF], [0x4E00, 0x9FFF], [0xA000, 0xA4CF], [0xA960, 0xA97F],
  [0xAC00, 0xD7A3], [0xF900, 0xFAFF], [0xFE10, 0xFE19], [0xFE30, 0xFE6F], [0xFF00, 0xFF60], [0xFFE0, 0xFFE6],
  [0x16FE0, 0x16FE4], [0x17000, 0x18AFF], [0x1B000, 0x1B2FF], [0x1F004, 0x1F004], [0x1F0CF, 0x1F0CF],
  [0x1F18E, 0x1F18E], [0x1F191, 0x1F19A], [0x1F200, 0x1F251], [0x1F300, 0x1F64F], [0x1F680, 0x1F6FF],
  [0x1F900, 0x1F9FF], [0x20000, 0x3FFFD],
];

export function isWide(cp) {
  let lo = 0, hi = WIDE.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cp < WIDE[mid][0]) hi = mid - 1;
    else if (cp > WIDE[mid][1]) lo = mid + 1;
    else return true;
  }
  return false;
}

// doc 08 §7.6 width units: wide = 2, other = 1 (per grapheme, judged by its first code point).
export function wu(s) {
  let n = 0;
  for (const { segment } of segmenter.segment(String(s ?? ''))) n += isWide(segment.codePointAt(0)) ? 2 : 1;
  return n;
}

// CJK full-width width (doc 03 §3.1): full-width / Hangul = 1, half-width = 0.5.
export const fullWidth = (s) => wu(s) / 2;

const NON_SPACING = /[\p{Mn}\p{Me}​-‍⁠﻿]/u;

// Thai / Devanagari: visible characters = code points minus non-spacing marks.
export function visibleChars(s) {
  let n = 0;
  for (const ch of String(s ?? '')) if (!NON_SPACING.test(ch)) n++;
  return n;
}

export const SCRIPTS = ['latn', 'cyrl', 'cjk', 'thai', 'deva', 'arab'];

// textLength(s, script): the length in the unit doc 03 §3.1 uses for that script.
export function textLength(s, script) {
  switch (script) {
    case 'cjk': return fullWidth(s);
    case 'thai':
    case 'deva': return visibleChars(s);
    case 'latn':
    case 'cyrl':
    case 'arab': return graphemes(s);
    default: throw new Error(`textLength: unknown script "${script}"`);
  }
}

// Convert a doc 08 §7.6 limit given in wu into the unit textLength() returns for `script`
// (CJK full-width width = wu / 2; every other script counts one unit per character).
export const wuLimit = (n, script) => (script === 'cjk' ? n / 2 : n);

// Short label for messages: "n57" (graphemes), "w31.5" (full-width), "v40" (visible) — the notation of doc 03 §3.9.
export const unitLabel = (script) => (script === 'cjk' ? 'w' : script === 'thai' || script === 'deva' ? 'v' : 'n');
