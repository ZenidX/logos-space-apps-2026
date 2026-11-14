# Method · mission-based analog similarity (Logos, v2, 2026-11-14)

AI-assisted (Claude), to be reviewed by team Logos. Data: `sites.json`. Scripts (Logos Datos folder): `scripts/missions.py`, `scripts/access_risk.py`, `scripts/build_v2.py`.
This replaces the old ~/spaceapp p1–p99 relative-position score: nothing from it is reused except the raw 0.1° Earth grids.

## 1. Idea
An Earth site is a good analog **for a mission**, not in general. Each mission (from real field campaigns, see `misiones.md`) needs a few surface conditions. We score each Earth cell on those conditions only, in physical units, and check that the score rediscovers the places where agencies actually ran that mission.

## 2. Per-variable similarity
For each variable *k* the mission has an **ideal range** [lo, hi] (from the target value where it is physically comparable, otherwise from the mission's need) and a **tolerance** τ in the same unit:

    d_k = 0 if lo ≤ x ≤ hi;  lo − x if x < lo;  x − hi if x > hi
    s_k = exp(−½ (d_k / τ_k)²)            (1 = inside the range; 0.61 at one τ outside; 0.14 at two τ)

Missing value → variable skipped (cell needs ≥ 75 % of the weight available, else no score).

## 3. Match (0–1)
Weighted **geometric** mean, so one failed condition cannot be hidden by the others:

    match = exp( Σ w_k ln s_k / Σ w_k )

Ties at match = 1 are ordered by closeness to the target-side values (tie-break only).

## 4. Variables, ranges and why
| Mission → target | Variable | Ideal | τ | w | Basis |
|---|---|---|---|---|---|
| M1 EVA on basalt → Mons Mouton | NDVI | ≤ 0.05 | 0.10 | 1 | target has no vegetation |
| | albedo | 0.07–0.20 | 0.06 | 1 | Mons Mouton ≈ 0.15 (approx.); dark basalt |
| | precipitation | ≤ 250 mm/yr | 300 | 0.5 | target 0; bare, unweathered ground |
| | Sun elevation (attribute, not in match) | ≈ 6.9° max | 15 | 0 | computed from latitude: Earth `90 − max(|φ| − 23.44, 0)`; winter solstice `90 − |φ| − 23.44`. Mons Mouton: `90 − (84.6 − 1.54)` = 6.9° max, 3.9° min |
| M2 rover on sand → Jezero | sand fraction | ≥ 50 % | 12 | 1 | mission need (loose sand); Jezero % not available |
| | NDVI | ≤ 0.05 | 0.10 | 1 | no plants binding sand |
| | precipitation | ≤ 150 mm/yr | 250 | 0.5 | dry, uncemented |
| | albedo | 0.12–0.28 | 0.08 | 0.5 | Jezero ≈ 0.2 (approx.) |
| M3 ground ice → Arcadia Planitia | mean LST (day+night)/2 | ≤ −5 °C | 6 | 1 | permafrost proxy; Arcadia ≈ −80 °C (approx.) cannot be reached on Earth, so "below freezing" is the need |
| | precipitation | ≤ 250 mm/yr | 250 | 1 | polar desert |
| | albedo | ≤ 0.5 | 0.12 | 1 | excludes ice sheets/glaciers (~0.8); Arcadia is dark ground over ice |
| | NDVI | ≤ 0.10 | 0.10 | 0.5 | bare ground |
Ranges, tolerances and weights are **team design choices**, written down here. They were set knowing where the known analogs are, so the validation is not fully independent.

## 5. Validation
1. Score every 0.1° land cell (land = Natural Earth polygons; ocean is stored as 0 in the source grids and was masked).
2. Report the percentile of each **known analog** (where the campaign actually ran) among all land cells.
3. Negative control: central Amazonia (−3.4, −60.0) must score low.

| Mission | Known analogs (percentile) | Result | Control (Amazonia) |
|---|---|---|---|
| M1 | SP Crater 94.8 · Craters of the Moon 88.7 · Timanfaya 98.1 · Kīlauea Iki 14.0 | 2 of 4 in top 10 %, 3 of 4 in top 12 % | 8.9th pct |
| M2 | Dumont Dunes 99.1 · Yungay 97.9 · MDRS 98.2 | 3 of 3 in top 3 % | 0.2th pct |
| M3 | Haughton 98.9 · McMurdo Dry Valleys 98.9 | 2 of 2 in top 2 % | 0.0th pct |
Honest reading: M2 and M3 rediscover their analogs well. M1 is **not specific**: without a rock-type layer, any bare, dark desert scores 1. Kīlauea Iki fails because its 11 km cell is mostly rainforest (a resolution limit). M3 has only 2 verified known sites. Ties: 0.2 % (M1), 0.2 % (M2), 1.5 % (M3) of land cells score ≥ 0.999.

## 6. New candidates
Greedy pick of the highest-scoring cells, ≥ 300 km from any known/classic analog and ≥ 800 km from each other, 5 per mission. They are **cells to investigate**, not surveyed sites. Names: OpenStreetMap reverse geocode (region, country).

## 7. accessRisk
`access_complexity` from `geopolitica.md` (G governance perception, WGI · C nearby organised-violence events, UCDP · A travel advice from two governments, US and UK; weights 0.40/0.35/0.25) plus a separate permit flag (protected area from WDPCA as yes/no only; Antarctic Treaty area). Level: **low < 0.25 ≤ medium < 0.5 ≤ high** (team choice). Antarctica: not computed, permit text only. For US sites the US advisory does not apply, so A = UK only. Not travel advice.

## 8. Known gaps
- Rock type (basalt) not used: ASTER GED emissivity needs Earthdata/Earth Engine login (see `suelo-espectral.md`).
- Slope not used: the 5 km GMTED slope is too coarse for EVA/rover slopes; Copernicus DEM 30 m needs Earth Engine.
- Moon/Mars target values are approximate literature values (team `targets.ts`), not extracted from PDS. Jezero sand %, Arcadia ice map (SWIM server down 2026-11-14): null.
- Single year (2024) of MODIS/GPM; 0.1° cells (~11 km).

---
# v3 (23:10) · new-analog search and ranking score — supersedes sections 3, 5 and 6 above

## v3.1 Similarity score (0–1), used to rank sites (`match` in sites.json)
    rule met for variable k  :=  s_k ≥ 0.5     (s_k from section 2, i.e. within ~1.18 τ of the ideal range)
    F = rules met / rules available
    D = mean over variables of |P_k(x) − median_known P_k| / 100      (P_k = percentile of x among all land cells; binary layers use the raw 0/1 difference)
    similarity = 0.5·F + 0.5·(1 − D)
F says **whether** a place meets the mission's conditions; D says **how close** it sits, in Earth's own distribution, to the places where agencies actually ran the mission. Cells need ≥ 66 % of the variable weight available.
Limits: (a) the 50/50 mix and the ≥ 0.5 rule threshold are team choices; (b) D pulls candidates toward the known analogs, so the score favours "more of the same" rather than novel terrain; (c) with 2–4 known sites the median is fragile (M3 uses 2); (d) percentiles are Earth-relative, so D cannot say how close a site is to the Moon or Mars in absolute terms; that is what F and the target-based ranges in section 4 do.

## v3.2 Extra layer for M1: volcanic lithology
GLiM, Global Lithological Map v1.0, gridded to 0.5° (Hartmann & Moosdorf 2012, doi:10.1594/PANGAEA.788537, **CC BY 3.0**, licence read on PANGAEA 2026-11-14). Variable = 1 if class `vb` (basic volcanic) appears in the 3×3 window of 0.5° cells around the point (~±0.75°), else 0; NaN where GLiM has no data (small islands, e.g. Lanzarote). The window is needed because the 0.5° majority class misses small lava fields (SP Crater's own cell is `sc`). Rule: = 1. Limit: ~80 km neighbourhood, so "basalt nearby", not "on basalt".

## v3.3 New candidate regions
1. Candidate cells: all rules met (F = 1), score available.
2. Exclusion: ≥ 300 km from every known analog in misiones.md plus Death Valley, Mauna Kea, Etna, Dhofar, Negev, Ararat, Lanzarote, Axel Heiberg Island and Svalbard Bockfjorden (approximate centres, used only for exclusion). Antarctica allowed for M3 outside the Dry Valleys radius.
3. Contiguous candidate cells (8-connectivity) form a region; regions < 4 cells are dropped.
4. Each region is represented by its best cell; regions ranked by that score; picked greedily with ≥ 800 km between representatives (spread across the globe); 6 per mission.
5. Names: Natural Earth geography regions (public domain) + OpenStreetMap reverse geocode (ODbL). In disputed areas only the Natural Earth region name is used.

## v3.4 Validation (same procedure as section 5, new score)
| Mission | Known analogs (percentile of land cells) | Control (Amazonia) |
|---|---|---|
| M1 | SP Crater 99.9 · Craters of the Moon 98.6 · Timanfaya 99.6 · Kīlauea Iki 86.4 → 3 of 4 in top 2 % | 31.2th |
| M2 | Dumont Dunes 100.0 · Yungay 97.9 · MDRS 100.0 → 3 of 3 in top 2.1 % | 1.5th |
| M3 | Haughton 99.6 · McMurdo Dry Valleys 99.2 → 2 of 2 in top 1 % | 2.8th |
Not independent: the known analogs define the median used in D, so their high rank is partly by construction. The control and the rule fraction F are the independent checks. M1's control sits higher (31st) because NDVI/precip percentiles are close to some arid analogs; it still fails 3 of 4 rules.

## v3.5 Mission-level breaks
Each mission in sites.json has `breaks` (gravity, pressure, temperature, lighting, ice behaviour) with sources (NASA NSSDC fact sheets; JPL; Honeybee drilling tests). One statement (lunar south-pole crust is feldspathic, not basaltic) is marked "not sourced tonight".
