// AI-assisted (Claude), reviewed by team Logos
// Tests of the scene maths (heliocentric overview + Earth close-up). Run with `npm test`.
import assert from "node:assert/strict";
import * as THREE from "three";
import { AU, EARTH_R, FACTS, FOV, NAME_ROOM, ORBIT, OVERVIEW_SCALE, PERIOD_S, RADIUS, YEAR_S, closeFrame, closePose, companionPos, facesCamera, FACING_MIN, SITE_TILT, orientToFace, overviewExtent, overviewPose, positions, segmentHitsSphere, siteFacing, targetPose } from "./solar-math.ts";
import { latLonToVec3 } from "./globe-math.ts";
const V = (...a) => new THREE.Vector3(...a), near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const camFor = (pose, aspect) => { const c = new THREE.PerspectiveCamera(FOV, aspect, 0.05, 400); c.position.copy(pose.pos); c.lookAt(pose.look); c.updateMatrixWorld(true); c.updateProjectionMatrix(); return c; };

// 1) What we say is in proportion, is: orbit radii 1 : 1.524, periods 1 : 1.881, Moon month vs year, relative sizes.
assert.ok(near(ORBIT.mars / ORBIT.earth, 1.524) && near(ORBIT.earth, AU));
assert.ok(near(PERIOD_S.mars / PERIOD_S.earth, 686.98 / 365.256) && Math.abs(PERIOD_S.mars / PERIOD_S.earth - 1.881) < 1e-3);
assert.ok(near(PERIOD_S.earth / PERIOD_S.moon, 365.256 / 27.3217) && near(PERIOD_S.earth, YEAR_S));
assert.ok(Math.abs(RADIUS.mars - 0.532) < 1e-3 && Math.abs(RADIUS.moon - 0.2727) < 1e-3 && RADIUS.earth === EARTH_R && FACTS.marsAU === 1.524);
for (const t of [0, 7.3, 31, 59.9, 200]) { // bodies stay on their circles; after one period each is back where it started
  const p = positions(t); assert.ok(near(p.earth.length(), ORBIT.earth) && near(p.mars.length(), ORBIT.mars) && near(p.moon.distanceTo(p.earth), ORBIT.moon) && p.earth.y === 0);
  assert.ok(positions(t + PERIOD_S.mars).mars.distanceTo(p.mars) < 1e-6 && positions(t + YEAR_S).earth.distanceTo(p.earth) < 1e-6);
}
assert.ok(ORBIT.moon > EARTH_R + RADIUS.moon + 0.3, "the enlarged Moon orbit clears the Earth");
assert.ok(OVERVIEW_SCALE >= 1 && ORBIT.moon * OVERVIEW_SCALE > (EARTH_R + RADIUS.moon) * OVERVIEW_SCALE + 0.3, "in the overview (bodies and the Moon's orbit grown together) the Moon still clears the Earth");
assert.ok(ORBIT.earth - EARTH_R * OVERVIEW_SCALE > 1.5 + 2, "grown bodies stay well clear of the Sun");
console.log("1 ok · orbit radii 1 : 1.524, periods 1 : 1.881, Moon 27.32 d, sizes 1 : 0.532 : 0.273 — as stated in the footer");

// 2) Overview: both orbits, with their bodies, fit the frame at every scene size the app uses.
// scene sizes the app uses; the story frames its subject in a virtual view (the canvas minus the part kept for text)
const sizes = { "1366x768 story, first screen": [1366, 768], "1366x768 story, beside the text": [792, 768], "1920x1080 story, beside the text": [1114, 1080], "390x844 story, first screen": [390, 844], "390x844 story, above the text": [390, 473], "1366x768 mission": [970, 768], "390x844 mission": [390, 338], "390x844 site": [390, 186], "1366x768 site": [590, 768] };
let worst = 0;
for (const [name, [w, h]] of Object.entries(sizes)) {
  const cam = camFor(overviewPose(w / h), w / h);
  for (const p of overviewExtent()) { const q = p.clone().project(cam), m = Math.max(Math.abs(q.x), Math.abs(q.y)); worst = Math.max(worst, m); assert.ok(m <= 0.95, `${name}: the overview leaves the frame (${m.toFixed(3)})`); }
}
console.log(`2 ok · overview inside the frame at ${Object.keys(sizes).length} scene sizes (worst |ndc| ${worst.toFixed(3)})`);

