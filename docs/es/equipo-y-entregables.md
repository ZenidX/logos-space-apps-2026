# Equipo y entregables · proyecto Logos (NASA Space Apps 2026)

Nota de trabajo en español (lo entregado está en inglés). Escrito por Logos Líder el 15-11-2026 a las 02:20 (CET), por encargo de zexu: «que se documente todo; que no falte nada de nadie».

**Qué es.** El inventario único del equipo: por agente → qué hizo → archivos y rutas → commits → pendiente → no comprobado. Al final, lo descartado y por qué, la tabla de los 40 commits y lo que no ha comprobado nadie.

**Cómo leerlo.**
- Las horas son reales: salen de `git log`, de la fecha de modificación de los archivos o de `date`. Hora local (CET).
- `~` es la carpeta personal de zexu en el ordenador donde corre OpenBot. Lo que no está en el repo está en `~/OpenBot/Shared/` (entregas compartidas) o en la carpeta de cada agente (`~/OpenBot/Agents/<agente>/`).
- Los agentes son herramientas de IA (Claude, de Anthropic) dirigidas por zexu. **Las decisiones son de zexu y su equipo** y están apuntadas con hora en `docs/idea-origin.md`; los agentes las ejecutaron. El uso de IA está declarado en `README.md` y `AI_USAGE.md`.
- Solo Logos Líder escribe en el repo; por eso todos los commits del repo son suyos (a nombre de zexu). En cada agente se indica en qué commits entró su trabajo.
- Fuentes de este inventario: la memoria de cada agente (rutas en el apartado 1), las carpetas compartidas, `git log` del repo y del vault, y los mensajes entre agentes.

## 1. El equipo en una tabla

| Agente | Papel | Memoria (ruta · líneas · actualizada) | Entregables principales |
|---|---|---|---|
| zexu y su equipo (personas) | Idea, decisiones, revisión, vídeo y página | `docs/idea-origin.md` (decisiones con hora) | La idea (análogos por misión + acceso neutral) y todas las decisiones del apartado 2 |
| Jefe | Recibe las órdenes de zexu y las reparte; comprueba lo publicado | `~/OpenBot/Agents/agent-2721012f…/MEMORIA.md` · 39 · 15-11 02:51; `historial.md` (155); traspaso en `informes/2026-11-15-logos-traspaso.md` (169 líneas) | Vercel creado; dos auditorías independientes de los datos; traspaso completo |
| Logos Líder | Jefe del proyecto; único que escribe en `~/Logos`; publica | `~/OpenBot/Agents/agent-e560e859…/MEMORIA.md` · 87 · 15-11 02:18; `historial.md` (61) | El repo entero, la web y este inventario |
| Logos Datos | Buscar, tratar y verificar datos | `~/OpenBot/Agents/agent-f529d5c0…/MEMORIA.md` · 102 · 15-11 02:10; `historial.md` (92) | `sites.json` v1–v8, pipeline, método, auditoría de fuentes, terreno, cribado, comprobación independiente |
| Logos Legal | Licencias, normas de Space Apps, IA declarada, seguridad (solo lectura) | `~/OpenBot/Agents/agent-fef08234…/MEMORIA.md` · 139 · 15-11 02:09; `historial.md` | 9 informes y los campos de la página del proyecto |
| Logos Tester | Probador a ciegas: solo conoce la URL | `~/OpenBot/Agents/agent-a5391525…/MEMORIA.md` · 135 · 15-11 02:10 | 2 pruebas a ciegas con capturas |
| Diseño (común) | Propuestas visuales; no escribe en el repo | `~/OpenBot/Agents/agent-8c5b7678…/MEMORIA.md` · 46 · 15-11 00:43 | Propuesta «Orbit», dirección de arte v2, v3 y v4 |
| Crítico (común) | Revisor independiente (solo lectura) | `~/OpenBot/Agents/agent-4d19a6e9…/MEMORIA.md` · 33 · 15-11 02:12 | 2 revisiones con veredicto |
| Consulta (común) | Preguntas con fuente | `~/OpenBot/Agents/agent-778d7294…/MEMORIA.md` · 34 · 14-11 23:58 | Principios de diseño con fuente; repos de GitHub revisados |
| Documentador (común) | Único que escribe en el vault de Obsidian | `~/OpenBot/Agents/agent-ab54f299…/MEMORIA.md` · 31 · 15-11 02:29 | Notas del proyecto en `007 Proyectos/Space-Apps-2026-Logos/` |

Dónde vive todo:
- Repo: `~/Logos` (GitHub público `zexuguo/SpaceApp-Logos`). `main` = lo publicado; rama de trabajo `work`.
- Web: https://spaceapp-logos.vercel.app (Vercel, sitio estático; cada push a `main` publica).
- Entregas compartidas: `~/OpenBot/Shared/logos/{datos,legal,diseno,consulta,capturas}/`, `~/OpenBot/Shared/logos-prueba-ciega-1/` y `-2/`.
- Vault: `~/obsidian/007 Proyectos/Space-Apps-2026-Logos/`.

## 2. Decisiones de zexu (lo que mandó, con hora)

La hora es la del mensaje con el que Jefe pasó cada decisión a Logos Líder.

