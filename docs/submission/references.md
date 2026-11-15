# Project page fields: data, references and use of SI (draft)

AI-assisted draft (Claude), prepared with the licence review of the project; to be reviewed by team Logos before it is pasted into the Space Apps project page.
Figures match the published version: 4 missions, 19 new regions, 10 known analog sites (9 used to validate the index).

## NASA Data
```
NASA data is the core of the analog index. Most scored Earth surface conditions are NASA products, the missions come from NASA field campaigns, and the Moon terrain and the solar data shown per site are NASA products.

Earth surface conditions (scored, 0.1° global land grid, 2024 means):
- MODIS Terra Land Surface Temperature MOD11A2 v061 — https://doi.org/10.5067/MODIS/MOD11A2.061
- MODIS Terra Vegetation Indices MOD13C1 v061 (NDVI) — https://doi.org/10.5067/MODIS/MOD13C1.061
- MODIS Terra+Aqua BRDF/Albedo MCD43C3 v061 (white-sky shortwave albedo) — https://doi.org/10.5067/MODIS/MCD43C3.061
- GPM IMERG Final Precipitation V07, monthly — https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07

Per-site context (not scored): monthly ground temperature (MERRA-2), sunlight at the surface (ALLSKY_SFC_SW_DWN) and clearness index (ALLSKY_KT; CERES SYN1deg):
- NASA POWER Climatology API v2.10.1, retrieved 2026-11-14 — https://power.larc.nasa.gov/ . The data was obtained from the National Aeronautics and Space Administration (NASA) Langley Research Center (LaRC) Prediction of Worldwide Energy Resource (POWER) Project funded through the NASA Earth Science Division.

Moon terrain (11 × 11 km heightmap of the target):
- LRO LOLA 30 m/px south-pole DEM (LDEM_75S_30M, LRO LOLA Team, NASA GSFC / PDS) via NASA Moon Trek — https://trek.nasa.gov/moon/ ; Smith et al. (2010), https://doi.org/10.1007/s11214-009-9512-y

Moon and Mars target constants (gravity, pressure, temperature):
- NASA NSSDC Planetary Fact Sheets (D. R. Williams, NASA GSFC) — https://nssdc.gsfc.nasa.gov/planetary/factsheet/

Globe imagery:
- Earth: NASA Blue Marble via NASA GIBS — https://nasa-gibs.github.io/gibs-api-docs/
- Moon: LROC WAC colour mosaic, CGI Moon Kit, NASA's Scientific Visualization Studio (NASA/GSFC/Arizona State University) — https://svs.gsfc.nasa.gov/4720
- Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek — https://trek.nasa.gov/mars/
- Earth city lights and water mask: NASA Earth Observatory, Black Marble 2016 (Suomi NPP VIIRS) — https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/
- Earth clouds: NASA Visible Earth, Blue Marble cloud layer (2002, MODIS) — https://visibleearth.nasa.gov/images/57747/blue-marble-clouds (original file retrieved through the Internet Archive)
- Moon relief: LOLA elevation, CGI Moon Kit, NASA's Scientific Visualization Studio — https://svs.gsfc.nasa.gov/4720
- Mars relief: MGS MOLA Mission Experiment Gridded Data Record (MEGDR), NASA PDS Geosciences Node — https://pds-geosciences.wustl.edu/missions/mgs/megdr.html

NASA field campaigns and facilities used to define the four missions and to check the index:
- JETT3 (2022) — https://www.nasa.gov/humans-in-space/nasa-to-practice-artemis-moonwalking-roving-operations-in-arizona-desert ; field log — https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log
- Desert RATS (2022, with JAXA) — https://www.nasa.gov/humans-in-space/nasa-practices-rover-operations-in-simulated-lunar-environment/
- BASALT, Hawaii (2016-2017) — https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/
- JPL Scarecrow rover tests, Dumont Dunes (2012) — https://www.jpl.nasa.gov/news/mojave-desert-tests-prepare-for-nasa-mars-roving/
- ARADS, Atacama (2015-2019) — https://www.nasa.gov/image-article/astrobiology-technology-atacama-rover-astrobiology-drilling-studies/ ; https://ntrs.nasa.gov/citations/20220002136
- TRIDENT drill at Haughton crater (2024) — https://ntrs.nasa.gov/citations/20250004164
- IceBite, University Valley, Antarctica (NASA ASTEP) — https://astrobiology.nasa.gov/news/new-astep-projects-reach-from-arctic-to-antarctic-mars-to-europa/
- RESOLVE at Mauna Kea (2010, NASA/CSA) — https://ntrs.nasa.gov/citations/20100033667
- NASA Ames Lunar Lab and regolith testbeds — https://www.nasa.gov/centers-and-facilities/ames/the-lunar-lab-and-regolith-testbeds/
- Apollo geology field training in Iceland (NASA SP-2015-626) — https://ntrs.nasa.gov/citations/20190026783

NASA imagery is used following NASA media guidelines; no NASA logos or insignia are used, and this project is not endorsed by NASA.
```

