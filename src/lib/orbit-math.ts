// AI-assisted (Claude), reviewed by team Logos
// Pure maths of the «shared orbit» scene: the Earth at the centre, the Moon and Mars on two drawn orbits around it,
// and straight "laser" links between an Earth site and its target. A schematic, NOT to scale (sizes, distances, and
// Mars does not orbit the Earth). No DOM here, so it can be tested in Node (orbit-math.test.mjs).
import * as THREE from "three";

export type BodyId = "earth" | "moon" | "mars";
export type Mode = { kind: "overview" } | { kind: "focus"; body: "moon" | "mars" };
export const FOV = 32;
export const EARTH_R = 1;

export interface OrbitDef { a: number; b: number; tiltX: number; tiltZ: number; period: number; phase: number; r: number }
export interface Layout { moon: OrbitDef; mars: OrbitDef; elev: number }

/** Orbits are tighter on small screens so everything fits at 390 px. Angles in radians, periods in seconds. */
export function layoutFor(compact: boolean): Layout {
  return compact
    ? { elev: 0.42, moon: { a: 1.5, b: 1.5, tiltX: 0.1, tiltZ: -0.16, period: 46, phase: 2.2, r: 0.22 }, mars: { a: 2.02, b: 2.02, tiltX: -0.08, tiltZ: 0.2, period: 78, phase: 0.6, r: 0.32 } }
    : { elev: 0.38, moon: { a: 1.75, b: 1.75, tiltX: 0.1, tiltZ: -0.16, period: 46, phase: 2.2, r: 0.26 }, mars: { a: 2.55, b: 2.55, tiltX: -0.08, tiltZ: 0.2, period: 78, phase: 0.6, r: 0.4 } };
}

/** Point of an orbit at angle theta (theta = π/2 is the side nearest the camera). */
export function orbitPoint(o: OrbitDef, theta: number, out = new THREE.Vector3()): THREE.Vector3 {
  out.set(o.a * Math.cos(theta), 0, o.b * Math.sin(theta));
  const cx = Math.cos(o.tiltX), sx = Math.sin(o.tiltX), y1 = out.y * cx - out.z * sx, z1 = out.y * sx + out.z * cx; // tilt about X
  const cz = Math.cos(o.tiltZ), sz = Math.sin(o.tiltZ), x2 = out.x * cz - y1 * sz, y2 = out.x * sz + y1 * cz; // tilt about Z
  return out.set(x2, y2, z1);
}

export const cameraDir = (elev: number) => new THREE.Vector3(0, Math.sin(elev), Math.cos(elev));

/** Everything that must stay in frame: the Earth and both orbits with their bodies. */
export function extentPoints(L: Layout): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const ring = (c: THREE.Vector3, r: number) => { for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pts.push(new THREE.Vector3(c.x + x * r, c.y + y * r, c.z)); };
  ring(new THREE.Vector3(), EARTH_R * 1.06);
  for (const o of [L.moon, L.mars]) for (let i = 0; i < 48; i++) ring(orbitPoint(o, (i / 48) * Math.PI * 2), o.r * 1.12);
  return pts;
}

/** Camera distance (looking at the origin from `cameraDir`) at which every extent point fits with a margin. */
export function frameDistance(aspect: number, L: Layout, margin = 0.93): number {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 200), dir = cameraDir(L.elev), pts = extentPoints(L);
  const fits = (d: number) => {
    cam.position.copy(dir).multiplyScalar(d); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
    return pts.every((p) => { const q = p.clone().project(cam); return Math.abs(q.x) <= margin && Math.abs(q.y) <= margin; });
  };
  let lo = 2, hi = 80;
  for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return hi;
}

/** Orientation that turns local point `v` to face direction `dir`, keeping north up (no odd roll). */
export function orientToFace(v: THREE.Vector3, dir: THREE.Vector3, up = new THREE.Vector3(0, 1, 0)): THREE.Quaternion {
  const d = dir.clone().normalize(), qA = new THREE.Quaternion().setFromUnitVectors(v.clone().normalize(), d);
  const proj = (w: THREE.Vector3) => w.clone().addScaledVector(d, -w.dot(d));
  const n = proj(new THREE.Vector3(0, 1, 0).applyQuaternion(qA)), u = proj(up);
  if (n.lengthSq() < 1e-8 || u.lengthSq() < 1e-8) return qA;
  n.normalize(); u.normalize();
  const ang = Math.atan2(new THREE.Vector3().crossVectors(n, u).dot(d), n.dot(u));
  return new THREE.Quaternion().setFromAxisAngle(d, ang).multiply(qA);
}

/** Where a target parks when one of its sites is opened: on its orbit, in front of the Earth and to the right. */
export function parkAngle(o: OrbitDef, elev: number): number {
  const want = cameraDir(elev).multiplyScalar(0.62).add(new THREE.Vector3(0.78, 0.12, 0)).normalize(), p = new THREE.Vector3();
  let best = 0, bestDot = -Infinity;
  for (let i = 0; i < 720; i++) { const th = (i / 720) * Math.PI * 2, d = orbitPoint(o, th, p).normalize().dot(want); if (d > bestDot) { bestDot = d; best = th; } }
  return best;
}

/** Direction an opened site should face: between the camera and its parked target, so the site is visible and the link is short. */
export function siteFacing(o: OrbitDef, elev: number): THREE.Vector3 {
  return cameraDir(elev).multiplyScalar(0.62).add(orbitPoint(o, parkAngle(o, elev)).normalize().multiplyScalar(0.38)).normalize();
}

/** True if the open segment p→q passes through the sphere (the end points themselves may lie on its surface). */
export function segmentHitsSphere(p: THREE.Vector3, q: THREE.Vector3, c: THREE.Vector3, r: number): boolean {
  const d = q.clone().sub(p), len2 = d.lengthSq();
  if (len2 < 1e-12) return false;
  const t = Math.min(0.985, Math.max(0.015, c.clone().sub(p).dot(d) / len2)); // closest point, away from the two ends
  return p.clone().addScaledVector(d, t).distanceTo(c) < r * 0.999;
}

export const LASER_NEAR = 1.25, LASER_FAR = 2.35;
const smooth = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

/**
 * Opacity (0–1) of the straight link between an Earth site S (outward normal nS) and its target point M on a body
 * (centre bodyC, radius bodyR). It is 0, i.e. not drawn, when the line would pass through the Earth or the body, when
 * the target is below the site's horizon, or when the site is on the far side from the camera. Otherwise it fades with distance.
 */
export function laserAlpha(S: THREE.Vector3, nS: THREE.Vector3, M: THREE.Vector3, bodyC: THREE.Vector3, bodyR: number, camPos: THREE.Vector3, pinned = false): number {
  const dir = M.clone().sub(S), dist = dir.length();
  if (dist < 1e-6) return 0;
  if (dir.dot(nS) / dist <= 0.02) return 0; // target at or below the site's horizon: the line would enter the Earth
  if (segmentHitsSphere(S, M, new THREE.Vector3(), EARTH_R) || segmentHitsSphere(S, M, bodyC, bodyR)) return 0;
  if (camPos.clone().sub(S).normalize().dot(nS) <= 0.05) return 0; // site on the far side of the Earth
  return pinned ? 1 : 1 - smooth((dist - LASER_NEAR) / (LASER_FAR - LASER_NEAR));
}

/** Shortest signed step from angle a to angle b. */
export const angleDelta = (a: number, b: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
