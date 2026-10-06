// Thai line-break hints (doc 05 §3.5, doc 08 §7.7): Chrome breaks Thai with the ICU dictionary. This script takes the
// clean copy (th.src.json) and writes src/locales/th.json with U+2060 WORD JOINER inserted at every ICU break
// opportunity that falls INSIDE a protected unit:
//   ALWAYS units  — loanwords / words ICU mis-segments ("คลา|วด์", "เอน|จิ|นภา|ย", "การก|ระ|ทำ", "ชัง|ก์"): every laid-out key
//   HEADING units — compounds and set phrases that must not split in headings and heading-like labels
// Never touched: meta.title / description / ogHeadline (plain text for <title>, meta, og:title), seo.*, alt texts,
// aria-only labels, English sample text. Also: number placeholder + classifier joined by NBSP ("{n} ภาษา"), and the
// repetition mark written RI-style with a no-break space ("อื่น ๆ") so it never starts a line.
// Usage: node glue-th.mjs <th.src.json> <out th.json> [--report]
import { readFileSync, writeFileSync } from 'node:fs';

const [src, out] = process.argv.slice(2);
const report = process.argv.includes('--report');
const t = JSON.parse(readFileSync(src, 'utf8'));
const WJ = '⁠';
const seg = new Intl.Segmenter('th', { granularity: 'word' });

const SKIP = [/^seo\./, /^meta\.(title|description|ogHeadline|ogImageAlt|appStoreName|appStoreSubtitle)$/, /(^|\.)(alt|\w*Alt)$/,
  /^nav\.aria/, /^common\.demoLabel$/, /^demo\.(sourceLang|articleTitle|byline|source|context|ui\.domain)/, /\.sample\.(source|handle|sentence|chunks|flow|flowLabel)/,
  /^features\[[^\]]+\]\.(id|image)$/, /\.id$/, /^footer\.copyright$/];
const HEADING = [/^hero\.(eyebrow|title|lede|ledeShort|ctaNote|secondaryCta)$/, /^meta\.ogSubline$/, /^featuresIntro\.title$/, /^features\[[^\]]+\]\.title$/,
  /^gallery\.(title|items\[[^\]]+\]\.caption)$/, /^languages\.(title|uiCount|targetCount|targetListLabel)$/, /^pricing\.(title|table\.(caption|groups\.\w+|rows\.\w+))$/,
  /^faq\.(title|items\[[^\]]+\]\.q)$/, /^sibling\.card\.(eyebrow|title|points\[\d+\]|note|shotCaption)$/, /^sibling\.footer\.(heading|linkText)$/,
  /^cta\.(title|recap)$/, /^common\.(screenshotLabel|screenshotExcerptLabel)$/, /\.sample\.label$/, /^demo\.caption$/];

const ALWAYS = ['เอนจิน', 'คลาวด์', 'บนคลาวด์', 'ภายใน', 'ชังก์', 'อัปเกรด', 'การกระทำ', 'คำอธิบาย',
  // app UI names quoted in sentences stay in one piece
  'ประวัติการแปลแบบสไลด์', 'รับคำอธิบายไวยากรณ์', 'อัปเกรดตอนนี้', 'กู้คืนการซื้อ'];
const HEADING_UNITS = [
  // compound words ICU splits at a morpheme boundary, bound prefixes (การ / ความ / ผู้ / นัก), numeral + classifier, app names
  'หน้าเว็บ', 'คำแปล', 'ความหมาย', 'ผู้เรียน', 'ผู้พัฒนา', 'นักพัฒนา', 'สองครั้ง', 'ทางขวา', 'ภาษาอังกฤษ', 'ภาษาไทย', 'สองภาษา', 'หลายภาษา',
  'คำจำกัดความ', 'เพิ่มเติม', 'ฉบับเต็ม', 'การตั้งค่า', 'การเลือก', 'การแปล', 'การค้นหา', 'การออกเสียง', 'การแสดง', 'การแยก', 'การทำงาน', 'การอ่าน',
  'ตั้งค่า', 'เกี่ยวกับ', 'หรือเปล่า', 'คำต่อคำ', 'น่าลอง', 'ต่อวัน', 'รายวัน', 'หน้าจอ', 'ภาพหน้าจอ', 'ภาพประกอบ', 'ภาพจำลอง', 'เครื่องมือ',
  'อ่านออกเสียง', 'ในตัว', 'ครั้งเดียว', 'รูปแบบ', 'ใช้งาน', 'แอปช่วยอ่าน', 'แอปอ่านเว็บ', 'ปัดเพื่อแปล', 'ข่าวอังกฤษแปลคู่',
  // phrases whose split leaves a dangling preposition / particle or splits a fixed label (checked at 320–1280 px)
  'ผู้เรียนภาษา', 'บนเว็บไซต์', 'อ่านคู่ต้นฉบับ', 'จากต้นฉบับ', 'อ่านเยอะขึ้น', 'ค่อยอัปเกรด', 'ข่าวภาษาอังกฤษ', 'แบบสองภาษา', 'ได้ไหม',
  'มีเท่าไร', 'ได้อย่างไร', 'อ่านด้วย', 'เสียงในเครื่อง', 'ภายในเครื่อง', 'เพื่อค้นหา', 'แอปเป็นภาษาอังกฤษ', 'สไตล์การแปล', 'โหมดการแปล',
  'โหมดการอ่าน', 'รายการเต็ม',
];

