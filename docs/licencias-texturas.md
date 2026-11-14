# Texturas de los globos: fuente, crédito y licencia (2026-11-14)
Archivos: `texturas/{earth,moon,mars}-{1024,2048}.jpg` (equirectangulares 2:1, JPEG progresivo q80, sin metadatos). 1024 px = 82+80+104 KB; 2048 px = 290+342+452 KB (1,1 MB).
Copiar a `public/tex/` del repo. Con basePath, las URLs deben ir con `NEXT_PUBLIC_BASE_PATH` (ya contemplado en Globe.tsx).
| Cuerpo | Fuente exacta | Crédito sugerido (HUD y README) | Licencia / estado |
|---|---|---|---|
| Tierra | NASA GIBS, capa `BlueMarble_ShadedRelief_Bathymetry`, WMS GetMap EPSG:4326, 2048×1024 (la misma capa que ya usa la pestaña Maps) | «NASA GIBS · Blue Marble» | Contenido NASA: «generally not subject to copyright in the United States»; citar a NASA como fuente |
| Luna | NASA SVS «CGI Moon Kit» (svs.gsfc.nasa.gov/4720), `lroc_color_poles_2k.tif` (versión 2019 con polos), pasado a JPEG | «LROC WAC · NASA SVS» (SVS: Ernie Wright, STC; Noah Petro, NASA/GSFC; mosaico LROC WAC, NASA/GSFC/Arizona State University) | La página de SVS no declara licencia y remite a las normas de reproducción de NASA (mismas que arriba) |
| Marte | NASA Mars Trek, capa `Mars_Viking_MDIM21_ClrMosaic_global_232m`, teselas z=2 (8×4) unidas | «Viking MDIM 2.1 · NASA/USGS» (mosaico MDIM 2.1 de USGS; color de NASA Ames, según ODE) | No encontré una declaración de licencia explícita de esa capa; son obras de agencias federales de EE. UU. |
Reglas NASA (nasa.gov/nasa-brand-center/images-and-media, leído hoy): citar a NASA como fuente; no sugerir que NASA avala un producto o servicio; el logo/insignia de NASA NO es de dominio público (no usarlo en la web ni en el vídeo salvo permiso).
Procesado hecho por Diseño: unión de teselas, reescalado 2048→1024, recompresión JPEG. No se ha retocado el contenido.
Descartada: capa Trek `LRO_WAC_Mosaic_Global_303ppd_v02` para la Luna (se ve bien en el mapa 2D, pero tiene costura y «churretes» en los polos: justo donde está Shackleton).
Marte alternativo con elevación (arcoíris MOLA, `Mars_MGS_MOLA_ClrShade_merge_global_463m`): es lo que usa hoy la pestaña Maps; no lo recomiendo para el globo (parece «dato», no un planeta).
Pendiente de verificar por Space Apps (no lo he podido comprobar): reglas del reto sobre atribución de datos (`docs/normas.md` no las menciona) y la política de uso de las capas de Trek. Esto no es asesoría legal.
