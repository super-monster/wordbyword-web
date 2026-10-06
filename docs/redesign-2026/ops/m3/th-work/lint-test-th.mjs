// Test the th lint proposal: (1) the th copy WITHOUT its U+2060 joiners passes L-1…L-14 (the joiners must not be what
// keeps a banned phrase from matching); (2) counter-example sentences hit every rule; (3) legitimate wording does not.
// Usage: node lint-test-th.mjs <copy with th-lint merged> <th-lint.json>
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2]);
const lint = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const imp = (p) => import(pathToFileURL(resolve(root, p)).href);
const { loadConfig, loadStrings } = await imp('src/lib/context.mjs');
const { validateLocales } = await imp('src/lib/validate.mjs');
const { compileAll } = await imp('src/lib/validate-util.mjs');

// (1) joiner-free copy through the real validator
const cfg = loadConfig(root);
const { strings } = loadStrings(cfg);
const strip = (o) => (Array.isArray(o) ? o.map(strip) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, strip(v)])) : typeof o === 'string' ? o.replace(/⁠/g, '') : o);
strings.th = strip(strings.th);
cfg.data = { glossary: { th: strip(JSON.parse(readFileSync(resolve(root, 'src/data/glossary/th.json'), 'utf8'))) } };
const issues = { error: [], warn: [] };
validateLocales(cfg, strings, issues);
const thErr = issues.error.filter((m) => /\bth\b/.test(m));
const thWarn = issues.warn.filter((m) => /(^|\s)th[\s:]/.test(m));
console.log(`(1) joiner-free th copy: ${thErr.length} th error(s)${thErr.length ? '\n  ' + thErr.join('\n  ') : ''}; th warnings: ${thWarn.map((w) => w.split(' ')[0]).join(', ') || 'none'}`);

// (2) counter-examples: every one must hit its rule
const COUNTER = {
  'whole-page': ['แปลทั้งหน้าเว็บได้ในคลิกเดียว', 'WordByWord แปลเว็บไซต์ทั้งหน้าให้อัตโนมัติ', 'แตะครั้งเดียวก็แปลได้ทั้งหน้า'],
  'swipe-left': ['ปัดย่อหน้าไปทางซ้ายเพื่อแปล', 'สไลด์ซ้ายเพื่อดูคำแปล'],
  'safari-extension': ['WordByWord เป็นส่วนขยายของ Safari', 'แปลได้ในแอปไหนก็ได้', 'ใช้งานได้โดยไม่ต้องสลับแอป'],
  'selection-translate': ['เลือกข้อความแล้วแปลได้ทันที', 'ไฮไลต์คำเพื่อแปล', 'แปลทันทีที่เลือก'],
  'offline': ['แปลได้แม้ออฟไลน์', 'ใช้ได้โดยไม่ต้องใช้อินเทอร์เน็ต'],
  'unlimited-ai-voice': ['ออกเสียง AI ได้ไม่จำกัด', 'Plus ฟังเสียง AI ไม่จำกัด', 'การออกเสียง AI ไม่จำกัดจำนวนครั้ง'],
  'dark-mode-theme': ['รองรับโหมดมืด', 'เปลี่ยนธีมสีได้ตามใจ'],
  'shortcuts-volume': ['ตั้งคีย์ลัดสำหรับแปล', 'ปรับระดับเสียงการอ่านได้'],
  'vocab-sync': ['บันทึกคำลงสมุดคำศัพท์', 'ซิงค์ประวัติข้ามอุปกรณ์', 'ทบทวนด้วยแฟลชการ์ด'],
  'android': ['ดาวน์โหลดบน Google Play ได้แล้ว', 'มีเวอร์ชันแอนดรอยด์'],
  'desktop-version': ['มีเวอร์ชันสำหรับคอมพิวเตอร์', 'ดาวน์โหลดแอปสำหรับ Windows'],
  'x-app': ['แปลโพสต์ได้ในแอป X โดยตรง', 'แอปเดียวที่แปล X ได้'],
  'plus-early-access': ['สมาชิก Plus ได้ลองฟีเจอร์ใหม่ก่อนใคร'],
  'privacy-claim': ['ไม่มีการเก็บข้อมูลส่วนตัว', 'แอปไม่เก็บข้อมูลใดๆ'],
  'initial-version': ['เวอร์ชันแรกนี้รองรับ 20 ภาษา'],
  'language-pairs': ['รองรับมากกว่า 20 คู่ภาษา', 'แปลระหว่างภาษากว่า 20 คู่'],
  'style-count': ['เลือกได้ 8 สไตล์', 'สไตล์การแปล 7 แบบ', 'มีแปดรูปแบบให้เลือก'],
  'auto-detect-target': ['แอปจะตรวจจับภาษาปลายทางโดยอัตโนมัติ'],
  'history-by-date': ['ประวัติถูกจัดกลุ่มตามวันที่'],
  'plus-only': ['การวิเคราะห์ไวยากรณ์ใช้ได้เฉพาะ Plus', 'ฟีเจอร์นี้สำหรับสมาชิก Plus เท่านั้น'],
  'speaking-practice': ['ช่วยฝึกพูดภาษาอังกฤษ', 'พัฒนาทักษะการฟังและพูดไปพร้อมกัน'],
  'jargon': ['เทียบประโยคต่อประโยคแบบหนึ่งต่อหนึ่ง', 'การจัดแนวประโยคอัจฉริยะ'],
  'replacement-tone': ['ถ้าเรียนภาษาอังกฤษ SurfEnglish อาจเหมาะกว่า', 'ใช้ SurfEnglish แทน WordByWord', 'SurfEnglish แอปพี่น้องของ WordByWord'],
  'se-on-device-voice': ['เสียง AI บนเครื่อง ใช้ออฟไลน์ได้'],
  'se-hype': ['แอปใหม่จากผู้พัฒนา WordByWord', 'เรียนได้เร็วกว่าเดิม', 'อัปเกรดเป็น SurfEnglish'],
  'hype': ['แอปแปลภาษาที่ดีที่สุด', 'ผู้ใช้กว่า 10,000 คน', 'ดาวน์โหลดแล้ว 50,000 ครั้ง', 'จากทีม WordByWord', 'ผู้ช่วยอัจฉริยะสำหรับการเรียนรู้ภาษา', 'บอกลาการคัดลอกไปวาง'],
  'ext-language-count': ['ส่วนขยายแปลได้ 20 ภาษา'],
};
let misses = 0;
for (const [id, list] of Object.entries(COUNTER)) {
  const regs = compileAll(lint.claimsLint[id], 'iu');
  for (const s of list) if (!regs.some((r) => r.test(s))) { misses++; console.log(`  MISS ${id}: ${s}`); }
}
console.log(`(2) counter-examples: ${Object.values(COUNTER).flat().length} sentences, ${misses} missed; rules covered: ${Object.keys(COUNTER).length}/${Object.keys(lint.claimsLint).length}`);

