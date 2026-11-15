# Traspaso · sesión C_2 (Terra Analog, NASA Space Apps 2026)

Para continuar desde otro dispositivo. Contexto general del proyecto: `CLAUDE.md` y `docs/bitacora.md`.
Estado a fecha de 2026-11-14, noche (segundo bloque, tras reanudar). Commits de esta sesión en `main`: `2210d6f` (matriz), `eea1eca` (traspaso) y el de «sitios nuevos + MERRA-2».

## Objetivo de esta sesión
1. Poner gráficos y animaciones en el README (petición del usuario).
2. Encargo del usuario vía C_0: **estrategias de base** para Shackleton, Jezero y Arcadia, y una **matriz reproducible de operaciones análogas**. Cada ensayo se hace en el sitio de la Tierra que cumple las condiciones de **esa** tarea, que no tiene por qué ser el mismo para todas.

## Hecho
- **README visual.** Archivos:
  - `docs/img/banner.svg`: banner animado con CSS en el SVG; respeta `prefers-reduced-motion`.
  - `docs/img/validation.svg`: gráfico de validación generado con `scripts/readme/make-charts.mjs` a partir de `src/data/ee-global.json`.

  Además, diagrama Mermaid del flujo. Comprobado el 14-11 por la noche: el README sigue enlazando las dos imágenes.
- **`docs/estrategias-bases.md`.** Contiene:
  - una base por objetivo (ubicación, energía, recursos, comunicaciones, terreno y riesgos), con fuentes y las suposiciones o aproximaciones marcadas;
  - la matriz de operaciones (§5, generada);
  - el plan de ensayos por base;
  - lo que ninguna parte de la Tierra puede simular;
  - huecos de datos y fuentes.
- **Matriz de operaciones (11 tareas), calculada en toda la rejilla de 0,1°.** Ficheros:
  - `scripts/ops/tasks.mjs`: criterios de cada tarea como funciones de deseabilidad `lo`, `hi` y `band` sobre nuestras variables;
  - `scripts/ops/score-ops.mjs`: puntúa la rejilla, escribe `src/data/operations.json` y rellena la tabla del documento entre `<!-- ops:start -->` y `<!-- ops:end -->`;
  - `scripts/ops/geotiff.mjs`: lector de los GeoTIFF de `data/ee/` sin dependencias (float32, tiles, deflate; usa la georreferencia del fichero);
  - `scripts/ops/geocode-cache.json`: caché de nombres de lugar (OpenStreetMap Nominatim; solo coordenadas).
- **Solo sitios nuevos** (segundo bloque). El enunciado pide evitar los análogos conocidos, así que ninguna celda a ≤ 300 km de los 25 catalogados puede protagonizar una tarea. El mejor catalogado sale aparte como `reference`.
- **MERRA-2 en uso** (`data/ee/atmo/`): `operations.json → proxies` está vacío. Umbrales de polvo y viento por posición dentro del rango terrestre.
- **NDVI recalibrado:** «suelo desnudo» es NDVI ≤ ~0,12 (el hiperárido da p50 0,10). Antes, Atacama puntuaba 0 en astrobiología; ahora, 0,92.
- **Nombres de lugar:** solo en alfabeto latino; «Western Sahara» al sur de 27,67°N (territorio en disputa).
- **Hallazgo:** con la v2 de `ee-global.json`, ninguno de los 15 mejores candidatos llega a 0,8 en ninguna tarea. Con la v3 (`5ae7a4a`), llegan 3 de 15 (Kapisa en EVA; Sinkiang y Maidan Wardak en travesías). Parecerse en conjunto y servir para ensayar siguen siendo dos preguntas distintas. Puede servir para el pitch.
- **Fallo detectado en los GeoTIFF de `data/ee/`:** la rejilla estaba estirada a ±90°. Se avisó a C_0, que lo corrigió en `484e9b5`. Ahora todas las capas usan la rejilla real: 3600 × 1700, origen (−180, 85), celdas de 0,1°, sin dato = −9999 y NDVI ya corregido.

