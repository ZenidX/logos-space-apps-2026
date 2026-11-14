// AI-assisted (Claude), reviewed by team Logos
// Matemática pura del «Orrery» (3 mundos en una escena). Sin DOM: se prueba en Node (orrery-math.test.mjs).
// Depende de globe-math.ts (copiar de ~/spaceapp/src/lib/globe-math.ts).
import * as THREE from "three";
import { easeInOutCubic, latLonToVec3 } from "./globe-math.ts";

export type BodyId = "earth" | "moon" | "mars";
export type Mode = { kind: "overview" } | { kind: "focus"; body: "moon" | "mars" };

export type Layout = Record<BodyId, { pos: [number, number, number]; r: number }>;
/** Diorama NO a escala (se avisa en el pie de la UI). Escritorio: la Tierra a la izquierda; Luna y Marte a la derecha. */
export const LANDSCAPE: Layout = {
  earth: { pos: [-1.5, -0.1, 0], r: 1.0 },
  moon: { pos: [1.55, 0.95, -0.6], r: 0.36 },
  mars: { pos: [1.95, -0.75, -0.3], r: 0.5 },
};
/** Móvil vertical (proporción < 0,85): Luna y Marte arriba, la Tierra debajo; así los globos salen grandes. */
export const PORTRAIT: Layout = {
  earth: { pos: [-0.2, -0.8, 0], r: 1.0 },
  moon: { pos: [-0.95, 1.05, -0.5], r: 0.36 },
  mars: { pos: [0.85, 0.95, -0.3], r: 0.5 },
};
export const layoutFor = (aspect: number): Layout => (aspect < 0.85 ? PORTRAIT : LANDSCAPE);
export const FOV = 32;
const FOCUS_SCALE: Record<"moon" | "mars", number> = { moon: 2.0, mars: 1.7 };

export interface Pose {
  layout: Layout;
  pos: THREE.Vector3;
  look: THREE.Vector3;
  scale: Record<BodyId, number>;
  opacity: Record<BodyId, number>;
}

const bodyCenter = (l: Layout, b: BodyId) => new THREE.Vector3(...l[b].pos);

/** Puntos extremos de cada globo (con su escala) para comprobar el encuadre. */
export function extentPoints(scale: Record<BodyId, number>, layout: Layout): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (const b of Object.keys(layout) as BodyId[]) {
    const c = bodyCenter(layout, b), r = layout[b].r * scale[b];
    for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pts.push(new THREE.Vector3(c.x + x * r, c.y + y * r, c.z));
  }
  return pts;
}

/** Aleja la cámara por su eje hasta que todos los puntos caben con margen (busca por bisección; robusto a cualquier proporción). */
export function fitPose(look: THREE.Vector3, dir: THREE.Vector3, scale: Record<BodyId, number>, aspect: number, layout: Layout, margin = 0.88): THREE.Vector3 {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100), pts = extentPoints(scale, layout), d = dir.clone().normalize();
  const fits = (dist: number) => {
    cam.position.copy(look).addScaledVector(d, dist); cam.lookAt(look); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
    return pts.every((p) => { const q = p.clone().project(cam); return Math.abs(q.x) <= margin && Math.abs(q.y) <= margin; });
  };
  let lo = 2, hi = 60;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return look.clone().addScaledVector(d, hi);
}

export function poseFor(mode: Mode, aspect: number): Pose {
  const scale: Record<BodyId, number> = { earth: 1, moon: 1, mars: 1 };
  const opacity: Record<BodyId, number> = { earth: 1, moon: 1, mars: 1 };
  const layout = layoutFor(aspect);
  let look = aspect < 0.85 ? new THREE.Vector3(-0.05, 0.1, 0) : new THREE.Vector3(0.2, -0.05, 0);
  if (mode.kind === "focus") {
    for (const b of ["moon", "mars"] as const) { scale[b] = b === mode.body ? FOCUS_SCALE[b] : 0.85; opacity[b] = b === mode.body ? 1 : 0.55; }
    scale.earth = 1.05;
    look = bodyCenter(layout, "earth").lerp(bodyCenter(layout, mode.body), 0.58);
  }
  const dir = new THREE.Vector3(0.0, 0.05, 1);
  return { layout, pos: fitPose(look, dir, scale, aspect, layout), look, scale, opacity };
}

