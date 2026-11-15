---
tags: [luna, hielo, isru, base]
---
# Hielo lunar: dónde está, cómo se formó y cuánto hay

Investigación del 15-11-2026 para que la página `/base/` simule el agua de la Luna con datos, no con suposiciones.
Cada dato lleva su fuente. Lo que usa el código está en `src/lib/base-plan.ts` (`sunlight()` y la regla de recursos).

## 1. Dónde
- **Solo en trampas frías polares**: suelo que nunca recibe la luz del Sol, posible porque el eje de la Luna solo está
  inclinado ~1,5°. La mayoría está a **más de 80° de latitud**; las sombras más cerca del ecuador están demasiado
  calientes para guardar hielo. Área total ~**40 000 km²**, el 60 % en el sur.
  [Hayne, Aharonson y Schörghofer 2021, *Nature Astronomy* 5, 169–175](https://ui.adsabs.harvard.edu/abs/2021NatAs...5..169H)
- **Micro trampas frías**: sombras de 1 km a 1 cm; suman el **10–20 %** del área de trampa fría. Nuestra malla
  (5–118 m por píxel) no las ve. (Misma fuente.)
- **Umbral de temperatura ~110 K (−163 °C)**: por debajo, el hielo dura más que la edad del sistema solar. Es muy
  sensible: a 109 K se sublima ~100 kg/m² por cada mil millones de años; a 114 K, ~1000 kg/m².
  [Schörghofer 2025, revisión (arXiv 2502.06056)](https://arxiv.org/pdf/2502.06056v1) · Hayne et al. 2021.
- **Temperaturas medidas** (LRO Diviner): mínimas diurnas por debajo de **−238 °C** en partes de los cráteres; máximas
  diarias de **40–90 K** en lo más frío de los grandes cráteres en sombra. Alrededor de las trampas frías de superficie hay
  zonas mucho más amplias de **«permafrost lunar»**: reciben sol a veces, pero **el hielo enterrado a poca profundidad es
  estable**. [Paige et al. 2010, *Science* 330, 479–482](https://www.usgs.gov/publications/diviner-lunar-radiometer-observations-cold-traps-moons-south-polar-region)

## 2. Cuánto y cómo es
- **LCROSS (Cabeus, 2009)**: **5,6 ± 2,9 % de agua en masa** en el regolito excavado (máximo de 155 ± 12 kg de agua en
  el campo de visión); más de lo esperado. Es una estimación con modelo, no una medida directa.
  [Colaprete et al. 2010, *Science* 330, 463–468](https://experts.arizona.edu/en/publications/detection-of-water-in-the-lcross-ejecta-plume/) ·
  [AAAS](https://www.aaas.org/news/science-lcross-impact-ejects-minerals-and-frozen-water-crater-moon)
- **Hielo expuesto en superficie (M³, 2018)**: miles de píxeles de ~280 m dentro de 20° de los polos, en sombras de
  cráteres; **irregular y escaso**. [Li et al. 2018, *PNAS*](https://manoa.hawaii.edu/news/article.php?aId=9457)
- **No son placas de hielo**: es hielo mezclado con el polvo y las piedras del suelo (regolito), de manera irregular.
- **Shackleton**: el fondo es algo más brillante; si es hielo, **como mucho ~22 %** en la primera micra. Otra
  explicación posible: suelo nuevo que cae de las paredes. [Zuber et al. 2012, *Nature*](https://www.astronomy.com/science/researchers-estimate-ice-content-of-crater-at-moons-south-pole/)

## 3. De dónde vino
- **Cometas**: el material de Cabeus no es volcánico y probablemente llegó con un cometa hace menos de mil millones de años.
  [Universe Today](https://www.universetoday.com/154544/one-crater-on-the-moon-is-filled-with-ice-and-gas-that-came-from%20-a-comet-impact/)
- **Viento solar**: el hidrógeno del Sol se combina con el oxígeno del regolito (muestras Apolo con poco deuterio).
  [Physics World](https://physicsworld.com/a/solar-wind-most-likely-source-of-water-on-the-moon/)
- **Sin resolver**: probablemente hay de los dos; hace falta medir la proporción deuterio/hidrógeno sobre el terreno.

## 4. Cómo se extraería
- Excavar el regolito helado en la sombra, **calentarlo para que el hielo se sublime** y recoger y volver a congelar el
  vapor. El cuello de botella es la **conductividad térmica del regolito (~0,01 W/m·K)**; removerlo ayuda.
  [NASA LuSTR, UTEP](https://www.nasa.gov/directorates/stmd/space-tech-research-grants/advanced-thermal-mining-approach-for-extraction-transportation-and-condensation-of-lunar-ice/) ·
  [NASA NTRS 20230008775](https://ntrs.nasa.gov/citations/20230008775)
- No hay todavía ninguna demostración en vuelo; las pruebas son de laboratorio (hasta 13 kg de material helado por ensayo).

## 5. Qué hace la simulación con esto (`/base/`)
1. **Luz**: horizonte real de cada punto y recorrido del Sol en el día y el año → fracción de tiempo con sol y energía que llega.
2. **Temperatura** (equilibrio radiativo, albedo 0,12, emisividad 0,95, Sol 1361 W/m²):
   - máxima, con el sol más fuerte que recibe cada punto;
   - media, con la energía media (es una cota superior de la temperatura del subsuelo);
   - en sombra permanente, calor del interior (~0,02 W/m²) más el reflejo y el calor de las paredes iluminadas cercanas.
     Ese último término está **calibrado** para que los grandes cráteres den 40–90 K, como Diviner.
3. **Clases de hielo**:
   - **trampa fría en superficie**: máxima < 110 K;
   - **hielo enterrado posible**: media < 110 K;
   - **ninguno**.
4. **Extracción**: la excavadora trabaja en la trampa fría más cercana; el rover lleva el regolito helado a la planta del
   borde iluminado, donde se calienta. Con el 5,6 % de LCROSS, 1 t de regolito da ~56 kg de agua (entre 27 y 85 kg con el margen).
5. **Límites**: no ve las micro trampas frías ni los montes de fuera de la zona de 11 km; la temperatura es un modelo
   sencillo, no un modelo térmico con capas.
