# Bitácora del proyecto

Registro cronológico de lo que se ha hecho. Lo más reciente, arriba.

## 2026-11-15 (mediodía, 2) · Vídeo: montaje de prueba v2, horizontal

- Formato **horizontal 16:9** (1920×1080; captura a 1280×720 ×1,5). Duración **29,9 s**: la voz ocupa los 30 s y se recortan 0,1 s del cierre.
- Subtítulos **amarillos sin caja**, con contorno oscuro, sombra y una entrada con un ligero «pop» (del 90 al 100 % en 0,2 s). Un degradado oscuro suave en la franja inferior hace que se lean sobre cualquier pantalla.
- Marca de agua: `SI-assisted editing · SI voice: ElevenLabs`.
- Plano 18–22: se oculta la tarjeta «Every number, every source» para que no compita con el subtítulo, y el título entra entero.
- `build.sh` genera también una copia WebM (VP9), porque el ordenador del evento no tiene decodificador H.264.
- Registro actualizado en `docs/normas.md`, `docs/guion-video.md` y en la memoria.

## 2026-11-15 (mediodía) · Vídeo: primer montaje de prueba (v1)

- `video/scripts/capture.cjs`: captura la web pública fotograma a fotograma con un reloj virtual (sin GPU solo salen ~2 capturas/s, así que el tiempo de la página avanza 1/30 s por captura y el movimiento queda fluido). `overlays.cjs`: subtítulos desde `docs/timestamps.txt`, marca de agua de SI y cierre. `build.sh`: montaje con ffmpeg.
- Resultado: `video/build/terravista-test-v1.mp4` (fuera de git), 1080×1920, 30 fps, 30,000 s exactos, sin audio. Planos: escena Luna → Tierra (0–6), Discover con los tres objetivos (6–13), negro (13–18, ponderación por misión sin pantalla), «Where every analogy breaks» de Method (18–22), negro (22–27, avisos sin pantalla) y cierre (27–30).
- Por pulir: los textos de la escena Luna → Tierra chocan con los subtítulos; el plano 18–22 enseña poco; la web aún dice «Terra Analog» (el equipo lo sabe).

## 2026-11-15 (mañana, 2) · Guion del vídeo v3: «Down to Earth»

La v2 sonaba floja. La v3 ([docs/guion-video.md](guion-video.md)) se escribe sobre el lema «TerraVista — Down to Earth» y la descripción oficial de la página del proyecto. 62 palabras.
Hallazgo: la descripción oficial promete dos cosas que la web aún no enseña (comprobado en `origin/main`): la ponderación por misión, que está calculada en `operations.json` pero no sale en ninguna pantalla, y los avisos de zonas en conflicto o protegidas, que no existen. Están apuntadas las frases alternativas por si no da tiempo a construirlas. Además, la rama `video` va por detrás de `origin/main`.

## 2026-11-15 (mañana) · Vídeo de 30 s: normas comprobadas y guion v2

- Normas del vídeo comprobadas de nuevo y decisiones del equipo apuntadas en `docs/normas.md`: menos de 30 s (objetivo 27–28 s), voz y subtítulos en inglés, marca de agua de SI que nombra ElevenLabs y cada plano pensado para un criterio del jurado.
- Guion v2 desde cero en [docs/guion-video.md](guion-video.md): 61 palabras para ElevenLabs, y la imagen es solo la web animada. Sale de las ideas de los guiones del equipo, sin cifras que no se puedan defender.

## 2026-11-14 (noche, 9) · Vídeo de 30 s: borrón y cuenta nueva

El guion tiene que cumplir unos requisitos nuevos y se empieza de cero. Borrado (recuperable desde el commit `ea2ce49` con `git checkout ea2ce49 -- <ruta>`):
- `docs/guion-video.md` (guion v1 Apolo/Armstrong y alternativas) y la sección «Vídeo de demo» de `docs/pitch.md`.
- `video/assets/` entera: el clip del primer paso del Apolo 11, el audio de Armstrong y `CREDITS.md`.
- Fuera de git: `video/build/` (cinta del Apolo, miniaturas, recortes) y los temporales del reconocedor de voz.

Se quedan los guiones originales del equipo (`guion.md`, `guion-leo.md`, `guion_victor.txt`), los datos del presupuesto (`video/data/nasa_budget_share.csv`) y las herramientas (`video/tools/`). Los enlaces a esos archivos en entradas anteriores de esta bitácora ya no funcionan.

## 2026-11-14 (noche, 8) · Vídeo, fase 0 y primer material

- Herramientas en `video/tools/` (no se suben a git): ffmpeg 7.0.2 y ffprobe estáticos, y Playwright (`playwright-core`, con el Chrome del sistema).
- **Cifras del presupuesto comprobadas:** 4,41 % del gasto federal en 1966 (máximo) y 0,33 % en 2026. Las dos frases del guion son correctas. Serie completa en `video/data/nasa_budget_share.csv`.
- **Imagen del primer paso:** tramo de 35 s de la cinta restaurada del Apolo 11 (NASA Image and Video Library) en `video/assets/archive/`. El audio de Armstrong de la NASA empieza en el s 150,2 de esa cinta (correlación cruzada de la envolvente de audio).
- **Pendiente:** confirmar de oído cuál de los tres bloques de voz del MP3 es *"That's one small step for man"*. Un reconocedor de voz (Vosk) no entiende la radio de 1969. Probablemente es el bloque 1 (0,3–2,2 s).

