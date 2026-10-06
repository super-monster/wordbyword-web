// Merge th-lint.json into a COPY's src/data/claims-lint.json and keyword-map.json (never the real repo).
// Usage: node lint-merge.mjs <copy-root> <th-lint.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2]);
if (!root.includes('/scratchpad/')) throw new Error(`refusing to write outside the scratchpad: ${root}`);
const lint = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const clFile = join(root, 'src/data/claims-lint.json');
const kmFile = join(root, 'src/data/keyword-map.json');
const cl = JSON.parse(readFileSync(clFile, 'utf8'));
const km = JSON.parse(readFileSync(kmFile, 'utf8'));
const done = [];
for (const [id, pats] of Object.entries(lint.claimsLint)) {
  const rule = cl.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`unknown rule ${id}`);
  if (rule.patterns.th) throw new Error(`rule ${id} already has th patterns`);
  rule.patterns.th = pats;
  done.push(id);
}
const uncovered = cl.rules.filter((r) => !r.patterns.th && !r.patterns['*']).map((r) => r.id);
const starOnly = cl.rules.filter((r) => Object.keys(r.patterns).length === 1 && r.patterns['*']).map((r) => r.id);
km.seOwned.th = [...new Set([...(km.seOwned.th ?? []), ...lint.keywordMap.seOwned])];
km.seOwnedLead.th = lint.keywordMap.seOwnedLead;
km.reserved.G1.th = lint.keywordMap.reservedG1;
writeFileSync(clFile, JSON.stringify(cl, null, 2) + '\n');
writeFileSync(kmFile, JSON.stringify(km, null, 2) + '\n');
console.log(`merged ${done.length} rules: ${done.join(', ')}`);
console.log(`rules without th or '*': ${uncovered.join(', ') || '(none)'}; '*'-only: ${starOnly.join(', ')}`);
