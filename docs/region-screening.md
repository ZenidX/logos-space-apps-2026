# Verification of the new regions (data v6) · AI-assisted (Claude), to be reviewed by team Logos

Checked 2026-11-15. Each region is judged on the 11 × 11 km window around its cell. Criteria (now in `scripts/data/02b_screen.py`, described in method.md §4): mean slope ≤ 10° (Copernicus DEM GLO-30, 114.6 m grid); snow/ice ≤ 10 % and water ≤ 20 % (ESA WorldCover 2021 v200, 10 m, CC BY 4.0, © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium; south of 60° S: Natural Earth glaciated areas and Antarctic ice shelves, public domain); ≥ 800 km spacing. Names and countries: Natural Earth + OpenStreetMap reverse geocode, re-run for v6. Full log of every candidate tried: `screening.json`.

## A. Verdict for the 18 regions of data v4
| id | Name (v4) | lat, lon | Mean slope | Snow/ice | Water | Verdict | Reason |
|---|---|---|---|---|---|---|---|
| m1-eva-basalt-new1 | Tihāmah · Abha · 'Asir Province | 18.265, 41.75 | 5.72° | 0 % | 0 % | **keep** | passes all checks |
| m1-eva-basalt-new2 | Patagonia · Deseado · Santa Cruz | -48.335, -69.15 | 2.15° | 0 % | 1 % | **keep** | passes all checks |
| m1-eva-basalt-new3 | Chalbi Desert · North Horr · Marsabit County | 3.441, 36.75 | 1.73° | 0 % | 0 % | **keep** | passes all checks |
| m1-eva-basalt-new4 | Western Plateau · Western Australia | -23.029, 117.35 | 5.7° | 0 % | 0 % | **keep** | passes all checks |
| m1-eva-basalt-new5 | Patagonia · Departamento Valcheta · Río Negro | -41.453, -65.75 | 1.16° | 0 % | 0 % | **keep** | passes all checks |
| m1-eva-basalt-new6 | Patagonia · Departamento San Carlos · Mendoza | -34.359, -69.45 | 15.34° | 0 % | 0 % | **remove** | mean slope 15.34 deg > 10.0 |
| m2-rover-sand-new1 | Asia · Torbat-e-jam County · Razavi Khorasan | 35.1, 60.55 | 2.29° | 0 % | 0 % | **keep** | passes all checks |
| m2-rover-sand-new2 | Arabian Peninsula · Al Jawf Governorate | 16.465, 44.95 | 1.98° | 0 % | 0 % | **keep** | passes all checks |
| m2-rover-sand-new3 | Arabian Peninsula · Ad Dhahirah Governorate | 22.606, 56.75 | 0.92° | 0 % | 0 % | **keep** | passes all checks |
| m2-rover-sand-new4 | Sahel · Bourem Cercle · Gao | 17.841, 0.05 | 0.64° | 0 % | 0 % | **keep** | passes all checks |
| m2-rover-sand-new5 | Tibetan Plateau · Ngari Prefecture · Xizang | 30.653, 82.95 | 16.39° | 5 % | 0 % | **remove** | mean slope 16.39 deg > 10.0 |
| m2-rover-sand-new6 | Andes · Angaco · San Juan | -31.288, -68.25 | 0.43° | 0 % | 0 % | **keep** | passes all checks |
| m3-ground-ice-new1 | Ellesmere Island · Qikiqtaaluk Region · Nunavut | 81.476, -70.85 | 7.51° | 1 % | 0 % | **keep** | passes all checks |
| m3-ground-ice-new2 | Banks Island · Inuvik Region · Northwest Territories | 74.276, -121.95 | 3.14° | 5 % | 2 % | **keep** | passes all checks |
| m3-ground-ice-new3 | Asia · Allaikhovsky Ulus · Sakha Republic | 72.159, 149.15 | 0.09° | 0 % | 54 % | **remove** | water 54 % > 20 % |
| m3-ground-ice-new4 | Karakoram · disputed area (no administrative names used) | 34.994, 78.35 | 17.89° | 37 % | 0 % | **remove** | mean slope 17.89 deg > 10.0; snow/ice 37 % > 10 % |
| m3-ground-ice-new5 | Unnamed region | -76.182, -27.15 | 2.34° | ice sheet (Natural Earth) | 31 % | **remove** | inside a Natural Earth glaciated area (ice sheet or glacier); sea 31 % > 20 % |
| m3-ground-ice-new6 | Canadian Arctic Archipelago · Qikiqtaaluk Region · Nunavut | 71.735, -73.65 | 8.09° | 18 % | 56 % | **remove** | snow/ice 18 % > 10 %; water 56 % > 20 % |

m3-ground-ice-new5 ("Unnamed region", −76.182°, −27.15°) is on the Coats Land coast of the Weddell Sea, on the Antarctic ice sheet: not bare ground. No ice-free place name applies.

