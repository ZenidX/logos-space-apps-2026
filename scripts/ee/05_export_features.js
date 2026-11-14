// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Exporta UNA VEZ las variables globales a un asset de 0,1° (~11 km), en modo batch (sin límite de 5 min).
// Después la puntuación (06_puntuar_asset.js) se ejecuta sobre el asset en segundos.
var Y0 = '2024-01-01', Y1 = '2025-01-01';
function col(id, b) { return ee.ImageCollection(id).select(b).filterDate(Y0, Y1); }
var lst = col('MODIS/061/MOD11A2', ['LST_Day_1km', 'LST_Night_1km']).map(function (i) { return i.multiply(0.02).subtract(273.15).copyProperties(i); });
var gmted = ee.Image('USGS/GMTED2010_FULL').select('mea');
var featImg = ee.Image.cat([
  lst.select('LST_Day_1km').mean().rename('lst_day'),
  lst.select('LST_Night_1km').mean().rename('lst_night'),
  lst.select('LST_Day_1km').max().rename('lst_max'),
  lst.select('LST_Night_1km').min().rename('lst_min'),
  col('NASA/GPM_L3/IMERG_MONTHLY_V07', 'precipitation').mean().multiply(8760).rename('precip'),
  col('MODIS/061/MOD13C1', 'NDVI').mean().multiply(0.0001).rename('ndvi'),
  col('MODIS/061/MCD43C3', 'Albedo_WSA_shortwave').filter(ee.Filter.calendarRange(15, 15, 'day_of_month')).mean().multiply(0.001).rename('albedo'),
  ee.Terrain.slope(gmted.reproject('EPSG:4326', null, 5000)).rename('slope'),
  gmted.rename('elev')
]).toFloat();

Export.image.toAsset({
  image: featImg,
  description: 'terra_features_01deg',
  assetId: 'projects/terra-analog/assets/terra_features_01deg',
  crs: 'EPSG:4326',
  // 85°N–85°S: con 90° la exportación falla ("Unable to transform edge ... EPSG:4326") en el polo.
  crsTransform: [0.1, 0, -180, 0, -0.1, 85],
  dimensions: '3600x1700',
  maxPixels: 1e10
});
