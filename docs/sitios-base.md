---
tags: [base, luna, marte, sitios, isru]
---
# Los mejores sitios para una base en la Luna y en Marte

Búsqueda del 15-11-2026, a petición de zexu: sitios con más facilidades **para todos los aspectos de una base**, y en
Marte, además, el mejor para **agua + oxígeno**. Resultado en `src/data/base-sites.json`. Se repite con `npm run sites:base` (~25 s).
En `/base/` salen con ★ en la lista de sitios y en el globo, y se pueden elegir.

## Método
Cada punto es una zona de 11 × 11 km de relieve real (96 × 96) que pasa por el mismo modelo que la página
(`src/lib/base-plan.ts`): luz y temperatura del relieve, hielo, pendientes, pista y ruta del rover. Cada aspecto recibe una
nota de 0 a 1, y el total es una **media geométrica ponderada** (si un aspecto vale 0, el sitio no sirve).

| Aspecto | Luna | Marte |
|---|---|---|
| Agua | Trampa fría (< 110 K) en la zona; menos nota cuanto más lejos (2–8 km). Solo hielo enterrado: 0,45 | Evidencia publicada de la región (abajo) |
| Oxígeno | (del regolito o del agua: no limita) | Presión del aire por la altitud: 450 Pa → 0, 1000 Pa → 1 (más CO₂ para MOXIE) |
| Energía | Mejor punto solar: 30 % → 0, 75 % → 1 | Latitud: más cerca del ecuador, más sol |
| Tripulación | Sol en el hábitat (luz y calor) | — |
| Terreno edificable | % < 10°: 15 % → 0, 70 % → 1 | igual |
| Aterrizaje | Pendiente de la pista: 2° → 1, 10° → 0 | igual |
| Travesías | Ruta del rover por debajo de 20° | igual |

Pesos: Luna `agua 1,2 · energía 1,2 · tripulación 0,6 · terreno 1 · aterrizaje 0,8 · travesías 0,6`; Marte `agua 1,2 · oxígeno 1 ·
energía 0,8 · terreno 1 · aterrizaje 0,8 · travesías 0,5`. Son elección nuestra.

## Dónde se busca
- **Luna**: todo el polo sur de 84° a 89,5°S, puntos cada ~40 km (105 puntos). LOLA a 30 m (o a 5 m por encima de 87,5°).
  El hielo solo existe en trampas frías polares (ver `docs/hielo-lunar.md`).
- **Marte**: regiones con hielo publicado (82 puntos). MOLA + HRSC (~200 m).
  - **Arcadia Planitia**: donde nació SWIM; hielo a menos de 1 m en algunas zonas.
    [NASA/JPL 2023](https://www.jpl.nasa.gov/images/pia26045-swim-map-shows-subsurface-water-ice-on-mars/) · [USGS, *Ice resource mapping on Mars*](https://pubs.usgs.gov/publication/70257663)
  - **Utopia Planitia occidental** (39–49°N): capa de hielo de 80–170 m de grosor bajo 1–10 m de suelo, hasta 14 300 km³.
    [Stuurman et al. 2016](https://www.jsg.utexas.edu/news/?p=9538)
  - **Deuteronilus Mensae** (~43°N 26°E): glaciares cubiertos de roca, hielo casi puro según el radar.
    [Plaut et al. 2009](https://experts.arizona.edu/en/publications/radar-evidence-for-ice-in-lobate-debris-aprons-in-the-mid-norther/)
  - **Este de Hellas**: glaciares enterrados de 250–450 m de grosor. [Holt et al. 2008](https://www.jsg.utexas.edu/news/2008/11/imagery-video-for-mars-glaciers-science-paper-by-holt-et-al-nov-21-2008/)
  - No incluidos: los escarpes de hielo de [Dundas et al. 2018](https://www.usgs.gov/publications/exposed-subsurface-ice-sheets-martian-mid-latitudes)
    (hielo a 1–2 m, 55–58°), porque no hemos confirmado sus coordenadas.
- **Oxígeno en Marte**: MOXIE (Perseverance) sacó O₂ del CO₂ del aire, con un máximo de 12 g/h y una pureza de más del 98 %
  (122 g en total). [NASA vía Digital Trends](https://digitaltrends.com/space/perseverance-moxie-end) · Con agua, además,
  por electrólisis: 1 kg de agua → 0,89 kg de O₂.

## Resultado (15-11)
- **Luna**, el mejor: **88°S 180°E** (0,84). Sol en el hábitat el 51 % del tiempo, mejor punto solar al 60 %, trampa fría a
  0,93 km (3,2 % de la zona con hielo en superficie, la más fría a 50 K), 63 % edificable, pista a 0,7°.
  Le siguen 87°S 128,6°E · 87°S 25,7°W · 86°S 47,4°W (85 % edificable) · 86°S 142,1°W.
- **Marte**, el mejor en conjunto: **Arcadia Planitia 38°N 170°W** (0,86): hielo somero, aire a 873 Pa (−4,0 km), llano.
  El mejor para **agua + oxígeno**: **Arcadia Planitia 46°N 170°W** (0,88; 877 Pa).
  También: Utopia occidental 40°N 100°E (el aire más denso, 939 Pa a −4,8 km, pero hielo más hondo) y Deuteronilus Mensae.

## Límites
- Las notas por región de Marte son de la región entera, no de cada punto (SWIM es un mapa de probabilidad).
- Malla de 96 × 96: no ve rocas, cráteres pequeños ni micro trampas frías; el horizonte lunar solo cubre la zona de 11 km.
- Los pesos y los umbrales son nuestros. Cambiándolos en el script, el orden puede cambiar.
