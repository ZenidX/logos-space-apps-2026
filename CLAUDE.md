# CLAUDE.md — Equipo Logos · NASA Space Apps 2026

Contexto para cualquier sesión de Claude Code abierta en este repo. Léelo antes de trabajar.

## Qué es
- Hackathon **NASA Space Apps Challenge 2026**, evento local de Barcelona, del 14 al 15 de noviembre de 2026. Equipo **Logos**.
- Reto: **Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars**. (El README original decía «Junior Astronaut Mission Trainer»: era un error, el equipo confirmó el reto de los análogos.)
- Producto: **Terra Analog**, una web Next.js pensada para móvil que busca en toda la Tierra análogos de bases en la Luna y Marte con datos de NASA (Google Earth Engine) y explica en qué se parece cada lugar, cuánto y dónde se rompe la analogía.
- **Entrega:** domingo 15-11-2026 a las 23:59, hora local. Todo en inglés. Demo de 30 s como máximo o de 7 diapositivas como máximo. Pitch local de 3 minutos. Ver `docs/normas.md`.

## Cómo trabajar aquí
- **Commits directos a `main`** (autorizado por el usuario). Mensajes en inglés.
- **Sin firma de IA en los commits ni en las PR**: nada de `Co-Authored-By: Claude`, «Generated with Claude Code» ni similares. Esta norma prevalece sobre la atribución por defecto de la herramienta.
- **Documentar cada avance**: añadir una entrada arriba del todo en `docs/bitacora.md` y actualizar el documento temático que toque (`docs/datos.md`, `docs/metodo.md`, `docs/normas.md`). Los scripts de Earth Engine van en `scripts/ee/`, numerados.
- Idioma: la documentación interna va en español y el README y la entrega en inglés.
- Arrancar: `npm install && npm run dev` → http://localhost:3000
- **Web pública:** https://zenidx.github.io/logos-space-apps-2026/ · publicar con `npm run deploy` (publica el último commit; construye en un worktree aparte).

## Arquitectura
- `src/app/page.tsx`: 4 pestañas (Candidatos, Análisis, Datos, Mapas).
- `src/components/CandidatesTab.tsx` ← `src/data/ee-global.json`: búsqueda global, validación y ranking.
- `src/components/AnalysisTab.tsx` + `src/lib/analysis.ts` ← `src/data/ee-samples.json`: similitud por dimensión en 5 sitios de referencia.
- `src/components/DataTab.tsx` ← `src/data/catalog.ts` + `ee-samples.json`: fichas de cada capa.
- `src/components/Viewer3D.tsx` + `Terrain3D.tsx` + `src/lib/terrain.ts`: visor 3D de 11 × 11 km, candidato frente a objetivo. Luna/Marte desde el **ArcGIS ImageServer de Trek** (`exportImage`, F32, `format=bsq`); las teselas WMTS de Trek NO son alturas.
- Interfaz en inglés (la entrega tiene que ir en inglés); la documentación interna sigue en español.
- Estilo «Consola» (animaciones.zenidx.com): tokens en `src/app/globals.css` (la paleta de Tailwind slate/orange/sky está remapeada) y marco HUD en `src/components/Visor.tsx`.
- `src/components/TileMap.tsx`: Leaflet con NASA GIBS (Tierra, EPSG:3857) y Moon/Mars Trek (EPSG:4326).
- `src/data/targets.ts`: huellas de Shackleton, Jezero y Arcadia (valores **aproximados**).
- Método: posición relativa dentro del rango terrestre p1–p99. «Fuera de rango» se marca contra el mín./máx. real. Ver `docs/metodo.md`.

