# Estrategias de base y operaciones análogas

> Encargo del equipo (14-11-2026): para cada objetivo de TerraVista, cómo sería una base y qué ensayos habría que hacer antes en la Tierra. **Idea clave:** cada ensayo no tiene por qué hacerse en el mismo sitio. Debe hacerse en el lugar de la Tierra que cumpla las condiciones de **esa** tarea.
>
> Etiquetas: **[fuente]** = dato publicado (ver §8); **[suposición]** = propuesta nuestra, razonada pero sin fuente que la respalde tal cual; **[proxy]** = variable aproximada a partir de otra.

## 0. Resumen

| Objetivo | Dónde poner la base | Energía | Recurso clave | Lo que más hay que ensayar en la Tierra |
|---|---|---|---|---|
| **Shackleton** (Luna, polo sur) | Cresta que une el borde de Shackleton con de Gerlache, a pocos km de los cráteres en sombra | Solar en mástiles verticales (luz el 80–90 % del año en los mejores puntos) + fisión para la noche | Hielo en el regolito de los cráteres en sombra permanente | Sol rasante y sombras largas, frío extremo, polvo levantado al aterrizar |
| **Jezero** (Marte) | Suelo del cráter, junto al frente del delta y al depósito de muestras de Perseverance | Fisión + solar (las tormentas de polvo pueden durar meses) | Ciencia: sedimentos del lago y muestras. Oxígeno del CO₂ (MOXIE). Sin hielo somero | Muestreo astrobiológico, polvo, travesías con rover |
| **Arcadia Planitia** (Marte) | Llanura a ~40–45°N donde SWIM ve hielo a < 1 m | Fisión (latitud media, invierno largo) | Hielo somero → agua, oxígeno, combustible | Perforación de hielo y permafrost, aterrizaje y plataforma, energía en frío |

## 1. Principio: una tarea, un sitio

Ningún lugar de la Tierra reproduce la Luna ni Marte entero (ver la validación en [metodo.md](metodo.md): incluso los análogos famosos solo encajan en parte). Pero cada **tarea** de una misión depende solo de unas pocas condiciones. Por ejemplo:

- Perforar hielo necesita suelo helado y seco.
- Ensayar con polvo necesita polvo y viento, no frío.
- Navegar con sol rasante necesita latitud polar, no aridez.

Por eso, para cada tarea:
1. escribimos sus **condiciones necesarias** solo con nuestras variables (temperaturas MODIS, lluvia GPM, NDVI, albedo, pendiente, altitud, presión, viento y polvo MERRA-2, y tiempo de viaje a una ciudad);
2. convertimos cada condición en una **función de deseabilidad** de 0 a 1;
3. combinamos las funciones con una **media geométrica ponderada** (si una condición vale 0, el sitio queda descartado);
4. lo calculamos en **toda la rejilla** de 0,1° (unos 11 km), sin limitarnos a nuestros 60 candidatos;
5. elegimos los 5 mejores sitios separados al menos 300 km entre sí, más 3 «accesibles» (a ≤ 6 h de una ciudad). Si dos sitios empatan, gana el más accesible;
6. **solo sitios nuevos.** El enunciado pide evitar los análogos ya conocidos, así que, como en la búsqueda global, ninguna celda a ≤ 300 km de los 25 análogos catalogados puede protagonizar una tarea. El mejor análogo catalogado de cada tarea aparece aparte, **como referencia**.

Todo es reproducible: los criterios están en [`scripts/ops/tasks.mjs`](../scripts/ops/tasks.mjs) y `node scripts/ops/score-ops.mjs` regenera [`src/data/operations.json`](../src/data/operations.json) y la tabla del §5.

## 2. Base en Shackleton (polo sur de la Luna)

**Por qué este objetivo:** [`src/data/targets.ts`](../src/data/targets.ts). Shackleton estaba entre las 13 regiones candidatas de Artemis III en 2022 («Peak Near Shackleton», «Connecting Ridge»). En la actualización de 2024 quedaron 9 regiones y Shackleton ya no aparece por su nombre **[fuente: NASA 2022, 2024]**.

