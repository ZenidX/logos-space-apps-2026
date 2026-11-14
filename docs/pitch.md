# Pitch y entrega

Borrador basado en los resultados reales de `src/data/ee-global.json` (14-11-2026). Si se vuelve a ejecutar la búsqueda, hay que revisar las cifras marcadas con ⚠.

La entrega global va **en inglés**. El pitch local de 3 minutos puede hacerse en el idioma que acepte el evento de Barcelona: hay que confirmarlo con la organización local.

---

## 1. Pitch local de 3 minutos (guion en inglés, ~420 palabras)

**[0:00–0:20] Hook**
> In 2022, to rehearse a Moon landing at the lunar south pole, NASA took astronauts to a volcanic field in Arizona — and had to fake the Sun with a lighting cart at night, because the light there is nothing like the Moon. Finding the right place on Earth to practise for the Moon and Mars is still mostly guesswork.

**[0:20–0:50] Problem**
> Today's analog sites — Atacama, Iceland, Antarctica — were chosen one by one, by experience. Nobody has searched the *whole* planet systematically, and nobody tells you *where* an analog stops being useful. The challenge asks exactly that: find new analogs, and explain what is similar, how similar, and where the analogy breaks.

**[0:50–1:50] Solution + demo** *(live demo of the app on a phone)*
> This is **Terra Analog**. We took NASA Earth observation data — MODIS land temperature, vegetation and albedo, GPM rainfall, and terrain — and scored every 11-kilometre cell of land on Earth against three real targets: the Shackleton crater rim at the lunar south pole, Jezero crater on Mars, and Arcadia Planitia, a candidate Mars landing site with buried ice.
>
> The Moon reaches −230 °C — no place on Earth does. So instead of comparing raw numbers, we ask: *where does the target sit within Earth's range?* and find the places that sit at the same extreme.
>
> First, we checked it works: for Shackleton, the polar analogs NASA and ESA already use — Svalbard, the McMurdo Dry Valleys, Axel Heiberg, Concordia — land in the top 10 % of the planet. Desert analogs like Atacama don't — and that's correct: they are Mars analogs, not Moon analogs.
>
> Then we removed the 25 analogs that are already catalogued and asked what is left. Our top new candidates: **northern Ellesmere Island in the Canadian high Arctic**, and the **high cold deserts of the Karakoram–Kunlun plateau** in western China. ⚠
>
> For each one, the app tells you why — for example, *"matches Shackleton on vegetation, terrain and dryness, but its summers are far too warm"* — and links straight to NASA Worldview imagery.

**[1:50–2:30] Impact**
> Mission planners, space agencies and universities can use this to choose where to test rovers, drills and astronaut procedures — and, just as important, to know what each site *cannot* test. Every analog field campaign costs a lot of money; picking the wrong place wastes it.

**[2:30–3:00] Next steps + close**
> Next: add geology — ASTER, Diviner and TES all measure thermal-infrared emissivity, so we can compare actual rock composition across three worlds — plus ice and lunar lighting geometry. We didn't find a new planet. We found new places on our own planet that can take us to the next ones.

### Notas para el equipo
- **Demo en el móvil:** pestaña Candidatos → Shackleton → bajar a la validación → candidato #1 → «Ver en NASA Worldview». Tened **un vídeo grabado de respaldo**.
- Si habláis varios, cambiad de persona solo en los cortes de 0:50 y 1:50.
- Ensayad con cronómetro: el guion está pensado para 3 minutos hablando a un ritmo tranquilo.

---

## 2. Vídeo de demo (30 s como máximo, inglés o subtítulos en inglés)

| Tiempo | Imagen | Voz / texto |
|---|---|---|
| 0:00–0:03 | Logo del equipo | "We're team Logos, from Barcelona." |
| 0:03–0:08 | Foto de la Luna → mapa de la Tierra | "Where on Earth can we rehearse for the Moon and Mars?" |
| 0:08–0:12 | Título | "Terra Analog — finding the Moon and Mars on Earth." |
| 0:12–0:22 | Grabación de pantalla: mapa → validación → candidato #1 | "We scored all land on Earth with NASA MODIS and GPM data against real Moon and Mars sites, validated with known analogs, and found new ones in the Canadian Arctic and the Karakoram." |
| 0:22–0:30 | Tarjeta «where the analogy breaks» | "And we show where each analog stops working — so missions test in the right place." |

**El límite de 30 s es estricto:** si se pasa, el proyecto queda fuera de la fase global.

---

## 3. Campos de la página del proyecto (inglés)

**Project name:** Terra Analog

**High-level summary (borrador):**
Terra Analog systematically searches the whole Earth for new terrestrial analogs of future Moon and Mars base sites. Using NASA MODIS, GPM IMERG and terrain data in Google Earth Engine, it scores every ~11 km land cell against three real targets (Shackleton rim, Jezero crater, Arcadia Planitia) by comparing *relative positions within Earth's range*, since the Moon and Mars are more extreme than anywhere on Earth. It validates the method against 25 known analogs, excludes them, and ranks new candidates, explaining for each one what is analogous, how much, and where the analogy breaks.

**NASA Data:** MODIS MOD11A2 (land surface temperature), MOD13A2 / MOD13C1 (NDVI), MCD43A3 / MCD43C3 (albedo), MOD10A1 (snow), GPM IMERG monthly V07 (precipitation), ASTER GED (emissivity), NASADEM (elevation), NASA GIBS / Worldview (imagery), Moon Trek LRO WAC and Mars Trek MGS MOLA (basemaps). Moon/Mars reference values from LRO Diviner and LOLA, MGS TES and MOLA, and Perseverance MEDA.

**Space Agency Partner Data and Other References:** ESA Copernicus DEM GLO-30; USGS GMTED2010; Google Earth Engine (data access and processing); OpenStreetMap Nominatim (place names); Next.js, React, Tailwind CSS, Leaflet.

**Use of SI:** pendiente de redactar con honestidad por el equipo. Hay que indicar que se usó un asistente de IA (Claude Code) para programar, procesar datos y redactar la documentación, y que la idea y el planteamiento son del equipo. Las normas prohíben usar IA para tener la idea.

---

## 4. Riesgos a decir en voz alta si preguntan
- Los valores de la Luna y Marte de los objetivos son **aproximados** (de la literatura); todavía no salen de los productos PDS.
- La resolución es de unos 11 km: un cráter o una cueva concreta necesitan un análisis más fino.
- La validación es parcial: los análogos conocidos quedan por encima de la mediana, pero no todos entran en el top 10 %.
- La Tierra no reproduce la gravedad, el vacío ni la radiación.
