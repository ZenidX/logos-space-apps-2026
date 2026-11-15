# AI-assisted (Claude), reviewed by team Logos
"""Regrid SoilGrids 2.0 sand 0-5 cm (5 km, Homolosine) onto the 0.1 deg Earth grid (area average, % units).
Usage: LOGOS_IN=... LOGOS_WORK=... python -I 01_regrid_sand.py"""
import os
import numpy as np, rasterio
from rasterio.warp import reproject, Resampling
IN = os.environ["LOGOS_IN"]; WORK = os.environ.get("LOGOS_WORK", "work"); os.makedirs(WORK, exist_ok=True)
with rasterio.open(f"{IN}/sand_0-5cm_mean_5000.tif") as s, rasterio.open(f"{IN}/terra_features_01deg/lst_day.tif") as ref:
    dst = np.full(ref.shape, np.nan, "float32")
    reproject(s.read(1).astype("float32"), dst, src_transform=s.transform, src_crs=s.crs, src_nodata=s.nodata,
              dst_transform=ref.transform, dst_crs=ref.crs, dst_nodata=np.nan, resampling=Resampling.average)
    p = ref.profile; p.update(dtype="float32", nodata=np.nan)
    with rasterio.open(f"{WORK}/sand_pct_01deg.tif", "w", **p) as o:
        o.write(dst / 10, 1)  # g/kg -> %
print("ok")
