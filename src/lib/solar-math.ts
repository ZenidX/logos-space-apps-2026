// AI-assisted (Claude), reviewed by team Logos
// Pure maths of the scene: a heliocentric overview (Sun, Earth and Mars on their orbits, the Moon around the Earth)
// and a close-up of the Earth with the mission's target world shown beside it. No DOM: tested in Node (solar-math.test.mjs).
//
// IN PROPORTION: orbit radii Earth : Mars = 1 : 1.524; orbital periods 1 : 1.881; the Moon's period (27.32 d) against the
// Earth's year; the sizes of Earth, Mars and Moon relative to each other (1 : 0.532 : 0.273).
// NOT IN PROPORTION: the size of the bodies against the orbits (bodies are enlarged), the Sun's size, the Moon's distance
// (enlarged), orbits drawn as circles in one plane, and the target world placed next to the Earth in the close-up.
import * as THREE from "three";

export type BodyId = "earth" | "moon" | "mars";
export type Mode = { kind: "overview" } | { kind: "focus"; body: "moon" | "mars" };
export const FOV = 32;

/** NASA NSSDC planetary fact sheets: semi-major axes 1.000 and 1.524 au; sidereal periods 365.256, 686.980 and 27.322 days; mean radii 6371.0, 3389.5 and 1737.4 km. */
export const FACTS = { marsAU: 1.524, earthDays: 365.256, marsDays: 686.98, moonDays: 27.3217, earthKm: 6371.0, marsKm: 3389.5, moonKm: 1737.4 } as const;

export const EARTH_R = 1; // scene unit = one Earth radius
export const RADIUS: Record<BodyId, number> = { earth: EARTH_R, mars: FACTS.marsKm / FACTS.earthKm, moon: FACTS.moonKm / FACTS.earthKm };
export const AU = 8.6; // scene units per astronomical unit (bodies are enlarged against the orbits)
export const ORBIT = { earth: AU, mars: AU * FACTS.marsAU, moon: 1.9 } as const; // the Moon's distance is enlarged
/** Bodies are drawn this much larger in the overview than in the close-up. Their size against the orbits is not to scale
 * anyway (said in the footer); their sizes against each other stay in proportion, and the Moon's enlarged orbit grows with them. */
export const OVERVIEW_SCALE = 1.7;
export const SUN_R = 1.5; // not to scale (the real Sun is 109 Earth radii); drawn larger than the Earth so its surface reads
export const YEAR_S = 60; // one Earth year of the overview lasts this many seconds
export const PERIOD_S = { earth: YEAR_S, mars: (YEAR_S * FACTS.marsDays) / FACTS.earthDays, moon: (YEAR_S * FACTS.moonDays) / FACTS.earthDays } as const;
const PHASE = { earth: 0.6, mars: 2.4, moon: 1.0 };

/** Heliocentric positions at scene time t (seconds): circular orbits in the ecliptic plane (y = 0). */
export function positions(t: number): Record<BodyId, THREE.Vector3> {
  const at = (r: number, period: number, phase: number) => { const a = phase + (2 * Math.PI * t) / period; return new THREE.Vector3(r * Math.cos(a), 0, -r * Math.sin(a)); };
  const earth = at(ORBIT.earth, PERIOD_S.earth, PHASE.earth), mars = at(ORBIT.mars, PERIOD_S.mars, PHASE.mars);
  return { earth, mars, moon: earth.clone().add(at(ORBIT.moon, PERIOD_S.moon, PHASE.moon)) };
}

export interface Pose { pos: THREE.Vector3; look: THREE.Vector3 }
const UP = new THREE.Vector3(0, 1, 0);

