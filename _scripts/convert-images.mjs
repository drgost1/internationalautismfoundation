import sharp from "sharp";

const jobs = [
  {
    src: "C:/Users/drgos_5ax3dfg/.claude/image-cache/798bbe11-d0ce-4be8-ba86-c6d95f4e81a9/28.jpeg",
    out: "assets/images/chairman.webp",
    w: 1280,
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
  console.log(`wrote ${job.out} (${meta.width}x${meta.height})`);
}
