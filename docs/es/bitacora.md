# Bitácora

Entradas nuevas arriba. Horas = hora del commit (CET). Corregido a las 21:50: las primeras entradas llevaban horas estimadas, no reales.

## 2026-11-15 · 02:02 · Arreglos de la 2.ª prueba a ciegas del Tester
- Informe: `/home/zexu/OpenBot/Shared/logos-prueba-ciega-2/informe.md` (01:43–01:52; sin bloqueantes, sin errores de consola, 17 enlaces nuevos correctos). Mejoró respecto a la 1.ª: sin arcos, «accepted» frente a «in range», acceso separado de lejanía, lista por evidencia, teclado, direcciones por sitio.
- Alto, arreglado: la ficha del sitio se abría desplazada si la lista estaba bajada. Ahora abre arriba y, al volver, recupera el punto de la lista y el foco del teclado.
- Medios arreglados: la tarjeta ya no se «rompe» al desplazar (el desplazamiento va dentro de la tarjeta); pulsar la pestaña abierta no la cierra; flechas entre pestañas; el diálogo «Method & sources» retiene el foco y lo devuelve al cerrar; Tab empieza por la cabecera (los puntos del globo salen del orden de Tab: la lista tiene los mismos sitios); el botón Atrás deshace (misión y sitio añaden entradas al historial); leyenda visible de puntos y barras; se quita «index rank n of N» (contradecía que el índice no ordena) y el puesto interno pasa a ir por índice; coordenadas de Arcadia explícitas en «Method»; «screened on the ground» pasa a «screened with elevation and land-cover data (no fieldwork)»; en la misión de Sol bajo los grupos dicen «ground only» y Askja «campaign for another task»; etiquetas cortas en los anillos del móvil y nota de qué son los números; pie del terreno fuera del lienzo; filtros y botones de 40–44 px en pantallas pequeñas; nombres del globo más anchos en móvil.
- Bajos arreglados: filtros limpios al cambiar de misión; «Next missions» pasa a «Other real campaigns»; erratas y unidades de los textos de datos (`tidy()` en `missions.ts`: m/s², °, «percentile 31.2», doble punto); «Mons Mouton» una sola vez en Targets; sin «• no data» ni «0 sites»; documentos del repo enlazados a GitHub; enlace de TRIDENT a la ficha de NTRS en vez del .docx; en la portada, el mundo objetivo de la misión mostrada se marca «· target».
- No hecho (bajo o discutible): terrenos 3D pequeños a 1366×768; ejes en las gráficas (solo marcas de 45° y 90° en la del Sol); aviso de enlace con misión inexistente; los filtros no van en la URL; «Support nearby» en Sol bajo sigue viniendo de análogos de Marte (se avisa con «ground only»).

## 2026-11-15 · 01:51 · Retoques de Jefe y revisión de Legal (commits a5a10ca y 3e13fba, en vivo)
- Jefe (auditoría de 289d5a0: 0 discrepancias en índice, reglas, Sol mensual y pendiente): el vistazo del sitio vuelve a caber en una pantalla (dial de 207 px a 768 de alto; subtítulo y «Logistics» en una línea; pestañas visibles a 1366×768 y 1655×925); nota «tinted by world» en los relieves; cita del prototipo paralelo del equipo en README y en «Method & sources»; la etiqueta de datos es v7 (la carpeta de entrega de Datos se llama v8).
- Legal (`Shared/logos/legal/revision-289d5a0.md`): nada que retirar. Aplicado: «Used in real campaigns» en vez de «Used by agencies» (MDRS es de la Mars Society; Askja no fue campaña de Sol bajo); `AI_USAGE.md` coherente con los archivos «to be reviewed» y con filas nuevas; `generatedWith` en `docs/region-screening.json`; DOI de Kay et al. y de De Kock et al.; pie «Not endorsed by NASA, ESA, JAXA, CSA or any organisation named here»; «four were chosen» en `docs/idea-origin.md`.
- `docs/submission/`: `project-page.md` (borrador de resumen, descripción y guion de 30 s) y `references.md` (campos de Legal listos para pegar: NASA Data, Partner Data and Other References, Use of SI).
- En marcha: 2.ª prueba a ciegas del Tester (informe en `Shared/logos-prueba-ciega-2/`).

