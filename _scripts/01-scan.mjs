/**
 * 01 — Scan all images in source-images/, write metadata.json and
 * generate compact contact sheets so we can review them visually.
 */
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC = join(ROOT, "source-images");
const OUT = join(ROOT, "_review");
const META_FILE = join(OUT, "metadata.json");

await mkdir(OUT, { recursive: true });

const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const files = (await readdir(SRC))
  .filter((f) => exts.has(extname(f).toLowerCase()))
  .sort();

console.log(`Scanning ${files.length} images...`);

const meta = [];
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const path = join(SRC, f);
  try {
    const m = await sharp(path).metadata();
    const ratio = m.width && m.height ? +(m.width / m.height).toFixed(3) : null;
    let orient = "?";
    if (ratio) orient = ratio > 1.15 ? "land" : ratio < 0.87 ? "port" : "sq";
    meta.push({
      i,
      f,
      w: m.width,
      h: m.height,
      ratio,
      orient,
      sizeKB: Math.round((m.size || 0) / 1024),
      fmt: m.format,
    });
    if ((i + 1) % 20 === 0) console.log(`  scanned ${i + 1}/${files.length}`);
  } catch (e) {
    console.warn(`  skip ${f}: ${e.message}`);
  }
}

await writeFile(META_FILE, JSON.stringify(meta, null, 2));
console.log(`Wrote ${META_FILE}`);

// Build contact sheets: 5 cols × 5 rows = 25 thumbs per sheet
const COLS = 5;
const ROWS = 5;
const PER = COLS * ROWS;
const TILE_W = 320;
const TILE_H = 240;
const PAD = 6;
const LABEL_H = 28;
const SHEET_W = COLS * (TILE_W + PAD) + PAD;
const SHEET_H = ROWS * (TILE_H + LABEL_H + PAD) + PAD;

let sheetIdx = 0;
for (let start = 0; start < meta.length; start += PER) {
  sheetIdx++;
  const slice = meta.slice(start, start + PER);
  const composites = [];
  for (let k = 0; k < slice.length; k++) {
    const m = slice[k];
    const col = k % COLS;
    const row = Math.floor(k / COLS);
    const x = PAD + col * (TILE_W + PAD);
    const y = PAD + row * (TILE_H + LABEL_H + PAD);
    try {
      const buf = await sharp(join(SRC, m.f))
        .resize(TILE_W, TILE_H, { fit: "cover", position: "centre" })
        .jpeg({ quality: 70 })
        .toBuffer();
      composites.push({ input: buf, top: y, left: x });
      // text label using svg
      const label = `#${m.i}  ${m.w}×${m.h}  ${m.orient}`;
      const svg = `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0a0a"/>
        <text x="6" y="19" font-family="Inter, sans-serif" font-size="13" fill="#faf7f1" font-weight="600">${label}</text>
      </svg>`;
      composites.push({ input: Buffer.from(svg), top: y + TILE_H, left: x });
    } catch (e) {
      console.warn(`  thumb skip ${m.f}: ${e.message}`);
    }
  }
  const out = join(OUT, `sheet-${String(sheetIdx).padStart(2, "0")}.jpg`);
  await sharp({
    create: { width: SHEET_W, height: SHEET_H, channels: 3, background: "#1a1a1a" },
  })
    .composite(composites)
    .jpeg({ quality: 78 })
    .toFile(out);
  console.log(`  wrote ${out} (${slice.length} images, indices ${slice[0].i}-${slice[slice.length - 1].i})`);
}

console.log(`\nDone. ${sheetIdx} contact sheets generated. Open _review/sheet-*.jpg`);
