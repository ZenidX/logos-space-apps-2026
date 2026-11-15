# Bitácora del proyecto

Registro cronológico de lo que se ha hecho. Lo más reciente, arriba.

## 2026-11-15 (tarde, 24) · Vídeo de demo v6: grabado de nuevo, con *Plan a base*

- Pedido del usuario: vídeo nuevo porque la web cambió; centrado en el problema (emparejar la Tierra con cada misión, con sus valores y atributos, incluidos permisos y política) y con *Plan a base* como lo que nos diferencia. Voz nueva `video/audio/final-voice.wav` (29,59 s); el usuario cambió el texto al grabar y no tocó `docs/timestamps.txt`: lo rehice yo con la transcripción de Vosk y las pausas medidas.
- Todos los planos se graban sobre https://zenidx.github.io/logos-space-apps-2026/ (Vercel no tiene *Plan a base*): a apertura → misiones 1 y 3 · s ficha de Haughton → licencia de Nunavut · b base montándose en Best site A · r ensayo de Water & oxygen lado a lado (Badakhshan ↔ Luna) → «Where it breaks» · cierre. Guion y planos en `docs/guion-video.md`.
- `capture.cjs`: planos nuevos, `frozenLoad` para `/base/` (reloj parado mientras carga; fuerza el final del fundido de framer-motion, que se quedaba en opacidad 0) y relleno en el diálogo de ensayo para subir «Where it breaks» por encima de los subtítulos. `build.sh`: cortes a 10,5 / 15,3 / 19,4 / 26,3; `DUR` 29,5.
- «Terra Vista scores» fijado a mano a 5,40 s en `word-timings.json` (Vosk oyó «terrible discourse»).
- Comprobado: 1920×1080, H.264 + AAC, 29,5 s; hojas de contactos en cada inicio de frase. El usuario lo revisó y aprobó. Publicado en `/demo-video/`.
## 2026-11-15 (noche, 25) · Preguntas difíciles del jurado

- Nuevo `docs/preguntas-dificiles.md`: 21 preguntas probables del jurado, agrupadas por los criterios (validez, creatividad, impacto y relevancia, «Plan a base», datos e IA), con la respuesta en inglés lista para decir y, en español, la trampa de cada una. Al principio, las cifras que hay que saber; al final, qué hacer si la demo falla.
- Aviso: `docs/pitch.md` describe el prototipo anterior (ahora en `/appendix/`); sus cifras no valen para la web actual.

## 2026-11-15 (noche, 24) · «Plan a base»: la base en la Tierra nada más elegir el sitio

- Pedido: al encontrar o elegir un sitio en la Luna o en Marte, dar enseguida su equivalente en la Tierra; si no, la práctica no tiene sentido. Antes solo aparecía al abrir una submisión.
- **Nuevo bloque «This base on Earth»** justo debajo de la ficha del sitio (`EarthTwin` en `BasePlanner.tsx`). Se calcula al cargar el terreno:
  - **Most alike ground:** el sitio de la Tierra con el relieve 11 × 11 km más parecido al elegido (mezcla de pendientes y relieve, `shapeMatch`), entre los 3 mejores candidatos por condiciones de cada trabajo. Muestra el % de parecido, para qué trabajos sirve y «See the base side by side with it →».
  - **Where to practise each job:** para cada trabajo de la base, su mejor sitio (mitad condiciones, mitad relieve, como dentro de cada submisión), con «Compare →».
- Por qué dos respuestas: con los datos actuales cada sitio de la Tierra sirve para un solo trabajo (las listas de cada tarea no se solapan), así que un «gemelo» único salía con «1 of 7». Cada ensayo se hace donde se cumplen las condiciones de esa tarea (`docs/estrategias-bases.md`).
- Comprobado en Chrome sin interfaz con Jezero (Marte): relieve más parecido en Dakhlet Nouadhibou (Mauritania, 94 %), y un sitio por trabajo. Con Mons Mouton (Luna) salió Atacama (87 %, bueno para travesías) en una prueba; en otra Trek devolvió 500 (fallo del servidor de NASA, no del código).
- Arreglos: el borde de cristal del panel ya no se desplaza con el contenido (cristal y desplazamiento en elementos distintos, como en la portada). «0 h from a city» pasa a «< 1 h».

## 2026-11-15 (noche, 23) · «Plan a base» con el mismo estilo que la vista de misión

- Pedido: que `/base/` use los estilos y la tipografía de la vista de una misión (tras «Explore this mission», p. ej. `/?m=m1-eva-basalt&s=…`).
- **Maquetación igual:** la escena 3D ocupa la página sin marco (`.visor.bleed`) y el panel es de cristal, fijo a la derecha, de 420 px y 20 px de radio, como el de la misión. Ojo: en el CSS del equipo `.glass` lleva `position: relative` sin capa y gana a `md:fixed`; por eso la posición va en el `aside` y el cristal en un `div` interior. En móvil, la escena sigue arriba y el panel debajo.
- **Cabecera del panel como la de la misión:** línea de color del mundo («Base concept · Moon · {sitio}»), título display de 30 px, texto de 13,5 px y botones Moon/Mars como las píldoras de misión (borde y texto del color del mundo).
- **Listas como «Sites»:** los sitios recomendados, los conocidos, las submisiones y los sitios de ensayo en la Tierra pasan de tarjetas con borde a filas (número en mono de color, nombre en `place`, línea secundaria pequeña, realce al pasar). Las submisiones llevan su estado con un punto de color, y al abrirse muestran «Needs» con borde lateral, como «Where it breaks».
- **Cifras y desplegables:** «Buildable / Sun / Ice» y «What this site is like» usan los recuadros `.ltile` de la ficha del sitio. «Enter coordinates», «What this site is like» y «About this simulation» usan el desplegable `.about` («About this mission»). Las acciones son `.chip` («Compare … →», «Change site») y `.fchip` («Rehearse →»).
- La barra superior queda a la misma altura que la de la portada. Las clases copiadas de `logos.css` están al final de `src/app/(team)/globals.css`.
- Comprobado con capturas en Chrome sin interfaz (escritorio 1440 px y móvil 390 px). El aviso de hidratación que sale al emular «movimiento reducido» viene de la transición de página del equipo (`template.tsx`, framer-motion) y ya existía.

## 2026-11-15 (tarde, 23) · Vídeo de demo v5: voz masculina

- Pedido del usuario: rehacer el vídeo con la voz masculina (`video/audio/male_voice.wav`, 28,85 s) reutilizando las capturas (el plano `a` tarda ~40 min). Mismo guion; cambian la entonación y los tiempos.
- `docs/timestamps.txt`: mismo texto, tramos recortados a las pausas de la voz nueva (0–5,9 · 5,9–12,3 · 12,3–17,7 · 17,7–21,3 · 21,3–25,6 · 25,6–28,85). Con los antiguos, «Testing a spacesuit?» y «and flags…» habrían salido tarde.
- `align.py` y `build.sh` aceptan `VOICE=/ruta.wav` (por defecto sigue `voice.wav`). Alineación con Vosk: todo encaja salvo «Terra Vista» (dos veces) y un «where», que se reparten en su tramo.
- Cortes: b se recorta a 108 fotogramas (18–21,6), c1 21,6–24, c2 24–25,6, cierre 25,6–28,85. `DUR` por defecto 28,85.
- Comprobado: 1920×1080, H.264 + AAC, 28,87 s; hoja de contactos y fotogramas en cada inicio de frase y corte. Publicado en `/demo-video/`.
- Límite conocido: el plano `a` lleva el ritmo de la voz femenina; las frases 2–3 empiezan ~0,3 s antes que la imagen.
## 2026-11-15 (tarde, 22) · Lista de mejoras 4–11: ficha más gráfica, salir, clic en los astros, giro de los planetas, pie, sin «Prototype», «Plan a base»

