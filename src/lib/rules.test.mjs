// AI-assisted (Claude), reviewed by team Logos
import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { similarity, acceptance, parseIdeal } from "./rules.ts";
const d = JSON.parse(readFileSync(new URL("../data/sites.json", import.meta.url), "utf8"));
let n = 0, worst = 0, flips = 0;
for (const m of d.missions) { const vd = new Map(m.variables.filter((v) => v.inMatch && v.ideal && v.tolerance).map((v) => [v.id, v]));
  for (const s of m.sites) for (const [k, p] of Object.entries(s.perVariable)) { const v = vd.get(k); if (!v || !p || p.value == null || p.similarity == null) continue;
    const e = Math.abs(similarity(p.value, v.ideal, v.tolerance) - p.similarity); worst = Math.max(worst, e); n++;
    if (typeof p.meetsRule === "boolean") { const [lo, hi] = acceptance(v.ideal, v.tolerance); if ((p.value >= lo && p.value <= hi) !== p.meetsRule && Math.abs(p.similarity - 0.5) > 0.01) flips++; } } }
assert.ok(n >= 100 && worst < 0.01, `similitud: ${n} casos, error máx ${worst}`); assert.equal(flips, 0, "la banda de aceptación no coincide con meetsRule");
assert.deepEqual(parseIdeal("<= 0.05"), [-Infinity, 0.05]); assert.deepEqual(parseIdeal("0.07-0.20"), [0.07, 0.2]); assert.deepEqual(parseIdeal("1"), [1, 1]); assert.deepEqual(parseIdeal("<= -5"), [-Infinity, -5]); assert.deepEqual(parseIdeal(">= 50"), [50, Infinity]); assert.throws(() => parseIdeal("abc"));
console.log(`ok · ${n} similitudes reales reproducidas (error máx ${worst.toFixed(4)}); banda de aceptación = meetsRule en todos los casos no fronterizos`);