// 3) Close-up: the Earth and the companion world fit the frame, do not touch, and the companion is on the right of the Earth.
worst = 0;
for (const room of [0, NAME_ROOM]) for (const t of [0, 13, 29, 47]) for (const body of ["moon", "mars"]) for (const [name, [w, h]] of Object.entries(sizes)) {
  const E = positions(t).earth, C = companionPos(E, body), f = closeFrame(E), cam = camFor(closePose(E, body, w / h, room), w / h);
  assert.ok(C.distanceTo(E) > EARTH_R + RADIUS[body] + 0.3, "companion must not touch the Earth");
  assert.ok(near(f.dir.length(), 1) && Math.abs(f.dir.dot(f.right)) < 1e-9 && Math.abs(f.up.dot(f.right)) < 1e-9);
  const pe = E.clone().project(cam), pc = C.clone().project(cam); assert.ok(pc.x > pe.x, `${name}: companion on the right`);
  for (const [c, r] of [[E, EARTH_R], [C, RADIUS[body]]]) for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const q = c.clone().addScaledVector(f.right, x * r).addScaledVector(f.up, y * r).project(cam), m = Math.max(Math.abs(q.x), Math.abs(q.y)); worst = Math.max(worst, m);
    assert.ok(m <= 0.9, `${name} ${body}: a globe leaves the frame in the close-up (${m.toFixed(3)})`);
  }
  // with room asked for, at least that much of the frame is left free on the left of the Earth
  if (room) { const edge = E.clone().addScaledVector(f.right, -EARTH_R).project(cam), free = E.clone().addScaledVector(f.right, -(EARTH_R + room)).project(cam); assert.ok(free.x >= -0.9 && free.x < edge.x, `${name} ${body}: no room for names left of the Earth`); }
  const tp = targetPose(positions(t)[body], body); assert.ok(tp.pos.distanceTo(tp.look) > RADIUS[body] * 3);
}
console.log(`3 ok · close-up: Earth and companion inside the frame at every size and date (worst |ndc| ${worst.toFixed(3)})`);

// 4) Sites on the far side are not shown, and one that is shown is never seen through the Earth.
let shown = 0, hiddenSites = 0, seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let k = 0; k < 6000; k++) {
  const body = k % 2 ? "moon" : "mars", E = positions(rnd() * 120).earth, cam = closePose(E, body, 0.6 + rnd() * 1.6).pos;
  const qE = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28)), nS = latLonToVec3(rnd() * 180 - 90, rnd() * 360 - 180).applyQuaternion(qE).normalize(), S = E.clone().addScaledVector(nS, EARTH_R);
  if (!facesCamera(S, nS, cam)) { hiddenSites++; continue; }
  shown++;
  assert.equal(segmentHitsSphere(S, cam, E, EARTH_R), false, `case ${k}: a shown site must not be behind the Earth`);
}
assert.ok(shown > 1500 && hiddenSites > 1500 && FACING_MIN > 0, `must cover shown and hidden sites (${shown}/${hiddenSites})`);
assert.equal(segmentHitsSphere(V(-2, 0, 0), V(2, 0, 0), V(0, 0, 0), 1), true); assert.equal(segmentHitsSphere(V(-2, 1.2, 0), V(2, 1.2, 0), V(0, 0, 0), 1), false);
console.log(`4 ok · ${shown} sites facing the camera are shown, none through the Earth; ${hiddenSites} on the far side are hidden`);

// 5) An opened site is turned towards the camera, down and to the right of the Earth's centre, well inside the visible side.
for (const t of [0, 13, 29, 47]) for (const body of ["moon", "mars"]) for (const [name, [w, h]] of Object.entries(sizes)) {
  const E = positions(t).earth, f = closeFrame(E), pose = closePose(E, body, w / h, w >= 560 ? NAME_ROOM : 0), cam = camFor(pose, w / h), face = siteFacing(E);
  assert.ok(near(face.length(), 1) && near(face.dot(f.dir), Math.cos(SITE_TILT), 1e-9) && face.dot(f.right) > 0.2 && face.dot(f.up) < -0.3);
  for (const [lat, lon] of [[35.6, -111.6], [-48.3, -69.2], [75.4, -89.7], [-77.5, 162], [18.3, 41.8], [-32.7, 19.8]]) {
    const q = orientToFace(latLonToVec3(lat, lon), face), nS = latLonToVec3(lat, lon).applyQuaternion(q).normalize(), S = E.clone().addScaledVector(nS, EARTH_R);
    assert.ok(nS.distanceTo(face) < 1e-6 && facesCamera(S, nS, pose.pos), `${name}: the opened site ${lat},${lon} must face the camera`);
    const ps = S.clone().project(cam), pe = E.clone().project(cam);
    assert.ok(ps.x > pe.x && ps.y < pe.y, `${name}: the opened site is shown right of and below the Earth's centre`);
    assert.ok(Math.abs(ps.x) < 0.9 && Math.abs(ps.y) < 0.9);
  }
}
console.log("5 ok · the opened site always faces the camera, below and to the right of the Earth's centre");
