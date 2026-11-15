# Guion del vídeo de 30 s (v3)

Requisitos: ver `docs/normas.md` → «Vídeo de demo: decisiones del equipo». Voz con ElevenLabs (la genera el equipo) e imagen solo de la web TerraVista animada, sin metraje de archivo ni logos de NASA.
La v3 sustituye a la v2 (15-11): se rehace sobre el lema **«TerraVista — Down to Earth»** y la descripción oficial de la página del proyecto (ponderación por misión y avisos de zonas en conflicto o protegidas).

## Texto para ElevenLabs (en inglés, 62 palabras)

```
Everything we send to the Moon or Mars gets tested on Earth first. But… where?

TerraVista scans the whole planet with open NASA data, to find Earth's own Moon and Mars.

Testing a spacesuit? An ice drill? It weighs what matters for that mission,

shows exactly where every analogy breaks,

and flags the places you can't safely, or legally, go.

TerraVista. Down to Earth.
```

Unos 25 s de voz; con la entrada y el cierre, 27–28 s en total.

## Plano a plano

| Tiempo | Voz | Imagen (la web, animada) | Texto en pantalla | Criterio |
|---|---|---|---|---|
| 0:00–0:05 | *Everything we send… But where?* | Escena Luna → Tierra de la portada (Story), o el visor 3D de Shackleton que se funde en el globo. | — | Impact |
| 0:05–0:11 | *TerraVista scans the whole planet… Earth's own Moon and Mars.* | Globo: el mapa de puntuación se rellena y aparecen los candidatos; cambio Shackleton → Jezero → Arcadia. | `NASA MODIS · GPM · MERRA-2 · LRO · MOLA` | Relevance, Creativity |
| 0:11–0:16 | *Testing a spacesuit? An ice drill? It weighs what matters…* | Selector de tarea (EVA → perforación de permafrost); las barras de peso cambian y el ranking se reordena. | «Ice drill → mean temperature ×2» | Creativity, Impact |
| 0:16–0:20 | *shows exactly where every analogy breaks,* | Ficha del candidato: «Where the analogy breaks» y el visor 3D candidato frente a objetivo. | «Validated on 25 known analogs» | Validity |
| 0:20–0:24 | *and flags the places you can't safely, or legally, go.* | Un candidato con aviso ⚠ (zona en conflicto o protegida, p. ej. North Sentinel Island). | «⚠ Conflict zone · ⚠ Protected area» | Validity, Impact |
| 0:24–0:28 | *TerraVista. Down to Earth.* | Cierre: logotipo TerraVista, «Down to Earth», URL y «Team Logos · Space Apps 2026». | — | Presentation |

Durante todo el vídeo: subtítulos quemados, idénticos a la voz, y la marca de agua `AI-assisted editing · AI voice: ElevenLabs`.

## Bloqueos: la web todavía no enseña dos cosas que dice la voz
Comprobado en `origin/main` el 15-11:
1. **Ponderación por misión:** está calculada (`src/data/operations.json`: 11 tareas, por ejemplo `permafrost_drill` con `lst_mean` ×2), pero **ninguna pantalla la usa**. Hace falta un selector de tarea en la web para el plano 0:11–0:16.
2. **Avisos de conflicto y zonas protegidas:** **no existen** en el código. El #3 de Shackleton está en la provincia de Kapisa (Afganistán), que sería el ejemplo perfecto para el plano. Hay que construirlo o cambiar la frase.

Si no da tiempo, se usan estas frases (en vez de las líneas 3 y 5):
- *"It shows how close each site is, and exactly where every analogy breaks."*
- La línea de los avisos se quita y el «Validated on 25 known analogs» pasa a la voz.

## Por qué así
- **Impact:** el problema se dice en una frase. Se da un ejemplo concreto de uso (traje, taladro) y el aviso de seguridad o legalidad hace que la herramienta sea práctica.
- **Creativity:** *«Earth's own Moon and Mars»* y la ponderación según lo que se ensaya.
- **Validity:** dice dónde se rompe la analogía, añade la validación en pantalla y no da cifras que no podamos defender.
- **Relevance:** «open NASA data» en la voz y los productos en pantalla.
- **Presentation:** el lema cierra el vídeo, hay una idea por frase y todo cabe en 28 s.

## Ajustes en ElevenLabs
Voz natural y cálida. Stability ~45–55 %, Similarity ~75 % y Style bajo-medio. Los puntos suspensivos de «But… where?» y las comas de «safely, or legally,» marcan las pausas. Si pasa de 26 s, se quita «exactly» o «the». Dejar el audio en `video/audio/`.
