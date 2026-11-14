// terra-analog · Google Earth Engine Code Editor (proyecto terra-analog)
// Exporta a un asset (batch) la accesibilidad y la fracción urbana en la rejilla de 0,1° (85N–85S).
// access_h: tiempo de viaje a la ciudad más cercana (≥50 000 hab.), horas. Oxford MAP, Weiss et al. 2018 (Nature).
// urban_frac: fracción de suelo urbano (MODIS MCD12Q1 2023, LC_Type1 = 13).
// Media de la celda ≈ media focal en una ventana cuadrada de 11 km a resolución nativa, muestreada en el centro.
// (reduceResolution + reproject a 0,1° falla en batch: "Reprojection output too large".)
var R = 5566; // medio lado de una celda de 0,1° en metros
var accessH = ee.Image('Oxford/MAP/accessibility_to_cities_2015_v1_0').divide(60)
  .focalMean({radius: R, kernelType: 'square', units: 'meters'}).rename('access_h');
var urban = ee.ImageCollection('MODIS/061/MCD12Q1').filterDate('2023-01-01', '2024-01-01').first()
  .select('LC_Type1').eq(13)
  .focalMean({radius: R, kernelType: 'square', units: 'meters'}).rename('urban_frac');

Export.image.toAsset({
  image: accessH.addBands(urban).toFloat(),
  description: 'terra_access_01deg',
  assetId: 'projects/terra-analog/assets/terra_access_01deg',
  pyramidingPolicy: {'.default': 'mean'},
  crs: 'EPSG:4326',
  crsTransform: [0.1, 0, -180, 0, -0.1, 85],
  dimensions: '3600x1700',
  maxPixels: 1e10
});
