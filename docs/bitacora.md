# Bitácora del proyecto

Registro cronológico de lo que se ha hecho. Lo más reciente, arriba.

## 2026-11-14 (sábado, día 1 del hackathon)

### Paso al repo del equipo
- El código pasa de la carpeta local `terra-analog` al repo del equipo `ZenidX/logos-space-apps-2026` (rama `main`). README actualizado al reto de los análogos (el anterior mencionaba «Junior Astronaut Mission Trainer»).
- El benchmark de retos se incluye como `docs/benchmark-retos.md`.

### Búsqueda global de nuevos análogos (en curso)
- Objetivo: puntuar toda la tierra firme contra Shackleton, Jezero y Arcadia, excluir 25 análogos ya catalogados (radio 300 km) y validar dónde caen los conocidos.
- Pestaña nueva **«Candidatos»** en la web (`src/components/CandidatesTab.tsx`): validación, mapa y ranking con desglose por dimensión. Lee `src/data/ee-global.json`.
- Problemas que encontramos en Earth Engine y cómo los resolvimos:
  1. `03_busqueda_global.js`: «Object too large (129 MB)». Causa: el **mosaico global de Copernicus DEM** (26 076 teselas). Para la pendiente global se usa **GMTED2010** (USGS), que es una sola imagen.
  2. Ordenar todo el planeta para tres objetivos a la vez era demasiado. Ahora solo se muestrean las celdas por encima del p99 y se hace una evaluación por objetivo.
  3. `MODIS/061/MOD11C3` y `MOD13C2` **no existen** en el catálogo de Earth Engine. Sí existen `MOD13C1` (NDVI 0,05°) y `MCD43C3` (albedo 0,05°).
  4. El modo interactivo se colgaba más de 5 minutos, probablemente por el `clip` con 25 buffers unidos y por el cálculo anual global. **Solución:** exportar las variables una vez a un asset (`05_export_features.js`, en batch y sin límite de tiempo, 0,1° ≈ 11 km) y puntuar sobre el asset (`06_puntuar_asset.js`), excluyendo con `paint` en vez de `clip`.
- Asset: `projects/terra-analog/assets/terra_features_01deg`. Bandas: lst_day, lst_night, lst_max, lst_min, precip, ndvi, albedo, slope, elev.

### Pestaña «Análisis» en la web
- Nueva pestaña por defecto con:
  - Selector de objetivo: Shackleton (Luna), Jezero y Arcadia Planitia (Marte).
  - **Matriz de similitud sitios × dimensiones** (Clima, Superficie, Relieve, Geología, Hielo y agua) contra el objetivo elegido.
  - **«Dónde se rompe la analogía»**: lista de variables en las que el objetivo cae fuera del rango terrestre.
  - **Análisis por variable**: dónde caen los sitios y el objetivo dentro del rango real de la Tierra, y cuánto separa cada variable los análogos conocidos del control.
- Método detallado en [metodo.md](metodo.md).
- Corrección: «fuera de rango» se calcula ahora contra los extremos reales de la Tierra y no contra p1/p99. Antes, la precipitación 0 de la Luna salía como «más extrema que la Tierra».
- Primer resultado (objetivo Shackleton): análogos conocidos 63–78 de total frente a 53 del control (Amazonía). La validación pasa en el total, pero el control saca 89 en Relieve: la pendiente sola no discrimina.
- Pendiente visual: los marcadores se solapan cuando dos sitios tienen valores casi iguales (por ejemplo D y A en temperatura máxima).
- Archivos: `src/components/AnalysisTab.tsx`, `src/lib/analysis.ts`, `src/data/targets.ts`.

### Normas del reto revisadas
- Se pueden usar datos que no sean de NASA. Para optar a premio global hay que usar al menos un dato de NASA y listar todo lo demás. Detalle en [normas.md](normas.md).

### Datos reales cargados desde Google Earth Engine
- Script de inventario (`scripts/ee/01_inventario_capas.js`): tipo de dato, resolución, número de imágenes, fechas y rango global (p1, p50, p99, mín. y máx. a 50 km) de 12 capas.
- Script de muestras (`scripts/ee/02_muestras_sitios.js`): valor de cada capa en 5 sitios, a resolución nativa.
- **Fallo corregido:** con `aggregate_array`, Earth Engine **elimina los valores nulos** y las muestras se desplazaban al sitio equivocado. Ahora se hace un `reduceRegion` por sitio y los nulos se mantienen.
- La pendiente no tiene rango global útil a 50 km (sale casi 0). Se usa un rango fijo de 0–30° y se avisa en la ficha.
- Resultado en `src/data/ee-samples.json`. Detalle de las capas en [datos.md](datos.md).

### Cuenta de Google Earth Engine
- Proyecto de Google Cloud **`terra-analog`** creado y registrado en Earth Engine para **uso no comercial**: plan Comunidad, sin facturación, elegibilidad hasta el 14-05-2028.
- API de Earth Engine activada.
- Prueba en Atacama (Yungay): altitud 961 m, temperatura de superficie diurna media 40,3 °C, NDVI 0,10, pendiente 1,6°.

### Web Next.js (móvil primero)
- `create-next-app` 15 + TypeScript + Tailwind 4 + Leaflet.
- Pestaña **Datos**: una ficha por capa, con equivalencias en la Luna y Marte.
- Pestaña **Mapas**: teselas de NASA sin login. GIBS Blue Marble para la Tierra; Moon Trek LRO WAC y Mars Trek MOLA.
- Manifest PWA (`src/app/manifest.ts`).

### APIs probadas (sin login)
| Fuente | Estado | Uso |
|---|---|---|
| NASA CMR (Earthdata Search API) | 200 JSON | buscar colecciones |
| NASA GIBS WMTS (Worldview) | 200 | mapa base Tierra |
| NASA PDS ODE REST / PDS Registry | 200 JSON | productos Luna/Marte |
| NASA Moon/Mars Trek WMTS | 200 | mapas base Luna/Marte |
| NASA POWER | 200 JSON | clima por punto |
| ORNL MODIS Web Service | 200 JSON | NDVI por punto |
| OpenTopoData (SRTM / Mapzen) | 200 JSON | altitud por punto |
| Copernicus STAC / OData | 200 JSON | catálogo Sentinel |
| ESA Open Science Catalog | 200 | catálogo |
| EODMS (RADARSAT, CSA) | requiere cuenta | — |
| JAXA G-Portal | redirección / requiere cuenta | — |

### Investigación previa
- Benchmark de los 14 retos, la competencia (equipos por reto), los repos de GitHub y los patrones de ganadores: [benchmark-retos.md](benchmark-retos.md).
- El reto elegido tiene unos 997 equipos inscritos (14-11-2026).
