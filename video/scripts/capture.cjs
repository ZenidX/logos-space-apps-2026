// Captures the team's live app (https://zenidx.github.io/logos-space-apps-2026/: Missions home + Plan a base) frame by
// frame with a deterministic virtual clock into video/build/frames/<shot>/. Only the public site is opened.
// Usage: node video/scripts/capture.cjs [shot ...]   (shots: a s b r; default all). Timeline: docs/timestamps.txt, build.sh
//   a   0–10.5  opening shot → mission 1 (Moon) → mission 3 (Mars)
//   s  10.5–15.3 Haughton crater card: conditions, permits and politics → How tab, access complexity (Nunavut licence)
//   b  15.3–19.4 Plan a base: the base sets itself up on real terrain at Best site A (Moon south pole)
//   r  19.4–26.3 Rehearse on Earth (Water & oxygen), side by side → "Where it breaks"
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const BASE = "https://zenidx.github.io/logos-space-apps-2026/";
const OUT = path.join(__dirname, "../build/frames");
const FPS = 30;
const FRAME = 1000 / FPS;
// 1280x720 CSS px at 1.5x = 1920x1080 output (16:9), so the text reads well.
const VIEW = { width: 1280, height: 720 };
const DSF = 1.5;
const TEX_WAIT = 14000; // the scene loads sharper Moon/Mars maps after 12 s: wait so nothing pops in mid-shot

// Virtual clock: requestAnimationFrame, performance.now and Date.now only advance when __step(ms) is called.
// Until __manual is set, the clock is pumped (window.__pump ms every 16 ms of real time) so the page loads normally.
// CSS animations and transitions (the story's text fades) don't follow rAF: __syncCss pauses each one and sets its
// time from the virtual clock, so they play at the same speed as everything else however slow the screenshots are.
const SHIM = `(() => {
  let vt = 0; const base = Date.now(); let q = []; let id = 0;
  performance.now = () => vt;
  Date.now = () => base + vt;
  window.requestAnimationFrame = (cb) => { q.push([++id, cb]); return id; };
  window.cancelAnimationFrame = (i) => { q = q.filter((e) => e[0] !== i); };
  window.__step = (ms) => { vt += ms; const run = q; q = []; for (const [, cb] of run) { try { cb(vt); } catch (e) { console.error(e); } } };
  const born = new WeakMap();
  window.__syncCss = () => {
    for (const a of document.getAnimations()) {
      // first seen: keep the progress it already has (an entrance that finished while the page loaded stays finished)
      if (!born.has(a)) { born.set(a, vt - (Number(a.currentTime) || 0)); a.pause(); }
      a.currentTime = vt - born.get(a);
    }
  };
  window.__manual = false;
  if (window.__pump === undefined) window.__pump = 16.667;
  // __pumpSkip: pump only every Nth tick, so a heavy scene doesn't queue more frames than software WebGL can draw
  let k = 0;
  setInterval(() => { if (!window.__manual && ++k % (window.__pumpSkip || 1) === 0) window.__step(window.__pump); }, 16);
})();`;

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Piecewise scroll path: [[t0, t1, from, to], ...] in seconds; holds the last value between segments. */
const path1d = (segs) => (t) => {
  let v = segs[0][2];
  for (const [t0, t1, a, b] of segs) {
    if (t >= t1) v = b;
    else if (t >= t0) return a + (b - a) * ease((t - t0) / (t1 - t0));
  }
  return v;
};

/** n frames; before each one: onFrame(i) (scroll, clicks), then the clock moves by step(i) ms. */
async function frames(page, dir, n, step, onFrame) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // warm-up: the first screenshot waits until the GPU process has drawn every frame queued while loading (can take minutes)
  await page.screenshot({ type: "jpeg", timeout: 300000 });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    if (onFrame) await onFrame(i);
    await page.evaluate((ms) => window.__step(ms), typeof step === "function" ? step(i) : step);
    await page.evaluate(() => new Promise((r) => setTimeout(r, 30))); // let React, observers and the compositor settle
    await page.evaluate(() => window.__syncCss());
    await page.screenshot({ path: path.join(dir, String(i).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 93, timeout: 120000 });
    if (i % 60 === 59) console.log(`  ${path.basename(dir)} ${i + 1}/${n} (${((i + 1) / ((Date.now() - t0) / 1000)).toFixed(2)} fps)`);
  }
  console.log(path.basename(dir), n, "frames");
}

