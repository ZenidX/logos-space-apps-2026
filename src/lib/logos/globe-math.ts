// AI-assisted (Claude), reviewed by team Logos
// Pure globe math (no DOM): can be tested in Node. three.js convention:
// SphereGeometry puts lon 0 at +X, lon -90 at +Z, lat +90 at +Y (see the test in globe-math.test.mjs).
import * as THREE from "three";

export function latLonToVec3(lat: number, lon: number, r = 1, out = new THREE.Vector3()): THREE.Vector3 {
  const phi = ((lon + 180) * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return out.set(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}

/** Is the point on the visible side? (camPos = camera position relative to the centre of the globe). */
export function isFacing(point: THREE.Vector3, camPos: THREE.Vector3, minDot = 0.15): boolean {
  return point.clone().normalize().dot(camPos.clone().normalize()) > minDot;
}

/** Spherical interpolation of the camera position (constant radius); e = 0..1, already eased. */
export function flyPosition(from: THREE.Vector3, to: THREE.Vector3, e: number): THREE.Vector3 {
  const q = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
  const qk = new THREE.Quaternion().slerp(q, e);
  return from.clone().applyQuaternion(qk);
}

export const easeInOutCubic = (k: number): number => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export interface Placed {
  id: string;
  x: number; // px
  y: number; // px
  rank?: number;
}

/**
 * Anti-overlap: by priority (selected first, then rank), drop anything closer than
 * `minSep` px to something already kept. Returns the ids that can be shown.
 */
export function declutter(points: Placed[], selectedId: string | null | undefined, minSep = 28): Set<string> {
  const order = [...points].sort(
    (a, b) => Number(b.id === selectedId) - Number(a.id === selectedId) || (a.rank ?? 99) - (b.rank ?? 99),
  );
  const kept: Placed[] = [];
  for (const p of order) {
    if (!kept.some((k) => Math.hypot(k.x - p.x, k.y - p.y) < minSep)) kept.push(p);
  }
  return new Set(kept.map((k) => k.id));
}

/** The pole is not viewed from below: the camera stays at |lat| <= maxAbsLat (the marker stays in place). */
export const viewLat = (lat: number, maxAbsLat = 65): number => Math.max(-maxAbsLat, Math.min(maxAbsLat, lat));