## Space Agency Partner Data and Other References
```
Space Agency Partner resources
- ESA: PANGAEA geology training — https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/CAVES_and_PANGAEA/What_is_PANGAEA
- ESA: SAFER rover field trial, Atacama (2013) — https://www.esa.int/Enabling_Support/Space_Engineering_Technology/ESA_rover_completes_exploring_Mars-like_desert
- ESA / Copernicus: Copernicus DEM GLO-30 (Earth terrain heightmaps) — https://doi.org/10.5270/ESA-c5d3d65 . Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved. The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM-30.
- ESA WorldCover 2021 v200 (ground screening) — © ESA WorldCover project 2021 / contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium, CC BY 4.0 — https://esa-worldcover.org/en ; https://doi.org/10.5281/zenodo.7254221
- ESA Mars Express HRSC, in the HRSC and MOLA Blended DEM 200 m v2: Fergason, Hare & Laura (2018), USGS Astrogeology — https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m (MOLA: NASA/GSFC, CC0; HRSC: ESA/DLR/FU Berlin, CC BY-SA 3.0 IGO; our derived Mars heightmaps are shared under CC BY-SA 3.0 IGO)
- CSA: partner in RESOLVE at Mauna Kea (2010). JAXA: partner in Desert RATS 2022.

Other Earth data
- ISRIC SoilGrids 2.0, sand fraction 0-5 cm (CC BY 4.0; model prediction), Poggio et al. (2021) — https://doi.org/10.5194/soil-7-217-2021
- GLiM Global Lithological Map, Hartmann & Moosdorf (2012) — https://doi.org/10.1029/2012GC004370 ; data https://doi.org/10.1594/PANGAEA.788537 (CC BY 3.0; modified: basic-volcanic class aggregated in a 3×3 window)
- Natural Earth: countries, regions, populated places, glaciated areas (public domain) — https://www.naturalearthdata.com/about/terms-of-use/
- OpenStreetMap / Nominatim place names, © OpenStreetMap contributors (ODbL) — https://www.openstreetmap.org/copyright
- Travel time to cities: Weiss et al. (2018), Nature 553:333 — https://doi.org/10.1038/nature25181 (CC BY 4.0 as distributed in the Google Earth Engine catalogue)
- Airports: OurAirports (public domain) — https://github.com/davidmegginson/ourairports-data

Access-complexity layer (neutral, relative; not travel advice)
- World Bank, Worldwide Governance Indicators, 2026 update (CC BY 4.0) — https://www.worldbank.org/en/publication/worldwide-governance-indicators
- UCDP Georeferenced Event Dataset Global 26.1 and Candidate Events v26.0.9 (CC BY 4.0) — https://ucdp.uu.se/downloads/ ; Davies, Pettersson & Öberg (2026); Sundberg & Melander (2013); Hegre et al. (2020)
- U.S. Department of State Travel Advisories (public domain), retrieved 2026-11-14 — https://travel.state.gov/
- UK FCDO Foreign travel advice, retrieved 2026-11-14/15. Contains public sector information licensed under the Open Government Licence v3.0 — https://www.gov.uk/foreign-travel-advice
- Research permits (quoted with source): Nunavut Research Institute — https://www.nri.nu.ca/ ; Aurora Research Institute — https://nwtresearch.com/licensing

Targets, campaigns and independent check of the new regions (linked and paraphrased only; no images or text copied)
- USGS Gazetteer of Planetary Nomenclature — https://planetarynames.wr.usgs.gov/ ; USGS Astrogeology, JETT5 (2024) — https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field
- Mars Society, Mars Desert Research Station — https://www.marssociety.org/
- Smithsonian Global Volcanism Program — https://volcano.si.edu/
- Kay et al. (2007), Journal of Petrology 48(1) — https://doi.org/10.1093/petrology/egl053
- De Kock et al. (2017), South African Journal of Science 113(9/10) — https://doi.org/10.17159/sajs.2017/20160331
- Bian et al. (2023), Frontiers in Environmental Science — https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2023.1217225/full
- Lewkowicz & Way (2019), Nature Communications; O'Neill et al. (2019), The Cryosphere — https://tc.copernicus.org/articles/13/753/2019/
- Opel et al. (2019), Alfred Wegener Institute dataset — https://doi.pangaea.de/10.1594/PANGAEA.904091
- Conway et al. (2008), LPI workshop abstract — https://www.lpi.usra.edu/meetings/gullies2008/pdf/8024.pdf
- Europlanet field report, Kangerlussuaq (2023) — https://www.europlanet.org/ ; UArctic research-infrastructure catalogue — https://research.uarctic.org/ ; GTN-P database — https://gtnpdatabase.org/
- Hayne et al. (2017) — https://doi.org/10.1002/2017JE005387 ; Lucey et al. (2014) — https://doi.org/10.1002/2013JE004592 ; Christensen et al. (2001) — https://doi.org/10.1029/2000JE001370 ; Mars Climate Database v6.2 — http://www-mars.lmd.jussieu.fr/
- Full list of every claim and source: docs/sources.md and docs/independent-check*.md in the repository.

Software, fonts and design references
- three.js (MIT) — https://github.com/mrdoob/three.js ; Next.js (MIT, © Vercel, Inc.) — https://github.com/vercel/next.js ; React (MIT, © Meta Platforms, Inc.) — https://github.com/facebook/react ; Tailwind CSS (MIT) — https://github.com/tailwindlabs/tailwindcss
- Fonts (SIL Open Font License 1.1): Bricolage Grotesque © 2022 The Bricolage Grotesque Project Authors — https://github.com/ateliertriay/bricolage ; Martian Mono © 2021 The Martian Mono Project Authors — https://github.com/evilmartians/mono
- Design references (ideas only, no code copied): listed in docs/design-rationale.md. Hosting: Vercel (static site).
- The logistics filters, the terrain selector, the evidence levels and the "Hardware rehearsed" list were adapted from feature ideas of our team's parallel prototype for the same challenge; no code was reused.

Our code is released under the MIT License. Third-party data and imagery keep their own licences, listed above and in the app ("Method & sources"). This project is not endorsed by NASA, ESA, JAXA, CSA or any organisation named here.
```

