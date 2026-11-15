# Super Intelligence (SI) / AI usage log

AI tool: Claude agents (Anthropic), via Claude Code. Used only as a tool; the idea and approach are the team's own (see `docs/idea-origin.md`).
Files are reviewed by team Logos before submission; files still marked "to be reviewed" in their header have not been reviewed yet. AI-assisted source files carry the header `// AI-assisted (Claude), reviewed by team Logos`; generated JSON data carries `"generatedWith": "AI-assisted (Claude), reviewed by team Logos"`.

| Path | What the AI did |
|---|---|
| `src/lib/globe-math.ts`, `src/lib/globe-math.test.mjs`, `src/lib/globe-tex.ts` | Code written with AI assistance in the team's earlier prototype, reused here |
| `src/app/*`, `src/components/*` (site panel, method sheet, evidence badge, condition strip, locator map, mission preview…), `src/lib/*` (mission model, rules) | Pages, panels, mission model and rule checks |
| `docs/independent-check*.md`, `docs/region-screening.*` | Literature check of each new region and ground screening, done by AI agents with the sources listed; verdicts reviewed by the team |
| `src/components/SolarScene.tsx`, `src/lib/solar-math.ts` (+ test), `src/lib/label-layout.ts` (+ test), `src/components/RadialDial.tsx`, `src/lib/radial-data.ts` (+ test) | 3D scene (Sun, Earth and Mars on their orbits; Earth close-up with the target world), the layout of site names with dashed leader lines, and the radial dial, written with AI assistance from the concepts the team chose |
| `src/components/TerrainCompare.tsx`, `src/components/Count.tsx` | 3D terrain comparison and count-up number |
| `src/data/terrain-index.json`, `src/data/site-details.json`, `public/heightmaps/*` | Derived from public elevation and climate data with AI-assisted scripts (`scripts/data/06_terrain.py`, `07_details.py`) |
| `src/data/sites.json` | Data prepared with AI-assisted scripts from public datasets (NASA MODIS, GPM, SoilGrids, GLiM, WGI, UCDP…); has `generatedWith` |
| `scripts/data/*` | Data pipeline scripts (Python), written with AI assistance; each carries the header |
| `next.config.ts`, `package.json`, `vercel.json` | Project configuration |
| `README.md`, `docs/*` (incl. `method.md`, `missions.md`, `sources.md`; the Spanish idea note in `docs/es/`) | Research summaries and drafting of texts |
| `public/tex/*.jpg` | Not AI-generated: NASA imagery, only resized and recompressed |
