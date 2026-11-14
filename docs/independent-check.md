# Independent check of the proposed new analog regions

Date of check: 2026-11-15. Scope: literature / agency sources only; no new data analysis.

**How to read this.** Every URL below was requested with `curl -sL -A "Mozilla/5.0 ... Firefox/128.0"`; the HTTP status shown is what came back. Where a publisher blocked the request (403), the claim was confirmed on another copy, and that copy is named. "Verified" means the quoted or paraphrased text was read in the fetched page, not taken from a search snippet. Distances between the screen coordinate and the cited study site are my own rough estimates from the coordinates (not from the sources).

**Main result.** No source was found that names any of the 13 screened points as an established planetary analog. What exists is (i) independent confirmation of the claimed physical property for several regions, and (ii) analog work in the same region or the same type of terrain, usually tens to hundreds of km from the screened point. Two findings cut against the screen: Médanos Grandes (San Juan) is described as a largely inactive dune field, and the Pilbara's analog reputation is for astrobiology, not for basaltic lava-field EVA terrain.

---

## M1 — Suited EVA on volcanic terrain (need: bare basaltic lava field)

### (c) Tihamah / 'Asir, Saudi Arabia (18.27, 41.75) — verdict: SUPPORTS the physical property; no analog literature found

- **Source 1 (official institution).** Smithsonian Institution Global Volcanism Program, volcano profile "Harrat al Birk", volcano number 231072. Profile lists: Country Saudi Arabia; "Cluster | Volcanic field"; coordinates **18.37°N, 41.63°E**; elevation 587 m; no known Holocene eruptions. The profile's image caption (read on the EarthChem mirror of the GVP data) says: "Around 200 identified scoria cones have formed throughout the 1,800 km2 Harrat al Birk volcanic field, seen along the Red Sea coast of Saudi Arabia".
  - URL: https://volcano.si.edu/volcano.cfm?vn=231072 — HTTP **403** to curl (Cloudflare check); opened in a real browser and the profile fields above were read there.
  - Mirror: https://decade.earthchem.org/d/231072 — HTTP **200**, caption verified.
  - The GVP coordinate is roughly 17 km from the screened point, so the point sits in or at the edge of this volcanic field.
- **Source 2 (peer-reviewed).** Bakhsh, R. A. (2017, online 24 Sep 2016). The Harrat Al-Birk basalts in southwest Saudi Arabia: characteristic alkali mafic magmatism related to Red Sea rifting. *Acta Geochimica* 36(1), 74–88. doi:10.1007/s11631-016-0126-2.
  - URL: https://link.springer.com/article/10.1007/s11631-016-0126-2 — HTTP **200**, but the page served to curl was a bot-check shell, so the abstract was **not** read there. Title, journal, volume and pages confirmed through the Crossref record for the DOI. The basalt composition is taken from the title only.
- **Limits.** Nothing found on surface roughness, vegetation or access, and no paper proposing Harrat al Birk as a lunar/Mars analog. The Commons image caption (below) calls it "an ancient lava field" 2–30 million years old, i.e. weathered, not fresh lava.

### (d) Pilbara, Western Australia (-23.03, 117.35) — verdict: PARTLY (analog for astrobiology, not for lava-field EVA)

- **Source (official agency).** NASA Jet Propulsion Laboratory news release, "Mars Scientists Investigate Ancient Life in Australia", 15 Nov 2019. Verified text: "Scientists from NASA's Mars 2020 and ESA's ExoMars projects study stromatolites, the oldest confirmed fossilized lifeforms on Earth, in the Pilbara region of North West Australia."
  - URL: https://www.jpl.nasa.gov/news/mars-scientists-investigate-ancient-life-in-australia/ — HTTP **200**.
- **Why only partly.** The release is about stromatolite fossils (Dresser Formation), i.e. a biosignature-search analog. It says nothing about basaltic lava fields or EVA terrain. The Dresser Formation outcrops are, by my estimate, a few hundred km north-east of the screened point. No source was found that uses the Fortescue Group flood basalts as an EVA or lava-field analog (a Crossref search returned only a general geology chapter: Hickman 2023, doi:10.1007/978-3-031-18007-1_12, not opened).

### (b) Chalbi Desert / North Horr, Kenya (3.44, 36.75) — verdict: PARTLY

