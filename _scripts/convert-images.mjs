import sharp from "sharp";

const jobs = [
  {
    src: "source-images/verified/!-- ========== LEADERSHIP  TEAM ========== --/masudrana.jpeg",
    out: "assets/images/team-1.webp",
    w: 1200,
    h: 1600,
    position: "attention",
  },
  {
    src: "source-images/verified/!-- ========== LEADERSHIP  TEAM ========== --/coordinator.jpeg",
    out: "assets/images/team-2.webp",
    w: 1200,
    h: 1600,
    position: "centre",
  },
  {
    src: "source-images/verified/!-- ========== LEADERSHIP  TEAM ========== --/WhatsApp Image 2026-04-16 at 8.21.18 PM.jpeg",
    out: "assets/images/team-3.webp",
    w: 1200,
    h: 1600,
    position: "attention",
  },
];

for (const job of jobs) {
  await sharp(job.src)
    .resize(job.w, job.h, { fit: "cover", position: job.position })
    .webp({ quality: 85, effort: 5 })
    .toFile(job.out);
  const meta = await sharp(job.out).metadata();
  console.log(`wrote ${job.out} (${meta.width}x${meta.height}, ${meta.size || "?"}B)`);
}
