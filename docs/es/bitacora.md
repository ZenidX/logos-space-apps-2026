# Bitácora

Entradas nuevas arriba. Horas = hora del commit (CET). Corregido a las 21:50: las primeras entradas llevaban horas estimadas, no reales.

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
