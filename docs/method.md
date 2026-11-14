# Method · mission-based analog index (method v3, data v4; 2026-11-14)

AI-assisted (Claude), to be reviewed by team Logos.
Scripts: scripts/data/02_missions.py (scoring), scripts/data/index.py (index), scripts/data/05_build.py (JSON build); inputs and commands: scripts/data/README.md.
Data: `src/data/sites.json` (v4). Rebuild with `LOGOS_IN=/path/to/inputs npm run data`; test with `npm run test:data`. Sources and checks: `docs/sources.md`.

## 1. Idea
An Earth site is an analog **for a mission**, not in general. We took three tasks that agencies have rehearsed in real field campaigns (`docs/missions.md`), wrote down the surface conditions each task needs, scored every 0.1° land cell (~11 km) on Earth against those conditions, and checked that the score finds the places where the campaigns actually ran. The top-scoring places outside those known sites are the **new candidate regions**.

| Mission | Target | Campaigns it is based on |
|---|---|---|
| M1 Suited EVA on volcanic terrain | Mons Mouton, a lunar south-pole region NASA listed among its Artemis III landing candidates in 2024 (NASA now describes Artemis III as a crewed low-Earth-orbit demonstration, with landings from Artemis IV) | NASA JETT3/JETT5, Desert RATS, BASALT; ESA PANGAEA |
| M2 Rover mobility on loose sand and slopes | Jezero crater, Mars | JPL Scarecrow tests, ESA SAFER, NASA ARADS, Mars Society MDRS |
| M3 Shallow ground ice for ISRU and drilling | Arcadia Planitia, Mars | NASA TRIDENT at Haughton, IceBite (ASTEP), RESOLVE |

## 2. Variables and rules
Each variable *k* has an **ideal range** [lo, hi] and a **tolerance** τ in its own unit. The range comes from the target where the quantity is physically comparable (e.g. no vegetation), otherwise from what the task needs (e.g. loose sand). All Earth layers are 2024 values on a 0.1° grid.

| Mission | Variable (Earth source) | Ideal range | τ | Weight | Why |
|---|---|---|---|---|---|
| M1 | NDVI (MODIS MOD13C1) | ≤ 0.05 | 0.10 | 1 | bare rock; the target has no vegetation |
| M1 | Albedo, white-sky shortwave (MODIS MCD43C3) | 0.07–0.20 | 0.06 | 1 | dark basaltic ground |
| M1 | Precipitation (GPM IMERG V07) | ≤ 250 mm/yr | 300 | 0.5 | arid ground stays bare |
| M1 | Basic volcanic rock nearby (GLiM 0.5°, class `vb` in the 3×3 window) | = 1 | — | 1 | the campaigns ran on basalt lava fields |
| M2 | Sand fraction 0–5 cm (SoilGrids 2.0, 5 km → 0.1°) | ≥ 50 % | 12 | 1 | loose sand is where rovers sink and slip |
| M2 | NDVI | ≤ 0.05 | 0.10 | 1 | no plants binding the sand |
| M2 | Precipitation | ≤ 150 mm/yr | 250 | 0.5 | dry, uncemented sand |
| M2 | Albedo | 0.12–0.28 | 0.08 | 0.5 | Mars-like brightness (approximate) |
| M3 | Mean surface temperature, (day + night)/2 (MODIS MOD11A2) | ≤ −5 °C | 6 | 1 | ground ice persists below freezing (permafrost proxy) |
| M3 | Precipitation | ≤ 250 mm/yr | 250 | 1 | polar desert |
| M3 | Albedo | ≤ 0.5 | 0.12 | 1 | excludes ice sheets and glaciers |
| M3 | NDVI | ≤ 0.10 | 0.10 | 0.5 | bare ground |

Per-variable similarity:

    d_k = 0 inside [lo, hi];  otherwise the distance to the nearest bound
    s_k = exp(−½ · (d_k / τ_k)²)          1 inside the range · 0.61 at one τ outside · 0.14 at two τ

A rule is **met** when s_k ≥ 0.5, i.e. within about 1.18 τ of the range. Ranges are tolerance bands, not hard cut-offs.
Sun elevation is shown for M1 as an attribute and does **not** enter the index. It is computed from latitude: highest noon Sun = 90° − max(|φ| − ε, 0); noon Sun at winter solstice = 90° − |φ| − ε, with ε = 23.44° for Earth and 1.54° for the Moon (lunar equator tilt to the ecliptic). For Mons Mouton (84.6° S) this gives about 7°, ignoring terrain.

