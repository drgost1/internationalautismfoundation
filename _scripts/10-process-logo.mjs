/* Process the official B&W foundation logo from FB into web-ready variants. */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC = join(ROOT, "_review/fb/04-logo-earth-campus.jpg");
const OUT = join(ROOT, "assets/images");
await mkdir(OUT, { recursive: true });

// full logo — globe + candle + text
await sharp(SRC)
  .resize({ width: 600, fit: "inside" })
  .webp({ quality: 90, effort: 5 })
  .toFile(join(OUT, "logo-full.webp"));

// just the mark — crop to top 70% to remove text
const meta = await sharp(SRC).metadata();
await sharp(SRC)
  .extract({
    left: Math.round(meta.width * 0.12),
    top: 0,
    width: Math.round(meta.width * 0.76),
    height: Math.round(meta.height * 0.72),
  })
  .resize({ width: 400, fit: "inside" })
  .webp({ quality: 92, effort: 5 })
  .toFile(join(OUT, "logo-mark.webp"));

// tiny mark for nav
await sharp(SRC)
  .extract({
    left: Math.round(meta.width * 0.12),
    top: 0,
    width: Math.round(meta.width * 0.76),
    height: Math.round(meta.height * 0.72),
  })
  .resize({ width: 120, fit: "inside" })
  .webp({ quality: 92, effort: 5 })
  .toFile(join(OUT, "logo-nav.webp"));

// Also write a PNG fallback + favicon-sized
await sharp(SRC)
  .resize({ width: 600, fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(join(OUT, "logo-full.png"));

await sharp(SRC)
  .extract({
    left: Math.round(meta.width * 0.12),
    top: 0,
    width: Math.round(meta.width * 0.76),
    height: Math.round(meta.height * 0.72),
  })
  .resize({ width: 128, fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(join(OUT, "favicon-128.png"));

console.log("Logo variants written:");
console.log("  - logo-full.webp (600w, full graphic)");
console.log("  - logo-full.png  (PNG fallback)");
console.log("  - logo-mark.webp (400w, globe+candle only)");
console.log("  - logo-nav.webp  (120w, nav-sized)");
console.log("  - favicon-128.png");
