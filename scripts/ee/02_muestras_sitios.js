// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Muestras de cada capa en los sitios de referencia, a resolución nativa.
// Un reduceRegion por sitio: si no hay dato devuelve null (no se desplazan valores).
// Orden de sitios: atacama, haughton, deathvalley, dryvalleys, amazonia.
var Y0 = '2024-01-01', Y1 = '2025-01-01';
var pts = [[-69.93, -24.08], [-89.67, 75.38], [-116.87, 36.46], [161.8, -77.5], [-60.0, -3.4]];
function col(id, band, agg) { var c = ee.ImageCollection(id).select(band).filterDate(Y0, Y1); return agg === 'max' ? c.max() : agg === 'min' ? c.min() : c.mean(); }
var nasadem = ee.Image('NASA/NASADEM_HGT/001').select('elevation');
var L = {
  lst_day: [col('MODIS/061/MOD11A2', 'LST_Day_1km', 'mean').multiply(0.02).subtract(273.15), 1000],
  lst_night: [col('MODIS/061/MOD11A2', 'LST_Night_1km', 'mean').multiply(0.02).subtract(273.15), 1000],
  lst_max: [col('MODIS/061/MOD11A2', 'LST_Day_1km', 'max').multiply(0.02).subtract(273.15), 1000],
  lst_min: [col('MODIS/061/MOD11A2', 'LST_Night_1km', 'min').multiply(0.02).subtract(273.15), 1000],
  ndvi: [col('MODIS/061/MOD13A2', 'NDVI', 'mean').multiply(0.0001), 1000],
  albedo: [col('MODIS/061/MCD43A3', 'Albedo_WSA_shortwave', 'mean').multiply(0.001), 500],
  snow: [col('MODIS/061/MOD10A1', 'NDSI_Snow_Cover', 'mean'), 500],
  precip: [col('NASA/GPM_L3/IMERG_MONTHLY_V07', 'precipitation', 'mean').multiply(8760), 11000],
  emis: [ee.Image('NASA/ASTER_GED/AG100_003').select('emissivity_band12').multiply(0.001), 100],
  elev: [nasadem, 30],
  slope: [ee.Terrain.slope(nasadem), 30],
  cop_dem: [ee.ImageCollection('COPERNICUS/DEM/GLO30').select('DEM').mosaic().setDefaultProjection('EPSG:4326', null, 30), 30]
};
var out = {};
Object.keys(L).forEach(function (k) {
  var img = ee.Image(L[k][0]).rename('v');
  out[k] = ee.List(pts.map(function (p) {
    return img.reduceRegion({reducer: ee.Reducer.first(), geometry: ee.Geometry.Point(p), scale: L[k][1]}).get('v');
  }));
});
ee.Dictionary(out).evaluate(function (res, err) {
  if (err) { print('TERRA_ERR', err); return; }
  print('TERRA_SAMPLES::' + JSON.stringify(res));
});
