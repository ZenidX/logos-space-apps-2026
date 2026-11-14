# Bitácora

Entradas nuevas arriba.

## 2026-11-14 · 22:15 · Créditos y declaración de IA (informe de Logos Legal)
- Informe: `/home/zexu/OpenBot/Shared/logos/legal/informe-reutilizacion.md`. Todo lo reutilizado se puede usar.
- README: texto «Use of AI» de Legal, créditos exactos de las texturas y librerías, «This project is not endorsed by NASA». Pie en la web.
- `AI_USAGE.md` + cabecera `AI-assisted (Claude), reviewed by team Logos` en los archivos de código.
- Si se reutiliza el visor de terreno: EOX s2cloudless solo la capa 2016 (CC BY 4.0; 2018+ es NC-SA) y bloque completo de atribución de AWS Terrain Tiles.
- Riesgo aceptado por ahora: `npm audit` da 1 alta en postcss dentro de next 15.5.29 (solo al compilar; web estática). Valorar next 16 si da tiempo.

## 2026-11-14 · 21:50 · Arranque del repo
- OK de zexu para empezar desde cero en `~/Logos`. Enfoque: análogos por misión + riesgo de acceso geopolítico (ver `origen-idea.md`).
- Del prototipo anterior (`~/spaceapp`, mismo equipo) se reutiliza solo: globo 3D (`Globe.tsx`, `globe-math.ts` con su test) y texturas de la Tierra, la Luna y Marte. El método de puntuación anterior NO (perdía la correlación y el parecido).
- Esqueleto Next.js 15 estático (`output: "export"`), sin base de datos. `npm test`, `tsc`, `npm run build` y `npm run lint` pasan.
- Encargado: Logos Datos (misiones reales, suelo por espectro, fuentes de geopolítica), Logos Legal (licencias y declaración de IA), Diseño (propuesta de front).
