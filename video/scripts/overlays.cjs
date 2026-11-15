// Renders the word-by-word captions (timings from video/audio/word-timings.json, made by align.py), the SI watermark,
// the end card and a black frame into video/build/overlays/. Each word is its own PNG, cut from the full phrase
// layout so the line never reflows as words appear. Writes words.json (position + timing of every word) for build.sh.
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const OUT = path.join(__dirname, "../build/overlays");
const TIMINGS = path.join(__dirname, "../audio/word-timings.json");
const WATERMARK = "SI-assisted editing · SI voice: ElevenLabs";

const phrases = JSON.parse(fs.readFileSync(TIMINGS, "utf8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const W = 1920, H = 1080;
const STRIP = { w: 1920, h: 240 }; // caption layout area; build.sh centres it on CAP_Y
const head = `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;background:transparent;overflow:hidden}
  .cap{width:${STRIP.w}px;height:${STRIP.h}px;display:flex;align-items:center;justify-content:center}
  .cap p{margin:0;max-width:1300px;font:700 44px/1.3 "Nimbus Sans",Helvetica,Arial,sans-serif;color:#FFD60A;text-align:center;text-wrap:balance}
  .cap span{-webkit-text-stroke:6px #04080f;paint-order:stroke fill;filter:drop-shadow(0 3px 7px rgba(0,0,0,.85))}
  .cap.solo span{visibility:hidden}
  .cap.solo span.on{visibility:visible}
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
  // Captions: lay out the whole phrase, then cut out each word with room for the outline and shadow
  for (const f of fs.readdirSync(OUT)) if (/^(cap|w)\d/.test(f)) fs.rmSync(path.join(OUT, f));
  const PAD = 14;
  const words = [];
  for (const [pi, ph] of phrases.entries()) {
    const html = ph.words.map((w, wi) => `<span data-i="${wi}">${esc(w.w)}</span>`).join(" ");
    await page.setContent(head + `<div class="cap solo"><p>${html}</p></div>`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.$$eval(".cap span", (ss) => ss.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
    for (const [wi, w] of ph.words.entries()) {
      await page.$$eval(".cap span", (ss, i) => ss.forEach((e, k) => e.classList.toggle("on", k === i)), wi);
      const bx = boxes[wi];
      const clip = { x: Math.max(0, Math.floor(bx.x - PAD)), y: Math.max(0, Math.floor(bx.y - PAD)) };
      clip.width = Math.ceil(bx.w + 2 * PAD) & ~1; clip.height = Math.ceil(bx.h + 2 * PAD) & ~1;
      const file = `w${pi}_${String(wi).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(OUT, file), omitBackground: true, clip });
      words.push({ file, x: clip.x, y: clip.y, w: clip.width, h: clip.height, start: w.start, end: ph.end, text: w.w });
    }
  }
  fs.writeFileSync(path.join(OUT, "words.json"), JSON.stringify({ strip: STRIP, words }, null, 1));
  await shot(`<div class="full"><div class="shade"></div><div class="wm">${esc(WATERMARK)}</div></div>`, "watermark.png");
  // The closing phrase is already the end card, so no site name is repeated under it.
  await shot(
    `<div class="full end"><h1>Terra<b>Vista</b></h1><p>Down to Earth</p><small>Team Logos · NASA Space Apps 2026</small></div>`,
    "end.png",
    false,
  );
  await shot(`<div class="full" style="background:#000"></div>`, "black.png", false);
  await browser.close();
  console.log(words.length, "words in", phrases.length, "phrases + watermark + end card + black");
})();
