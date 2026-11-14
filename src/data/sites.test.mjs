// AI-assisted (Claude), reviewed by team Logos
// Integrity checks for the precomputed data: the published index must equal the documented formula,
// coordinates must be valid, and every value must carry a source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("./sites.json", import.meta.url)));
assert.equal(d.missions.length, 3);
let sites = 0, formula = 0;
for (const m of d.missions) {
  assert.ok(Math.abs(m.target.lat) <= 90 && m.target.coordSource, `${m.id}: target`);
  for (const c of m.campaigns) assert.match(c.url, /^https:\/\//, `${m.id}: campaign url ${c.name}`);
  for (const b of m.breaks) assert.ok(b.text && b.source, `${m.id}: break without source`);
  const known = m.sites.filter((s) => s.kind === "known"), fresh = m.sites.filter((s) => s.kind === "new");
  assert.ok(known.length >= 2 && fresh.length >= 3, `${m.id}: needs known and new sites`);
  for (const s of m.sites) {
    sites++;
    assert.ok(Math.abs(s.lat) <= 90 && Math.abs(s.lon) <= 360, `${s.id}: coordinates`);
    assert.ok(s.match === null || (s.match >= 0 && s.match <= 1), `${s.id}: index range`);
    for (const [k, v] of Object.entries(s.perVariable)) if (v) assert.ok(v.source, `${s.id}.${k}: no source`);
    if (typeof s.ruleFraction === "number" && typeof s.percentileDistance === "number") {
      const expected = 0.5 * s.ruleFraction + 0.5 * (1 - s.percentileDistance);
      assert.ok(Math.abs(expected - s.match) < 0.002, `${s.id}: index ${s.match} != 0.5F+0.5(1-D) = ${expected.toFixed(3)}`);
      formula++;
    }
    if (s.kind === "new") assert.equal(s.ruleFraction, 1, `${s.id}: new regions must meet every condition`);
    if (s.accessRisk?.score != null) assert.ok(s.accessRisk.sources?.length, `${s.id}: access score without sources`);
  }
}
assert.ok(formula >= 18, `formula checked on only ${formula} sites`);
console.log(`data ok · ${sites} sites · index formula verified on ${formula}`);
