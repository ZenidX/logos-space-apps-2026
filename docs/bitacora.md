# Bitácora

Entradas nuevas arriba. Horas = hora del commit (CET). Corregido a las 21:50: las primeras entradas llevaban horas estimadas, no reales.

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