/** Scroll position that centres a story step on screen (the page picks the step in the middle of the screen). */
const stepY = (page, step) =>
  page.evaluate((s) => {
    const el = document.querySelector(`[data-step="${s}"]`);
    const r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY + r.height / 2 - window.innerHeight / 2);
  }, step);

/** Top of an element inside the site panel's scroller, in the scroller's coordinates. */
const panelY = (page, sel, re) =>
  page.evaluate(
    ({ sel, re }) => {
      const sc = document.querySelector("#panel > div");
      const el = [...document.querySelectorAll(sel)].find((e) => new RegExp(re).test(e.textContent));
      if (!el) return null;
      const box = el.closest("div.rounded-xl") || el;
      return Math.round(box.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop);
    },
    { sel, re },
  );
// Panel scroller of the mission site card, and the top of an element in it (scroller coordinates)
const PANEL = "#panel > div";
const setPanel = (page, y) => page.evaluate(({ sel, y }) => (document.querySelector(sel).scrollTop = y), { sel: PANEL, y });
const panelTextY = (page, re) =>
  page.evaluate(({ sel, re }) => {
    const sc = document.querySelector(sel);
    const el = [...sc.querySelectorAll("h3,h4,p,span,div")].filter((e) => e.children.length === 0 && new RegExp(re).test(e.textContent)).pop(); // last match: the open tab's box, not the summary row
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop);
  }, { sel: PANEL, re });
const NO_SNAP = "html,body{scroll-snap-type:none!important;scroll-behavior:auto!important}";

/** Load a page with the clock frozen (nothing animates while it loads), wait until ready(), then hand over the clock. */
async function frozenLoad(page, url, ready, extraCss) {
  await page.addInitScript(() => { window.__pump = 0; window.__pumpSkip = 30; });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  if (extraCss) await page.addStyleTag({ content: extraCss });
  await page.waitForFunction(ready, null, { timeout: 240000, polling: 1000 });
  await page.waitForTimeout(2000);
  // the page fade-in (framer-motion, src/app/template.tsx) never finishes under the paused clock: show its end state
  await page.evaluate(() => {
    for (let e = document.querySelector("canvas"); e && e !== document.body; e = e.parentElement)
      if (getComputedStyle(e).opacity === "0") e.style.setProperty("opacity", "1", "important");
  });
  await page.evaluate(() => (window.__manual = true));
}

