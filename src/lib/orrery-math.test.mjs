// AI-assisted (Claude), reviewed by team Logos
// Pruebas numéricas de orrery-math.ts. Ejecutar con `bash probar.sh` (copia los .ts a una carpeta con node_modules/three).
import assert from "node:assert/strict";
import * as THREE from "three";
import { LANDSCAPE, PORTRAIT, FOV, poseFor, lerpPose, orientToFace, worldPoint, arcCurve, arcAt, sampleArc, arcSegments, segKind, extentPoints } from "./orrery-math.ts";
import { latLonToVec3 } from "./globe-math.ts";
const V = (...a) => new THREE.Vector3(...a);

// 1) Encuadre: en TODAS las poses y proporciones (escritorio, tablet, móvil alto) los 3 globos caben en pantalla
const cam = (pose, aspect) => { const c = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100); c.position.copy(pose.pos); c.lookAt(pose.look); c.updateMatrixWorld(true); c.updateProjectionMatrix(); return c; };
let worst = 0;
for (const aspect of [16 / 9, 4 / 3, 1, 0.93, 0.56]) for (const mode of [{ kind: "overview" }, { kind: "focus", body: "moon" }, { kind: "focus", body: "mars" }]) {
  const pose = poseFor(mode, aspect), c = cam(pose, aspect);
  for (const p of extentPoints(pose.scale, pose.layout)) { const q = p.clone().project(c); worst = Math.max(worst, Math.abs(q.x), Math.abs(q.y)); assert.ok(Math.abs(q.x) <= 0.8801 && Math.abs(q.y) <= 0.8801, `fuera de encuadre (aspect ${aspect}, ${JSON.stringify(mode)}): ${q.x.toFixed(3)},${q.y.toFixed(3)}`); }
}
console.log("1 ok · encuadre en 15 combinaciones · peor |ndc| =", worst.toFixed(3));

// 2) Distancia de cámara razonable (ni pegada ni lejísimos) y el foco agranda el objetivo
const o = poseFor({ kind: "overview" }, 16 / 9), fm = poseFor({ kind: "focus", body: "mars" }, 16 / 9), tall = poseFor({ kind: "overview" }, 0.56);
console.log("   distancias → overview 16:9:", o.pos.distanceTo(o.look).toFixed(2), "· foco Marte:", fm.pos.distanceTo(fm.look).toFixed(2), "· overview móvil alto:", tall.pos.distanceTo(tall.look).toFixed(2));
assert.ok(fm.scale.mars > 1.5 && fm.scale.moon < 1 && fm.opacity.moon < 1 && fm.opacity.mars === 1);
assert.ok(tall.layout === PORTRAIT && o.layout === LANDSCAPE); // en vertical cambia la disposición (globos grandes)
assert.ok(tall.pos.distanceTo(tall.look) < 12, "en vertical los globos quedarían diminutos: " + tall.pos.distanceTo(tall.look));
console.log("2 ok · foco agranda el objetivo, atenúa el otro, y en vertical usa la disposición PORTRAIT con cámara a < 12");

// 3) Transición: extremos exactos y monotonía
const a = poseFor({ kind: "overview" }, 16 / 9), b = poseFor({ kind: "focus", body: "moon" }, 16 / 9);
assert.ok(lerpPose(a, b, 0).pos.distanceTo(a.pos) < 1e-9 && lerpPose(a, b, 1).pos.distanceTo(b.pos) < 1e-9);
assert.ok(Math.abs(lerpPose(a, b, 0.5).scale.moon - (a.scale.moon + b.scale.moon) / 2) < 1e-9); // easeInOut(0,5)=0,5
console.log("3 ok · lerpPose: extremos y punto medio");

