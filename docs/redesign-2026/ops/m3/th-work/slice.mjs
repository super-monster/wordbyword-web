import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [src, outDir, sliceH = '1600'] = process.argv.slice(2);
const { decodePNG, encodePNG, crop } = await import('/private/tmp/claude-501/-Users-ike-Dev-WordByWord-wordbyword-web/0090fd2e-9f88-4014-a52d-7056550006aa/scratchpad/wbw-m3-th/scripts/lib/png.mjs');
mkdirSync(outDir, { recursive: true });
const img = decodePNG(readFileSync(src));
const H = Number(sliceH);
for (let y = 0, i = 0; y < img.height; y += H, i++) {
  const h = Math.min(H, img.height - y);
  const part = crop(img, { x: 0, y, w: img.width, h });
  writeFileSync(join(outDir, `s${String(i).padStart(2, '0')}.png`), encodePNG(part.width, part.height, part.data, { level: 1 }));
}
console.log(img.width, img.height);
