# Super Intelligence (SI) / AI usage log

AI tool: Claude agents (Anthropic), via Claude Code. Used only as a tool; the idea and approach are the team's own (see `docs/idea-origin.md`).
Every file below was reviewed by team Logos. AI-assisted source files carry the header `// AI-assisted (Claude), reviewed by team Logos`; generated JSON data carries `"generatedWith": "AI-assisted (Claude), reviewed by team Logos"`.

| Path | What the AI did |
|---|---|
| `src/lib/globe-math.ts`, `src/lib/globe-math.test.mjs`, `src/lib/globe-tex.ts` | Code written with AI assistance in the team's earlier prototype, reused here |
| `src/app/*`, `src/components/SitePanel.tsx`, `src/components/MethodSheet.tsx`, `src/lib/missions.ts` | Pages, panels and mission model |
| `src/components/Orrery.tsx`, `src/lib/arcs.ts`, `src/lib/orrery-math.ts` (+ tests) | 3D scene with three globes and arcs, written with AI assistance from the team's design proposal «Orbit» |
| `src/data/sites.json` | Data prepared with AI-assisted scripts from public datasets (NASA MODIS, GPM, SoilGrids, GLiM, WGI, UCDP…); has `generatedWith` |
| `scripts/data/*` | Data pipeline scripts (Python), written with AI assistance; each carries the header |
| `next.config.ts`, `package.json`, `vercel.json` | Project configuration |
| `README.md`, `docs/*` (incl. `method.md`, `missions.md`, `sources.md`; Spanish working notes in `docs/es/`) | Research summaries and drafting of texts |
| `public/tex/*.jpg` | Not AI-generated: NASA imagery, only resized and recompressed |
