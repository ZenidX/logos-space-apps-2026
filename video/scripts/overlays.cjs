// Renders the captions (from docs/timestamps.txt), the SI watermark, the end card and a black frame
// as 1080x1920 PNGs into video/build/overlays/. Also writes cues.json for build.sh.
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const OUT = path.join(__dirname, "../build/overlays");
const TS = path.join(__dirname, "../../docs/timestamps.txt");
const WATERMARK = "AI-assisted editing · AI voice: ElevenLabs";

const cues = fs
  .readFileSync(TS, "utf8")
  .split("\n")
  .map((l) => l.match(/^\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]:\s*(.+)$/))
  .filter(Boolean)
  .map((m) => ({ start: +m[1], end: +m[2], text: m[3].trim() }));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const head = `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}
  .cap{position:absolute;left:60px;right:60px;bottom:210px;display:flex;justify-content:center}
  .cap span{font:500 46px/1.3 "IBM Plex Sans",sans-serif;color:#fff;text-align:center;background:rgba(4,8,15,.82);
    padding:18px 30px;border:1px solid rgba(94,231,255,.35);text-wrap:balance}
  .wm{position:absolute;left:0;right:0;bottom:70px;text-align:center;font:400 22px "JetBrains Mono",monospace;
    letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62);text-shadow:0 1px 6px #000}
  .end{position:absolute;inset:0;background:#04080f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
  .end h1{margin:0;font:600 132px "Space Grotesk",sans-serif;letter-spacing:-.03em;color:#e6edf7}
  .end h1 b{font-weight:600;color:#5ee7ff}
  .end p{margin:0;font:500 60px "Space Grotesk",sans-serif;color:#5ee7ff}
  .end small{margin-top:60px;font:400 26px "JetBrains Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:#8a9bb4}
</style>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  const shot = async (body, file, transparent = true) => {
    await page.setContent(head + body, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, file), omitBackground: transparent });
  };
  for (const [i, c] of cues.entries()) await shot(`<div class="cap"><span>${esc(c.text)}</span></div>`, `cap${i}.png`);
  await shot(`<div class="wm">${esc(WATERMARK)}</div>`, "watermark.png");
  await shot(
    `<div class="end"><h1>Terra<b>Vista</b></h1><p>Down to Earth</p><small>Team Logos · NASA Space Apps 2026</small></div>`,
    "end.png",
    false,
  );
  await shot(`<div style="position:absolute;inset:0;background:#000"></div>`, "black.png", false);
  fs.writeFileSync(path.join(OUT, "cues.json"), JSON.stringify(cues, null, 1));
  await browser.close();
  console.log(cues.length, "captions + watermark + end card + black");
})();