| Cuándo | Decisión |
|---|---|
| 14-11 21:28 | Arranque: análogos **por misión** + viabilidad geopolítica neutral; la idea es 100 % suya y de su equipo y debe quedar escrita con fecha; empezar de cero en `~/Logos`; método nuevo, por misión y validado; front muy visual con globos 3D; sin base de datos; el vídeo lo hace su equipo; commits a su nombre sin `Co-authored-by`. |
| 14-11 21:32 | La entrega pasa del domingo 23:59 a las **16:00** (todo listo a las 15:00; capturas y textos a las 12:00). |
| 14-11 21:44 | Permiso para publicar sin preguntar hasta el domingo a las 13:00 si pasan tsc, lint y build y se comprueba en local y en vivo; después, congelado. |
| 14-11 22:16 | «Buscarle las cosquillas a la web y ganar»: auditoría total de fuentes, normas, seguridad, front y back. |
| 14-11 22:42 | «Falta alma, falta el toque profesional»: tipografía propia, vista de comparación, animaciones, «How it works». |
| 14-11 23:17 | «La información se enseña mal; quiero que me cueste ver que es una web»: vistazo primero, cristal, logo, criterio con fuentes. |
| 14-11 23:41 | Los arcos atraviesan el globo: arreglarlo de raíz; enseñar el «dónde»; crear un probador a ciegas. |
| 14-11 23:55 | «Las flechas se siguen viendo raras»: que rodeen, no que abracen; más información con fuente. |
| 15-11 00:21 | Elige la «órbita compartida» para señalar el «dónde». |
| 15-11 00:36 | La **rechaza por falsa** (Marte no orbita la Tierra). Escena = **sistema real con el Sol**. Interfaz = **«D · Radial»**. 4.ª misión sí («Low-Sun operations and solar power»); 5.ª solo si se valida antes de las 09:00. |
| 15-11 00:38 | Los sitios, con líneas discontinuas semitransparentes, como las órbitas (tres variantes a elegir). |
| 15-11 00:43 | **Opción B**: línea de cada sitio a su nombre, fuera del globo, sin línea al mundo objetivo. Cuatro añadidos: filtros de logística, selector Flat / Steep / Any, niveles de evidencia como insignia y orden, «Hardware rehearsed». Extra opcional: deslizadores «Your priorities». No copiar: «fit %», pesos sin fuente, misiones sin campaña real. |
| 15-11, antes de la 01:50 | «Que el Líder documente todo también; que no falte nada de nadie» (este documento; atendido desde las 02:08). |

Pendiente de zexu (nadie más puede hacerlo): apartado 7.

## 3. Agentes del proyecto

### 3.1 Logos Líder
**Qué hizo.** Montó el repo y la web y publicó 40 commits entre el 14-11 a las 21:31 y el 15-11 a las 02:05. Integró cada entrega de Datos, Legal, Diseño, Crítico, Consulta y el Tester, aplicó las órdenes de zexu que llegaban por Jefe y comprobó cada versión en local y en vivo.
- **Escena 3D** (cuatro generaciones; solo queda la última): tres globos con arcos → arcos por fuera de los globos → «órbita compartida» → **sistema real con el Sol** (`src/components/SolarScene.tsx`, `src/lib/solar-math.ts`) con los nombres de los sitios fuera del globo (`src/lib/label-layout.ts`).
- **Página y fichas**: `src/app/page.tsx` (portada, lista por evidencia, filtros, historial del navegador), `src/components/SitePanel.tsx` (vistazo + pestañas), `MethodSheet.tsx`, `Evidence.tsx`, `RadialDial.tsx`, `TerrainCompare.tsx`, `LocatorMap.tsx`, `ConditionStrip.tsx`, `Count.tsx`.
- **Modelo y reglas**: `src/lib/missions.ts` (textos por misión, `HARDWARE`, `REMOVED`, `INDEPENDENT`, niveles de evidencia, filtros, limpieza de unidades), `rules.ts`, `radial-data.ts`, `globe-math.ts`, `globe-tex.ts`.
- **Pruebas** (`npm test`, 20 comprobaciones; `npm run test:data`, 6): geometría del globo, escena, colocación de nombres (4.000 escenas), integridad de los datos (fórmula del índice, suelo de avisos, permisos con fuente, nombres en alfabeto latino), reglas («in range» / «accepted»), dial.
- **Documentos**: `README.md`, `AI_USAGE.md`, `LICENSE`, `docs/idea-origin.md`, `docs/design-rationale.md`, `docs/region-screening.md`, `docs/submission/project-page.md` y `references.md`, `docs/es/` (bitácora, plan, este inventario). Integrados de Datos: `docs/method.md`, `docs/sources.md`, `docs/missions.md`, `docs/independent-check.md`, `docs/independent-check-v8.md`, `docs/next-missions.md`, `docs/region-screening.json`, `scripts/data/`.
- **Despliegue**: `vercel.json` (cabeceras de seguridad propuestas por Legal), `next.config.ts` (exportación estática).

**Commits.** Los 40 (tabla del apartado 5).

**Decisiones propias que zexu puede vetar** (contadas a Jefe): retirar el Tankwa Karoo; bajar el norte de Ellesmere a «parcial»; ordenar la lista por evidencia (conocidos primero); desplegable «About this mission»; etiqueta «Used in real campaigns»; dejar «Support nearby · ground only» en la misión de Sol bajo.

**Pendiente.** Rutinas programadas para hoy: 09:00 medir fps y Lighthouse; 10:00 deslizadores «Your priorities» solo si todo está estable; 11:15 capturas y textos finales (`docs/submission/screenshots/`); 12:40 comprobación final antes de congelar a las 13:00. Bajos del Tester sin hacer: relieves 3D pequeños a 1366×768, ejes completos en las gráficas, filtros en la dirección, aviso si el enlace trae una misión que no existe. Opcional sin hacer: posiciones reales de la fecha con los elementos de JPL (`~/OpenBot/Shared/logos/datos/v7/kepler.md`).

**No comprobado.** Un móvil real y otros navegadores (solo ventana de 390 px en el navegador de OpenBot). Fps desde el cambio de escena. Lighthouse en vivo desde 5b7d2de (en local, con la máquina cargada: móvil 77). Lector de pantalla. Que los enlaces externos digan exactamente lo citado (lo verificó Datos; yo solo que respondan).

