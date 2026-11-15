# Preguntas difíciles del jurado (y cómo responder)

Preparación del pitch, 15-11-2026. **El jurado preguntará en español**, así que las respuestas están en español y listas para decir en voz alta (30–40 s cada una). Los nombres propios y de datos (MODIS, Trek, Jezero…) se dicen tal cual. Debajo de cada respuesta va la **trampa**: qué no decir o en qué os pueden pillar.

Todo sale de la web actual (portada de misiones + «Plan a base») y de `docs/logos/method.md`, `docs/logos/missions.md`, `docs/sitios-base.md` y `docs/estrategias-bases.md`.

> ⚠ **`docs/pitch.md` está desactualizado**: describe el prototipo anterior (Shackleton, Ellesmere, 25 análogos, pestaña «Candidatos»), que ahora está en `/appendix/`. No uséis sus cifras. Las que valen son las de esta hoja.

## Cifras que hay que saber de memoria
- **4 misiones**, cada una basada en campañas reales: M1 EVA con traje en terreno volcánico (objetivo: Mons Mouton, polo sur lunar) · M2 rover en arena (cráter Jezero, Marte) · M3 hielo en el suelo (Arcadia Planitia, Marte) · M4 Sol bajo y energía solar (Mons Mouton). **M4 está calculada, no validada.**
- **Celdas de 0,1° (~11 km)**, toda la tierra firme; datos de **2024** (MODIS vegetación y albedo, MODIS temperatura, GPM IMERG lluvia, SoilGrids arena, GLiM rocas volcánicas).
- **Índice = 0,5·F + 0,5·(1 − D)**. F: fracción de condiciones cumplidas. D: distancia (en percentiles terrestres) a la mediana de los análogos conocidos de esa misión.
- **Validación:** M1 3 de 4 análogos conocidos en el 2 % superior; M2 3 de 3 en el 2,1 %; M3 2 de 2 en el 1 %. Control negativo (Amazonia central): percentil 31, 1,5 y 2,8.
- **19 regiones nuevas** (5 · 6 · 4 · 4). Todas con índice ≥ 0,98: **no se ordenan entre sí por el índice**.
- **Filtro de terreno** de cada región: pendiente media ≤ 10°, ≤ 10 % nieve/hielo, ≤ 20 % agua, ≥ 800 km entre regiones, ≥ 300 km de cualquier análogo conocido.
- **«Plan a base»:** 105 puntos del polo sur lunar (84–89,5°S) y 82 de Marte en regiones con hielo publicado; relieve real de NASA Trek (LOLA 30 m / 5 m, MOLA–HRSC); el parecido del relieve con la Tierra = 70 % reparto de pendientes + 30 % relieve, en ventanas de 11 × 11 km.

## Mensaje central: analogía funcional + traslado con física
No afirmamos que un sitio de la Tierra «sea como» la Luna o Marte: las propiedades físicas y químicas no son equivalentes en otro entorno (sin atmósfera, otra gravedad, otro suelo). Afirmamos dos cosas:
1. **Dónde ensayar:** el sitio donde las condiciones de **una tarea** se parecen más. Solo se compara directamente lo comparable: la **geometría** (pendientes, relieve, altura del Sol) y las **ausencias** (sin vegetación, sin agua). El resto son condiciones de la tarea (arena suelta, suelo helado, roca volcánica).
2. **Cómo se aprovecha:** se mide con sensores en la Tierra y la física traslada la medida al astro (gravedad, atmósfera, luz). Ejemplo real: Scarecrow, el Curiosity aligerado del JPL para simular en las dunas de Dumont la carga de las ruedas con la gravedad de Marte. Las pruebas en la Tierra sirven sobre todo para **descartar**; para confirmar hace falta un modelo calibrado.

En la web: cada trabajo de «Plan a base» tiene un bloque «Measure on Earth → apply on the Moon/Mars» con qué medir, cómo se traslada y lo bien que se traslada (bien: energía en la Luna, tripulación · en parte: rover, EVA, construcción, agua, energía en Marte, polvo · mal: aterrizaje).

---

## A. Método y validez