const se = compileAll(lint.keywordMap.seOwned, 'iu');
const lead = compileAll(lint.keywordMap.seOwnedLead, 'iu');
const g1 = compileAll(lint.keywordMap.reservedG1, 'iu');
const MUST = [
  [se, ['อ่านข่าวอังกฤษแปลคู่', 'ฝึกภาษาอังกฤษทุกวัน', 'ข่าวภาษาอังกฤษตามระดับ', 'การแยกชังก์', 'กลุ่มคำภาษาอังกฤษ'], 'seOwned'],
  [lead, ['เรียนภาษาอังกฤษจากข่าว', 'กำลังเรียนภาษาอังกฤษอยู่ใช่ไหม ลอง SurfEnglish'], 'seOwnedLead'],
  [g1, ['วิธีแปลหน้าเว็บบน iPhone โดยเก็บต้นฉบับไว้', 'แปลเว็บบน iPhone ยังไงให้ต้นฉบับอยู่', 'แปลหน้าเว็บอย่างไร'], 'reservedG1'],
];
const MUST_NOT = [
  [se, ['สำหรับผู้เรียนภาษา', 'แอปอ่านเว็บสองภาษาสำหรับผู้เรียนภาษา', 'เรียนภาษาจากเว็บไซต์จริง', 'คำแปลภาษาอังกฤษอยู่ด้านล่าง'], 'seOwned'],
  [lead, ['SurfEnglish: ข่าวภาษาอังกฤษรายวันตามระดับของคุณ', 'คำถามเกี่ยวกับ WordByWord'], 'seOwnedLead'],
  [g1, ['ปัดย่อหน้าบนหน้าเว็บไปทางขวา คำแปลจะแสดงอยู่ใต้ต้นฉบับ', 'เริ่มอ่านเว็บไซต์แบบสองภาษาบน iPhone', 'สำหรับผู้เรียนภาษา: ปัดย่อหน้าไปทางขวาในเบราว์เซอร์ของ WordByWord แล้วคำแปลจะแสดงใต้ต้นฉบับ แตะคำสองครั้งเพื่อดูความหมายตามบริบทด้วย AI ใช้ฟรีบน iPhone และ iPad', 'WordByWord: แอปแปลเว็บไซต์แบบสองภาษาบน iPhone'], 'reservedG1'],
];
let bad = 0;
for (const [regs, list, name] of MUST) for (const s of list) if (!regs.some((r) => r.test(s))) { bad++; console.log(`  MISS ${name}: ${s}`); }
for (const [regs, list, name] of MUST_NOT) for (const s of list) if (regs.some((r) => r.test(s))) { bad++; console.log(`  FALSE HIT ${name}: ${s}`); }
console.log(`(3) keyword-map: ${bad} problem(s) (must-hit ${MUST.reduce((a, x) => a + x[1].length, 0)}, must-not-hit ${MUST_NOT.reduce((a, x) => a + x[1].length, 0)})`);
