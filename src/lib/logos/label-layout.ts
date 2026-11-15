// AI-assisted (Claude), reviewed by team Logos
// Where the names of the sites go in the close-up: outside the Earth's disc, each joined to its site by one straight
// leader line. Pure 2D geometry in screen pixels (no DOM, no three.js), so it is tested in Node (label-layout.test.mjs).
//
// Rules, in the order they are enforced:
//  · a name never overlaps another name, the Earth, the target world, its label or anything else that is on top of the scene;
//  · a leader never passes over the target world or over another name;
//  · a leader is never much longer than the shortest one its site could have (no long lines running around the globe);
//  · when there is a choice, leaders do not cross each other and do not run over another site's dot;
//  · names are placed in the order given (the opened site first), so a name that has no room is dropped, never an earlier one.

export interface Rect { x0: number; y0: number; x1: number; y1: number }
export interface Disc { x: number; y: number; r: number }
export interface LabelIn { id: string; x: number; y: number; w: number; h: number; prev?: number }
export interface LabelOut { id: string; box: Rect; ex: number; ey: number; slot: number }
export interface LayoutIn {
  earth: Disc;        // the Earth's disc on screen
  discs: Disc[];      // other discs to keep clear (the target world)
  rects: Rect[];      // rectangles to keep clear (buttons, the footer, the target's label)
  bounds: Rect;       // the scene
  labels: LabelIn[];  // sites that are visible, most important first: screen position of the site and size of its name
  dots?: { x: number; y: number }[]; // every visible site dot (leaders avoid them when they can)
  max: number;        // most names to place
}

export const GAP = 14;      // px between the Earth's limb and the nearest corner of a name
export const RING = 26;     // px between the first and the second ring of positions
const STEP = (7 * Math.PI) / 180, STEPS = 14; // positions every 7°, up to 98° either side of the site's own direction
const DEFAULT_ANGLE = 0.93; // for a site at the centre of the disc: down and to the right (screen y grows downwards)
const STICK = 1.2;          // a name keeps its previous position unless a clearly better one is free
export const DETOUR = 0.6;  // a leader may be this much longer (in Earth radii) than the straight way out to the limb

/** Candidate positions, nearest to the site's own direction first. */
export const SLOTS: { k: number; ring: number; cost: number }[] = (() => {
  const all: { k: number; ring: number; cost: number }[] = [];
  for (let ring = 0; ring < 2; ring++) for (let k = -STEPS; k <= STEPS; k++) all.push({ k, ring, cost: Math.abs(k) + ring * 1.5 + (k < 0 ? 0.01 : 0) });
  return all.sort((a, b) => a.cost - b.cost);
})();

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Distance from the edge of a disc to a rectangle (negative when they overlap). */
export function rectDiscGap(b: Rect, d: Disc): number {
  return Math.hypot(d.x - clamp(d.x, b.x0, b.x1), d.y - clamp(d.y, b.y0, b.y1)) - d.r;
}
/** Distance from a point to the segment a→b. */
export function pointSegDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = l2 < 1e-9 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
export const rectsOverlap = (a: Rect, b: Rect, padX = 0, padY = 0) => a.x0 < b.x1 + padX && a.x1 > b.x0 - padX && a.y0 < b.y1 + padY && a.y1 > b.y0 - padY;
/** Part of the segment a→b that lies inside the rectangle, as parameters [t0, t1] in 0–1, or null (Liang–Barsky). */
function clip(ax: number, ay: number, bx: number, by: number, r: Rect): [number, number] | null {
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - r.x0], [dx, r.x1 - ax], [-dy, ay - r.y0], [dy, r.y1 - ay]]) {
    if (Math.abs(p) < 1e-12) { if (q < 0) return null; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return null; if (t > t0) t0 = t; } else { if (t < t0) return null; if (t < t1) t1 = t; }
  }
  return [t0, t1];
}
export const segHitsRect = (ax: number, ay: number, bx: number, by: number, r: Rect) => clip(ax, ay, bx, by, r) !== null;
/** True if the open segments a→b and c→d cross. */
export function segsCross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
  const o = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  return o(ax, ay, bx, by, cx, cy) * o(ax, ay, bx, by, dx, dy) < 0 && o(cx, cy, dx, dy, ax, ay) * o(cx, cy, dx, dy, bx, by) < 0;
}

