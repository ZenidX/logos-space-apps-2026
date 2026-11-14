# Suelo por emisión/reflexión: variable comparable Tierra–Luna–Marte

Fecha de consulta de todas las fuentes y muestras: **2026-11-14**. Earth Engine **no** estaba autenticado en esta sesión: no se calculó nada nuevo en EE; los valores ASTER/MODIS citados vienen de `~/spaceapp/docs/datos.md` (calculados ese mismo día por el equipo). Alcance recortado por el coordinador: solo datos descargables esta noche sin registro.

## Resumen (recomendación)
1. **La variable más coherente entre los tres cuerpos es la composición en infrarrojo térmico (8–12 µm)**: ASTER GED (Tierra), Diviner Christiansen Feature (Luna) y TES (Marte) miden emisividad que depende de la mineralogía (sílice/feldespato vs basalto).
2. **No son el mismo número**: ASTER tiene 5 bandas (8,3–11,3 µm) y no muestrea bien el CF; Diviner solo mide el CF (3 canales 7,55–8,68 µm). Comparar como **clase** (félsico / intermedio / máfico) o normalizado a percentiles, no en valor absoluto.
3. **Puente recomendado: MGS TES** (espectro completo) permite simular bandas ASTER y posición del CF a la vez; es el "traductor" entre cuerpos.
4. Segunda variable: **inercia térmica / tamaño de grano** (Marte TES/THEMIS TI, Luna Diviner rock abundance; Tierra solo aproximada como inercia térmica aparente con MODIS LST+albedo, que ya tenemos).
5. **Descargable esta noche sin registro**: SoilGrids REST (hecho, ver muestras), Diviner CF Lucey 2021 en Zenodo (CC BY 4.0, 206 MB/archivo, HTTP 200 comprobado), mapas TES en ASU (solo PNG coloreados, no cuantitativos), PDS (público, pesado). ASTER GED y EMIT requieren cuenta Earthdata (o EE).

## Tabla por dataset

