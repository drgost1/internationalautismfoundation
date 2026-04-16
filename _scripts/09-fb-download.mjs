/* Download the key Facebook images (cover + chairman post + logo post) so we can
   compare faces locally and identify the real chairman in our source set. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const OUT = join(ROOT, "_review/fb");
await mkdir(OUT, { recursive: true });

const FILES = [
  {
    name: "01-cover.jpg",
    label: "FB cover photo (chairman holding book)",
    src: "https://scontent.fdac5-1.fna.fbcdn.net/v/t39.30808-6/669440616_3114114982092206_682851126772262148_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=2a1932&_nc_ohc=0pNBWW0N7MQQ7kNvwE_0WHU&_nc_oc=AdpIQRzuKUkhA0UarX5PDwTHrdKmOjYw_lIaE3WIrqZDfM_Rk7tSlG3wXfqBR2iHudQ&_nc_zt=23&_nc_ht=scontent.fdac5-1.fna&_nc_gid=mRLdAjJ0jeioozFWldukcQ&_nc_ss=7a389&oh=00_Af3C1N-hGc1BdP9g_OEUJKFbrJvGseqRsBIcTwOeCSerxg&oe=69E65D8A",
  },
  {
    name: "02-chairman-jan2024.jpg",
    label: "Jan 23 2024 post — 'Chairman Masud Rana Black & White (PhD)'",
    src: "https://scontent.fdac5-2.fna.fbcdn.net/v/t39.30808-6/488188160_2744550999048608_3167899768075374890_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=2GAlSj02fpMQ7kNvwHOhF-D&_nc_oc=Adq2sibMwh2i_3myBcUTnlYf46SDPZDomvG-D0v2C7xU0LZ-cMbkifA9bb4PNScOh0M&_nc_zt=23&_nc_ht=scontent.fdac5-2.fna&_nc_gid=equVRT_DnDYPMhODoysoHA&_nc_ss=7a389&oh=00_Af3rSRrELz8U4lnYQTb1tUshbxcnosWDpE5b9-aXY7gC6Q&oe=69E66843",
  },
  {
    name: "03-chairman-jan2024-b.jpg",
    label: "Jan 23 2024 post — image B",
    src: "https://scontent.fdac5-1.fna.fbcdn.net/v/t39.30808-6/487359368_2744551019048606_4273892088804011474_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=2iUnvMtjsiYQ7kNvwFJABoX&_nc_oc=Adp8XF03j73xc8YS_ggYDBx2DhhGyStS-QJO3hDBTq5fshHv-6zxoeosjCh8woPn2w0&_nc_zt=23&_nc_ht=scontent.fdac5-1.fna&_nc_gid=equVRT_DnDYPMhODoysoHA&_nc_ss=7a389&oh=00_Af1VXbVu1e1-9oqxXy5MSndNhnIFU1GZs20LF7O3uCx0Zg&oe=69E66C10",
  },
  {
    name: "04-logo-earth-campus.jpg",
    label: "'The Earth is Our Campus' B&W logo/graphic",
    src: "https://scontent.fdac5-1.fna.fbcdn.net/v/t39.30808-6/671272980_3117642011739503_2580473358658591486_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=53LZB-daYhwQ7kNvwHx1k5-&_nc_oc=Adr_wSE25Ult1PnU_BAtefgVokqqHjShusCyrh-2AucgYkoWyypzd6q02qz-S6nqBZ0&_nc_zt=23&_nc_ht=scontent.fdac5-1.fna&_nc_gid=equVRT_DnDYPMhODoysoHA&_nc_ss=7a389&oh=00_Af0E3-1jsTeecReIx-vNug2BTW2hmLHwWDijcSyd_u3cbg&oe=69E65766",
  },
  {
    name: "05-our-doctor.jpg",
    label: "'আমাদের ডাক্তার' (Our Doctor) post",
    src: "https://scontent.fdac5-1.fna.fbcdn.net/v/t39.30808-6/672186452_3117639205073117_1243451090911064404_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=5l3xVnTLkeQQ7kNvwHdgYZ9&_nc_oc=AdrzwvJ5IWBm25b5e-e9PsVFduSShHjvG6EVQ2Ut6tBMqzLqFvLuQc0l47mcMsqHDN8&_nc_zt=23&_nc_ht=scontent.fdac5-1.fna&_nc_gid=YlCExCz0IyBXDz1ZSRLMZw&_nc_ss=7a389&oh=00_Af2AQv43AGDT9U4xyKf14yl4g9_cNSQdxm33wUV--wuACA&oe=69E65367",
  },
  {
    name: "06-american-couple.jpg",
    label: "American doctor couple post",
    src: "https://scontent.fdac5-2.fna.fbcdn.net/v/t39.30808-6/671592587_3117629321740772_501815948725951887_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=gy73Nsv4EjIQ7kNvwGKzOET&_nc_oc=AdrhoIsJuEha31wXBlq5fgrFIJdORTDN7Z4xaJfJyQZiHIufOvrc6zhDJjuhIHm_guI&_nc_zt=23&_nc_ht=scontent.fdac5-2.fna&_nc_gid=YlCExCz0IyBXDz1ZSRLMZw&_nc_ss=7a389&oh=00_Af21xEBlS8CNOW2-L7rFMJB7Bzw2FjXw3Yr8__gfd_1uNA&oe=69E68597",
  },
  {
    name: "07-students-toys.jpg",
    label: "Children with toys post",
    src: "https://scontent.fdac5-2.fna.fbcdn.net/v/t39.30808-6/670908621_3117590401744664_6633190073221837515_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=101&ccb=1-7&_nc_sid=13d280&_nc_ohc=aRPHiCZTAsEQ7kNvwGzlq3A&_nc_oc=AdqC7NuJhaBwrPJo6H8j8YWvguRc6n5Vj5MLQnrzGs7r-pRRKUOqi1VRrap7nxKoSF4&_nc_zt=23&_nc_ht=scontent.fdac5-2.fna&_nc_gid=YlCExCz0IyBXDz1ZSRLMZw&_nc_ss=7a389&oh=00_Af1W-ia7UO_p1wg3yyooO0nYuKvJFgCD4B6F0eb5ta-0iw&oe=69E67161",
  },
];

let saved = 0;
for (const f of FILES) {
  try {
    const res = await fetch(f.src, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.facebook.com/",
      },
    });
    if (!res.ok) { console.warn(`skip ${f.name}: HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(OUT, f.name), buf);
    console.log(`saved ${f.name} (${buf.length} bytes) — ${f.label}`);
    saved++;
  } catch (e) {
    console.warn(`fail ${f.name}: ${e.message}`);
  }
}
console.log(`\nSaved ${saved}/${FILES.length}`);
