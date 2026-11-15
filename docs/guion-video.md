# Guion del vídeo de 30 s (v4)

Requisitos: ver `docs/normas.md` → «Vídeo de demo: decisiones del equipo». La voz es de ElevenLabs (la genera el equipo). La imagen es solo la web real del equipo, animada, sin metraje de archivo ni logos de NASA.

**La v4 (15-11, tarde) sustituye a la v3.** La web que se entrega es la del repo del equipo (`zexuguo/SpaceApp-Logos`, publicada en https://spaceapp-logos.vercel.app), no la de este repo. Todos los planos se graban de nuevo sobre esa web y ya no queda ningún tramo en negro. El vídeo se sigue publicando en `/demo-video/` de la web de este repo.

## Texto para ElevenLabs (en inglés)

```
Everything we send to the Moon or Mars gets tested on Earth first. But… where?

Terra Vista scans the whole planet with open NASA data, to find Earth's own Moon and Mars.

Testing a spacesuit? An ice drill? It weighs what matters for that mission,

shows exactly where every analogy breaks,

and flags where access needs permits, or extra care.

Terra Vista. Down to Earth.
```

Cambio respecto a la v3: la línea 5 decía *«and flags the places you can't safely, or legally, go»*. La web no la respalda. Su «Access complexity» es un indicador de coordinación (gobernanza WGI, violencia organizada UCDP, avisos de viaje de EE. UU. y Reino Unido y notas de permisos), dice expresamente que **no** es una evaluación de seguridad y no cartografía zonas protegidas. La frase nueva solo dice lo que la web enseña (criterio Validity).

La voz dura 29,5 s (habla hasta el s 29,05) y los tramos están en `docs/timestamps.txt`. El vídeo se corta a **29,5 s**.

## Plano a plano (capturas de `video/scripts/capture.cjs`)

| Tiempo | Voz | Imagen (web del equipo) | Criterio |
|---|---|---|---|
| 0–6 | *Everything we send… But where?* | **a**: plano de apertura de la portada (el Sol sale tras la cara nocturna de la Tierra y la cámara se aleja hasta el sistema solar). Se oculta la frase propia de la web y el «Scroll» porque caen justo donde van los subtítulos. | Impact |
| 6–11 | *Terra Vista scans the whole planet with open NASA data…* | **a**: scroll a «Rehearse the Moon and Mars on Earth» y luego a «Start from the mission, not the planet». | Relevance |
| 11–14 | *…Earth's own Moon and Mars. Testing a spacesuit?* | **a**: misión 1, «Suited EVA on volcanic terrain»; la cámara vuela a la Luna (Mons Mouton). | Creativity, Impact |
| 14–18 | *An ice drill? It weighs what matters for that mission,* | **a**: misión 3, «Water from ground ice»; la cámara vuela a Marte (Arcadia Planitia). | Creativity |
| 18–22 | *shows exactly where every analogy breaks,* | **b**: se abre la ficha de SP Crater (dial del índice, condiciones, terreno 3D) y luego la pestaña «Limits & sources»: «Where the analogy breaks». | Validity |
| 22–24,4 | *and flags where access needs permits,* | **c1**: Haughton crater, pestaña «How»: «Access complexity», con la licencia de investigación de Nunavut y su fuente. | Validity, Impact |
| 24,4–26 | *or extra care.* | **c2**: Islas de Nueva Siberia: acceso **High** (aviso de EE. UU. de nivel 4 de 4). | Validity |
| 26–29,5 | *Terra Vista. Down to Earth.* | Cierre: Terra Vista, «Down to Earth», «Team Logos · NASA Space Apps 2026». | Presentation |

Durante todo el vídeo: subtítulos quemados palabra a palabra, idénticos a la voz y sincronizados con ella, y la marca de agua `SI-assisted editing · SI voice: ElevenLabs`.

**Nombre:** la web del equipo se llama ahora «Terra Vista · Mission Analogs» en la cabecera (la publicada el 15-11 por la tarde). La voz y el cierre dicen Terra Vista (dos palabras, como la web). Decisión del equipo: enseñar la web tal cual.

## Cómo se rehace
- Todo: `video/scripts/make.sh` (~12 min, la escena 3D va a ~1,3 fps sin GPU). Solo montaje: `SKIP_CAPTURE=1 video/scripts/make.sh`. Un plano: `video/scripts/make.sh terravista-demo b`.
- Voz nueva: dejar `video/audio/voice.wav`, actualizar `docs/timestamps.txt` y lanzar `align.py` (Vosk) antes de `make.sh`.
- Publicar: `video/scripts/publish-demo.sh`, commit y push a `main` (se publica solo). Guía completa: `video/GUIA.md`.
- La captura usa la web pública con `?capture=1` (modo de grabación de la propia web). No toca el repo del equipo.

## Por qué así
- **Impact:** el problema se dice en una frase, con ejemplos concretos de uso (traje, taladro) y los permisos de acceso, que hacen práctica la herramienta.
- **Creativity:** *«Earth's own Moon and Mars»*, la cámara que vuela al mundo objetivo de cada misión y la puntuación por misión.
- **Validity:** dónde se rompe la analogía, con sus fuentes en pantalla, y ninguna promesa que la web no cumpla.
- **Relevance:** «open NASA data» en la voz; en pantalla, los mosaicos de NASA (Blue/Black Marble, LROC, MOLA) y los conjuntos de datos que se citan.
- **Presentation:** el lema cierra el vídeo, hay una idea por frase y todo cabe en 29,5 s.

## Ajustes en ElevenLabs
Voz natural y cálida. Stability ~45–55 %, Similarity ~75 % y Style bajo-medio. Los puntos suspensivos de «But… where?» marcan la pausa. Dejar el audio en `video/audio/voice.wav`.