// 4) orientToFace: el punto mira a la cámara y el norte queda hacia arriba (casos: Xinjiang, Polo sur lunar, Alaska)
for (const [lat, lon] of [[42.94, 93.75], [-89.5, 0], [61.04, -148.35], [-44.95, -68.75]]) {
  const v = latLonToVec3(lat, lon), dir = V(0.1, 0.2, 0.97).normalize(), q = orientToFace(v, dir);
  assert.ok(v.clone().applyQuaternion(q).distanceTo(dir) < 1e-6, `no mira a cámara (${lat},${lon})`);
  const n = V(0, 1, 0).applyQuaternion(q), up = n.clone().addScaledVector(dir, -n.dot(dir));
  if (Math.abs(lat) < 80) assert.ok(up.y > 0, `norte hacia abajo (${lat},${lon})`);
}
console.log("4 ok · orientToFace: 4 puntos (incluido el polo sur) miran a cámara; el norte queda arriba salvo en el polo");

// 5) Arco: extremos exactos, sale hacia fuera de la superficie y no atraviesa la Tierra (caso visible: Marte → Tierra)
const qE = orientToFace(latLonToVec3(42.94, 93.75), V(0.8, 0.1, 0.6)), qM = orientToFace(latLonToVec3(40, -160), V(-0.9, 0.2, 0.4));
const A = worldPoint(LANDSCAPE, "mars", qM, 1.7, 40, -160), B = worldPoint(LANDSCAPE, "earth", qE, 1, 42.94, 93.75);
const c = arcCurve(A.p, A.n, B.p, B.n);
assert.ok(arcAt(c, 0).distanceTo(A.p) < 1e-9 && arcAt(c, 1).distanceTo(B.p) < 1e-9);
assert.ok(arcAt(c, 0.04).sub(A.p).dot(A.n) > 0, "no sale hacia fuera de Marte");
assert.ok(arcAt(c, 0.96).sub(B.p).dot(B.n) > 0, "no llega desde fuera a la Tierra");
let minE = 9, minM = 9; const e0 = V(...LANDSCAPE.earth.pos), m0 = V(...LANDSCAPE.mars.pos);
for (let t = 0.03; t <= 0.97; t += 0.01) { const p = arcAt(c, t); minE = Math.min(minE, p.distanceTo(e0)); minM = Math.min(minM, p.distanceTo(m0)); }
assert.ok(minE >= LANDSCAPE.earth.r * 0.99 && minM >= LANDSCAPE.mars.r * 1.7 * 0.99, `el arco atraviesa un globo (min ${minE.toFixed(3)} / ${minM.toFixed(3)})`);
console.log("5 ok · arco: extremos exactos, sale perpendicular, no atraviesa ningún globo (dist. mín. a la Tierra", minE.toFixed(2), "r=1)");

// 5b) Lo mismo en la disposición vertical (móvil): Marte arriba-derecha → Tierra abajo
{ const A2 = worldPoint(PORTRAIT, "mars", qM, 1.7, 40, -160), B2 = worldPoint(PORTRAIT, "earth", qE, 1, 42.94, 93.75), c2 = arcCurve(A2.p, A2.n, B2.p, B2.n);
  let mE = 9; const e2 = V(...PORTRAIT.earth.pos); for (let t = 0.03; t <= 0.97; t += 0.01) mE = Math.min(mE, arcAt(c2, t).distanceTo(e2));
  assert.ok(mE >= 0.99, "arco vertical atraviesa la Tierra: " + mE); console.log("5b ok · arco en vertical: dist. mín. a la Tierra", mE.toFixed(2)); }

// 6) Muestreo y tramos
const s = sampleArc(c, 65); assert.equal(s.length, 65 * 3);
assert.deepEqual(arcSegments([0.963, 0.99, 1]), ["un", "ok", "ok", "ok"]);
assert.deepEqual(arcSegments([0.912, 0.84, 1]), ["un", "ok", "brk", "thin"]); // Alaska ↔ Shackleton (datos reales v3)
assert.deepEqual(arcSegments([0.947, 0.99, 1]), ["un", "ok", "ok", "thin"]); // Coqên ↔ Arcadia
assert.equal(segKind(0.95), "ok"); assert.equal(segKind(0.9), "thin"); assert.equal(segKind(0.8999), "brk");
console.log("6 ok · 65 puntos y tramos con datos reales (Alaska → «brk» en Shape)");