### 1. «Los análogos conocidos fijan la mediana con la que comparáis. ¿No es circular la validación?»
Cómo puede llegar: *«¿Cómo sabéis que vuestro índice funciona?»* · *«¿No habéis ajustado el método hasta que salieran los sitios que ya conocíais?»* · *«3 de 4 en el 2 % superior, impresionante. ¿Pero es una prueba justa?»* (invita a presumir: no piquéis).

> «En parte, sí, y lo decimos en la web. La mitad del índice mide lo cerca que está un sitio de la mediana de los sitios donde ya se entrenó, así que su buena nota está en parte garantizada.
> Por eso no nos quedamos ahí. Usamos un control negativo: la Amazonia central, que no se parece en nada, cae al percentil 31 o menos en las tres misiones validadas. Y el resultado no es perfecto: Kīlauea Iki solo llega al percentil 86, porque su celda de 11 km es casi toda selva. Un índice amañado lo habría puesto arriba.
> Así que lo que afirmamos es concreto: el índice reproduce dónde entrenaron de verdad las agencias, y señala sitios nuevos con las mismas condiciones de superficie, a más de 300 km de cualquier sitio conocido y revisados en la bibliografía.»

Corta: *«En parte, sí. La mitad del índice usa los sitios conocidos; por eso añadimos un control negativo, la Amazonia, que cae al percentil 31 o menos, y solo afirmamos que reproduce dónde entrenaron de verdad las agencias.»*

Repreguntas:
- *«¿Cómo sería una prueba de verdad?»* → «Dejar uno fuera: quitar un sitio conocido, recalcular la mediana con los demás y ver si el que hemos quitado sigue arriba. Es lo primero que haríamos.» (**No está hecho**: no digáis que sí.)
- *«¿Por qué solo 2 a 4 sitios conocidos?»* → «Son los sitios donde hay una campaña documentada para esa tarea concreta, con fuente oficial. Pocos, pero reales. La misión 4 no tiene ninguno, y por eso pone "calculada, no validada".»
- *«¿Y cómo sabéis que las regiones nuevas son buenas?»* → «No lo sabemos hasta que alguien vaya. Por eso cada una muestra su nivel de evidencia, de una revisión bibliográfica independiente, y la presentamos como una lista corta para comprobar.»

*Trampa:* no digáis «no es circular» ni «hemos validado el método»; decid «encuentra los sitios que las agencias ya eligieron». No digáis «nadie ha usado estos sitios» (no se puede demostrar): «que sepamos». La fuerza no está en «3 de 4 en el 2 % superior» (eso es lo circular), sino en el control y en Kīlauea Iki. F es independiente solo en parte: sus rangos se fijaron conociendo los sitios.

### 2. «¿Por qué todas las regiones nuevas sacan 0,98 o más? ¿Cómo las ordenáis?»
> «No las ordenamos por el índice, y la web lo dice. Salen de lo más alto de la clasificación de toda la Tierra, así que las diferencias en el tercer decimal no significan nada. Las tratamos como una lista corta. Para compararlas usamos la ficha de cada sitio: el terreno en 3D frente al objetivo, el Sol a lo largo del año, a cuánto está la ciudad más cercana y lo complicado que es el acceso. Y las ordenamos por evidencia independiente, como la revisión bibliográfica de cada región.»

*Trampa:* no defendáis que la región n.º 1 es «la mejor».

### 3. «La Luna no tiene aire, ni agua, y tiene un sexto de la gravedad. ¿Cómo va a haber un análogo en la Tierra?»
> «Ningún sitio de la Tierra es un análogo de la Luna en general, y ese es justo nuestro punto de partida: un sitio es análogo para una tarea. Los campos de lava de Arizona sirven para practicar travesías geológicas con traje, no para probar radiación ni gravedad. Para cada sitio decimos dónde se rompe la analogía: gravedad, vacío, radiación y lo que los datos no ven. La pregunta que respondemos es "dónde puedo ensayar esta tarea concreta".»

### 4. «¿Por qué celdas de 11 km? Un cráter o un afloramiento es mucho más pequeño.»
> «0,1° es la resolución más fina a la que existen juntas todas las capas globales, para todo el planeta y con datos de 2024. Es una herramienta de cribado: le dice a un equipo de campo dónde mirar. Luego la ficha del sitio se acerca a 11 × 11 km de relieve real a 30 m. Elegir el punto exacto sigue necesitando imágenes de alta resolución y una visita, y la web también lo dice.»