### 3.2 Logos Datos
**Qué hizo** (horas de sus archivos):
- 14-11 21:34–21:50 · Fuentes abiertas para el acceso (`geopolitica.md`), estudio del suelo por espectro (`suelo-espectral.md`), tabla de campañas reales (`misiones.md`), `sites.json` v1 y primera validación (`validacion.md`).
- 21:50–22:09 · v2 (similitud gaussiana + media geométrica) y **v3** (índice F + D, regiones contiguas, roca volcánica de GLiM).
- 22:23–22:38 · Pipeline reproducible (pasos 01–05 y prueba), **v4** sin WDPCA y con valores de los objetivos con fuente; `misiones.md` corregido.
- 22:45–23:54 · **v5**: 30 relieves de 96 × 96 puntos (11 × 11 km), pendiente y rugosidad, Sol mensual, temperatura (NASA POWER), ciudad, aeropuerto y tiempo de viaje; auditoría de la web en vivo (27 fichas).
- 15-11 00:14–00:29 · **v6**: cribado del suelo (pendiente, hielo, agua), 6 regiones retiradas y sustitutas, comprobación independiente de 13 regiones, explicación de la arena al 54 %.
- 00:41–01:03 · Posiciones Tierra–Marte con elementos de JPL (`kepler.md`), «Next missions», `method.md` limpio, `fuentes.md` con 261 afirmaciones.
- 01:13–01:21 · **v7** (4.ª misión, suelo de avisos, permisos con fuente, `coverageWeight`) y **v8** (nombre de Chukotka en inglés, motivos con un decimal, comprobación independiente de 9 regiones más).

**Dónde está** (`~/OpenBot/Shared/logos/datos/`; lo vigente):
- `v8/sites.json` (etiqueta interna v7: 4 misiones, 31 sitios), `v8/terrain-index.json`, `v8/site-details.json`, `v8/heightmaps/`, `v8/screening.json`, `v8/independent-check-v8.md` y `.json`.
- `v6/independent-check.md`, `v6/verificacion-regiones.md`; `v7/kepler.md`, `kepler_check.py`, `kepler_controls.json`, `v7/next-missions.md`; `v5/README.md`, `v5/NOTICE-moon.txt`.
- `method.md`, `fuentes.md`, `misiones.md`, `geopolitica.md`, `suelo-espectral.md`; `pipeline/` (14 archivos).
- Superado: `sites.json` de la raíz (v4), `validacion.md`, datos de `v5/`, `v6/` y `v7/`; scripts v1–v3 en su carpeta.
- Datos de entrada (URL, tamaño, suma de comprobación y ruta local) y los comandos para repetirlo todo: en su `MEMORIA.md`, apartados 3 y 7.

**En el repo.** `src/data/*.json`, `public/heightmaps/`, `scripts/data/`, `docs/method.md`, `docs/sources.md`, `docs/missions.md`, `docs/independent-check*.md`, `docs/next-missions.md`, `docs/region-screening.json`. Commits: d33b1f5, a08d0e8, 82c52f1, 84f41e5 (v3), ae7242f (v4), 5993f57, 530e72b (v5), a950b77, f3f48b0, 34c5701 (v6), 1300144 (v7 y v8), 3e13fba.

**Pendiente.** `fuentes.md` no cubre aún el cambio de nombre de Chukotka ni la comprobación independiente v8. De su tabla «Changes needed» siguen abiertas en la web: la nota de mar a 0 m en los relieves (hoy solo afecta a Timanfaya; la nota general está en la pestaña Shape). Verificar en origen la licencia de ESA WorldCover y la duda de Oxford MAP (CC BY 4.0 o 3.0), a petición de Legal.

**No comprobado.** La web con la misión 4 (su última auditoría completa de la web fue con v5). Páginas que bloquean robots, leídas por Wayback o copia (USGS, JPL, DOI de AGU/Wiley); `travel.state.gov` no se leyó. Veredictos e imágenes de la comprobación v6 no reabiertos; 4 artículos solo por registro bibliográfico. 3 de 4 valores de control de Horizons. Licencias de las texturas; condiciones de Moon/Mars Trek. Siguen como estimación: albedo de Mons Mouton (0,15) y sus ángulos de Sol (calculados, sin relieve), ubicación de MDRS, distancias de la comprobación independiente.

### 3.3 Logos Legal
**Qué hizo** (solo lectura; nada de esto es asesoría legal):
- 14-11 21:31 · Informe de reutilización de `~/spaceapp` y primer texto «Use of AI».
- 21:36 · Licencias de las fuentes de acceso; ACLED fuera; cinco ajustes de neutralidad.
- 22:04 · Seguridad de la web y `vercel.json` exacto (CSP y cabeceras); licencias de GLiM, Natural Earth, OSM, NSSDC.
- 22:08–22:47 · Checklist de Space Apps con las guías oficiales (leídas el 14-11); aquí **retiró el visto bueno a WDPCA**.
- 22:47 · Licencias v5 (relieves, POWER, OurAirports).
- 23:35 · Revisión de 689515c (tipografías, logo, NOTICE). 15-11 00:07 · Revisión de a7f7f84. 01:47 · Revisión de 289d5a0 (9 cambios, ninguno bloqueante). 01:48 · Campos de la página del proyecto (v8).

