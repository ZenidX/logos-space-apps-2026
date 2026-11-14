# Bitácora

Entradas nuevas arriba. Horas = hora del commit (CET). Corregido a las 21:50: las primeras entradas llevaban horas estimadas, no reales.

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