const shots = {
  // a  0–10.5 s: opening shot (0–5.1), then the story flies to mission 1 on the Moon and mission 3 on Mars ("…against each mission")
  async a(page) {
    await page.addInitScript(() => { window.__pump = 0.5; window.__pumpSkip = 15; });
    await page.goto(BASE + "?capture=1", { waitUntil: "networkidle" });
    // its own line and the scroll cue sit exactly where the captions go; the story snaps to steps, which fights scrollTo
    await page.addStyleTag({ content: ".hero-line,.scroll-cue{visibility:hidden!important}" + NO_SNAP });
    await page.waitForTimeout(TEX_WAIT);
    await page.evaluate(() => (window.__manual = true));
    const y = {};
    for (const s of ["m1-eva-basalt", "m3-ground-ice"]) y[s] = await stepY(page, s);
    const scroll = path1d([
      [5.2, 6.0, 0, y["m1-eva-basalt"]], // "Terra Vista scores all of Earth…": Suited EVA, the camera flies to the Moon
      [8.0, 8.8, y["m1-eva-basalt"], y["m3-ground-ice"]], // "…against each mission": on to Mars, Arcadia Planitia
    ]);
    const speed = (t) => (t < 5.1 ? 1.45 : 1.5); // the opening shot fits 0–5.1 s; the 2.8 s camera journeys fit ~1.9 s
    await frames(page, path.join(OUT, "a"), 315, (i) => FRAME * speed(i / FPS), async (i) => {
      await page.evaluate((v) => window.scrollTo(0, v), Math.round(scroll(i / FPS)));
    });
  },

  // s  10.5–15.3 s: Haughton crater card (conditions with values, "Permits and politics"), then the How tab's
  // access complexity with the Nunavut research licence ("even permits and local politics")
  async s(page) {
    await page.goto(BASE + "?capture=1&m=m3-ground-ice&s=haughton_crater", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: PANEL + "{padding-bottom:420px!important}" });
    await page.waitForTimeout(TEX_WAIT - 3000);
    await setPanel(page, 0);
    await page.evaluate(() => (window.__manual = true));
    let to = null;
    await frames(page, path.join(OUT, "s"), 144, FRAME, async (i) => {
      if (i === 66) { // 12.7 s
        await page.getByRole("tab", { name: "How" }).click();
        await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
        to = Math.max(0, (await panelTextY(page, "^Access complexity")) - 230);
      }
      if (i >= 66) await setPanel(page, Math.round(to * ease(Math.min(1, (i - 66) / 20)) + Math.max(0, i - 86) * 0.25));
    });
  },

  // b  15.3–19.4 s: Plan a base at Best site A (lunar south pole): the base sets itself up on real LOLA terrain
  async b(page) {
    await frozenLoad(page, BASE + "base/?capture=1&b=moon&lat=-88&lon=-180&n=Best%20site%20A",
      () => /Buildable/i.test(document.body.innerText) && !!document.querySelector("canvas"));
    // the layer buttons and view controls sit under the captions
    await page.evaluate(() => {
      const bar = [...document.querySelectorAll("button")].find((e) => e.textContent.trim() === "Relief");
      if (bar) bar.parentElement.style.visibility = "hidden";
      const v = [...document.querySelectorAll("button")].find((e) => e.textContent.trim() === "Real scale");
      if (v) v.parentElement.style.visibility = "hidden";
    });
    // 6 assembly steps × 2.2 s: clock ×3.4 so lander → habitat → masts → water plant → rover → walk radius fit 4.1 s
    await frames(page, path.join(OUT, "b"), 123, FRAME * 3.4);
  },

  // r  19.4–26.3 s: Rehearse on Earth, Water & oxygen: the same base on an Earth site and on the Moon, side by side;
  // at 22.9 s ("and exactly where the analogy breaks") the page scrolls up to "Where it breaks"
  async r(page) {
    await frozenLoad(page, BASE + "base/?capture=1&b=moon&lat=-88&lon=-180&n=Best%20site%20A&s=water&cmp=best",
      () => !!document.querySelector("#mc-break") && document.querySelectorAll("canvas").length >= 2);
    // the dialog body fits the screen exactly, so "Where it breaks" sits under the captions: room below lets it scroll up
    const BODY = '[role="dialog"] > div.overflow-y-auto';
    await page.addStyleTag({ content: BODY + "{padding-bottom:360px!important}" });
    let to = null;
    await frames(page, path.join(OUT, "r"), 207, FRAME, async (i) => {
      if (i === 105) to = await page.evaluate((sel) => {
        const sc = document.querySelector(sel), h = document.querySelector("#mc-break");
        return Math.round(h.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 50);
      }, BODY);
      if (i >= 105) await page.evaluate(({ sel, v }) => (document.querySelector(sel).scrollTop = v), { sel: BODY, v: Math.round(to * ease(Math.min(1, (i - 105) / 24))) });
    });
  },
};

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(shots);
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  for (const name of want) {
    if (!shots[name]) throw new Error(`unknown shot ${name} (shots: ${Object.keys(shots).join(" ")})`);
    const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DSF, bypassCSP: true });
    await ctx.addInitScript(SHIM);
    const page = await ctx.newPage();
    const t0 = Date.now();
    await shots[name](page);
    console.log(name, "done in", Math.round((Date.now() - t0) / 1000), "s");
    await ctx.close();
  }
  await browser.close();
})();