- **4 · Ficha del sitio más gráfica y simple** (`SitePanel.tsx`, `logos.css`): la frase del veredicto pasa a píldoras por condición (✓ en rango, ≈ aceptada, ✕ fuera, – sin dato) y el párrafo de logística a tres cifras (tiempo a una ciudad, pendiente media, acceso con sus barras). En «Why», el «por qué importa» y las fuentes de cada condición quedan plegados («Why it matters · sources»), y los textos de ayuda son más cortos.
- **5 · Botón para salir:** en la vista de misión, junto a «Back», hay «✕ Exit mission», que vuelve a la historia (el logo Terra Vista ya no es la única salida).
- **6 · Pulsar los astros y los puntos:** en la vista general, la Luna o Marte llevan a su primera misión de la historia y la Tierra a «Choose a mission». En el primer plano de una misión de la historia, el astro de al lado abre esa misión. Los puntos de los sitios ya abrían la misión con su sitio; desde el arreglo de los eventos del ratón (entrada 19) también funcionan en la historia. Un clic es una pulsación que casi no se mueve, así que no choca con el arrastre. El cursor pasa a mano encima de un astro (`SolarScene.tsx`, prop `onBody`).
- **8 · Los planetas giran sobre sí mismos:** Marte gira en la vista general como la Tierra (un día marciano es casi un día terrestre) y la Luna mira siempre a la Tierra con su cara visible (rotación síncrona). En el primer plano la Tierra no gira sola, para que los sitios se queden a la vista; se puede girar a mano.
- **9 · Pie de página** (al final de la historia): equipo Logos (Alexis · Fer · Victor · Xavi · Zexu, solo nombres de pila, decisión del equipo), referencia al hackathon con enlace al reto, uso de SI (IA) con enlace a `AI_USAGE.md`, y datos personales (la web no recoge ninguno: ni cuentas, ni cookies, ni analítica; comprobado en `src/`).
- **10 · Fuera la etiqueta «Prototype»** de la cabecera y de la sección de misiones.
- **7 · «Plan a base» con el mismo aspecto que la portada** (`SiteNav.tsx`, `src/app/(team)/globals.css`, `BasePlanner.tsx`): cabecera de ancho completo con el mismo velo y botones de píldora con borde (la página actual, clara); panel de cristal redondeado; títulos con la fuente display y pasos numerados en mono.
- **11 · Comparar terrenos, mejor integrado:** en `/base/`, botón «Compare this base with an Earth site ▶» en la ficha del sitio y «Compare side by side with the best Earth site ▶» en cada submisión. La comparación se guarda en la URL (`cmp=best`, `cmp=<lat>,<lon>` o `cmp=x&elat=..&elon=..&en=..` para cualquier punto de la Tierra). Desde la ficha de cada sitio de la portada, «Compare with a base at {objetivo} →» abre `/base/` con la base en el objetivo de la misión, su submisión (EVA, exploración, agua o energía) y la comparación con ese sitio de la Tierra.

## 2026-11-15 · README visual con las tres partes (C_1)

- Arriba, «One site, three parts»: miniaturas enlazadas de Missions, Plan a base (GIF) y el apéndice.
- Nueva sección **Plan a base** en tres pasos (elegir sitio → la base se monta sobre el relieve real → ensayar cada trabajo en la Tierra) y sección **How we started** (la búsqueda global de Earth Engine, ahora en `/appendix/`). En el mapa del repo, las carpetas de la base y del apéndice.
- Imágenes nuevas en `docs/img/`, capturadas de la web publicada: `base-choose.jpg`, `base-assembly.gif` (montaje de la base en el sitio A del polo sur, 0,85 MB), `base-rehearse-loop.gif` y `base-rehearse.jpg` (Xinjiang frente al sitio A, agua y oxígeno) y `appendix-discover.jpg`. Los GIF se montaron con `sharp` a partir de capturas de pantalla.
- Comprobado: todas las imágenes y enlaces relativos del README existen.

## 2026-11-15 (tarde, 21) · Portada: scroll con imán y giro fiel de los globos

- **Scroll con imán (sin puntos muertos):** en la historia, cada sección ocupa una pantalla y se podía dejar la página a medias entre dos misiones, con la pantalla casi vacía. Ahora `html:has(.story) { scroll-snap-type: y mandatory }` y cada `.story-hero` / `.story-step` encaja por arriba (`src/app/(logos)/logos.css`). La última sección, más alta que la pantalla, sigue desplazándose libremente. En la vista de misión no hay imán (no existe `.story`). Comprobado en Chrome sin interfaz: un scroll a 700 px se queda en 513 (inicio de la sección) y uno a 1300 en 1539.
- **Giro fiel al ratón:** el arrastre giraba la Tierra a un ritmo fijo (0,006 rad/px) sobre los ejes del mundo y no sobre los de la pantalla, así que la superficie no seguía al cursor y parecía tener «velocidad». Ahora es un giro de «agarrar el punto»: se lanza un rayo desde el cursor a la esfera y se rota para que el punto agarrado quede siempre bajo el cursor (fuera del disco, el punto más cercano del borde). Comprobado aparte con three.js (cámara descentrada como en la web): 0 px de error entre el punto agarrado y el cursor.
- También se puede girar el astro de al lado (Luna o Marte); su giro se suma a su orientación automática y se reinicia al cambiar de misión. El cursor solo pasa a «grab» encima de un globo (`SolarScene.tsx`).

## 2026-11-15 (tarde, 20) · Portada: los globos se pueden girar en las misiones 1–4

- Problema: en la historia de la portada, en las secciones «Mission 1–4», el globo de la Tierra (con la Luna o Marte al lado) no se podía girar con el ratón.
- Causa: la capa de la historia (`.story`, z-10) tapa la escena 3D fija y se quedaba con todos los eventos del puntero; el arrastre de `SolarScene` nunca llegaba a recibirlos.
- Arreglo: `.story { pointer-events: none }` y `.story-copy { pointer-events: auto }` (`src/app/(logos)/logos.css`). Solo el texto recoge el puntero; el resto llega a la escena. La rueda y el desplazamiento vertical en móvil siguen moviendo la página (`touch-action: pan-y`).
- El cursor pasa a «grab»/«grabbing» en el primer plano para que se note que se puede girar (`SolarScene.tsx`).

## 2026-11-15 (tarde, 19) · Recorrido completo: volver atrás, enlace misión → base y botones más grandes

- Pedido de zexu: seguir con la experiencia de usuario del recorrido completo, añadir un botón para volver a la página anterior y agrandar los botones.
- **«Plan a base» guarda su estado en la URL** (`?b=moon&lat=..&lon=..&n=..&s=water&pick=1`). Así el «atrás» del navegador va paso a paso (submisión → sitio → globo → página anterior) y se puede enlazar a un sitio concreto.
- **Botón «← Back»** (`src/components/BackButton.tsx`): en la barra de las páginas del equipo y en la cabecera de la portada cuando hay una misión o un sitio abiertos. Usa el historial y, si no hay, vuelve a la portada (en la portada, deshace el paso: sitio → lista → inicio).
- **Enlace misión → base:** en el panel de cada misión, «Plan a base at {objetivo} →» abre la base en las coordenadas del objetivo (p. ej. Mons Mouton).
- **Botones más grandes:** píldoras de 44 a 48 px, chips de 36 a 42 px (Logos: 40 px) y los botones de la escena a 42 px.
- **En móvil:** etiquetas cortas en la barra (Missions · Base · More), chips algo más estrechos por debajo de 420 px, «Terra Vista» oculto cuando está el botón de volver, y márgenes ajustados a la barra más alta.
- **Comprobado en Chromium:** misión → «Plan a base at Mons Mouton» → abrir submisión → Back (se cierra) → Change site → Back (vuelve a la base) → Back (vuelve a la misión). Capturas a 1366 y 390 px, sin errores.

## 2026-11-15 (tarde, 18) · Experiencia de usuario: «Plan a base» como espacio de trabajo

- Pedido de zexu: mejorar mucho la experiencia de usuario. Problemas de «Plan a base»:
  - La escena, las submisiones, la Tierra y las condiciones iban una debajo de otra, así que al elegir algo se perdía la escena de vista.
  - Mucho scroll antes de empezar.
  - Demasiados controles al mismo nivel.
  - La barra superior tapaba la escena.
- **Ahora es un espacio de trabajo como la portada de misiones:**
  - **Escena fija a la izquierda** (en móvil, arriba): el globo hasta elegir sitio y después la base.
  - Controles de vista recogidos sobre la escena: capas en una fila, «Real scale» (en móvil «1:1») y «View ▾» con altura, Sol y repetir montaje.
  - **Panel a la derecha:** Luna o Marte → 1 · sitio (★ recomendados por nuestra búsqueda, sitios conocidos, coordenadas plegadas) → ficha del sitio con 3 datos clave y «Change site» → **2 · submisiones en acordeón**: al abrir una, la escena va a ella y dentro aparecen el veredicto, lo que necesita y **3 · dónde ensayarla en la Tierra** con «Rehearse ▶».
  - «What this site is like» y «About this simulation», plegados.
- Barra superior opaca en móvil; en pantallas estrechas solo se ve el símbolo del logo.
- Comprobado con Chromium a 1366 px y 390 px: elegir un sitio recomendado → base en marcha → abrir «Water & oxygen» → lista de la Tierra, sin errores.

## 2026-11-15 (tarde, 17) · Los mejores sitios para una base en la Luna y en Marte (agua y oxígeno incluidos)

