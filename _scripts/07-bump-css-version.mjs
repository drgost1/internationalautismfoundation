/* Append / bump a ?v=N query to every local CSS + JS link/script tag so changes defeat browser cache. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const files = (await readdir(ROOT)).filter((f) => f.endsWith(".html"));

const version = Date.now().toString().slice(-7); // 7-digit bump

for (const p of files) {
  const path = join(ROOT, p);
  let s = await readFile(path, "utf8");
  // <link rel="stylesheet" href="assets/css/FOO.css"> and <script src="assets/js/FOO.js">
  s = s.replace(/href="(assets\/css\/[^"?]+\.css)(\?[^"]*)?"/g, `href="$1?v=${version}"`);
  s = s.replace(/src="(assets\/js\/[^"?]+\.js)(\?[^"]*)?"/g, `src="$1?v=${version}"`);
  await writeFile(path, s);
  console.log(`${p}: bumped to v=${version}`);
}
