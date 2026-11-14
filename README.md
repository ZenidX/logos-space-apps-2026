# Logos · Mission Analogs

**NASA Space Apps Challenge 2026** · Challenge: *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars* · Team **Logos**.

> Work in progress (14–15 November 2026).

## Idea
Instead of asking "which place on Earth looks like the Moon?", we ask **"where on Earth can we rehearse this specific mission?"** — and we add a neutral **access complexity** layer (how much coordination would a field team need to work there?).

The prototype covers three missions, each taken from real analog field campaigns: a suited EVA on bare volcanic terrain (target: Mons Mouton, a lunar south-pole region NASA listed among its Artemis III landing candidates in 2024), rover driving on loose sand (target: Jezero crater) and drilling shallow ground ice for water (target: Arcadia Planitia). For each one it proposes new regions on Earth to investigate, shows how they compare with the target condition by condition, and states where the analogy breaks. The Sun angle is shown for the lunar mission because low-Sun lighting drives south-pole operations.

The idea is our team's own. See [Use of SI / AI](#use-of-super-intelligence-si--ai).

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # globe, scene and arc tests
npm run build   # static export to out/
npm run test:data                       # index formula: hand-computed cases + every published site
LOGOS_IN=/path/to/inputs npm run data   # rebuild src/data/sites.json from the public datasets (Python; see scripts/data/README.md)
```

## How it works (no server, no database)
- `scripts/data/` (Python) scores every 0.1° land cell on Earth for each mission from public datasets and writes one small file, `src/data/sites.json`. Inputs, versions, checksums and commands are in `scripts/data/README.md`; the method is in `docs/method.md`; every claim and its source is in `docs/sources.md`.
- The web app (Next.js static export + three.js) only reads that file. One WebGL scene shows Earth, Moon and Mars; arcs link each target to its Earth regions.
- Deep links: `?m=m1-eva-basalt`, `?m=m2-rover-sand`, `?m=m3-ground-ice`. Add `capture=1` for screen recording.

## Use of Super Intelligence (SI) / AI
The idea and the approach of this project are our team's own: finding Earth analog sites **per mission** and adding an **access-complexity index** — a team-defined coordination proxy shown next to each site, not part of the analog index and not a feasibility or safety assessment. No AI tool was used to come up with the idea or the problem framing.

We used AI (Claude agents by Anthropic, via Claude Code) as a tool, under the team's direction, for:
- **Code:** writing and debugging the web app and the data-processing scripts.
- **Data search:** finding and summarising field campaigns, public datasets and their licences. Source and licence checks, including unresolved items, are tracked in `docs/sources.md`.
- **Method drafting:** the scoring formula, thresholds and weights were drafted with AI assistance from the team's idea; they are documented as team choices in `docs/method.md`.
- **Design and writing:** a front-end design proposal, and drafting and editing documentation and texts in English.

AI-assisted outputs are reviewed by the team before submission. AI-assisted code and data files are listed in [`AI_USAGE.md`](AI_USAGE.md) and marked in their headers and metadata. We did not use AI to generate images or video. No AI-generated content contains NASA logos, insignia or other NASA marks.

## Data and credits
- Earth: NASA Blue Marble via NASA GIBS.
- Moon: LROC WAC mosaic, CGI Moon Kit, NASA's Scientific Visualization Studio (NASA/GSFC/Arizona State University).
- Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek.
- Software: three.js (MIT), Next.js (MIT, © Vercel, Inc.), React (MIT, © Meta Platforms, Inc.), Tailwind CSS (MIT).
- The 3D globe code is reused from our team's earlier prototype during this same hackathon.
- Missions: real analog field campaigns by NASA, ESA and the Mars Society (links in the app and in `docs/missions.md`).
- Earth data: NASA MODIS (MOD11A2, MOD13C1, MCD43C3), NASA GPM IMERG, ISRIC SoilGrids 2.0, GLiM; access layer: World Bank WGI, UCDP GED, US and UK travel advice, Natural Earth. Full list and licences in the app («Method & sources») and `docs/method.md` and `docs/sources.md`.
- Place names: Natural Earth (public domain) and © OpenStreetMap contributors (ODbL, openstreetmap.org/copyright). Target constants: NASA NSSDC Moon, Mars and Earth fact sheets (D. R. Williams, NASA GSFC). Volcanic rock: GLiM, Hartmann & Moosdorf 2012, doi:10.1594/PANGAEA.788537 (CC BY 3.0, creativecommons.org/licenses/by/3.0/; modified: basic-volcanic class aggregated in a 3×3 window).
- Front-end design proposal «Orbit» drafted with AI assistance; fonts Instrument Serif, Instrument Sans, Geist Mono (SIL OFL 1.1).

## Licence
Code: MIT (see `LICENSE`). Third-party data and imagery keep their own licences (see `docs/sources.md`).

This project is not endorsed by NASA.
