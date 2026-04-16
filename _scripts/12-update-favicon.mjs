/* Replace the inline SVG favicon data: URI with a link to the real logo PNG. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const files = (await readdir(ROOT)).filter((f) => f.endsWith(".html"));

const re = /<link rel="icon" href="data:image\/svg\+xml[^"]+"\s*\/?>/;
const replacement = `<link rel="icon" type="image/png" href="assets/images/favicon-128.png" />
<link rel="apple-touch-icon" href="assets/images/favicon-128.png" />`;

for (const f of files) {
  const path = join(ROOT, f);
  const s = await readFile(path, "utf8");
  const out = s.replace(re, replacement);
  if (out !== s) {
    await writeFile(path, out);
    console.log(`${f}: favicon updated`);
  }
}
