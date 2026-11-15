// Captures the public TerraVista site frame by frame (deterministic virtual time) into video/build/frames/.
// Usage: node video/scripts/capture.cjs [shot ...]   (shots: s1 s2 s4; default all)
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(__dirname, "../tools/node_modules/playwright-core"));

const BASE = "https://zenidx.github.io/logos-space-apps-2026/";
const OUT = path.join(__dirname, "../build/frames");
const FPS = 30;
// 1280x720 CSS px at 1.5x = 1920x1080 output (16:9), so the text reads well.
const VIEW = { width: 1280, height: 720 };
const DSF = 1.5;

// Virtual clock: requestAnimationFrame, performance.now and Date.now only advance when __step(ms) is called.
// Until __manual is set, the clock is pumped in real time so the page loads normally.
const SHIM = `(() => {
  let vt = 0; const base = Date.now(); let q = []; let id = 0;
  performance.now = () => vt;
  Date.now = () => base + vt;
  window.requestAnimationFrame = (cb) => { q.push([++id, cb]); return id; };
  window.cancelAnimationFrame = (i) => { q = q.filter((e) => e[0] !== i); };
  window.__step = (ms) => { vt += ms; const run = q; q = []; for (const [, cb] of run) { try { cb(vt); } catch (e) { console.error(e); } } };
  window.__manual = false;
  setInterval(() => { if (!window.__manual) window.__step(16.667); }, 16);
})();`;

async function frames(page, dir, n, stepMs, onFrame) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < n; i++) {
    if (onFrame) await onFrame(i);
    await page.evaluate((ms) => window.__step(ms), stepMs);
    await page.evaluate(() => new Promise((r) => setTimeout(r, 30))); // let React and the compositor settle
    await page.screenshot({ path: path.join(dir, String(i).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 93 });
  }
  console.log(path.basename(dir), n, "frames");
}

const shots = {
  // 0–6 s · Moon → Earth scene of the home page (12 s scene played at 2x)
  async s1(page) {
    await page.goto(BASE, { waitUntil: "networkidle" });
    const sec = page.locator('section[aria-label^="Moon versus Earth"]');
    await sec.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const s = document.querySelector('section[aria-label^="Moon versus Earth"]');
      window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(6000); // textures
    await page.evaluate(() => (window.__manual = true));
    await page.getByRole("button", { name: /Replay/ }).click();
    await page.addStyleTag({ content: 'section[aria-label^="Moon versus Earth"] button{visibility:hidden}' });
    await frames(page, path.join(OUT, "s1"), 6 * FPS, (12000 / (6 * FPS)) * 0.97);
  },
  // 6–13 s · Discover: pick a destination, the globe flies to each target's analogs
  async s2(page) {
    await page.goto(BASE + "discover/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      // target cards just under the nav, globe and match list below them
      const b = [...document.querySelectorAll("button")].find((e) => /Shackleton/.test(e.textContent));
      window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 68);
    });
    await page.waitForTimeout(6000);
    await page.evaluate(() => (window.__manual = true));
    const clicks = { 70: "Jezero", 140: "Arcadia" };
    await frames(page, path.join(OUT, "s2"), 7 * FPS, 1000 / FPS, async (i) => {
      if (clicks[i]) {
        await page.locator("button", { hasText: clicks[i] }).first().click();
        await page.waitForTimeout(800);
      }
    });
  },
  // 18–22 s · Method: "Where every analogy breaks."
  async s4(page) {
    await page.goto(BASE + "method/", { waitUntil: "networkidle" });
    const y = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2")].find((e) => /analogy breaks/.test(e.textContent));
      return h.getBoundingClientRect().top + window.scrollY - 95;
    });
    await page.evaluate(() => {
      // hide the "Every number, every source." card so it doesn't compete with the caption
      const h = [...document.querySelectorAll("h2,h3,p")].find((e) => /Every number, every source/.test(e.textContent));
      let el = h; while (el && el.parentElement && el.parentElement.offsetHeight < 400) el = el.parentElement;
      if (el) el.style.visibility = "hidden";
    });
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(4000);
    await page.evaluate(() => (window.__manual = true));
    const n = 4 * FPS;
    await frames(page, path.join(OUT, "s4"), n, 1000 / FPS, async (i) => {
      await page.evaluate((yy) => window.scrollTo(0, yy), y - (40 * i) / n); // slow drift up, heading stays in frame
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
    const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DSF });
    await ctx.addInitScript(SHIM);
    const page = await ctx.newPage();
    const t0 = Date.now();
    await shots[name](page);
    console.log(name, "done in", Math.round((Date.now() - t0) / 1000), "s");
    await ctx.close();
  }
  await browser.close();
})();