| Dataset | Qué mide | Cobertura | Resolución | Periodo | Acceso | Licencia (verificada) | ¿Variable comparable? |
|---|---|---|---|---|---|---|---|
| **ASTER GED AG100 v003** (Tierra) | Emisividad media bandas 10–14 (8,3 / 8,6 / 9,1 / 10,6 / 11,3 µm), LST, NDVI, nº obs. | Tierra emergida; EE indica −59° a 80° lat (sin Antártida, confirmado en datos locales) | 100 m (EE: 111,32 m) | Climatología 2000–2008 | EE `NASA/ASTER_GED/AG100_003` (bandas `emissivity_band10..14`, escala 0,001); LP DAAC HDF5, DOI 10.5067/COMMUNITY/ASTER_GED/AG100.003 (requiere login Earthdata) | "openly shared, without restriction" (Earthdata catalog); EE: "no restrictions on data use, sale, or subsequent redistribution"; NASA por defecto CC0 | **Sí** (sílice vs máfico por razones de bandas). Valores >1 son artefactos: filtrar |
| **NASA EMIT L2B MIN** (Tierra) | Mineral identificado + profundidad de banda (Tetracorder) en VSWIR; 10 minerales núcleo: calcita, clorita, dolomita, goethita, yeso, hematites, illita+moscovita, caolinita, montmorillonita, vermiculita | Regiones áridas fuente de polvo, ~52°N–52°S (catálogo 54°N–54°S), por granulos ~75 km | 60 m | 2022-08-09 → presente (hueco 2022-09-13 → 2023-01-06) | Earthdata LP DAAC, V002 DOI 10.5067/EMIT/EMITL2BMIN.002 (netCDF, login). En EE: **no encontrado** (la URL de catálogo probada da 404) | Página del producto: sin licencia explícita → aplica política NASA (CC0 por defecto) | Parcial: hematites, yeso, arcillas son comparables con CRISM/TES en Marte (no Luna). VSWIR ≠ TIR |
| **SoilGrids 2.0 (ISRIC)** (Tierra) | Predicción ML de arena/limo/arcilla (g/kg ÷10 = %), 6 profundidades | Global sin Antártida (McMurdo devuelve null) | 250 m | Estático (v2.0, 2020) | REST `https://rest.isric.org/soilgrids/v2.0/properties/query`, también WebDAV/WCS/EE | **CC BY 4.0** ("Since 2019, SoilGrids products are provided under the CC BY 4.0"). API beta, fair use 5 llamadas/min, sin garantía | Solo Tierra. Útil como verdad aproximada de "fracción arena" para validar inercia térmica |
| **LRO Diviner CF** (Luna) | Posición del Christiansen Feature (máximo de emisividad) con canales 3–5 (7,55–8,05; 8,10–8,40; 8,38–8,68 µm). Mares (piroxeno/olivino) → CF más largo; tierras altas (plagioclasa) → más corto; sílice → aún más corto | PDS GDR L3: CF estándar y normalizado a mediodía ecuatorial; Lucey 2021: ±70° lat | Lucey 2021: 32 px/grado (~0,95 km); GDR L3 CF: resolución no confirmada | LRO 2009 → | Zenodo DOI 10.5281/zenodo.4558194 (sin registro); PDS Geosciences (`pds-geosciences.wustl.edu`, ruta exacta GDR_L3 no verificada); ODE | Zenodo: **CC BY 4.0**; PDS: "Data sets archived in the PDS are in the public domain" | **Sí**: CF corregido de meteorización espacial + mapas de plagioclasa/piroxeno/olivino |
| **Diviner rock abundance / soil temperature** (Luna) | Fracción de roca y temperatura del regolito (proxy de inercia térmica) | −60° a +60° | 32 px/grado | 2009 → | PDS GDR L3 (.IMG/.JP2) | PDS: dominio público | Sí, con inercia térmica de Marte (cualitativo) |
| **MGS TES** (Marte) | Espectros 6–50 µm; mapas derivados: plagioclasa, piroxenos, olivino, hematites, feldespato K, sílice/vidrio alto-Si, cuarzo, polvo; inercia térmica; albedo; Dust Cover Index (emisividad media 1350–1400 cm⁻¹) | Global | Minerales 4 ppd (16 km); TI 8 ppd (7,5 km); DCI 16 ppd (3,5 km) | 1997–2006 | ASU `mars.asu.edu/data/tes_*` (**PNG coloreados**, no valores); cuantitativo en PDS | PDS dominio público; páginas ASU: **not found** | **Sí, el mejor puente**: espectro completo → se pueden simular bandas ASTER y CF |
| **Odyssey THEMIS** (Marte) | 10 bandas TIR (6,8–14,9 µm, no verificado hoy) e inercia térmica | TI: ±60° lat, 24 teselas 30°×60° | 100 m | 2002 → | USGS Astrogeology (ISIS3 .cub / GeoTIFF, ~2,5 GB/tesela, descarga directa) ; ASU IR mosaics | PDS dominio público; página USGS: not checked | Sí: inercia térmica (precisión absoluta ~20 % según USGS); mineralogía TIR posible pero menos bandas |
| **MRO CRISM** (Marte) | VSWIR hiperespectral (filosilicatos, sulfatos, carbonatos) | Dirigido + multiespectral global | ~18–200 m | 2006–2023 | PDS / ODE Mars | PDS dominio público | Con EMIT (arcillas, yeso). **Detalles no verificados esta noche** |
| **Chandrayaan-1 M3** (Luna) | VNIR 0,43–3 µm (piroxeno, OH/H₂O) | Casi global | 140–280 m | 2008–2009 | PDS Imaging | PDS dominio público | Con EMIT/CRISM (piroxeno). **No verificado esta noche** |
| Kaguya MI, LROC WAC | VIS/NIR multibanda; FeO, TiO₂ | Global | — | — | JAXA / PDS | **No verificado** | FeO para separar mare/altas (usado por Lucey 2021) |

## Propuesta de variables comparables