- Pedidos de zexu: un sitio en Marte para conseguir agua y oxígeno, y los sitios de la Luna y de Marte con más facilidades para todos los aspectos de una base, **guardados para poder elegirlos**.
- `scripts/base/find-sites.mts` (`npm run sites:base`, ~25 s): pasa cada punto por el modelo de la base (luz, temperatura, hielo, pendientes, pista, ruta), puntúa cada aspecto y calcula la nota total. Barre 105 puntos del polo sur de la Luna y 82 de las regiones de Marte con hielo publicado (Arcadia/SWIM, Utopia, Deuteronilus, este de Hellas). Resultado en `src/data/base-sites.json`; método y fuentes en `docs/sitios-base.md`.
- **Luna:** el mejor es **88°S 180°E** (0,84): 51 % de sol en el hábitat, trampa fría a 0,93 km, 63 % edificable.
- **Marte:** el mejor en conjunto es **Arcadia Planitia 38°N 170°W** (0,86). Para **agua + oxígeno**, **Arcadia Planitia 46°N 170°W** (0,88): hielo a menos de 1 m (SWIM) y aire a 877 Pa a −4 km para sacar O₂ del CO₂.
- En `/base/` salen con ★ en la lista y en el globo y se pueden elegir.

## 2026-11-15 (tarde, 16) · La web anterior pasa a un apéndice

- Pedido de zexu: quitar de primer plano lo que quedaba de la web anterior (la de antes de que la app de SpaceApp-Logos fuera la principal) y llevarlo a un apéndice.
- Story, Discover, 3D, Method y Data se mueven a `/appendix/story/`, `/appendix/discover/`, `/appendix/3d/`, `/appendix/method/` y `/appendix/data/`. Hay una página índice nueva, `/appendix/`, que explica que son el prototipo anterior (búsqueda global con Earth Engine) y que sus datos siguen alimentando los sitios de ensayo de Plan a base.
- **Barra:** Missions (portada) · Plan a base · Appendix (resaltado en cualquier página del apéndice).
- Los rótulos «Step n of 7» pasan a «Appendix · A1–A5 · Earlier prototype» y a «Plan a base».
- La portada de Logos enlaza solo a «Plan a base» y al apéndice.
- `/demo-video/` (vídeo de Alexis) no cambia de sitio.

## 2026-11-15 (tarde, 15) · Modelos 3D de verdad, escala real y bases en cada candidato de la Tierra

- `src/lib/base-models.ts`: modelos **en metros reales** con piezas y materiales PBR, con texturas generadas (aislante dorado arrugado, tela blanca acolchada, células solares, regolito sinterizado, neumático de malla):
  - Hábitat de superficie Ø 4,6 × 10 m con cúpulas, anillos, ventanas, patas niveladoras, esclusa con escalera, radiador y antena; berma de regolito.
  - Módulo de aterrizaje de dos etapas (~12 m) con patas, zapatas, tobera, propulsores de control y escalera.
  - Rover no presurizado con ruedas de malla que giran al avanzar.
  - Mástil solar vertical de 18 m con panel de 3,5 × 8 m que sigue al Sol.
  - Campo solar, reactor de fisión con radiadores, excavadora de tambores contrarrotantes (giran), planta de extracción de agua (tolva, horno, tanques), zona de hielo con escarcha y taladro.
  - Plataforma sinterizada de Ø 60 m con berma y balizas; astronautas que caminan.
- `BaseScene.tsx`: todas las piezas son modelos. En la vista general van ×22 (la web lo indica).
- **Modo «Real scale»:** factor 1, cámara a pie de base, búfer de profundidad logarítmico, sombras centradas en la base, la cámara viaja con el objetivo y nunca baja del suelo.
- Capa **«Ice»** (trampa fría en superficie, hielo enterrado o nada), con leyenda.
- **Comparación con la Tierra:** botones ‹ › para pasar de un candidato a otro con **la base montada en cada uno**, y escala real en los dos lados.
- Comprobado en Chromium: vista general, escala real, capa Ice y comparación (Xinjiang ↔ Shackleton) sin errores.
## 2026-11-15 · README principal = el de SpaceApp-Logos (C_1)

- Por decisión del usuario, el README de la raíz pasa a ser el de `zexuguo/SpaceApp-Logos` («ese es el bueno»). Sustituye al README que describía las tres partes del repo fusionado.
- Solo se han cambiado rutas para que nada quede roto en este repo: documentos e imágenes en `docs/logos/`, código en `src/app/(logos)/`, `src/components/logos/` y `src/lib/logos/`, `npm run data:logos` y demo en `zenidx.github.io/logos-space-apps-2026`. Comprobado: los 13 enlaces e imágenes relativos existen.
- Lo que ya no aparece en el README principal: la descripción de `/base/` y de la búsqueda global con Earth Engine (`/story/`, `/discover/`, `/3d/`, `/method/`, `/data/`). Sigue en el historial de git.

## 2026-11-15 (tarde, 14) · Hielo lunar investigado y simulado con temperatura

- Investigación con fuentes en `docs/hielo-lunar.md`:
  - Trampas frías por debajo de ~110 K (Hayne et al. 2021; Schörghofer 2025): ~40 000 km², 60 % en el sur, casi todas por encima de 80°.
  - Diviner: 40–90 K en los grandes cráteres y permafrost lunar alrededor (Paige et al. 2010).
  - LCROSS: 5,6 ± 2,9 % de agua en masa en Cabeus.
  - M³: hielo en superficie irregular (Li et al. 2018).
  - Origen: cometas y viento solar.
  - Extracción térmica (NASA LuSTR).
- `iceModel()` en `src/lib/base-plan.ts`:
  - Temperatura máxima y media por equilibrio radiativo, a partir de la luz calculada.
  - En sombra permanente: calor interno más reflejo de las paredes iluminadas, con un factor calibrado a Diviner.
  - Clases: trampa fría en superficie (máxima < 110 K), hielo enterrado posible (media < 110 K) o ninguno.
- **Extracción:**
  - La planta va en el borde con más sol y la excavadora en la trampa fría más cercana.
  - El rover acarrea el regolito helado entre las dos.
  - El veredicto da las cifras: 1 t de regolito ≈ 56 kg de agua (27–85 kg) con LCROSS.
- **Validación con terreno real:**
  - Mediodía en Tranquility: 385–387 K (lo real, unos 390 K).
  - Trampas frías de la cresta de Shackleton y de Mons Mouton: 58–70 K (Diviner: 40–90).
  - Fondo de Shackleton: 25 K. Es bajo porque las paredes iluminadas quedan fuera de la zona de 11 km.
- Condiciones nuevas: «Coldest ground», «Ice at the surface» y «Buried ice possible».
- `src/lib/base-models.ts` (en curso): modelos en metros reales para sustituir las piezas simples.

## 2026-11-15 (tarde, 13) · Base: luz y sombra reales (paneles por orientación, hielo lunar solo en sombra permanente)

- Pedido de zexu: que la simulación no sea solo topográfica; que cuenten la orientación para los paneles solares y cosas básicas como el hielo de la Luna.
- **Matiz:** en la Luna sí hay hielo, pero **solo en suelo polar que nunca ve el Sol** (LCROSS 2009: ~5,6 % de agua en Cabeus; M³ 2018: hielo en superficie). Fuera de esas trampas frías no hay. El fallo del modelo era que ponía «hielo en el punto más hondo» sin comprobar la sombra.
- `sunlight()` en `src/lib/base-plan.ts`:
  - Horizonte de cada celda en 24 direcciones, sobre las alturas reales y con la caída por la curvatura.
  - Recorrido del Sol: ángulo horario cada 7,5° × 5 declinaciones entre −inclinación y +inclinación (Luna 1,54°, Marte 25,19°, Tierra 23,44°).
  - Resultado por celda: fracción del tiempo con sol, energía según la orientación de la ladera y **sombra permanente** (ningún Sol del modelo llega).
  - Las mallas polares estereográficas llevan `northBearingDeg` para orientar bien el Sol.
- **Reglas nuevas:**
  - Hábitat polar donde más horas de sol hay.
  - Mástiles en los puntos con más sol, no en los más altos.
  - Campo solar donde el suelo recibe más energía (orientación y sombras).
  - **Hielo lunar solo en sombra permanente**; si no hay en la zona: «no ice, water brought in».
  - Luna fuera del polo: sin hielo.
- **Resultados con terreno real:**
  - Fondo de Shackleton: **56 % en sombra permanente** (correcto: es una de las regiones en sombra permanente conocidas).
  - Cresta de Shackleton: mástiles con sol el 59–65 % del tiempo y 1,5 % de sombra permanente a 1,8 km.
  - Tranquility: 50 % de sol, 0 % de sombra, sin hielo.
  - Marte: ~50 %.
  - Unos 0,2 s por sitio.
