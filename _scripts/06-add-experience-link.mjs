/* Insert "Experience" nav link between Home and About on every existing page. */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const PAGES = ["index.html", "about.html", "projects.html", "services.html", "gallery.html", "contact.html"];

for (const p of PAGES) {
  const path = join(ROOT, p);
  let s = await readFile(path, "utf8");

  // Skip if already present
  if (s.includes('href="experience.html"')) {
    console.log(`${p}: already linked`);
    continue;
  }

  // Insert after the "Home" desktop nav link
  s = s.replace(
    /<a href="index\.html" data-nav class="nav-link">Home<\/a>/,
    `<a href="index.html" data-nav class="nav-link">Home</a>\n      <a href="experience.html" data-nav class="nav-link">Experience</a>`
  );
  // Insert after the mobile menu Home link
  s = s.replace(
    /<a href="index\.html">Home<\/a>/,
    `<a href="index.html">Home</a><a href="experience.html">Experience</a>`
  );

  await writeFile(path, s);
  console.log(`${p}: linked`);
}
