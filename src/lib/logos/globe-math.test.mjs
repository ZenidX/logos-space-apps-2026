// AI-assisted (Claude), reviewed by team Logos
// Run with `npm test`.
import assert from "node:assert/strict";
import * as THREE from "three";
import { latLonToVec3, isFacing, flyPosition, declutter, viewLat } from "./globe-math.ts";

// 1) latLonToVec3 matches the REAL vertices of SphereGeometry (u = (lon+180)/360, v = (lat+90)/180)
const g = new THREE.SphereGeometry(1, 64, 48);
const pos = g.attributes.position, uv = g.attributes.uv, tmp = new THREE.Vector3();
let maxErr = 0;
for (let i = 0; i < pos.count; i++) {
  const lon = uv.getX(i) * 360 - 180, lat = uv.getY(i) * 180 - 90;
  maxErr = Math.max(maxErr, latLonToVec3(lat, lon, 1, tmp).distanceTo(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))));
}
assert.ok(maxErr < 1e-5, `latLonToVec3 does not match SphereGeometry (error ${maxErr})`);
console.log("1 ok · vertices:", pos.count, "· max error", maxErr.toExponential(1));

// 2) Orientation: seen from outside, EAST is on the right and NORTH is up (globe not mirrored)
const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
cam.position.copy(latLonToVec3(0, 0, 3.8)); cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
const este = latLonToVec3(0, 20).project(cam), norte = latLonToVec3(20, 0).project(cam);
assert.ok(este.x > 0.1 && Math.abs(este.y) < 1e-6, `east must be on the right (x=${este.x})`);
assert.ok(norte.y > 0.1 && Math.abs(norte.x) < 1e-6, `north must be up (y=${norte.y})`);
console.log("2 ok · east → x =", este.x.toFixed(3), "· north → y =", norte.y.toFixed(3));

// 3) Visible side
const c = latLonToVec3(30, 20, 3.8);
assert.ok(isFacing(latLonToVec3(30, 20), c));
assert.ok(!isFacing(latLonToVec3(-30, -160), c));
assert.ok(isFacing(latLonToVec3(30, 100), c) && !isFacing(latLonToVec3(30, 120), c));
console.log("3 ok · visible/hidden, including the edge zone");

// 4) Flight: exact endpoints and constant radius
const a = latLonToVec3(30, 20, 3.8), b = latLonToVec3(-60, 140, 3.8);
assert.ok(flyPosition(a, b, 0).distanceTo(a) < 1e-9 && flyPosition(a, b, 1).distanceTo(b) < 1e-6);
for (const e of [0.2, 0.5, 0.8]) assert.ok(Math.abs(flyPosition(a, b, e).length() - 3.8) < 1e-9);
console.log("4 ok · spherical flight (constant radius)");

// 5) Anti-overlap
const pts = [{ id: "A", x: 0, y: 0, rank: 1 }, { id: "B", x: 10, y: 0, rank: 2 }, { id: "C", x: 40, y: 0, rank: 3 }];
assert.deepEqual([...declutter(pts, null)].sort(), ["A", "C"]);
assert.deepEqual([...declutter(pts, "B")].sort(), ["B", "C"]);
console.log("5 ok · anti-overlap (rank and selected)");

// 6) The camera does not view the pole from below
assert.equal(viewLat(-89.54), -65); assert.equal(viewLat(33), 33);
console.log("6 ok · viewLat");
