import sharp from "sharp";

const jobs = [
  {
    src: "source-images/verified/!-- ========== ABOUT PAGE HERO ========== --/WhatsApp Image 2026-04-16 at 11.25.36 PM.jpeg",
    out: "assets/images/about-hero.webp",
    w: 1200,
    h: 1600,
  },
  {
    src: "source-images/verified/!-- ========== I — SPECIAL EDUCATION ========== --/I.jpeg",
    out: "assets/images/service-education.webp",
    w: 1280,
    h: 1600,
  },
  {
    src: "source-images/verified/!-- ========== I — SPECIAL EDUCATION ========== --/III.jpeg",
    out: "assets/images/service-nutrition.webp",
    w: 1280,
    h: 1600,
  },
];

for (const job of jobs) {
  await sharp(job.src)
    .resize(job.w, job.h, { fit: "cover", position: "attention" })
    .webp({ quality: 82, effort: 5 })
    .toFile(job.out);
  console.log(`wrote ${job.out}`);
}
