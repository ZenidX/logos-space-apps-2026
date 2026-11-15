# Independent check of the proposed new analog regions (v8)

Date of check: 2026-11-15. Scope: literature / agency sources only; no new data analysis. Same method as `v6/independent-check.md`.

**How to read this.** Every URL below was requested with `curl -sL -A "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0" -o /dev/null -w '%{http_code}'`; the HTTP status shown is what came back. "Verified" means the quoted or paraphrased text was read in the fetched page or PDF, not taken from a search snippet. Distances are my own haversine results (Earth radius 6371 km) between the screened point and a coordinate for the place the source describes; they are approximate, and where the place coordinate is mine and not the source's, this is said.

**Verdict scale.** "SUPPORTS nearby" = a source confirms the property or analog use within about 100 km. "PARTLY" = a source exists but is far away, regional in scale, or confirms only part of the property. "NONE FOUND" = no supporting source found (a contradicting source may still be cited).

**Main result.** No source names any of the 9 screened points as an established planetary analog. Two regions have documented Mars-analog field work within 100 km (Kangerlussuaq, Westfjords). One finding cuts against the screen: the Tankwa Karoo is described as lying south of the Karoo "dolerite line", where no dolerite sills are present. No source for low-Sun lunar rehearsal was found anywhere, as expected.

---

## M4 — Low-Sun rehearsal (need: bare, snow-free summer ground at a latitude with a 0–12° noon Sun for at least 2 months; any analog or polar-station use nearby)

### m4-low-sun-new1 — Ungava Peninsula, Quebec (62.206, -73.15) — verdict: PARTLY

