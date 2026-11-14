// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Análisis en TRES FASES (v3, 14-11-2026):
//   Fase 1 · FORMA GEOGRÁFICA  = media(Superficie[NDVI, albedo], Relieve[pendiente])  → lista corta: forma ≥ p95 de la tierra firme
//   Fase 2 · CONDICIÓN CLIMÁTICA = media(Clima[4 temperaturas MODIS, lluvia GPM], Atmósfera[presión, viento, humedad, polvo MERRA-2])
//            → sobreviven las celdas de la lista corta con clima ≥ p90 de esa lista (se decide fuera, en scripts/ee/merge-tres-fases.mjs)
//   Fase 3 · ACCESIBILIDAD: los supervivientes se ordenan por tiempo de viaje a la ciudad (Oxford MAP), separados ≥ 300 km.
// Similitud por variable = 1 − |pos(celda) − pos(objetivo)| con pos = posición dentro del rango terrestre p1–p99.
// Exclusiones: 25 análogos catalogados (300 km), celdas >5 % urbanas, celdas con albedo < 0,08 (costa con agua).
var TID = 'shackleton'; // 'shackleton' | 'jezero' | 'arcadia'
var A0 = ee.Image('projects/terra-analog/assets/terra_features_01deg');
var A = A0.addBands(A0.select('ndvi').multiply(10000), null, true); // el asset guardó el NDVI ×1e-4
var M = ee.Image('projects/terra-analog/assets/terra_atmo_01deg');
var AC = ee.Image('projects/terra-analog/assets/terra_access_01deg');
var F = A.addBands(M).addBands(AC);
var world = ee.Geometry.Rectangle([-180, -85, 180, 85], null, false);
var SCALE = 11132;
var land = A.select('lst_day').mask().gt(0);
var VARS = ['ndvi', 'albedo', 'slope', 'lst_day', 'lst_night', 'lst_max', 'lst_min', 'precip', 'ps_hpa', 'wind_ms', 'qv_gkg', 'dust_aod'];
var stats = F.select(VARS).updateMask(land).reduceRegion({reducer: ee.Reducer.percentile([1, 99]), geometry: world, scale: SCALE, bestEffort: true, maxPixels: 1e10});

var T = {
  shackleton: {ndvi: 0, albedo: 0.15, slope: 8, lst_day: -100, lst_night: -180, lst_max: -50, lst_min: -230, precip: 0, ps_hpa: 0, wind_ms: 0, qv_gkg: 0, dust_aod: 0},
  jezero: {ndvi: 0, albedo: 0.2, slope: 3, lst_day: -40, lst_night: -80, lst_max: 10, lst_min: -90, precip: 0, ps_hpa: 7, wind_ms: 4, qv_gkg: 0.03, dust_aod: 0.5},
  arcadia: {ndvi: 0, albedo: 0.2, slope: 1, lst_day: -60, lst_night: -100, lst_max: -10, lst_min: -120, precip: 0, ps_hpa: 8, wind_ms: 5, qv_gkg: 0.03, dust_aod: 0.5}
};
function sim(k, tv) {
  var lo = ee.Number(stats.get(k + '_p1')), hi = ee.Number(stats.get(k + '_p99')), span = hi.subtract(lo);
  var p = F.select(k).subtract(lo).divide(span).clamp(0, 1);
  var tp = ee.Number(tv).subtract(lo).divide(span).max(0).min(1);
  return ee.Image(1).subtract(p.subtract(tp).abs());
}
function mean(imgs) { return ee.ImageCollection(imgs).mean(); }
var t = T[TID];
var superficie = mean([sim('ndvi', t.ndvi), sim('albedo', t.albedo)]).rename('superficie');
var relieve = sim('slope', t.slope).rename('relieve');
var forma = mean([superficie, relieve]).rename('forma');
var climaT = mean(['lst_day', 'lst_night', 'lst_max', 'lst_min', 'precip'].map(function (k) { return sim(k, t[k]); })).rename('clima_t');
var atmos = mean(['ps_hpa', 'wind_ms', 'qv_gkg', 'dust_aod'].map(function (k) { return sim(k, t[k]); })).rename('atmos');
var clima = mean([climaT, atmos]).rename('clima');
var accessScore = ee.Image(1).subtract(AC.select('access_h').add(1).log().divide(Math.log(73))).clamp(0, 1).rename('accesibilidad');
var S = ee.Image.cat([forma, superficie, relieve, clima, climaT, atmos, accessScore]).updateMask(land);

