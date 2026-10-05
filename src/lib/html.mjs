// HTML string helpers shared by templates (doc 06 §2.1 lib/html.mjs).

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// attrs({ lang: 'ja', hidden: true, x: null }) → ' lang="ja" hidden'
export const attrs = (o) => Object.entries(o)
  .filter(([, v]) => v !== null && v !== undefined && v !== false)
  .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
  .join('');

// Tagged template that joins arrays and drops null/false (so templates can inline conditionals).
export const html = (strings, ...vals) => strings.reduce((out, s, i) => {
  const v = vals[i - 1];
  const part = Array.isArray(v) ? v.join('') : (v === null || v === undefined || v === false ? '' : v);
  return out + part + s;
});