## 2026-11-15 · 01:40 · Evidencia, filtros, hardware y gráfico solar (commit 289d5a0, en vivo)
- 2c: niveles de evidencia (Used by agencies / Support nearby / Partial support / No support found / Not checked) con color y 4 puntos; son la insignia principal del sitio y el orden de la lista. Regla única: «respaldo cercano» = fuente a ~100 km o menos, o sobre la isla o el campo de lava del punto; por eso el norte de Ellesmere (fuente a 300 km) pasa a «parcial». Tras la comprobación de Datos (v8) no queda ninguna región sin comprobar: 6 con respaldo cercano, 10 parcial, 3 sin respaldo.
- 2a y 2b: filtros «Reachable in < 6 h», «Remote > 48 h», «Low access complexity» y Terrain Any / Flat ≤ 5° / Steep > 5°. Umbrales en `FILTERS` (`src/lib/missions.ts`); nada de esto entra en el índice. Los filtros también quitan los puntos del globo.
- 2d: línea «Hardware rehearsed» por misión, solo con fuente (filas C3, C6, C7, C8a, C10, C12a y L15–L17 de `docs/sources.md`). IceBite fuera: solo estaba anunciado.
- Panel de misión rehecho para que la lista quede arriba; lo demás, en el desplegable «About this mission». Panel de 420 px.
- Pestaña «When»: energía solar que llega al suelo por mes e índice de claridad (NASA POWER, CERES SYN1deg), con los meses de Sol bajo marcados en la misión 4.
- Comentarios de código y mensajes de pruebas en inglés.
- Medido en local con la máquina cargada: Lighthouse móvil 77 (antes 70), TBT 1,0 s (antes 2,3 s); accesibilidad, buenas prácticas y SEO 100.
- Pendiente: deslizadores «Your priorities» (10:00, si todo está estable), medir fps y Lighthouse con máquina libre (09:00), 2.ª prueba a ciegas del Tester, revisión de Legal, `docs/submission/` (antes de las 12:00), congelar a las 13:00.

## 2026-11-15 · 01:27 · Etiquetas B, misión 4 y datos v7
- Decisiones de zexu (00:43, vía Jefe): sitios en la Tierra con «líneas a etiquetas» (opción B, sin línea al mundo objetivo); 4 añadidos baratos (filtros de logística, selector Flat/Steep/Any, niveles de evidencia como insignia y orden, «Hardware rehearsed» por misión); extra opcional: deslizadores «Your priorities». Orden: escena + etiquetas B → radial → misión 4 → 2a–2d → deslizadores. Congelación a las 13:00.
- Hecho en esta tanda: `src/lib/label-layout.ts` (colocación 2D de nombres fuera del globo, con prueba: no se pisan, no tapan la Tierra, el mundo objetivo ni los botones; la línea no es mucho más larga que la mínima); `SolarScene.tsx` sin líneas 3D ni `Line2`; pulso en el sitio abierto (se para con «Pause motion»); la vista general se para tras 30 s sin interacción; `MeshLambertMaterial`; los enlaces directos abren ya en primer plano.
- Datos v7 de Logos Datos (carpeta de entrega v8): 4 misiones (la 4.ª, «Low-Sun operations and solar power», calculada y NO validada: índice = media de similitudes), `coverageWeight`, suelo de avisos y permisos con fuente en el pipeline, nombre de Chukotka en inglés. Comprobación independiente de 9 regiones más (`docs/independent-check-v8.md`).
- Retirada: Tankwa Karoo (m1-new7): la fuente geológica la sitúa en lutitas, sin dolerita; queda en «Removed» con su motivo. Total: 19 regiones nuevas.
- Pendiente: filtros 2a/2b, insignias y orden 2c, línea 2d, rehacer el panel de misión (lista más arriba), gráfico de energía solar por mes, medir fps y Lighthouse a las 09:00, capturas y textos a las 12:00.