### 5. «La misión 4 pone "no validada". ¿Por qué la enseñáis?»
> «Porque es el ejemplo más claro del hueco que queremos mostrar. Ninguna campaña ha ensayado el trabajo con Sol bajo bajo un Sol bajo de verdad: las pruebas JETT de la NASA en Arizona lo hicieron de noche y con luces artificiales, porque allí el Sol del mediodía nunca baja de unos 31°. Nuestras regiones de la misión 4, en el Ártico y en Islandia, tienen meses con el Sol del mediodía entre 0 y 12°, como en el polo lunar. No hay campaña real con la que validarla, así que la marcamos como "calculada, no validada" en vez de fingir.»

### 6. «¿Quién ha elegido los rangos, las tolerancias y el reparto 50/50? ¿No es arbitrario?»
> «Son decisiones del equipo, y están todas escritas en la hoja del método con el porqué de cada una. Los rangos salen del objetivo cuando la magnitud es comparable (sin vegetación, suelo basáltico oscuro) y de lo que necesita la tarea (arena suelta para que el rover se hunda). Las tolerancias convierten los cortes duros en bandas graduales. Cualquiera puede cambiarlas y volver a calcular: los scripts y los datos son abiertos.»

*Trampa:* no digáis que salen de un estudio de sensibilidad; no se ha hecho.

### 7. «Los valores de la Luna y de Marte, ¿de dónde salen?»
> «De productos publicados: el albedo de TES para Jezero y Arcadia, el modelo Mars Climate Database para la temperatura de Arcadia y LOLA para Mons Mouton. El albedo de Mons Mouton es una estimación convertida de la reflectancia de LOLA a 1064 nanómetros. Cada valor muestra su fuente en la web. Sacarlos directamente de los productos del PDS es uno de los siguientes pasos.»

### 8. «La misión 3 va de hielo en el suelo, pero no medís hielo.»
> «Cierto: lo deducimos de una temperatura media de superficie por debajo de −5 °C, que es un indicador de permafrost, más suelo seco, desnudo y que no sea glaciar. Comprobamos los dos sitios donde de verdad se ha ensayado la perforación de hielo, Haughton y los Valles Secos, y los dos quedan en el 1 % superior de la Tierra. Pero no puede confirmar que haya hielo en el suelo. Está escrito como límite, y un mapa de permafrost es la siguiente capa evidente.»

### 9. «Vuestro dato de arena (SoilGrids) es un modelo con muchísima incertidumbre.»
> «Sí. En estos sitios su intervalo del 90 % va más o menos del 5 al 95 % de arena, y lo avisamos al lado del valor. También por eso todas las regiones nuevas rondan el 54 % de arena: es la mediana de los sitios donde se probaron rovers. Sirve para descartar sitios, no para prometer dunas. Para eso están la ficha del sitio y la comprobación sobre el terreno.»

### 10. «Mons Mouton: ¿no cambió Artemis III?»
> «Mons Mouton estaba entre las regiones del polo sur lunar que la NASA presentó en 2024 como candidatas para el alunizaje de Artemis III. Ahora la NASA plantea Artemis III de otra forma, con los alunizajes a partir de Artemis IV, y las regiones del polo sur siguen siendo el objetivo. Usamos Mons Mouton porque es un sitio real del polo sur, con nombre y con datos publicados.»

*Trampa:* no digáis «Artemis III aterrizará en Mons Mouton».

---

## B. Novedad y creatividad

### 11. «Ya hay muchos mapas de análogos. ¿Qué aportáis de nuevo?»
> «Casi todo el trabajo de análogos elige los sitios uno a uno, por experiencia, y los compara con "la Luna" en general. Nosotros empezamos por la misión: cuatro tareas que las agencias han ensayado de verdad sobre el terreno. Convertimos cada una en condiciones medibles, puntuamos cada celda de tierra firme del planeta, comprobamos que la puntuación encuentra los sitios de las campañas reales, y después enseñamos sitios nuevos y dónde deja de servir cada uno. "Plan a base" va en el sentido contrario: eliges cualquier sitio de la Luna o de Marte, ves la base montada sobre relieve real de la NASA y te dice dónde ensayar en la Tierra cada trabajo.»