export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  const e = easeInOutCubic(Math.min(1, Math.max(0, k))), mixR = (x: Record<BodyId, number>, y: Record<BodyId, number>) => ({ earth: x.earth + (y.earth - x.earth) * e, moon: x.moon + (y.moon - x.moon) * e, mars: x.mars + (y.mars - x.mars) * e });
  return { layout: b.layout, pos: a.pos.clone().lerp(b.pos, e), look: a.look.clone().lerp(b.look, e), scale: mixR(a.scale, b.scale), opacity: mixR(a.opacity, b.opacity) };
}

/**
 * Orientación que lleva el punto local `v` (lat/lon del marcador) a mirar a la cámara, con el norte hacia arriba
 * (sin giro raro). `dirToCam` = dirección unitaria del centro del globo hacia la cámara.
 */
export function orientToFace(v: THREE.Vector3, dirToCam: THREE.Vector3, up = new THREE.Vector3(0, 1, 0)): THREE.Quaternion {
  const d = dirToCam.clone().normalize(), qA = new THREE.Quaternion().setFromUnitVectors(v.clone().normalize(), d);
  const proj = (w: THREE.Vector3) => w.clone().addScaledVector(d, -w.dot(d)); // quita la componente a lo largo de d
  const n = proj(new THREE.Vector3(0, 1, 0).applyQuaternion(qA)), u = proj(up);
  if (n.lengthSq() < 1e-8 || u.lengthSq() < 1e-8) return qA; // mirando a un polo: sin referencia de norte
  n.normalize(); u.normalize();
  const ang = Math.atan2(new THREE.Vector3().crossVectors(n, u).dot(d), n.dot(u));
  return new THREE.Quaternion().setFromAxisAngle(d, ang).multiply(qA);
}

/** Posición y normal (mundo) de un punto lat/lon de un globo con su orientación y escala actuales. */
export function worldPoint(layout: Layout, body: BodyId, q: THREE.Quaternion, scale: number, lat: number, lon: number): { p: THREE.Vector3; n: THREE.Vector3 } {
  const n = latLonToVec3(lat, lon, 1).applyQuaternion(q).normalize();
  return { p: bodyCenter(layout, body).addScaledVector(n, layout[body].r * scale), n };
}

// ---------- arcos ----------
export interface ArcCurve { p0: THREE.Vector3; p1: THREE.Vector3; p2: THREE.Vector3; p3: THREE.Vector3 }
/** Bézier cúbica: sale y llega perpendicular a la superficie (por las normales) y se eleva según la distancia. */
export function arcCurve(a: THREE.Vector3, na: THREE.Vector3, b: THREE.Vector3, nb: THREE.Vector3): ArcCurve {
  const ab = b.clone().sub(a), h = 0.28 * ab.length() + 0.22;
  return { p0: a.clone(), p1: a.clone().addScaledVector(ab, 0.28).addScaledVector(na, h), p2: a.clone().addScaledVector(ab, 0.72).addScaledVector(nb, h), p3: b.clone() };
}
export function arcAt(c: ArcCurve, t: number, out = new THREE.Vector3()): THREE.Vector3 {
  const u = 1 - t, w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
  return out.set(w0 * c.p0.x + w1 * c.p1.x + w2 * c.p2.x + w3 * c.p3.x, w0 * c.p0.y + w1 * c.p1.y + w2 * c.p2.y + w3 * c.p3.y, w0 * c.p0.z + w1 * c.p1.z + w2 * c.p2.z + w3 * c.p3.z);
}
/** `n` puntos (n ≥ 2) como Float32Array xyz. */
export function sampleArc(c: ArcCurve, n: number): Float32Array {
  const out = new Float32Array(n * 3), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) { arcAt(c, i / (n - 1), v); out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z; }
  return out;
}

export type SegKind = "ok" | "thin" | "brk" | "un";
/** Umbrales propuestos (cámbialos si Datos prefiere otros): ≥ 0,95 sólido · 0,90–0,95 fino · < 0,90 se rompe. */
export const THRESHOLDS = { ok: 0.95, thin: 0.9 } as const;
export type Dims = [number | null, number | null, number | null];
/** null = not scored for this mission. */
export const segKind = (v: number | null): SegKind => (v === null ? "un" : v >= THRESHOLDS.ok ? "ok" : v >= THRESHOLDS.thin ? "thin" : "brk");
/** The 4 segments of an arc: up to 3 mission rules (1 = met, 0 = not met, null = no data) + «not scored» (always «un»). */
/** Order from the target to the Earth site: «not scored» first, then the conditions, the main one landing on the site. */
export const arcSegments = (dims: Dims): SegKind[] => ["un", segKind(dims[2]), segKind(dims[1]), segKind(dims[0])];
