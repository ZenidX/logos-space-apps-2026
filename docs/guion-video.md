# Guion del vídeo de 30 s (v2, desde cero)

Requisitos: ver `docs/normas.md` → «Vídeo de demo: decisiones del equipo». Voz con ElevenLabs (la genera el equipo) e imagen solo de la web TerraVista animada, sin metraje de archivo ni logos de NASA.

## Texto para ElevenLabs (en inglés, 61 palabras)

Pegar tal cual: los números van escritos con letras y la puntuación marca las pausas.

```
Before we live on the Moon or Mars, we rehearse here on Earth. But where?

TerraVista scores all the land on Earth against real Moon and Mars base sites, using NASA satellite data.

Tested on twenty-five known analogs, it finds new ones — from Arctic Canada to the high deserts of western China.

And for each one, it shows exactly where the analogy breaks.

TerraVista. Find the Moon on Earth.
```

A ~2,5 palabras/s salen unos 25 s de voz. Con 0,5 s de entrada y 1,5 s de cierre, el total queda en 27–28 s.

## Plano a plano

| Tiempo | Voz | Imagen (la web, animada) | Texto en pantalla | Criterio |
|---|---|---|---|---|
| 0:00–0:05 | *Before we live on the Moon or Mars, we rehearse here on Earth. But where?* | Visor 3D: relieve de Shackleton (LOLA/LRO WAC) que gira y se funde en el globo de la Tierra (GIBS Blue Marble). | — | Impact (el problema) |
| 0:05–0:11 | *TerraVista scores all the land on Earth against real Moon and Mars base sites, using NASA satellite data.* | Selector de objetivo Shackleton → Jezero → Arcadia; el mapa global de puntuación se rellena. | Chips: `MODIS · GPM IMERG · LRO · MOLA` y, 1,5 s: «Nowhere on Earth hits −230 °C — so we match extremes, not raw numbers.» | Relevance, Creativity |
| 0:11–0:18 | *Tested on twenty-five known analogs, it finds new ones — from Arctic Canada to the high deserts of western China.* | Panel de validación (los análogos conocidos sobre la mediana y en el top 10 %), y vuelo a los candidatos #1 de Nunavut y Sinkiang. | «Validated on 25 known analogs» | Validity |
| 0:18–0:23 | *And for each one, it shows exactly where the analogy breaks.* | Ficha del candidato: barras por dimensión, línea «Where the analogy breaks», visor 3D lado a lado (candidato frente a objetivo). | — | Validity, Creativity |
| 0:23–0:28 | *TerraVista. Find the Moon on Earth.* | Cierre: nombre TerraVista, URL de la web y «Team Logos · Space Apps 2026». Sin logos de NASA. | «For mission planners, agencies and universities» | Impact, Presentation |

Durante todo el vídeo:
- **Subtítulos** quemados abajo, idénticos a la voz.
- **Marca de agua** pequeña en una esquina: `AI-assisted editing · AI voice: ElevenLabs`.

## Por qué así
- **Impact:** la pregunta inicial plantea el problema y el cierre dice para quién es. «Open Spaces» no sale todavía porque no está en la web; si se construye, puede sustituir al texto de cierre.
- **Creativity:** la idea de comparar extremos y no cifras en bruto es lo más original del método, y sale en pantalla, no en la voz, para no pasarnos de tiempo.
- **Validity:** se dice que está validado y dónde falla. No hay cifras que no podamos defender (se quitan «hundreds of millions» y «80 %» de los guiones anteriores).
- **Relevance:** «NASA satellite data» en la voz y los nombres de los productos en pantalla.
- **Presentation:** una idea por frase, 61 palabras y todo dentro de 28 s.

## Ajustes en ElevenLabs
Una voz natural y cálida, no la de narrador de tráiler. Stability ~45–55 %, Similarity ~75 % y Style bajo. Si la voz pasa de 26 s, se acelera un poco o se quita «here». Exportar en MP3 o WAV de 44,1 kHz y dejarlo en `video/audio/`. Los tiempos de la imagen se ajustan al audio real.
