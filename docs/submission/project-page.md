# Project page texts (draft)

AI-assisted draft (Claude), to be reviewed and edited by team Logos before it is pasted into the Space Apps project page.
Figures are taken from `src/data/sites.json` (data v7, built 2026-11-15) and must be re-checked if the data changes.
The fields "NASA Data", "Space Agency Partner Data and Other References" and "Use of Super Intelligence (SI)" are kept in `references.md` (next to this file).

## Project name
Logos · Mission Analogs

## Links
- Final project (live): https://spaceapp-logos.vercel.app
- Code: https://github.com/zexuguo/SpaceApp-Logos
- Demo (30 s video or up to 7 slides): to be added by the team. It must be public, with no login.

## High-level project summary
Most analog searches ask which place on Earth looks like the Moon or Mars. We ask a more useful question: **where on Earth can a specific mission task be rehearsed?** Logos starts from real field campaigns (suited EVAs on volcanic ground, rovers on loose sand, drilling into ground ice, working under a low Sun), turns each task into a few surface conditions that NASA data can measure, scores every 0.1° land cell on Earth, and checks that the score finds the places where agencies really ran those campaigns. It then proposes 19 new regions to investigate, compares each one with its Moon or Mars target condition by condition, says where the analogy breaks, shows what independent evidence exists for it, and adds logistics and a neutral access-complexity layer. Everything is shown in one 3D scene of the Sun, the Earth, the Moon and Mars, with every source listed.

## Detailed project description

### What it does
- **Pick a mission, not a planet.** Four missions, each taken from real analog campaigns: suited EVA on volcanic terrain (target: Mons Mouton, lunar south pole), rover on sand (Jezero crater, Mars), water from ground ice (Arcadia Planitia, Mars) and low-Sun operations and solar power (Mons Mouton).
- **See where it could be rehearsed.** For each mission the app lists the sites agencies have already used and new regions to investigate, on a 3D globe next to the target world. Site names sit outside the globe, joined by thin dashed lines.
- **Compare one site with its target.** A radial dial shows the analog index in the centre and one ring per condition; below it, the site and the target are compared as 11 × 11 km terrains at the same scale, lit by a Sun whose height you can set. Tabs give the detail: why (each condition against the range the mission needs), shape, when (noon Sun, sunlight and temperature by month), how (campaigns, independent evidence, travel time, access) and limits.
- **Read the evidence first.** Lists are ordered by independent evidence (a real campaign ran there; a source confirms the key property nearby; partial; none found), because the index alone does not tell the new regions apart.
- **Filter by logistics.** Reachable in under 6 hours, remote (over 48 hours), flat or steep ground, low access complexity. None of these changes the index.
- **Know where it breaks.** Every site states what was not scored and what Earth cannot reproduce (gravity, vacuum or thin air, lighting, cold).

### How it works
1. **Missions from real campaigns.** We read what NASA, ESA, JAXA and the Mars Society actually rehearsed (JETT3, JETT5, Desert RATS, BASALT, PANGAEA, Scarecrow at Dumont Dunes, SAFER, ARADS, TRIDENT at Haughton, RESOLVE) and wrote down the surface conditions each task needs.
2. **One index per mission.** Each condition has an ideal range in physical units; similarity is 1 inside the range and falls off smoothly outside it. For every 0.1° land cell (more than 1.4 million per mission): `index = 0.5 · (conditions met) + 0.5 · (closeness to the known analog sites)`.
3. **Validation.** The index is checked against the sites agencies used: suited EVA, 3 of 4 known analogs in the top 2 % of land cells; rover on sand, 3 of 3 in the top 2.1 %; ground ice, 2 of 2 in the top 1 % (a weak test, with only two sites). A negative control (central Amazonia) falls at the 31.2th, 1.5th and 2.8th percentile of land cells.
4. **New regions, screened.** High-scoring cells far from every known analog are grouped into regions and screened on the ground (mean slope, snow and ice, water, in an 11 × 11 km window). Each survivor is then checked against literature and agency sources.
5. **No server, no database.** A Python pipeline (`npm run data`) rebuilds one small JSON file from the public datasets; the web app (Next.js static export, three.js) only reads it.

### What is not validated, said plainly
- The low-Sun mission is **computed, not validated**: no campaign has rehearsed it under a real low Sun (JETT3 and JETT5 simulated it at night in Arizona), so there is no known site to check the index against.
- New regions are a **shortlist to investigate, not surveyed sites**. No source names any of them as an established analog. One region was removed because a geological study contradicts the rock type the mission needs.
- The index compares surface conditions; it is **not a measure of suitability**. Ground ice is inferred from temperature and dryness, not detected; volcanic rock comes from a coarse geological map.
- Access complexity is a team-defined, neutral proxy (governance perception, recorded violence nearby, travel advice from two governments). It is not travel advice and not a judgement of any country.

### Who it is for and why it matters
Crews rehearse surface operations on Earth before they fly, and where a test runs decides what it can teach. Logos gives EVA, rover and drilling field teams a first-pass, sourced shortlist to verify with high-resolution imagery and field checks, and makes the reasons, the evidence and the limits of every suggestion visible.

### Tools and data
- NASA data: MODIS (land surface temperature, NDVI, albedo), GPM IMERG precipitation, NASA POWER (monthly temperature and sunlight), LRO LOLA elevation, NSSDC fact sheets, NASA GIBS / SVS / Trek imagery.
- Other open data: Copernicus DEM, ESA WorldCover, ISRIC SoilGrids, GLiM, HRSC–MOLA Mars DEM, World Bank WGI, UCDP, US and UK travel advice, Natural Earth, OpenStreetMap, Oxford MAP travel time.
- Code: TypeScript, Next.js, React, three.js, Tailwind CSS; Python for the data pipeline. Hosted as a static site on Vercel.

### What is next
- Field or high-resolution checks of the new regions; more known sites per mission to strengthen the validation.
- Terrain shadows and snow cover for the low-Sun mission; the SWIM ice map for Arcadia Planitia.
- More missions from real campaigns that we listed but did not score (caves, landing pads, habitats).

## Suggested 30-second demo (for the team's video; at most 30 s)
1. 0–4 s · Overview: the Sun, the Earth and Mars on their orbits. Caption: "Rehearse the Moon and Mars on Earth."
2. 4–10 s · Choose "Rover on sand": the camera flies to Mars and then to the Earth; site names appear around the globe.
3. 10–16 s · The list: evidence levels and the filters ("Reachable in < 6 h", "Low access complexity").
4. 16–24 s · Open a site: the radial dial, the two terrains side by side, the Sun slider.
5. 24–30 s · "Where it breaks" and "Method & sources". Caption: "Every number has a source."
Use `?capture=1` in the address for screen recording. No NASA logos, no AI-generated images, voice or music without a visible label.