## 3. Analog index (0–1)
    F = rules met / rules with data
    D = mean over variables of |P_k(site) − median of P_k over the mission's known analogs| / 100
        (P_k = percentile of the value among all Earth land cells; the volcanic layer uses its 0/1 value)
    Analog index = 0.5 · F + 0.5 · (1 − D)

F says **whether** a place meets the task's conditions. D says **how close** it sits, within Earth's own range of values, to where the task was actually rehearsed. A cell needs data for ≥ 66 % of the variable weight. Reference implementation: `scripts/data/index.py`; hand-computed cases: `scripts/data/test_index.py`.

## 4. New candidate regions
1. Candidate cells have all available rules met (minimum 66% of weight coverage), i.e. F = 1 over the variables with data. Example: one Antarctic candidate has no NDVI value and is scored on the other three variables.
2. Excluded: cells within 300 km of any known analog site (the 9 sites in `sites.json`, plus Death Valley, Mauna Kea, Etna, Dhofar, the Negev, Ararat province, Lanzarote, Axel Heiberg Island and Svalbard, using approximate centres).
3. Neighbouring candidate cells (8-connected) form a region; regions with fewer than 4 cells are dropped.
4. Each region is represented by its best cell. Regions are ranked by that cell's index and picked with at least 800 km between them, 6 per mission.
5. Names come from Natural Earth geography regions and an OpenStreetMap reverse geocode. In disputed areas only the Natural Earth region name is used.

## 5. Validation
We compare each known analog's index with all land cells, and use central Amazonia (−3.4°, −60.0°) as a negative control.

| Mission | Known analogs (percentile among land cells) | Control |
|---|---|---|
| M1 | SP Crater 99.9 · Craters of the Moon 98.6 · Timanfaya 99.6 · Kīlauea Iki 86.4 → 3 of 4 in the top 2 % | 31.2 |
| M2 | Dumont Dunes 100.0 · Yungay 97.9 · MDRS 100.0 → 3 of 3 in the top 2.1 % | 1.5 |
| M3 | Haughton 99.6 · McMurdo Dry Valleys 99.2 → 2 of 2 in the top 1 % | 2.8 |

How to read this: the known analogs also set the median used in D, so their high rank is partly built in. The more independent checks are the rule fraction F and the control. F is only partly independent: the ranges come from the task and the target, but they were set with the known sites in mind. Kīlauea Iki ranks lower because its 11 km cell is mostly rainforest.

## 6. Access complexity (shown next to each site)
A relative, neutral estimate of how much administrative and security coordination fieldwork would need. It is not a rating of any country or travel advice.

    access_complexity = (0.40·G + 0.35·C + 0.25·A) / (sum of weights of available parts)
    G = 1 − WGI Political Stability score/100 (World Bank WGI 2026, 2025 data; perceptions-based)
    C = 1 − exp(−Σ exp(−d_i / 50 km)) over UCDP organised-violence events within 200 km, 2021–2025 (GED 26.1, weight 1) and 2026 (Candidate v26.0.9, weight 0.5)
    A = mean of US advisory (level − 1)/3 and UK FCDO alert (none 0 · parts 0.33–0.5 · whole country 0.67–1)

Levels: low < 0.25 ≤ medium < 0.5 ≤ high. Weights, radii and levels are team design choices. Countries are de facto (Natural Earth) with no position on sovereignty. Not computed in Antarctica (Antarctic Treaty area, permits only) or in disputed areas. Every site carries the note "Check national park and research permits before fieldwork."

## 7. Limits
- Moon and Mars comparison values: Jezero and Arcadia albedo from the MGS TES albedo map (Lambert albedo, not white-sky); Arcadia mean temperature from the Mars Climate Database (a model); Mons Mouton albedo 0.15 is an estimate converted from LOLA 1064 nm normal albedo. See `docs/sources.md`.
- M1 rock type comes from a 0.5° geological map: "basalt within about 80 km", not "on basalt". There is no data for small islands such as Lanzarote.
- Slope is not used in the index. The site view shows 11 × 11 km terrain (Copernicus DEM GLO-30, LOLA 30 m, MOLA–HRSC 200 m, resampled to 114.6 m) for comparison only; see `scripts/data/README-v5.md`. Mars terrain comes from a 200 m model, so it looks smoother; sea and lake cells read 0 m.
- M3 infers ground ice from temperature only; no permafrost or ice map is used.
- One year (2024) of MODIS and GPM data; 0.1° cells (~11 km) describe the cell, not a specific outcrop.
- The index favours places that resemble the known analogs; it cannot measure absolute closeness to the Moon or Mars.
- Ranges, tolerances, weights and the 50/50 mix are team choices.
