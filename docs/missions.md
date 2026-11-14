# Analog field campaigns → mission tasks → terrain requirements → data

Logos · NASA Space Apps 2026 · prepared by Logos Datos · 2026-11-14 (sources read on this date).
Rule: every campaign has an official or primary source URL. Where only secondary press was found, it is marked *(secondary)*. Numbers not in a source are not given.
Viability column = can we build a global Earth map for this task in **24 h** with data already in hand or one-click open data: 🟢 high · 🟡 medium · 🔴 low.

## ★ TOP 3 by best available data (pick for Logos Líder)
| Rank | Task | Why the data is best | Earth analogs to validate with | Target |
|---|---|---|---|---|
| ★1 | T1 Suited EVA + field geology on basalt | Global 30 m DEM + NDVI + emissivity on Earth; LOLA 5 m and CTX 5 m on Moon/Mars; 4 real campaigns (JETT, D-RATS, BASALT, PANGAEA) | SF Volcanic Field & Black Point (AZ), Craters of the Moon (ID), Lanzarote | Mons Mouton / Artemis III regions; Jezero |
| ★2 | T3 Shallow ground ice for ISRU/drilling | Gridded ice map on Mars (SWIM, GeoTIFF) + permafrost and LST on Earth; real drill tests at Haughton and Antarctica | Haughton (Devon Is.), McMurdo Dry Valleys | Arcadia Planitia, Deuteronilus Mensae |
| ★3 | T2 Rover mobility on sand & slopes | SoilGrids sand % (250 m, global) + DEM on Earth; THEMIS 100 m thermal (proxy for loose material) on Mars; 3 real tests | Dumont Dunes (CA), Atacama (Yungay), Hanksville (UT) | Jezero; Arcadia |
Runner-up: T4 low-sun lighting (needs computed solar geometry, no Earth dataset).