## Decisiones y por qué
- **Sitios sacados de toda la rejilla, no solo de los 60 candidatos.** Lo eligió el usuario: así se cumple de verdad «el mejor sitio para cada tarea».
- **Media geométrica ponderada de los criterios.** Si una condición vale 0, descarta el sitio, porque no se puede ensayar sin ella.
- **En un empate, gana el sitio más accesible.** Muchas notas se saturan en 1 y la misma simulación sale más barata cerca de una ciudad.
- **5 sitios «ideales» más 3 «accesibles» (≤ 6 h), separados ≥ 300 km.** Ensayo en dos fases: primero barato y frecuente, después una campaña completa.
- **Presión, viento y polvo de MERRA-2.** Si faltan las capas, la presión se estima desde la altitud y los criterios de polvo y viento se omiten.
- **Umbrales por posición dentro del rango terrestre** (como `docs/metodo.md`), no por el valor marciano: la τ ≈ 0,5 de Marte es el máximo de la Tierra.
- **Exclusión de 300 km alrededor de los análogos catalogados**, la misma regla y lista (`KNOWN` de `scripts/ee/10_tres_fases.js`) que la búsqueda global.
- **Lector de GeoTIFF propio**, para no tocar el `package.json` compartido; en esta máquina no hay numpy ni rasterio.
- **NDVI:** el script detecta por el rango si la capa ya viene corregida.
- **Compromisos de reparto de trabajo** (para no pisar a otras sesiones):
  - no editar `ee-global.json`, `CandidatesTab.tsx`, `Story.tsx` ni `scripts/ee/` (son de C_0);
  - no editar `globals.css`, `SiteNav` ni `layout` (son de C_1).
- **Commits:** directos a `main`, en inglés, **sin firma de IA** (norma de `CLAUDE.md`) y con pull antes de cada commit.

## Falta
1. ~~MERRA-2~~: hecho.
2. ~~Recalcular con la v3~~: hecho; `operations.json` está calculado con la v3 de `5ae7a4a`. Si `ee-global.json` vuelve a cambiar, hay que volver a lanzar el script y revisar el párrafo «Hallazgo» del documento.
3. **Vista web, solo propuesta:** un `src/components/OperationsMatrix.tsx` nuevo con tarjetas por tarea, chips de «sitio ideal» y «sitio accesible» que centran el globo, y un selector «parecido en conjunto / dónde ensayar». Esperando el visto bueno de C_0 y C_1.
4. **Capas que faltan:** permafrost (ESA CCI, Obu et al. 2019), litología (ASTER GED) y lagos secos (GLWD). Sustituirían aproximaciones de `permafrost_drill`, `regolith_build` y `astrobio`.
5. **Comprobar en imagen** los sitios con nota 1 que salen junto a ciudades (Riad, El Cairo, La Meca…), porque el desempate favorece la accesibilidad, y la costa del mar Rojo y Hormozgán en construcción con regolito.
6. **Sol rasante:** hoy solo usa la latitud. Un modelo de horizonte sobre el DEM lo haría real.

## Comandos
```bash
git pull --ff-only
node scripts/ops/score-ops.mjs              # matriz → src/data/operations.json + tabla del §5 del documento (~10 s + geocodificación)
node scripts/ops/score-ops.mjs --no-geocode # sin red (usa la caché de nombres)
node scripts/readme/make-charts.mjs         # gráfico de validación del README
npm install && npm run dev                  # web en local, http://localhost:3000
```
La salida del script tiene que decir «error medio de altitud frente a ee-global: 0 m». Si sale más de 200 m, avisa de que la georreferencia de `data/ee/` no cuadra.

## Ficheros clave
| Ruta | Qué es |
|---|---|
| `docs/estrategias-bases.md` | Documento principal de esta sesión |
| `scripts/ops/tasks.mjs` | Criterios de cada tarea (aquí se cambian las reglas) |
| `scripts/ops/score-ops.mjs` | Cálculo y generación de la tabla |
| `scripts/ops/geotiff.mjs` | Lector de GeoTIFF |
| `src/data/operations.json` | Resultado (pensado para la web) |
| `docs/img/banner.svg`, `docs/img/validation.svg`, `scripts/readme/make-charts.mjs` | Gráficos del README |
| `data/ee/` | Capas globales (de C_0), formato en `data/ee/README.md` |
| `src/data/targets.ts` | Por qué se eligió cada objetivo y sus valores aproximados |
