# HANDOFF · sesión C_0 (datos y puntuación) · Terra Analog

Traspaso para continuar desde otro dispositivo. Estado a **14-11-2026, ~17:30 (hora de Barcelona)**. Complementa a `CLAUDE.md` (contexto general y normas del repo) y a `docs/bitacora.md` (historial detallado).

## Objetivo
NASA Space Apps Challenge 2026, equipo Logos (Barcelona), reto **«Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars»**. Producto: **Terra Analog**, una web Next.js que busca en toda la Tierra análogos de 3 objetivos (Shackleton en la Luna; Jezero y Arcadia Planitia en Marte) con datos de NASA procesados en Google Earth Engine, y explica en qué se parecen, cuánto y dónde se rompe la analogía.
- Web pública: https://zenidx.github.io/logos-space-apps-2026/ (páginas `/`, `/discover/`, `/3d/`, `/method/`, `/data/`).
- Repo: https://github.com/ZenidX/logos-space-apps-2026 (rama `main`, público).
- Entrega: domingo 15-11-2026 a las 23:59, hora local. Normas en `docs/normas.md`.

## Reparto entre sesiones
- **C_0 (este traspaso):** datos, Earth Engine, puntuación y publicación.
- **C_1:** diseño, accesibilidad y textos (`globals.css`, `SiteNav.tsx`, `layout.tsx`, `HowItWorks.tsx`, cabeceras de `page.tsx`, la escena de la portada en `Story.tsx`).
- **C_2:** estrategias de bases y matriz de operaciones (`docs/estrategias-bases.md`, `scripts/ops/`, `src/data/operations.json`).
- Norma del repo: commits directos a `main`, **sin firma de IA**, `git pull` antes de cada commit y entrada en `docs/bitacora.md`.

## Hecho (C_0)
- Benchmark de retos, web Next.js con estilo «Consola», historia al estilo Apple (framer-motion), planetas 3D (three.js), visor 3D de 11 × 11 km (Tierra frente a la Luna o Marte, con datos de NASA Trek y USGS) y web de 5 páginas con estado compartido.
- **Earth Engine (proyecto de Cloud `terra-analog`, no comercial, plan Comunidad, sin facturación):**
  - asset `projects/terra-analog/assets/terra_features_01deg`: variables de MODIS, GPM y GMTED (NDVI guardado ×1e-4);
  - asset `projects/terra-analog/assets/terra_access_01deg`: accesibilidad (Oxford MAP) y fracción urbana (MCD12Q1);
  - los dos son de **lectura pública**. Script de puntuación público en el Code Editor: https://code.earthengine.google.com/f08f00b996446e8bc90653d3bec72b83
- **Puntuación v2 en producción** (`src/data/ee-global.json`): sin clima; total = media de Superficie, Relieve y Accesibilidad; se excluyen las celdas urbanas, las de costa con agua y 25 análogos ya catalogados.
- **Análisis en 3 fases (v3): el código está en `main`, los datos aún no.** `scripts/ee/09_export_atmo.js`, `10_tres_fases.js`, `merge-tres-fases.mjs`. Valores de atmósfera de los objetivos en `src/data/targets.ts`. La interfaz ya acepta los campos v3 y, si faltan, usa la v2.
- **`data/ee/`:** copia de las capas en GeoTIFF, corregida el 14-11 a la rejilla real de 0,1° entre 85°N y 85°S, con sin dato = −9999. Ver `data/ee/README.md`.

## En curso / pendiente (por orden)
1. **Exportación de atmósfera MERRA-2** → asset `projects/terra-analog/assets/terra_atmo_01deg` (bandas `ps_hpa`, `wind_ms`, `qv_gkg`, `dust_aod`; media de 2024). Lanzada desde el Code Editor; estado **RUNNING** desde ~16:50 (hora de Barcelona). Ver el estado en https://code.earthengine.google.com/tasks o en la pestaña *Tasks* del editor.
2. Cuando termine:
   - a. hacer público el asset nuevo (ver «Comandos»);
   - b. publicarlo como GeoTIFF en `data/ee/atmo/{ps_hpa,wind_ms,qv_gkg,dust_aod}.tif`, con la misma rejilla que el resto, y avisar a C_2 para que vuelva a ejecutar `node scripts/ops/score-ops.mjs`;
   - c. ejecutar las 3 fases: `10_tres_fases.js` para cada objetivo. Descargar `shortlist_{t}.geojson` y `known_{t}.geojson` y montar un `meta.json` con los percentiles de forma (`forma_p50/p90/p95/p99`) y los rangos (`ranges`) por objetivo;
   - d. `node scripts/ee/merge-tres-fases.mjs <carpeta> <meta.json>` → regenera `src/data/ee-global.json` (v3);
   - e. revisar los candidatos (que no sean ciudades ni agua) y regenerar el gráfico del README con `node scripts/readme/make-charts.mjs`;
   - f. avisar a **C_1** para ajustar `HowItWorks.tsx` («01 Measure» con presión, viento y polvo; «03 Rank» con los tres filtros) y a **C_2** para volver a ejecutar su matriz con el v3;
   - g. actualizar `README.md`, `docs/metodo.md` (ya tiene la v3), `docs/bitacora.md` y `docs/pitch.md` (las cifras están desactualizadas desde la v2);
   - h. publicar: `npm run deploy`.
