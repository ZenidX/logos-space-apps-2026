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
// Every site and target shown in the comparison view has terrain and detail data, with finite numbers.
const terrain = JSON.parse(readFileSync(new URL("./terrain-index.json", import.meta.url))).items;
const details = JSON.parse(readFileSync(new URL("./site-details.json", import.meta.url))).items;
for (const m of d.missions) {
  const ids = [`target-${m.id}`, ...m.sites.map((s) => s.id)];
  for (const id of ids) {
    const t = terrain[id];
    assert.ok(t, `${id}: no terrain`);
    for (const k of ["reliefM", "slopeMeanDeg", "slopeP90Deg", "roughnessStdM"]) assert.ok(Number.isFinite(t.stats[k]) && t.stats[k] >= 0, `${id}: terrain ${k}`);
    assert.ok(readFileSync(new URL(`../../public${t.file}`, import.meta.url)).length === 96 * 96 * 4, `${id}: heightmap size`);
    assert.ok(details[id], `${id}: no details`);
  }
  for (const s of m.sites) {
    const w = details[s.id].when;
    assert.equal(w.sunNoonDeg.length, 12, `${s.id}: 12 monthly Sun values`);
    // the app recomputes the noon Sun from latitude: it must agree with the data file
    w.sunNoonDeg.forEach((v, i) => { const day = 15 + Math.round(i * 30.44), decl = 23.44 * Math.sin((2 * Math.PI * (284 + day)) / 365); assert.ok(Math.abs(v - (90 - Math.abs(s.lat - decl))) < 1.2, `${s.id}: Sun month ${i + 1}`); });
  }
}
// Declared floor: a site whose basis shows a top-level advisory must be shown as High by the app rule (src/lib/missions.ts, advisoryAtMax).
const atMax = (b) => /US level 4 of 4/.test(b) || /UK advice covers whole country/.test(b);
let floored = 0;
for (const m of d.missions) for (const s of m.sites) if (s.accessRisk?.basis && atMax(s.accessRisk.basis)) floored++;
assert.ok(floored >= 1 && readFileSync(new URL("../lib/missions.ts", import.meta.url), "utf8").includes('floor ? "High"'), "advisory floor rule missing");
assert.ok(formula >= 18, `formula checked on only ${formula} sites`);
console.log(`data ok · ${sites} sites · index formula verified on ${formula}`);