/** Camera distance along `dir` from `look` at which every point fits inside the frame with a margin. */
export function fitDistance(look: THREE.Vector3, dir: THREE.Vector3, pts: THREE.Vector3[], aspect: number, margin: number): number {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.05, 400), d = dir.clone().normalize();
  const fits = (dist: number) => {
    cam.position.copy(look).addScaledVector(d, dist); cam.lookAt(look); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
    return pts.every((p) => { const q = p.clone().project(cam); return q.z < 1 && Math.abs(q.x) <= margin && Math.abs(q.y) <= margin; });
  };
  let lo = 0.5, hi = 400;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  return hi;
}
const ring = (c: THREE.Vector3, r: number, right: THREE.Vector3, up: THREE.Vector3) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, y]) => c.clone().addScaledVector(right, x * r).addScaledVector(up, y * r));

/** Everything the overview must show: the whole orbit of Mars (with Mars on it), which contains the Earth's orbit, the Moon and the Sun. */
export function overviewExtent(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push(...ring(new THREE.Vector3(ORBIT.mars * Math.cos(a), 0, ORBIT.mars * Math.sin(a)), RADIUS.mars * 1.3 * OVERVIEW_SCALE, new THREE.Vector3(1, 0, 0), UP)); }
  return pts;
}
export const OVERVIEW_ELEV = 0.86; // radians above the ecliptic
/** `margin` > 1 lets the orbit of Mars run past the frame (used on phones in portrait, so the bodies read larger). */
export function overviewPose(aspect: number, margin = 0.93): Pose {
  const dir = new THREE.Vector3(0, Math.sin(OVERVIEW_ELEV), Math.cos(OVERVIEW_ELEV)), look = new THREE.Vector3();
  return { look, pos: dir.clone().multiplyScalar(fitDistance(look, dir, overviewExtent(), aspect, margin)) };
}

/** Angle between the Sun's direction and the close-up camera, around the vertical: the Sun lights the Earth from the
 * front right, so the day side faces the viewer and the night side (with its city lights) shows along the left limb. */
export const CLOSE_SUN_ANGLE = 0.7;
/** Close-up frame around the Earth at E: `dir` points from the Earth to the camera (on the sunlit side, a little above the ecliptic). */
export function closeFrame(E: THREE.Vector3) {
  const toSun = E.clone().normalize().negate(), side = new THREE.Vector3().crossVectors(toSun, UP).normalize();
  const dir = toSun.multiplyScalar(Math.cos(CLOSE_SUN_ANGLE)).addScaledVector(side, Math.sin(CLOSE_SUN_ANGLE)).multiplyScalar(0.95).add(new THREE.Vector3(0, 0.31, 0)).normalize();
  const right = new THREE.Vector3().crossVectors(UP, dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right).normalize();
  return { dir, right, up };
}
/** Where the target world is shown in the close-up: beside the Earth (not at its real distance), a little above and towards the camera. */
export function companionPos(E: THREE.Vector3, body: "moon" | "mars"): THREE.Vector3 {
  const f = closeFrame(E);
  return E.clone().addScaledVector(f.right, EARTH_R + RADIUS[body] + 0.55).addScaledVector(f.up, 0.4).addScaledVector(f.dir, 0.25);
}
/** Room kept free on the left of the Earth for the names of the sites, in Earth radii (used when the scene is wide enough). */
export const NAME_ROOM = 0.6;
export function closePose(E: THREE.Vector3, body: "moon" | "mars", aspect: number, room = 0): Pose {
  const f = closeFrame(E), C = companionPos(E, body), look = E.clone().lerp(C, 0.42).addScaledVector(f.right, -room * 0.5);
  const pts = [...ring(E, EARTH_R * 1.1, f.right, f.up), ...ring(C, RADIUS[body] * 1.35 + 0.12, f.right, f.up), E.clone().addScaledVector(f.right, -(EARTH_R * 1.1 + room))];
  return { look, pos: look.clone().addScaledVector(f.dir, fitDistance(look, f.dir, pts, aspect, 0.86)) };
}
/** Stop-over of the camera journey: close to the target world at its real place on its orbit. */
export function targetPose(P: THREE.Vector3, body: "moon" | "mars"): Pose {
  const dir = P.clone().normalize().multiplyScalar(-0.9).add(new THREE.Vector3(0, 0.45, 0)).normalize();
  return { look: P.clone(), pos: P.clone().addScaledVector(dir, RADIUS[body] * 9) };
}
/** Opening shot (first screen only): behind the Earth's night side, a little above the ecliptic, so the Sun rises over its
 * limb and the city lights show; the camera then pulls back to the overview. Earth radius here = OVERVIEW_SCALE. */