### Ubicación
- **La cresta de conexión entre Shackleton y de Gerlache** (en torno a 89,4°S, 222°E) y los puntos altos del borde de Shackleton. Allí se juntan dos cosas que casi no se dan juntas:
  - **luz casi continua:** los mejores puntos están iluminados en torno al **80–90 % del año** **[fuente: Bussey et al. 2010; Mazarico et al. 2011]**;
  - **frío permanente** a pocos km: el interior de Shackleton no ve nunca el Sol.
- Base en el alto iluminado; las operaciones en la sombra se hacen como **salidas cortas** al cráter (rover o EVA) **[suposición]**.
- **Aterrizaje:** NASA eligió las regiones de Artemis III por iluminación, comunicación con la Tierra y **pendiente** **[fuente: NASA 2022]**. Las zonas de aterrizaje tienen que quedar **a cierta distancia del hábitat** para que el chorro del motor no lance regolito contra él **[fuente: Metzger et al.; suposición en la distancia exacta]**.

### Energía
- **Solar en mástiles verticales:** el Sol queda siempre a ~1,5° del horizonte, así que los paneles tienen que ser verticales, altos y seguir al Sol en acimut. Un mástil de 10 m gana horas de luz sobre el relieve vecino **[fuente: Mazarico et al. 2011 calcula la iluminación a varias alturas]**.
- **Fisión** para los periodos de sombra y para las operaciones dentro del cráter: NASA desarrolla **Fission Surface Power**, de clase 40 kWe **[fuente: NASA FSP]**.

### Recursos
- **Hielo de agua** en los cráteres en sombra permanente:
  - LCROSS detectó ~5,6 % de agua en Cabeus **[fuente: Colaprete et al. 2010]**;
  - M³ vio hielo expuesto en la superficie de cráteres polares **[fuente: Li et al. 2018]**;
  - el suelo de Shackleton es algo más brillante, compatible con algo de hielo, pero no masivo **[fuente: Zuber et al. 2012]**.
- **Regolito** de las tierras altas (anortosita, clara) para berma, blindaje y sinterizado. Ojo: no es basalto, así que el análogo de construcción «oscuro» de la Tierra encaja peor aquí (ver §5, `regolith_build`).

### Comunicaciones
- La Tierra queda muy baja en el horizonte y la tapan el relieve y la libración: **visibilidad intermitente**. Hace falta **relevo por satélite** (proyecto LCRNS de NASA, arquitectura LunaNet) o un repetidor en un punto alto **[fuente: NASA LCRNS; suposición sobre el repetidor]**.
- Retardo de ~2,6 s ida y vuelta.

