// Entry point for `node --test scripts/tests/`: given a directory, Node runs <dir>/index.js as the test file, so this
// imports every *.test.mjs here (`node --test` without arguments finds the *.test.mjs files on its own).

import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
for (const f of readdirSync(here).filter((n) => n.endsWith('.test.mjs')).sort()) await import(`./${f}`);
