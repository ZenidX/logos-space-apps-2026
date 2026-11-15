// Renders the word-by-word captions as ONE transparent PNG sequence (1920x240 strip, 30 fps) into video/build/captions/.
// Build-up style: each word appears when it is spoken (video/audio/word-timings.json, made by align.py), popping in
// (85 % → 100 % in 0.12 s, 0.08 s fade), and the line stays until its phrase slot ends. The whole phrase is laid out
// from the start (hidden words keep their space), so the line never reflows as words appear.
// One stream instead of one input per word keeps ffmpeg's memory low (64 inputs froze the event PC).
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const OUT = path.join(__dirname, "../build/captions");
const phrases = JSON.parse(fs.readFileSync(path.join(__dirname, "../audio/word-timings.json"), "utf8"));
const FPS = 30;
const DUR = +(process.argv[2] || 29.9);
const STRIP = { w: 1920, h: 240 };
const POP = 0.12, FADE = 0.08, FROM = 0.85;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const head = `<meta charset="utf-8"><style>
  html,body{margin:0;background:transparent;overflow:hidden}
  .cap{width:${STRIP.w}px;height:${STRIP.h}px;display:flex;align-items:center;justify-content:center}
  .cap p{margin:0;max-width:1300px;font:700 44px/1.3 "Nimbus Sans",Helvetica,Arial,sans-serif;color:#FFD60A;text-align:center;text-wrap:balance}
  .cap span{display:inline-block;opacity:0;-webkit-text-stroke:6px #04080f;paint-order:stroke fill;filter:drop-shadow(0 3px 7px rgba(0,0,0,.85))}
</style>`;

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const page = await (await browser.newContext({ viewport: { width: STRIP.w, height: STRIP.h } })).newPage();
  const n = Math.round(DUR * FPS);
  let loaded = -1;
  for (let f = 0; f < n; f++) {
    const t = f / FPS;
    const pi = phrases.findIndex((p) => t >= p.start && t < p.end);
    if (pi !== loaded) {
      const html = pi < 0 ? "" : phrases[pi].words.map((w) => `<span>${esc(w.w)}</span>`).join(" ");
      await page.setContent(head + `<div class="cap"><p>${html}</p></div>`);
      await page.evaluate(() => document.fonts.ready);
      loaded = pi;
    }
    if (pi >= 0) {
      const starts = phrases[pi].words.map((w) => w.start);
      await page.evaluate(
        ({ t, starts, POP, FADE, FROM }) => {
          document.querySelectorAll(".cap span").forEach((e, i) => {
            const d = t - starts[i];
            const k = d < 0 ? 0 : Math.min(1, d / POP);
            e.style.opacity = d < 0 ? 0 : Math.min(1, d / FADE);
            e.style.transform = `scale(${FROM + (1 - FROM) * k})`;
          });
        },
        { t, starts, POP, FADE, FROM },
      );
    }
    await page.screenshot({ path: path.join(OUT, String(f).padStart(4, "0") + ".png"), omitBackground: true });
  }
  await browser.close();
  console.log(n, "caption frames");
})();
