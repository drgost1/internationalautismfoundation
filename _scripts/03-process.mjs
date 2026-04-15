/**
 * 03 — Read picks.json, crop each source image to slot aspect, resize, convert to webp.
 * Writes to assets/images/.
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC_DIR = join(ROOT, "source-images");
const OUT_DIR = join(ROOT, "assets/images");
const META = JSON.parse(await readFile(join(ROOT, "_review/metadata.json"), "utf8"));
const PICKS = JSON.parse(await readFile(join(ROOT, "_scripts/picks.json"), "utf8"));

await mkdir(OUT_DIR, { recursive: true });

// Helpers
const TARGET_LONG = 1600; // longest edge for content images

function parseAspect(a) {
  if (!a) return null;
  const [w, h] = a.split("/").map(Number);
  return w / h;
}

let count = 0;
for (const p of PICKS.slots) {
  const m = META.find((x) => x.i === p.src);
  if (!m) { console.warn(`No source for ${p.slot} (#${p.src})`); continue; }
  const inPath = join(SRC_DIR, m.f);
  const outPath = join(OUT_DIR, p.outName);

  try {
    const aspect = parseAspect(p.aspect);
    let pipeline = sharp(inPath, { failOn: "none" }).rotate(); // honor EXIF orientation

    if (aspect) {
      // Compute target dimensions to fit aspect
      let targetW, targetH;
      if (aspect >= 1) {
        targetW = TARGET_LONG;
        targetH = Math.round(TARGET_LONG / aspect);
      } else {
        targetH = TARGET_LONG;
        targetW = Math.round(TARGET_LONG * aspect);
      }
      // Sharp's resize with cover crops to aspect + downscales
      const focusY = p.focusY ?? 0.5; // default centre vertically
      pipeline = pipeline.resize({
        width: targetW,
        height: targetH,
        fit: "cover",
        position: focusY < 0.4 ? "top" : focusY > 0.6 ? "bottom" : "centre",
      });
    } else if (p.fit === "contain") {
      // Logo — keep aspect, just shrink to max long edge
      pipeline = pipeline.resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: false });
    }

    await pipeline
      .webp({ quality: 82, effort: 5 })
      .toFile(outPath);

    // also write a JPEG fallback for older browsers (smaller than original)
    if (!p.outName.endsWith(".webp")) continue;
    const jpegPath = outPath.replace(/\.webp$/, ".jpg");
    let jpegPipe = sharp(inPath, { failOn: "none" }).rotate();
    if (aspect) {
      let tW, tH;
      if (aspect >= 1) { tW = TARGET_LONG; tH = Math.round(TARGET_LONG / aspect); }
      else             { tH = TARGET_LONG; tW = Math.round(TARGET_LONG * aspect); }
      const focusY = p.focusY ?? 0.5;
      jpegPipe = jpegPipe.resize({ width: tW, height: tH, fit: "cover",
        position: focusY < 0.4 ? "top" : focusY > 0.6 ? "bottom" : "centre" });
    }
    await jpegPipe.jpeg({ quality: 80, mozjpeg: true }).toFile(jpegPath);

    count++;
    if (count % 5 === 0) console.log(`  processed ${count}/${PICKS.slots.length}`);
  } catch (e) {
    console.error(`Failed ${p.slot}: ${e.message}`);
  }
}

console.log(`\nDone. ${count} image variants written to ${OUT_DIR}`);

// Build a swap map for HTML update
const swaps = {};
const unsplashRe = /https:\/\/images\.unsplash\.com\/[^"\s]+|https:\/\/i\.pravatar\.cc\/[^"\s]+/g;
for (const p of PICKS.slots) {
  // We'll map by data-slot name (outName without extension) to local path
  const slotKey = p.outName.replace(/\.webp$/, "");
  swaps[slotKey] = `assets/images/${p.outName}`;
}
await writeFile(join(ROOT, "_scripts/swaps.json"), JSON.stringify(swaps, null, 2));
console.log("Wrote _scripts/swaps.json");
