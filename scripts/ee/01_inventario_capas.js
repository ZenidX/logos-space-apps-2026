// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Inventario de capas NASA/ESA: tipo de dato, resolución, fechas y rango global.
// Las muestras por sitio de este script NO son fiables (aggregate_array descarta nulos);
// usar 02_muestras_sitios.js para las muestras.
var Y0 = '2024-01-01', Y1 = '2025-01-01';
var sites = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-69.93, -24.08]), {id: 'atacama'}),
  ee.Feature(ee.Geometry.Point([-89.67, 75.38]), {id: 'haughton'}),
  ee.Feature(ee.Geometry.Point([-116.87, 36.46]), {id: 'deathvalley'}),
  ee.Feature(ee.Geometry.Point([161.8, -77.5]), {id: 'dryvalleys'}),
  ee.Feature(ee.Geometry.Point([-60.0, -3.4]), {id: 'amazonia'})
]);
var world = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
var L = [
  {id: 'lst_day', col: 'MODIS/061/MOD11A2', band: 'LST_Day_1km', k: 0.02, o: -273.15, agg: 'mean'},
  {id: 'lst_night', col: 'MODIS/061/MOD11A2', band: 'LST_Night_1km', k: 0.02, o: -273.15, agg: 'mean'},
  {id: 'lst_max', col: 'MODIS/061/MOD11A2', band: 'LST_Day_1km', k: 0.02, o: -273.15, agg: 'max'},
  {id: 'lst_min', col: 'MODIS/061/MOD11A2', band: 'LST_Night_1km', k: 0.02, o: -273.15, agg: 'min'},
  {id: 'ndvi', col: 'MODIS/061/MOD13A2', band: 'NDVI', k: 0.0001, o: 0, agg: 'mean'},
  {id: 'albedo', col: 'MODIS/061/MCD43A3', band: 'Albedo_WSA_shortwave', k: 0.001, o: 0, agg: 'mean'},
  {id: 'snow', col: 'MODIS/061/MOD10A1', band: 'NDSI_Snow_Cover', k: 1, o: 0, agg: 'mean'},
  {id: 'precip', col: 'NASA/GPM_L3/IMERG_MONTHLY_V07', band: 'precipitation', k: 8760, o: 0, agg: 'mean'},
  {id: 'emis', col: 'NASA/ASTER_GED/AG100_003', band: 'emissivity_band12', k: 0.001, o: 0, agg: 'img'},
  {id: 'elev', col: 'NASA/NASADEM_HGT/001', band: 'elevation', k: 1, o: 0, agg: 'img'},
  {id: 'slope', col: 'NASA/NASADEM_HGT/001', band: 'elevation', k: 1, o: 0, agg: 'slope'},
  {id: 'cop_dem', col: 'COPERNICUS/DEM/GLO30', band: 'DEM', k: 1, o: 0, agg: 'mosaic'}
];
function build(l) {
  var raw, img, meta;
  if (l.agg === 'img' || l.agg === 'slope') {
    raw = ee.Image(l.col).select(l.band);
    img = l.agg === 'slope' ? ee.Terrain.slope(raw) : raw;
    meta = ee.Dictionary({n: 1, t0: null, t1: null});
  } else {
    var c = ee.ImageCollection(l.col).select(l.band);
    if (l.agg !== 'mosaic') c = c.filterDate(Y0, Y1);
    raw = c.first();
    img = l.agg === 'mean' ? c.mean() : l.agg === 'max' ? c.max() : l.agg === 'min' ? c.min() : c.mosaic();
    var full = ee.ImageCollection(l.col);
    meta = ee.Dictionary({n: full.size(), t0: full.aggregate_min('system:time_start'), t1: full.aggregate_max('system:time_start')});
  }
  img = img.multiply(l.k).add(l.o).rename('v');
  var stats = img.reduceRegion({reducer: ee.Reducer.percentile([1, 50, 99]).combine(ee.Reducer.minMax(), '', true), geometry: world, scale: 50000, bestEffort: true, maxPixels: 1e9});
  var samples = img.reduceRegions({collection: sites, reducer: ee.Reducer.first(), scale: 1000}).aggregate_array('first');
  return ee.Dictionary({id: l.id, bandType: raw.bandTypes().get(l.band), nominalScale: raw.select(l.band).projection().nominalScale(), meta: meta, stats: stats, samples: samples});
}
var out = ee.List(L.map(build));
out.evaluate(function (res, err) {
  if (err) { print('TERRA_ERR', err); return; }
  print('TERRA_JSON::' + JSON.stringify(res));
});