## 2026-11-15 · 00:47 · Sistema real con el Sol, interfaz radial y auditoría de Jefe
- Decisiones de zexu (apuntadas en `docs/idea-origin.md`): fuera la «órbita compartida» (Marte no orbita la Tierra). Escena nueva: vista general heliocéntrica (Sol, Tierra y Marte con radios 1 : 1,52 y periodos 1 : 1,88 en proporción; Luna alrededor de la Tierra, ampliada) y primer plano de la Tierra con sus sitios y el mundo objetivo al lado, a tamaño proporcional. Al elegir misión la cámara viaja de la vista general al objetivo y luego a la Tierra. Nombres de los sitios con líneas discontinuas semitransparentes y una sola línea discontinua, con los trazos avanzando, del sitio abierto a su objetivo; ninguna cruza un globo. Pie con lo que va a escala y lo que no.
- Interfaz «radial» (componente de Diseño): índice en el centro y un anillo por condición (cian), forma frente al objetivo (gris: cociente menor/mayor) y permisos y política (ámbar). Prueba «anillo = dato» sobre 182 anillos.
- Auditoría independiente de Jefe (le cuadran similitudes, índice, distancias, Sol y access complexity): se aclara que F y D no usan pesos; suelo declarado: aviso de viaje en su nivel máximo → acceso al menos «High» (Nuevas Siberia pasa de Medium a High); notas de permisos especiales sin comprobar (Xizang, Ártico); aviso en análogos conocidos con pendiente > 10° (McMurdo).
- Sección «Next missions» (solo texto y enlaces, sin puntuar). La 4.ª misión («Low-Sun operations and solar power») la prepara Logos Datos.

## 2026-11-15 · 00:32 · Datos v6: regiones cribadas, sustitutas y comprobación independiente
- Logos Datos cribó el suelo de las 18 regiones (ventana de 11 km): 12 se quedan y 6 se retiran (3 por pendiente, 3 por agua o hielo). Sustitutas verificadas: Gran Karoo (Sudáfrica), Shuanghu (meseta tibetana, ~5 000 m), islas de Nueva Siberia y el interior de Baffin. Queda fuera la de los montes Qilian por ser la más débil. Total: 6 + 6 + 4 regiones nuevas. El cribado es un paso del pipeline (`02b_screen.py`) y está en `docs/region-screening.md`.
- Comprobación independiente (`docs/independent-check.md`): ninguna fuente cita estos puntos como análogo establecido. Respaldo cercano de la propiedad en 3 (Harrat al Birk, Ellesmere, Banks); parcial en 5; nada en 3; 5 sin comprobar. Cada región lo dice en su pestaña How, con enlace a la fuente y, en 3 casos, a una imagen con licencia libre.
- Arena ~54 %: es por construcción (el índice acerca las regiones a la mediana de los análogos conocidos), no un artefacto; se explica junto a la condición.

## 2026-11-15 · 00:28 · «Órbita compartida» (decisión de zexu) y cribado del suelo
- Sustituye a los arcos: la Tierra en el centro girando despacio; la Luna y Marte recorren dos órbitas dibujadas (línea discontinua, inclinadas, distinto radio y velocidad) y pasan por delante y por detrás de la Tierra con oclusión por profundidad. Un sitio se une a su objetivo con una línea recta de luz del color de ese mundo, solo cuando el objetivo pasa por su lado y cerca; se desvanece con la distancia y nunca cruza un globo.
- Al elegir misión se atenúa el otro mundo; al abrir un sitio, el objetivo viaja por su órbita hasta aparcar delante, la Tierra gira para poner el sitio de frente, la línea se fija y el otro mundo se aparta al lado contrario. «Pause motion» y «reduced motion» detienen las órbitas (la selección es directa). Órbitas más cerradas en pantallas estrechas.
- Pruebas nuevas (`orbit-math.test.mjs`): todo cabe en el encuadre en 7 tamaños de escena (1366×768 y 390×844 incluidos); 616 líneas dibujadas sin cruzar ningún globo y 15 384 correctamente no dibujadas; el sitio abierto siempre tiene línea libre. Se elimina el código de arcos.
- Es un esquema y se dice en el pie: tamaños y distancias no son reales y Marte no orbita la Tierra.
- Cribado de Logos Datos (ventana de 11 km: pendiente ≤ 10°, nieve/hielo ≤ 10 %, agua ≤ 20 %; Copernicus DEM y ESA WorldCover): se retiran 3 regiones más de la misión del hielo (Sakha, 54 % agua; costa de Coats Land, capa de hielo; costa de Baffin, glaciar y agua). Quedan 12 regiones nuevas; Datos prepara sustitutas.

