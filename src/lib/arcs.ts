// AI-assisted (Claude), reviewed by team Logos
// 3D arcs between globes: 4 segments per arc (mission rules + not scored), progressive draw and photon.
// Usa Line2 (three/examples/jsm/lines): grosor en píxeles y `instanceCount` para animar el dibujo. Sin dependencias nuevas.
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { arcAt, arcCurve, arcSegments, sampleArc, type ArcCurve, type Dims, type SegKind } from "./orrery-math.ts";

export interface ArcSpec {
  id: string;
  dims: Dims;
  a: THREE.Vector3; na: THREE.Vector3; // salida (objetivo en Luna/Marte) y su normal
  b: THREE.Vector3; nb: THREE.Vector3; // llegada (candidato en la Tierra) y su normal
  color0: number; color1: number; // degradado objetivo → Tierra
  delay?: number; // s
  /** true si el extremo de llegada está en la cara oculta: se dibuja «a través» con menos alfa */
  hiddenEnd?: boolean;
}

const PTS = 65, PER = 16; // 64 segmentos → 4 tramos de 16
const DRAW_S = 0.7, PHOTON_S = 3.6;
const AMBER = 0xffb454, DIM = 0x8392ac;

interface Item { id: string; curve: ArcCurve; pts: Float32Array; delay: number; lines: { line: Line2; kind: SegKind; base: number }[]; photon: THREE.Mesh | null; hidden: boolean }

export class ArcSet {
  readonly group = new THREE.Group();
  items: Item[] = []; // público solo para las pruebas
  private t0 = 0;
  private highlight: string | null = null;
  private readonly res = new THREE.Vector2(1, 1);
  private readonly lite: boolean;
  private readonly reduced: boolean;
  /** lite = móvil/portátil flojo (sin fotones) · reduced = prefers-reduced-motion (arcos ya dibujados, sin fotón). */
  constructor(lite = false, reduced = false) { this.lite = lite; this.reduced = reduced; this.group.renderOrder = 10; }

  setResolution(w: number, h: number) {
    this.res.set(w, h);
    for (const it of this.items) for (const l of it.lines) l.line.material.resolution.set(w, h);
  }

  /** Reconstruye todo (se llama al cambiar de objetivo o mientras se arrastra un globo). `keepProgress` no reinicia el dibujo. */
  setArcs(specs: ArcSpec[], now: number, keepProgress = false) {
    if (keepProgress && this.reuse(specs)) return; // arrastrando un globo: solo cambian las posiciones (sin crear materiales)
    this.clear();
    if (!keepProgress) this.t0 = now;
    for (const s of specs) {
      const curve = arcCurve(s.a, s.na, s.b, s.nb), pts = sampleArc(curve, PTS), kinds = arcSegments(s.dims);
      const c0 = new THREE.Color(s.color0), c1 = new THREE.Color(s.color1), lines: Item["lines"] = [];
      kinds.forEach((kind, i) => {
        const g = new LineGeometry();
        g.setPositions(pts.subarray(i * PER * 3, (i * PER + PER + 1) * 3)); // 17 puntos: comparte el extremo con el siguiente tramo
        const color = kind === "brk" ? AMBER : kind === "un" ? DIM : c0.clone().lerp(c1, (i + 0.5) / 4);
        const dashed = kind === "brk" || kind === "un", base = (kind === "thin" ? 0.8 : kind === "un" ? 0.55 : 1) * (s.hiddenEnd ? 0.35 : 1);
        const m = new LineMaterial({ color, linewidth: kind === "thin" ? 1.5 : 2.4, transparent: true, opacity: base, depthTest: false, dashed, dashSize: kind === "brk" ? 0.025 : 0.01, gapSize: kind === "brk" ? 0.05 : 0.06 });
        m.resolution.copy(this.res);
        const line = new Line2(g, m);
        if (dashed) line.computeLineDistances();
        line.renderOrder = 10; line.visible = false;
        this.group.add(line); lines.push({ line, kind, base });
      });
      let photon: THREE.Mesh | null = null;
      if (!this.lite && !this.reduced) {
        photon = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false }));
        photon.renderOrder = 11; this.group.add(photon);
      }
      this.items.push({ id: s.id, curve, pts, delay: s.delay ?? this.items.length * 0.12, lines, photon, hidden: !!s.hiddenEnd });
    }
  }

  /** Mismo conjunto de arcos (mismos ids y tramos): reescribe las posiciones en sitio. Devuelve false si hay que reconstruir. */
  private reuse(specs: ArcSpec[]): boolean {
    if (specs.length !== this.items.length || specs.some((s, i) => s.id !== this.items[i].id || s.hiddenEnd !== this.items[i].hidden)) return false;
    specs.forEach((s, k) => {
      const it = this.items[k], curve = arcCurve(s.a, s.na, s.b, s.nb), pts = sampleArc(curve, PTS);
      it.curve = curve; it.pts = pts;
      it.lines.forEach((l, i) => {
        const g = new LineGeometry();
        g.setPositions(pts.subarray(i * PER * 3, (i * PER + PER + 1) * 3));
        l.line.geometry.dispose(); l.line.geometry = g;
        if (l.kind === "brk" || l.kind === "un") l.line.computeLineDistances();
      });
    });
    return true;
  }

  /** Resalta un arco (el de la fila/marcador seleccionado) y atenúa los demás; null = todos iguales. */
  setHighlight(id: string | null) { this.highlight = id; }

  /** Avanza la animación. Devuelve true mientras algo se mueve (hay que seguir renderizando). */
  update(nowSec: number, paused = false): boolean {
    let busy = false;
    const el = nowSec - this.t0;
    for (const it of this.items) {
      const p = this.reduced ? 1 : Math.min(1, Math.max(0, (el - it.delay) / DRAW_S)), e = 1 - Math.pow(1 - p, 3); // ease-out
      const mul = this.highlight === null || this.highlight === it.id ? 1 : 0.35;
      it.lines.forEach((l, i) => {
        const frac = Math.min(1, Math.max(0, e * 4 - i)), count = Math.floor(frac * PER);
        l.line.visible = count > 0;
        if (count > 0) (l.line.geometry as unknown as { instanceCount: number }).instanceCount = count;
        l.line.material.opacity = l.base * mul;
      });
      if (p < 1) busy = true;
      else if (it.photon && !paused) { // fotón en bucle: sale del objetivo y muere al llegar
        const k = (((el - it.delay - DRAW_S) % PHOTON_S) + PHOTON_S) % PHOTON_S / PHOTON_S, v = arcAt(it.curve, k);
        it.photon.position.copy(v);
        (it.photon.material as THREE.MeshBasicMaterial).opacity = (this.highlight === null || this.highlight === it.id ? 0.95 : 0.2) * Math.sin(Math.PI * k) ** 0.5;
        busy = true;
      }
    }
    return busy;
  }

  private clear() {
    for (const c of [...this.group.children]) {
      this.group.remove(c);
      const o = c as THREE.Mesh | Line2;
      o.geometry.dispose(); (o.material as THREE.Material).dispose();
    }
    this.items = [];
  }
  dispose() { this.clear(); }
}