const test = (list, p) => list.some((r) => r.test(p));
const changed = [];
const longChunks = [];

function glueString(str, path) {
  if (!/[฀-๿]/.test(str)) return str;
  // NBSP: number placeholder + classifier, and the repetition mark
  let s = str.replace(/\} (ภาษา|ครั้ง)/g, '} $1').replace(/([฀-๿])\s?ๆ/g, '$1 ๆ');
  const units = test(HEADING, path) ? [...ALWAYS, ...HEADING_UNITS] : ALWAYS;
  // display text (what Chrome lays out): drop [[ ]] markers; map display index → source index
  const map = [];
  let disp = '';
  for (let i = 0; i < s.length; i++) {
    if ((s[i] === '[' && s[i + 1] === '[') || (s[i] === ']' && s[i + 1] === ']')) { i++; continue; }
    map.push(i); disp += s[i];
  }
  const bounds = new Set();
  for (const x of seg.segment(disp)) if (x.index > 0) bounds.add(x.index);
  const glueAt = new Set();
  for (const u of units) {
    let from = 0, k;
    while ((k = disp.indexOf(u, from)) >= 0) {
      for (let b = k + 1; b < k + u.length; b++) if (bounds.has(b)) glueAt.add(b);
      from = k + 1;
    }
  }
  if (!glueAt.size) return s;
  // insert WJ before the source char at display index b (before any [[ / ]] marker sitting there)
  const srcPos = [...glueAt].map((b) => { let p = map[b]; while (p >= 2 && (s.slice(p - 2, p) === '[[' || s.slice(p - 2, p) === ']]')) p -= 2; return p; });
  srcPos.sort((a, b) => b - a);
  for (const p of srcPos) s = s.slice(0, p) + WJ + s.slice(p);
  changed.push(path);
  // report chunks (ICU boundaries minus glued ones) longer than 16 visible characters
  const chunks = [];
  let last = 0;
  for (const x of seg.segment(disp)) {
    if (x.index > 0 && !glueAt.has(x.index)) { chunks.push(disp.slice(last, x.index)); last = x.index; }
  }
  chunks.push(disp.slice(last));
  for (const c of chunks) { if (/^[{}\w.]+$/.test(c.trim())) continue; const v = [...c.trim()].filter((ch) => !/[\p{Mn}\p{Me}]/u.test(ch)).length; if (v > 16) longChunks.push(`${path}: "${c.trim()}" (${v})`); }
  if (report) console.log(`${path}\n   ${chunks.map((c) => c.trim()).filter(Boolean).join(' | ')}`);
  return s;
}

function walk(o, p = '') {
  if (Array.isArray(o)) return o.map((v, i) => walk(v, `${p}[${v?.id ?? i}]`));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, walk(v, p ? `${p}.${k}` : k)]));
  if (typeof o !== 'string' || test(SKIP, p)) return o;
  return glueString(o, p);
}

const res = walk(t);
// serialize with U+2060 / U+00A0 written as escapes, so reviewers can see them
const json = JSON.stringify(res, null, 2).replace(/⁠/g, '\\u2060').replace(/ /g, '\\u00a0') + '\n';
writeFileSync(out, json);
console.error(`glued ${changed.length} keys; long chunks: ${longChunks.length ? '\n  ' + longChunks.join('\n  ') : 'none'}`);
