#!/usr/bin/env bash
# AI-assisted (Claude), reviewed by team Logos
# Rebuilds the extra globe textures in public/tex/ from NASA sources (needs curl, ImageMagick 7, libvips, node).
# Downloaded 15 Nov 2026; SHA-256 of each file below. Run from the repo root: bash scripts/tex/make-textures.sh
set -euo pipefail
W=$(mktemp -d); T=public/tex
get() { curl -sL --fail --max-time 120 -o "$W/$2" "$1"; echo "$3  $W/$2" | sha256sum -c --quiet; }
# 1 · City lights and water mask: NASA Earth Observatory, Black Marble 2016 colour map, 0.1° (Suomi NPP VIIRS).
#     Page: https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/
get "https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg" bm.jpg d87de751a264e4f8ff69c68de5dab9606daee87a6f15ae743c93200743bd7ec1
# 2 · Clouds: NASA Visible Earth, Blue Marble cloud layer (record 57747, 2002). The original eoimages.gsfc.nasa.gov address
#     no longer answers, so the Internet Archive copy of that exact address is used.
get "https://web.archive.org/web/20231230035012id_/https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg" clouds.jpg daddaad84d7a33bbbc86cdda3f591099f57cee8607b7bcf3b67eb7e4f7a1c793
# 3 · Moon relief: LOLA elevation, 4 px/degree, km, NASA SVS CGI Moon Kit (https://svs.gsfc.nasa.gov/4720).
get "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_4.tif" ldem_4.tif 330afa2556a86fd05ac6ba2f912f246600fdade35de2a0d90593d50d07b01b65
# 4 · Mars relief: MGS MOLA MEGDR, 4 px/degree, metres, 0–360° E (NASA PDS Geosciences Node).
get "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg004/megt90n000cb.img" mola.img 25f16fb7aaf857898dcf98bc4f841341a24f8b9f7e98453ca083bc45d897ca2c

# city lights: warm pixels only (the Black Marble land background is blue); water: the image's uniform ocean colour (5, 5, 15)
magick "$W/bm.jpg" -fx "max(0,min(1,(r+g-1.4*b)*1.16))" -colorspace gray "$W/night.png"
magick "$W/bm.jpg" -fx "(abs(r*255-5)<5 && abs(g*255-5)<5 && abs(b*255-15)<6) ? 1 : 0" -colorspace gray "$W/ocean.png"
magick "$W/night.png" -filter Lanczos -resize 2048x1024! -quality 86 -sampling-factor 1x1 -strip -colorspace gray $T/earth-night-2048.jpg
magick "$W/night.png" -filter Lanczos -resize 1024x512! -quality 86 -strip -colorspace gray $T/earth-night-1024.jpg
magick "$W/ocean.png" -filter Triangle -resize 1024x512! -colorspace gray -quality 85 -strip $T/earth-ocean-1024.jpg
magick "$W/clouds.jpg" -colorspace gray -quality 74 -strip $T/earth-clouds-2048.jpg
magick "$W/clouds.jpg" -colorspace gray -filter Lanczos -resize 1024x512! -quality 82 -strip $T/earth-clouds-1024.jpg
# relief → tangent-space normal maps (exaggerated ×12 on the Moon, ×10 on Mars; MOLA rolled by 180° to start at 180° W)
vips rawsave "$W/ldem_4.tif" "$W/ldem_4.raw"
node scripts/tex/normals.mjs "$W/ldem_4.raw" 1440 720 float32le 1000 1737400 12 0 "$W/moon.ppm"
node scripts/tex/normals.mjs "$W/mola.img" 1440 720 int16be 1 3396190 10 720 "$W/mars.ppm"
magick "$W/moon.ppm" -filter Lanczos -resize 1024x512! -quality 80 -sampling-factor 1x1 -strip $T/moon-normal-1024.jpg
magick "$W/mars.ppm" -filter Lanczos -resize 1024x512! -quality 84 -sampling-factor 1x1 -strip $T/mars-normal-1024.jpg
rm -rf "$W"; echo "done: $T"