### Riesgos
- **Frío y ciclos térmicos:** en los cráteres en sombra, menos de 40 K (−233 °C) **[fuente: Paige et al. 2010]**. Fuera de rango para toda la Tierra.
- **Polvo:** abrasivo y electrostático; en Apollo dañó trajes, sellos y radiadores **[fuente: Gaier 2005]**.
- **Radiación:** unos 1,4 mSv/día en la superficie **[fuente: Zhang et al. 2020, Chang'e 4 LND]**. Hace falta blindaje con regolito.
- **Iluminación rasante:** deslumbramiento y contraste extremo, que afectan a la navegación y a las cámaras.

## 3. Base en Jezero (Marte)

**Por qué este objetivo:** Perseverance aterrizó allí en 2021: es el sitio de Marte mejor caracterizado (datos orbitales más medidas desde el suelo) y guarda el depósito de muestras de Three Forks para Mars Sample Return **[fuente: NASA Mars 2020]**.

### Ubicación
- **Suelo del cráter, al pie del frente del delta occidental** (~18,4°N, 77,5°E): terreno llano para aterrizar y, a pocos km, los sedimentos del antiguo lago y del delta. Ahí está el valor científico **[suposición sobre el punto exacto]**.
- Cerca del depósito de **Three Forks**, para recoger o reanalizar muestras **[suposición]**.

### Energía
- Solar: en Marte llega ~43 % de la luz que llega a la Tierra (1/1,52²). Además, una **tormenta global de polvo** puede bloquear el Sol durante semanas o meses: Opportunity se perdió así en 2018 **[fuente: NASA]**.
- Por eso: **fisión como base y solar como complemento**, que es la recomendación de NASA para misiones tripuladas a Marte **[fuente: Mars DRA 5.0]**.

### Recursos
- **Oxígeno del CO₂:** MOXIE produjo 122 g de O₂ en Jezero entre 2021 y 2023 **[fuente: NASA 2023]**.
- **Agua:** Jezero **no** tiene hielo somero conocido. El agua tendría que salir de minerales hidratados (arcillas, sulfatos), con mucha más energía. **Es la principal debilidad de Jezero como base permanente** **[suposición razonada]**.

### Comunicaciones
- Relevo con los orbitadores (MRO, MAVEN, TGO), como hace Perseverance hoy **[fuente: NASA]**.
- Retardo de 4 a 24 min en un sentido, y unas 2 semanas sin contacto cada vez que el Sol queda entre la Tierra y Marte (conjunción solar, cada ~26 meses) **[fuente: NASA]**.

### Riesgos
- **Polvo** fino y oxidante (percloratos), que se mete en sellos y mecanismos.
- **Radiación:** ~0,67 mSv/día en la superficie **[fuente: Hassler et al. 2014, MSL RAD]**.
- **Frío:** −80 a −90 °C de noche.
- **Presión:** ~7 hPa, fuera del rango terrestre.

## 4. Base en Arcadia Planitia (Marte)

**Por qué este objetivo:** el proyecto SWIM de NASA encuentra hielo de agua a menos de un metro de profundidad en partes de Arcadia **[fuente: Morgan et al. 2021]**, y otros estudios ven hielo masivo de decenas de metros de grosor bajo la llanura **[fuente: Bramson et al. 2015]**.

### Ubicación
- **Llanura a ~40–45°N** donde SWIM da más fiabilidad de hielo somero. Es lo bastante al sur para que el invierno sea llevadero y lo bastante al norte para tener hielo cerca de la superficie **[fuente: Morgan et al. 2021; suposición sobre el rango exacto de latitud]**.
- **Terreno muy llano y bajo** (unos −3 a −4 km de altitud MOLA): más atmósfera por encima, que ayuda a frenar al entrar, y menos pendiente al aterrizar **[fuente: MOLA; suposición sobre el margen de entrada]**.
- **Varias plataformas de aterrizaje** separadas del hábitat, porque el chorro del motor puede excavar el suelo helado.

### Energía
- **Fisión** como base: a latitud media, el invierno es largo y frío y el polvo y las heladas de CO₂ reducen lo que da la solar **[fuente: Mars DRA 5.0; suposición sobre la latitud]**.

### Recursos
- **Hielo somero:** agua para beber, oxígeno y combustible de metano y oxígeno, el mismo esquema ISRU que propone DRA 5.0 **[fuente: Mars DRA 5.0]**.
- Regolito para cubrir el hábitat.

### Comunicaciones
- Igual que en Jezero: relevo orbital y conjunción solar.

### Riesgos
- **Frío:** −100 a −120 °C de noche en invierno **[valores aproximados de `targets.ts`]**.
- **Escarcha** de CO₂ estacional.
- **Polvo** y **radiación**, como en Jezero.
- El hielo puede **hundirse o deformarse** bajo cargas y si se calienta: el hábitat no puede calentar el suelo **[suposición]**.

## 5. Matriz de operaciones análogas

Cada fila es una tarea de misión. Las condiciones se escriben con las variables de nuestras capas. La regla `lo(a, b)` vale 1 por debajo de a y 0 por encima de b; `hi(a, b)` es lo contrario; `band(a, b, c, d)` vale 1 entre b y c. Los sitios salen de recorrer **toda la Tierra** con [`score-ops.mjs`](../scripts/ops/score-ops.mjs).

<!-- ops:start -->
_Generado el 2026-11-14 con `node scripts/ops/score-ops.mjs` · rejilla 85°N to -85°, 0.100° × 0.100° · presión MERRA-2 · polvo y viento MERRA-2. Entre paréntesis: nota de la tarea (0–1) y horas hasta la ciudad más cercana. «Nuevos» = a más de 300 km de los 25 análogos catalogados._

| Tarea | Objetivos | Condiciones (variable y regla) | Mejores sitios nuevos | Nuevos accesibles (≤ 6 h) | Referencia: mejor análogo ya catalogado |
|---|---|---|---|---|---|
| **Spacesuit EVA on cold, rough, thin-air terrain**<br>`eva_cold_rough` | Shackleton, Jezero, Arcadia | `lst_min` lo(-40, 0)<br>`slope` band(1, 2.5, 6, 10)<br>`ps_hpa` lo(600, 900)<br>`ndvi` lo(0.12, 0.25) | Gorno-Badakhshan Autonomous Region, Tajikistan (1.00, 23 h)<br>Gilgit-Baltistan, Pakistan (1.00, 30 h)<br>Xinjiang, China (1.00, 49 h) | Xizang, China (0.98, 5.8 h)<br>Ladakh, India (0.93, 5.6 h) | — |
| **Navigation and operations under low-angle sun and long shadows**<br>`grazing_sun` | Shackleton | `abs_lat` hi(66.5, 78)<br>`slope` band(1, 3, 8, 15)<br>`albedo` lo(0.35, 0.6)<br>`ndvi` lo(0.12, 0.25) | Arkhangelsk Oblast, Russia (1.00, 84 h)<br>Nunavut, Canada (1.00, 137 h)<br>Nunavut, Canada (1.00, 143 h) | Finnmark, Norway (0.67, 6.0 h)<br>Krasnoyarsk Krai, Russia (0.54, 2.0 h) | Svalbard (AMASE) (0.95) |
| **Hardware and EVA in extreme cold (permanently shadowed craters)**<br>`cold_trap` | Shackleton | `lst_min` lo(-75, -30)<br>`lst_max` lo(-10, 10)<br>`precip` lo(100, 300) | Antarctica (1.00)<br>Antarctica (1.00)<br>Antarctica (1.00) | — | Concordia (Dome C) (1.00) |
| **Drilling and extracting shallow ground ice**<br>`permafrost_drill` | Arcadia, Shackleton | `lst_mean` lo(-10, -2)<br>`precip` lo(150, 400)<br>`slope` lo(2, 6)<br>`ndvi` lo(0.12, 0.25) | Badakhshan Province, Afghanistan (1.00, 9.5 h)<br>Ladakh, India (1.00, 13 h)<br>Xinjiang, China (1.00, 41 h) | Sakha Republic, Russia (0.88, 3.1 h)<br>Xinjiang, China (0.73, 5.4 h) | Haughton / Devon (0.96) |
| **Operations with dust: abrasion, seals and panel cleaning**<br>`dust_ops` | Jezero, Arcadia | `dust_aod` hi(0.03, 0.2)<br>`wind_ms` hi(4, 7)<br>`precip` lo(50, 200)<br>`ndvi` lo(0.12, 0.2)<br>`albedo` band(0.18, 0.25, 0.35, 0.45)<br>`lst_max` hi(15, 35) | Dakhlet Nouadhibou, Mauritania (0.97, 1.5 h)<br>Cercle d'El Argoub, Western Sahara (0.97, 2.5 h)<br>Cercle d'Es-Semara, Western Sahara (0.95, 6.1 h) | Dakhlet Nouadhibou, Mauritania (0.97, 1.5 h)<br>Cercle d'El Argoub, Western Sahara (0.97, 2.5 h) | Qaidam (0.45) |
| **Landing and launch: pad, plume and ejected debris**<br>`landing_pad` | Arcadia, Jezero, Shackleton | `slope` lo(0.5, 2)<br>`ndvi` lo(0.12, 0.2)<br>`precip` lo(100, 400)<br>`albedo` band(0.12, 0.18, 0.35, 0.5) | Riyadh Region, Saudi Arabia (1.00, 0.2 h)<br>Cairo, Egypt (1.00, 0.3 h)<br>Makkah Region, Saudi Arabia (1.00, 0.3 h) | Riyadh Region, Saudi Arabia (1.00, 0.2 h)<br>Cairo, Egypt (1.00, 0.3 h) | Qaidam (1.00) |
| **Deploying power in cold, dusty, thin air (solar + fission)**<br>`power_mars` | Jezero, Arcadia | `precip` lo(50, 250)<br>`ndvi` lo(0.12, 0.2)<br>`lst_min` lo(-30, 0)<br>`ps_hpa` lo(650, 950)<br>`dust_aod` hi(0.013, 0.12) | Xinjiang, China (1.00, 20 h)<br>Xinjiang, China (0.97, 9.2 h)<br>Xinjiang, China (0.95, 24 h) | Xinjiang, China (0.95, 5.4 h)<br>Gansu, China (0.82, 5.2 h) | Qaidam (0.78) |
| **Building with regolith (sintering, 3D printing, berms)**<br>`regolith_build` | Shackleton, Jezero, Arcadia | `albedo` band(0.08, 0.1, 0.18, 0.25)<br>`ndvi` lo(0.12, 0.2)<br>`slope` lo(1, 3)<br>`precip` lo(100, 300) | Red Sea State, Sudan (1.00, 0.2 h)<br>Hormozgan Province, Iran (1.00, 0.4 h)<br>Western Sahara (1.00, 0.5 h) | Red Sea State, Sudan (1.00, 0.2 h)<br>Hormozgan Province, Iran (1.00, 0.4 h) | Death Valley / Mojave (0.80) |
| **Long-distance rover traverses**<br>`rover_traverse` | Jezero, Arcadia | `slope` band(0.3, 0.8, 3, 6)<br>`ndvi` lo(0.12, 0.2)<br>`precip` lo(100, 300) | Tibesti, Chad (1.00, 29 h)<br>Xinjiang, China (1.00, 36 h)<br>Atacama Region, Chile (0.99, 2.3 h) | Atacama Region, Chile (0.99, 2.3 h)<br>Xinjiang, China (0.99, 4.7 h) | Wadi Rum (0.95) |
| **Crew isolation and delayed communications**<br>`isolation` | Shackleton, Jezero, Arcadia | `access_h` hi(24, 72)<br>`ndvi` lo(0.15, 0.35)<br>`lst_min` lo(-30, 0) | Nunavut, Canada (1.00, 72 h)<br>Northwest Territories, Canada (1.00, 72 h)<br>Greenland (1.00, 72 h) | — | Haughton / Devon (1.00) |
| **Astrobiology sampling in hyper-arid sediments**<br>`astrobio` | Jezero | `precip` lo(25, 100)<br>`ndvi` lo(0.11, 0.16)<br>`albedo` band(0.15, 0.2, 0.35, 0.45)<br>`slope` lo(1, 3) | Cairo, Egypt (1.00, 0.3 h)<br>Asyut, Egypt (1.00, 0.5 h)<br>Aswan, Egypt (1.00, 0.7 h) | Cairo, Egypt (1.00, 0.3 h)<br>Asyut, Egypt (1.00, 0.5 h) | Wadi Rum (0.99) |
<!-- ops:end -->

### Plan de ensayos por base (lectura de la matriz del 14-11, con MERRA-2)
Esto es una propuesta nuestra **[suposición]** que lee la tabla de arriba. Si cambian los datos, hay que volver a leerla.

Todos los sitios propuestos son **nuevos** (a más de 300 km de los análogos catalogados). El catalogado va en la última columna, solo como referencia.

| Base | Ensayo | Primera fase, accesible (nuevo) | Campaña completa (nuevo) | Referencia ya catalogada |
|---|---|---|---|---|
| **Shackleton** | Sol rasante y sombras largas | Finnmark (norte de Noruega), en marzo o septiembre | Tierra de Francisco José (Arjánguelsk), Severnaya Zemlyá (Krasnoyarsk) y el Ártico de Nunavut, en torno a los equinoccios, cuando el Sol pasa bajo | Svalbard (AMASE) |
| | Frío extremo (hardware) | Cámara criogénica | Meseta antártica oriental, a más de 300 km de Concordia | Concordia (Dome C) |
| | EVA en terreno frío y rugoso | Tíbet (Xizang), Ladakh y Panjshir, a ≤ 6 h de una ciudad | Pamir (Gorno-Badajshán), Karakórum (Gilgit-Baltistán) y Kunlun (Sinkiang): 4 000–6 000 m, unos 520–600 hPa | — (ningún catalogado llega) |
| | Aterrizaje y chorro sobre el regolito | Llanuras desérticas junto a Riad, El Cairo y La Meca (a < 0,5 h) | Igual | Qaidam |
| **Jezero** | Muestreo astrobiológico | Desierto Oriental de Egipto (El Cairo, Asiut, Asuán) | Pampa de Tarapacá (Chile, al norte del análogo de Atacama) y Sáhara atlántico | Wadi Rum; Atacama, 0,92 |
| | Polvo | Costa del Sáhara atlántico: Nuadibú (Mauritania), El Argub y Es-Semara (polvo 0,2–0,34, viento ≈ 6 m/s) | Tibesti (Chad) | Qaidam (solo 0,45: poco polvo en el aire) |
| | Travesías con rover | Región de Atacama (al sur del análogo catalogado), Arica y Sinkiang | Tibesti (Chad), Sinkiang y el Tíbet occidental (llanuras continuas de unos 75 km) | Wadi Rum; Atacama, 0,93 |
| | Energía con frío, polvo y aire fino | Sinkiang (Kunlun) y Gansu | Vertiente norte del Kunlun (Sinkiang): frío, 600–700 hPa y polvo del Taklamakán | Qaidam |
| **Arcadia** | Perforación de hielo y permafrost | Yakutia (Sajá, a 3 h de Yakutsk) | Badajshán y Ladakh (permafrost de altura), Kolymá (Sajá) | Haughton / Devon |
| | Plataforma de aterrizaje en llanura | Igual que en Shackleton (Riad, El Cairo, La Meca) | Igual | Qaidam |
| **Las tres** | Aislamiento | — (por definición, no hay sitio accesible) | Nunavut, Territorios del Noroeste y Groenlandia (> 72 h de una ciudad) | Haughton / Devon |
| | Construcción con regolito | Costa del mar Rojo (Sudán), Hormozgán (Irán) y Sáhara atlántico, con suelo oscuro | Falta confirmar que el suelo es basáltico (ASTER). En Shackleton es **anortosita**, no basalto | Death Valley / Mojave |

**Ojo con los empates.** Muchas tareas tienen decenas de celdas con nota 1. El desempate por accesibilidad acerca los sitios a las ciudades (Riad, El Cairo…), lo que es útil para ensayar barato. Aun así, **hay que mirar en imagen cada sitio** antes de proponerlo, porque una celda de 11 km junto a una ciudad puede incluir zonas de cultivo o carreteras.

### Hallazgo: parecerse en conjunto no es servir para ensayar
Se comprobó qué tareas puede alojar cada uno de los 5 mejores candidatos de cada objetivo (15 en total):
- **v2** (forma + accesibilidad: Irán, Afganistán, Perú, Canarias, Omán…): **ninguno llega a 0,8 en ninguna tarea**. El mejor es Al Batinah (Omán), con 0,75 en construcción con regolito. Son sitios templados y bajos, así que fallan en frío, en altitud o en aridez extrema.
- **v3** (forma → clima + atmósfera → accesibilidad; commit `5ae7a4a` de C_0): los candidatos pasan a desiertos fríos y altos (Colorado, Tíbet, Sinkiang, Qinghai, Afganistán, Kirguistán), y **3 de 15** ya llegan a 0,8:
  - Kapisa (Afganistán): EVA, 0,84;
  - Sinkiang: travesías con rover, 1,0;
  - Maidan Wardak (Afganistán): travesías con rover, 0,81.

  Los otros 12 siguen por debajo.

La lectura: añadir clima y atmósfera acerca la búsqueda global a lo que sirve para ensayar, pero **parecerse en conjunto y servir para una operación siguen siendo dos preguntas distintas**. La búsqueda global dice dónde la Tierra se parece al objetivo; la matriz dice dónde ensayar cada paso. La web debería enseñar las dos. Las notas por candidato están en `operations.json → candidates`.

### Calibración de los umbrales (14-11, noche)
- **NDVI.** En las celdas hiperáridas (< 50 mm/año), MODIS da NDVI p10 0,06 · p50 0,10 · p90 0,12, porque el suelo desnudo claro no da 0. Con el umbral inicial (≤ 0,05), el corazón de Atacama (Yungay, NDVI 0,106) puntuaba 0 en astrobiología. Ahora «sin vegetación» es NDVI ≤ 0,11–0,12, y Atacama queda a 0,92.
- **Polvo y viento (MERRA-2 2024, tierra firme).** Espesor óptico del polvo: p50 0,013 · p75 0,03 · p90 0,12 · p95 0,21 · máx. 0,51. Viento: p50 4,3 m/s · p90 8,1 m/s. La τ ≈ 0,5 de Marte está en el **máximo absoluto** de la Tierra, así que, como en [metodo.md](metodo.md), los umbrales se ponen por **posición dentro del rango terrestre**: el 0 en torno a la mediana y el 1 en el p90–p95.
- **Atacama es limpia de polvo:** espesor óptico 0,009, en la mediana terrestre. Por eso no protagoniza la tarea de polvo, aunque sea el mejor análogo para muestrear.

### Cómo leer la matriz
- **«Mejor sitio»** es el que mejor cumple las condiciones, tenga o no logística. **«Accesible»** es el mejor a ≤ 6 h de una ciudad: el sitio para ensayar a menudo y barato, antes de ir al remoto.
- **«Referencia»** es el análogo ya catalogado (Atacama, Devon, McMurdo, Svalbard…) que mejor cumple esa tarea. Sirve para comparar el sitio nuevo con lo que ya se usa. La nota de los 25 catalogados en cada tarea está en `operations.json → tasks[].known`.
- Muchos ensayos tienen **dos fases** **[suposición]**:
  1. primero, en un sitio accesible que cumple la condición principal;
  2. después, una campaña corta en el sitio remoto que lo cumple todo.

  Un ejemplo es la EVA: primero en el Pamir o en los Andes a ≤ 6 h de una ciudad, y luego en la meseta tibetana a más de 5 000 m.

## 6. Lo que ningún sitio de la Tierra puede simular

| Condición | Valor | Dónde se ensaya en su lugar |
|---|---|---|
| Gravedad 1/6 g (Luna) y 3/8 g (Marte) | — | Vuelos parabólicos, flotabilidad neutra (NBL de NASA, NEEMO) y grúas de descarga (ARGOS en JSC) **[fuente: NASA]** |
| Vacío lunar / 7 hPa de CO₂ en Marte | Fuera del rango terrestre | Cámaras de vacío térmico (por ejemplo, la Chamber A de JSC) **[fuente: NASA]**. Lo más cercano en la Tierra son las mesetas de más de 5 km (`ps_hpa` ≈ 520–560 hPa según MERRA-2) |
| −233 °C de los cráteres en sombra | La Tierra llega a ~−75 °C (p1 de MODIS) | Cámaras criogénicas. La Antártida (Dome C) sirve para la logística, no para la temperatura |
| Radiación sin magnetosfera | 0,7–1,4 mSv/día | NSRL (Brookhaven) para biología y materiales **[fuente: NASA]** |
| Retardo de comunicaciones | 2,6 s / 4–24 min | Se simula en cualquier sitio: HERA, CHAPEA, Mars-500 **[fuente: NASA, IBMP]** |

## 7. Cómo recalcular
```bash
node scripts/ops/score-ops.mjs              # lee data/ee/*.tif, escribe src/data/operations.json y la tabla del §5
node scripts/ops/score-ops.mjs --no-geocode # sin pedir nombres de lugar (usa la caché)
```
- **Cambiar una tarea:** editar sus criterios en `scripts/ops/tasks.mjs`.
- **Capas MERRA-2** (`data/ee/atmo/{ps_hpa,wind_ms,dust_aod}.tif`, en uso desde el 14-11 por la noche). Si faltan:
  - la presión se estima desde la altitud con la atmósfera estándar **[proxy]**;
  - los criterios de viento y polvo se omiten.

  `operations.json → proxies` dice si hay alguna aproximación activa.
- **Georreferencia:** el script lee la del propio fichero y comprueba que las altitudes cuadran con `ee-global.json`. Avisa si el error medio pasa de 200 m.
- **Análogos catalogados:** la lista sale de `scripts/ee/10_tres_fases.js` (`KNOWN`), la misma que usa la búsqueda global. Ninguna celda a ≤ 300 km de ellos puede protagonizar una tarea.
- **Nombres de lugar:** salen de OpenStreetMap Nominatim, a 1 petición por segundo y con caché en `scripts/ops/geocode-cache.json`. Solo se envían coordenadas.

## 8. Huecos de datos
| Hueco | Afecta a | Capa que lo cubriría |
|---|---|---|
| Permafrost y hielo en el suelo | `permafrost_drill` | ESA CCI Permafrost (Obu et al. 2019) |
| Litología (basalto o no) | `regolith_build` | ASTER GED (emisividad, índice de sílice) |
| Lagos secos, deltas y salares | `astrobio` | Global Lakes and Wetlands Database |
| Iluminación real a escala de km | `grazing_sun` | Modelo de sombras sobre DEM (horizonte por celda). Hoy solo se usa la latitud |
| Polvo a escala fina | `dust_ops`, `power_mars` | MERRA-2 tiene una rejilla de ~0,5° × 0,625°. Para fuentes de polvo concretas: MODIS Deep Blue AOD (10 km) |

## 9. Fuentes
- NASA (2022). *NASA Identifies Candidate Regions for Landing Next Americans on Moon.* https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/
- NASA (2024). *NASA Provides Update on Artemis III Moon Landing Regions.* https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/
- Bussey, D. B. J. et al. (2010). Illumination conditions of the south pole of the Moon derived using Kaguya topography. *Icarus* 208, 558–564.
- Mazarico, E. et al. (2011). Illumination conditions of the lunar polar regions using LOLA topography. *Icarus* 211, 1066–1081.
- Paige, D. A. et al. (2010). Diviner Lunar Radiometer observations of cold traps in the Moon's south polar region. *Science* 330, 479–482.
- Colaprete, A. et al. (2010). Detection of water in the LCROSS ejecta plume. *Science* 330, 463–468.
- Zuber, M. T. et al. (2012). Constraints on the volatile distribution within Shackleton crater at the lunar south pole. *Nature* 486, 378–381.
- Li, S. et al. (2018). Direct evidence of surface exposed water ice in the lunar polar regions. *PNAS* 115, 8907–8912.
- Gaier, J. R. (2005). *The Effects of Lunar Dust on EVA Systems During the Apollo Missions.* NASA/TM-2005-213610.
- Metzger, P. T., Smith, J. & Lane, J. E. (2011). Phenomenology of soil erosion due to rocket exhaust on the Moon and the Mauna Kea lunar test site. *Journal of Geophysical Research: Planets* 116, E06005.
- Zhang, S. et al. (2020). First measurements of the radiation dose on the lunar surface. *Science Advances* 6, eaaz1334.
- NASA. Fission Surface Power. https://www.nasa.gov/space-technology-mission-directorate/tdm/fission-surface-power/
- NASA. Lunar Communications Relay and Navigation Systems (LCRNS) / LunaNet. https://www.nasa.gov/directorates/somd/space-communications-navigation-program/lunar-communications-relay-and-navigation-systems/
- NASA. Mars 2020 Perseverance. https://science.nasa.gov/mission/mars-2020-perseverance/
- NASA (2023). *NASA's Oxygen-Generating Experiment MOXIE Completes Mars Mission.* https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/
- Hassler, D. M. et al. (2014). Mars' surface radiation environment measured with the Mars Science Laboratory's Curiosity rover. *Science* 343, 1244797.
- Drake, B. G. (ed.) (2009). *Human Exploration of Mars Design Reference Architecture 5.0.* NASA-SP-2009-566.
- Morgan, G. A. et al. (2021). Availability of subsurface water-ice resources in the northern mid-latitudes of Mars. *Nature Astronomy* 5, 230–236. SWIM: https://swim.psi.edu/
- Bramson, A. M. et al. (2015). Widespread excess ice in Arcadia Planitia, Mars. *Geophysical Research Letters* 42, 6566–6574.
- Obu, J. et al. (2019). Northern Hemisphere permafrost map based on TTOP modelling for 2000–2016 at 1 km² scale. *Earth-Science Reviews* 193, 299–316.
- Weiss, D. J. et al. (2018). A global map of travel time to cities to assess inequalities in accessibility in 2015. *Nature* 553, 333–336.
- Datos de las capas: [datos.md](datos.md) y [data/ee/README.md](../data/ee/README.md).
