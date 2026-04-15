/**
 * 04 — Walk every <img data-slot="X.jpg"> and replace src with assets/images/X.webp.
 * Strips orphaned project-1/2/3 if needed, leaves data-slot for future swap.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const PAGES = ["index.html", "about.html", "projects.html", "services.html", "gallery.html", "contact.html"];
const IMAGES_DIR = join(ROOT, "assets/images");

const available = new Set((await readdir(IMAGES_DIR)).filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, "")));
console.log(`Have ${available.size} local webp images.`);

const imgRe = /<img\b([^>]*?)\bdata-slot="([^"]+)"([^>]*)>/g;
const srcRe = /\bsrc="[^"]*"/;

let totalReplacements = 0;
let totalKept = 0;

for (const page of PAGES) {
  const path = join(ROOT, page);
  const html = await readFile(path, "utf8");
  let pageReplacements = 0;
  let pageKept = 0;

  const out = html.replace(imgRe, (full, before, slot, after) => {
    const slotName = slot.replace(/\.[a-z]+$/i, ""); // hero-1.jpg -> hero-1
    if (available.has(slotName)) {
      const newSrc = `src="assets/images/${slotName}.webp"`;
      const beforeOut = before.replace(srcRe, "").trimEnd();
      const afterOut = after.replace(srcRe, "");
      pageReplacements++;
      return `<img${beforeOut} ${newSrc} data-slot="${slot}"${afterOut}>`;
    }
    pageKept++;
    return full;
  });

  await writeFile(path, out);
  totalReplacements += pageReplacements;
  totalKept += pageKept;
  console.log(`${page}: ${pageReplacements} swapped, ${pageKept} kept (no local file)`);
}

console.log(`\nTotal: ${totalReplacements} swapped, ${totalKept} unchanged.`);