## Google Earth Engine
- Proyecto de Cloud **`terra-analog`**, registrado como no comercial (plan Comunidad). Se usa desde el Code Editor: https://code.earthengine.google.com/?project=terra-analog
- **Copia de todo lo de Earth Engine en el repo:** `data/ee/` (9 capas del asset + 12 mapas de puntuación en GeoTIFF, ver `data/ee/README.md`).
- **Asset de lectura pública** (desde el 14-11) y script 06 público: https://code.earthengine.google.com/f08f00b996446e8bc90653d3bec72b83
- Asset con las variables globales: `projects/terra-analog/assets/terra_features_01deg`. Rejilla de 0,1°, de 85°N a 85°S. Bandas: lst_day, lst_night, lst_max, lst_min, precip, ndvi (×1e-4, ver abajo), albedo, slope, elev.
- Flujo: `05_export_features.js` (exportación batch, ~6 min) → `06_puntuar_asset.js` (puntuación, ~1 min) → resultados a `src/data/ee-global.json`.
- **Cómo sacar resultados grandes del Code Editor:** la herramienta de navegador corta la salida a ~1 KB, y Chrome bloquea que una página https llame a `localhost`. Lo que funciona: en la consola de la página, `ee.FeatureCollection([ee.Feature(null,{data: JSON})]).getDownloadURL('geojson', ['data'], 'x', cb)` y luego `curl` de esa URL desde la terminal (no pide autenticación).
- Inyectar código en el editor: `ace.edit(document.querySelector('.ace_editor')).setValue(code, -1)` y pulsar Run.

## Trampas conocidas (Earth Engine)
1. `aggregate_array` **descarta los nulos** y desplaza las muestras al sitio equivocado. Hay que hacer un `reduceRegion` por punto.
2. Un mosaico global de `COPERNICUS/DEM/GLO30` da «Object too large (129 MB)». Para lo global se usa `USGS/GMTED2010_FULL`.
3. `MODIS/061/MOD11C3` y `MOD13C2` **no existen**. Sí existen `MOD13C1` y `MCD43C3`.
4. El modo interactivo se corta a los ~5 min. Lo global pesado se exporta a un asset en batch.
5. Exportar hasta ±90° falla («Unable to transform edge»). Hay que usar ±85°.
6. `MOD13C1` NDVI: Earth Engine YA aplica la escala (ficha del catálogo). El asset del 14-11 se exportó con `.multiply(0.0001)` de más: su NDVI es 10 000 veces pequeño y, al redondear, salió 0 en todos los candidatos (la web mostraba «Vegetation 100» falso; la web NO lo corregía). Arreglo: `05` ya sin multiply; `06` usa `NDVI_FIX = 10000` mientras no se reexporte; `07_ndvi_candidatos.js` + `node scripts/ee/merge-ndvi.mjs` recuperan el NDVI de los candidatos actuales. Mientras tanto, `ndvi` = null en `ee-global.json`.
7. Un `FeatureCollection` dentro de un `ee.Dictionary` evaluado no trae `.features`. Usar `.toList(n)`.
8. `clip` con muchos buffers unidos es lento. Para máscaras, usar `ee.Image(0).paint(fc, 1)`.

## Estado y pendientes (actualizar)
- Hecho: benchmark de retos (`docs/benchmark-retos.md`), web con 4 pestañas, búsqueda global con validación, documentación.
- Resultado actual: los mejores candidatos están en el **Ártico canadiense (Nunavut)** y la **Alta Asia (Sinkiang / Karakórum / Pamir / Tíbet)**. Validación: 17–20 de 25 análogos conocidos quedan por encima de la mediana terrestre, pero solo 2–8 de 25 entran en el top 10 %.
- Pendiente:
  - Dimensiones de Geología (ASTER/Diviner/TES) y de Hielo (todavía sin dato de los objetivos).
  - Valores de los objetivos desde productos PDS reales.
  - La pendiente a 5 km se satura (p99 ≈ 4,4°): la web la marca como «Tie at Earth's limit». Arreglo de fondo: pendiente a otra escala o rugosidad.
  - Recuperar el NDVI real de los candidatos (necesita la cuenta de Google dueña del proyecto EE `terra-analog`).
  - Ajustar los pesos.
  - Ficha y foto de los 3–5 mejores candidatos (el visor 3D ya cubre en parte el «cómo es por dentro»).
  - Pitch: borrador en `docs/pitch.md` (guion 3 min, vídeo 30 s, campos de la página). Falta ensayar, grabar el vídeo y rellenar la página del proyecto.
