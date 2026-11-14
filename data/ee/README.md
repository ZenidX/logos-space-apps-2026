# Copia de los datos de Google Earth Engine

Copia completa (14-11-2026) de lo que hay en el proyecto de Earth Engine **`terra-analog`**, para poder trabajar sin cuenta de Earth Engine (QGIS, Python/rasterio, GDAL…).

## Acceso público en Earth Engine
- **Assets (lectura pública):** `projects/terra-analog/assets/terra_features_01deg` (variables) y `projects/terra-analog/assets/terra_access_01deg` (accesibilidad y fracción urbana, script `08_export_access.js`). Cualquier persona con cuenta de Earth Engine puede usarlo con `ee.Image('projects/terra-analog/assets/terra_features_01deg')`.
- **Script de puntuación listo para abrir y ejecutar** (copia pública de solo lectura de `scripts/ee/06_puntuar_asset.js`): https://code.earthengine.google.com/f08f00b996446e8bc90653d3bec72b83
- Los demás scripts están en [`scripts/ee/`](../../scripts/ee/). Para usarlos, se copian en el [Code Editor](https://code.earthengine.google.com/) con un proyecto de Cloud propio registrado en Earth Engine.

## Formato común de todos los GeoTIFF
- Rejilla de **0,1° (≈11 km)**, de **85°N a 85°S**, 3600 × 1700 píxeles, `EPSG:4326`, transformación `[0.1, 0, -180, 0, -0.1, 85]`.
- Float32, una banda por archivo. Mar y sin dato = nodata (máscara).

## `terra_features_01deg/`: variables de la Tierra (= las bandas del asset)
Las genera `scripts/ee/05_export_features.js` (año 2024).

| Archivo | Variable | Unidad | Fuente |
|---|---|---|---|
| `lst_day.tif` | Temperatura de superficie diurna, media anual | °C | NASA MODIS MOD11A2 |
| `lst_night.tif` | Temperatura de superficie nocturna, media anual | °C | NASA MODIS MOD11A2 |
| `lst_max.tif` | Temperatura diurna máxima | °C | NASA MODIS MOD11A2 |
| `lst_min.tif` | Temperatura nocturna mínima | °C | NASA MODIS MOD11A2 |
| `precip.tif` | Precipitación | mm/año | NASA GPM IMERG V07 mensual |
| `ndvi.tif` | Vegetación (NDVI) | índice **×10⁻⁴** ⚠ | NASA MODIS MOD13C1 |
| `albedo.tif` | Albedo de onda corta (white-sky) | 0–1 | NASA MODIS MCD43C3 |
| `slope.tif` | Pendiente a 5 km | ° | USGS GMTED2010 |
| `elev.tif` | Altitud media | m | USGS GMTED2010 |

⚠ **NDVI:** el asset se exportó con un factor de escala aplicado dos veces, así que los valores son 10 000 veces más pequeños. **Hay que multiplicarlos por 10 000** para tener el NDVI real (de −0,2 a 1). `06_puntuar_asset.js` y la web ya lo corrigen.

## `access/`: accesibilidad (v2)

| Archivo | Contenido | Fuente |
|---|---|---|
| `access_hours.tif` | Tiempo de viaje a la ciudad más cercana (≥50 000 hab.), en horas, media de la celda | Oxford Malaria Atlas Project, Weiss et al. 2018 (*Nature*) |
| `access_score.tif` | Nota de accesibilidad, 0–1: `1 − ln(1+h)/ln(73)` | derivado |
| `urban_fraction.tif` | Fracción de suelo urbano de la celda (0–1) | NASA MODIS MCD12Q1 2023 |

## `scores/`: mapas de puntuación (0–1) con cada objetivo, v2
Calculados con la misma fórmula que `06_puntuar_asset.js`: posición relativa dentro del rango terrestre p1–p99, ver [docs/metodo.md](../../docs/metodo.md). Son los mapas completos, **sin** excluir los análogos conocidos.

| Archivo | Contenido |
|---|---|
| `{objetivo}_total.tif` | **v2:** media de Superficie, Relieve y Accesibilidad. El clima ya no puntúa |
| `{objetivo}_superficie.tif` | Superficie: NDVI y albedo |
| `{objetivo}_relieve.tif` | Relieve: pendiente |

`{objetivo}` puede ser `shackleton` (Luna, polo sur), `jezero` o `arcadia` (Marte). Los valores de los objetivos son aproximados: ver [`src/data/targets.ts`](../../src/data/targets.ts).

## Ejemplo (Python)
```python
import rasterio
with rasterio.open("data/ee/scores/shackleton_total.tif") as src:
    score = src.read(1, masked=True)
    print(score.max())  # mejor similitud con Shackleton en toda la Tierra
```

## Licencia de los datos
Los productos de NASA (MODIS, GPM) y de USGS (GMTED2010) son de dominio público. Si se usan, hay que citar las fuentes de la tabla.