## 0. Summary (recommendation for zexu's 3–4 picks)
1. 🟢 **Suited EVA / crew traverse geology on basaltic volcanic terrain** (JETT, Desert RATS, BASALT, PANGAEA) → target: Artemis III regions (Mons Mouton, Malapert) / Jezero.
2. 🟢 **Rover mobility on loose sand and slopes** (Scarecrow at Dumont Dunes, SAFER/ARADS in Atacama) → target: Jezero, Arcadia.
3. 🟢/🟡 **Shallow ground ice for ISRU / drilling** (TRIDENT at Haughton, IceBite Antarctica) → target: Arcadia Planitia, Deuteronilus Mensae (SWIM).
4. 🟡 **Low-sun-angle lighting operations** (JETT3/JETT5 night EVAs with a lighting cart (JETT3) and a portable spotlight (JETT5)) → target: lunar south pole. Earth proxy = high latitude (computed solar elevation), not a dataset.
5. 🟡 **Regolith construction / landing pads** (PISCES/ACME basalt pavers, Hawai'i) → overlaps with 1 (basalt + flat ground).
Not mappable as terrain (crew isolation, indoor or underwater): HI-SEAS, CHAPEA, NEEMO, CAVES. Keep them in the narrative only.

## 1. Campaigns found (with official sources)

| Campaign | Agency | Site(s) | Years | Tasks tested | Source |
|---|---|---|---|---|---|
| Desert RATS (D-RATS) | NASA (+ JAXA in 2022) | Black Point Lava Flow, ~40 mi N of Flagstaff, AZ | yearly ~2 wk tests over more than a decade *(per ASU)*; NASA–JAXA pressurized-rover session 11–22 Oct 2022 | Pressurized rover traverse, habitat docking, K10 robot scouting, EVA | https://www.nasa.gov/humans-in-space/nasa-practices-rover-operations-in-simulated-lunar-environment/ · https://news.asu.edu/content/robotics-desert-test-provides-nasa-new-set-wheels-moon *(secondary)* |
| JETT3 | NASA (JSC) + USGS | San Francisco Volcanic Field near SP Crater, AZ | 4–9 Oct 2022 (test run 4 Oct; night moonwalks 5, 6, 8, 9 Oct) | 4 simulated moonwalks at night with a lighting cart imitating south-pole low sun and shadowed craters | https://www.nasa.gov/humans-in-space/nasa-to-practice-artemis-moonwalking-roving-operations-in-arizona-desert · https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log · https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field |
| JETT5 | NASA (JSC) + USGS | San Francisco Volcanic Field, AZ | May 2024 (USGS: 13–17 May) | "Highest fidelity Artemis EVA simulation"; night EVAs with a portable spotlight acting as the Sun (USGS); science room in Houston | same USGS page |
| JETT1, JETT2, JETT4 | NASA | not verified | — | **not found** in this pass | — |
| BASALT | NASA (SSERVI/ASTEP) | Craters of the Moon NM, Idaho; Hawai'i Volcanoes NP | 2016–2017 (3rd deployment 1–21 Nov 2017) | Mars EVA science on basalt flows/fumaroles, 5-min one-way light delay ops, sterile sampling | https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/ |
| ARADS | NASA Ames | Yungay, Atacama, Chile | 2015–2019 | Rover (KREX2) with 1 m drill + life-detection instruments | https://www.nasa.gov/image-article/astrobiology-technology-atacama-rover-astrobiology-drilling-studies/ · https://ntrs.nasa.gov/citations/20220002136 |
| Scarecrow mobility tests | NASA JPL | Dumont Dunes, Mojave, CA | May 2012 | Curiosity mobility on windward/lee dune slopes (avoid Spirit-type entrapment) | https://www.jpl.nasa.gov/news/mojave-desert-tests-prepare-for-nasa-mars-roving/ |
| TRIDENT drill test | NASA Ames | Haughton Crater, Devon Island, Nunavut | 6–11 Aug 2024 | Automated drilling ~11 m, 4 m into ice-cemented ground | https://ntrs.nasa.gov/api/citations/20250004164/downloads/LSIC25-Glass_abst2.docx |
| IceBite | NASA ASTEP | University Valley, Antarctic Dry Valleys | ~2010 (plan) | Drill through dry soil into ground ice (Phoenix-like) | https://astrobiology.nasa.gov/news/new-astep-projects-reach-from-arctic-to-antarctic-mars-to-europa/ (NASA ASTEP selection, 22 Jul 2008); outcome **not verified** |
| Haughton-Mars Project (HMP) | NASA-supported, Mars Institute / SETI | Haughton Crater, Devon Island | since 1997 | Mars exploration ops, EVA, rovers in polar desert | official HMP URL **not confirmed**; see TRIDENT NTRS abstract above |
| PISCES / ISRU field demo | NASA + CSA + PISCES | Mauna Kea, Hawai'i (~9,000 ft) | Jan–Feb 2010 | RESOLVE drill & volatiles (oxygen-from-regolith claim conflicts between NASA docs) | https://ntrs.nasa.gov/citations/20100033667 |
| PISCES / ACME landing pad | NASA KSC Swamp Works + PISCES | Big Island, Hawai'i | 2015 | Teleoperated rover (Helelani) lays 100 sintered basalt pavers | https://pacificspacecenter.com/2016/01/05/pisces-completes-lunar-landing-pad-bullseye/ *(PISCES own site)* |
| HI-SEAS | NASA HRP + Univ. Hawai'i | Mauna Loa, ~8,200 ft | Missions I–VI, 2013–2017 | Isolation/confinement (behavioural) | https://hi-seas.org/missions-i-vi |
| CHAPEA | NASA | 3D-printed habitat at JSC (indoor) | M1 Jun 2023–Jul 2024; M2 from Oct 2025 | Year-long Mars surface stay (behavioural) | https://www.nasa.gov/humans-in-space/chapea/ |
| NEEMO | NASA | Aquarius undersea station, Florida | 23 missions 2001–2019 | EVA ops underwater, isolation | https://www.nasa.gov/gallery/neemo/ |
| PANGAEA | ESA | Bletterbach (IT), Ries crater (DE), Lanzarote (ES) | since 2016; 2026 session | Astronaut field geology, traverses, sample selection | https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/CAVES_and_PANGAEA/What_is_PANGAEA · https://www.esa.int/ESA_Multimedia/Images/2026/09/Space_explorers_in_the_land_of_volcanoes |
| CAVES | ESA | Sa Grutta caves, Sardinia | 2011–2019 | Team ops underground (lava tube proxy) | https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Going_underground |
| SAFER | ESA | Atacama, Chile | 5 days, ended 12 Oct 2013 | ExoMars prototype rover (Bridget), remote ops, drill-site choice | https://www.esa.int/Enabling_Support/Space_Engineering_Technology/ESA_rover_completes_exploring_Mars-like_desert |
| ARCHES Space demo | DLR + ESA + KIT | Mt Etna, Sicily (~2,600 m) | 13 Jun–9 Jul 2022 | Lander + 2 rovers + drone autonomy, antenna install, remote rover from 23 km | https://www.dlr.de/en/rm/latest/news/2022/robotics-team-practises-lunar-exploration-on-mount-etna · https://esa.int/ESA_Multimedia/Images/2022/06/Lunar_science_stirring_on_Mount_Etna |
| CanMoon / CanMars | CSA (LEAD) + Western Univ. | Lanzarote (CanMoon); Hanksville, Utah (CanMars) | 2015–2019 *(dates not verified)* | Lunar sample-return rover ops; Mars rover ops | https://www.theweathernetwork.com/en/news/science/space/canmoon-puts-students-in-charge-of-an-analog-lunar-rover-mission *(secondary)*; CSA official page **not found** |
| AMADEE-18 / -20 / -24 | Austrian Space Forum (OeWF) | Dhofar, Oman (2018); Negev, Israel (Oct 2021); Ararat, Armenia (Mar–Apr 2024) | 2018–2024 | Full Mars surface sim: suits, rovers, habitat | https://oewf.org/en/ *(official site; mission sub-pages not opened)* |
| MDRS / FMARS | Mars Society | San Rafael Swell, ~11.6 km NW of Hanksville, UT; Devon Island | MDRS since ~2001/2002 | Crew rotations, EVA, field science | https://mdrs.marssociety.org/ |
| VIPER lunar lab | NASA Ames | indoor regolith testbed | 2020–2023 | Low-angle lighting, headlights, glare | https://www.nasa.gov/centers-and-facilities/ames/the-lunar-lab-and-regolith-testbeds/ |

## 2. Task → terrain → variables → data → target

| # | Task (from campaigns) | Terrain requirements | Measurable variables | Earth dataset (res., coverage) | Moon/Mars dataset (res., coverage) | Named target | 24 h |
|---|---|---|---|---|---|---|---|
| T1 | **Suited EVA traverse + field geology** (JETT, Desert RATS, BASALT, PANGAEA) | Unvegetated basaltic lava/scoria, low–moderate slopes (walkable), blocky roughness, little light pollution | slope; roughness (std. of elevation); NDVI≈0; rock type = basalt (emissivity/silica, see suelo-espectral.md) | Copernicus DEM GLO-30 (30 m, global) or our GMTED slope 0.1°; MODIS NDVI; ASTER GED emissivity (100 m, no Antarctica); ⚠ our NDVI GeoTIFF ×10⁻⁴ | LOLA 5 m south pole 87–90°S (https://pgda.gsfc.nasa.gov/products/81); Mars: MOLA MEGDR (global, ~463 m — *res. not verified here*), CTX 5 m mosaic 88°S–88°N (https://murray-lab.caltech.edu/CTX/) | Artemis III regions (Mons Mouton, Malapert, Haworth…, NASA 2024); Jezero | 🟢 |
| T2 | **Rover mobility on sand/regolith & slopes** (Scarecrow, SAFER, ARADS) | Loose sand, dunes, slopes up to the rover's limits, low rock density | slope; sand fraction; dune presence; thermal inertia (Mars) | SoilGrids sand % (250 m, global); Copernicus DEM; dune masks *(not searched)* | Mars: THEMIS Day IR 100 m (https://www.mars.asu.edu/data/thm_dir_100m); TES thermal inertia *(res. not verified)*; Moon: LOLA slope, Diviner rock abundance *(not verified)* | Jezero; Arcadia | 🟢 |
| T3 | **Ground ice for ISRU / drilling** (TRIDENT Haughton, IceBite, RESOLVE) | Ice-cemented ground within ~1 m, flat, cold dry polar desert | permafrost presence; ground-ice; LST mean/min; precip low; slope low | ESA CCI Permafrost (1 km, NH + Antarctica; licence PDF **not read**: https://climate.esa.int/projects/permafrost); our LST/precip 0.1° | Mars: SWIM ice consistency (1/20° pixel, N mid-lat, GeoTIFF, "preliminary"; https://swim.psi.edu/PilotStudyProducts.php); Moon: PSR / neutron data *(not searched)* | Arcadia Planitia, Deuteronilus Mensae (SWIM); lunar PSRs | 🟢/🟡 |
| T4 | **Low-sun lighting ops / solar power** (JETT3 lighting cart, JETT5 portable spotlight; VIPER lab) | Sun permanently low on horizon, long shadows, persistently lit ridges | solar elevation (from latitude/date, computed); horizon/terrain shadowing from DEM | computed from lat + DEM (no dataset needed); Copernicus DEM | LOLA 5 m illumination products (Barker et al. 2021, doi:10.1016/j.pss.2020.105119) | Shackleton rim / Connecting Ridge (LOLA site list), Mons Mouton | 🟡 |
| T5 | **Construction from regolith / landing pads** (PISCES-ACME pavers, RESOLVE) | Basalt fines available, flat ground, access for heavy kit | basalt (spectral); slope; access time | ASTER GED; Copernicus DEM; Oxford MAP access (ours, 0.1°) | Moon: LOLA slope, mare/highland maps *(not searched)*; Mars: CTX/MOLA | Mons Mouton plateau; Arcadia | 🟡 |
| T6 | Isolation/habitat behaviour (HI-SEAS, CHAPEA, NEEMO, CAVES) | — (not terrain-driven; CAVES ≈ lava tubes) | — | — | lava-tube/pit catalogues *(not searched)* | — | 🔴 (narrative only) |

## 3. Reusable data already on disk (~/spaceapp/data/ee, 0.1°, 2024)
LST day/night/max/min, precip (GPM), NDVI (⚠ ×10⁻⁴), albedo (MCD43C3), slope/elev (GMTED2010 5 km), access hours (Oxford MAP), urban fraction. Useful for T3 (cold/dry), T1/T2 (slope, NDVI) and the access part. Details: my MEMORIA.md.

## 4. Gaps / not verified
- Link check 2026-11-14 (curl): all URLs answer 200 except bot-blocked jpl.nasa.gov and usgs.gov (403), hi-seas.org (401) and swim.psi.edu (523, server down at check time); those were read through web search instead.
- JETT1, JETT2, JETT4 sites and dates: not found in this pass.
- Official pages found but not read in detail: CHAPEA, MDRS, OeWF. Not found: HMP official page, CSA LEAD page.
- RESOLVE 2010: NASA documents conflict on whether oxygen production was demonstrated.
- MOLA, TES and Diviner resolutions: not verified today (use catalogue values only after checking PDS).
- Licences of planetary products: generally NASA/PDS public; ESA CCI Permafrost licence PDF not read → Logos Legal.
