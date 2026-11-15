// AI-assisted (Claude), reviewed by team Logos
// Integrity checks for the precomputed data: the published index must equal the documented formula,
// coordinates must be valid, and every value must carry a source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("./sites.json", import.meta.url)));
assert.equal(d.missions.length, 4);
assert.match(d.version, /^v[78]$/);
let sites = 0, formula = 0, plain = 0;
for (const m of d.missions) {
  assert.ok(Math.abs(m.target.lat) <= 90 && m.target.coordSource, `${m.id}: target`);
  for (const c of m.campaigns) assert.match(c.url, /^https:\/\//, `${m.id}: campaign url ${c.name}`);
  for (const b of m.breaks) assert.ok(b.text && b.source, `${m.id}: break without source`);
  const known = m.sites.filter((s) => s.kind === "known"), fresh = m.sites.filter((s) => s.kind === "new");
  const validated = m.validation.validated !== false;
  assert.ok(known.length >= (validated ? 2 : 1) && fresh.length >= 3, `${m.id}: needs known and new sites`);
  for (const v of m.variables) assert.ok(!("weight" in v) && (!v.inMatch || typeof v.coverageWeight === "number"), `${m.id}.${v.id}: coverage weight`);
  for (const s of m.sites) {
    sites++;
    assert.ok(Math.abs(s.lat) <= 90 && Math.abs(s.lon) <= 360, `${s.id}: coordinates`);
    assert.ok(s.match === null || (s.match >= 0 && s.match <= 1), `${s.id}: index range`);
    for (const [k, v] of Object.entries(s.perVariable)) if (v) assert.ok(v.source, `${s.id}.${k}: no source`);
    if (!validated) { // computed, not validated: the index is the plain mean of the condition similarities (no known-analog term)
      const sims = Object.values(s.perVariable).filter((v) => v && typeof v.similarity === "number").map((v) => v.similarity);
      assert.ok(s.percentileDistance === null && Math.abs(sims.reduce((a, b) => a + b, 0) / sims.length - s.match) < 0.002, `${s.id}: index ${s.match} != mean of similarities`);
      plain++;
    } else if (typeof s.ruleFraction === "number" && typeof s.percentileDistance === "number") {
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
// Declared floor (applied in the data pipeline): a site whose basis shows a top-level advisory is never below "high", and says why.
const atMax = (b) => /US level 4 of 4/.test(b) || /UK advice covers whole country/.test(b);
let floored = 0, permits = 0;
for (const m of d.missions) for (const s of m.sites) {
  const a = s.accessRisk; if (!a) continue;
  if (a.basis && atMax(a.basis)) { assert.equal(a.level, "high", `${s.id}: top-level advisory but level ${a.level}`); if (a.floor) floored++; }
  if (a.floor) assert.ok(a.score < 0.5 && a.level === "high", `${s.id}: floor text without a raised level`);
  if (a.permitNote) { assert.match(a.permitUrl ?? "", /^https:\/\//, `${s.id}: permit note without a source`); permits++; }
}
assert.ok(floored >= 1 && permits >= 3, `advisory floor (${floored}) or permit notes (${permits}) missing`);
// Every new region shown has an entry in the independent check (src/lib/missions.ts), so its evidence badge is never a guess.
const lib = readFileSync(new URL("../lib/missions.ts", import.meta.url), "utf8"), removed = [...lib.matchAll(/^  "(m\d-[a-z-]+-new\d+)": \{ name:/gm)].map((x) => x[1]);
for (const m of d.missions) for (const s of m.sites) if (s.kind === "new" && !removed.includes(s.id)) assert.ok(new RegExp(`"${s.id}": \\{ verdict: "(Supported nearby|Partly|None found|Not checked)"`).test(lib), `${s.id}: no independent-check entry`);
// No text in another script reaches the screen through the place names (everything delivered is in English).
for (const m of d.missions) for (const s of m.sites) { const p = s.name.split(" · "), shown = s.kind === "new" && p.length > 2 ? [p[0], p[p.length - 1]] : p; assert.ok(!/[\u0400-\u04FF\u4E00-\u9FFF\u0600-\u06FF]/.test(shown.join(" ")), `${s.id}: name not in Latin script: ${shown.join(" · ")}`); }
assert.ok(formula >= 18 && plain >= 5, `formula checked on only ${formula} + ${plain} sites`);
console.log(`data ok · ${sites} sites · index formula verified on ${formula} (validated missions) and ${plain} (mean of similarities, mission 4) · ${floored} advisory floors · ${permits} sourced permit notes`);
