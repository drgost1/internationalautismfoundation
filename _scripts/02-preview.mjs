/**
 * Generate hi-res preview sheets for SPECIFIC indices.
 * Usage: bun _scripts/02-preview.mjs 175,176,177,178,179
 *  -> writes _review/preview-<set>.jpg
 */
import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC = join(ROOT, "source-images");
const OUT = join(ROOT, "_review");
const META = JSON.parse(await readFile(join(OUT, "metadata.json"), "utf8"));

const arg = process.argv[2];
if (!arg) { console.error("Pass indices: 1,2,3"); process.exit(1); }
const indices = arg.split(",").map((s) => parseInt(s, 10));

const COLS = 3;
const TILE_W = 600;
const TILE_H = 450;
const PAD = 8;
const LABEL_H = 38;
const ROWS = Math.ceil(indices.length / COLS);
const SHEET_W = COLS * (TILE_W + PAD) + PAD;
const SHEET_H = ROWS * (TILE_H + LABEL_H + PAD) + PAD;

const composites = [];
for (let k = 0; k < indices.length; k++) {
  const idx = indices[k];
  const m = META.find((x) => x.i === idx);
  if (!m) { console.warn(`No image at index ${idx}`); continue; }
  const col = k % COLS;
  const row = Math.floor(k / COLS);
  const x = PAD + col * (TILE_W + PAD);
  const y = PAD + row * (TILE_H + LABEL_H + PAD);
  const buf = await sharp(join(SRC, m.f))
    .resize(TILE_W, TILE_H, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82 })
    .toBuffer();
  composites.push({ input: buf, top: y, left: x });
  const label = `#${m.i}  ${m.w}×${m.h}  ${m.orient}`;
  const svg = `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0a0a0a"/>
    <text x="10" y="26" font-family="Inter, sans-serif" font-size="20" fill="#faf7f1" font-weight="700">${label}</text>
  </svg>`;
  composites.push({ input: Buffer.from(svg), top: y + TILE_H, left: x });
}

const tag = arg.replace(/,/g, "_");
const out = join(OUT, `preview-${tag.slice(0, 60)}.jpg`);
await sharp({
  create: { width: SHEET_W, height: SHEET_H, channels: 3, background: "#1a1a1a" },
})
  .composite(composites)
  .jpeg({ quality: 84 })
  .toFile(out);
console.log(`wrote ${out}`);
