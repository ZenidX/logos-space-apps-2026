// AI-assisted (Claude), reviewed by team Logos
// ArcSet logic without a GPU (Line2/LineMaterial build fine in Node).
import assert from "node:assert/strict";
import * as THREE from "three";
import { ArcSet, SEGS, DRAW_S, STAGGER_S } from "./arcs.ts";
import { latLonToVec3 } from "./globe-math.ts";
import { LANDSCAPE, orientToFace, worldPoint } from "./orrery-math.ts";
const qE = orientToFace(latLonToVec3(42.94, 93.75), new THREE.Vector3(0.8, 0.1, 0.6)), qM = orientToFace(latLonToVec3(40, -160), new THREE.Vector3(-0.9, 0.2, 0.4));
const A = worldPoint(LANDSCAPE, "mars", qM, 1.7, 40, -160), B = worldPoint(LANDSCAPE, "earth", qE, 1, 42.94, 93.75);
const spec = (id) => ({ id, a: A.p, na: A.n, b: B.p, nb: B.n, color0: 0xff8d5e, color1: 0x5db4ff });
const count = (it) => (it.line.visible ? it.line.geometry.instanceCount : 0);

// 1) one line per arc; progressive draw with stagger; complete after DRAW_S (+ stagger)
let set = new ArcSet(false, false); set.setArcs([spec("a"), spec("b")], 100);
assert.equal(set.group.children.length, 2, "one Line2 per arc, nothing else (no dots, no photons)");
set.update(100); assert.deepEqual(set.items.map(count), [0, 0]);
assert.equal(set.update(100 + DRAW_S / 2), true); assert.ok(count(set.items[0]) > count(set.items[1]) && count(set.items[1]) > 0, "second arc starts later");
assert.equal(set.update(100 + DRAW_S + STAGGER_S + 0.01), false, "after drawing, nothing keeps moving");
assert.deepEqual(set.items.map(count), [SEGS, SEGS]);
console.log("1 ok · one line per arc, staggered draw-in, then still");

// 2) solid, depth-tested (hidden behind planets), single hue with a gradient
const m = set.items[0].line.material, col = set.items[0].line.geometry.attributes.instanceColorStart;
assert.equal(m.dashed, false); assert.equal(m.depthTest, true); assert.equal(m.vertexColors, true); assert.ok(col, "gradient colours missing");
const first = new THREE.Color(col.getX(0), col.getY(0), col.getZ(0)), last = new THREE.Color(col.getX(SEGS - 1), col.getY(SEGS - 1), col.getZ(SEGS - 1));
assert.ok(Math.abs(first.r - new THREE.Color(0xff8d5e).r) < 1e-3 && first.r > last.r && last.r > new THREE.Color(0x5db4ff).r, "gradient should stay close to the mission colour");
console.log("2 ok · solid line, depth-tested, subtle gradient from the mission colour");

// 3) reduced motion: fully drawn on the first frame
const red = new ArcSet(false, true); red.setArcs([spec("a")], 0); assert.equal(red.update(0), false); assert.equal(count(red.items[0]), SEGS);
console.log("3 ok · reduced motion: drawn at once");

// 4) highlight: others dim, and it resets
set.setHighlight("a"); set.update(200); assert.equal(set.items[0].line.material.opacity, 0.9); assert.ok(set.items[1].line.material.opacity < 0.3);
set.setHighlight(null); set.update(200); assert.equal(set.items[1].line.material.opacity, 0.9);
console.log("4 ok · highlight dims the other arcs");

// 5) reuse while dragging: same Line2 and material, new positions; rebuild when the set changes; dispose empties
const before = set.items[0].line, mat = before.material; set.setArcs([spec("a"), spec("b")], 300, true);
assert.equal(set.items[0].line, before); assert.equal(before.material, mat); assert.equal(count(set.items[0]), SEGS, "progress kept");
set.setArcs([spec("c")], 400, true); assert.equal(set.items.length, 1); assert.notEqual(set.items[0].line, before);
set.dispose(); assert.equal(set.group.children.length, 0);
console.log("5 ok · reuse, rebuild, dispose");