**Dónde está** (`~/OpenBot/Shared/logos/legal/`): `informe-reutilizacion.md`, `informe-geopolitica.md`, `informe-seguridad-v3.md`, `checklist-spaceapps.md`, `licencias-v5.md`, `revision-689515c.md`, `revision-a7f7f84.md`, `revision-289d5a0.md`, `campos-pagina-proyecto-v8.md` (**los únicos campos que hay que pegar**; copia en inglés en `docs/submission/references.md`). Qué normas aplicó y de qué apartado de cada guía salen, y cada licencia con dónde y cuándo la comprobó: en su `MEMORIA.md`, apartados 3 y 4.

**En el repo.** Commits: 6b00c5b, 7ae3395, ed1a5ec, 7523cd0, ec3b912, ae7242f, a674a6c, a7f7f84, 3e13fba (los 9 cambios de su última revisión, aplicados a la 01:50).

**Pendiente.** No ha revisado nada posterior a 289d5a0 (sí están aplicados sus cambios). El vídeo, la página del proyecto y la pestaña Members no los puede ver: dependen de zexu.

**No comprobado.** Licencias de las texturas en su origen (GIBS, SVS, Mars Trek); WGI, FCDO, OSM y WorldCover no releídas por él; enlaces que dan 403 a robots (Smithsonian, phys.org, DOI de Wiley) y SWIM (523); artículos de la comprobación independiente (se fía de la lectura de Datos); ficha del DEM LOLA de 30 m. Que la idea sea del equipo y que el equipo haya revisado los archivos son declaraciones de zexu.

### 3.4 Logos Tester
**Qué hizo.** Dos pruebas a ciegas (solo con la URL; sin leer el repo ni los informes):
- **Prueba 1** · 14-11, 23:42–23:57 (su informe llevaba las horas en UTC; fe de erratas añadida el 15-11 a las 02:09). 3 misiones, 27 sitios × 5 pestañas, teclado, 18 enlaces; 1655×925, 1366×768 y móvil 390×844. Sin bloqueantes; 6 altos (arcos que atraviesan globos, «in range» mal usado, acceso frente a lejanía, teclado, pestañas fuera de la vista, cabecera en móvil).
- **Prueba 2** · 15-11, 01:43–01:52, sobre la versión de la 01:40. 6 tareas, globo, teclado, 17 enlaces nuevos; 1366×768, 1920×1080 y móvil. Sin bloqueantes ni errores de consola; 1 alto (la ficha se abría desplazada) y 10 medios.

**Dónde está.** `~/OpenBot/Shared/logos-prueba-ciega-1/prueba-ciega-1.md` + `capturas/` (21); `~/OpenBot/Shared/logos-prueba-ciega-2/informe.md` + 14 capturas. Lista de hallazgos con su estado y guion de una tercera pasada: en su `MEMORIA.md`, apartados 4 y 6.

**En el repo.** Arreglos de la prueba 1: a950b77, eb1d1bc. De la prueba 2: 355c768 y 5d0b734.

**Pendiente.** **No ha comprobado los arreglos de 355c768 y 5d0b734**: para él constan como «dicho arreglado». Su tercera pasada (15 comprobaciones ordenadas) está escrita y se puede repetir sin él.

**No comprobado.** Gestos táctiles y teléfono real; botón Atrás real (lo dedujo); las 4 misiones completas en todos los tamaños (abrió 6 fichas de 29 en la prueba 2); lector de pantalla, otros navegadores, conexión lenta; exactitud científica.

## 4. Agentes comunes

### 4.1 Jefe
**Qué hizo.** Pasó a Logos Líder cada orden de zexu y cada veto; creó el proyecto de Vercel (14-11 21:38); revisó en vivo casi todas las versiones (avisos: valores sin fuente, cabecera de móvil, «1.00», mini-mapas, arcos, pestañas cortadas, etiqueta v7/v8, color de los relieves); enseñó a zexu muestras para decidir (7 formas de señalar el «dónde», 5 interfaces A–E, 3 variantes de líneas: no se guardaron).
**Dos auditorías independientes**, recalculando los datos publicados: (1) 15-11 00:50, sobre 34c5701: similitudes, reglas, índice, distancias entre regiones, Sol mensual y acceso de 26 sitios → 0 discrepancias; hallazgos: los «pesos» no entran en el índice, Rusia «Medium» con avisos al máximo, permisos del Tíbet, etiqueta de versión, regiones retiradas dentro del JSON, pendiente de McMurdo. (2) 15-11 01:50, sobre 289d5a0: índice y reglas de 26 sitios, índice de la misión 4, Sol y pendiente de los 29 sitios mostrados → 0 discrepancias.
**Dónde está.** `~/OpenBot/Agents/agent-2721012f…/informes/2026-11-15-logos-traspaso.md` (traspaso, 15 apartados), `tmp/audit/` y `tmp/audit/v8/` (scripts y JSON auditados), capturas en `~/OpenBot/Shared/spaceapp/`; cuatro notas «Logos-Traspaso-*» en el vault (commit 7c7a5de).
**En el repo.** Sus avisos entraron en ec3b912, 3ea5c11, 7fc8ce8, 42b183b, eb1d1bc, 5b7d2de, a5a10ca.
**No comprobado por él.** Móvil real; otros navegadores; el rendimiento (lo repite lo que mide Líder).