- **Source (official institution).** Smithsonian GVP data for Marsabit (volcano number 222021), read on the EarthChem mirror. Verified caption: "Marsabit, a massive, 6,300 km2 shield volcano located 170 km E of the center of the East African Rift. Its slopes are dotted with 180 cinder cones and 22 maars ... The youngest lava flows are unvegetated".
  - URL: https://decade.earthchem.org/d/222021 — HTTP **200**. (Primary page https://volcano.si.edu/volcano.cfm?vn=222021 — HTTP **403** to curl; not re-opened in a browser.)
- **Why only partly.** This confirms basaltic volcanism with unvegetated young flows in Marsabit County, but the Marsabit shield is roughly 185 km south-east of the screened point. Nothing was found for the point itself, and no analog literature.

### (a) Santa Cruz, Argentine Patagonia (-48.335, -69.15) — verdict: NONE FOUND

- A search for Patagonian plateau basalts / Pali Aike as a planetary analog returned nothing for Santa Cruz. The two NASA Earth Observatory items found are about other provinces: "Volcanic Plateaus in Argentina" (Meseta de Canquel, **Chubut**; https://science.nasa.gov/earth/earth-observatory/volcanic-plateaus-in-argentina-144304/ — HTTP 200) and "Lava Plateaus in Argentina" (near La Esperanza; https://science.nasa.gov/earth/earth-observatory/lava-plateaus-in-argentina-1687/ — HTTP 200). They show that bare, arid lava plateaus exist in Patagonia in general; they do not confirm the screened point.
- Caution for the jury: Crossref lists hot-spring literature for the Deseado Massif (e.g. Guido & Campbell 2011, *J. Volcanol. Geotherm. Res.* 203, 35–47, doi:10.1016/j.jvolgeores.2011.04.001 — metadata only, not opened). That is a different kind of rock and a different kind of analog; it should not be cited as support for "basaltic lava field".

---

## M2 — Rover on sand (need: loose sand / dunes, dry, bare)

### (e) Ad Dhahirah, Oman (22.61, 56.75) — verdict: PARTLY (same country, different region)

- **Source (peer-reviewed).** Groemer, G., Gruber, S., Uebermasser, S., Soucek, A., Lalla, E. A., Lousada, J., Sams, S., Sejkora, N., Garnitschnig, S., Sattler, B., & Such, P. (2020). The AMADEE-18 Mars Analog Expedition in the Dhofar Region of Oman. *Astrobiology* 20(11), 1276–1286. doi:10.1089/ast.2019.2031. Verified abstract text: "conducted the AMADEE-18 mission, a human-robotic Mars expedition simulation in the Dhofar region in the Sultanate of Oman."
  - URL: https://doi.org/10.1089/ast.2019.2031 — HTTP **403** (publisher blocks curl). Abstract verified through the Crossref record and the Europe PMC record for the same DOI (PubMed ID 33179971; https://pubmed.ncbi.nlm.nih.gov/33179971/ returned HTTP 203 with a cookie wall, so not read there).
- **Why only partly.** Dhofar is the southern governorate; the screened point is in the north, roughly 500 km away. The paper shows Oman has hosted a full Mars analog mission; it does not describe sand at the screened point. NASA Earth Observatory pages confirm the Rub' al Khali extends into Oman ("stretches over parts of Saudi Arabia, Yemen, Oman, and the United Arab Emirates"; https://science.nasa.gov/earth/earth-observatory/empty-quarter-9054/ — HTTP 200), but the images on those pages are of Saudi Arabia.

### (f) San Juan, Argentina (-31.29, -68.25) — verdict: PARTLY, with a CONTRADICTION on "active sand"

- **Source 1 (journal article, open access).** Pastrán & Carretero (2016). Phytogenic Mounds (Nebkhas): Effect of *Tricomaria usillo* on Sand Entrapment in Central-West of Argentina. *Journal of Geographic Information System* 8(4), 429–437. doi:10.4236/jgis.2016.84036. Verified text: "Médanos Grandes is a static erg located in the south-southeast of San Juan province, Argentina, between 31˚40'S - 67˚42'W and 32˚00'S - 68˚10'W" and "The Drift Potential (DP) for the study area was 42, evidencing the inactivity of the sand dunes or the scarce activity only in crests."
  - URL: https://doi.org/10.4236/jgis.2016.84036 (resolves to scirp.org) — HTTP **200**. Authors' surnames (Pastrán, Carretero), volume and pages are from the Crossref record; initials are not verified. Note the publisher (SCIRP) is not a top-tier venue.
- **Source 2 (peer-reviewed).** Tripaldi, A., & Forman, S. L. (2007). Geomorphology and chronology of Late Quaternary dune fields of western Argentina. *Palaeogeography, Palaeoclimatology, Palaeoecology* 251(2), 300–320. doi:10.1016/j.palaeo.2007.04.007.
  - URL: https://doi.org/10.1016/j.palaeo.2007.04.007 — HTTP **200** on the Elsevier redirect page; the ScienceDirect article page returned **403**. Only the bibliographic record (Crossref) was verified, not the abstract.
- **Reading.** A large dune field with megadunes does exist in San Juan (supports "sand"). But it is described as a static, partly vegetated erg with activity only on crests (contradicts "active, bare, loose sand"), and its mapped extent starts roughly 40 km south of the screened point.

### (g) Razavi Khorasan, Iran (35.1, 60.55) — verdict: PARTLY (weak)

- **Source (journal article).** Abbasi, H., Kashki, M., Rahdari, M. R., Gohardoust, A., & Lotfi Nasab Asl, S. The Features of Wind's Regime and Sand Transport Potential in Sarakhs Erg. *Iranian Journal of Range and Desert Research*. doi:10.22092/ijrdr.2020.122809.1753 (year, volume and pages not captured). Verified abstract text: "to investigate the characteristics of wind regime and sand transport potential in the Sarakhs Erg, located in the north-eastern corner of Iran."
  - URL: https://ijrdr.areeo.ac.ir/article_122306.html?lang=en — HTTP **200**.
- **Why weak.** Sarakhs is roughly 165 km north of the screened point. Nothing was found for the point itself.

### (h) Al Jawf, Yemen (16.47, 44.95) — verdict: NONE FOUND (verifiable)

- Encyclopaedia Britannica has an entry for the Ramlat al-Sabʿatayn dunes (https://www.britannica.com/place/Ramlat-al-Sabatayn — HTTP **403**, not read), and it is not peer-reviewed. A paper title on Holocene lakes in the Ramlat as-Sab'atayn surfaced in a search snippet but could not be opened, so it is not cited here.

### (i) Gao / Bourem, Mali (17.84, 0.05) — verdict: NONE FOUND for the region

- The nearest thing is a NASA contractor report on dunes at Tombouctou/Azaouad, Mali — a different area, roughly 300 km to the west: Jacobberger, P. A. (1987). *Environmental Processes and Spectral Reflectance Characteristics Associated with Soil Erosion in Desert Fringe Regions*. NASA-CR-182332. https://ntrs.nasa.gov/citations/19880004429 — HTTP **200**. It does not cover Gao or Bourem.

---

## M3 — Shallow ground ice (need: continuous permafrost, ice-cemented ground, polar desert)

### (j) Northern Ellesmere Island, Nunavut (81.48, -70.85) — verdict: SUPPORTS the physical property (same island, different peninsula); analog link is indirect

- **Source 1 (peer-reviewed, open access).** Bernard-Grand'Maison, C., & Pollard, W. (2018). An estimate of ice wedge volume for a High Arctic polar desert environment, Fosheim Peninsula, Ellesmere Island. *The Cryosphere* 12(11), 3589–3604. doi:10.5194/tc-12-3589-2018. Verified text: "the Fosheim Peninsula, Ellesmere Island, a continuous permafrost area characterized by polar desert conditions and extensive ground ice."
  - URL: https://tc.copernicus.org/articles/12/3589/2018/ — HTTP **200**. Citation details confirmed in the Crossref record.
- **Source 2 (peer-reviewed, analog context).** Pollard, W., Haltigin, T., Whyte, L., Niederberger, T., Andersen, D., Omelon, C., Nadeau, J., Ecclestone, M., & Lebeuf, M. (2009). Overview of analogue science activities at the McGill Arctic Research Station, Axel Heiberg Island, Canadian High Arctic. *Planetary and Space Science* 57(5–6), 646–659. doi:10.1016/j.pss.2009.01.008.
  - URL: https://doi.org/10.1016/j.pss.2009.01.008 — HTTP **200** on the Elsevier redirect page. Only the bibliographic record (Crossref) was verified; the abstract was not read.
- **Limits.** The Fosheim Peninsula is on west-central Ellesmere, roughly 300 km from the screened point near Lake Hazen. The analog station is on the neighbouring island (Axel Heiberg). No paper was found that treats the Lake Hazen / Alert area itself as a Mars ground-ice analog.

### (k) Banks Island, NWT (74.28, -121.95) — verdict: SUPPORTS ice-rich continuous permafrost; no analog literature found

- **Source (peer-reviewed, open access).** Lewkowicz, A. G., & Way, R. G. (2019). Extremes of summer climate trigger thousands of thermokarst landslides in a High Arctic environment. *Nature Communications* 10, 1329. doi:10.1038/s41467-019-09314-7. Verified text: retrogressive thaw slumps were resolved "for Banks Island, Canada (70,000 km2)"; "more than 4000 RTS were initiated"; "ice-rich continuous permafrost terrain can be highly vulnerable to changing summer climate"; and a figure caption gives "ice-rich permafrost (averaging 85% ice by volume)".
  - URL: https://www.nature.com/articles/s41467-019-09314-7 — HTTP **200**. Citation details confirmed in the Crossref record.
- **Limits.** The paper covers the whole island, so it applies to the screened point. But it describes ground ice that is thawing and slumping, which is a hazard for operations, and it is not an analog study.

### (l) Sakha, Russia (72.16, 149.15) — verdict: PARTLY (real Mars-analog literature for this type of ground, but it is wet, ice-rich tundra, not polar desert)

- **Source (peer-reviewed).** Ulrich, M., Morgenstern, A., Günther, F., Reiss, D., Bauch, K. E., Hauber, E., Rössler, S., & Schirrmeister, L. (2010). Thermokarst in Siberian ice-rich permafrost: Comparison to asymmetric scalloped depressions on Mars. *Journal of Geophysical Research* 115, E10009. doi:10.1029/2010JE003640. Verified abstract text: "We investigated a large thermokarst depression in ice complex deposits in the Siberian Arctic as a terrestrial analogue for scalloped depressions in Martian volatile-rich mantle deposits."
  - URL: https://doi.org/10.1029/2010JE003640 — HTTP **403** (publisher blocks curl). Verified on the institutional repository copy: https://epic.awi.de/id/eprint/22493/ — HTTP **200**, and the PDF https://epic.awi.de/id/eprint/22493/1/Ulr2010a.pdf — HTTP **200** (abstract read from the PDF).
- **Honest reading.** This is the only screened M3 region whose ground type has a peer-reviewed Mars-analog paper. But the study site is in the Lena Delta, roughly 800 km west of the screened point, and the analogy is to thermokarst landforms in very ice-rich deposits. It does not make the region a "dry, ice-cemented polar desert". The team's own doubt about this region is justified.

### (m) Baffin Island, Nunavut (71.74, -73.65) — verdict: PARTLY (weak)

- **Source (peer-reviewed, open access).** Coulombe, S., Fortier, D., Lacelle, D., Kanevskiy, M., & Shur, Y. (2019). Origin, burial and preservation of late Pleistocene-age glacier ice in Arctic permafrost (Bylot Island, NU, Canada). *The Cryosphere* 13(1), 97–111. doi:10.5194/tc-13-97-2019. Verified text: the site is "on south-west Bylot Island at about 80 km north-west of Mittimatalik (Pond Inlet)"; "presence of continuous permafrost in the ice-free areas of Bylot Island"; "mean annual precipitation of 189 mm". Citation details confirmed in the Crossref record.
  - URL: https://tc.copernicus.org/articles/13/97/2019/ — HTTP **200**.
- **Why weak.** Bylot Island is a separate island roughly 260 km from the screened point, and the same paragraph describes wetlands and mesic tundra, not polar desert. Nothing was found for the point itself.

---

## Images with a free licence (one per mission)

Licence wording is copied from the Wikimedia Commons file page. All page URLs returned HTTP 200. Direct file URLs returned HTTP 200 (image/jpeg); two of them first returned 429 (rate limit) and succeeded on retry.

| Mission / region | Page URL | Direct file URL | Author (as stated) | Licence (as stated) | What it shows |
|---|---|---|---|---|---|
| M1 — (c) Harrat al Birk, Saudi Arabia | https://commons.wikimedia.org/wiki/File:Harrat_Al_Birk,_Saudi_Arabia.jpg | https://upload.wikimedia.org/wikipedia/commons/e/ea/Harrat_Al_Birk%2C_Saudi_Arabia.jpg | "Image provided by the USGS EROS Data Center Satellite Systems Branch"; Source: "NASA Earth Observatory" | "Public domain" — "This file is in the public domain in the United States because it was solely created by NASA." | Landsat 7 ETM+ image, 18 April 2004. Page description: "Dark-coloured volcanic cones sprout from an ancient lava field known as Harrat Al Birk along Saudi Arabia's Red Sea coastline." 3648 × 3648 px. |
| M2 — (f) Médanos Grandes, San Juan, Argentina | https://commons.wikimedia.org/wiki/File:M%C3%A9danos_Grandes,_Argentina.jpg | https://upload.wikimedia.org/wikipedia/commons/1/16/M%C3%A9danos_Grandes%2C_Argentina.jpg | "Coordenação-Geral de Observação da Terra/INPE" (source: Flickr, https://www.flickr.com/photos/153282474@N02/48257312551/) | "CC BY-SA 2.0" (Creative Commons Attribution-Share Alike 2.0; attribution required) | Satellite image dated 11 July 2019 of the dune field. Page description (English part): "Médanos Grandes, large fixed dune field at Argentina´s San Juan Province Southeast." Note the caption itself says **fixed** dunes with some shrub cover. 4044 × 2275 px. |
| M3 — (j) Lake Hazen, northern Ellesmere Island | https://commons.wikimedia.org/wiki/File:Lake_Hazen_2022-07-16_Sentinel-2_L2A_Highlight_Optimized_Natural_Color.jpg | https://upload.wikimedia.org/wikipedia/commons/1/1a/Lake_Hazen_2022-07-16_Sentinel-2_L2A_Highlight_Optimized_Natural_Color.jpg | "European Space Agency" (source: https://apps.sentinel-hub.com/eo-browser) | "Attribution is required when using this image. Attribution: Contains modified Copernicus Sentinel data 2022" | Sentinel-2 natural-colour scene of Lake Hazen, 16 July 2022; camera location given as 81.775697, -71.148257, roughly 35 km from the screened point. 2500 × 1827 px. It shows the landscape, not ground ice. |

Caveats: the Flickr original of the M2 image was not opened, so the CC BY-SA 2.0 licence rests on the Commons page. A ground-level alternative for M3 exists on Commons ("Lake Hazen 1997-08-05.jpg", Ansgar Walk, CC BY-SA 2.5; page HTTP 200).

---

## Six-line summary

1. No independent source names any of the 13 screened points as an established planetary analog; support is for the physical property or for nearby/related terrain.
2. M1: Harrat al Birk (Saudi Arabia) is the best-supported — the Smithsonian GVP lists a 1,800 km² volcanic field with ~200 scoria cones about 17 km from the point; Pilbara is a NASA/ESA astrobiology analog, not a lava-field one; Kenya partly; Santa Cruz none found.
3. M2: Oman has hosted a full Mars analog mission (AMADEE-18), but in Dhofar, ~500 km from the point; San Juan's Médanos Grandes is real but described as a "static erg" with little activity; Iran weak; Yemen and Mali none found.
4. M3: Ellesmere (continuous permafrost, polar desert, extensive ground ice — The Cryosphere 2018) and Banks Island (ice-rich continuous permafrost — Nature Communications 2019) are confirmed; Baffin weak.
5. Sakha has a genuine Mars-analog paper (Ulrich et al. 2010, JGR) but for thermokarst in wet ice-rich deposits ~800 km away — a poor fit for "dry polar desert".
6. Not fully verified: four papers confirmed by bibliographic record only (Bakhsh 2017, Tripaldi & Forman 2007, Pollard et al. 2009, Guido & Campbell 2011); three free-licence images found and checked, one per mission.
