// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Recupera el NDVI real de los candidatos ya publicados en src/data/ee-global.json SIN reexportar el asset.
// Motivo: el asset del 14-11 guardó el NDVI 10 000 veces pequeño y, al redondear a 3 decimales, salió 0 en todos.
// Uso: pegar en el Code Editor con el proyecto terra-analog → Run → copiar la línea TERRA_NDVI::{...}
// a un archivo (p. ej. /tmp/ndvi.txt) → node scripts/ee/merge-ndvi.mjs /tmp/ndvi.txt
// Coordenadas = las de ee-global.json a 14-11-2026 ([objetivo, posición, lon, lat]).
var pts = [["shackleton", 0, -68.549, 82.55], ["shackleton", 1, 76.951, 36.15], ["shackleton", 2, 75.251, 38.65], ["shackleton", 3, 80.351, 42.25], ["shackleton", 4, -73.35, 79.75], ["shackleton", 5, -78.55, 72.35], ["shackleton", 6, 85.351, 43.65], ["shackleton", 7, 84.651, 36.85], ["shackleton", 8, -71.25, 70.35], ["shackleton", 9, -69.549, -33.151], ["shackleton", 10, 96.751, 39.45], ["shackleton", 11, -68.749, -28.051], ["shackleton", 12, -142.85, 61.95], ["shackleton", 13, -72.35, -47.651], ["shackleton", 14, -80.85, 77.25], ["shackleton", 15, 78.751, 33.85], ["shackleton", 16, 90.951, 48.65], ["shackleton", 17, 90.251, 28.95], ["shackleton", 18, 81.351, 36.05], ["jezero", 0, -78.15, 81.25], ["jezero", 1, 85.851, 37.25], ["jezero", 2, 79.251, 35.85], ["jezero", 3, 55.751, 74.45], ["jezero", 4, 80.951, 42.15], ["jezero", 5, 94.451, 43.05], ["jezero", 6, 75.151, 36.95], ["jezero", 7, 93.651, 46.65], ["jezero", 8, 76.051, 34.05], ["jezero", 9, 81.051, 32.85], ["jezero", 10, -70.649, 70.45], ["jezero", 11, 88.351, 43.75], ["jezero", 12, 138.951, 67.55], ["jezero", 13, 89.351, 38.25], ["jezero", 14, -68.949, -28.051], ["jezero", 15, -80.55, 72.05], ["jezero", 16, 98.551, 39.25], ["jezero", 17, -81.15, 77.25], ["jezero", 18, -111.05, 72.45], ["jezero", 19, -139.75, 61.25], ["arcadia", 0, -70.75, 81.75], ["arcadia", 1, 78.651, 35.25], ["arcadia", 2, 89.351, 36.35], ["arcadia", 3, -74.55, 78.65], ["arcadia", 4, -64.649, 61.45], ["arcadia", 5, -78.85, 75.85], ["arcadia", 6, -65.349, 64.75], ["arcadia", 7, -80.75, 72.25], ["arcadia", 8, 82.451, 35.25], ["arcadia", 9, 148.652, 76.65], ["arcadia", 10, 55.851, 74.45], ["arcadia", 11, 85.851, 37.15], ["arcadia", 12, 57.951, 81.25], ["arcadia", 13, 90.551, 81.25], ["arcadia", 14, -97.15, 73.05], ["arcadia", 15, -123.15, 74.45], ["arcadia", 16, 75.451, 38.65], ["arcadia", 17, 83.451, 30.95], ["arcadia", 18, -116.95, 70.15], ["arcadia", 19, -84.55, 65.75]];
var A = ee.Image('projects/terra-analog/assets/terra_features_01deg');
var nd = A.select('ndvi').multiply(10000).rename('ndvi');
var fc = ee.FeatureCollection(pts.map(function (p) {
  return ee.Feature(ee.Geometry.Point([p[2], p[3]]), {t: p[0], i: p[1]});
}));
var out = nd.reduceRegions({collection: fc, reducer: ee.Reducer.first(), scale: 11132});
out.toList(200).map(function (f) { f = ee.Feature(f); return [f.get('t'), f.get('i'), f.get('first')]; })
  .evaluate(function (rows, err) {
    if (err) { print('TERRA_ERR', err); return; }
    print('TERRA_NDVI::' + JSON.stringify(rows.map(function (r) {
      return [r[0], r[1], r[2] == null ? null : Math.round(r[2] * 1000) / 1000];
    })));
  });
