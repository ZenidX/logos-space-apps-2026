// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Búsqueda global con productos MODIS CMG (0,05° ≈ 5 km), mucho más ligeros que los de 1 km.
// Los rangos terrestres p1–p99 se calculan en la misma ejecución, con los mismos datos.
// Uso: cambiar TID ('shackleton' | 'jezero' | 'arcadia') y ejecutar (una ejecución por objetivo).
var TID = 'shackleton';
var Y0 = '2024-01-01', Y1 = '2025-01-01';
var world = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
function col(id, b) { return ee.ImageCollection(id).select(b).filterDate(Y0, Y1); }

var lst = col('MODIS/061/MOD11C3', ['LST_Day_CMG', 'LST_Night_CMG']).map(function (i) { return i.multiply(0.02).subtract(273.15).copyProperties(i); });
var gmted = ee.Image('USGS/GMTED2010_FULL').select('mea');
var F = {
  lst_day: lst.select('LST_Day_CMG').mean(),
  lst_night: lst.select('LST_Night_CMG').mean(),
  lst_max: lst.select('LST_Day_CMG').max(),
  lst_min: lst.select('LST_Night_CMG').min(),
  precip: col('NASA/GPM_L3/IMERG_MONTHLY_V07', 'precipitation').mean().multiply(8760),
  ndvi: col('MODIS/061/MOD13C2', 'NDVI').mean().multiply(0.0001),
  albedo: col('MODIS/061/MCD43C3', 'Albedo_WSA_shortwave').mean().multiply(0.001),
  slope: ee.Terrain.slope(gmted.reproject('EPSG:4326', null, 5000))
};
var KEYS = Object.keys(F);
var featImg = ee.Image.cat(KEYS.map(function (k) { return F[k].rename(k); }));
var land = F.lst_day.unmask(-999).neq(-999);

// Rango terrestre robusto (p1–p99) calculado aquí
var stats = featImg.updateMask(land).reduceRegion({reducer: ee.Reducer.percentile([1, 99]), geometry: world, scale: 50000, bestEffort: true, maxPixels: 1e9});
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
  ['Valles Secos McMurdo', -77.5, 161.8], ['Islandia', 64.9, -18.6], ['Mauna Kea / HI-SEAS', 19.7, -155.5],
  ['MDRS Utah', 38.4, -110.8], ['Río Tinto', 37.7, -6.6], ['Lanzarote', 29.0, -13.6], ['Svalbard (AMASE)', 79.4, 13.4],
  ['Pilbara', -21.2, 119.0], ['Meteor / SP Crater', 35.3, -111.3], ['Axel Heiberg', 79.4, -90.8],
  ['Qaidam', 37.5, 94.0], ['Danakil / Dallol', 14.2, 40.3], ['Namib', -24.0, 15.0], ['Ries', 48.9, 10.6],
  ['Arkaroola', -30.3, 139.3], ['Sudbury', 46.6, -81.2], ['Concordia (Dome C)', -75.1, 123.3], ['Lonar', 20.0, 76.5],
  ['Kamchatka', 54.0, 159.0], ['Tierra de Bunge', 74.9, 140.0], ['Mojave Bristol', 34.5, -115.7], ['Wadi Rum', 29.6, 35.4]
];
var knownFC = ee.FeatureCollection(KNOWN.map(function (k) { return ee.Feature(ee.Geometry.Point([k[2], k[1]]), {name: k[0]}); }));
var exclusion = ee.Image(1).clip(knownFC.map(function (f) { return f.buffer(300000); }).union()).unmask(0);

function sim(k, tv) {
  var span = hi(k).subtract(lo(k));
  var p = F[k].subtract(lo(k)).divide(span).clamp(0, 1);
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

var s = scoreImage(T[TID]);
var dist = s.select('total').reduceRegion({reducer: ee.Reducer.percentile([50, 90, 99]), geometry: world, scale: 50000, bestEffort: true, maxPixels: 1e9});
var thr = ee.Number(dist.get('total_p99'));
var cands = s.addBands(featImg).updateMask(exclusion.not()).updateMask(s.select('total').gte(thr))
  .sample({region: world, scale: 50000, geometries: true, dropNulls: false, tileScale: 8})
  .filter(ee.Filter.notNull(['total'])).sort('total', false).limit(300);
var known = s.select('total').reduceRegions({collection: knownFC, reducer: ee.Reducer.mean(), scale: 5600});

Map.addLayer(s.select('total'), {min: 0.3, max: 0.9, palette: ['0d366b', '2a78d6', '86b6ef', 'ffffff']}, 'Similitud ' + TID);

function hav(a, b) {
  var R0 = 6371, toR = Math.PI / 180;
  var dLat = (b[1] - a[1]) * toR, dLon = (b[0] - a[0]) * toR;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R0 * Math.asin(Math.sqrt(h));
}
ee.Dictionary({cands: cands, dist: dist, stats: stats, known: known.aggregate_array('mean'), names: known.aggregate_array('name')}).evaluate(function (r, err) {
  if (err) { print('TERRA_ERR_' + TID, err); return; }
  var rd = function (v) { return v == null ? null : Math.round(v * 1000) / 1000; };
  var top = [];
  r.cands.features.forEach(function (f) {
    var c = f.geometry.coordinates;
    if (top.length < 20 && top.every(function (o) { return hav(o.c, c) >= 300; })) {
      var o = {c: [rd(c[0]), rd(c[1])]};
      Object.keys(f.properties).forEach(function (k) { o[k] = rd(f.properties[k]); });
      top.push(o);
    }
  });
  var out = {top: top, dist: r.dist, ranges: r.stats,
    known: r.names.map(function (n, i) { return {name: n, total: rd(r.known[i])}; })};
  print('TERRA_GLOBAL_' + TID + '::' + JSON.stringify(out));
});