### 12. «¿Podéis demostrar que nadie ha usado vuestras regiones nuevas?»
> «No, y no lo afirmamos. Excluimos todo lo que está a menos de 300 km de los análogos conocidos que encontramos, e hicimos una revisión bibliográfica independiente de cada región nueva. La web muestra lo que salió como nivel de evidencia. Quitamos dos regiones a mano después de esa revisión; por ejemplo, Tankwa Karoo, porque resultó ser pizarra y no roca volcánica.»

---

## C. Impacto y relevancia

### 13. «¿Quién usaría esto de verdad?»
> «Los equipos que planifican pruebas de campo en agencias y universidades, y los equipos de rovers o de trajes, cuando eligen dónde probar. Cada campaña de análogos cuesta mucho dinero y logística. Nuestra herramienta les da una primera lista corta con sus límites, por ejemplo "remoto, necesita permiso de investigación, no hay basalto justo en el punto", antes de que nadie coja un avión. Es una herramienta de cribado, no una recomendación de sitio, y la web lo dice.»

### 14. «¿Por qué mostráis la "complejidad de acceso"? ¿Puntuar países no es político?»
> «No puntúa ningún país, y la web lo dice. Estima cuánta coordinación puede necesitar un equipo de campo de fuera: datos de gobernanza del Banco Mundial, episodios de conflicto a menos de 200 km y los avisos oficiales de viaje, combinados con pesos que elegimos nosotros. También avisa de permisos especiales, como las licencias de investigación en Nunavut. Y lo remoto puede ser justo lo que se busca: algunas misiones análogas ensayan el aislamiento.»

### 15. «¿Encaja con el reto? Pide sitios para bases permanentes.»
> «El reto pide lugares de la Tierra análogos a los sitios de las bases permanentes en la Luna y a Marte, y explicar en qué se parecen, cuánto y dónde se rompe la analogía. Las cuatro misiones responden a eso con objetivos reales. "Plan a base" lo responde para la propia base: eliges un sitio en el polo sur lunar o en Marte y te da el lugar de la Tierra con el terreno más parecido, y dónde ensayar cada trabajo de la base.»

---

## D. «Plan a base»

### 16. «¿Esa distribución de la base es un diseño de la NASA?»
> «No, es un concepto, y la web lo dice. Cada parte se coloca con reglas sencillas sobre relieve real de la NASA: la pista de aterrizaje a una distancia fija del hábitat, el reactor apartado, el rover por pendientes de menos de 20°, el terreno edificable por debajo de 10°. La luz y la temperatura salen del propio relieve. El hielo en la Luna solo se coloca donde el suelo se queda por debajo de 110 K, la temperatura a la que el hielo de agua puede durar. Las distancias y cada cuánto se repite cada trabajo son supuestos nuestros.»

### 17. «¿Por qué cada trabajo va a un sitio distinto de la Tierra?»
> «Porque cada ensayo necesita sus propias condiciones: el trabajo con polvo, un sitio seco y polvoriento; la perforación de hielo, suelo helado; las pruebas de energía, un Sol bajo. Con nuestros datos es raro que un mismo sitio de la Tierra sirva bien para más de un trabajo de la base. Por eso damos dos respuestas: el sitio con el terreno más parecido en conjunto y el mejor sitio para cada trabajo. Una base entera no se ensaya en un solo lugar.»

### 18. «¿Cómo medís que el terreno se "parece"?»
> «Comparamos ventanas de 11 × 11 km en la misma rejilla: un 70 % es cómo se reparten las pendientes (llano, suave, empinado…) y un 30 % el desnivel total. Se calcula en el momento, en el navegador, con datos de NASA Trek para la Luna o Marte y con teselas de elevación abiertas para la Tierra. Compara la forma del terreno, no la roca ni el color.»

---

## E. Datos, IA y proceso

