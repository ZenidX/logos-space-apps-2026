# AI-assisted (Claude), reviewed by team Logos

# Logos data pipeline → `sites.json` (v4)

Regenerates `src/data/sites.json`: 3 missions, known analogs, 6 new candidate regions each, Analog index 0–1, accessRisk. Method: `docs/method.md` (section v3).
Checked 2026-11-14: a clean run of steps 1–5 reproduced the repo v3 `sites.json` (main 7523cd0) with 0 differences apart from `generatedAt`. v4 then removed WDPCA and fixed per-mission ranges in site breaks.

## Environment
Python 3.12 · numpy 2.5.4 · rasterio 1.5.2 (GDAL 3.12.2) · scipy 1.18.1 · shapely 2.2.0 · pyshp 3.1.8 · openpyxl 3.1.5
```bash
python -m venv .venv && .venv/bin/pip install numpy rasterio scipy shapely pyshp openpyxl
```

## Inputs (`$LOGOS_IN`, flat folder with these exact names)
| File | What | Source | Licence | sha256 (first 16) |
|---|---|---|---|---|
| `terra_features_01deg/` (lst_day, lst_night, ndvi, albedo, precip .tif) | 0.1° Earth grids, 2024 (MODIS MOD11A2, MOD13C1, MCD43C3; GPM IMERG V07) | Earth Engine asset `projects/terra-analog/assets/terra_features_01deg` (team export; copy in the old spaceapp repo `data/ee/`) | NASA public domain | — |
| `sand_0-5cm_mean_5000.tif` | SoilGrids 2.0 sand 0–5 cm, 5 km | https://files.isric.org/soilgrids/latest/data_aggregated/5000m/sand/ | CC BY 4.0 | af70445daad0ff93 |
| `glim_wgs84_0point5deg.txt.asc` | GLiM v1.0 lithology, 0.5° | https://doi.org/10.1594/PANGAEA.788537 (zip via https://hdl.handle.net/10013/epic.39939.d001) | CC BY 3.0 | 2323b29b970f032f |
| `ne_10m_admin_0_countries.zip` | Natural Earth admin-0 v5.1.1 | https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip | public domain | ce1ac7036499a0ed |
| `ne_10m_admin_0_disputed_areas.zip` | Natural Earth disputed areas | …/10m/cultural/ne_10m_admin_0_disputed_areas.zip | public domain | a250c1cf8ab68898 |
| `ne_10m_geography_regions_polys.zip` | Natural Earth geography regions (names) | …/10m/physical/ne_10m_geography_regions_polys.zip | public domain | cb7b9db200284ed1 |
| `ged261-csv.zip` | UCDP GED 26.1 | https://ucdp.uu.se/downloads/ged/ged261-csv.zip | CC BY 4.0 | 8c941d84954e555e |
| `GEDEvent_v26_0_9.csv` | UCDP Candidate Events v26.0.9 | https://ucdp.uu.se/downloads/candidateged/GEDEvent_v26_0_9.csv | CC BY 4.0 | 20256b0d674f4c58 |
| `us_travel_advisories.json` | US State Dept advisories (snapshot 2026-11-14) | https://cadataapi.state.gov/api/TravelAdvisories | US public domain | 8eda2365936bfd32 |
| `wgidataset_with_sourcedata-2026.xlsx` | World Bank WGI 2026 (sheet `pv`) | https://www.worldbank.org/content/dam/sites/govindicators/doc/wgidataset_with_sourcedata-2026.xlsx | CC BY 4.0 | 67c38d2e9253fb1a |
Live calls during step 3–4 (no key needed): OpenStreetMap Nominatim reverse geocode (1 req/s, ODbL) and GOV.UK Content API for FCDO advice (OGL v3). Results can change on a later date.
v4: WDPCA/Protected Planet is **not used** (licence is non-commercial); every site carries `accessRisk.note` "Check national park and research permits before fieldwork."

## Commands
```bash
export LOGOS_IN=/path/to/inputs LOGOS_WORK=work
python -I 01_regrid_sand.py                                   # -> work/sand_pct_01deg.tif
python -I 02_missions.py work/missions.json                   # index, validation, candidate regions (~10 s)
python -I 03_names.py                                         # -> work/names.json, work/sites_list.json (~25 s)
python -I 04_access.py work/sites_list.json "$LOGOS_IN" > work/access.json
python -I 05_build.py work/sites.json                         # final file
LOGOS_SITES=work/sites.json python -I test_index.py           # 5 checks (or: pytest test_index.py)
```
`npm run data` could wrap these lines. `-I` keeps Python from importing files from the data folder.

## Files
`01_regrid_sand.py` · `02_missions.py` (variables, ideal ranges, known analogs, exclusion list, region grouping) · `03_names.py` · `04_access.py` (access complexity, weights G 0.40 / C 0.35 / A 0.25) · `build_common.py` (sources, credits, mission texts, campaign URLs, target values) · `05_build.py` · `index.py` (scalar formula) · `test_index.py` (hand-computed cases + consistency check of every site in sites.json).

## Known limits
Moon/Mars target values are approximate literature values hard-coded in `build_common.py`; the exclusion list in `02_missions.py` uses approximate region centres; thresholds and weights are team choices (see method.md).
