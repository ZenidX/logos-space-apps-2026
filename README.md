# Logos · Mission Analogs

**NASA Space Apps Challenge 2026** · Challenge: *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars* · Team **Logos**.

> Work in progress (14–15 November 2026).

## Idea
Instead of asking "which place on Earth looks like the Moon?", we ask **"where on Earth can we rehearse this specific mission?"** — driving robots or testing suits on sand and regolith-like ground, building a base, operating solar panels under the target's sun angle, extracting water from ice — and we add a neutral **access risk** layer (can a team actually work there?).

The idea is our team's own. See [Use of AI](#use-of-ai).

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # globe, scene and arc tests
npm run build   # static export to out/
```

## Use of AI
The idea and the approach of this project are entirely our team's own: finding Earth analog sites **per mission** and weighing each one by its **geopolitical access risk**. No AI tool was used to come up with the idea, the problem framing or the solution design.

We used AI (Claude agents by Anthropic, via Claude Code) only as a tool, for three tasks:
- **Code:** writing and debugging parts of the web app and the data-processing scripts.
- **Data search:** finding and summarising public datasets and their licenses. Every dataset we kept was checked by the team at its original source.
- **Writing:** drafting and editing documentation and texts in English.

The team reviewed, tested and approved every AI-assisted output. AI-assisted code and data files are listed in [`AI_USAGE.md`](AI_USAGE.md) and marked in their headers and metadata. We did not use AI to generate images or video. No AI-generated content contains NASA logos, insignia or other NASA marks.

## Data and credits
- Earth: NASA Blue Marble via NASA GIBS.
- Moon: LROC WAC mosaic, CGI Moon Kit, NASA's Scientific Visualization Studio (NASA/GSFC/Arizona State University).
- Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek.
- Software: three.js (MIT), Next.js (MIT, © Vercel, Inc.), React (MIT, © Meta Platforms, Inc.), Tailwind CSS (MIT).
- The 3D globe code is reused from our team's earlier prototype during this same hackathon.
- Missions: real analog field campaigns by NASA and ESA (links in the app and in `docs/misiones.md`).
- Earth data: NASA MODIS (MOD11A2, MOD13C1, MCD43C3), NASA GPM IMERG, ISRIC SoilGrids 2.0, GLiM; access layer: World Bank WGI, UCDP GED, US and UK travel advice, Natural Earth, WDPCA (flag only). Full list and licences in the app («Method & sources») and `docs/method.md`, `docs/licencias-geopolitica.md`.
- Front design proposal «Orbit» by the team's design agent; fonts Space Grotesk, IBM Plex Sans, JetBrains Mono (SIL OFL 1.1).

This project is not endorsed by NASA.