- **Sentence.** The UArctic research-infrastructure catalogue describes the CEN Salluit Research Station, a year-round polar field station for permafrost studies in the continuous permafrost zone, at Salluit, approximately 129 km west of the point; it does not describe bare ground at the point and no planetary-analog use was found.
- **Citation.** UArctic Research Infrastructure Catalogue, "CEN Salluit Research Station" (station owned and run by the Centre d'études nordiques, Université Laval). Verified text: "Studies conducted at the CEN Salluit Research Station aim to assess the potential effects of climate change in the continuous permafrost zone"; the station "can accommodate up to 6 researchers year-round".
- **URL.** https://research.uarctic.org/resources/infrastructure/details/?id=29128 — HTTP **200**.
- **Distance.** About 129 km, using my own coordinate for Salluit village (62.204, -75.643), not one from the page.
- **Limits.** The INTERACT station page (eu-interact.org) returned HTTP 503 and the CEN page 404, so they are not cited. A NASA Earth Observatory page on the Pingualuit and Couture impact craters (https://science.nasa.gov/earth/earth-observatory/ice-free-crater-lakes-on-ungava-peninsula-79743/ — HTTP 200; crater about 107 km south of the point by my coordinate) was read, but it shows a winter scene and says nothing on summer ground or analog use.

### m4-low-sun-new2 — Qeqqata, West Greenland (66.335, -49.95) — verdict: SUPPORTS nearby

- **Sentence.** A Europlanet Transnational Access field report describes a 2023 campaign that studied glacial and periglacial landforms and polygonal permafrost terrain around Kangerlussuaq as analogues for Mars, approximately 82 km north-north-west of the point.
- **Citation.** Grau Galofre, A. (2023). "At the interface of ice and water on Mars: insights from Western Greenland." Europlanet 2024 Research Infrastructure, TA scientific report, project 22-EPN3-105, TA facility visited: Kangerlussuaq. Verified text: "to investigate elements of the glacial and periglacial system surrounding Kangerlussaq, Western Greenland, to then compare them to similar landforms on the surface of Mars"; "We studied polygonised terrains around Kangerlussuaq ... Our results and interpretations will be applied to the study of Martian polygons".
- **URL.** https://www.europlanet.org/wp-content/uploads/ninja-forms/46/Europlanet_report_Kangerlussuaq_AGG2023-signed.pdf — HTTP **200**.
- **Supporting page (same programme).** "TA1 Facility 4 – AU Greenland Kangerlussuaq field site", a planetary field analogue facility run with Aarhus University under EU Horizon 2020 grant 871149; verified text: "excellent access to the glacial ice sheet, regions with permafrost, regions with glacial sediment deposits". https://www.europlanet.org/europlanet-2024-ri/ta1-pfa/ta1-facility-4-au-greenland-kangerlussuaq-field-site/ — HTTP **200**.
- **Distance.** About 82 km to Kangerlussuaq town (67.009, -50.69, my coordinate). The visited sites lie along the road from the town to the ice margin, so they are a similar distance away.
- **Limits.** This is a programme field report, not a peer-reviewed paper; the same team's conference abstract (EPSC2024-1039, doi:10.5194/epsc2024-1039, HTTP 200) was also read. The work is on Mars glacial and periglacial analogy, not on lunar or low-Sun operations. "Kangerlussuaq International Science Support" was not checked.

### m4-low-sun-new3 — Chukchi Peninsula, Chukotka (66.018, -177.75) — verdict: PARTLY (weak)

- **Sentence.** The GTN-P database describes the Lavrentiya permafrost active-layer monitoring site (CALM R27, started in 2000) on the Bering Strait coast, approximately 309 km east of the point, and it reports wet sedge-willow mossy tundra there, not bare ground; no planetary-analog use was found.
- **Citation.** Global Terrestrial Network for Permafrost (GTN-P) database, active layer site "Lavrentiya", CALM code R27. Verified text: "The Lavrentiya site (R27) was initiated in 2000 near the settlement of Lavrentiya, on the Bering Strait coast (65°36' N, 171°03' W)"; "The predominant plant communities are wet sedge Salix mossy tundra."
- **URL.** https://gtnpdatabase.org/activelayers/view/68 — HTTP **200**.
- **Distance.** About 309 km, using the coordinate given on the page.
- **Limits.** Far from the point and vegetated, so it supports "monitored permafrost region" only. Nothing was found for Egvekinot, Kresta Bay or Amguema, which are closer to the point.

### m4-low-sun-new4 — Westfjords (Vesturbyggð), Iceland (65.594, -23.55) — verdict: SUPPORTS nearby

- **Sentence.** A Lunar and Planetary Institute workshop abstract surveys debris-flow gullies on regolith-mantled fjord slopes cut into basalt above Ísafjörður in the Westfjords and calls them a good analogue for Martian gullies, approximately 57 km north-north-east of the point.
- **Citation.** Conway, S. J., Balme, M. R., Murray, J. B., Towner, M. C., & Kim, J. R. (2008). Icelandic debris flows and their relationship to Martian gullies. *Workshop on Martian Gullies: Theories and Tests*, Lunar and Planetary Institute, abstract 8024. Verified text: "The Icelandic flows occur on regolith mantled slopes of 25-30º on the sides of fjords that are cut into basaltic bedrock: a good analogue for Martian gullies"; "The gullies above the town of Ísafjörður in the Westfjords region of Iceland provide a unique opportunity to study recent debris flows".
- **URL.** https://www.lpi.usra.edu/meetings/gullies2008/pdf/8024.pdf — HTTP **200**. (The Open University repository copy, https://oro.open.ac.uk/35454, returned HTTP 403 to curl.)
- **Distance.** About 57 km to Ísafjörður (66.075, -23.125, my coordinate).
- **Limits.** A workshop abstract, not a journal paper. The analogy is to Mars gullies, not to low-Sun lunar work, and the source does not say whether the ground at the point is bare in summer.

---

## M1 — Suited EVA on volcanic terrain (need: bare basaltic lava field)

### m1-eva-basalt-new5 — Valcheta, Río Negro, Argentina (-41.453, -65.75) — verdict: SUPPORTS nearby

- **Sentence.** A peer-reviewed paper describes the Oligo-Miocene Somuncura province as a more than 55,000 km² back-arc field of mafic lava flows forming a largely undissected plateau, with plateau lavas sampled near Valcheta, a town approximately 93 km north-north-west of the point; whether the point itself lies on the lava was not verified.
- **Citation.** Kay, S. M., Ardolino, A. A., Gorring, M. L., & Ramos, V. A. (2007). The Somuncura Large Igneous Province in Patagonia: Interaction of a Transient Mantle Thermal Anomaly with a Subducting Slab. *Journal of Petrology* 48(1), 43–77. doi:10.1093/petrology/egl053. Verified text: "The Oligo-Miocene Somuncura province is the largest (∼55 000 km2) back-arc mafic volcanic field in Patagonia"; "Coalesced mafic flows from centers in the central and eastern parts of the region largely cover and surround the Meseta de Somuncura. This largely undissected plateau stands 200–700 m above the regional base level"; sample areas listed include "Valcheta".
- **URL.** https://bibliotecadigital.exactas.uba.ar/download/paper/paper_00223530_v48_n1_p43_Kay.pdf — HTTP **200** (open copy in the University of Buenos Aires digital library; the publisher page was not used). Citation details confirmed in the Crossref record.
- **Distance.** About 93 km to Valcheta town (-40.68, -66.16, my coordinate). The paper gives no coordinate for the plateau edge, and its map was not read, so the point may be on the plateau or just east of it.
- **Limits.** These are 29–17 million-year-old flows, i.e. old and weathered, not fresh lava. Nothing was found on surface roughness, vegetation or access, and no planetary-analog use was found.

### m1-eva-basalt-new7 — Great Karoo / Tankwa Karoo, Western Cape, South Africa (-32.665, 19.75) — verdict: NONE FOUND (and one source CONTRADICTS the volcanic-rock claim)

- **Sentence.** No source was found for volcanic rock or for rover or planetary field tests at the Tankwa Karoo, and the one geological source found cuts against the claim: a peer-reviewed paper places its Tankwa Karoo borehole south of the "dolerite line", a boundary south of which no dolerite sills are present.
- **Citation.** De Kock, M. O., Beukes, N. J., Adeniyi, E. O., Cole, D., Götz, A. E., Geel, C., et al. (2017). Deflating the shale gas potential of South Africa's Main Karoo basin. *South African Journal of Science* 113(9/10), Art. #2016-0331, 12 pages. doi:10.17159/sajs.2017/20160331. Verified text: "KZF-01 in the Tankwa Karoo"; "Borehole KZF-01 intersects 657 m of the Ecca Group in the southwestern part of the basin near the CFB, but south of the so-called 'dolerite line' — a boundary south of which no dolerite sills are present".
- **URL.** https://sajs.co.za/article/view/4125/6107 — HTTP **200** (open access PDF).
- **Distance.** Not computed: the paper gives no coordinate for the borehole in the text read, only "in the Tankwa Karoo".
- **Reading.** The rock here is sedimentary (Ecca Group shale and sandstone). Karoo dolerite, where it occurs further north and east, is an intrusive sill rock, not a lava field. Two web searches for rover or planetary field tests in the Tankwa Karoo returned nothing; the suggestion in the brief is not confirmed.

---

## M2 — Rover on sand (need: loose sand / dunes, dry, bare)

### m2-rover-sand-new7 — Shuanghu County, Changtang, Tibetan Plateau (33.194, 87.65) — verdict: PARTLY

- **Sentence.** A peer-reviewed land-cover study of the whole Qiangtang Plateau, which contains the point, reports that bare land covers 26.47% of the plateau, mainly in the west and north, and describes a cold, dry, windy climate with surface-covered sand, but it does not name Shuanghu or map dunes; the Qaidam Basin Mars-analog area is approximately 680 km away.
- **Citation.** Bian, K., Tan, L., Shen, Y., Chen, X., & Xu, J. (2023). Spatial pattern of land use along the terrain gradient of Qinghai Tibet Plateau: a case study of Qiangtang Plateau, China. *Frontiers in Environmental Science* 11, 1217225. doi:10.3389/fenvs.2023.1217225. Verified text: "Bare land was the second-largest land cover type, with an area of 186,302 km2, accounting for 26.47% of the plateau area. Bare land was primarily located in the western and northern parts of the plateau"; "the cold, dry, windy climate, surface-covered sand, and sparse and low vegetation". The same abstract says grassland is the largest class (63.94%).
- **URL.** https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2023.1217225/full — HTTP **200**. Citation details confirmed in the Crossref record.
- **Distance.** 0 km at plateau scale (the study area includes the point; no site coordinate is given). The 680 km figure is from the point to my own approximate coordinate for the Dalangtan area of the Qaidam Basin (38.5, 91.4); it is not from a source.
- **Limits.** This confirms dry, partly bare ground in the region, not loose sand or dunes at the point. Three searches for aeolian sand or dunes in Shuanghu returned nothing specific. No Mars-analog work was found on the Qiangtang Plateau.

---

## M3 — Shallow ground ice (need: continuous permafrost, ground ice, polar desert)

### m3-ground-ice-new7 — New Siberian Islands, Sakha (75.335, 140.45) — verdict: SUPPORTS nearby

- **Sentence.** A PANGAEA dataset from the Alfred Wegener Institute permafrost group reports stable-isotope measurements of permafrost ice wedges on Kotelny Island, with the site given at 74.7°N, 138.5°E, approximately 90 km south-west of the point on the same island.
- **Citation.** Opel, T., Murton, J. B., Wetterich, S., Meyer, H., Ashastina, K., Günther, F., Grotheer, H., Mollenhauer, G., Danilov, P. P., Boeskorov, V., Savvinov, G. N., & Schirrmeister, L. (2019). 11. Spatial comparison of stable water isotope data of ice wedges at New Siberian Islands, Kotel'ny [dataset]. PANGAEA. doi:10.1594/PANGAEA.904091. Verified on the record: keywords "Ice wedges; Permafrost; Siberian Arctic"; "Event(s): Kotelny * Latitude: 74.700000 * Longitude: 138.500000"; 68 data points; project "Permafrost Research (AWI_Perma)".
- **URL.** https://doi.pangaea.de/10.1594/PANGAEA.904091 — HTTP **200**.
- **Distance.** About 90 km, using the coordinate on the record (which is rounded, so it is a general island position).
- **Limits.** This is a data record supplementing a paper about another site (Opel et al. 2019, *Climate of the Past* 15, 1443–1461), so it shows that wedge ice exists on Kotelny, not how much or how shallow. A second paper on ground ice on the Faddeevsky Peninsula of the same island could not be opened (see the list at the end). No analog use was found; as in v6, this is ice-rich ground, not a dry polar desert.

### m3-ground-ice-new8 — Baffin Island interior, Nunavut (67.924, -69.95) — verdict: PARTLY

- **Sentence.** A peer-reviewed national ground-ice model places Baffin Island in the continuous permafrost zone and reports high segregated-ice abundance on the Great Plain of the Koukdjuak in south-western Baffin Island, approximately 209 km south-west of the point, and high relict-ice abundance in north-west Baffin Island; it says nothing specific about the point or about polar desert.
- **Citation.** O'Neill, H. B., Wolfe, S. A., & Duchesne, C. (2019). New ground ice maps for Canada using a paleogeographic modelling approach. *The Cryosphere* 13(3), 753–773. doi:10.5194/tc-13-753-2019. Verified text: relict ice occurs "in the modern continuous permafrost zone ... High abundance occurs in four main areas: ... (4) northwest Baffin Island"; "Southwestern Baffin Island also includes high segregated ice abundance where shallow (<2 m) thaw lakes and drained lake basins are widespread on the Great Plain of the Koukdjuak".
- **URL.** https://tc.copernicus.org/articles/13/753/2019/ — HTTP **200**. Citation details confirmed in the Crossref record.
- **Distance.** About 209 km to my own approximate coordinate for the Great Plain of the Koukdjuak (66.4, -72.8).
- **Limits.** A modelled national map, not a field study, and the ice-rich areas it names are elsewhere on the island. No field study of permafrost or ground ice was found for the central interior (searches for Dewar Lakes, Nettilling Lake and central Baffin returned lake-sediment and glacier papers only). No analog use was found.

---

## Five-line summary

1. No independent source names any of the 9 screened points as a planetary analog; 4 are "SUPPORTS nearby", 4 "PARTLY", 1 "NONE FOUND".
2. M4: Mars-analog field work is documented near Kangerlussuaq (Europlanet field report, ~82 km) and at Ísafjörður in the Westfjords (LPI abstract, ~57 km); Ungava has a polar station ~129 km away; Chukotka only a vegetated monitoring site ~309 km away; no low-Sun lunar rehearsal source exists.
3. M1: the Somuncura basaltic plateau is confirmed (Kay et al. 2007; old, weathered flows; ~93 km to the Valcheta sampling area); the Tankwa Karoo claim is contradicted — it lies south of the "dolerite line" and no rover test was found.
4. M2: Shuanghu is only partly supported — the Qiangtang Plateau is 26% bare land with surface sand, but no dune source was found, and the Qaidam analog area is ~680 km away.
5. M3: ice wedges are documented on Kotelny Island ~90 km from the point (AWI dataset); the Baffin interior rests on a national ground-ice model only (~209 km to the nearest named ice-rich area).

## Verified by bibliographic record only (not read at source)

- Pismeniuk, A., Semenov, P., Veremeeva, A., et al. (2023). Geochemical Features of Ground Ice from the Faddeevsky Peninsula Eastern Coast (Kotelny Island, East Siberian Arctic). *Land* 12(2), 324. doi:10.3390/land12020324 — publisher page HTTP 403; title, authors and abstract read in the Crossref record only. Not used for a verdict.
- Maslakov, A., Shabanova, N., Zamolodchikov, D., Volobuev, V., & Kraev, G. (2019). Permafrost Degradation within Eastern Chukotka CALM Sites in the 21st Century Based on CMIP5 Climate Models. *Geosciences* 9(5), 232. doi:10.3390/geosciences9050232 — publisher page HTTP 403; abstract read in the Crossref record only. Not used for a verdict.
- Opel et al. (2019), *Climate of the Past* 15(4), 1443–1461, doi:10.5194/cp-15-1443-2019 — page opened (HTTP 200) but only its link to the Kotelny dataset was used; its text on Kotelny was not found or read.
- Citation details (volume, pages, author lists) for Kay et al. 2007, O'Neill et al. 2019 and Bian et al. 2023 come from Crossref; their quoted text was read in the fetched copies.
- Place coordinates used for distances to Salluit, Kangerlussuaq, Ísafjörður, Valcheta, the Great Plain of the Koukdjuak and Dalangtan are my own, not from the sources.