### 19. «¿Qué datos de la NASA habéis usado?»
> «MODIS para vegetación, albedo y temperatura de superficie; GPM IMERG para la lluvia; NASA Trek para la Luna y Marte (elevación LOLA e imágenes WAC del LRO, Viking y MOLA–HRSC para Marte); las imágenes Blue Marble y Black Marble; y la climatología NASA POWER para el sol y la temperatura a lo largo del año. De socios: el modelo de elevación Copernicus y WorldCover de la ESA, SoilGrids y el mapa de rocas GLiM. La lista completa, con licencias, está en "Method & sources".»

### 20. «¿Cómo habéis usado la IA? Las normas prohíben usarla para tener la idea.»
> «La idea y el planteamiento son nuestros: partir de campañas de campo reales, puntuar cada tarea y enseñar dónde se rompe la analogía. Usamos un asistente de programación con IA, Claude Code, como herramienta para escribir código, procesar datos y redactar textos. Todas las decisiones las tomamos nosotros. En el repositorio hay un registro, archivo por archivo, de lo que hizo la IA, enlazado desde el pie de la web.»

*Trampa:* sed coherentes con `AI_USAGE.md` y con el pie de la web. No le quitéis importancia («solo un poquito»): el registro dice cuánto se usó.

### 21. «¿Qué haríais con tres meses más?»
> «Tres cosas. Primero, cambiar nuestras estimaciones de la Luna y Marte por valores sacados directamente de los productos del PDS. Segundo, añadir las capas que faltan: un mapa de permafrost para el hielo, la emisividad para el tipo de roca real (ASTER en la Tierra, Diviner en la Luna, TES en Marte) y las sombras del relieve para el Sol bajo. Tercero, la prueba de verdad: enseñar la lista corta a un equipo de campañas de campo y comprobar una región sobre el terreno.»

### 22. «Las propiedades físicas y químicas de la Tierra y de la Luna no son equivalentes. ¿Qué estáis comparando?»
Cómo puede llegar: *«Un basalto de Arizona no es regolito lunar.»* · *«La temperatura en Marte no significa lo mismo que en la Tierra.»* · *«¿Cómo vais a validar nada en la Tierra?»*

> «Tenéis razón: con otra gravedad, sin atmósfera y con otro suelo, la misma propiedad no se comporta igual, y no decimos que un sitio sea como la Luna. Comparamos solo lo que es comparable: la geometría del terreno y del Sol, y la ausencia de lo que allí no hay. Lo demás son condiciones de la tarea. Y el ensayo no termina en la Tierra: se mide con sensores y la física traslada la medida al astro. Así lo hizo el JPL con Scarecrow, un Curiosity aligerado para que sus ruedas apoyaran como en Marte, en las dunas de Dumont, que es uno de nuestros sitios de la misión 2. En cada trabajo de la base decimos qué medir y lo bien que se traslada.»

Repreguntas:
- *«¿Y lo que no se traslada?»* → «El vacío, el polvo lunar cargado eléctricamente y la radiación sobre las personas. En esos casos la Tierra sirve para descartar diseños, no para confirmarlos; hace falta cámara de vacío o un modelo.»
- *«Vuestro albedo sale de un valor lunar medido con otro instrumento.»* → «Sí, es la parte más débil del método: el de Mons Mouton está convertido de LOLA a 1064 nm y el de la Tierra es de MODIS. Por eso lo marcamos como estimación. Lo correcto es comparar la emisividad en el infrarrojo térmico (ASTER, Diviner, TES).»

*Trampa:* no defendáis una equivalencia física. Y el relieve de Marte es de 200 m: sale más suave que el de la Tierra, así que el parecido del terreno con Marte es aproximado.

---

## F. Si algo falla en directo
- **La web 3D no carga o va lenta:** tened el **vídeo de 30 s** abierto (https://zenidx.github.io/logos-space-apps-2026/demo-video/) y capturas de la ficha de un sitio.
- **«Plan a base» dice «Trek 500»:** el servidor de relieve de la NASA a veces falla. Decid «es el servicio de elevación Trek de la NASA, son datos en directo» y recargad, o enseñad Jezero (Marte), que cargó bien en las pruebas.
- **Pregunta que no sabéis:** «Buena pregunta: no lo hemos medido. Nuestros datos no lo pueden decir, y está en nuestra lista de límites.» Mejor reconocerlo que inventar una cifra.
