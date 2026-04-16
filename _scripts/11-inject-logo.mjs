/* Inject <img> inside every <span class="brand-mark"> placeholder across HTML pages. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const files = (await readdir(ROOT)).filter((f) => f.endsWith(".html"));

const logoImg = `<img src="assets/images/logo-nav.webp" alt="International Autism Foundation logo" />`;

// Replace self-closing-style empty <span class="brand-mark ..."></span> with one containing the <img>
// Handles both `brand-mark` and `brand-mark inv` classes; also `brand-mark` with inline width/height.
const re = /<span class="brand-mark([^"]*)"([^>]*)><\/span>/g;

let total = 0;
for (const f of files) {
  const path = join(ROOT, f);
  const s = await readFile(path, "utf8");
  let count = 0;
  const out = s.replace(re, (m, extraClass, extraAttrs) => {
    count++;
    return `<span class="brand-mark${extraClass}"${extraAttrs}>${logoImg}</span>`;
  });
  if (count) {
    await writeFile(path, out);
    console.log(`${f}: ${count} logo chips injected`);
    total += count;
  } else {
    console.log(`${f}: no brand-mark placeholders`);
  }
}
console.log(`\nTotal ${total} replaced.`);