export const INTRO_S = 7.5;
export function introPose(E: THREE.Vector3, aspect: number): Pose {
  const toSun = E.clone().normalize().negate(), side = new THREE.Vector3().crossVectors(toSun, UP).normalize(), r = EARTH_R * OVERVIEW_SCALE;
  const back = aspect < 1 ? 5.6 / Math.max(0.42, aspect) : 5.6; // phones: further back so the globe fits the narrow frame
  const pos = E.clone().addScaledVector(toSun, -back * r / 1.7).addScaledVector(UP, 0.86 * r).addScaledVector(side, 0.75 * r);
  const look = E.clone().addScaledVector(toSun, aspect < 1 ? 1.2 * r : 2.4 * r).addScaledVector(UP, 0.32 * r);
  return { pos, look };
}
export const easeOut = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
export const lerpPose =(a: Pose, b: Pose, k: number): Pose => ({ pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k) });
export const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** Angle (radians) between the view axis and the direction an opened site is turned to. */
export const SITE_TILT = 0.52;
/**
 * Direction (from the Earth's centre) an opened site is turned to: towards the camera, tilted down and to the right.
 * There its name has free room below the Earth, next to the target world, at every size of the scene.
 */
export function siteFacing(E: THREE.Vector3): THREE.Vector3 {
  const f = closeFrame(E), side = f.right.clone().multiplyScalar(0.6).addScaledVector(f.up, -0.8).normalize();
  return f.dir.clone().multiplyScalar(Math.cos(SITE_TILT)).addScaledVector(side, Math.sin(SITE_TILT)).normalize();
}
/** A point of a globe is shown only if it faces the camera by more than this (cosine of the angle between its normal and the line of sight). */
export const FACING_MIN = 0.12;
export const facesCamera = (p: THREE.Vector3, n: THREE.Vector3, camPos: THREE.Vector3) => camPos.clone().sub(p).normalize().dot(n) > FACING_MIN;

/** Orientation that turns local point `v` to face direction `dir`, keeping north up (no odd roll). */
export function orientToFace(v: THREE.Vector3, dir: THREE.Vector3, up = UP): THREE.Quaternion {
  const d = dir.clone().normalize(), qA = new THREE.Quaternion().setFromUnitVectors(v.clone().normalize(), d);
  const proj = (w: THREE.Vector3) => w.clone().addScaledVector(d, -w.dot(d));
  const n = proj(new THREE.Vector3(0, 1, 0).applyQuaternion(qA)), u = proj(up);
  if (n.lengthSq() < 1e-8 || u.lengthSq() < 1e-8) return qA;
  n.normalize(); u.normalize();
  const ang = Math.atan2(new THREE.Vector3().crossVectors(n, u).dot(d), n.dot(u));
  return new THREE.Quaternion().setFromAxisAngle(d, ang).multiply(qA);
}

/** True if the segment p→q passes through the sphere (its end points may lie on the surface). */
export function segmentHitsSphere(p: THREE.Vector3, q: THREE.Vector3, c: THREE.Vector3, r: number): boolean {
  const d = q.clone().sub(p), len2 = d.lengthSq();
  if (len2 < 1e-12) return false;
  const t = Math.min(0.985, Math.max(0.015, c.clone().sub(p).dot(d) / len2));
  return p.clone().addScaledVector(d, t).distanceTo(c) < r * 0.999;
}
