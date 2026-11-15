// Captures the team's live app (https://spaceapp-logos.vercel.app, repo zexuguo/SpaceApp-Logos) frame by frame with a
// deterministic virtual clock into video/build/frames/<shot>/. Nothing in that repo is touched: we only open the public site.
// Usage: node video/scripts/capture.cjs [shot ...]   (shots: a b c1 c2; default all)
//   a   0–18 s  story: opening shot → "Rehearse the Moon and Mars on Earth" → the idea → Suited EVA (Moon) → Ground ice (Mars)
//   b  18–22 s  SP Crater site panel opens, then "Where the analogy breaks" (Limits tab)
//   c1 22–24.4  Haughton crater, How tab: access complexity with the Nunavut research-licence permit
//   c2 24.4–26  New Siberian Islands, How tab: access complexity High (US level 4 of 4)
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const BASE = "https://spaceapp-logos.vercel.app/";
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
const setPanel = (page, y) => page.evaluate((y) => (document.querySelector("#panel > div").scrollTop = y), y);

const shots = {
  async a(page) {
    // the opening shot is part of the take, so keep the clock almost still while the page and its textures load
    await page.addInitScript(() => { window.__pump = 0.5; window.__pumpSkip = 15; });
    await page.goto(BASE + "?capture=1", { waitUntil: "networkidle" });
    // its own line ("Before the Moon and Mars, there is Earth.") and the scroll cue sit exactly where the captions go
    await page.addStyleTag({ content: ".hero-line,.scroll-cue{visibility:hidden!important}" });
    await page.waitForTimeout(TEX_WAIT);
    await page.evaluate(() => (window.__manual = true));
    const y = {};
    for (const s of ["intro", "idea", "m1-eva-basalt", "m3-ground-ice"]) y[s] = await stepY(page, s);
    const scroll = path1d([
      [6.0, 7.0, 0, y.intro],
      [8.8, 9.6, y.intro, y.idea],
      [11.0, 11.9, y.idea, y["m1-eva-basalt"]], // "…Earth's own Moon": the camera flies to the Moon
      [14.0, 14.8, y["m1-eva-basalt"], y["m3-ground-ice"]], // "an ice drill?": on to Mars, Arcadia Planitia
    ]);
    // clock speed: the 7.5 s opening shot fits 0–6 s; the camera journeys (2.8 s each) need a faster clock after 11 s
    const speed = (t) => (t < 6 ? 1.25 : t < 11 ? 1 : 1.5);
    await frames(page, path.join(OUT, "a"), 18 * FPS, (i) => FRAME * speed(i / FPS), async (i) => {
      await page.evaluate((v) => window.scrollTo(0, v), Math.round(scroll(i / FPS)));
    });
  },

  async b(page) {
    await page.goto(BASE + "?capture=1&m=m1-eva-basalt", { waitUntil: "networkidle" });
    await page.waitForTimeout(TEX_WAIT);
    await page.evaluate(() => (window.__manual = true));
    let from = 0, to = null;
    await frames(page, path.join(OUT, "b"), 4 * FPS, FRAME, async (i) => {
      if (i === 0) await page.click('[data-site="sp_crater_az"]');
      if (i === 48) {
        await page.getByRole("tab", { name: "Limits & sources" }).click();
        await page.evaluate(() => new Promise((r) => setTimeout(r, 150)));
        to = (await panelY(page, "#panel h4", "Where the analogy breaks")) - 86; // list just under the panel's top
      }
      if (i >= 48) {
        const k = ease(Math.min(1, (i - 48) / 27));
        await setPanel(page, Math.round(from + (to - from) * k + Math.max(0, i - 75) * 0.3));
      } else if (i > 0) await setPanel(page, 0);
    });
  },

  async c1(page) {
    await accessShot(page, "m3-ground-ice", "haughton_crater", "c1", 72);
  },
  async c2(page) {
    await accessShot(page, "m3-ground-ice", "m3-ground-ice-new7", "c2", 48);
  },
};

/** A site panel on its How tab, with the Access complexity box high on screen (clear of the captions), slow drift. */
async function accessShot(page, m, s, name, n) {
  await page.goto(`${BASE}?capture=1&m=${m}&s=${s}`, { waitUntil: "networkidle" });
  // the box is near the end of the panel: empty room below it lets it scroll up, clear of the captions
  await page.addStyleTag({ content: "#panel > div{padding-bottom:420px!important}" });
  await page.waitForTimeout(TEX_WAIT - 3000);
  await page.getByRole("tab", { name: "How" }).click();
  await page.waitForTimeout(3000);
  const y = (await panelY(page, "#panel p.label", "Access complexity")) - 150; // just under the sticky tab bar
  await setPanel(page, y + 14);
  await page.waitForTimeout(300);
  await page.evaluate(() => (window.__manual = true));
  for (let k = 0; k < 3; k++) { // warm-up: the first screenshot after the jump can come out half painted
    await page.evaluate((ms) => { window.__step(ms); window.__syncCss(); }, FRAME);
    await page.screenshot({ type: "jpeg" });
  }
  await frames(page, path.join(OUT, name), n, FRAME, async (i) => setPanel(page, Math.round(y + 14 - (14 * i) / n)));
}

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
