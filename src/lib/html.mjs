// HTML & copy helpers shared by templates (doc 06 §2.1 lib/html.mjs, §4.1 markup types).
//   text   → esc(fill(s))
//   kwtext → mk(fill(s))   [[keyword]] (H1 / OG only, R65) and {wbr} (CJK headings, R61)
//   rich   → rich(fill(s)) **strong**, [text](@ref), blank line = new paragraph

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// attrs({ lang: 'ja', hidden: true, x: null }) → ' lang="ja" hidden'
export const attrs = (o) => Object.entries(o)
  .filter(([, v]) => v !== null && v !== undefined && v !== false)
  .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
  .join('');

// Tagged template that joins arrays and drops null/false/undefined.
export const html = (strings, ...vals) => strings.reduce((out, s, i) => {
  const v = vals[i - 1];
  const part = Array.isArray(v) ? v.join('') : (v === null || v === undefined || v === false ? '' : v);
  return out + part + s;
});

// Plain text for <title>, meta, JSON-LD, alt, aria-label: strip [[ ]], {wbr} and **.
export const plain = (s) => String(s ?? '').replace(/\[\[|\]\]/g, '').replaceAll('{wbr}', '').replace(/\*\*/g, '');

// Headings (H2/H3 …): [[ ]] is not honoured outside the H1 (R65); {wbr} → <wbr>.
export const head = (s) => esc(String(s ?? '').replace(/\[\[|\]\]/g, '')).replaceAll('{wbr}', '<wbr>');

// Page H1 / kwtext: exactly one [[phrase]] becomes the highlighter span; {wbr} → <wbr>.
export const mk = (s) => esc(s).replace(/\[\[(.+?)\]\]/, '<span class="kw">$1</span>')
  .replace(/\[\[|\]\]/g, '').replaceAll('{wbr}', '<wbr>');

// rich: **strong**, [text](@ref) with a whitelist of refs (doc 06 §4.1), paragraphs on blank lines.
export function rich(s, refs) {
  return String(s ?? '').split(/\n{2,}/).map((para) => esc(para)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((@[a-z-]+)\)/g, (_, text, ref) => {
      if (!(ref in refs)) throw new Error(`unknown rich ref ${ref}`);
      const r = refs[ref];
      return r ? `<a href="${esc(r.href)}"${attrs(r.attrs ?? {})}>${text}</a>` : text; // null ref → plain text (D-11)
    })).join('</p><p>');
}

// ———————————————————————————— placeholders & plurals (doc 06 §4.1, R62) ————————————————————————————

// Find the matching closing brace for a "{" at index i (handles nested ICU branches).
function closeBrace(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return j;
  }
  return -1;
}

// fill('{targetLanguages} languages', vars, 'ja')
// vars: flat map of placeholder → value. ICU-lite plural: {n, plural, one{# язык} few{…} other{…}}.
// `{wbr}` is a markup token, not data: it is left untouched for mk()/head()/plain().
export function fill(s, vars, locale) {
  const str = String(s ?? '');
  let out = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== '{') { out += str[i]; continue; }
    const end = closeBrace(str, i);
    if (end < 0) throw new Error(`unbalanced "{" in: ${str}`);
    const body = str.slice(i + 1, end);
    i = end;
    if (body === 'wbr') { out += '{wbr}'; continue; }
    const plural = body.match(/^\s*([\w.]+)\s*,\s*plural\s*,(.*)$/s);
    if (plural) {
      const [, key, branchesSrc] = plural;
      const n = Number(lookup(vars, key, str));
      const branches = {};
      for (let k = 0; k < branchesSrc.length; k++) {
        const m = branchesSrc.slice(k).match(/^\s*(zero|one|two|few|many|other|=\d+)\s*\{/);
        if (!m) continue;
        const open = k + m[0].length - 1;
        const close = closeBrace(branchesSrc, open);
        branches[m[1]] = branchesSrc.slice(open + 1, close);
        k = close;
      }
      if (!('other' in branches)) throw new Error(`plural without "other" branch in: ${str}`);
      const cat = branches[`=${n}`] !== undefined ? `=${n}` : new Intl.PluralRules(locale).select(n);
      const branch = branches[cat] ?? branches.other;
      out += fill(branch.replaceAll('#', new Intl.NumberFormat(locale).format(n)), vars, locale);
      continue;
    }
    out += String(lookup(vars, body.trim(), str));
  }
  return out;
}

function lookup(vars, key, context) {
  if (!(key in vars)) throw new Error(`unknown placeholder {${key}} in: ${context}`);
  return vars[key];
}

const nbsp = (s) => String(s).replace(/ /g, '\u00a0');

// Flatten product.json + SITE into the placeholder namespace used by doc 08 §1.4.
export function placeholderVars({ product, SITE, locale, year, extra = {} }) {
  // RTL (ar): a Latin / number run inside Arabic text keeps its own order in an LRI…PDI isolate, so "3.99 US$" does
  // not render as "$US 3.99" nor "iOS 18" as "18 iOS" (doc 08 §7.7: the template wraps mixed runs, the copy has no controls)
  const ltr = locale.dir === 'rtl' ? (s) => `\u2066${s}\u2069` : (s) => s;
  const v = {
    uiLanguages: product.wbw.uiLanguages,
    targetLanguages: product.wbw.targetLanguages,
    minOS: ltr(nbsp(product.wbw.minOS)),         // "iOS 18" / "macOS 15" never break inside: a line ending in "(macOS" reads as cut off
    minMacOS: ltr(nbsp(product.wbw.minMacOS)),
    version: product.wbw.version,
    versionDate: product.wbw.versionDate,
    releaseDate: product.wbw.releaseDate,
    'plus.priceUS': ltr(new Intl.NumberFormat(locale.code, { style: 'currency', currency: 'USD' }).format(product.wbw.plus.priceUSD).replace(/[\u200e\u200f]/g, '')),
    'se.levels': ltr(product.se.levels.replace(/–/g, '\u2060–\u2060')), // "A1–C1" never breaks after the dash
    'se.uiLanguages': product.se.uiLanguages,
    'se.targetLanguages': product.se.targetLanguages,
    'ext.version': product.ext.version,
    'ext.targetLanguages': product.ext.targetLanguages,
    'ext.minChrome': product.ext.minChrome,
    supportEmail: SITE.supportEmail,
    yearRange: `2025–${year}`,
    ...extra,
  };
  for (const [k, q] of Object.entries(product.wbw.quota)) { v[`quota.${k}.free`] = q.free; v[`quota.${k}.plus`] = q.plus; }
  return v;
}