### 4.2 Diseño
**Qué hizo** (propone; no escribe en el repo; no pudo ver la web en pantalla):
- 14-11 21:46–21:48 · **Propuesta «Orbit»**: `PROPUESTA.md`, `maqueta.html`, `codigo/` (escena `Orrery.tsx` de tres globos con arcos, `orrery-math.ts`, `arcs.ts`, pruebas, `tokens.css`), `herramientas/`, `assets/stars.svg`.
- 22:06 · Revisión de la web publicada (`revision-en-vivo-2026-11-14.md`): móvil, áreas táctiles, pausa, favicon, caché.
- 22:45–22:52 · **v2, dirección de arte**: `DIRECCION-DE-ARTE.md`, `TIPOGRAFIA.md` (Instrument Serif / Sans + Geist Mono), `maqueta-v2.html`, `how-it-works.html`, `codigo/` (`ConditionStrip.tsx`, `rules.ts`, `SunChart.tsx`, `sun.ts`, `ReliefProfile.tsx`, `motion.tsx`, con pruebas).
- 23:19–23:25 · **v3**: `GLASS.md` + `glass.css` (contraste AA calculado), `TIPOGRAFIA-v3.md` (Bricolage Grotesque + Martian Mono), `LAYOUTS.md` + 4 maquetas, `logo/` (símbolo, favicon, imagen og).
- 15-11 00:42–00:43 · **v4**: `RADIAL.md`, `RadialDial.tsx`, `radial-data.ts` con prueba (26 sitios reales), `radial.css`, `ESCENA-SOL.md` (escena con el Sol y pie honesto de escalas).

**Dónde está.** `~/OpenBot/Shared/logos/diseno/` (raíz, `v2/`, `v3/`, `v4/`) y copia en su carpeta, `propuestas/logos-front-2026-11-14/`.
**En el repo.** 84f41e5 (Orbit), 7523cd0 (su revisión), 4bfa763 y 530e72b (v2), 3ea5c11 (tiras de rango y reglas), 8d00520 y d2434d4 (v3), 5b7d2de (v4).
**Aplicado.** Estilo y tokens; tipografía v3; cristal en escritorio; logo, favicon e imagen og; vistazo primero con pestañas; tiras de rango; dial radial; pie de escalas.
**No aplicado o descartado.** La escena Orrery con arcos (apartado 6); tipografía v2 (sustituida por la v3); cristal en móvil (apartado 6); barra de pestañas inferior en móvil y estado «Detail» comprimido (`v3/LAYOUTS.md`); `?demo=1`.
**No comprobado por él.** El render real en pantalla (no tiene navegador), móvil real, rendimiento.

### 4.3 Crítico
**Qué hizo.** Dos revisiones de solo lectura, las dos con veredicto **«sí con cambios»**:
- 14-11 22:03 · sobre 84f41e5. Riesgos: los resultados son candidatos amplios, no sitios confirmados (la roca volcánica sale de un mapa de 0,5°, unos 80 km; el hielo se infiere de la temperatura); la hoja de método describía la fórmula antigua y el 99,8 % se enseñaba como «match»; validación parcialmente circular y con pocos casos. Aplicado en ed1a5ec (22:06).
- 14-11 22:35 · «como jurado», sobre ae7242f y la web. Nueve reemplazos exactos: no presentar Mons Mouton como candidato vigente de Artemis III; «every available condition… at least 66 %»; la misión 1 pasa a llamarse «Suited EVA on volcanic terrain»; «the score does not detect ice»; cabeceras de `method.md` y `sources.md` al día; «access-complexity index… not a feasibility or safety assessment»; frase del usuario («first-pass shortlist… not a site recommendation»); respuesta en una frase a la validación circular. Aplicado en 3747c2c (22:37) y 5993f57 (22:39).
**Dónde está.** Sin archivo: las dos respuestas llegaron por mensaje. Resumen en su `MEMORIA.md` (apartado «Logos») y en `docs/es/bitacora.md` (entradas del 14-11 a las 22:06 y 22:37).
**No comprobado por él.** La web publicada (en la primera), pruebas, fuentes y datos; no ha visto nada posterior a ae7242f ni ha verificado que sus cambios se aplicaran.

### 4.4 Consulta
**Qué hizo.**
- 14-11 23:19 · `design-principles.md`: 14 principios con su cita y enlace (NN/g, Laws of UX, WCAG 2.2, Material 3, Apple HIG); todas las direcciones respondían ese día. Aviso: Apple no publica duraciones ni curvas de movimiento (no se inventaron).
- 14-11 23:57 · `references-github.md`: 12 repositorios (7 de globos y arcos, 5 de cristal), 11 con licencia MIT leída y 1 «solo idea». Avisos: la refracción SVG dentro de `backdrop-filter` solo va en Chromium; el repo oficial `github/globe` da 404.
- También el 14-11, para el proyecto anterior: qué crédito piden NASA SVS y Trek para las texturas (las mismas que usa este).
**Dónde está.** `~/OpenBot/Shared/logos/consulta/design-principles.md` y `references-github.md`.
**En el repo.** `docs/design-rationale.md` (d2434d4 y a7f7f84). De los repos solo se tomaron ideas; no se copió código.
**No comprobado por él.** No probó ninguna librería; `prefers-reduced-motion` en web; la política de uso de Trek.

### 4.5 Documentador
**Qué hizo.** Pasó al vault el estado del proyecto a medida que se le enviaba. Commits del vault sobre Logos: 8f050da (14-11 21:31), b936377 (23:17), e0b4044 (23:34), 4faa5e3 (15-11 00:47), 2ff738e (00:52), 7c7a5de (00:58, traspaso de Jefe en cuatro notas), badad72 (01:44, estado de la 01:42), 867d91a (02:26, este inventario, traspaso al día y memorias de Logos y de los comunes), 0d1eaa0 (02:29, Tankwa Karoo como retirada y cifras de validación corregidas).
**Dónde está.** `~/obsidian/007 Proyectos/Space-Apps-2026-Logos/`: `Logos-Repo-Nuevo-2026-11-14.md`, `Logos-Traspaso-Estado-y-Reglas.md`, `Logos-Traspaso-Metodo-y-Datos.md`, `Logos-Traspaso-Decisiones-zexu.md`, `Logos-Traspaso-Calidad-y-Pendientes.md`, enlazadas desde `00-MOC-Space-Apps-2026.md`. Las demás notas de esa carpeta son del proyecto anterior.
**Pendiente.** Nada de este encargo: el inventario y las memorias ya están en el vault (867d91a y 0d1eaa0). Le toca el resumen del rediseño visual cuando se cierre.

