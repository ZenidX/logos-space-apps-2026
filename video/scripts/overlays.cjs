// Renders the captions (from docs/timestamps.txt), the SI watermark, the end card and a black frame
// as PNGs (1920x1080; captions as 1920x240 strips) into video/build/overlays/. Also writes cues.json for build.sh.
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const OUT = path.join(__dirname, "../build/overlays");
const TS = path.join(__dirname, "../../docs/timestamps.txt");
const WATERMARK = "SI-assisted editing · SI voice: ElevenLabs";

const cues = fs
  .readFileSync(TS, "utf8")
  .split("\n")
  .map((l) => l.match(/^\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]:\s*(.+)$/))
  .filter(Boolean)
  .map((m) => ({ start: +m[1], end: +m[2], text: m[3].trim() }));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const W = 1920, H = 1080;
const STRIP = { w: 1920, h: 240 }; // caption strip; build.sh scales it about its centre for the pop-in
const head = `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;background:transparent;overflow:hidden}
  .cap{width:${STRIP.w}px;height:${STRIP.h}px;display:flex;align-items:center;justify-content:center}
  .cap span{max-width:1500px;font:700 60px/1.22 "Space Grotesk",sans-serif;letter-spacing:-.005em;color:#FFD60A;text-align:center;text-wrap:balance;
    -webkit-text-stroke:9px #04080f;paint-order:stroke fill;filter:drop-shadow(0 4px 10px rgba(0,0,0,.85))}
  .wm{position:absolute;right:36px;bottom:26px;font:400 19px "JetBrains Mono",monospace;
    letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62);text-shadow:0 1px 6px #000}
  .shade{position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,.45) 45%,rgba(0,0,0,0))}
  .full{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
  .end{background:#04080f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}
  .end h1{margin:0;font:600 170px "Space Grotesk",sans-serif;letter-spacing:-.03em;color:#e6edf7}
  .end h1 b{font-weight:600;color:#5ee7ff}
  .end p{margin:0;font:500 72px "Space Grotesk",sans-serif;color:#5ee7ff}
  .end small{margin-top:50px;font:400 28px "JetBrains Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:#8a9bb4}
</style>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  const shot = async (body, file, transparent = true, clip = { x: 0, y: 0, width: W, height: H }) => {
    await page.setContent(head + body, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, file), omitBackground: transparent, clip });
  };
  const strip = { x: 0, y: 0, width: STRIP.w, height: STRIP.h };
  for (const [i, c] of cues.entries()) await shot(`<div class="cap"><span>${esc(c.text)}</span></div>`, `cap${i}.png`, true, strip);
  await shot(`<div class="full"><div class="shade"></div><div class="wm">${esc(WATERMARK)}</div></div>`, "watermark.png");
  // The closing phrase is already the end card, so no site name is repeated under it.
  await shot(
    `<div class="full end"><h1>Terra<b>Vista</b></h1><p>Down to Earth</p><small>Team Logos · NASA Space Apps 2026</small></div>`,
    "end.png",
    false,
  );
  await shot(`<div class="full" style="background:#000"></div>`, "black.png", false);
  fs.writeFileSync(path.join(OUT, "cues.json"), JSON.stringify(cues, null, 1));
  await browser.close();
  console.log(cues.length, "captions + watermark + end card + black");
})();
