# Bitácora del proyecto

Registro cronológico de lo que se ha hecho. Lo más reciente, arriba.

## 2026-11-14 (noche, 3) · Visor 3D: escalones falsos en el terreno de la Tierra (Jefe)

zexu vio en su navegador líneas negras con escalones en Nunavut (81,25°N 78,15°W): pendiente máxima 74° con media de 6°. Causa: las teselas terrarium guardan la altura repartida en R, G y B; al encogerlas con `drawImage`, su navegador mezclaba píxeles vecinos (depende de la GPU; Chromium sin GPU no lo reproducía) y salían saltos de 256 m justo en las curvas de nivel de 256, 512 y 768 m. Las teselas descargadas no tienen ningún salto (comprobado).
Arreglo: `terrariumHeights` pinta las teselas a tamaño real, las pasa a metros y remuestrea con bilineal sobre las alturas, nunca sobre los colores. Mismo punto: relieve 787 m, pendiente media 3,8°, máxima 34°.

## 2026-11-14 (noche, 2) · Visor 3D comparable (Jefe, rama `fix/visor-3d-comparable`)

zexu: «los modelos 3D de la Tierra no se parecen a los de la Luna o Marte». Causa: tres fallos de pintado, no del método.
1. **La Tierra no cargaba en el Ártico.** Con zoom fijo (DEM z12, foto z14), cerca del polo las teselas Mercator encogen: a 82,5°N la foto pedía ~1.300 teselas y el visor se quedaba en «Loading elevation…». Ahora el zoom se calcula por latitud (`zoomFor`): DEM a la resolución de la malla y foto a ~11 m/px (≤ ~25 teselas). Cada tesela tiene 15 s de tiempo máximo.
2. **Materiales distintos.** Tierra con foto en color y Luna/Marte con sombreado pintado desde el NO, que contradecía al Sol del visor (SE). Ahora los dos usan el mismo material neutro (`reliefTexture`, sin sombras pintadas) y la luz del visor proyecta sombras reales (shadow map). La foto de satélite de la Tierra queda como opción: «Earth satellite photo».
3. **Rayas en la Luna.** Trek se pide con interpolación bilineal y al doble de resolución, promediando 2×2. Quedan algunas trazas diagonales del propio DEM de LOLA.
4. La etiqueta «Mesh ≈ m/px» muestra la resolución de la malla dibujada en los dos lados (57 m/px), no la del dato original.

Lo que NO cambia, y es una decisión de método: la puntuación compara clima, superficie y pendiente media a 5 km, no la forma exacta. Un candidato puede parecerse en esos números y tener otra forma (meseta con valles frente a la pared de un cráter).
Comprobado con capturas en Chromium headless (Sol a 25° y a 1,5°), lint y build sin errores.

## 2026-11-14 (noche) · Cambios de la revisión de Crítico (Space Apps, rama `fix/auditoria-jefe`, sin push)

1. «Differs in» solo muestra variables con similitud < 70 %; si no hay ninguna, no sale la línea.
2. `06` y `07`: el factor del NDVI se decide por magnitud (p99 < 0,01 → ×10000, si no ×1) y se imprime; `merge-ndvi.mjs` rechaza NDVI fuera de [−0,2, 1] antes de escribir.
3. Pitch y README: «all land between 85°N and 85°S» en vez de «whole Earth»; «We built an open tool…» en vez de «There is no open tool…»; «a first plausibility check» en vez de «we checked it works».
Pendiente: ejecutar `07` + merge (falta iniciar sesión con la cuenta dueña de `terra-analog`; zexu inicia sesión).

## 2026-11-14 (tarde, 3) · Auditoría y arreglos (Jefe, rama `fix/auditoria-jefe`, sin push)

Revisión completa del repo comprobada en la web (página oficial del reto, web publicada, catálogo de Earth Engine, nasa.gov). Fallos encontrados y qué se ha hecho:

1. **NDVI escalado dos veces.** La ficha de `MODIS/061/MOD13C1` en Earth Engine dice que la escala ya viene aplicada; `05` multiplicaba por 0,0001 otra vez. Los 59 candidatos guardaban NDVI = 0 y la web decía «Vegetation 100» en todos. Lo de «la web lo corrige» era falso: no había código que lo hiciera. **Arreglo:** el NDVI de los candidatos pasa a `null` (se muestra «—»); `05` sin multiply; `06` con `NDVI_FIX`; scripts nuevos `07_ndvi_candidatos.js` y `merge-ndvi.mjs` para recuperar el valor real (pendiente: la cuenta de Google del navegador no tiene acceso al proyecto `terra-analog`). La puntuación no cambia.
2. **Pendiente saturada.** A 5 km, el p99 de la Tierra es 4,4° y Shackleton tiene 8°: cualquier montaña sacaba Relieve 100. **Arreglo:** si el sitio y el objetivo superan los dos el p99, la web ya no lo cuenta como «Similar in» y lo muestra como «Tie at Earth's limit».
3. **Pitch.** El ensayo nocturno en Arizona fue JETT5, en **mayo de 2024**, no en 2022 ([NASA](https://www.nasa.gov/image-article/a-moonlit-moonwalk/)). Fuera «nobody has searched the whole planet» (no se puede demostrar). Se dice que Death Valley y Mauna Kea también entran en el top 10 % de Shackleton. Campo «NASA Data» separado entre lo que se usa en la búsqueda global y lo que se usa solo en otras pestañas.
4. **Interfaz en inglés** (la entrega exige inglés). Nombres de lugares y de análogos en inglés.
5. **HI-SEAS** está en Mauna Loa, no en Mauna Kea: la etiqueta pasa a «Hawaii · Mauna Kea / Mauna Loa (HI-SEAS)».
6. **`06`: nombres y notas de los análogos conocidos** se emparejaban por posición con `aggregate_array` (que descarta nulos). Ahora van juntos con `toList`.
7. README: Geología e Hielo ya no aparecen como puntuadas (no tienen valor del objetivo) y hay una sección «Known limitations».

## 2026-11-14 (tarde, 2)

### Web publicada, estilo «Consola» y visor 3D
- **Web pública:** https://zenidx.github.io/logos-space-apps-2026/ (GitHub Pages, rama `gh-pages`). Para publicar: `npm run deploy`. El script construye en un *git worktree* aparte, así que publica **lo commiteado** y no rompe `npm run dev`. Antes, el `next build` pisaba la carpeta `.next` del servidor de desarrollo y daba un error 500.
- La descripción y el enlace web del repo en GitHub ya apuntan al reto de los análogos y a la web publicada.
- **Rediseño** con la propuesta «Consola» de animaciones.zenidx.com, elegida como la más «control de misión NASA»:
  - Paleta azul noche y cian; tipografías Space Grotesk, IBM Plex Sans y JetBrains Mono.
  - Esquinas cortadas, rótulos `[01] ———` y visor con escuadras, retícula, viñeta y textos HUD.
  - Glitch al cambiar de objetivo, raíl numerado de pestañas y reloj UTC.
  - Componente `src/components/Visor.tsx`. La paleta de Tailwind se remapea en `globals.css`.
- **Visor 3D** (botón «Ver en 3D» en cada candidato): compara 11 × 11 km del candidato con 11 × 11 km del objetivo, a la misma escala.
  - Tierra: AWS Terrain Tiles (SRTM, NASADEM, ArcticDEM) con imagen Sentinel-2 cloudless de EOX. Si no hay imagen (por encima de ~80°N a zoom 14), prueba zoom 11 y, si tampoco, usa sombreado del relieve.
  - Luna: LOLA polo sur 5 m (Moon Trek ImageServer, `exportImage` en Float32). Las teselas WMTS de Trek son imágenes de 8 bits y **no** sirven como alturas.
  - Marte: Jezero con CTX DTM de 20 m de USGS, leyendo solo las filas necesarias con Range; Arcadia con la mezcla HRSC+MOLA (~200 m).
  - Controles de altura del Sol (preajuste del polo sur lunar a 1,5°) y de exageración vertical. Muestra desnivel, pendiente media y pendiente máxima.
  - Primeras cifras (11 × 11 km): Ellesmere #1 tiene 1.268 m de desnivel y 15,9° de pendiente media; Karakórum #2, 2.263 m y 30,8°; Shackleton, 3.014 m y 22,4°.
  - Archivos: `src/lib/terrain.ts`, `src/lib/targetTerrain.ts`, `src/components/Terrain3D.tsx` y `Viewer3D.tsx`.

## 2026-11-14 (tarde)

### README con animaciones y gráficos
- Banner animado en `docs/img/banner.svg`: la Tierra con un haz que la escanea y trayectorias hacia la Luna y Marte. Es SVG con CSS, así que GitHub lo anima. Respeta `prefers-reduced-motion`.
- Gráfico de validación en `docs/img/validation.svg`: los 25 análogos conocidos frente a la mediana y el top 10 % de la Tierra en cada objetivo, junto al mejor candidato nuevo. Se adapta al modo claro y al oscuro y cada punto muestra su nombre al pasar el ratón.
- El gráfico se genera desde `src/data/ee-global.json` con `node scripts/readme/make-charts.mjs`. **Hay que volver a lanzarlo cada vez que cambie la puntuación.**
- Diagrama Mermaid del flujo de datos y nuevas secciones «How it works» y «Results» en el README.

### Explicación por candidato y pitch
- Cada candidato muestra las 3 variables en las que más se parece al objetivo, las 2 en las que más se aleja y las que **ninguna parte de la Tierra** puede igualar. Estas últimas se calculan contra los extremos reales de la Tierra: así una lluvia de 0 o la pendiente a 5 km ya no salen como inalcanzables por error. También lleva un enlace a NASA Worldview.
- El mapa negro de Candidatos no se reproduce: era la primera compilación del servidor de desarrollo.
- Nuevo [pitch.md](pitch.md): guion de 3 minutos en inglés, guion del vídeo de 30 s, borrador de los campos de la página del proyecto y riesgos.

## 2026-11-14 (sábado, día 1 del hackathon)

### Paso al repo del equipo
- El código pasa de la carpeta local `terra-analog` al repo del equipo `ZenidX/logos-space-apps-2026` (rama `main`). README actualizado al reto de los análogos (el anterior mencionaba «Junior Astronaut Mission Trainer»).
- El benchmark de retos se incluye como `docs/benchmark-retos.md`.

### Resultados de la búsqueda global
- Exportación del asset `terra_features_01deg` terminada (≈6 min en batch). La puntuación sobre el asset tarda ≈1 min.
- Los resultados se descargan con `getDownloadURL` + `curl` (ver CLAUDE.md) y se guardan en `src/data/ee-global.json`. Los nombres de lugar salen de geocodificación inversa con OpenStreetMap Nominatim.
- **Validación** (25 análogos conocidos frente a la distribución de toda la Tierra):

| Objetivo | Mediana / p90 / p99 de la Tierra | Conocidos ≥ mediana | Conocidos en el top 10 % |
|---|---|---|---|
| Shackleton | 0,43 / 0,55 / 0,71 | 17/25 | 6/25 |
| Jezero | 0,55 / 0,65 / 0,79 | 20/25 | 8/25 |
| Arcadia | 0,64 / 0,75 / 0,80 | 19/25 | 2/25 |

  El método separa bien de la mitad baja, pero todavía no concentra los análogos conocidos en el top 10 %. Para Shackleton, los análogos polares (McMurdo, Svalbard, Axel Heiberg, Concordia) sí llegan al top 10 %. Los desérticos (Atacama, Pilbara) no, y tiene sentido: son análogos de Marte, no de la Luna.
- **Candidatos nuevos:** casi todos en el **Ártico canadiense (Nunavut)** y la **Alta Asia (Sinkiang, Gilgit-Baltistán, Pamir, Tíbet)**, y alguno en Mongolia (Hovd), Rusia (óblast de Arcángel), los Andes y Alaska/Yukón. Son desiertos fríos de altura o de latitud alta.
- Fallo detectado: el NDVI de `MOD13C1` se escaló dos veces. La puntuación no cambia (posición relativa) y la web lo corrige al mostrarlo. Detalle en CLAUDE.md.
- Pendiente: el mapa de la pestaña Candidatos sale negro en la primera carga.

### Búsqueda global de nuevos análogos (proceso)
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