/** The box of a name in one candidate position, and where its leader ends (on the edge of the box). */
function candidate(L: LabelIn, earth: Disc, base: number, slot: { k: number; ring: number }): { box: Rect; ex: number; ey: number } {
  const th = base + slot.k * STEP, ux = Math.cos(th), uy = Math.sin(th), want = GAP + slot.ring * RING;
  let dist = earth.r + want, box: Rect = { x0: 0, y0: 0, x1: 0, y1: 0 };
  for (let i = 0; i < 40; i++) { // the box hangs outwards from its anchor; push it out until its nearest corner clears the limb
    const cx = earth.x + ux * (dist + L.w / 2), cy = earth.y + uy * (dist + L.h / 2);
    box = { x0: cx - L.w / 2, y0: cy - L.h / 2, x1: cx + L.w / 2, y1: cy + L.h / 2 };
    const g = rectDiscGap(box, earth);
    if (g >= want - 0.25) break;
    dist += Math.max(1, want - g);
  }
  // the leader aims at the horizontal mid-line of the box and stops where it meets the edge
  const tx = clamp(L.x, box.x0, box.x1), ty = (box.y0 + box.y1) / 2, c = clip(L.x, L.y, tx, ty, box), t = c ? c[0] : 1;
  return { box, ex: L.x + (tx - L.x) * t, ey: L.y + (ty - L.y) * t };
}

export function layoutLabels(inp: LayoutIn): LabelOut[] {
  const { earth, discs, rects, bounds } = inp, out: LabelOut[] = [], dots = inp.dots ?? inp.labels;
  const lines: { id: string; ax: number; ay: number; bx: number; by: number }[] = [];
  for (const L of inp.labels) {
    if (out.length >= inp.max) break;
    const dx = L.x - earth.x, dy = L.y - earth.y, off = Math.hypot(dx, dy), base = off > earth.r * 0.12 ? Math.atan2(dy, dx) : DEFAULT_ANGLE;
    const longest = Math.max(0, earth.r - off) + GAP + RING + DETOUR * earth.r;
    const ok = (i: number, strict: boolean): { box: Rect; ex: number; ey: number } | null => {
      const c = candidate(L, earth, base, SLOTS[i]), b = c.box;
      if (b.x0 < bounds.x0 + 4 || b.x1 > bounds.x1 - 4 || b.y0 < bounds.y0 + 4 || b.y1 > bounds.y1 - 4) return null;
      if (rectDiscGap(b, earth) < GAP - 0.5) return null;
      if (Math.hypot(c.ex - L.x, c.ey - L.y) > longest) return null;
      if (discs.some((d) => rectDiscGap(b, d) < 8 || pointSegDist(d.x, d.y, L.x, L.y, c.ex, c.ey) < d.r + 4)) return null;
      if (rects.some((r) => rectsOverlap(b, r, 6, 4) || segHitsRect(L.x, L.y, c.ex, c.ey, r))) return null;
      if (out.some((o) => rectsOverlap(b, o.box, 8, 4) || segHitsRect(L.x, L.y, c.ex, c.ey, o.box))) return null;
      if (lines.some((l) => segHitsRect(l.ax, l.ay, l.bx, l.by, { x0: b.x0 - 2, y0: b.y0 - 2, x1: b.x1 + 2, y1: b.y1 + 2 }))) return null;
      if (!strict) return c;
      if (lines.some((l) => segsCross(L.x, L.y, c.ex, c.ey, l.ax, l.ay, l.bx, l.by))) return null;
      if (dots.some((d) => (d.x !== L.x || d.y !== L.y) && pointSegDist(d.x, d.y, L.x, L.y, c.ex, c.ey) < 10)) return null;
      return c;
    };
    let pick = -1, found: { box: Rect; ex: number; ey: number } | null = null;
    for (const strict of [true, false]) {
      for (let i = 0; i < SLOTS.length && !found; i++) { const c = ok(i, strict); if (c) { pick = i; found = c; } }
      if (!found) continue;
      // keep the previous position unless the new one is clearly better: names do not jump while the globe turns
      if (L.prev !== undefined && L.prev !== pick && L.prev >= 0 && L.prev < SLOTS.length && SLOTS[L.prev].cost - STICK <= SLOTS[pick].cost) {
        const c = ok(L.prev, strict); if (c) { pick = L.prev; found = c; }
      }
      break;
    }
    if (!found) continue;
    out.push({ id: L.id, box: found.box, ex: found.ex, ey: found.ey, slot: pick });
    lines.push({ id: L.id, ax: L.x, ay: L.y, bx: found.ex, by: found.ey });
  }
  return out;
}
