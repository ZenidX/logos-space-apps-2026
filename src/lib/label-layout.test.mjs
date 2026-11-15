// AI-assisted (Claude), reviewed by team Logos
// Tests of the layout of site names around the Earth (dashed leaders to labels outside the globe). Run with `npm test`.
import assert from "node:assert/strict";
import { DETOUR, GAP, RING, SLOTS, layoutLabels, pointSegDist, rectDiscGap, rectsOverlap, segHitsRect, segsCross } from "./label-layout.ts";

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const onEdge = (o) => { const b = o.box, e = 0.02; return o.ex >= b.x0 - e && o.ex <= b.x1 + e && o.ey >= b.y0 - e && o.ey <= b.y1 + e && (Math.abs(o.ex - b.x0) < e || Math.abs(o.ex - b.x1) < e || Math.abs(o.ey - b.y0) < e || Math.abs(o.ey - b.y1) < e); };

// A scene like the app's close-up: the Earth left of centre, the target world to its right, buttons top-left, footer bottom-left.
function scene(W, H, n) {
  const r = Math.min(W * 0.21, H * 0.36) * (0.8 + rnd() * 0.25), earth = { x: W * (0.3 + rnd() * 0.12), y: H * (0.5 + rnd() * 0.08), r };
  const rc = r * (rnd() < 0.5 ? 0.273 : 0.532), comp = { x: earth.x + r + rc + r * 0.5, y: earth.y - r * 0.35, r: rc };
  const rects = W > 700 ? [{ x0: 0, y0: 0, x1: W * 0.6, y1: 110 }, { x0: 0, y0: H - 70, x1: W * 0.48, y1: H }] : [];
  rects.push({ x0: comp.x - 50, y0: comp.y - 44, x1: comp.x + 50, y1: comp.y - 18 }); // the target's label
  const labels = [];
  for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * 0.97; labels.push({ id: `s${i}`, x: earth.x + Math.cos(a) * d, y: earth.y + Math.sin(a) * d, w: 60 + rnd() * 130, h: 22 }); }
  return { earth, discs: [comp], rects, bounds: { x0: 0, y0: 0, x1: W, y1: H }, labels, max: 12 };
}

// 1) Hard rules, on 4000 random scenes at desktop and phone sizes.
let placed = 0, asked = 0, crossings = 0;
const SIZES = [[970, 768], [590, 768], [1144, 1080], [1524, 1080], [390, 290], [390, 138], [430, 330], [768, 500]];
for (let it = 0; it < 4000; it++) {
  const [W, H] = SIZES[it % SIZES.length], inp = scene(W, H, 1 + Math.floor(rnd() * 10)), out = layoutLabels(inp), by = new Map(inp.labels.map((l) => [l.id, l]));
  asked += inp.labels.length; placed += out.length;
  assert.ok(out.length <= inp.max);
  assert.deepEqual(out.map((o) => o.id), inp.labels.filter((l) => out.some((o) => o.id === l.id)).map((l) => l.id), "names keep the order of importance");
  out.forEach((o, i) => {
    const L = by.get(o.id), b = o.box, tag = `scene ${it} (${W}x${H}) ${o.id}`;
    assert.ok(Math.abs(b.x1 - b.x0 - L.w) < 1e-6 && Math.abs(b.y1 - b.y0 - L.h) < 1e-6, `${tag}: the box has the size of the name`);
    assert.ok(b.x0 >= 4 && b.y0 >= 4 && b.x1 <= W - 4 && b.y1 <= H - 4, `${tag}: name outside the scene`);
    assert.ok(rectDiscGap(b, inp.earth) >= GAP - 0.5, `${tag}: name over the Earth`);
    for (const d of inp.discs) { assert.ok(rectDiscGap(b, d) >= 8, `${tag}: name over the target world`); assert.ok(pointSegDist(d.x, d.y, L.x, L.y, o.ex, o.ey) >= d.r + 4, `${tag}: leader over the target world`); }
    for (const r of inp.rects) { assert.ok(!rectsOverlap(b, r), `${tag}: name over a button, the footer or the target's label`); assert.ok(!segHitsRect(L.x, L.y, o.ex, o.ey, r), `${tag}: leader over a button or label`); }
    assert.ok(onEdge(o), `${tag}: the leader ends on the edge of its name`);
    assert.ok(Math.hypot(o.ex - L.x, o.ey - L.y) <= Math.max(0, inp.earth.r - Math.hypot(L.x - inp.earth.x, L.y - inp.earth.y)) + GAP + RING + DETOUR * inp.earth.r + 1e-6, `${tag}: leader too long`);
    out.forEach((p, j) => {
      if (j === i) return;
      assert.ok(!rectsOverlap(b, p.box), `${tag}: two names overlap`);
      assert.ok(!segHitsRect(L.x, L.y, o.ex, o.ey, p.box), `${tag}: a leader runs over another name`);
      const M = by.get(p.id); if (j > i && segsCross(L.x, L.y, o.ex, o.ey, M.x, M.y, p.ex, p.ey)) crossings++;
    });
  });
  // the same input gives the same answer, and feeding the answer back (as the app does every frame) changes nothing
  const again = layoutLabels({ ...inp, labels: inp.labels.map((l) => ({ ...l, prev: out.find((o) => o.id === l.id)?.slot })) });
  assert.deepEqual(again, out, `scene ${it}: the layout is stable from one frame to the next`);
}
assert.ok(placed / asked > 0.6, `most names must find room (${placed}/${asked})`);
console.log(`1 ok · ${placed} names placed in 4000 scenes (${asked - placed} dropped for lack of room): none overlaps another name, the Earth, the target world or the page's controls; ${crossings} leader crossings (allowed only when there is no other place)`);

