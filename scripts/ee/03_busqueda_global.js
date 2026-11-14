// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Búsqueda global de análogos: cuadrícula de tierra firme a 50 km, puntuación por dimensión
// (posición relativa en el rango terrestre p1–p99, ver docs/metodo.md) contra 3 objetivos.
// Excluye análogos ya catalogados (buffer 300 km) y valida dónde caen los conocidos.
var Y0 = '2024-01-01', Y1 = '2025-01-01';
var world = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
function col(id, b, agg) { var c = ee.ImageCollection(id).select(b).filterDate(Y0, Y1); return agg === 'max' ? c.max() : agg === 'min' ? c.min() : c.mean(); }

// --- Variables (mismas conversiones que 01/02) ---
// OJO: un mosaico global de COPERNICUS/DEM/GLO30 (26 076 teselas) da "Object too large (129 MB)".
// Para la pendiente global se usa GMTED2010 (USGS), imagen única con cobertura global incl. polos.
var gmted = ee.Image('USGS/GMTED2010_FULL').select('mea');
var F = {
  lst_day: col('MODIS/061/MOD11A2', 'LST_Day_1km', 'mean').multiply(0.02).subtract(273.15),
  lst_night: col('MODIS/061/MOD11A2', 'LST_Night_1km', 'mean').multiply(0.02).subtract(273.15),
  lst_max: col('MODIS/061/MOD11A2', 'LST_Day_1km', 'max').multiply(0.02).subtract(273.15),
  lst_min: col('MODIS/061/MOD11A2', 'LST_Night_1km', 'min').multiply(0.02).subtract(273.15),
  precip: col('NASA/GPM_L3/IMERG_MONTHLY_V07', 'precipitation', 'mean').multiply(8760),
  ndvi: col('MODIS/061/MOD13A2', 'NDVI', 'mean').multiply(0.0001),
  albedo: col('MODIS/061/MCD43A3', 'Albedo_WSA_shortwave', 'mean').multiply(0.001),
  // Pendiente a 5 km (GMTED2010)
  slope: ee.Terrain.slope(gmted.reproject('EPSG:4326', null, 5000))
};
// Rango terrestre robusto p1–p99 (de 01_inventario_capas.js); pendiente a 5 km: rango fijo.
var R = {
  lst_day: [-57.245, 39.237], lst_night: [-58.769, 24.728], lst_max: [-32.254, 52.757], lst_min: [-75.205, 21.241],
  precip: [11.07, 3808.028], ndvi: [-0.05, 0.801], albedo: [0.014, 0.845], slope: [0, 20]
};
var DIMS = {clima: ['lst_day', 'lst_night', 'lst_max', 'lst_min', 'precip'], superficie: ['ndvi', 'albedo'], relieve: ['slope']};

// Objetivos (valores aproximados, ver src/data/targets.ts)
var T = {
  shackleton: {lst_day: -100, lst_night: -180, lst_max: -50, lst_min: -230, precip: 0, ndvi: 0, albedo: 0.15, slope: 8},
  jezero: {lst_day: -40, lst_night: -80, lst_max: 10, lst_min: -90, precip: 0, ndvi: 0, albedo: 0.2, slope: 3},
  arcadia: {lst_day: -60, lst_night: -100, lst_max: -10, lst_min: -120, precip: 0, ndvi: 0, albedo: 0.2, slope: 1}
};

// Análogos ya catalogados (NASA / ESA PANGAEA / IMEWG / literatura) → se excluyen 300 km
var KNOWN = [
  ['Atacama', -24.1, -69.9], ['Haughton / Devon', 75.4, -89.7], ['Death Valley / Mojave', 36.5, -116.9],
  ['Valles Secos McMurdo', -77.5, 161.8], ['Islandia', 64.9, -18.6], ['Mauna Kea / HI-SEAS', 19.7, -155.5],
  ['MDRS Utah', 38.4, -110.8], ['Río Tinto', 37.7, -6.6], ['Lanzarote', 29.0, -13.6], ['Svalbard (AMASE)', 79.4, 13.4],
  ['Pilbara', -21.2, 119.0], ['Meteor / SP Crater', 35.3, -111.3], ['Axel Heiberg', 79.4, -90.8],
  ['Qaidam', 37.5, 94.0], ['Danakil / Dallol', 14.2, 40.3], ['Namib', -24.0, 15.0], ['Ries', 48.9, 10.6],
  ['Arkaroola', -30.3, 139.3], ['Sudbury', 46.6, -81.2], ['Concordia (Dome C)', -75.1, 123.3], ['Lonar', 20.0, 76.5],
  ['Mars Analog Kamchatka', 54.0, 159.0], ['Tierra de Bunge (Novosibirsk)', 74.9, 140.0], ['Mojave Bristol', 34.5, -115.7],
  ['Wadi Rum', 29.6, 35.4]
];
var knownFC = ee.FeatureCollection(KNOWN.map(function (k) { return ee.Feature(ee.Geometry.Point([k[2], k[1]]), {name: k[0]}); }));
var exclusion = ee.Image(1).clip(knownFC.map(function (f) { return f.buffer(300000); }).union()).unmask(0);

