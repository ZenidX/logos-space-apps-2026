// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Puntúa la Tierra contra los objetivos usando el asset precalculado de 05_export_features.js (0,1°).
// Rangos p1–p99 calculados aquí sobre el mismo asset. Exclusión de análogos conocidos con paint (barato).
// NDVI_FIX: el asset del 14-11 guardó el NDVI 10 000 veces pequeño (escala aplicada dos veces).
// Con este asset, NDVI_FIX = 10000. Si se reexporta con 05 ya corregido, poner NDVI_FIX = 1.
var NDVI_FIX = 10000;
var A0 = ee.Image('projects/terra-analog/assets/terra_features_01deg');
var A = A0.addBands(A0.select('ndvi').multiply(NDVI_FIX), null, true);
var world = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
var SCALE = 11132;
var land = A.select('lst_day').mask().gt(0);
var stats = A.updateMask(land).reduceRegion({reducer: ee.Reducer.percentile([1, 99]), geometry: world, scale: SCALE, bestEffort: true, maxPixels: 1e10});
function lo(k) { return ee.Number(stats.get(k + '_p1')); }
function hi(k) { return ee.Number(stats.get(k + '_p99')); }

var DIMS = {clima: ['lst_day', 'lst_night', 'lst_max', 'lst_min', 'precip'], superficie: ['ndvi', 'albedo'], relieve: ['slope']};
var T = {
  shackleton: {lst_day: -100, lst_night: -180, lst_max: -50, lst_min: -230, precip: 0, ndvi: 0, albedo: 0.15, slope: 8},
  jezero: {lst_day: -40, lst_night: -80, lst_max: 10, lst_min: -90, precip: 0, ndvi: 0, albedo: 0.2, slope: 3},
  arcadia: {lst_day: -60, lst_night: -100, lst_max: -10, lst_min: -120, precip: 0, ndvi: 0, albedo: 0.2, slope: 1}
};
var KNOWN = [
  ['Atacama', -24.1, -69.9], ['Haughton / Devon', 75.4, -89.7], ['Death Valley / Mojave', 36.5, -116.9],
  ['McMurdo Dry Valleys', -77.5, 161.8], ['Iceland', 64.9, -18.6], ['Hawaii · Mauna Kea / Mauna Loa (HI-SEAS)', 19.7, -155.5],
  ['MDRS Utah', 38.4, -110.8], ['Rio Tinto', 37.7, -6.6], ['Lanzarote', 29.0, -13.6], ['Svalbard (AMASE)', 79.4, 13.4],
  ['Pilbara', -21.2, 119.0], ['Meteor / SP Crater', 35.3, -111.3], ['Axel Heiberg', 79.4, -90.8],
  ['Qaidam', 37.5, 94.0], ['Danakil / Dallol', 14.2, 40.3], ['Namib', -24.0, 15.0], ['Ries', 48.9, 10.6],
  ['Arkaroola', -30.3, 139.3], ['Sudbury', 46.6, -81.2], ['Concordia (Dome C)', -75.1, 123.3], ['Lonar', 20.0, 76.5],
  ['Kamchatka', 54.0, 159.0], ['Bunge Land', 74.9, 140.0], ['Mojave Bristol', 34.5, -115.7], ['Wadi Rum', 29.6, 35.4]
];
var knownFC = ee.FeatureCollection(KNOWN.map(function (k) { return ee.Feature(ee.Geometry.Point([k[2], k[1]]), {name: k[0]}); }));
var excluded = ee.Image(0).paint(knownFC.map(function (f) { return f.buffer(300000, 5000); }), 1);

function sim(k, tv) {
  var span = hi(k).subtract(lo(k));
  var p = A.select(k).subtract(lo(k)).divide(span).clamp(0, 1);
  var tp = ee.Number(tv).subtract(lo(k)).divide(span).max(0).min(1);
  return ee.Image(1).subtract(p.subtract(tp).abs());
}
function scoreImage(t) {
  var bands = [], tSum = ee.Image(0), tCnt = ee.Image(0);
  Object.keys(DIMS).forEach(function (d) {
    var sum = ee.Image(0), cnt = ee.Image(0);
    DIMS[d].forEach(function (k) {
      var s = sim(k, t[k]);
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
function hav(a, b) {
  var R0 = 6371, toR = Math.PI / 180;
  var dLat = (b[1] - a[1]) * toR, dLon = (b[0] - a[0]) * toR;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R0 * Math.asin(Math.sqrt(h));
}

['shackleton', 'jezero', 'arcadia'].forEach(function (tid) {
  var s = scoreImage(T[tid]);
  if (tid === 'shackleton') Map.addLayer(s.select('total'), {min: 0.3, max: 0.9, palette: ['0d366b', '2a78d6', '86b6ef', 'ffffff']}, 'Similitud ' + tid);
  var dist = s.select('total').reduceRegion({reducer: ee.Reducer.percentile([50, 90, 99]), geometry: world, scale: SCALE, bestEffort: true, maxPixels: 1e10});
  var thr = ee.Number(dist.get('total_p99'));
  var cands = s.addBands(A).updateMask(excluded.not()).updateMask(s.select('total').gte(thr))
    .sample({region: world, scale: SCALE, geometries: true, tileScale: 4})
    .sort('total', false).limit(500);
  var known = s.select('total').reduceRegions({collection: knownFC, reducer: ee.Reducer.mean(), scale: SCALE});
  // toList + map conserva los nulos (aggregate_array los descarta y desemparejaría nombres y notas).
  var knownPairs = known.toList(100).map(function (f) { f = ee.Feature(f); return [f.get('name'), f.get('mean')]; });
  ee.Dictionary({cands: cands.toList(500), dist: dist, stats: stats, known: knownPairs}).evaluate(function (r, err) {
    if (err) { print('TERRA_ERR_' + tid, err); return; }
    var rd = function (v) { return v == null ? null : Math.round(v * 1000) / 1000; };
    var top = [];
    r.cands.forEach(function (f) {
      var c = f.geometry.coordinates;
      if (top.length < 20 && top.every(function (o) { return hav(o.c, c) >= 300; })) {
        var o = {c: [rd(c[0]), rd(c[1])]};
        Object.keys(f.properties).forEach(function (k) { o[k] = rd(f.properties[k]); });
        top.push(o);
      }
    });
    var known2 = r.known.map(function (k) { return {name: k[0], total: rd(k[1])}; });
    print('TERRA_GLOBAL_' + tid + '::' + JSON.stringify({top: top, dist: r.dist, ranges: r.stats, known: known2}));
  });
});