// 2) The opened site comes first and always gets its name at the sizes the app uses on a computer.
for (let it = 0; it < 600; it++) {
  const [W, H] = [[970, 768], [590, 768], [1144, 1080]][it % 3], inp = scene(W, H, 10), out = layoutLabels(inp);
  assert.equal(out[0]?.id, "s0", `desktop scene ${it} (${W}x${H}): the opened site must get its name`);
  if (W >= 970) assert.ok(out.length >= 5, `desktop scene ${it}: at least half of the names must fit (${out.length})`);
}
console.log("2 ok · the first (opened) site always gets its name on computer-sized scenes");

// 3) Phones: only a few names are asked for, and they stay inside a small scene.
let phone = 0;
for (let it = 0; it < 600; it++) {
  const inp = { ...scene(390, 290, 4), max: 4 }, out = layoutLabels(inp);
  phone += out.length; assert.ok(out.length <= 4);
}
assert.ok(phone / 600 >= 2, `phones: on average at least two names must fit (${(phone / 600).toFixed(2)})`);
console.log(`3 ok · phone scene 390x290: ${(phone / 600).toFixed(2)} names placed on average out of 4`);

// 4) A name keeps its place while its site moves a little (no jumping between frames), and a site alone gets the nearest position.
{
  const earth = { x: 400, y: 400, r: 200 }, base = { earth, discs: [], rects: [], bounds: { x0: 0, y0: 0, x1: 970, y1: 768 }, max: 12 };
  const one = layoutLabels({ ...base, labels: [{ id: "a", x: 520, y: 400, w: 100, h: 22 }] })[0];
  assert.equal(SLOTS[one.slot].k, 0); assert.equal(SLOTS[one.slot].ring, 0);
  assert.ok(Math.abs(one.box.x0 - (earth.x + earth.r + GAP)) < 0.5 && Math.abs((one.box.y0 + one.box.y1) / 2 - 400) < 0.5 && Math.abs(one.ex - one.box.x0) < 1e-6 && Math.abs(one.ey - 400) < 1e-6, "a site on the right gets its name straight to the right");
  const below = layoutLabels({ ...base, labels: [{ id: "a", x: 400, y: 520, w: 100, h: 22 }] })[0];
  assert.ok(Math.abs(below.ex - 400) < 1e-6 && Math.abs(below.ey - below.box.y0) < 1e-6 && below.box.y0 >= earth.y + earth.r + GAP - 0.5, "a site at the bottom gets its name straight below, joined from above");
  let prev, jumps = 0;
  for (let i = 0; i <= 60; i++) { // two sites drifting past each other
    const a = { id: "a", x: 480 + i, y: 380, w: 120, h: 22, prev: prev?.a }, b = { id: "b", x: 500, y: 372 + i * 0.5, w: 120, h: 22, prev: prev?.b };
    const out = layoutLabels({ ...base, labels: [a, b] }), now = { a: out.find((o) => o.id === "a")?.slot, b: out.find((o) => o.id === "b")?.slot };
    assert.equal(out.length, 2);
    if (prev && (prev.a !== now.a || prev.b !== now.b)) jumps++;
    prev = now;
  }
  assert.ok(jumps <= 12, `names must not jump at every frame (${jumps} changes in 60 frames)`);
  console.log(`4 ok · a lone site gets the nearest position; two sites drifting past each other change position ${jumps} times in 60 frames`);
}