### V1. Índice félsico–máfico en infrarrojo térmico (composición)
- **Tierra (ASTER GED)**: con ε10–ε14. Índices de la literatura (Ninomiya; **fórmulas a verificar antes de usar**): índice de cuarzo `QI = ε11² / (ε10·ε12)`; índice máfico `MI = ε12 / ε13`. Versión simple y robusta: `SiO2_proxy = ε13 / ε12` (10,6 / 9,1 µm): rocas ricas en sílice tienen una banda reststrahlen profunda a 8,5–9,3 µm → ε12 bajo → razón alta; basaltos → razón cercana a 1. Filtrar ε>1 y `num_obs` bajo. Dato local: ε12 Yungay 0,885 vs Death Valley 0,970 (datos.md, EE, 2026-11-14).
- **Luna (Diviner)**: posición CF corregida (Lucey 2021). CF corto = félsico/plagioclasa; largo = máfico.
- **Marte (TES)**: abundancias de plagioclasa/piroxeno/sílice (Bandfield 2002) o, mejor, convolucionar espectros TES con las respuestas de las bandas ASTER 10–14 y calcular la misma razón; y calcular CF del mismo espectro para calibrar la relación ASTER-razón ↔ CF.
- **Comparación**: clase félsico / intermedio / máfico, o percentil dentro de cada cuerpo. No restar valores entre cuerpos.
- **Límites**: (a) diferentes longitudes de onda (ASTER no cubre bien el CF a ~8 µm; Diviner no ve la banda de 9 µm); (b) el CF se desplaza en vacío y con gradiente térmico (regolito lunar) frente a condiciones terrestres; (c) meteorización espacial en la Luna (Lucey la corrige; el artefacto persiste parcialmente); (d) polvo marciano oculta la firma: usar TES DCI para enmascarar zonas polvorientas; (e) atmósfera terrestre y vegetación (ASTER GED trae NDVI para filtrar).

### V2. Inercia térmica / tamaño de grano (física de superficie)
- **Marte**: THEMIS TI 100 m (±60°), TES TI 7,5 km. **Luna**: Diviner rock abundance + temperatura del regolito nocturno.
- **Tierra**: no hay producto global de inercia térmica. Proxy = inercia térmica aparente `ATI = (1 − albedo) / (T_día − T_noche)` con MODIS (ya en el proyecto). Con las **medias anuales** de datos.md: Atacama `0,72/29,8 ≈ 0,024 K⁻¹`, Death Valley `0,77/15,7 ≈ 0,049 K⁻¹`; Haughton no es válido (nieve, noche polar, ΔT≈1 K). Lo correcto sería usar pares día/noche del mismo día (MOD11A1), no medias anuales. Validar con fracción de arena SoilGrids.
- **Límites**: en la Tierra la atmósfera, la humedad del suelo y el viento dominan el ciclo diurno; ATI no es inercia térmica en J m⁻² K⁻¹ s⁻½. Comparar solo en orden relativo (arena suelta vs roca).

## Muestras (SoilGrids 2.0, 0–5 cm, media; REST API, 2026-11-14)
Valores modelados (ML), no medidos. Archivos crudos en `tmp-b/sg_*.json`.

| Sitio | lat, lon | Arena % | Limo % | Arcilla % |
|---|---|---|---|---|
| Dumont Dunes (corrected point, OSM: 35.681, −116.225) | 35.681, −116.225 | 61.5 | 17.3 | 21.2 |
| Atacama Yungay | −24.08, −69.93 | 61.6 | 24.8 | 13.5 |
| Hanksville UT | 38.41, −110.79 | 52.4 | 31.2 | 16.4 |
| SP Crater (SF Volcanic Field) | 35.58, −111.63 | 41.9 | 35.9 | 22.2 |
| Craters of the Moon | 43.42, −113.52 | 39.9 | 43.7 | 16.4 |
| Death Valley | 36.46, −116.87 | 45.0 | 31.5 | 23.5 |
| Haughton | 75.38, −89.67 | 35.1 | 39.8 | 25.1 |
| Lanzarote (aprox.) | 29.00, −13.75 | 44.2 | 31.9 | 23.9 |
| Kīlauea (aprox.) | 19.40, −155.28 | 36.0 | 29.6 | 34.4 |
| Holuhraun, Islandia (aprox.) | 64.85, −16.83 | 53.2 | 35.5 | 11.3 |
| McMurdo Dry Valleys | −77.5, 161.8 | null | null | null |