var KNOWN = [['Atacama', -24.1, -69.9], ['Haughton / Devon', 75.4, -89.7], ['Death Valley / Mojave', 36.5, -116.9], ['McMurdo Dry Valleys', -77.5, 161.8], ['Iceland', 64.9, -18.6], ['Hawaii · Mauna Kea / Mauna Loa (HI-SEAS)', 19.7, -155.5], ['MDRS Utah', 38.4, -110.8], ['Rio Tinto', 37.7, -6.6], ['Lanzarote', 29.0, -13.6], ['Svalbard (AMASE)', 79.4, 13.4], ['Pilbara', -21.2, 119.0], ['Meteor / SP Crater', 35.3, -111.3], ['Axel Heiberg', 79.4, -90.8], ['Qaidam', 37.5, 94.0], ['Danakil / Dallol', 14.2, 40.3], ['Namib', -24.0, 15.0], ['Ries', 48.9, 10.6], ['Arkaroola', -30.3, 139.3], ['Sudbury', 46.6, -81.2], ['Concordia (Dome C)', -75.1, 123.3], ['Lonar', 20.0, 76.5], ['Kamchatka', 54.0, 159.0], ['Bunge Land', 74.9, 140.0], ['Mojave Bristol', 34.5, -115.7], ['Wadi Rum', 29.6, 35.4]];
var knownFC = ee.FeatureCollection(KNOWN.map(function (k) { return ee.Feature(ee.Geometry.Point([k[2], k[1]]), {name: k[0]}); }));
var excluded = ee.Image(0).paint(knownFC.map(function (f) { return f.buffer(300000, 5000); }), 1);

// Umbral de la fase 1 sobre toda la tierra firme
var formaP = forma.updateMask(land).reduceRegion({reducer: ee.Reducer.percentile([50, 90, 95, 99]), geometry: world, scale: SCALE, bestEffort: true, maxPixels: 1e10});
var thr1 = ee.Number(formaP.get('forma_p95'));
var shortlist = S.addBands(F.select(VARS.concat(['access_h', 'urban_frac', 'elev'])))
  .updateMask(excluded.not()).updateMask(AC.select('urban_frac').unmask(0).lte(0.05)).updateMask(A.select('albedo').gte(0.08))
  .updateMask(forma.gte(thr1))
  .sample({region: world, scale: SCALE, geometries: true, tileScale: 8});
var known = S.reduceRegions({collection: knownFC.map(function (f) { return f.buffer(20000); }), reducer: ee.Reducer.mean(), scale: SCALE});

print('Fase 1 · percentiles de forma', formaP);
print('Rangos p1–p99', stats);
Map.addLayer(forma, {min: 0.4, max: 1, palette: ['0d366b', '2a78d6', '86b6ef', 'ffffff']}, 'Fase 1 · forma ' + TID);
Map.addLayer(clima, {min: 0.3, max: 0.9, palette: ['3b1a00', 'b5651d', 'ffb547', 'fff3d6']}, 'Fase 2 · clima ' + TID, false);
// Descarga (GeoJSON) de la lista corta y de los conocidos: ver scripts/ee/merge-tres-fases.mjs
shortlist.getDownloadURL({format: 'geojson', filename: 'shortlist_' + TID, callback: function (u) { print('Lista corta (fase 1):', u); }});
known.getDownloadURL({format: 'geojson', filename: 'known_' + TID, callback: function (u) { print('Análogos conocidos:', u); }});
