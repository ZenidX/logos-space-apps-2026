# Logos · NASA Space Apps Challenge 2026

Project of team **Logos** for the NASA Space Apps Challenge 2026 (Barcelona local event, 14-15 November 2026).

**Challenge:** [Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/)

## Terra Analog

A mobile-first web app that searches the whole Earth for places that resemble future Moon and Mars base sites, using NASA data processed in Google Earth Engine. For every place it explains **what is analogous, how much, and where the analogy breaks**.

- **Candidates**: global search over all land (excluding ~25 already-catalogued analog sites), validated against known analogs.
- **Analysis**: per-dimension similarity (Climate, Surface, Relief, Geology, Ice) against a selected target (Shackleton rim, Jezero crater, Arcadia Planitia), and where each Earth variable falls versus the target.
- **Data**: every layer with its raw type, resolution, temporal coverage, global range and Moon/Mars counterpart.
- **Maps**: NASA GIBS (Earth), Moon Trek (LRO WAC) and Mars Trek (MGS MOLA) basemaps.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Repository layout

| Path | Content |
|---|---|
| `src/app/` | Next.js App Router pages and PWA manifest |
| `src/components/` | Tabs: Candidates, Analysis, Data and Maps |
| `src/lib/analysis.ts` | Relative-position similarity scoring |
| `src/data/` | Layer catalog, Moon/Mars target fingerprints and Earth Engine outputs (`ee-*.json`) |
| `scripts/ee/` | Google Earth Engine Code Editor scripts (inventory, samples, global search, asset export, scoring) |
| `docs/` | Project documentation (in Spanish): log, data, method, rules and challenge benchmark |

## Documentation (Spanish)

- [Bitácora](docs/bitacora.md): log of what was done and when
- [Datos](docs/datos.md): layers, types, resolutions, ranges and samples
- [Método](docs/metodo.md): how similarity is computed
- [Normas](docs/normas.md): challenge rules that affect us
- [Benchmark de retos](docs/benchmark-retos.md): all 2026 challenges, competition and differentiation ideas

## Data and attribution

- **NASA**: MODIS (MOD11A2, MOD13A2, MOD13C1, MCD43A3, MCD43C3, MOD10A1), GPM IMERG, ASTER GED, NASADEM, GIBS, Moon Trek (LRO WAC), Mars Trek (MGS MOLA). Moon/Mars reference values from LRO Diviner/LOLA, MGS TES/MOLA and Perseverance MEDA (approximate, see `src/data/targets.ts`).
- **ESA**: Copernicus DEM GLO-30.
- **USGS**: GMTED2010 (global slope).
- Earth layers accessed through Google Earth Engine (non-commercial project `terra-analog`).
