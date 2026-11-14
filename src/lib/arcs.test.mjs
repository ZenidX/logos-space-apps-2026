// AI-assisted (Claude), reviewed by team Logos
// Prueba la lógica de ArcSet SIN GPU (Line2/LineMaterial se construyen en Node). `bash probar.sh` la ejecuta junto a orrery-math.
import assert from "node:assert/strict";
import * as THREE from "three";
import { ArcSet } from "./arcs.ts";
import { latLonToVec3 } from "./globe-math.ts";
import { LANDSCAPE, orientToFace, worldPoint } from "./orrery-math.ts";
const qE = orientToFace(latLonToVec3(42.94, 93.75), new THREE.Vector3(0.8, 0.1, 0.6)), qM = orientToFace(latLonToVec3(40, -160), new THREE.Vector3(-0.9, 0.2, 0.4));
const A = worldPoint(LANDSCAPE, "mars", qM, 1.7, 40, -160), B = worldPoint(LANDSCAPE, "earth", qE, 1, 42.94, 93.75);
const spec = (id, dims, delay = 0, hiddenEnd = false) => ({ id, dims, a: A.p, na: A.n, b: B.p, nb: B.n, color0: 0xff8d5e, color1: 0x5db4ff, delay, hiddenEnd });
const counts = (set, i = 0) => set.items[i].lines.map((l) => (l.line.visible ? l.line.geometry.instanceCount : 0));

// 1) dibujo progresivo con tiempos calculados a mano: t=0,3 s (arco sin retardo) → p=0,3/0,7=0,4286; e=1-(1-p)^3=0,8135; e·4=3,254 → [16,16,16,4]
let set = new ArcSet(false, false); set.setArcs([spec("a", [0.96, 0.99, 1]), spec("b", [0.912, 0.84, 1], 0.3)], 100);
set.update(100); assert.deepEqual(counts(set), [0, 0, 0, 0]);
set.update(100.3); assert.deepEqual(counts(set), [16, 16, 16, 4]);
assert.deepEqual(counts(set, 1), [0, 0, 0, 0]); // el 2.º arco aún no empieza (retardo 0,3 s)
const busy = set.update(101.2); assert.deepEqual(counts(set), [16, 16, 16, 16]); assert.ok(busy, "con fotón debe seguir animando");
console.log("1 ok · dibujo progresivo: [16,16,16,4] a 0,3 s; segundo arco con retardo; completo a 1,2 s");

// 2) tipos de tramo, trazo punteado y datos reales (Alaska: Shape 84 % → ámbar punteado)
const kinds = set.items[1].lines.map((l) => l.kind); assert.deepEqual(kinds, ["un", "ok", "brk", "thin"]);
assert.deepEqual(set.items[1].lines.map((l) => l.line.material.dashed), [true, false, true, false]);
assert.ok(set.items[1].lines[2].line.geometry.attributes.instanceDistanceStart, "falta computeLineDistances en el tramo punteado");
assert.equal(set.items[1].lines[2].line.material.color.getHex(), 0xffb454);
console.log("2 ok · tramos [un, ok, brk, thin]; punteados con distancias; el roto es ámbar #ffb454");

// 3) pausa: sin fotón y sin «busy»; modo lite: sin fotón
assert.equal(set.update(105, true), false);
assert.equal(new ArcSet(true, false).update(0), false);
set.setArcs([spec("a", [0.96, 0.99, 1])], 200); const lite = new ArcSet(true, false); lite.setArcs([spec("a", [0.96, 0.99, 1])], 0); lite.update(5); assert.equal(lite.update(5), false); assert.equal(lite.items[0].photon, null);
console.log("3 ok · pausa y modo lite: sin animación continua ni fotón");

// 4) movimiento reducido: todo dibujado al instante
const red = new ArcSet(false, true); red.setArcs([spec("a", [0.96, 0.99, 1])], 0); red.update(0); assert.deepEqual(counts(red), [16, 16, 16, 16]); assert.equal(red.items[0].photon, null);
console.log("4 ok · movimiento reducido: arcos completos en el primer fotograma, sin fotón");

// 5) resalte: los demás arcos bajan al 35 %
set = new ArcSet(false, true); set.setArcs([spec("a", [0.96, 0.99, 1]), spec("b", [0.95, 0.95, 1])], 0); set.setHighlight("a"); set.update(1);
assert.equal(set.items[0].lines[3].line.material.opacity, 1); assert.ok(Math.abs(set.items[1].lines[3].line.material.opacity - 0.35) < 1e-9);
set.setHighlight(null); set.update(1); assert.equal(set.items[1].lines[3].line.material.opacity, 1);
console.log("5 ok · resalte: 100 % / 35 %, y se restablece");

// 6) reutilización al arrastrar: mismos objetos Line2 y material, posiciones nuevas, sin crecer la escena
const before = set.items[0].lines[0].line, mat = before.material, n = set.group.children.length;
const B2 = worldPoint(LANDSCAPE, "earth", orientToFace(latLonToVec3(42.94, 93.75), new THREE.Vector3(0.6, 0.3, 0.7)), 1, 42.94, 93.75);
const p0 = before.geometry.attributes.instanceEnd.getX(15);
set.setArcs([{ ...spec("a", [0.96, 0.99, 1]), b: B2.p, nb: B2.n }, spec("b", [0.95, 0.95, 1])], 5, true);
assert.equal(set.items[0].lines[0].line, before); assert.equal(before.material, mat); assert.equal(set.group.children.length, n);
assert.notEqual(before.geometry.attributes.instanceEnd.getX(15), p0, "las posiciones no se actualizaron");
set.setArcs([spec("a", [0.96, 0.99, 1])], 6, true); assert.equal(set.items[0].lines.length, 4); assert.equal(set.items.length, 1); // distinto número de arcos → reconstruye
console.log("6 ok · reutilización: mismos Line2/materiales con posiciones nuevas; reconstruye si cambian los arcos");

// 7) liberar
set.dispose(); assert.equal(set.group.children.length, 0);
console.log("7 ok · dispose deja la escena vacía");