Ojo: en coladas jóvenes (Kīlauea, Craters of the Moon, Holuhraun) y en Haughton los valores son interpolación del modelo, no suelo real (roca desnuda). Dumont Dunes sale solo 58 % arena aunque es un campo de dunas: SoilGrids suaviza. Sirve como orden relativo, no como verdad. ASTER/EMIT no se muestrearon (EE sin autenticar; LP DAAC exige login).

## Huecos / incógnitas
- Ruta exacta PDS del CF Diviner GDR L3 y su resolución: no verificadas.
- Los mapas TES de ASU son PNG coloreados: no dan valores; los cuantitativos están en PDS (no descargados).
- Fórmulas de índices ASTER (Ninomiya): citadas de memoria, **verificar** en la fuente original.
- EMIT en Earth Engine: no encontrado. CRISM, M3, Kaguya, THEMIS bandas: no verificados esta noche.
- Licencia de las páginas ASU y USGS Astrogeology: not found / not checked.
- La API REST de SoilGrids figura como "temporalmente pausada" en su documentación, pero respondió hoy.

## Next step
1. Descargar `diviner_CF_space_weathering_corrected.tiff` y `diviner_MI_plagioclase.tiff` de Zenodo 10.5281/zenodo.4558194 (CC BY 4.0) y muestrear Shackleton.
2. Con EE autenticado: calcular `ε13/ε12` de `NASA/ASTER_GED/AG100_003` en los 5 sitios prioritarios.
3. Bajar de PDS mapas TES cuantitativos (Bandfield 2002) y el DCI para Jezero/Arcadia.
4. Bajar la tesela THEMIS TI que cubre Jezero (USGS Astrogeology) para V2.
5. Recalcular ATI con MOD11A1 día/noche del mismo día y comparar con la arena de SoilGrids.

## Fuentes (consultadas 2026-11-14)
- ASTER GED en EE: https://developers.google.com/earth-engine/datasets/catalog/NASA_ASTER_GED_AG100_003
- ASTER GED Earthdata (bandas, licencia): https://www.earthdata.nasa.gov/data/catalog/lpcloud-ag100-003
- EMIT L2B MIN V002: https://www.earthdata.nasa.gov/data/catalog/lpcloud-emitl2bmin-002 · guía: https://lpdaac.usgs.gov/documents/1660/EMITL2BMIN_User_Guide_V1.pdf
- Política NASA (CC0 por defecto): https://www.earthdata.nasa.gov/earth-observation-data/data-use-policy
- SoilGrids licencia y API: https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_02.html · API: https://rest.isric.org
- Diviner CF Lucey et al. 2021 (Zenodo): https://zenodo.org/records/4558194
- Diviner GDR L3 (ODE): https://ode.rsl.wustl.edu/moon/pagehelp/Content/Missions_Instruments/LRO/DIVINER/GDR_L3.htm
- Canales Diviner y CF mare/altas: https://ntrs.nasa.gov/api/citations/20120002786/downloads/20120002786.pdf
- PDS dominio público: https://pds-geosciences.wustl.edu/faq.html
- TES (ASU, mapas globales): http://www.mars.asu.edu/data/ · DCI: https://www.mars.asu.edu/data/tes_ruffdust/ · Ruff & Christensen 2002, doi:10.1029/2001JE001580
- TES minerales: Bandfield 2002, JGR 107 (citado en http://www.mars.asu.edu/data/tes_plagioclase/)
- THEMIS TI: https://astrogeology.usgs.gov/search/map/themis_thermal_inertia_mosaic_quantitative_30s060e_100mpp
- Datos locales: `~/spaceapp/docs/datos.md`, `~/spaceapp/data/ee/README.md`
