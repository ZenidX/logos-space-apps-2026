// AI-assisted (Claude), reviewed by team Logos
import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { similarity, acceptance, parseIdeal, conditionStatus } from "./rules.ts";
const d = JSON.parse(readFileSync(new URL("../../data/sites.json", import.meta.url), "utf8"));
let n = 0, worst = 0, flips = 0;
for (const m of d.missions) { const vd = new Map(m.variables.filter((v) => v.inMatch && v.ideal && v.tolerance).map((v) => [v.id, v]));
  for (const s of m.sites) for (const [k, p] of Object.entries(s.perVariable)) { const v = vd.get(k); if (!v || !p || p.value == null || p.similarity == null) continue;
    const e = Math.abs(similarity(p.value, v.ideal, v.tolerance) - p.similarity); worst = Math.max(worst, e); n++;
    if (typeof p.meetsRule === "boolean") { const [lo, hi] = acceptance(v.ideal, v.tolerance); if ((p.value >= lo && p.value <= hi) !== p.meetsRule && Math.abs(p.similarity - 0.5) > 0.01) flips++; } } }
assert.ok(n >= 100 && worst < 0.01, `similarity: ${n} cases, max error ${worst}`); assert.equal(flips, 0, "the acceptance band does not match meetsRule");
assert.deepEqual(parseIdeal("<= 0.05"), [-Infinity, 0.05]); assert.deepEqual(parseIdeal("0.07-0.20"), [0.07, 0.2]); assert.deepEqual(parseIdeal("1"), [1, 1]); assert.deepEqual(parseIdeal("<= -5"), [-Infinity, -5]); assert.deepEqual(parseIdeal(">= 50"), [50, Infinity]); assert.throws(() => parseIdeal("abc"));
console.log(`ok · ${n} real similarities reproduced (max error ${worst.toFixed(4)}); acceptance band = meetsRule in all non-borderline cases`);

// The label shown next to each condition must match the threshold shown ("mission needs …"):
assert.equal(conditionStatus(0.04, "<= 0.05", 0.1), "in range");
assert.equal(conditionStatus(0.16, "<= 0.05", 0.1), "accepted (within tolerance)"); // NDVI 0.16 vs "0.05 or less": NOT "in range"
assert.equal(conditionStatus(384, "<= 250", 300), "accepted (within tolerance)");  // rain 384 mm vs "250 or less"
assert.equal(conditionStatus(700, "<= 250", 300), "out of range");
assert.equal(conditionStatus(0.15, "0.07-0.20", 0.06), "in range");
let labelled = 0;
for (const m of d.missions) { const vd = new Map(m.variables.filter((v) => v.inMatch && v.ideal && v.tolerance).map((v) => [v.id, v]));
  for (const s of m.sites) for (const [k, p] of Object.entries(s.perVariable)) { const v = vd.get(k); if (!v || !p || p.value == null || typeof p.meetsRule !== "boolean" || v.ideal === "1") continue;
    const st = conditionStatus(p.value, v.ideal, v.tolerance), [lo, hi] = parseIdeal(v.ideal); labelled++;
    assert.equal(st === "in range", p.value >= lo && p.value <= hi, `${s.id}.${k}: "in range" must mean inside the shown range`);
    if (Math.abs(p.similarity - 0.5) > 0.01) assert.equal(st !== "out of range", p.meetsRule, `${s.id}.${k}: label and meetsRule disagree`); } }
console.log(`ok · condition labels checked on ${labelled} site values: "in range" only inside the shown range; "accepted" = meetsRule`);
