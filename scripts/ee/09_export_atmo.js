// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Fase 2 (condicionamiento climático): variables atmosféricas de NASA MERRA-2, media de 2024,
// exportadas a la rejilla de 0,1° (85N–85S). MERRA-2 es ~0,5° × 0,625°: se remuestrea (vecino más cercano).
// Bandas:
//   ps_hpa    presión en superficie (hPa)            MERRA-2 M2T1NXSLV · PS
//   wind_ms   velocidad media del viento a 10 m (m/s) MERRA-2 M2T1NXSLV · hypot(U10M, V10M) hora a hora
//   qv_gkg    humedad específica a 2 m (g/kg)         MERRA-2 M2T1NXSLV · QV2M × 1000
//   dust_aod  espesor óptico del polvo (550 nm)       MERRA-2 M2T1NXAER · DUEXTTAU
var Y0 = '2024-01-01', Y1 = '2025-01-01';
var slv = ee.ImageCollection('NASA/GSFC/MERRA/slv/2').filterDate(Y0, Y1);
var aer = ee.ImageCollection('NASA/GSFC/MERRA/aer/2').filterDate(Y0, Y1);
var wind = slv.map(function (i) { return i.select('U10M').hypot(i.select('V10M')); }).mean().rename('wind_ms');
var atmo = ee.Image.cat([
  slv.select('PS').mean().divide(100).rename('ps_hpa'),
  wind,
  slv.select('QV2M').mean().multiply(1000).rename('qv_gkg'),
  aer.select('DUEXTTAU').mean().rename('dust_aod')
]).toFloat();

Export.image.toAsset({
  image: atmo,
  description: 'terra_atmo_01deg',
  assetId: 'projects/terra-analog/assets/terra_atmo_01deg',
  crs: 'EPSG:4326',
  crsTransform: [0.1, 0, -180, 0, -0.1, 85],
  dimensions: '3600x1700',
  maxPixels: 1e10
});
