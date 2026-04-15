import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC_DIR = join(ROOT, "source-images");
const OUT_DIR = join(ROOT, "assets/images");
const META = JSON.parse(await readFile(join(ROOT, "_review/metadata.json"), "utf8"));
const PICKS = JSON.parse(await readFile(join(ROOT, "_scripts/picks-cinematic.json"), "utf8"));

await mkdir(OUT_DIR, { recursive: true });

const TARGET_LONG = 1920;

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
  const aspect = parseAspect(p.aspect);

  try {
    let tW, tH;
    if (aspect >= 1) { tW = TARGET_LONG; tH = Math.round(TARGET_LONG / aspect); }
    else             { tH = TARGET_LONG; tW = Math.round(TARGET_LONG * aspect); }

    const focusY = p.focusY ?? 0.5;
    const pos = focusY < 0.4 ? "top" : focusY > 0.6 ? "bottom" : "centre";

    await sharp(inPath, { failOn: "none" })
      .rotate()
      .resize({ width: tW, height: tH, fit: "cover", position: pos })
      .webp({ quality: 80, effort: 5 })
      .toFile(outPath);

    count++;
  } catch (e) {
    console.error(`Failed ${p.slot}: ${e.message}`);
  }
}
console.log(`Done. ${count} cinematic crops written.`);
