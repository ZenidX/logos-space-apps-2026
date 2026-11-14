// AI-assisted (Claude), reviewed by team Logos
// 3D arcs between globes: one clean curve per Earth site, in the colour of the mission's target body with a
// subtle gradient towards the Earth end. Each arc draws once and then stays still. Depth-tested, so the part
// behind a planet is hidden. Uses Line2 (three/examples/jsm/lines) for a real pixel width.
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { arcPoints, type Dims, type Sphere } from "./orrery-math.ts";

export interface ArcSpec {
  id: string;
  dims?: Dims; // kept for callers; no longer drawn as segments
  a: THREE.Vector3; na: THREE.Vector3; // start (target on the Moon/Mars) and its normal
  b: THREE.Vector3; nb: THREE.Vector3; // end (site on Earth) and its normal
  color0: number; color1: number; // target-body colour → Earth colour
  delay?: number; // s
  hiddenEnd?: boolean; // the Earth end is on the far side
  spheres?: Sphere[]; // globes the arc must stay outside of
}

export const PTS = 129, SEGS = PTS - 1; // dense enough for a wide loop around a globe to read as a curve
export const DRAW_S = 0.9, STAGGER_S = 0.12;

interface Item { id: string; delay: number; line: Line2; hidden: boolean }

function colors(c0: number, c1: number): Float32Array {
  const a = new THREE.Color(c0), b = a.clone().lerp(new THREE.Color(c1), 0.35), out = new Float32Array(PTS * 3), c = new THREE.Color();
  for (let i = 0; i < PTS; i++) { c.copy(a).lerp(b, i / SEGS); out[i * 3] = c.r; out[i * 3 + 1] = c.g; out[i * 3 + 2] = c.b; }
  return out;
}

export class ArcSet {
  readonly group = new THREE.Group();
  items: Item[] = []; // public for tests
  private t0 = 0;
  private highlight: string | null = null;
  private readonly res = new THREE.Vector2(1, 1);
  private readonly reduced: boolean;
  /** reduced = prefers-reduced-motion (arcs appear already drawn). The first argument is kept for callers. */
  constructor(lite = false, reduced = false) { void lite; this.reduced = reduced; this.group.renderOrder = 10; }

  setResolution(w: number, h: number) {
    this.res.set(w, h);
    for (const it of this.items) it.line.material.resolution.set(w, h);
  }

  /** Rebuilds the arcs. `keepProgress` (while a globe is dragged) keeps the draw state and reuses materials. */
  setArcs(specs: ArcSpec[], now: number, keepProgress = false) {
    if (keepProgress && this.reuse(specs)) return;
    this.clear();
    if (!keepProgress) this.t0 = now;
    for (const s of specs) {
      const g = new LineGeometry();
      g.setPositions(arcPoints(s.a, s.na, s.b, s.nb, s.spheres ?? [], PTS)); g.setColors(colors(s.color0, s.color1));
      const m = new LineMaterial({ vertexColors: true, linewidth: 2, transparent: true, opacity: 0.9, depthTest: true, depthWrite: false });
      m.resolution.copy(this.res);
      const line = new Line2(g, m);
      line.renderOrder = 10; line.visible = false;
      this.group.add(line);
      this.items.push({ id: s.id, delay: s.delay ?? this.items.length * STAGGER_S, line, hidden: !!s.hiddenEnd });
    }
  }

  private reuse(specs: ArcSpec[]): boolean {
    if (specs.length !== this.items.length || specs.some((s, i) => s.id !== this.items[i].id)) return false;
    specs.forEach((s, k) => {
      const it = this.items[k], g = new LineGeometry();
      g.setPositions(arcPoints(s.a, s.na, s.b, s.nb, s.spheres ?? [], PTS)); g.setColors(colors(s.color0, s.color1));
      it.hidden = !!s.hiddenEnd; it.line.geometry.dispose(); it.line.geometry = g;
    });
    return true;
  }

  /** Highlights one arc (hovered or selected site) and dims the rest; null = all equal. */
  setHighlight(id: string | null) { this.highlight = id; }

  /** Advances the draw-in. Returns true while something is still moving. */
  update(nowSec: number, paused = false): boolean {
    void paused;
    let busy = false;
    const el = nowSec - this.t0;
    for (const it of this.items) {
      const p = this.reduced ? 1 : Math.min(1, Math.max(0, (el - it.delay) / DRAW_S)), e = 1 - Math.pow(1 - p, 3); // ease-out
      const count = Math.floor(e * SEGS);
      it.line.visible = count > 0;
      if (count > 0) (it.line.geometry as unknown as { instanceCount: number }).instanceCount = count;
      const on = this.highlight === null || this.highlight === it.id;
      it.line.material.opacity = on ? 0.9 : 0.07; // with one site in focus the other arcs almost disappear
      it.line.material.linewidth = this.highlight === it.id ? 3 : 2;
      if (p < 1) busy = true;
    }
    return busy;
  }

  private clear() {
    for (const c of [...this.group.children]) {
      this.group.remove(c);
      const o = c as Line2;
      o.geometry.dispose(); (o.material as THREE.Material).dispose();
    }
    this.items = [];
  }
  dispose() { this.clear(); }
}
