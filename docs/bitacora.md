# Bitácora

Entradas nuevas arriba.

## 2026-11-14 · 21:50 · Arranque del repo
- OK de zexu para empezar desde cero en `~/Logos`. Enfoque: análogos por misión + riesgo de acceso geopolítico (ver `origen-idea.md`).
- Del prototipo anterior (`~/spaceapp`, mismo equipo) se reutiliza solo: globo 3D (`Globe.tsx`, `globe-math.ts` con su test) y texturas de la Tierra, la Luna y Marte. El método de puntuación anterior NO (perdía la correlación y el parecido).
- Esqueleto Next.js 15 estático (`output: "export"`), sin base de datos. `npm test`, `tsc`, `npm run build` y `npm run lint` pasan.
- Encargado: Logos Datos (misiones reales, suelo por espectro, fuentes de geopolítica), Logos Legal (licencias y declaración de IA), Diseño (propuesta de front).