## 5. Los 40 commits, con hora y de dónde venía cada uno

Todos a nombre de zexu, hechos por Logos Líder. «Origen» dice de quién era la orden o la entrega.

| Commit | Hora | Qué | Origen |
|---|---|---|---|
| 3247f99 | 14-11 20:52 | Commit inicial del repo | zexu / Jefe |
| db61bf7 | 21:31 | Esqueleto Next.js estático con tres globos | zexu (empezar de cero) |
| 6b00c5b | 21:32 | Créditos, registro de uso de IA, aviso «not endorsed» | Legal (informe 1) |
| 54f218e | 21:32 | Plan rehecho para la entrega a las 16:00 | zexu |
| d33b1f5 | 21:33 | Tabla de campañas reales y las tres misiones elegidas | Datos |
| a08d0e8 | 21:35 | Fuentes abiertas para el acceso | Datos |
| 7ae3395 | 21:37 | Licencias de esas fuentes | Legal (informe 2) |
| 82c52f1 | 21:44 | Bitácora con horas reales; datos de sitios; propuesta de diseño | Datos (v1), Diseño |
| 84f41e5 | 22:01 | Escena «Orbit»: tres globos, arcos y fichas con datos v3 | Diseño, Datos (v3) |
| ed1a5ec | 22:06 | Método v3 en la web, «analog index», límites, cabeceras de seguridad, licencia | Crítico (1), Legal (informe 3) |
| 7523cd0 | 22:08 | Móvil, áreas táctiles, pausa, favicon, caché | Diseño (revisión en vivo) |
| ec3b912 | 22:24 | Auditoría 1: documentos en inglés, término SI, cabecera de móvil, enlace directo, prueba de datos | zexu («ganar»), Legal, Jefe |
| ae7242f | 22:28 | Auditoría 2: datos v4 sin WDPCA, auditoría de fuentes, pipeline reproducible | Datos (v4), Legal |
| 3747c2c | 22:37 | Nombres de misión honestos, frase del usuario, método más prudente | Crítico (2) |
| 5993f57 | 22:39 | Método y fuentes sincronizados con v4; valores de objetivos con fuente | Datos, Crítico (2) |
| 4bfa763 | 22:47 | Tipografía nueva, animaciones, «How it works» | zexu («falta alma»), Diseño (v2) |
| 530e72b | 22:52 | Vista de comparación con relieve 3D, Sol y temperatura por mes | Datos (v5), Diseño (v2) |
| 8f26486 | 22:59 | Rendimiento: sin arranque por temporizador; textura grande después | Líder |
| 595e789 | 23:03 | Rendimiento: arranque escalonado solo en pantallas pequeñas | Líder |
| 65e46f4 | 23:07 | Arreglo de las variables de tipografía | Líder |
| 3ea5c11 | 23:11 | «Why» con tiras de rango; relieves más grandes | Jefe, Diseño (v2) |
| 8d00520 | 23:23 | Vistazo primero con pestañas, arcos limpios, cristal, logo | zexu (2.ª ronda), Diseño (v3) |
| d2434d4 | 23:26 | Tipografía v3, portada sin desplazamiento, criterio de diseño con fuentes | Diseño (v3), Consulta |
| 689515c | 23:31 | Móviles: paneles sólidos en vez de cristal (coste medido) | Líder |
| 7fc8ce8 | 23:35 | Pulido: relieves, un arco en la ficha, cristal más ligero | Jefe |
| a674a6c | 23:37 | Créditos: aviso de Copernicus, autores de las tipografías | Legal |
| 6ebdff2 | 23:45 | Arcos por fuera de los globos (con prueba); mini-mapas | zexu (3.ª ronda) |
| 42b183b | 23:48 | Índice «≥ 0.99» con nota honesta; mini-mapas recolocados | Jefe |
| a950b77 | 15-11 00:01 | Arcos como órbita de transferencia; arreglos de la prueba a ciegas 1; auditoría de fuentes v5 | zexu (4.ª ronda), Tester (1), Datos |
| a7f7f84 | 00:04 | Cristal más minimal, franja de cifras, referencias de GitHub | zexu (4.ª ronda), Consulta |
| eb1d1bc | 00:11 | Credibilidad: etiquetas probadas, índice con 3 decimales, regiones empinadas fuera, permisos frente a lejanía | Jefe (tras Tester 1) |
| f3f48b0 | 00:29 | «Órbita compartida» en lugar de arcos; el cribado retira tres regiones más | zexu, Datos |
| 34c5701 | 00:33 | Datos v6: regiones cribadas, sustitutas, comprobación independiente | Datos (v6) |
| 5b7d2de | 00:50 | Sistema real con el Sol, dial radial, suelo de avisos, permisos, «Next missions» | zexu (00:35), Diseño (v4), Jefe (auditoría) |
| 1300144 | 01:28 | Nombres con línea discontinua fuera del globo; 4.ª misión; datos v7/v8 | zexu (00:43), Datos |
| 289d5a0 | 01:40 | Evidencia como insignia y orden; filtros; hardware; gráfico solar; comentarios en inglés | zexu (00:43) |
| a5a10ca | 01:48 | El vistazo cabe en una pantalla; nota del color del relieve; cita del prototipo paralelo; borrador de la página | Jefe |
| 3e13fba | 01:50 | Revisión de licencias aplicada; campos de la página | Legal |
| 355c768 | 02:01 | Arreglos de la prueba a ciegas 2 | Tester (2) |
| 5d0b734 | 02:05 | Las pestañas caben a cualquier altura común de escritorio | Jefe, Tester (2) |