## 2026-11-15 · 00:11 · Credibilidad primero (prioridades de Jefe tras la prueba a ciegas)
- Regla mostrada = regla calculada: la etiqueta sale de una función con prueba («in range» solo dentro del rango que se enseña; «accepted (within tolerance)» = regla cumplida por tolerancia), y el texto dice hasta dónde se acepta («0.05 or less (accepted up to 0.17)»). Comprobado en 96 valores de los datos.
- El índice se muestra con 3 decimales y con su puesto («#1 of 5 new regions»); se explica que las regiones nuevas distan milésimas y son una lista corta, no un ranking.
- RETIRADAS 3 regiones nuevas por pendiente media > 10° en 11 km: Mendoza (15,3°), Ngari/Tíbet (16,4°) y Karakórum (17,9°). Quedan 15; el motivo se ve en «Method & sources». Logos Datos verifica el resto (tierra firme, nombre, hielo) y busca respaldo independiente.
- Acceso separado en dos: «Permits & politics» (access complexity) y «Remoteness» (horas a una ciudad). Pestaña Why abierta por defecto. Nombres de la lista sin cortar.
- Arcos: la Tierra se orienta hacia las regiones nuevas y solo se dibujan los arcos de sitios visibles que miran al objetivo (los demás aparecen al girar o al abrir el sitio): sin lazos alrededor del planeta.
- Legal: referencias de GitHub como «ideas only», cita del relieve lunar y Oxford MAP CC BY 4.0 (catálogo de Earth Engine) en el README.

## 2026-11-15 · 00:04 · Cristal más translúcido y minimal, franja de datos, más información y referencias
- Cristal de escritorio: paneles más translúcidos (alfa 0,46), desenfoque de 30 px, esquinas de 28 px; el fondo se oscurece con `brightness()` para mantener el contraste AA aunque detrás quede la cara iluminada de un planeta. Sin cajas dentro de cajas: las cifras van como número grande + etiqueta pequeña, el aviso de «dónde se rompe» es una línea con filete ámbar, y el relieve ya no lleva marco.
- Portada: franja «en cifras» calculada del archivo de datos (misiones, celdas puntuadas por misión, regiones nuevas, análogos conocidos).
- Pestañas con más contenido real: mes más cálido y más frío (NASA POWER) en When; qué se ensayaría allí en How.
- `docs/design-rationale.md`: 12 repos de GitHub revisados por Consulta (licencia leída del LICENSE) y qué idea se tomó de cada uno; no se copió código.

## 2026-11-15 · 00:01 · 4.ª ronda de zexu (arcos que rodean) + primera prueba a ciegas
- Arcos «que rodeen, no que abracen»: trayectoria tipo órbita de transferencia. Sale y llega por la normal; si un extremo mira al lado contrario, primero rodea su propio planeta a una altura del 34 % del radio y luego cruza; puntos de paso unidos con una spline Catmull-Rom centrípeta. Prueba: 432 arcos, ningún punto dentro de ningún globo y ≥ 25 % del radio libre fuera de las dos zonas de aterrizaje.
- Logos Tester (a ciegas, 21 capturas en Shared/logos-prueba-ciega-1): sin bloqueantes. Arreglado de sus altos: «in range» solo si el valor está en el rango ideal y «accepted (within tolerance)» si entra por tolerancia; la cifra de acceso se llama «Permits & politics» y lleva al lado el tiempo de viaje; con teclado ya se llega a todos los sitios (las filas se recreaban en cada render y perdían el foco); al abrir una pestaña el contenido sube a la vista; en móvil la cabecera es opaca y el panel sube al abrir un sitio; la URL cambia con la misión y el sitio (se puede enlazar).
- De la auditoría de Logos Datos (docs/sources.md, 214 afirmaciones): texto del Sol en sitios polares, «Surface (skin) temperature», nota del tiempo de viaje, textos del método (Mons Mouton, «radiation», «suited EVA»), país de la zona disputada, cita del relieve lunar (NOTICE), nombres administrativos en vez de región amplia («Departamento San Carlos · Mendoza»), y los pasos 06/07 en `npm run data`.
- Sin tocar (dato, no texto): la región antártica sin nombre, las pendientes altas de Tíbet y Karakórum, la arena ~54 % repetida y que el índice no distingue entre regiones nuevas.

## 2026-11-14 · 23:48 · Índice sin «1.00» perfecto y mini-mapas separados (aviso de Jefe)
- Las regiones nuevas valen 0,988–0,998 y se veían como «1.00», por encima de análogos reales (SP Crater 0,97). No es un tope de la fórmula: son las celdas elegidas por estar arriba del índice. Ahora todo valor ≥ 0,99 se muestra «≥ 0.99», con una línea que explica por qué una región nueva puede puntuar más que un análogo conocido (el índice compara condiciones de superficie, no idoneidad). También en «Method & sources».
- Los mapas de situación salen de la caja de los terrenos y pasan a la fila de cifras (uno a cada lado).

## 2026-11-14 · 23:45 · 3.ª ronda de zexu: arcos por fuera del globo y «dónde» en el mapa
- Fallo: al girar los planetas los arcos atravesaban el globo. Arreglo de raíz: el arco se calcula con las esferas actuales (centro y radio) y cada punto que caería dentro se empuja hacia fuera (holgura del 3,5 % del radio, que baja a 0 solo en los dos extremos); si el sitio queda en la cara oculta, el arco rodea el planeta. Se recalcula cuando gira un planeta o cambia la cámara y se oculta por profundidad tras las esferas. Prueba nueva: 432 arcos (cara visible, borde y cara oculta, las dos disposiciones), ningún punto dentro de ningún globo.
- «Dónde»: al abrir un sitio la Tierra gira hasta él con su marcador y nombre; en el panel, dos mapas de situación (sitio y objetivo) recortados del mismo mosaico de NASA que usan los globos (sin datos ni licencias nuevos). A esa escala el recuadro de 11×11 km es menor que un píxel: se marca con un punto y se dice el alto del mapa en km.
- Lista antes de publicar: pruebas, 1366×768, 390×844, consola y captura revisada.

## 2026-11-14 · 23:35 · Pulido tras la revisión de Jefe
- Los dos terrenos ocupan el alto libre del panel; con un sitio abierto solo se ve su arco (los demás casi desaparecen); cristal de escritorio más translúcido y con más desenfoque; subtítulo del sitio sin cortar.
- Móvil: paneles sólidos y titular con fuente del sistema (zexu prefiere rendimiento a adorno). URL pública en el README.

## 2026-11-14 · 23:26 · Tipografía con más carácter, portada sin scroll y criterio documentado
- Tipografía v3 de Diseño: Bricolage Grotesque (titulares y texto, peso 700 en titulares) y Martian Mono (datos). Sin cursivas.
- Portada: título, frase y las 3 misiones caben sin scroll a 1366×768 y a 390×844; «How it works» queda debajo.
- `docs/design-rationale.md`: 14 principios con fuente (NN/g, Laws of UX, WCAG 2.2, Material 3, Apple HIG; recopilados por Consulta) y el cambio aplicado por cada uno. Curva de animación = Material 3 emphasized-decelerate.

## 2026-11-14 · 23:23 · 2.ª ronda de zexu: «vistazo primero», arcos, cristal y logo
- Sitio de un vistazo (cabe en una pantalla a 1366×768): nombre, índice, los dos terrenos, 4 cifras (condiciones en rango, relieve, pendiente, acceso) y la frase de dónde se rompe; el detalle (Why, Shape, When, How, Limits & sources) se abre por pestañas. Principio: progressive disclosure (NN/g).
- Arcos rehechos: una curva por sitio, un color por misión con degradado sutil, se dibujan una vez y quedan quietos, ocultos tras el planeta; el marcador hace un pulso cuando llega su arco. Sin puntos ni tramos.
- HUD de cristal (Diseño): paneles translúcidos con desenfoque, borde luminoso y reflejo; alternativa sólida sin backdrop-filter, con «reduced transparency» o «more contrast». La escena sigue por detrás de los paneles.
- Logo propio (SVG original de Diseño: tres mundos unidos por un arco), favicon, icono de Apple y og:image.
- Prueba nueva: cada sitio y objetivo tiene relieve y detalles con números válidos, y el Sol mensual que calcula la web coincide con el archivo de datos.

## 2026-11-14 · 23:11 · «Why» con tiras de rango (aviso de Jefe)
- La fila decía «Precipitation 0.99 · here 283 mm · target 0 mm» y se leía como que 283 mm se parece un 99 % a 0 mm. Ahora cada condición es una tira: banda ideal de la misión, banda aceptada, punto del sitio y marca del objetivo; el texto dice «in range / out of range · fit» y «mission needs …». La similitud se mide contra el rango de la misión, no contra el valor del objetivo.
- Componente de Diseño (ConditionStrip + rules.ts) con prueba que reproduce las 105 similitudes de `sites.json`. Relieve 3D más grande. Corregido: las fuentes nuevas no se aplicaban (choque de variables con Tailwind).

## 2026-11-14 · 22:51 · «Alma»: tanda visual 2, vista de comparación
- Al abrir un sitio, el panel se ensancha y cuenta la historia: Shape (relieve 3D de 11×11 km del sitio junto al del objetivo, misma escala, con control de altura del Sol), Why (condiciones con barras), When (Sol a mediodía por mes y temperatura mensual), How (campaña real, ciudad y aeropuerto más cercanos, access complexity) y Where it breaks.
- Datos nuevos de Logos Datos: 30 mapas de alturas (Tierra: Copernicus DEM GLO-30, ESA; Luna: LOLA 30 m; Marte: mezcla MOLA–HRSC 200 m), temperatura mensual de NASA POWER, ciudad (Natural Earth), tiempo de viaje (Oxford MAP) y aeropuerto (OurAirports). Licencias revisadas por Logos Legal; los mapas de Marte van con CC BY-SA 3.0 IGO en su carpeta.
- Enlace directo a un sitio: `?m=<misión>&s=<sitio>`.

## 2026-11-14 · 22:47 · «Alma»: tanda visual 1 (feedback de zexu)
- Tipografía nueva (dirección de arte de Diseño, todas OFL y autoalojadas): Instrument Serif para titulares y nombres de lugar (cursiva), Instrument Sans para texto y botones, Geist Mono para datos.
- Animaciones: entradas escalonadas, números que cuentan, barras que crecen, panel que entra deslizando, tarjetas y filas con respuesta al pasar y pulsar; al pasar por una fila se resalta su arco y su marcador. Todo desactivado con «reduced motion».
- Contenido: sección «How it works» en 3 pasos; por misión, «What is rehearsed» y «Why it matters».
- Siguiente: vista de comparación con relieve (Logos Datos ya entregó 30 mapas de alturas de 11×11 km).

## 2026-11-14 · 22:39 · Documentos sincronizados con los datos v4
- `docs/method.md` en una sola versión (método v3, datos v4); `docs/sources.md` rehecho: 154 afirmaciones, 118 verificadas, 21 estimaciones, 4 a quitar, 11 otras. Sin comprobar: licencias de texturas y condiciones de Mars Trek.
- Valores de objetivo con fuente: albedo de Jezero 0,18 y de Arcadia 0,23 (mapa TES, Christensen 2001); temperatura media de Arcadia −76 °C (Mars Climate Database v6.2, modelo). El albedo de Mons Mouton (0,15) sigue siendo estimación.
- Artemis III: NASA la describe ahora como demostración tripulada en órbita baja (2027), con alunizajes desde Artemis IV; la web lo dice junto al objetivo.
- Uso de IA, más exacto: la fórmula, los umbrales y los pesos se redactaron con ayuda de IA a partir de la idea del equipo; la idea y el planteamiento son del equipo.

## 2026-11-14 · 22:37 · Segunda pasada de Crítico (como jurado)
- Misión 1 renombrada a «Suited EVA on volcanic terrain»: el polo sur lunar es terreno de tierras altas, no basalto; es un análogo operativo, no de composición. Mons Mouton descrito como región que NASA listó entre las candidatas de Artemis III en 2024.
- Misión 3: «regions to screen for possible near-surface ice; the score does not detect ice».
- Portada: frase de usuario y uso («first-pass shortlist … not a site recommendation»). Método: «every available condition (≥ 66 % of weight)» y «screening hypothesis». README: «access-complexity index … not a feasibility or safety assessment».
- Portada ajustada a pantallas de 768 px de alto (ya no se montan las tarjetas y el pie).
- Pendiente de Logos Datos: `method.md` y `sources.md` sincronizados con v4.

## 2026-11-14 · 22:28 · Auditoría total: segunda tanda (fuentes y verdad)
- Datos v4 (Logos Datos): WDPCA eliminado (no comercial; Legal retiró su OK); en su lugar, aviso «Check national park and research permits before fieldwork». Arreglado un fallo: las frases de «dónde se rompe» citaban rangos de otra misión.
- Auditoría de fuentes en `docs/sources.md`: cada afirmación con fuente, URL, estado HTTP, fecha, licencia y veredicto. Corregido: enlace de IceBite (el anterior era de IceBreaker), fechas de JETT3 (4–9 oct 2022), «sun cart» de JETT5 → «portable spotlight» (USGS), coordenadas de Jezero con el Gazetteer de USGS, gravedad 9,80 / 3,73 (NSSDC), frase sobre la corteza del polo sur con fuente de NASA JSC, enlace de MDRS, README sin misiones que la web no tiene.
- Valores de objetivo aproximados marcados «≈ … (estimate)» en la ficha (albedo de Mons Mouton y Jezero, −80 °C de Arcadia).
- Reproducible: `scripts/data/` (pipeline de Python con entradas, versiones y sha256) + `npm run data` y `npm run test:data` (5 casos, 3 calculados a mano).
- No hecho: subir a Next 16 por las 2 vulnerabilidades de `npm audit` (solo afectan a la compilación; web estática sin servidor; cambio mayor a horas de la entrega). Lighthouse móvil 81 (objetivo 90): el resto del coste es evaluar three.js con CPU ×4 más lenta.

## 2026-11-14 · 22:24 · Auditoría total (orden de zexu): primera tanda
- Legal: documentos en español movidos a `docs/es/` (la guía exige inglés en todo lo enlazado); `docs/idea-origin.md` y `docs/missions.md` en inglés; término «Super Intelligence (SI) / AI»; WDPCA fuera de README y LICENSE (los datos los regenera Logos Datos sin WDPCA).
- Móvil 390 px: cabecera compacta sin pisar los globos, escena al 46 % del alto. Enlace directo `?m=<misión>`.
- Rendimiento: arranque de la escena por pasos y sin antialias en pantallas < 700 px. Lighthouse en vivo antes: escritorio 95, móvil 76 (accesibilidad, buenas prácticas y SEO 100). En local tras el cambio: móvil 81–83.
- Prueba nueva `src/data/sites.test.mjs`: el índice publicado = 0,5·F + 0,5·(1−D) en los 27 sitios, coordenadas y fuentes.

## 2026-11-14 · 22:08 · Arreglos de Diseño (revisión en vivo)
- Móvil: `overflow-x-clip` (el globo se queda fijo al bajar), disposición vertical con aspecto < 1,2 (globos más grandes), separación de marcadores 40 px en táctil, botones de 44 px en táctil.
- Etiqueta del objetivo encima del marcador (no tapa los arcos); tramo «no puntuado» más claro; halo de la Tierra más suave.
- «Pause motion» en la cabecera en todos los modos (WCAG 2.2.2); `<h1>` accesible en modo misión; favicon SVG; Open Graph; caché de 7 días para `/tex`.
- No aplicado: cambiar la cifra de las filas por el percentil (Crítico pidió mostrar el índice 0–1).

## 2026-11-14 · 22:06 · Revisión de Crítico y de Logos Legal aplicadas
- Crítico («sí con cambios»): la hoja de método describía la fórmula v2 → reescrita con la v3 (índice = 0,5·F + 0,5·(1−D)) y su circularidad. La nota se muestra como «analog index» 0–1, no como %, con aviso de que no es una probabilidad. «New candidates» → «New regions to investigate». Límite clave de cada misión en ámbar junto al nombre (basalto no confirmado, dunas no confirmadas, hielo inferido).
- Logos Legal: `vercel.json` con CSP y cabeceras de seguridad; cita completa de WDPCA con enlace; avisos de viaje de EE. UU. y del Reino Unido separados; enlaces a OSM y a la licencia de GLiM («modified»); `LICENSE` MIT que excluye datos de terceros y la marca de WDPCA; README con OSM, NSSDC y GLiM.
- Quitado el prefijo de continente de los nombres de región. Datos de acceso: citas corregidas en la copia del repo (avisado a Logos Datos).

## 2026-11-14 · 22:05 · Front «Orbit» con datos v3
- Escena única con la Tierra, la Luna y Marte (Orrery de Diseño) y arcos del objetivo a cada lugar. Tramos del arco: «no puntuado» junto al objetivo, luego las 3 condiciones principales (la más importante llega al lugar); ámbar = la analogía se rompe.
- 3 misiones con datos v3 de Logos Datos: 6 regiones nuevas por misión + análogos conocidos para validar; ficha por lugar (nota, condición por condición frente al objetivo, ángulo del Sol en la misión lunar, dónde se rompe con fuentes NSSDC, «access complexity» neutral). Hoja «Method & sources».
- `?capture=1` conserva el búfer de WebGL para capturas y grabación (la herramienta de capturas del agente no ve el canvas sin eso).
- Comprobado: tsc, lint, 20 pruebas, build; en local, escena, misión, ficha y hoja de método.

## 2026-11-14 · 21:50 · Datos de sitios y propuesta de diseño
- Logos Datos: `sites.json` (9 análogos conocidos + control Amazonia, 4 objetivos), `validacion.md` (reglas simples por misión: T1 3/4, T2 3/3, T3 2/2; el control falla las 3) y `suelo-espectral.md` (solo «next step» esta noche). Limitaciones: la pendiente GMTED no sirve (54 % de celdas a 0°); valores de la Luna/Marte aproximados; T1 no es específica sin capa de roca.
- Falta: análogos NUEVOS (búsqueda global por misión) → pedido a Logos Datos.
- Diseño: propuesta «Orbit» (una escena 3D con 3 mundos y arcos). Se aplica adaptada a 3 misiones y a los datos nuevos.
- zexu autoriza push a main hasta el domingo a las 13:00 con tsc, lint, build y comprobación local; después, congelado.

## 2026-11-14 · 21:37 · Licencias de «access risk» (Logos Legal)
- `licencias-geopolitica.md`. WDPA: solo como marca por sitio, sin polígonos, nombres, IDs ni descargas; atribución con mes y año; queda fuera de la licencia abierta del repo. No hablar de ingresos ni ROI en el pitch (si no, pasar a OSM).
- ACLED fuera; se usa UCDP (CC BY 4.0). No usar el shapefile de la ATS.
- Texto neutral: «Governance perception (WGI, perceptions-based)»; los avisos de viaje son solo de EE. UU. y del Reino Unido; se muestra el nivel del aviso; fronteras de facto sin postura sobre soberanía; los pesos se marcan como decisión del equipo.

## 2026-11-14 · 21:35 · Fuentes de «access risk»
- Logos Datos: `geopolitica.md`. Fuentes abiertas: WGI, UCDP GED, avisos de viaje de EE. UU. y del FCDO del Reino Unido, Natural Earth, AADC, Oxford MAP. ACLED queda fuera (EULA). WDPA: decide Logos Legal.
- Indicador propuesto `access_complexity` 0–1 (0,40 gobernanza + 0,35 distancia a conflictos + 0,25 avisos de viaje), con pesos editables, una marca aparte de permisos, sin puntuación al sur de 60°S y sin asignar país en zonas disputadas.

## 2026-11-14 · 21:33 · Tabla de misiones y elección de 3
- Logos Datos: 21 campañas reales con fuente (`misiones.md`).
- Elegidas (veto de zexu pendiente): EVA en basalto (Luna, Mons Mouton), rover en arena y pendiente (Marte, Jezero), hielo somero para ISRU (Marte, Arcadia). Ángulo del Sol como atributo en la misión lunar. Ver `misiones-elegidas.md`.

## 2026-11-14 · 21:32 · La entrega se adelanta a las 16:00
- zexu adelanta la entrega al domingo a las 16:00 (todo listo a las 15:00). Plan rehecho en `plan.md`.
- Líder elige 3 misiones con la tabla de Datos y zexu las veta; el diseño se aplica en cuanto llega; Vercel se crea ya; la revisión es de madrugada.

## 2026-11-14 · 21:32 · Créditos y declaración de IA (informe de Logos Legal)
- Informe: `/home/zexu/OpenBot/Shared/logos/legal/informe-reutilizacion.md`. Todo lo reutilizado se puede usar.
- README: texto «Use of AI» de Legal, créditos exactos de las texturas y librerías, «This project is not endorsed by NASA». Pie en la web.
- `AI_USAGE.md` + cabecera `AI-assisted (Claude), reviewed by team Logos` en los archivos de código.
- Si se reutiliza el visor de terreno: EOX s2cloudless solo la capa 2016 (CC BY 4.0; 2018+ es NC-SA) y bloque completo de atribución de AWS Terrain Tiles.
- Riesgo aceptado por ahora: `npm audit` da 1 alta en postcss dentro de next 15.5.29 (solo al compilar; web estática). Valorar next 16 si da tiempo.

## 2026-11-14 · 21:31 · Arranque del repo
- OK de zexu para empezar desde cero en `~/Logos`. Enfoque: análogos por misión + riesgo de acceso geopolítico (ver `origen-idea.md`).
- Del prototipo anterior (`~/spaceapp`, mismo equipo) se reutiliza solo: globo 3D (`Globe.tsx`, `globe-math.ts` con su test) y texturas de la Tierra, la Luna y Marte. El método de puntuación anterior NO (perdía la correlación y el parecido).
- Esqueleto Next.js 15 estático (`output: "export"`), sin base de datos. `npm test`, `tsc`, `npm run build` y `npm run lint` pasan.
- Encargado: Logos Datos (misiones reales, suelo por espectro, fuentes de geopolítica), Logos Legal (licencias y declaración de IA), Diseño (propuesta de front).
