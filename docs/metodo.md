# Método de análisis

## Idea
La Luna y Marte son más extremos que cualquier lugar de la Tierra (−230 °C en los cráteres lunares en sombra). Por eso **no comparamos valores absolutos sino posiciones relativas** dentro del rango que cubre la Tierra.

## 1. Rango terrestre por variable
Para cada capa se usa el rango robusto **[p1, p99]** de la distribución global, calculado en Earth Engine a 50 km. La pendiente no tiene un rango global útil a esa escala, así que usa un rango fijo de 0–30°.

## 2. Posición relativa
`pos(x) = clamp((x − p1) / (p99 − p1), 0, 1)`

Si el objetivo cae fuera de [p1, p99], se lleva al extremo terrestre. Solo se marca como **«fuera de rango»** si supera los **extremos reales** de la Tierra (mín./máx. global). Eso es justo **dónde se rompe la analogía**, algo que el reto pide explicar.

> Corrección (14-11): al principio se marcaba «fuera de rango» respecto a p1/p99. Eso hacía que la precipitación 0 de la Luna apareciera como «más extrema que la Tierra», cuando en la Tierra hay sitios con 0 mm (McMurdo).

## 3. Similitud por variable
`sim = 1 − |pos(sitio) − pos(objetivo)|`, de 0 a 1.

## 4. Puntuación por dimensión
Media de las similitudes de las variables de cada dimensión que tienen dato en el sitio **y** en el objetivo:

| Dimensión | Variables |
|---|---|
| Clima | lst_day, lst_night, lst_max, lst_min, precip |
| Superficie | ndvi, albedo |
| Relieve | slope (elev y cop_dem no se comparan: distinto datum) |
| Geología | emis (sin dato de objetivo todavía) |
| Hielo y agua | snow (sin dato de objetivo todavía) |

Total = media de las dimensiones con dato. Los pesos ajustables quedan pendientes.

## 5. Poder de discriminación de cada variable
`disc = |media(análogos conocidos) − control| / (p99 − p1)`

Indica qué variables separan mejor un análogo conocido (Atacama, Haughton, Death Valley, McMurdo) de un lugar cualquiera (Amazonía). Sirve para decidir pesos y para el pitch.

## 6. Validación y descubrimiento (siguiente paso)
1. **Validar:** los análogos conocidos deben puntuar por encima del control y de puntos aleatorios.
2. **Descubrir:** aplicar la puntuación a una cuadrícula global en Earth Engine, quitar los análogos ya catalogados y mostrar los mejores candidatos que quedan.

## Limitaciones
- Los valores de los objetivos son aproximados (ver `src/data/targets.ts`).
- Solo 5 sitios de muestra: es un MVP, no un ranking global todavía.
- La Tierra no reproduce la gravedad reducida, el vacío lunar, la atmósfera marciana ni la radiación.