## 6. Lo descartado y por qué

**Escena**
- **Arcos entre los globos** (cuatro intentos: arcos de cuatro tramos, arcos por fuera de los globos, curvas tipo órbita de transferencia, solo los sitios que miran al objetivo). Cruzaban, abrazaban o rodeaban los globos de forma rara; zexu los rechazó en tres rondas. Se eliminó el código (`Orrery.tsx`, `arcs.ts`, `orrery-math.ts`).
- **«Órbita compartida»** (la Luna y Marte girando alrededor de la Tierra). zexu la eligió y la rechazó a los pocos minutos **por falsa**: Marte no orbita la Tierra. Se eliminó (`OrbitScene.tsx`, `orbit-math.ts`).
- **Variante C de líneas** (una línea del sitio abierto al mundo objetivo). zexu eligió la B: sin línea al objetivo.
- **Cristal en móvil**: costaba unos 3 s de bloqueo en un móvil simulado; en móvil los paneles son sólidos.
- **Arranque de la escena por temporizador**: mejoraba el móvil y empeoraba el escritorio.
- **Mapas, relieve e imágenes en vivo** (Trek, teselas de terreno, Sentinel-2 de EOX, Leaflet): si caían el día de la demo el visor quedaba vacío, y EOX 2018+ no es de uso comercial. Se sustituyeron por relieves precalculados y recortes de las texturas de NASA.
- **Base de datos y servidor**: no hacen falta; la web lee un JSON.
- **Subir a Next 16**: riesgo a pocas horas de entregar; los 2 avisos de `npm audit` solo afectan al compilar.

**Método y textos**
- **El método de puntuación del proyecto anterior** (`~/spaceapp`): zexu pidió uno nuevo, por misión y validado.
- **v1 y v2 del índice** (reglas sueltas; gaussiana con media geométrica): no permitían validar contra los sitios de campaña. Quedó la v3 (F + D).
- **«Match %» y «99,8 %»**: Crítico avisó de que parecía una probabilidad. Pasó a «analog index (0–1)».
- **«1.00» y luego «≥ 0.99» en las regiones nuevas**: no decía nada. Ahora van tres decimales, se explica que el índice no las ordena y la lista se ordena por evidencia. El «index rank n of N» también se quitó (contradecía eso).
- **«Moonwalk on basalt»**: el polo sur lunar no es basalto. Pasó a «Suited EVA on volcanic terrain».
- **«Used by agencies»**: MDRS es de la Mars Society. Pasó a «Used in real campaigns».
- **Los «pesos» por condición**: no entran en el índice; ahora se llaman `coverageWeight` y solo fijan el mínimo de datos (66 %).
- **Nubosidad dentro del índice de la misión 4**: POWER es un modelo de unos 50 km; se enseña como contexto.
- **Pendiente de un modelo de 5 km (GMTED)**: demasiado gruesa; se usa Copernicus DEM en ventanas de 11 km.
- **Tipografías**: Space Grotesk + IBM Plex + JetBrains Mono, y después Instrument Serif/Sans + Geist Mono; zexu pedía más carácter. Quedó Bricolage Grotesque + Martian Mono.

**Datos y fuentes**
- **WDPCA / Protected Planet** (áreas protegidas): licencia no comercial y no redistribuible; Legal retiró su visto bueno. Fuera de datos, código y créditos; la web dice que las áreas protegidas no están en el mapa.
- **ACLED** (conflictos): su licencia prohíbe servir los datos en un panel propio. Se usa UCDP.
- **Capa de zonas protegidas de la Antártida (ATS)**: sin condiciones de reutilización.
- **Suelo por espectro** (ASTER, EMIT, Diviner, TES): los datos piden registro; no se pudieron descargar esa noche. Queda como paso siguiente (`docs/es/suelo-espectral.md`).
- **Mapa de hielo SWIM** de Arcadia: el servidor estaba caído el 14-11; se cita como consultado y no usado.

**Misiones**
- **5.ª misión, «Building with local soil / landing pads»**: un solo sitio de campaña (Hawái), sin dato de roca a escala de afloramiento y nada con qué validar. Va sin puntuar en «Other real campaigns».
- **Misiones sin campaña real o sin fuente**: no entran (norma de zexu). CAVES, ARCHES, PISCES/ACME, NEEMO, CHAPEA y AMADEE aparecen solo como texto con enlace, sin puntuar.
- **Sitios ya conocidos como análogos** que se excluyeron de «regiones nuevas»: Qaidam, Dallol/Danakil, Axel Heiberg, Svalbard, Islandia central.

**Regiones retiradas** (8; siguen en `sites.json` y se ocultan con `REMOVED` en `src/lib/missions.ts`; todos los candidatos probados están en `docs/region-screening.json`)

| Región | Misión | Motivo |
|---|---|---|
| Departamento San Carlos, Mendoza (Argentina) | 1 | Pendiente media 15,3°, 1.974 m de desnivel en 11 km |
| Tankwa Karoo, Western Cape (Sudáfrica) | 1 | Pasa el cribado, pero un estudio geológico la sitúa en lutitas, al sur de la línea de la dolerita (De Kock et al. 2017): contradice la roca volcánica |
| Prefectura de Ngari (meseta tibetana) | 2 | Pendiente media 16,4° |
| Karakórum (zona en disputa) | 3 | Pendiente media 17,9° |
| Allaikhovsky, Sakha (Rusia) | 3 | 54 % de la ventana es agua |
| Costa de Coats Land (Antártida) | 3 | Dentro de la capa de hielo y 31 % mar |
| Costa de Baffin, Nunavut (Canadá) | 3 | 18 % glaciar y 56 % agua |
| Montes Qilian, Gansu (China) | 3 | Pasa el cribado, pero es la más débil (puesto 102, 1.324 m de desnivel) |