## 2026-11-14 (noche, 7) · El producto pasa a llamarse TerraVista; guion v1 del equipo

- **Nombre:** «Terra Analog» → **TerraVista** en la web (`layout.tsx`, `manifest.ts`), README, banner, `package.json` y documentos. El proyecto de Earth Engine y el asset siguen siendo `terra-analog`, porque no se pueden renombrar. La web pública cambiará con el próximo `npm run deploy`.
- **Guion** ([docs/guion-video.md](guion-video.md)): versión del equipo con los tiempos reajustados (0:00–0:04 / 0:04–0:09 / 0:09–0:13 / 0:13–0:24 / 0:24–0:27 / 0:27–0:30). Vuelve *"and where they break"*. Llevará ~2 s del audio real de Armstrong de fondo al principio. Las funciones de acogida (Open Spaces) se construirán más adelante y saldrán en el vídeo.
- **Audio de Armstrong** descargado de la NASA (dominio público) en `video/assets/archive/`; créditos en `video/assets/CREDITS.md`.

## 2026-11-14 (noche, 6) · Guion del vídeo de 30 s

Valorados los tres guiones del equipo (`guion.md`, `guion-leo.md`, `guion_victor.txt`) y fundidos en una estructura v0 en [docs/guion-video.md](guion-video.md): contexto de Leo, pregunta de Víctor, producto en una frase y lema de Leo. Propuestas 3 intros y 3 cierres dramáticos, con tres parejas (recomendada: «un pequeño paso» + «el salto empieza aquí»). Quedan para después las cifras del presupuesto (fuente oficial) y el nombre «Open Spaces».
Elegida la pareja A + 1. Escrita la v1 cronometrada (57 palabras de voz más ~4 s de audio de Armstrong), con la lista de piezas.
Corrección: el equipo no grabará metraje propio. Todas las imágenes salen de archivo de la NASA, de la web y del visor 3D, o de gráficos generados; el cierre usa archivo de pruebas análogas de la NASA en la Tierra.

## 2026-11-14 (noche, 5) · Visor 3D: imagen real por defecto en los tres cuerpos (Jefe)

zexu: «¿por qué no se ven los biomas?». El gris neutro era el modo por defecto (decisión del 14/11, noche 2). Ahora, a petición suya, el modo por defecto es «Real imagery» y el gris queda como opción («Same grey (compare shapes)»).
- Tierra: Sentinel-2 cloudless (EOX).
- Luna: LRO WAC south pole mosaic 100 m/px (`LRO_WAC_Mosaic_SPole60_100m_v02`), con la misma proyección estereográfica polar que el DEM de LOLA (comprobado en su `?f=json`). Sale oscura: el Sol en el polo sur es casi rasante.
- Marte: Viking MDIM2.1 colour mosaic 232 m/px (Jezero y Arcadia), mismo sistema de coordenadas que el DEM. Más borroso que la Tierra.
Cada imagen se descarga aparte y no retrasa el relieve. Arreglado también «Arcadia Planitia · Marte» → «Mars» (la entrega va en inglés).
Comprobado con capturas en local de los tres objetivos.

## 2026-11-14 (noche)

### Copia de Earth Engine en el repo y acceso público
- `data/ee/terra_features_01deg/`: las 9 bandas del asset como GeoTIFF (0,1°, de 85°N a 85°S, Float32).
- `data/ee/scores/`: mapas de similitud total y por dimensión para Shackleton, Jezero y Arcadia (12 GeoTIFF). Se generaron con la fórmula de `06_puntuar_asset.js`.
- El asset `projects/terra-analog/assets/terra_features_01deg` ahora es de **lectura pública** (`all_users_can_read`).
- Copia pública del script de puntuación en el Code Editor: https://code.earthengine.google.com/f08f00b996446e8bc90653d3bec72b83
- Formato, unidades, el aviso del NDVI (×10⁻⁴) y un ejemplo en Python en [data/ee/README.md](../data/ee/README.md).

## 2026-11-14 (noche, 4) · Visor 3D: el relieve ya no espera a la foto (Jefe)

En la web publicada el relieve de la Tierra se quedaba en «Loading elevation…»: el cargador esperaba a la foto Sentinel-2, que a 81°N son ~64 teselas de EOX. Ahora la foto se descarga solo al pulsar «Earth satellite photo» (≈20 m/px, menos teselas) y el relieve sale solo (22 s en la prueba, con Chromium sin GPU). Si no hay foto, lo dice («no photo here»).
Hallazgo para el método: el candidato de 81,25°N 78,15°W es mitad mar (la parte plana a 0 m es agua del fiordo). Conviene excluir celdas con mucha agua.

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