## Use of Super Intelligence (SI)
```
Yes, as a tool only. The idea and the problem framing are our team's own: finding Earth analog sites per real mission (suited EVA on volcanic terrain, rover on sand, water from ground ice, low-Sun operations and solar power), checking the index against the places where real field campaigns ran, and showing next to each site a neutral access-complexity estimate. We did not use SI to come up with the idea of how to solve the challenge. The team's decisions are recorded with their time in docs/idea-origin.md.

We used SI (Claude agents by Anthropic, through Claude Code), under the team's direction, for:
- Code: writing and debugging the web app (Next.js, three.js) and the data-processing scripts (Python).
- Data search: finding and summarising field campaigns, public datasets and their licences, and running the independent literature check of each new region. Sources and open items are tracked in docs/sources.md.
- Method drafting: the scoring formula, thresholds and weights were drafted with SI assistance from the team's idea and are documented as team choices in docs/method.md.
- Design and writing: a front-end design proposal, and drafting and editing documentation and on-screen texts in English.

SI-assisted outputs are reviewed by the team before submission. Where SI was used:
- Code: every SI-assisted source file starts with the header "AI-assisted (Claude), reviewed by team Logos".
- Data: generated data files carry the metadata field "generatedWith".
- AI_USAGE.md in the repository lists each file and what SI did in it.
- No image-, video- or audio-generation models were used. The only SI-assisted graphics are the Terra Vista logo, written by SI as SVG vector code from proposals the team chose, and that logo placed on the social preview image (og.png). [If the demo video uses any SI-generated image, voice or music, it carries a visible "AI-generated" watermark and is stated in the video description.]
- No SI-generated content uses, contains or modifies any NASA logo, flag, insignia or mission identifier.
```

Note for the team: keep or delete the sentence in square brackets in the SI field, depending on how the demo video is made. If the wording of the "Method drafting" bullet changes in `README.md`, change it here too.
