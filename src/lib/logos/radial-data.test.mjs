// AI-assisted (Claude), reviewed by team Logos
import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { buildRings, dialGeometry, dialLabel, shapeRatio, DIAL } from "./radial-data.ts";
const H = new URL("../../data/", import.meta.url), d = JSON.parse(readFileSync(new URL("sites.json", H), "utf8")), T = JSON.parse(readFileSync(new URL("terrain-index.json", H), "utf8")).items;
let n = 0, counts = { "in range": 0, accepted: 0, "out of range": 0, none: 0 }, minInner = 999;
for (const m of d.missions) { const vs = m.variables.filter((v) => v.inMatch);
  for (const s of m.sites) {
    const conds = vs.map((v) => ({ id: v.id, label: v.label, unit: v.unit, ideal: v.ideal ?? null, tolerance: v.tolerance ?? null, value: s.perVariable[v.id]?.value ?? null, similarity: s.perVariable[v.id]?.similarity ?? null }));
    const rings = buildRings(conds, T[s.id]?.stats ?? null, T["target-" + m.id]?.stats ?? null, { score: s.accessRisk?.score ?? null, level: s.accessRisk?.level ?? "Not assessed" });
    assert.equal(rings.length, vs.length + 3); n++;
    for (const r of rings) { assert.ok(r.value === null || (r.value >= 0 && r.value <= 1), `${s.id} ${r.id} ${r.value}`); assert.ok(r.text.length > 0); counts[r.status]++; }
    // the ring status matches meetsRule in the JSON (in range/accepted = met; out of range = not met), except in borderline cases
    for (const v of vs) { const p = s.perVariable[v.id], r = rings.find((x) => x.id === v.id); if (p && typeof p.meetsRule === "boolean" && p.similarity !== null && Math.abs(p.similarity - 0.5) > 0.01) assert.equal(r.status !== "out of range", p.meetsRule, `${s.id} ${v.id}`); }
    const g = dialGeometry(rings); minInner = Math.min(minInner, g.at(-1).r - DIAL.stroke / 2);
    for (const x of g) assert.ok(Math.abs(Math.hypot(x.x - 130, x.y - 130) - x.r) < 1e-6);
    assert.ok(dialLabel("0.969", rings).includes("Access complexity"));
  } }
assert.equal(shapeRatio(541, 735.5).toFixed(3), "0.736"); assert.equal(shapeRatio(735.5, 541).toFixed(3), "0.736"); assert.equal(shapeRatio(0, 0), 1);
console.log(`ok · ${n} real sites · statuses`, counts, `· minimum free inner radius ${minInner} px (viewBox 260)`);
const m = d.missions[0], s = m.sites.find((x) => x.id === "sp_crater_az"), vs = m.variables.filter((v) => v.inMatch);
console.log(JSON.stringify(buildRings(vs.map((v) => ({ id: v.id, label: v.label, unit: v.unit, ideal: v.ideal ?? null, tolerance: v.tolerance ?? null, value: s.perVariable[v.id]?.value ?? null, similarity: s.perVariable[v.id]?.similarity ?? null })), T[s.id].stats, T["target-" + m.id].stats, { score: s.accessRisk.score, level: s.accessRisk.level }), null, 0));

// ring = data: every ring shows exactly a value that exists in the data files
let checked = 0;
for (const m of d.missions) { const vs = m.variables.filter((v) => v.inMatch);
  for (const s of m.sites) {
    const conds = vs.map((v) => ({ id: v.id, label: v.label, unit: v.unit, ideal: v.ideal ?? null, tolerance: v.tolerance ?? null, value: s.perVariable[v.id]?.value ?? null, similarity: s.perVariable[v.id]?.similarity ?? null }));
    const st = T[s.id]?.stats, tt = T["target-" + m.id]?.stats, rings = buildRings(conds, st ?? null, tt ?? null, { score: s.accessRisk?.score ?? null, level: s.accessRisk?.level ?? "Not assessed" });
    for (const c of conds) { const r = rings.find((x) => x.id === c.id); assert.equal(r.value, c.value === null || c.similarity === null ? null : Math.min(1, Math.max(0, c.similarity)), `${s.id} ${c.id}: ring != similarity`); checked++; }
    if (st && tt) { assert.equal(rings.find((x) => x.id === "relief").value, shapeRatio(st.reliefM, tt.reliefM)); assert.equal(rings.find((x) => x.id === "slope").value, shapeRatio(st.slopeMeanDeg, tt.slopeMeanDeg)); checked += 2; }
    assert.equal(rings.find((x) => x.id === "access").value, s.accessRisk?.score ?? null, `${s.id}: access ring != access complexity`); checked++;
  } }
assert.ok(Math.abs(shapeRatio(541, 736) - 0.7351) < 1e-3 && shapeRatio(736, 541) === shapeRatio(541, 736) && shapeRatio(0, 0) === 1);
console.log(`ok · ring = data on ${checked} rings (condition = similarity, shape = smaller/larger of site and target, access = access complexity)`);
