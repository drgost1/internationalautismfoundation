/**
 * Produce a verification sheet: for every website slot currently in picks.json
 * (+ picks-cinematic.json), render the image with a label showing:
 *   - slot name           (e.g. chairman, hero-1, project-madhupur)
 *   - claimed meaning     (what the site says it depicts)
 *   - source image index  (so user can point at sheet-XX to replace)
 *   - original filename   (in source-images/)
 */
import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SRC_DIR = join(ROOT, "source-images");
const OUT_DIR = join(ROOT, "_review");
const META = JSON.parse(await readFile(join(ROOT, "_review/metadata.json"), "utf8"));

await mkdir(OUT_DIR, { recursive: true });

// Slot meanings — "what the site claims this image represents"
const MEANINGS = {
  "logo": "Foundation logo / mark",
  "hero-1": "HOME hero — divine child (top tile)",
  "hero-2": "HOME hero — teacher + child (middle tile)",
  "hero-3": "HOME hero — mother & child (bottom tile)",
  "about-hero": "ABOUT page hero — wide campus shot",
  "chairman": "ABOUT page — Chairman Masud Rana Black & White portrait",
  "team-1": "ABOUT team — Chairman card",
  "team-2": "ABOUT team — Coordinator card",
  "team-3": "ABOUT team — Lead Divine Teacher card",
  "team-4": "ABOUT team — Medical Lead card",
  "project-madhupur": "PROJECTS — Madhupur jungle flagship campus",
  "project-madhupur-1": "PROJECTS — Madhupur jungle flagship campus",
  "project-dhanbari-1": "PROJECTS — Dhanbari farmland campus (1)",
  "project-dhanbari-2": "PROJECTS — Dhanbari farmland campus (2)",
  "project-dhaka": "PROJECTS — Dhaka city office (Black & White Point)",
  "project-1": "HOME project card — Madhupur",
  "project-2": "HOME project card — Dhanbari",
  "project-3": "HOME project card — Dhaka office",
  "campus-1": "PROJECTS — campus life (morning assembly)",
  "campus-2": "PROJECTS — campus life (art class)",
  "campus-3": "PROJECTS — campus life (kitchen)",
  "campus-4": "PROJECTS — campus life (evening storytime)",
  "service-education": "SERVICES — Special Education pillar",
  "service-health": "SERVICES — Health Care pillar",
  "service-nutrition": "SERVICES — Nutrition pillar",
  "voice-1": "VOICE — Rahima Begum, Mother (avatar)",
  "voice-2": "VOICE — Shahinur Akhtar, Divine Teacher (avatar)",
  "voice-3": "VOICE — Nasrin Sultana, Parent (avatar)",
  "voice-4": "VOICE — Tanvir Hossain, Volunteer (avatar)",
  "gallery-1": "GALLERY 1 — divine child",
  "gallery-2": "GALLERY 2 — campus outdoor",
  "gallery-3": "GALLERY 3 — child portrait",
  "gallery-4": "GALLERY 4 — health camp",
  "gallery-5": "GALLERY 5 — kids eating",
  "gallery-6": "GALLERY 6 — classroom",
  "gallery-7": "GALLERY 7 — chairman & child",
  "gallery-8": "GALLERY 8 — group moment",
  "gallery-9": "GALLERY 9 — autism awareness event",
  "gallery-10": "GALLERY 10 — child smiling",
  "gallery-11": "GALLERY 11 — child with chairman",
  "gallery-12": "GALLERY 12 — group photo",
  "gallery-13": "GALLERY 13 — awareness rally",
  "gallery-14": "GALLERY 14 — students outdoor",
  "gallery-15": "GALLERY 15 — child moment",

  "cine-open": "EXPERIENCE cover — opening full-bleed",
  "cine-chairman-wide": "EXPERIENCE pinned manifesto — chairman + child bg",
  "cine-portrait-1": "EXPERIENCE portrait strip — boy in red",
  "cine-portrait-2": "EXPERIENCE portrait strip — girl with rainbow toy",
  "cine-portrait-3": "EXPERIENCE portrait strip — girl at lunch",
  "cine-portrait-4": "EXPERIENCE portrait strip — boy with chairman",
  "cine-portrait-5": "EXPERIENCE portrait strip — boy at playtime",
  "cine-classroom-1": "EXPERIENCE reel 01 — Education slide",
  "cine-classroom-2": "EXPERIENCE reel 02 — Nutrition slide",
  "cine-classroom-3": "EXPERIENCE reel 04 — Presence slide",
  "cine-outdoor-1": "EXPERIENCE parallax — outdoor scene",
  "cine-outdoor-2": "EXPERIENCE — extra outdoor crop",
  "cine-camp-1": "EXPERIENCE reel 03 — Health camp",
  "cine-camp-2": "EXPERIENCE — extra health crop",
  "cine-meal-1": "EXPERIENCE — meal crop",
  "cine-meal-2": "EXPERIENCE — meal crop",
  "cine-chairman-1": "EXPERIENCE — chairman portrait 1",
  "cine-chairman-2": "EXPERIENCE — chairman portrait 2",
  "cine-finale": "EXPERIENCE finale — chairman + child",
  "cine-quote-bg": "EXPERIENCE bleed quote — background (kids playing)",
  "cine-detail-1": "EXPERIENCE — detail shot 1",
  "cine-detail-2": "EXPERIENCE — detail shot 2",
  "cine-group-1": "EXPERIENCE — wide group 1",
  "cine-group-2": "EXPERIENCE — wide group 2",
  "cine-strip-1": "EXPERIENCE grid-build tile 1",
  "cine-strip-2": "EXPERIENCE grid-build tile 2",
  "cine-strip-3": "EXPERIENCE grid-build tile 3",
  "cine-strip-4": "EXPERIENCE grid-build tile 4",
  "cine-strip-5": "EXPERIENCE grid-build tile 5",
  "cine-strip-6": "EXPERIENCE grid-build tile 6",
};