var land = F.lst_day.unmask(-999).neq(-999);
function tpos(v, k) { return Math.min(1, Math.max(0, (v - R[k][0]) / (R[k][1] - R[k][0]))); }
function pos(k) { return F[k].subtract(R[k][0]).divide(R[k][1] - R[k][0]).clamp(0, 1); }

function scoreImage(t) {
  var bands = [], tSum = ee.Image(0), tCnt = ee.Image(0);
  Object.keys(DIMS).forEach(function (d) {
    var sum = ee.Image(0), cnt = ee.Image(0);
    DIMS[d].forEach(function (k) {
      var s = ee.Image(1).subtract(pos(k).subtract(tpos(t[k], k)).abs());
      sum = sum.add(s.unmask(0));
      cnt = cnt.add(s.unmask(-1).neq(-1));
    });
    var dimImg = sum.divide(cnt.max(1)).updateMask(cnt.gt(0));
    bands.push(dimImg.rename(d));
    tSum = tSum.add(dimImg.unmask(0));
    tCnt = tCnt.add(cnt.gt(0));
  });
  var total = tSum.divide(tCnt.max(1)).updateMask(tCnt.gt(0)).rename('total');
  return ee.Image.cat([total].concat(bands)).updateMask(land);
}

var featImg = ee.Image.cat(Object.keys(F).map(function (k) { return F[k].rename(k); }));

// Solo se muestrean las celdas por encima del p99 de la puntuación (≈1 %) para no ordenar todo el planeta.
function run(tid) {
  var s = scoreImage(T[tid]);
  var dist = s.select('total').reduceRegion({reducer: ee.Reducer.percentile([50, 90, 99]), geometry: world, scale: 50000, bestEffort: true, maxPixels: 1e9});
  var thr = ee.Number(dist.get('total_p99'));
  var img = s.addBands(featImg).updateMask(exclusion.not()).updateMask(s.select('total').gte(thr));
  var cands = img.sample({region: world, scale: 50000, geometries: true, dropNulls: false, tileScale: 8})
    .filter(ee.Filter.notNull(['total'])).sort('total', false).limit(300);
  var known = s.select('total').reduceRegions({collection: knownFC, reducer: ee.Reducer.mean(), scale: 5000});
  return ee.Dictionary({candidates: cands, dist: dist, known: known.aggregate_array('mean'), knownNames: known.aggregate_array('name')});
}

// Selección codiciosa: los mejores separados al menos 300 km entre sí
function hav(a, b) {
  var R0 = 6371, toR = Math.PI / 180;
  var dLat = (b[1] - a[1]) * toR, dLon = (b[0] - a[0]) * toR;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R0 * Math.asin(Math.sqrt(h));
}
function pick(features, n, minKm) {
  var out = [];
  features.forEach(function (f) {
    var c = f.geometry.coordinates;
    if (out.length < n && out.every(function (o) { return hav(o.c, c) >= minKm; })) {
      var p = f.properties, r = function (v) { return v == null ? null : Math.round(v * 1000) / 1000; };
      var o = {c: [r(c[0]), r(c[1])]};
      Object.keys(p).forEach(function (k) { o[k] = r(p[k]); });
      out.push(o);
    }
  });
  return out;
}

// Un evaluate por objetivo (juntos superan el límite de tamaño).
['shackleton', 'jezero', 'arcadia'].forEach(function (tid) {
  run(tid).evaluate(function (r, err) {
    if (err) { print('TERRA_ERR_' + tid, err); return; }
    var out = {
      top: pick(r.candidates.features, 20, 300),
      dist: r.dist,
      known: r.knownNames.map(function (n, i) { return {name: n, total: r.known[i] == null ? null : Math.round(r.known[i] * 1000) / 1000}; })
    };
    print('TERRA_GLOBAL_' + tid + '::' + JSON.stringify(out));
  });
});
