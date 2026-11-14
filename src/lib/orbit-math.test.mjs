// AI-assisted (Claude), reviewed by team Logos
// Tests of the «shared orbit» scene maths. Run with `npm test`.
import assert from "node:assert/strict";
import * as THREE from "three";
import { EARTH_R, FOV, LASER_FAR, angleDelta, cameraDir, extentPoints, frameDistance, laserAlpha, layoutFor, orbitPoint, orientToFace, parkAngle, segmentHitsSphere, siteFacing } from "./orbit-math.ts";
import { latLonToVec3 } from "./globe-math.ts";
const V = (...a) => new THREE.Vector3(...a);

// 1) Framing: at every scene size the app uses, the Earth and both orbits (with their bodies) stay inside the frame.
const sizes = { "1366x768 landing": [874, 768, false], "1366x768 mission": [1096, 768, false], "1366x768 site": [766, 768, false], "1920x1080 mission": [1650, 1080, false],
  "390x844 landing": [390, 270, true], "390x844 mission": [390, 338, true], "390x844 site": [390, 186, true] };
let worst = 0;
for (const [name, [w, h, compact]] of Object.entries(sizes)) {
  const L = layoutFor(compact), aspect = w / h, d = frameDistance(aspect, L), cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 200);
  cam.position.copy(cameraDir(L.elev)).multiplyScalar(d); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  for (const p of extentPoints(L)) { const q = p.clone().project(cam), m = Math.max(Math.abs(q.x), Math.abs(q.y)); worst = Math.max(worst, m); assert.ok(m <= 0.95, `${name}: something leaves the frame (ndc ${m.toFixed(3)})`); }
  for (const o of [L.moon, L.mars]) assert.ok(Math.min(o.a, o.b) - o.r > EARTH_R * 1.15, `${name}: an orbiting body would touch the Earth`);
}
console.log(`1 ok · Earth, orbits and bodies inside the frame at ${Object.keys(sizes).length} scene sizes (worst |ndc| ${worst.toFixed(3)})`);

// 2) Lasers never pass through a globe: for thousands of random sites and orbit positions, whenever a laser is drawn
//    (alpha > 0) every interior point of the segment is outside the Earth and outside the target body.
let drawn = 0, hidden = 0, seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const compact of [false, true]) {
  const L = layoutFor(compact), cam = cameraDir(L.elev).multiplyScalar(frameDistance(1.4, L));
  for (const o of [L.moon, L.mars]) for (let k = 0; k < 4000; k++) {
    const qE = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28)), nS = latLonToVec3(rnd() * 180 - 90, rnd() * 360 - 180).applyQuaternion(qE).normalize(), S = nS.clone().multiplyScalar(EARTH_R);
    const C = orbitPoint(o, rnd() * 6.28), nM = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), M = C.clone().addScaledVector(nM, o.r);
    const a = laserAlpha(S, nS, M, C, o.r, cam, rnd() < 0.3);
    assert.ok(a >= 0 && a <= 1);
    if (a === 0) { hidden++; continue; }
    drawn++;
    for (let i = 1; i < 40; i++) {
      const p = S.clone().lerp(M, i / 40);
      assert.ok(p.length() >= EARTH_R * 0.9985, `laser inside the Earth (case ${k}, point ${i}, r ${p.length().toFixed(4)})`);
      assert.ok(p.distanceTo(C) >= o.r * 0.9985, `laser inside the target body (case ${k}, point ${i})`);
    }
  }
}
assert.ok(drawn > 300 && hidden > 300, `test must cover both drawn and hidden lasers (${drawn}/${hidden})`);
console.log(`2 ok · ${drawn} lasers drawn, none through a globe; ${hidden} correctly not drawn`);

// 3) A laser through the Earth is refused, a clear one is drawn and fades with distance.
{
  const L = layoutFor(false), cam = cameraDir(L.elev).multiplyScalar(12), o = L.moon;
  const front = V(0, 0, 1), back = V(0, 0, -1), C = V(0, 0.2, 1.75), M = C.clone().addScaledVector(V(0, 0, -1), o.r);
  assert.ok(laserAlpha(front, front, M, C, o.r, cam) > 0.9, "site right under the target: link drawn");
  assert.equal(laserAlpha(back, back, M, C, o.r, cam), 0, "site on the far side: link not drawn");
  assert.equal(segmentHitsSphere(V(-2, 0, 0), V(2, 0, 0), V(0, 0, 0), 1), true); assert.equal(segmentHitsSphere(V(-2, 1.2, 0), V(2, 1.2, 0), V(0, 0, 0), 1), false);
  const farC = V(0, 0.2, 1 + LASER_FAR + 0.6), farM = farC.clone().addScaledVector(V(0, 0, -1), o.r);
  assert.equal(laserAlpha(front, front, farM, farC, o.r, cam), 0, "beyond the far distance the link has faded out");
  assert.equal(laserAlpha(front, front, farM, farC, o.r, cam, true), 1, "an opened site keeps its link whatever the distance");
}
console.log("3 ok · refuses lines through the Earth, fades with distance, stays on for the opened site");

// 4) Opening a site: the target parks in front-right of the Earth and the site, turned to its facing direction, gets a clear link.
for (const compact of [false, true]) {
  const L = layoutFor(compact), cam = cameraDir(L.elev).multiplyScalar(frameDistance(compact ? 1.15 : 1.4, L));
  for (const o of [L.moon, L.mars]) {
    const th = parkAngle(o, L.elev), C = orbitPoint(o, th), face = siteFacing(o, L.elev);
    assert.ok(C.dot(cameraDir(L.elev)) > 0 && C.x > 0, "parking spot is on the camera side and to the right");
    for (const [lat, lon] of [[35.6, -111.6], [-48.3, -69.2], [75.4, -89.7], [-77.5, 162], [18.3, 41.8]]) {
      const q = orientToFace(latLonToVec3(lat, lon), face), nS = latLonToVec3(lat, lon).applyQuaternion(q).normalize(), S = nS.clone();
      assert.ok(nS.distanceTo(face) < 1e-6, "the opened site faces the chosen direction");
      const toSite = S.clone().sub(C).normalize(), toCam = cam.clone().sub(C).normalize(), nM = toCam.multiplyScalar(0.45).addScaledVector(toSite, 0.55).normalize(), M = C.clone().addScaledVector(nM, o.r);
      assert.equal(laserAlpha(S, nS, M, C, o.r, cam, true), 1, `opened site ${lat},${lon}: link must be clear`);
    }
  }
}
assert.ok(Math.abs(angleDelta(0.1, 6.2) + 0.1832) < 1e-3 && Math.abs(angleDelta(6.2, 0.1) - 0.1832) < 1e-3);
console.log("4 ok · parked target and opened site always get a clear, pinned link; shortest-way orbit travel");