const picks1 = JSON.parse(await readFile(join(ROOT, "_scripts/picks.json"), "utf8")).slots;
const picks2 = JSON.parse(await readFile(join(ROOT, "_scripts/picks-cinematic.json"), "utf8")).slots;
const allPicks = [...picks1, ...picks2];

const COLS = 3;
const TILE_W = 480;
const TILE_H = 360;
const PAD = 10;
const LABEL_H = 90;
const ROWS = Math.ceil(allPicks.length / COLS);
const SHEET_W = COLS * (TILE_W + PAD) + PAD;
const PER_SHEET = COLS * 6; // 18 per sheet
const totalSheets = Math.ceil(allPicks.length / PER_SHEET);

function esc(s) { return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }

for (let s = 0; s < totalSheets; s++) {
  const slice = allPicks.slice(s * PER_SHEET, s * PER_SHEET + PER_SHEET);
  const rowsHere = Math.ceil(slice.length / COLS);
  const sheetH = rowsHere * (TILE_H + LABEL_H + PAD) + PAD + 60;
  const composites = [];

  // Header
  const headerSvg = `<svg width="${SHEET_W}" height="50" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0a0a0a"/>
    <text x="20" y="32" font-family="Inter, sans-serif" font-size="18" fill="#c89b5c" font-weight="700">VERIFICATION SHEET ${s + 1} / ${totalSheets}</text>
    <text x="${SHEET_W - 20}" y="32" text-anchor="end" font-family="Inter, sans-serif" font-size="14" fill="#faf7f1" opacity="0.7">Tell me which slots are wrong and which source # they should use.</text>
  </svg>`;
  composites.push({ input: Buffer.from(headerSvg), top: 0, left: 0 });

  for (let k = 0; k < slice.length; k++) {
    const p = slice[k];
    const col = k % COLS;
    const row = Math.floor(k / COLS);
    const x = PAD + col * (TILE_W + PAD);
    const y = 60 + PAD + row * (TILE_H + LABEL_H + PAD);

    const meta = META.find((m) => m.i === p.src);
    if (!meta) continue;

    try {
      const buf = await sharp(join(SRC_DIR, meta.f), { failOn: "none" })
        .rotate()
        .resize(TILE_W, TILE_H, { fit: "cover", position: "centre" })
        .jpeg({ quality: 78 })
        .toBuffer();
      composites.push({ input: buf, top: y, left: x });

      const slotKey = p.outName.replace(/\.webp$/, "");
      const meaning = MEANINGS[slotKey] || slotKey;
      const labelSvg = `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0a0a"/>
        <text x="14" y="26" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#c89b5c">${esc(slotKey)}</text>
        <text x="14" y="50" font-family="Inter, sans-serif" font-size="13" fill="#faf7f1">${esc(meaning)}</text>
        <text x="14" y="74" font-family="Inter, sans-serif" font-size="12" fill="#6b6258">source #${meta.i} · ${esc(meta.f.slice(0, 48))}</text>
      </svg>`;
      composites.push({ input: Buffer.from(labelSvg), top: y + TILE_H, left: x });
    } catch (e) {
      console.warn(`skip ${p.slot}: ${e.message}`);
    }
  }

  const out = join(OUT_DIR, `verify-${String(s + 1).padStart(2, "0")}.jpg`);
  await sharp({
    create: { width: SHEET_W, height: sheetH, channels: 3, background: "#181818" },
  })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(out);
  console.log(`wrote ${out}`);
}

console.log(`\nTotal ${totalSheets} verification sheets. Open _review/verify-*.jpg`);
