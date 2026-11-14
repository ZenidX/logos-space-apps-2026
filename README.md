# Logos · NASA Space Apps Challenge 2026

<p align="center"><img src="docs/img/banner.svg" alt="Terra Analog: scanning Earth for places that resemble Moon and Mars base sites" width="100%"></p>

Project of team **Logos** for the NASA Space Apps Challenge 2026 (Barcelona local event, 14-15 November 2026).

**Challenge:** [Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/)

## Terra Analog

A mobile-first web app that searches the whole Earth for places that resemble future Moon and Mars base sites, using NASA data processed in Google Earth Engine. For every place it explains **what is analogous, how much, and where the analogy breaks**.

- **Candidates**: global search over all land (excluding ~25 already-catalogued analog sites), validated against known analogs.
- **Analysis**: per-dimension similarity (Climate, Surface, Relief, Geology, Ice) against a selected target (Shackleton rim, Jezero crater, Arcadia Planitia), and where each Earth variable falls versus the target.
- **Data**: every layer with its raw type, resolution, temporal coverage, global range and Moon/Mars counterpart.
- **Maps**: NASA GIBS (Earth), Moon Trek (LRO WAC) and Mars Trek (MGS MOLA) basemaps.

## How it works

```mermaid
flowchart LR
    A["NASA layers<br/>MODIS · GPM IMERG · ASTER<br/>NASADEM · GMTED2010"] --> B["Google Earth Engine<br/>0.1° global grid, 85°N to 85°S"]
    T["Moon / Mars targets<br/>Diviner · LOLA · TES · MOLA"] --> C
    B --> C["Relative position<br/>inside Earth's p1 to p99 range"]
    C --> D["Similarity per dimension<br/>Climate · Surface · Relief"]
    D --> E["Validate against<br/>25 known analog sites"]
    D --> F["Rank new candidates<br/>known sites excluded"]
    E --> G(["Terra Analog web app"])
    F --> G
```

The Moon and Mars are more extreme than anywhere on Earth, so we don't compare raw values. Each variable becomes a **position inside Earth's own range** (p1 to p99), and similarity is `1 − |pos(site) − pos(target)|`. A target value beyond Earth's real minimum or maximum is flagged as the point **where the analogy breaks**. Full method: [docs/metodo.md](docs/metodo.md).

## Results

<p align="center"><img src="docs/img/validation.svg" alt="Similarity scores of 25 known analog sites versus all Earth land, for Shackleton, Jezero and Arcadia" width="100%"></p>

**Validation.** Most known analog sites (Atacama, McMurdo Dry Valleys, Devon Island, Svalbard…) score above the Earth-wide median for every target, so the scoring points the right way. Few of them reach the top 10 %, which tells us that well-known analogs were chosen for reasons our current layers don't capture yet (geology, ice, logistics).

**Discovery.** The best *uncatalogued* candidates cluster in the **Canadian High Arctic (Nunavut)** and **High Asia (Xinjiang, Karakoram, Pamir)**, scoring 0.84 to 0.89.

<sub>Chart generated from `src/data/ee-global.json` with `node scripts/readme/make-charts.mjs`.</sub>

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
- [Valor añadido y modelo de impacto](docs/valor-anadido.md): business case, storytelling, dual-engine solution and ROI
- [Datos](docs/datos.md): layers, types, resolutions, ranges and samples
- [Método](docs/metodo.md): how similarity is computed
- [Normas](docs/normas.md): challenge rules that affect us
- [Benchmark de retos](docs/benchmark-retos.md): all 2026 challenges, competition and differentiation ideas

## Data and attribution

- **NASA**: MODIS (MOD11A2, MOD13A2, MOD13C1, MCD43A3, MCD43C3, MOD10A1), GPM IMERG, ASTER GED, NASADEM, GIBS, Moon Trek (LRO WAC), Mars Trek (MGS MOLA). Moon/Mars reference values from LRO Diviner/LOLA, MGS TES/MOLA and Perseverance MEDA (approximate, see `src/data/targets.ts`).
- **ESA**: Copernicus DEM GLO-30.
- **USGS**: GMTED2010 (global slope).
- Earth layers accessed through Google Earth Engine (non-commercial project `terra-analog`).
