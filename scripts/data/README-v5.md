# Site comparison data (v5) · AI-assisted (Claude), to be reviewed by team Logos

Generated 2026-11-14 by `scripts/data/06_terrain.py` and `scripts/data/07_details.py` from `src/data/sites.json` (data v4). Keys are the site ids in sites.json; targets are `target-<mission id>`.

## Files
| File | Content |
|---|---|
| `terrain/<id>.bin` | 96 × 96 Float32 little-endian heights in metres, row 0 = north, column 0 = west; 11 × 11 km square centred on the site; step 114.6 m (30 files, 1.1 MB) |
| `terrain-index.json` | per id: file, min/max (m), body, lat/lon, stats (mean and p90 slope in degrees, roughness = std of elevation after removing the best-fit plane, relief = max − min), source; grid and method description |
| `site-details.json` | per id: `terrain` (same as the index), `when` (noon Sun, daylight, monthly temperature), `how` (campaign sentence for known sites; nearest city ≥ 50,000, travel time, nearest large airport) |

## Method
- Same grid on all three bodies: 96 × 96 cells over 11 km (114.6 m). Slope by central differences on that grid; roughness after removing the best-fit plane. Mars comes from a 200 m DEM, so its relief is smoother than Earth and Moon at this step.
- Earth: Copernicus DEM tiles area-averaged to the grid (equal-angle box sized 11 km × 11 km in metres at the site latitude). Water cells read 0 m. Over ice sheets the DEM gives the ice surface.
- Moon: LOLA requested at ~29 m and averaged 4 × 4 (south polar stereographic, centre from lat/lon on a 1,737.4 km sphere).
- Mars: MOLA–HRSC blend requested with bilinear interpolation (lat/lon box on a 3,396.19 km sphere; longitudes −180…180).
- Sun (Earth): declination for the 15th of each month (Cooper 1969, 23.44°); noon elevation = 90° − |lat − declination| (≤ 0 = Sun below the horizon all day); daylight from the sunrise hour angle; no refraction, no terrain.
- Sun (Mars targets): declination = asin(sin 25.19° · sin Ls) for Ls 0–330° in 30° steps; daylight in Earth hours of a 24.66 h sol. Moon target: noon maximum 6.9° / minimum 3.9° from latitude and the 1.54° lunar equator tilt.
- Temperature (Earth sites): NASA POWER monthly climatology 2001–2025 (MERRA-2 reanalysis, ~0.5° × 0.625°): `surfaceTempC` = TS (skin temperature), `airTemp2mC` = T2M. A model grid cell, not a station. Moon and Mars monthly temperatures: null (not prepared).
- Distances are straight-line (great-circle) km, not road distance. Travel time to a city is the Oxford MAP 2015 estimate (team 0.1° cell mean); none south of 60° S.

## Sources and licences
| Data | Source | Licence / terms |
|---|---|---|
| Earth elevation | Copernicus DEM GLO-30, AWS Open Data `s3://copernicus-dem-30m` (https://registry.opendata.aws/copernicus-dem/). © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA | Copernicus DEM licence (free, worldwide, attribution); **to be verified by the team** |
| Moon elevation | NASA LRO LOLA south-pole DEM 30 m/px `LRO_LOLA_DEM_SPole75_30mp_v04`, NASA Moon Trek ImageServer | NASA data, public domain; cite NASA/GSFC LOLA |
| Mars elevation | MOLA–HRSC blended DEM 200 m/px `Mars_MOLA_blend200ppx_HRSC_DEM_clon0dd_200mpp_lzw`, NASA Mars Trek ImageServer (NASA MGS MOLA; ESA/DLR/FU Berlin HRSC) | NASA/ESA data; Trek terms **to be verified by the team** |
| Monthly temperature | NASA POWER Climatology API v2.10.1, retrieved 2026-11-14. "The data was obtained from the National Aeronautics and Space Administration (NASA) Langley Research Center (LaRC) Prediction of Worldwide Energy Resource (POWER) Project funded through the NASA Earth Science Division." https://power.larc.nasa.gov/docs/referencing/ | NASA; cite service, version and date; POWER asks (does not require) to be notified of publications and redistribution |
| Travel time to city | Weiss et al. 2018, *Nature* 553:333, doi:10.1038/nature25181 | CC BY 4.0 |
| Nearest city | Natural Earth 10m populated places v5.1.1 (POP_MAX ≥ 50,000) | public domain |
| Nearest airport | OurAirports `airports.csv` (https://ourairports.com/data/), type `large_airport` | public domain (per ourairports.com/data). "Large" is OurAirports' class, not official international status |
| Campaign sentences | the URLs in `how.campaign.urls`, all checked in `docs/sources.md` | — |

## Known limits
- 11 km windows at 114.6 m show landform scale, not boulder or footstep scale.
- Copernicus water cells (0 m) and polar ice surfaces are kept as is; the "nodata" field is 0 for all 30 files.
- POWER is a ~50 km reanalysis cell: small or high sites (Kīlauea Iki, Karakoram) can differ a lot from local reality.
- Nearest city/airport can be in another country (e.g. Chalbi → Arba Minch, Ethiopia); this is distance only, not access.