3. **Decisiones pendientes del usuario:**
   - el hilo conductor propuesto, «no hay una segunda Luna en la Tierra, pero sí un sitio para ensayar cada paso de la misión»;
   - crear la página `/missions/` con el componente de C_2.

   Al releer el enunciado: pide evitar los análogos ya conocidos, así que cada tarea debe protagonizarla un **sitio nuevo**, con el conocido solo como referencia.
4. **Huecos frente al enunciado:**
   - geología y mineralogía (la emisividad de ASTER está descargada pero no puntúa);
   - procesos (polvo, con MERRA-2);
   - agua, hielo y permafrost como recurso;
   - cuevas y tubos de lava;
   - escala más fina que 11 km.
5. **Entrega (la hace el equipo):** página del proyecto en inglés (borrador en `docs/pitch.md`), apartado sobre el uso de IA redactado por el equipo, vídeo de 30 s o 7 diapositivas como máximo, y «Submit for Judging».

## Decisiones tomadas y por qué
- **Posición relativa dentro del rango terrestre (p1–p99)** en lugar de valores absolutos: la Luna y Marte son más extremos que cualquier lugar de la Tierra. «Fuera de rango» se marca contra el mínimo y el máximo reales.
- **v2 sin clima y con accesibilidad** (decisión del equipo): factibilidad de llevar materiales. Exclusión de zonas urbanas y de agua, porque si no ganaban Lima o el Caspio.
- **v3 en 3 fases** (decisión del equipo): forma geográfica → condicionamiento climático (clima + atmósfera MERRA-2) → accesibilidad al final (también con el deslizador de la web).
- Sitios objetivo elegidos por el equipo: el reto no da lista. Fuentes en el panel «Why this target?» (`src/data/targets.ts`).
- Publicación en GitHub Pages desde un *git worktree* para no romper `npm run dev`.

## Comandos
```bash
git clone https://github.com/ZenidX/logos-space-apps-2026.git && cd logos-space-apps-2026
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # comprobación de tipos
npm run deploy       # publica en GitHub Pages lo que esté commiteado
node scripts/readme/make-charts.mjs                          # gráfico del README desde ee-global.json
node scripts/ee/merge-tres-fases.mjs <carpeta> <meta.json>   # v3 → src/data/ee-global.json
node scripts/ops/score-ops.mjs                               # matriz de operaciones (C_2)
```
**Earth Engine:** abrir https://code.earthengine.google.com/?project=terra-analog con una cuenta que tenga acceso al proyecto, pegar el script de `scripts/ee/` y pulsar *Run*. Las exportaciones aparecen en *Tasks* y hay que pulsar *RUN*.
- Para hacer público un asset, desde la consola de la página del editor: `ee.data.setAssetAcl('<id>', {all_users_can_read: true}, cb)`.
- Para descargar resultados grandes: `getDownloadURL` (GeoTIFF o GeoJSON) y luego `curl` de la URL.
- **Ojo:** para GeoTIFF hay que usar `region` + `dimensions`. Con `crsTransform` + `dimensions`, Earth Engine estira la rejilla a ±90°.
- Más trampas de Earth Engine en `CLAUDE.md`.

## Ficheros clave
| Ruta | Qué es |
|---|---|
| `CLAUDE.md` | contexto, normas del repo y trampas de Earth Engine |
| `docs/bitacora.md` · `docs/metodo.md` · `docs/normas.md` · `docs/pitch.md` · `docs/estrategias-bases.md` | historial, método (v1→v3), normas del reto, pitch, bases y operaciones |
| `src/app/{page,discover,3d,method,data}` | páginas; `layout.tsx` con `SiteNav` y `AppState` |
| `src/components/Story.tsx` | secciones de la historia (cada página pide las suyas) |
| `src/components/CandidatesTab.tsx` · `DataExplorer.tsx` | pestañas técnicas de `/data/` |
| `src/components/Viewer3D.tsx` · `Terrain3D.tsx` · `src/lib/terrain.ts` | visor 3D (AWS Terrain Tiles, Moon/Mars Trek ImageServer, USGS CTX) |
| `src/data/ee-global.json` · `ee-samples.json` · `targets.ts` · `operations.json` | datos de la web |
| `scripts/ee/01…10_*.js` · `merge-tres-fases.mjs` | Earth Engine y unión de fases |
| `data/ee/` | copia GeoTIFF de las capas (ver su README) |

## Privacidad
Este fichero no contiene correos, contraseñas ni tokens. El proyecto de Earth Engine pertenece a la cuenta de Google del usuario. Para trabajar dentro de él desde otra cuenta hay que añadirla en Google Cloud → IAM; para leer los assets públicos no hace falta.
