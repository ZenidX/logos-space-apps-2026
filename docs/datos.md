# Datos

Todas las capas terrestres se calculan en **Google Earth Engine** (proyecto `terra-analog`) a partir de productos de **NASA** (y uno de la ESA). Earth Engine no tiene datos de la Luna ni de Marte: esos vienen de NASA PDS y Trek.

Valores obtenidos el 14-11-2026. Las estadísticas globales se calculan sobre una cuadrícula de 50 km (`bestEffort`). Las muestras están a resolución nativa. Fuente: `src/data/ee-samples.json`.

## Capas terrestres

| id | Agencia | Dataset Earth Engine | Banda | Tipo crudo | Resolución | Conversión | Imágenes · fechas | Resumen usado |
|---|---|---|---|---|---|---|---|---|
| lst_day | NASA | `MODIS/061/MOD11A2` | LST_Day_1km | uint16 [0, 65535] | 927 m | ×0,02 − 273,15 → °C | 1228 · 2000-02-18 → 2026-10-31 | media 2024 |
| lst_night | NASA | `MODIS/061/MOD11A2` | LST_Night_1km | uint16 [0, 65535] | 927 m | ×0,02 − 273,15 → °C | 1228 · ídem | media 2024 |
| lst_max | NASA | `MODIS/061/MOD11A2` | LST_Day_1km | uint16 | 927 m | ídem | ídem | máximo 2024 |
| lst_min | NASA | `MODIS/061/MOD11A2` | LST_Night_1km | uint16 | 927 m | ídem | ídem | mínimo 2024 |
| ndvi | NASA | `MODIS/061/MOD13A2` | NDVI | int16 | 927 m | ×0,0001 | 614 · 2000-02-18 → 2026-10-16 | media 2024 |
| albedo | NASA | `MODIS/061/MCD43A3` | Albedo_WSA_shortwave | int16 | 463 m | ×0,001 | 9750 · 2000-02-24 → 2026-11-07 | media 2024 |
| snow | NASA | `MODIS/061/MOD10A1` | NDSI_Snow_Cover | uint8 [0, 255] | 463 m | % (0–100) | 9691 · 2000-02-24 → 2026-11-14 | media 2024 |
| precip | NASA | `NASA/GPM_L3/IMERG_MONTHLY_V07` | precipitation | float | 11,1 km | mm/h × 8760 → mm/año | 333 · 1998-01 → 2025-09 | media 2024 |
| emis | NASA | `NASA/ASTER_GED/AG100_003` | emissivity_band12 | int16 | 111 m | ×0,001 | 1 imagen (climatología 2000–2008) | — |
| elev | NASA | `NASA/NASADEM_HGT/001` | elevation | int16 | 31 m | m | 1 imagen · solo 56°S–60°N | — |
| slope | NASA | derivada de NASADEM | `ee.Terrain.slope` | — | 31 m | ° | — | — |
| cop_dem | ESA | `COPERNICUS/DEM/GLO30` | DEM | float | 31 m | m | 26 076 teselas · global | mosaico |

## Rango terrestre (global a 50 km)

| id | unidad | mín. | p1 | p50 | p99 | máx. |
|---|---|---|---|---|---|---|
| lst_day | °C | −60,8 | −57,2 | 3,3 | 39,2 | 47,5 |
| lst_night | °C | −62,2 | −58,8 | −3,7 | 24,7 | 32,0 |
| lst_max | °C | −35,9 | −32,3 | 26,8 | 52,8 | 62,2 |
| lst_min | °C | −81,3 | −75,2 | −29,8 | 21,2 | 27,6 |
| ndvi | índice | −0,17 | −0,05 | 0,32 | 0,80 | 0,87 |
| albedo | 0–1 | 0 | 0,014 | 0,27 | 0,85 | 0,87 |
| snow | % | 0 | 0,08 | 23,3 | 69,3 | 91 |
| precip | mm/año | 0 | 11 | 607 | 3808 | 10 956 |
| emis | 0–1 | 0,687 | 0,748 | 0,967 | 0,985 | 1,448* |
| elev | m | −87 | 3,6 | 303 | 4560 | 5938 |
| cop_dem | m | −148 | 2,6 | 368 | 3984 | 6385 |

\* Una emisividad mayor que 1 no es física: es un artefacto del producto ASTER GED. Conviene filtrarla (máscara de calidad) antes de usarla para puntuar.

## Muestras por sitio

| id | Atacama (Yungay) | Cráter Haughton | Death Valley | Valles Secos McMurdo | Amazonía (control) |
|---|---|---|---|---|---|
| lst_day °C | 40,3 | −18,3 | 37,0 | −25,3 | 28,7 |
| lst_night °C | 10,5 | −19,4 | 21,3 | −26,6 | 24,5 |
| lst_max °C | 52,2 | 12,0 | 59,0 | 1,7 | 31,8 |
| lst_min °C | 2,5 | −43,5 | 2,7 | −39,9 | 23,5 |
| ndvi | 0,10 | 0,00 | 0,19 | — | 0,80 |
| albedo | 0,28 | 0,56 | 0,23 | 0,26 | 0,14 |
| snow % | 0 | 39,8 | 0 | 31,8 | 0 |
| precip mm/año | 39 | 169 | 150 | 0 | 1615 |
| emis | 0,885 | 0,971 | 0,970 | — | 0,968 |
| elev m (NASADEM) | 960 | — (fuera de cobertura) | −56 | — | 22 |
| slope ° | 2,2 | — | 2,3 | — | 4,6 |
| cop_dem m | 960 | 134 | −58 | 813 | 27 |

Coordenadas: Atacama −24,08 / −69,93 · Haughton 75,38 / −89,67 · Death Valley 36,46 / −116,87 · McMurdo −77,5 / 161,8 · Amazonía −3,4 / −60,0.

## Equivalencias en la Luna y Marte

| Dimensión | Tierra | Luna | Marte |
|---|---|---|---|
| Temperatura | MODIS LST | LRO Diviner | MGS TES / Odyssey THEMIS / Perseverance MEDA |
| Superficie (albedo) | MODIS MCD43A3 | LROC WAC / Diviner | TES |
| Vegetación | MODIS NDVI | 0 | 0 |
| Hielo | MODIS nieve | LEND / Mini-RF / Diviner (cráteres en sombra) | SWIM / SHARAD |
| Geología (infrarrojo térmico) | ASTER GED | Diviner (pico de Christiansen) | TES / THEMIS |
| Relieve | NASADEM / Copernicus DEM | LOLA | MOLA / HRSC |

**La pieza con más coherencia es la geología en infrarrojo térmico.** ASTER, Diviner y TES miden lo mismo: la emisividad en el infrarrojo térmico, que depende de los minerales.

## Huecos conocidos
- NASADEM no cubre al norte de 60°N ni al sur de 56°S. Ahí se usa Copernicus DEM (ESA).
- La emisividad ASTER no cubre la Antártida (no hay muestra en McMurdo).
- Los datos de radar RADARSAT (CSA) no están en Earth Engine. Alternativa: Sentinel-1 (ESA).
- Los valores de la Luna y Marte en `src/data/targets.ts` son **aproximados**. Pendiente: sacarlos de los productos PDS reales.