## B. Replacements (next candidates in rank order that pass the screen)
| id | Name | Country | lat, lon | Analog index | Rank of region | Mean slope | Relief | Access | Note |
|---|---|---|---|---|---|---|---|---|---|
| m1-eva-basalt-new7 | Great Karoo · Cape Winelands District Municipality · Western Cape | South Africa | -32.665, 19.75 | 0.993 | 12 (cell 1) | 0.68° | 77 m | medium | Tankwa/Great Karoo: very flat; the volcanic flag comes from Karoo dolerite/basalt in the 0.5° map, not a young lava field |
| m2-rover-sand-new7 | Tibetan Plateau · Shuanghu County · Xizang | China | 33.194, 87.65 | 0.992 | 6 (cell 2) | 3.04° | 324 m | low | Changtang, about 5,000 m altitude: thin air and cold, sand not confirmed on imagery |
| m3-ground-ice-new7 | New Siberian Islands · Bulunsky Ulus · Sakha Republic | Russia | 75.335, 140.45 | 0.982 | 11 (cell 3) | 0.16° | 17 m | medium | low Arctic island; flat (relief 17 m) |
| m3-ground-ice-new8 | Canadian Arctic Archipelago · Qikiqtaaluk Region · Nunavut | Canada | 67.924, -69.95 | 0.987 | 19 (cell 2) | 5.61° | 270 m | low | Baffin Island interior |
| m3-ground-ice-new9 | Qilian Mountains · Subeigiin Mongolian Autonomous County · Gansu | China | 39.335, 96.55 | 0.96 | 102 (cell 2) | 8.68° | 1324 m | low | weakest: mountain terrain (relief 1,324 m, slope 8.7°), mountain permafrost, index 0.96, region rank 102. Optional: leave it out and show 4 |

Result: M1 6 regions, M2 6, M3 5. In M3, 150 ranked regions were screened: almost all others are ice sheet, glacier, coast or lake-covered tundra. Full data for every site is in `sites.json`, `terrain-index.json`, `site-details.json` and `heightmaps/` in this folder (same formats as before; existing ids unchanged, replacements have new ids).

## C. Sand fraction in M2 (all sites about 54 %)
**By construction, not an artefact.** The 0.1° sand grid has no spike or fill value near 54 %: 1.3 % of land cells fall in 53.9–54.5 %, the same share as in the native 5 km grid (1.5 %), and the histogram is smooth (most common values 41–46 %). The index's distance term pulls new regions toward the median of the three known analogs, which is the 78.5th percentile of land = 54.4 % (Dumont 54.4, MDRS 54.5, Yungay 62.6), so every top-ranked cell sits there.

SoilGrids point API (250 m, 0–5 cm, queried 2026-11-15) against the 0.1° cell mean:
| Site | 0.1° cell | Point mean | Point 5–95 % interval |
|---|---|---|---|
| Dumont Dunes | 54.4 | 61.5 | 5.1–95.1 |
| Yungay | 62.6 | 61.6 | 19.4–93.4 |
| MDRS | 54.5 | 47.5 | 10.7–86.4 |
| m2-new1 (Iran) | 54.4 | 54.1 | 30.5–77.7 |
| m2-new2 (Yemen) | 54.1 | 54.9 | 10.2–89.7 |
| m2-new3 (Oman) | 54.4 | 55.9 | 14.1–90.2 |

The earlier "85 %" was a v2 candidate (Namibia) that is no longer listed. Text for the web: "Sand fraction is a soil-model estimate (SoilGrids, 0.1° cell mean) with a wide uncertainty (roughly 5–95 % at these sites). New regions cluster near 54 % because the index favours places like the known analogs, whose median is 54 %. It indicates sandy soil, not dunes."

## D. Why the index does not separate the new regions
New regions are, by construction, the top of the ranking: every one meets all conditions (F = 1) and sits within a few percentiles of the known analogs' median, so their index is 0.96–0.998. Differences in the third decimal are smaller than the uncertainty of the input data and should not be read as better or worse.
Suggested display: show the index as "≥ 0.98 (top of ranking)" or with two decimals for new regions, and order them by something a field team can use: access complexity (low first), then mean slope or distance to a city; or simply alphabetically by country. Keep the three-decimal value only in the data file.

## E. Independent check
See `independent-check.md`. Summary: no independent source names any of these points as an established analog site. The physical property is confirmed nearby for Harrat al Birk, Saudi Arabia (Smithsonian GVP: volcanic field about 17 km away), Ellesmere (continuous permafrost, polar desert, ground ice; about 300 km away) and Banks Island (ice-rich continuous permafrost, Lewkowicz & Way 2019). San Juan's Médanos Grandes is described as a largely static dune field, which weakens "loose sand". Santa Cruz, Yemen, Mali: none found. Replacements (South Africa, Tibet, New Siberian Islands, Baffin interior, Qilian) were not checked: show "no independent check". Free-licence images (one per mission) with author and licence are listed there.