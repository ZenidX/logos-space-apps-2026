# Super Intelligence (SI) / AI usage log

AI tool: Claude agents (Anthropic), via Claude Code. Used only as a tool; the idea and approach are the team's own (see `docs/idea-origin.md`).
Every file below was reviewed by team Logos. AI-assisted source files carry the header `// AI-assisted (Claude), reviewed by team Logos`; generated JSON data carries `"generatedWith": "AI-assisted (Claude), reviewed by team Logos"`.

| Path | What the AI did |
|---|---|
| `src/lib/globe-math.ts`, `src/lib/globe-math.test.mjs`, `src/lib/globe-tex.ts` | Code written with AI assistance in the team's earlier prototype, reused here |
| `src/app/*`, `src/components/SitePanel.tsx`, `src/components/MethodSheet.tsx`, `src/lib/missions.ts` | Pages, panels and mission model |
| `src/components/SolarScene.tsx`, `src/lib/solar-math.ts` (+ test), `src/lib/label-layout.ts` (+ test), `src/components/RadialDial.tsx`, `src/lib/radial-data.ts` (+ test) | 3D scene (Sun, Earth and Mars on their orbits; Earth close-up with the target world), the layout of site names with dashed leader lines, and the radial dial, written with AI assistance from the concepts the team chose |
| `src/components/TerrainCompare.tsx`, `src/components/Count.tsx` | 3D terrain comparison and count-up number |
| `src/data/terrain-index.json`, `src/data/site-details.json`, `public/heightmaps/*` | Derived from public elevation and climate data with AI-assisted scripts (`scripts/data/06_terrain.py`, `07_details.py`) |
| `src/data/sites.json` | Data prepared with AI-assisted scripts from public datasets (NASA MODIS, GPM, SoilGrids, GLiM, WGI, UCDP…); has `generatedWith` |
| `scripts/data/*` | Data pipeline scripts (Python), written with AI assistance; each carries the header |
| `next.config.ts`, `package.json`, `vercel.json` | Project configuration |
| `README.md`, `docs/*` (incl. `method.md`, `missions.md`, `sources.md`; Spanish working notes in `docs/es/`) | Research summaries and drafting of texts |
| `public/tex/*.jpg` | Not AI-generated: NASA imagery, only resized and recompressed |