- **Web:**
  - Capa **«Sunlight»** con su leyenda.
  - Veredictos de agua y energía con estas cifras.
  - Condiciones nuevas: «Sun at the habitat» y «Permanent shadow».
  - En la comparación con la Tierra, el plan terrestre usa el Sol de la Tierra en ese sitio, y la tabla añade sol en el hábitat y en el mejor punto solar.
- **Límite, dicho en la web:** el horizonte solo ve la zona de 11 km y se mide a ras de suelo. Los artículos dan 80–90 % para los mejores picos polares, con mástiles y el horizonte completo.

## 2026-11-15 (tarde, 12) · Las páginas del equipo, con el estilo de la portada (Logos)

- Pedido de zexu: Base y las demás páginas tienen que llevar el estilo general de la app de Logos.
- `src/app/(team)/layout.tsx`: las fuentes pasan a ser **Bricolage Grotesque y Martian Mono**, las mismas de la portada. Se cargan en las variables que ya usaba el CSS (`--font-plex`, `--font-jetbrains`), así que no ha habido que tocar componentes por la tipografía. El título pasa a «Terra Vista».
- `src/app/(team)/globals.css`:
  - Paleta de Logos (`--acc` = `--earth` #5db4ff, ámbar #ffb454 para avisos, mismas tintas y líneas) y remapeo de los colores de Tailwind.
  - Radios redondeados (de 6 a 28 px) en lugar de 1–3 px.
  - Fuera el estilo «Consola»: esquinas cortadas (`.cut`, `.btn-cut`, `.visor`), escuadras, retícula, líneas de barrido, glitch y rejilla de fondo. Los visores pasan a ser paneles oscuros redondeados y el fondo lleva estrellas suaves.
  - Copia de las clases `glass`, `glass-strong`, `glass-chip` y `glass-tab` de `logos.css`, con sus versiones para móvil, transparencia reducida y contraste.
- `SiteNav.tsx`: cabecera como la de Logos (símbolo del logo + «Terra Vista», páginas en píldora `glass-tab`; la activa, en píldora clara).
- Base y comparación: botones en píldora (`glass-tab`), botón principal claro, tarjetas y filas redondeadas.
- Cada parte sigue cargando su propio CSS: Logos no se ha tocado.
- Comprobado con Chromium: Story, Discover, Method, Base y Data **sin errores de hidratación** (un aviso que salió era la caché vieja del servidor de desarrollo; desapareció al reiniciar) y Base a 390 px.

## 2026-11-15 (tarde, 11) · Base: por qué sirve cada sitio de la Tierra y la misión animada en los dos lados

- Pedido de zexu: para cada misión, explicar **por qué** se puede hacer en cada sitio de la Tierra y **animarla tanto en la Tierra como en la base** lunar o marciana.
- `src/lib/rehearsal.ts` interpreta las reglas de `operations.json` (`lo`, `hi`, `band`, las mismas que `scripts/ops/tasks.mjs`) y explica cada criterio con el valor real del sitio. Por ejemplo, «Rain: 64 mm/yr (best ≤ 100, fails ≥ 300) · Dry». También da la lista fija de **dónde se rompe** la analogía según el cuerpo: gravedad, vacío o aire de CO₂, radiación y regolito o frío.
- Cada fila de «Simulate it on Earth» muestra los criterios con ✓, ~ o ✕. El botón pasa a ser **«Rehearse ▶»**.
- `src/components/MissionCompare.tsx` (pantalla completa): **las mismas reglas de base** sobre el relieve real del sitio de la Tierra (izquierda, foto Sentinel-2) y sobre el sitio de la Luna o Marte (derecha), con **la operación de esa submisión en bucle en los dos**: aterrizajes, montaje del hábitat, cables, perforación, rover o salidas con traje. Debajo van tres bloques: «Why this place works», «Same ground?» (parecido del relieve, % edificable, pendiente, relieve, ruta del rover) y «Where it breaks».
- `BaseScene.tsx`: aspecto `world="earth"` (cielo, niebla y suelo terrestres) y `loopFocus` (repite solo el grupo de piezas de la submisión).
- Comprobado en Chromium sin pantalla: Shackleton → «Exploration traverses» → Atacama: las dos escenas animadas, el rover avanzando en las dos y sin errores en la consola.

## 2026-11-15 (tarde, 10) · Todo junto en ZenidX: SpaceApp-Logos es la portada (rama `zexu/converge`)

- zexu aclara que lo que comentaba (la intro con el movimiento galáctico) era la app de **`zexuguo/SpaceApp-Logos`** (Vercel: spaceapp-logos.vercel.app), no este repo. Pide traerla aquí y juntarlo todo en `ZenidX/logos-space-apps-2026`. Decide: **Logos en la portada (`/`)** y la portada del equipo pasa a **`/story/`**.
- **Con historia:** clon de `~/Logos` con el commit sin subir de las 09:29 (`25120e6`); encima, un commit que reubica los archivos; luego `git merge --allow-unrelated-histories`. Se conservan sus 55 commits y sus autores. `~/Logos` no se ha tocado.
- **Dónde está cada cosa:**
  - `src/app/(logos)/`: página, layout, `logos.css` e `icon.svg`.
  - `src/components/logos/` y `src/lib/logos/`.
  - Datos sin cambiar de sitio: `src/data/sites.json`, `site-details.json` y `terrain-index.json`; `public/heightmaps/`; `public/tex/` (las 6 texturas comunes eran idénticas); `scripts/data/` y `scripts/tex/`.
  - Documentación en inglés en `docs/logos/`; `AI_USAGE.md` y `LICENSE` en la raíz.
- **Dos layouts raíz** (grupos de rutas `(logos)` y `(team)`): los dos `globals.css` usan las mismas clases (`.mk`, `.chip`, `.skel`, `:root`…) con valores distintos y se pisarían. Así cada parte carga solo su CSS y sus fuentes, y al pasar de una a otra se recarga la página.
- **basePath:** Logos pedía `/tex/…`, `/heightmaps/…` y `/logo-symbol.svg` con rutas absolutas, que darían 404 en GitHub Pages. Ahora pasa por `asset()` (`src/lib/logos/asset.ts`). En el CSS de carga se usa la variable `--logo-url`.
- **Navegación:**
  - Barra del equipo: 01 Missions (`/`) · 02 Story · 03 Discover · 04 3D · 05 Base · 06 Method · 07 Data; los pasos van ahora «de 7».
  - En Logos: botón «Plan a base →» en la cabecera y bloque «More in Terra Vista» antes del pie.
- **Arreglo de build:** `next/font` fallaba con JetBrains Mono, porque Google la servía con URLs `/l/font?kit=…` sin extensión. Ahora se carga como fuente variable. Funcionaba antes solo porque `.next/cache` tenía las fuentes guardadas, así que **también podía romper el deploy automático**.
- `tsconfig`: `allowImportingTsExtensions` (Logos importa con `.ts`). `npm test` = los 6 tests de Logos; `npm run data:logos` y `npm run test:data` para su flujo de datos en Python.
- **Comprobado:** `tsc`, `eslint` (solo los 2 avisos de antes), `npm test` (6/6), build con `NEXT_PUBLIC_BASE_PATH=/logos-space-apps-2026` (11 rutas) y prueba servida en `/logos-space-apps-2026/` con Chromium: portada, ficha de SP Crater con terreno 3D, Story, Discover y Base; navegación en los dos sentidos; **ningún 404**.
- Pendiente: el proyecto de Vercel `spaceapp-logos` sigue publicando el repo de zexuguo. Hay que decidir si se archiva o si se redirige a la web de Pages.

## 2026-11-15 (tarde, 9) · Guía para rehacer el vídeo

- `video/GUIA.md`: cómo rehacer y publicar el vídeo desde una sesión nueva (reglas, archivos, recetas, comprobaciones y trampas ya resueltas).
- `CLAUDE.md` al día: la web se publica sola con cada push a `main`, la web que se entrega es la del repo del equipo y el vídeo ya está publicado.
- `video/tools/package.json` y su lock pasan a git (`node_modules` sigue fuera), para poder reinstalar ffmpeg y Playwright con `npm ci`.

## 2026-11-15 (tarde, 8) · Vídeo v4: grabado sobre la web real del equipo

- La web que se entrega es la del repo del equipo (`zexuguo/SpaceApp-Logos`, https://spaceapp-logos.vercel.app), no la de este repo. El vídeo se ha grabado de nuevo entero sobre esa web y ya no tiene tramos en negro: apertura de la portada → «Rehearse the Moon and Mars on Earth» → la idea → misión EVA (vuelo a la Luna) → hielo en el suelo (vuelo a Marte) → ficha de SP Crater con «Where the analogy breaks» → acceso de Haughton (licencia de Nunavut) y de Nueva Siberia (High) → cierre. Plano a plano en `docs/guion-video.md`.
- Voz nueva del equipo (29,5 s). El vídeo se corta a 29,5 s. La línea de los avisos pasa a *«and flags where access needs permits, or extra care»*, porque el indicador de acceso de la web dice que no es una evaluación de seguridad (Validity).
- Nombre escrito **«Terra Vista»** (dos palabras, como la cabecera de la web) en los subtítulos y en el cierre.
- Captura (`video/scripts/capture.cjs`) desde la web pública con `?capture=1`, sin tocar el repo del equipo. Lecciones: las animaciones CSS también hay que llevarlas con el reloj virtual (si no, saltan entre capturas). Durante la carga hay que dar pocos pasos de reloj, porque si no el WebGL por software acumula fotogramas y la primera captura tarda minutos. La escena 3D a pantalla completa va a ~0,25 fps: el plano de 18 s tarda ~39 min, y los de la ficha ~1,3 fps.
- Rehacer: `video/scripts/make.sh` (todo) o `SKIP_CAPTURE=1 video/scripts/make.sh` (~85 s). Publicar: `video/scripts/publish-demo.sh` + push a `main` (el workflow publica solo).

## 2026-11-15 (tarde, 7b) · Base: misión global → submisiones → simular en la Tierra (rama `zexu/base-mode`)

- Corrección de zexu: la misión es **una**, montar y mantener la base en el sitio elegido. De ella cuelgan **submisiones que se repiten**, y el objetivo del reto es saber **dónde simular cada una en la Tierra** para esa base concreta.
- `src/lib/submissions.ts`: 7 submisiones (8 en Marte): transporte, construcción, agua y oxígeno, energía, exploración, salidas con traje, (polvo) y tripulación y comunicaciones. Cada una tiene su frecuencia (suposición), lo que necesita del terreno y un **veredicto en ese sitio** («Works here», «With limits» o «Hard here») calculado con el plan sobre el relieve real.
- **Simular en la Tierra:** para la submisión elegida, los sitios de `operations.json` (los 5 mejores y 3 accesibles de cada tarea) se ordenan por **condiciones** (la nota de la búsqueda global) más el **parecido del relieve** con el sitio de la base. El relieve se compara en el momento: se descargan 11 × 11 km de la Tierra (Terrarium) y se cruzan el reparto de pendientes (0–5, 5–10, 10–20, 20–30 y más de 30°) y el relieve. El parecido va de 0 a 1 y se calcula como 70 % intersección de histogramas + 30 % relieve menor / mayor. Hacía falta porque en `operations.json` los mejores sitios de cada tarea están empatados (nota ≈ 1,00): el relieve es lo que los separa.
- Botón **3D**: abre el visor de siempre con el sitio de la Tierra junto al sitio de la base, a la misma escala (11 km también para la base).
- Escena: montaje rápido (6 pasos de 2,2 s) y después **la base en marcha en bucle**: llega una nave de carga cada 16 s, el rover va y vuelve por su ruta y hay tripulantes andando. Al elegir una submisión, la cámara va a ella.
- Comprobado: `tsc`, `eslint`, prueba en Node (Shackleton consigo mismo = 1,00; frente a Arcadia = 0,10) y prueba completa en Chromium sin pantalla (montaje → «Water & oxygen» → lista de la Tierra con el relieve comparado → visor 3D), sin errores en la consola.

## 2026-11-15 (tarde, 7) · Publicación automática con GitHub Actions

- Nuevo `.github/workflows/deploy.yml`: en cada push a `main` (o a mano desde la pestaña Actions) construye la web con `NEXT_PUBLIC_BASE_PATH=/logos-space-apps-2026` y sube `out/` a `gh-pages`, igual que `npm run deploy`. Si llegan varios push seguidos, solo se publica el último.
- Pages sigue en modo «legacy» (rama `gh-pages`): la cuenta no es administradora del repo, así que no se puede cambiar la fuente a «GitHub Actions», y tampoco hace falta.
- `npm run deploy` sigue funcionando para publicar a mano.

## 2026-11-15 (tarde, 6) · Página Base: una base en cualquier punto de la Luna o de Marte (rama `zexu/base-mode`)

- Pedido del equipo: la intro impresiona, pero el cierre con datos se queda corto. Queremos ver cómo sería la base y cómo se harían las misiones en el sitio elegido.
- Nueva página **`/base/`** (paso 4 de 6; Method pasa a 5 y Data a 6). Tocas cualquier punto del globo, eliges un sitio sugerido (Shackleton, Mons Mouton, Tranquility Base, Jezero, Arcadia) o escribes las coordenadas.
- **Terreno real** (`loadMoonAny` en `src/lib/terrain.ts`):
  - Luna: LOLA a 5 m (|lat| ≥ 87,5°), a 30 m (≥ 75°) o global de 118 m. Zona de 10 km.
  - Marte: MOLA + HRSC a ~200 m; en Jezero, CTX a 20 m. Zona de 14 km.
  - Comprobado el 15-11 que `LRO_LOLA_DEM_Global_256ppd_v06` devuelve F32.
- **Planificador** (`src/lib/base-plan.ts`, lógica pura). Las reglas salen de `docs/estrategias-bases.md`:
  - Hábitat en llano (en el polo lunar, en alto) y pista a 1,5–3 km.
  - Energía: mástiles solares verticales en los altos (polo lunar); campo solar y reactor a ~1 km (resto).
  - Recursos: hielo en lo más hondo (polo lunar, proxy, no es un mapa de sombra), hielo somero en Marte a ≥ 35° (regla por latitud) u oxígeno.
  - Parada científica en el máximo relieve local, ruta del rover con A* que evita pendientes de más de 20° y radio de paseo de 2 km.
  - Las distancias y los límites son **suposiciones nuestras** y la web lo dice.
- **Escena** (`src/components/BaseScene.tsx`): misión en 6 pasos animados (aterrizaje, hábitat, energía, recursos, rover, paseo), con capas de relieve, foto y pendiente (verde = < 10°, la misma regla que la viabilidad v3). Las piezas se dibujan entre 23 y 33 veces su tamaño real, y la web muestra el factor.
- **Unión con la Tierra:** cada paso enseña dónde ensayarlo con `operations.json` (el mejor sitio nuevo y uno accesible).
- **Condiciones del sitio**, cada una etiquetada como medida, física o regla aproximada: % edificable, pendiente, relieve, Sol máximo, gravedad, día y noche, enlace con la Tierra (cara visible u oculta), y presión y hielo en Marte.
- `Globe.tsx`: nueva propiedad opcional `onPick(lat, lon)` (clic sin arrastre → rayo → lat/lon; la inversa se comprobó con 5 puntos).
- Comprobado: `tsc`, `eslint` (solo los 2 avisos de antes), `next build`; prueba en Node con terreno real (Shackleton, Tranquilidad, Jezero, Arcadia: planificar tarda < 0,2 s); capturas en Chromium sin pantalla a 1280 px (Shackleton, Jezero, Arcadia) y 390 px (Tranquilidad), sin errores en la consola. **Sin probar:** móvil real y táctil.
- Sin unir a `main` ni publicar.


## 2026-11-15 (tarde, 5) · Nombre: quedaban restos de «Terra Analog»

- El cambio a **TerraVista** (`6ab5252`) no llegó a las pantallas añadidas después: logo de la barra (`SiteNav.tsx`, ahora «Terra**Vista**» con «Vista» en color de acento), texto de «How it works» (`HowItWorks.tsx`), texto de la escena de límites (`Story.tsx`) y documentos internos (`valor-anadido.md`, `estrategias-bases.md`, HANDOFF*).
- Siguen como `terra-analog`, a propósito: el proyecto y los assets de Earth Engine (no se pueden renombrar), los User-Agent de los scripts y las entradas antiguas de esta bitácora.
- Comprobado: `tsc` y `eslint` limpios. La web pública cambiará con el próximo `npm run deploy`.

## 2026-11-15 (tarde, 4) · Vídeo: un solo comando y v3 publicada

- `video/scripts/make.sh [nombre] [planos…]` hace todo el proceso (captura → superposiciones → subtítulos → montaje). Con `SKIP_CAPTURE=1` reutiliza los fotogramas ya capturados (~70 s); con captura completa tarda ~4 min. Si llegan pantallas nuevas, basta con añadir el plano en `capture.cjs` y en la línea de tiempo de `build.sh`, y volver a lanzarlo.
- `video/scripts/publish-demo.sh [nombre]` copia el vídeo en `public/demo/` (MP4, WebM y portada del cierre) para la página `/demo-video/`. Después: commit en `main` y `npm run deploy`.
- Publicada en `/demo-video/` la v3 (subtítulos palabra a palabra), con captura nueva de la web.

## 2026-11-15 (tarde, 3) · Vídeo: subtítulos palabra a palabra (prototipo v3)

- **Tiempos de cada palabra:** `video/scripts/align.py` pasa la voz por Vosk (modelo pequeño de inglés, instalado fuera del repo) y la alinea con el guion. 54 de 64 palabras salen tal cual; «TerraVista» (Vosk oye «terror beast») y «spacesuit? An ice drill?» se reparten en el tramo que ocupa ese sonido. Resultado en `video/audio/word-timings.json`.
- **Estilo:** las palabras van apareciendo una a una (aparecen del 85 al 100 % en 0,12 s), en amarillo, Nimbus Sans negrita a 44 px y sin caja. La frase se compone entera desde el principio, así que la línea no se mueve al ir llegando palabras.
- **El PC del evento se colgó** con la primera versión: un solo ffmpeg con 64 entradas (una imagen por palabra) agotó la memoria. Ahora `video/scripts/captions.cjs` dibuja los subtítulos con Chrome como una sola secuencia PNG transparente (897 fotogramas, ~35 s) y ffmpeg solo superpone esa secuencia: pico de 1,25 GB y 33 s de montaje.
- Orden: `capture.cjs` → `overlays.cjs` → `captions.cjs` → `build.sh`. Salida: `video/build/terravista-test-v3.mp4` + `.webm` (29,9 s, 1920×1080, con voz).
- Sigue faltando: en `origin/main` todavía no están el selector de misión ni los avisos de zonas en conflicto o protegidas, así que los tramos 13–18 y 22–27 siguen en negro. La web publicada sigue con la v2.

## 2026-11-15 (tarde, 2) · Vídeo publicado en una página oculta de la web

- Página `/demo-video/` (sin enlace en el menú y con `noindex`): https://zenidx.github.io/logos-space-apps-2026/demo-video/ · enlace directo al MP4: https://zenidx.github.io/logos-space-apps-2026/demo/terravista-demo.mp4
- Reproductor: el `<video>` nativo del navegador, con MP4 (H.264 + AAC) y copia WebM de respaldo, más una imagen de portada (el cierre). Archivos en `public/demo/` y página en `src/app/demo-video/page.tsx`.
- Commit `aa278ed`, directo en `main` (encima de `6044abb`, sin tocar nada más), y publicado con `npm run deploy` desde un worktree de `origin/main`. Desde la rama `video` no se puede publicar: lleva una versión vieja de la web.
- Prueba de punta a punta: la página da 200, el MP4 se sirve como `video/mp4` con peticiones por rangos (206), y en Chrome se reproduce en escritorio (1440 px) y en móvil (390 px): dura 29,9 s, es 1920×1080 y tiene audio.
- **Para cambiar el vídeo:** sustituir los tres archivos de `public/demo/` en `main`, hacer commit y volver a publicar. Ahora está el montaje de prueba v2 (con planos en negro).

## 2026-11-15 (tarde) · Vídeo: voz de ElevenLabs montada

- `video/audio/voice.wav` (44,1 kHz mono, 30,08 s; fuera de git). La voz termina en el s 29,6, así que el corte a 29,9 s no se come nada. Las pausas entre frases caen en 5,9 · 12,2 · 18,2 · 21,6 · 26,2 · 28,1 s, de acuerdo con `docs/timestamps.txt`.
- `build.sh` acepta `voice.wav` o `voice.mp3`, recorta a 29,9 s con un fundido de 0,1 s y codifica AAC a 48 kHz (Opus en la copia WebM).

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

## 2026-11-14 (noche) · Georreferencia de las GeoTIFF y nueva búsqueda (Space Apps)

- `data/ee/README.md` daba una transformación equivocada (`[0.1,0,-180,0,-0.1,85]`). La cabecera de las TIFF (etiqueta 34264) dice origen 90°N y píxel de 0,10588° en latitud. Lo detectó Space Apps Datos con puntos conocidos (Mar Muerto, Qattara) y lo comprobé en `elev.tif`, `access_hours.tif` y `shackleton_total.tif`. README corregido. La web no lee estas TIFF (usa `ee-global.json`).
- zexu redefine «Access»: viabilidad de llegar por tierra y montar cosas en el terreno, no cercanía a una ciudad. Además, los candidatos tienen que parecerse en forma. Datos busca sitios nuevos: prefiltro desde las TIFF → forma v3 contra el nulo de tierra → % de terreno con pendiente <10° y llegada por tierra → nota = Forma + Superficie + Viabilidad.
- Rama `feature/shape` (local): línea de forma en la ficha y botón «Sort by shape». A zexu no le convence: la v2 no se parece en forma.
- (Superado: después se volvieron a descargar todas las TIFF en la rejilla de ±85°; ver el README actual.)

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

## 2026-11-14 (noche, 12) · «How it works» con el análisis en 3 fases (C_1)

- «01 Measure» añade presión del aire, viento y polvo (NASA MERRA-2, de ahí «satellites and models»).
- «03 Rank» explica los tres filtros (1 forma del terreno, 2 clima y aire, 3 que un equipo pueda llegar) y el embudo, de ≈1,7 millones de sitios a 20.

## 2026-11-14 (noche, 11) · Matriz de operaciones: solo sitios nuevos, MERRA-2 y calibración (C_2)

- **Solo análogos nuevos.** El enunciado pide evitarlos, así que, como en la búsqueda global, ninguna celda a ≤ 300 km de los 25 catalogados puede protagonizar una tarea. El mejor catalogado de cada tarea aparece aparte como **referencia** (`operations.json → tasks[].reference`).
- **Atmósfera MERRA-2 en uso** (`data/ee/atmo/`, de C_0): ya no queda ninguna aproximación activa. Los umbrales de polvo y viento se ponen por **posición dentro del rango terrestre**, porque la τ ≈ 0,5 de Marte está en el máximo absoluto de la Tierra (polvo en tierra firme: p50 0,013 · p95 0,21 · máx. 0,51).
- **NDVI recalibrado.** El suelo desnudo hiperárido da en MODIS NDVI p50 0,10 · p90 0,12. Con el umbral anterior (≤ 0,05), el núcleo de Atacama puntuaba 0 en astrobiología; ahora puntúa 0,92.
- **Sitios nuevos destacados:**
  - polvo → costa del Sáhara atlántico (Nuadibú, El Argub, Es-Semara) y Tibesti;
  - astrobiología → Desierto Oriental de Egipto y Pampa de Tarapacá;
  - sol rasante → Tierra de Francisco José y Nunavut;
  - EVA → Pamir, Karakórum y Kunlun;
  - travesías → Tibesti, Sinkiang y Atacama sur.
- **Nombres de lugar:** solo en alfabeto latino; al sur de 27,67°N, «Western Sahara» en lugar de un país (territorio en disputa).
- **Hallazgo revisado con la v3 de C_0** (`5ae7a4a`): 3 de los 15 mejores candidatos ya sirven para alguna tarea (≥ 0,8): Kapisa en EVA, y Sinkiang y Maidan Wardak en travesías. En la v2 no llegaba ninguno.
- Pendiente: mirar en imagen los sitios con nota 1 que están junto a ciudades.

## 2026-11-14 (tarde-noche, 7)

### Análisis v3 en tres fases, en producción
- Atmósfera de **NASA MERRA-2** (media de 2024): asset público `terra_atmo_01deg` y GeoTIFF en `data/ee/atmo/` (presión, viento a 10 m, humedad y polvo). Control: Tíbet 556 hPa; Sáhara con polvo 0,21; Amazonía con humedad 18,5 g/kg; Atacama con polvo 0,009.
- `src/data/ee-global.json` v3 generado con `10_tres_fases.js` y `merge-tres-fases.mjs`:
  - Shackleton: 89.321 → 8.933 → 20 celdas.
  - Jezero: 88.993 → 8.900 → 20.
  - Arcadia: 94.446 → 9.445 → 20.
- Ganadores: mesetas altas, secas y de aire tenue de Asia central (Tíbet, Qinghai, Sinkiang, Kirguistán, Afganistán), y Colorado para la Luna. Para Marte aparecen Qinghai y el borde del Taklamakán junto a **Qaidam**, un análogo conocido que habíamos excluido.
- ⚠ **La validación empeora:** pasan la fase 1 entre 4 y 7 de 25 análogos conocidos, y la fase 2 uno o ninguno. El doble filtro deja el ~0,5 % de la Tierra, y muchos análogos clásicos fallan en atmósfera (Atacama tiene aire muy limpio y Marte es polvoriento). Hay que decirlo en el pitch.
- Arreglado `10_tres_fases.js`: `mean()` necesita el mismo nombre de banda en todas las imágenes.

## 2026-11-14 (noche, 10) · Visor 3D accesible (C_1)

- **Diálogo:** tiene nombre («{candidato} compared with {objetivo}») y una descripción para lector de pantalla. Al abrirse, el foco va a «Close»; Tab y Mayús+Tab no salen del diálogo, y al cerrar (botón o Esc) el foco vuelve al botón que lo abrió.
- **Controles:** cada `<label>` envuelve solo su deslizador. Antes el nombre accesible del deslizador incluía el texto de los botones («Midday (45°)»…). Los deslizadores tienen `aria-valuetext` («25.0 degrees», «times 2»), los botones «Real imagery / Same grey» llevan `aria-pressed` y el «✕» de Close ya no se lee.
- **Terreno:** el lienzo 3D es `role="img"`, con un resumen leíble: «3D terrain, Earth · candidate: 33.95°N 51.35°E. Relief 1171 m, mean slope 6.9°, max slope 61°.»
- Comprobado en Chrome (/3d, Isfahan frente a Shackleton) con `tsc` y `eslint` sin avisos.

## 2026-11-14 (noche, 9) · Escena Luna → Tierra por tiempo, no por scroll

Pedido del usuario: el viaje de la Luna a la Tierra de la portada dependía del scroll (3,2 pantallas fijas) y se hacía pesado.
- `ContrastScene` (en `Story.tsx`) ahora ocupa **una pantalla** y se anima por **tiempo** (12 s), usando un `MotionValue` con `animate` en lugar de `useScroll`. Los textos y el movimiento son los mismos.
- Arranca sola al entrar en vista (55 %) y se **pausa sola** al salir. Los botones **Pause / Play** y **Replay ↺** miden 44 px (WCAG 2.2.2: el contenido que se mueve más de 5 s debe poder pausarse).
- Con movimiento reducido se ven los tres mensajes en columnas, como antes.
- Comprobado en Chrome: avanza 5/12 en 5 s, Pause congela la escena, Play la retoma y se pausa sola al subir a la portada.

## 2026-11-14 (noche, 8) · Estrategias de base y matriz de operaciones análogas

Encargo del usuario (vía C_0), hecho en la sesión C_2.
- Nuevo [estrategias-bases.md](estrategias-bases.md): una base para cada objetivo, con ubicación, energía, recursos, comunicaciones, terreno y riesgos, con fuentes NASA y científicas, y las suposiciones marcadas.
  - **Shackleton:** cresta de conexión con de Gerlache; solar en mástiles y fisión.
  - **Jezero:** frente del delta; fisión y solar. Sin hielo somero: es su punto débil como base.
  - **Arcadia:** llanura a ~40–45°N con hielo a < 1 m (SWIM); fisión.
- **Matriz reproducible «tarea × condiciones × sitios».** 11 tareas (EVA, sol rasante, frío extremo, perforación de hielo, polvo, aterrizaje, energía, construcción con regolito, rover, aislamiento y astrobiología).
  - Cada condición es una función de deseabilidad sobre nuestras variables.
  - Se calcula en **toda la rejilla** de `data/ee/`, sin limitarse a los candidatos.
  - Cada tarea da los 5 mejores sitios separados ≥ 300 km, 3 accesibles (≤ 6 h) y la nota de los 25 análogos conocidos. Si hay empate, gana el sitio más accesible.
  - Ficheros: `scripts/ops/tasks.mjs` (criterios), `scripts/ops/score-ops.mjs` (cálculo; también rellena la tabla del documento) y `scripts/ops/geotiff.mjs` (lector de GeoTIFF sin dependencias).
  - Resultado en `src/data/operations.json`.
- **Resultados principales:**
  - Sol rasante → Svalbard.
  - Frío extremo → meseta antártica (Concordia).
  - Astrobiología, polvo y aterrizaje → Atacama.
  - Permafrost → Ladakh, Badajshán y Devon.
  - EVA con aire fino → Pamir y Karakórum.
  - Aislamiento → Nunavut y Groenlandia.
- **Hallazgo:** los 5 mejores candidatos de cada objetivo (Irán, Afganistán, Canarias…) no llegan a 0,8 en ninguna tarea. Parecerse en conjunto no equivale a servir para ensayar una operación.
- **Fallo encontrado en `data/ee/*.tif`:** la rejilla estaba estirada a ±90°. Se avisó a C_0, que lo corrigió (`484e9b5`). El script lee la georreferencia de cada fichero y comprueba las altitudes contra `ee-global.json`.
- **Pendiente:**
  - Presión, viento y polvo de MERRA-2 (`data/ee/atmo/`, de C_0). Mientras tanto, la presión se estima desde la altitud y los criterios de polvo se omiten.
  - Capas de permafrost (ESA CCI), litología (ASTER) y lagos secos.
  - Una vista en la web (propuesta a C_0 y C_1; no se ha tocado ningún componente).

## 2026-11-14 (noche, 7) · Accesibilidad y una web que se explica sola

Prioridad del usuario: que se pueda usar y entender sin nadie que la presente.
- **«How it works»** en la portada (`src/components/HowItWorks.tsx`): qué es un análogo, en una frase, y los 3 pasos (Measure → Compare → Rank) con lenguaje llano.
- **Introducción en cada página** (`PageIntro`): «Step N of 5» con barra de progreso, un `h1` y una frase que explica qué se ve y qué se puede hacer. En /data va dentro de la cabecera de `DataExplorer`.
- **Estructura:** enlace «Skip to content», un único `<main>` en el layout (el de `DataExplorer` pasa a `div`) y `aria-label` en la navegación.
- **Navegación:** objetivos táctiles de 44 px.
- **Letra:** las clases de 9 y 10 px suben al mínimo del sistema (`--t-xs`, 11 px), y la atribución de Leaflet también.
- **Movimiento reducido:** la flecha de «Next» y el indicador «scroll» ya no se mueven en bucle, y ninguna animación CSS se repite.
- **Texto:** «Nobody had searched the whole planet» pasa a «We searched the whole planet» (lo primero no se puede demostrar, ver la auditoría).
- Lo que ya estaba hecho y no se ha tocado: el contraste AA de `--mut` y `--dim`, el foco visible y los marcadores de 44 px del globo («Consola v2» en `globals.css`).
- Comprobado: `tsc` y `eslint` sin errores, y revisado en Chrome a 767 px y 519 px de ancho. Lighthouse no se pudo pasar.

## 2026-11-14 (noche, 6)

### Web en varias páginas
- La historia se reparte en **5 páginas** con su propia URL:
  - `/` Home: portada y escena Luna → Tierra.
  - `/discover/`: elegir destino y deslizador.
  - `/3d/`: comparación en 3D, ahora con selector de los 5 mejores candidatos de cada objetivo.
  - `/method/`: validación, dónde se rompe la analogía y fuentes.
  - `/data/`: las pestañas técnicas.
- Barra de navegación común con indicador animado de la página activa (`SiteNav.tsx`) y enlace grande «Next →» al final de cada página.
- El destino elegido y el peso del deslizador se mantienen al cambiar de página (`AppState.tsx`, contexto en el layout).
- `Story.tsx` recibe `sections` y pinta solo las que pide cada página. El modo «explore» de la antigua portada pasa a `DataExplorer.tsx`.

## 2026-11-14 (noche, 5)

### Planetas 3D reales y arreglo del scroll bloqueado
- **Scroll bloqueado en la portada:** el globo ocupaba la pantalla y `OrbitControls` capturaba la rueda del ratón para hacer zoom. Nueva prop `zoom` en `Globe.tsx`; en la historia va a `false`, así que la rueda baja la página y arrastrar sigue girando el globo.
- **Planetas 3D reales:** nuevo `src/components/Planet3D.tsx` (three.js), una esfera con textura NASA, luz lateral con terminador día/noche, atmósfera en la Tierra y Marte y giro lento. Solo dibuja cuando está en pantalla (IntersectionObserver), no captura eventos y respeta `prefers-reduced-motion`. Sin WebGL usa la imagen plana. Sustituye a los orbes CSS en la escena del contraste, los destinos y el bloque 3D (9 contextos WebGL en total, sin errores).

## 2026-11-14 (noche, 4)

### Portada «historia» al estilo Apple
- Pedido del equipo: una web muy visual, animada e interactiva para vender el proyecto en el pitch, con poco texto técnico.
- Inspiración en GitHub: **Nutlope/hallmark** y **heydamir/unslop** (skills de diseño «anti-AI-slop»: nada de degradados morados, brillos ni emojis, enseñar el producto y una sola idea fuerte) y **garyhtou/vanta** (rover planetario contado con scroll en 3D, donde el usuario «toma el mando»).
- Nueva portada `src/components/Story.tsx` (React + framer-motion), página por defecto. Las pestañas de datos siguen detrás de «Explore the data»:
  1. **Portada:** «Where on Earth is the Moon?», entrada palabra a palabra, parallax y el globo 3D con los candidatos.
  2. **Escena fija de 320vh** (estilo Apple, ligada al scroll): la Luna gigante (−230 °C) se encoge, entra la Tierra (−81 °C) y termina en «Same extreme, not same number».
  3. Texto que **se ilumina palabra a palabra** con el scroll y contadores animados.
  4. **Elige destino:** orbes giratorios de la Luna y Marte. El globo y el top 3 cambian con animación.
  5. **Ciencia o logística:** un deslizador re-pondera en directo (1−w)·analogía + w·accesibilidad y la lista se reordena con animación. w = 1/3 es la nota oficial.
  6. **Entra en 3D:** dos orbes enfrentados; el bloque se expande al hacer scroll y abre el visor de 11 × 11 km.
  7. **Validación** con puntos animados frente a la mediana y el top 10 % de la Tierra, y **dónde se rompe la analogía** (1/6 g, vacío, −230 °C, radiación).
- Respeta `prefers-reduced-motion`: sin escena fija ni giros. Estilos `.orb` y `.slider` en `globals.css`.

## 2026-11-14 (noche) · Segunda tanda tras Crítico (sin publicar)

Veredicto de Crítico sobre el rediseño publicado: «sí con cambios». Aplicado:
1. Si falla la textura grande del globo, se queda la pequeña (antes caía al mapa 2D aunque el globo funcionaba).
2. Los marcadores de objetivo en Maps ya hacen algo: al pulsarlos, se seleccionan y el globo gira hasta ellos.
3. `prefers-reduced-motion` se respeta también si cambia con la página abierta.
4. La etiqueta ARIA solo promete «la lista de abajo» cuando hay candidatos.
Comprobado: tsc, eslint, next build; en local, globo de la Tierra (20 marcadores) y clic en Shackleton en la Luna (seleccionado, sin caer al 2D).
Pendiente: confirmar la política de uso de las capas de Moon/Mars Trek y si el reto pide algo más de atribución (lo deja abierto `docs/licencias-texturas.md`).

## 2026-11-14 (noche) · Rediseño con globos 3D publicado (Space Apps)

- Con el OK de zexu: `main` en `fd60435` (8 commits a nombre de zexu, sin firma de IA), push y deploy (gh-pages `8c9cf57`). Sin conflictos: `origin/main` no se había movido.
- Comprobado en vivo (HTML nuevo, con parámetro para evitar la caché): globo de la Tierra con 20 puntos, créditos en el HUD, texturas servidas (200). En local a 390 y 1280 px: Tierra, Luna y Marte, segundo toque abre el visor 11×11 km.
- Arreglos de última hora: globo con alto 0 en la pestaña Maps; planeta recortado a 390 px (el FOV se ajusta al ancho); texto del HUD solapado.
- Pendiente: revisión de Crítico (segunda tanda), probar táctil en móvil real y `text-[10px]`.

## 2026-11-14 (noche) · Rediseño con globos 3D (rama `feature/redesign-globes`, sin push)

- Propuesta de Diseño «Consola v2 + globos 3D», aprobada por zexu. Montada: globo de la Tierra con los 20 candidatos v2 (toque 1 = ficha, toque 2 = visor 11×11 km), globos de Luna y Marte con el objetivo marcado, reserva al mapa 2D sin WebGL, reduced-motion, tokens de contraste AA.
- Texturas en `public/tex/` (NASA GIBS Blue Marble, LROC WAC/SVS, Viking MDIM 2.1); créditos en el HUD, README y `docs/licencias-texturas.md`.
- Visor de terreno 11×11 km: aviso visible si no hay WebGL (antes, cuadro negro).
- Comprobado: tsc, eslint, next build, test de `globe-math` (6/6); globos de Tierra y Luna dibujados en local. Sin probar: Marte, móvil real, capturas a 390/1280 px. Puerta de integración: dom 16:00.
- Shape (Datos, prototipo): el máximo sobre desplazamientos y giros tiene un suelo alto (NCC de superficies al azar 0,47–0,67); solo 1 acierto limpio entre análogos conocidos. Recomendación: no meterlo en la nota ni en el pitch; como mucho, columna informativa si supera el nulo.

## 2026-11-14 (noche, 3)

### «Why this target?» en la web
- **El reto no da ninguna lista de sitios de la Luna ni de Marte.** Pide análogos de *candidate permanent Moon-base locations* y *future Mars landing and exploration sites* sin nombrar ninguno. Solo nombra análogos terrestres: Atacama, Haughton y Death Valley. Los 3 objetivos los elegimos nosotros.
- Cada objetivo tiene ahora `whyChosen` y `refs` en `src/data/targets.ts`, y un panel `src/components/TargetWhy.tsx` que se muestra al elegirlo en Candidatos y en Análisis.
  - **Shackleton:** estaba en la lista de 13 regiones candidatas de Artemis III de NASA en 2022 («Peak Near Shackleton», «Connecting Ridge»). **En la actualización de octubre de 2024 (9 regiones) ya no aparece**: quedan Malapert Massif, Haworth, Mons Mouton, entre otras. Lo mantenemos como referencia de base permanente en el polo sur.
  - **Jezero:** lugar de aterrizaje de Perseverance (2021), con delta fluvial conservado.
  - **Arcadia Planitia:** hielo a pocos metros según el proyecto SWIM de NASA; candidata para misiones humanas.

## 2026-11-14 (tarde) · Decisión de zexu: nos quedamos con Scoring v2 (Space Apps)

- Se mantiene Scoring v2 de Fer (`2174545`, `9bb7034`): tres dimensiones iguales (Surface, Relief, Access); el clima ya no puntúa. Candidatos = lista actual de `src/data/ee-global.json` (#1 Isfahan, #2 Parwan, #3 Tacna).
- Mensaje del pitch: «análogos parecidos Y accesibles para entrenar y probar equipos». Irán y Afganistán se presentan como análogo de terreno, no como propuesta de sitio.
- Todo se alinea con v2: Shape (Datos, repetir sobre la lista v2), guion/diapositivas (Pitch, v4), rediseño (Diseño) y textos de la web. `docs/pitch.md` sigue con la v1: pendiente de actualizar.
- Nota: el visor 3D de la web publicada salió en negro en el navegador de OpenBot (WebGL activo); sin confirmar si es fallo de la web o de la captura. El vídeo del visor debe grabarse en un ordenador real.

## 2026-11-14 (noche, 2)

### Puntuación v2: sin clima y con accesibilidad
- Decisión del equipo: **quitar el clima** de la puntuación y **valorar si es factible llevar materiales y personas** al sitio.
- **Accesibilidad:** tiempo de viaje a la ciudad más cercana de ≥50 000 habitantes (Oxford MAP 2015, Weiss et al. 2018). Nota = 1 − ln(1+h)/ln(73). Total = media de Superficie, Relieve y Accesibilidad.
- Primer resultado: ganaban Lima, el Caspio y el golfo de Patras. Se añadieron dos exclusiones: celdas con más de un 5 % de suelo urbano (MODIS MCD12Q1) y celdas con albedo < 0,08 (costa con agua).
- **Nuevos candidatos:** terrenos áridos y desnudos a menos de ~1 h de una ciudad, en Irán (Isfahán, Teherán, Qazvín), Afganistán (Parwán, Kabul), el sur de Perú (Tacna, Arequipa), Omán (montes Hajar), Canarias (Tenerife) y Argentina (San Juan). Los candidatos de la v1 en Nunavut quedaban a unos 6 días de una ciudad.
- Validación: 7–8 de los 25 análogos conocidos quedan en el 10 % mejor (Death Valley, Hawái, Wadi Rum, Lanzarote…).
- Asset nuevo `terra_access_01deg` (público). En `data/ee/access/` están la accesibilidad, su nota y la fracción urbana; en `data/ee/scores/*_total.tif` los totales v2. Se eliminan los mapas `*_clima.tif`.
- Problemas en Earth Engine: `reduceResolution` + `reproject` daba «User memory limit» en la descarga directa y «Reprojection output too large» en batch. Se resolvió con `focalMean` de 11 km a resolución nativa, muestreado en el centro de cada celda.
- ⚠ El guion de `docs/pitch.md` sigue con los candidatos de la v1: hay que reescribirlo.

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