**No hecho (ni descartado ni decidido)**
- Deslizadores «Your priorities»: se decide a las 10:00, solo si todo está estable.
- Posiciones reales de la fecha con los elementos de JPL (opcional de zexu): datos y prueba listos en `~/OpenBot/Shared/logos/datos/v7/kepler.md`; no programado.
- Color de cada punto del globo según su acceso: Jefe se lo preguntó a zexu; sin respuesta.
- Mapa de detalle de 11 × 11 km con imagen real del sitio.

## 7. Pendiente, y de quién

| Quién | Qué | Cuándo |
|---|---|---|
| Logos Líder | Medir fps y Lighthouse con la máquina libre | 09:00 |
| Logos Líder | Deslizadores «Your priorities», solo si todo está estable | 10:00 |
| Logos Líder | Capturas y textos finales en `docs/submission/` | 11:15–12:00 |
| Logos Líder | Comprobación final y congelar | 12:40–13:00 |
| Logos Tester | Tercera pasada: comprobar los arreglos de 355c768 y 5d0b734 (guion en su memoria) | antes de las 13:00, si se le encarga |
| Logos Legal | Revisar lo posterior a 289d5a0, si se le encarga | antes de las 13:00 |
| Logos Datos | `fuentes.md` con los cambios de v8; licencia de ESA WorldCover en origen; duda de Oxford MAP | sin hora |
| zexu | Confirmar que el equipo ha revisado lo generado con IA (cabeceras «reviewed by team Logos»; `method.md`, `sources.md` y dos JSON dicen «to be reviewed») | antes de entregar |
| zexu | Dar por bueno el texto de la declaración de IA («drafting the scoring method») | antes de entregar |
| zexu | Abrir la web en un móvil real | cuanto antes |
| zexu | Vetar o aceptar las 6 decisiones de Logos Líder (apartado 3.1) | antes de las 13:00 |
| zexu y su equipo | Vídeo ≤ 30 s (o ≤ 7 diapositivas), en inglés o con subtítulos, sin logos de NASA ni menores; sin decir «zona de aterrizaje de Artemis III» | 13:00–15:00 |
| zexu | Página del proyecto: pegar `docs/submission/references.md` y los textos, pestaña Members, las dos casillas, «Submit for Judging» | antes de las 16:00 |

## 8. Lo que no ha comprobado nadie

- La web en un **teléfono real** y con gestos táctiles; otros navegadores; lector de pantalla; conexión lenta.
- **Fps** de la escena desde el cambio a las etiquetas B, y **Lighthouse en vivo** desde 5b7d2de.
- Los arreglos de 355c768 y 5d0b734, por alguien que no sea quien los hizo.
- Licencias y condiciones de las **texturas** en su origen (GIBS, SVS, Mars Trek); condiciones de uso de Trek.
- Que cada enlace externo que bloquea a robots (USGS, JPL, Smithsonian, DOI de Wiley) diga hoy lo citado: se leyeron por Wayback o por copia.
- La exactitud de los artículos de la comprobación independiente más allá de lo leído por Datos; las distancias son aproximadas.
- El **vídeo**, la **página del proyecto** y la pestaña Members.
- Que el equipo humano haya revisado código y datos: es una declaración de zexu.

## 9. Memorias guardadas (estado a las 02:55 del 15-11; todas las del equipo existen y están al día)

| Agente | Ruta de su MEMORIA.md | Líneas | Actualizada |
|---|---|---|---|
| Logos Líder | `~/OpenBot/Agents/agent-e560e859-20f7-43bf-9a37-b6354ca9ed12/MEMORIA.md` (+ `historial.md`, 61) | 87 | 15-11 02:18 |
| Logos Datos | `~/OpenBot/Agents/agent-f529d5c0-e84e-41e1-98e0-7bfd5d7c15cd/MEMORIA.md` (+ `historial.md`, 92) | 102 | 15-11 02:10 |
| Logos Legal | `~/OpenBot/Agents/agent-fef08234-4b8b-45e8-b68e-ae076fe85314/MEMORIA.md` (+ `historial.md`) | 139 | 15-11 02:09 |
| Logos Tester | `~/OpenBot/Agents/agent-a5391525-8407-4d63-9842-3057ebfa8c80/MEMORIA.md` | 135 | 15-11 02:10 |
| Crítico | `~/OpenBot/Agents/agent-4d19a6e9-eb2d-4aa8-8575-4964a73f926b/MEMORIA.md` | 33 | 15-11 02:12 |
| Consulta | `~/OpenBot/Agents/agent-778d7294-ba77-49de-adb9-895a9c1a3373/MEMORIA.md` (ya lo recogía) | 34 | 14-11 23:58 |
| Diseño | `~/OpenBot/Agents/agent-8c5b7678-0240-44dc-9cce-60202ffbeba4/MEMORIA.md` (sí tiene; su trabajo de Logos está en `~/OpenBot/Shared/logos/diseno/`) | 46 | 15-11 00:43 |
| Documentador | `~/OpenBot/Agents/agent-ab54f299-fe6d-40e3-aa85-2d9903c81dcc/MEMORIA.md` (sí tiene; copias de las memorias en el vault, `000 Yo/Sistema/Memoria-Agentes/`) | 31 | 15-11 02:29 |
| Jefe | `~/OpenBot/Agents/agent-2721012f-8436-465a-b9c6-00f513961b23/MEMORIA.md` (+ `historial.md`, 155; + traspaso, 169) | 39 | 15-11 02:51 |
