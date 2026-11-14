# AI-assisted (Claude), to be reviewed by team Logos
"""Heightmaps (96 x 96, Float32 little-endian, row 0 = north, metres) of an 11 x 11 km square around every
site and target, plus slope and roughness computed the same way on all three bodies.
Usage: LOGOS_WORK=... python -I 06_terrain.py <sites.json> <out_dir>
Earth: Copernicus DEM GLO-30 (AWS Open Data COGs). Moon: LRO LOLA south-pole DEM 30 m/px (Moon Trek).
Mars: MOLA-HRSC blended DEM 200 m/px (Mars Trek). Common grid: 96 x 96 over 11 km = 114.6 m step.
"""
import json, math, os, sys, time, urllib.request
import numpy as np, rasterio
from rasterio.merge import merge
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds

N, SIZE = 96, 11000.0
STEP = SIZE / N
UA = {"User-Agent": "space-apps-research-client/1.0"}
COP = "https://copernicus-dem-30m.s3.amazonaws.com/{n}/{n}.tif"
MOON = "https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_SPole75_30mp_v04/ImageServer"
MARS = "https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MOLA_blend200ppx_HRSC_DEM_clon0dd_200mpp_lzw/ImageServer"
R_MOON, R_MARS = 1737400.0, 3396190.0
SRC = {
    "earth": {"source": "Copernicus DEM GLO-30 (ESA / Copernicus, produced using Copernicus WorldDEM-30 (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018), AWS Open Data s3://copernicus-dem-30m",
              "url": "https://registry.opendata.aws/copernicus-dem/", "nativeResolutionM": 30, "licence": "Copernicus DEM licence (free, worldwide, attribution required); to be verified by the team"},
    "moon": {"source": "NASA LRO LOLA south-pole DEM 30 m/px (LRO_LOLA_DEM_SPole75_30mp_v04) via NASA Moon Trek", "url": MOON, "nativeResolutionM": 30, "licence": "NASA data, public domain (cite NASA/GSFC LOLA team)"},
    "mars": {"source": "NASA/ESA MOLA-HRSC blended DEM 200 m/px (Mars_MOLA_blend200ppx_HRSC_DEM) via NASA Mars Trek", "url": MARS, "nativeResolutionM": 200, "licence": "NASA/ESA/DLR/FU Berlin data; NASA Trek terms (to be verified by the team)"},
}


def get(url, tries=3):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except Exception:
            if k == tries - 1: raise
            time.sleep(2)


def earth(lat, lon):
    dlat = SIZE / 110540.0; dlon = SIZE / (111320.0 * math.cos(math.radians(lat)))
    w, e, s, n = lon - dlon / 2, lon + dlon / 2, lat - dlat / 2, lat + dlat / 2
    names = []
    for la in range(math.floor(s), math.floor(n) + 1):
        for lo in range(math.floor(w), math.floor(e) + 1):
            ns = f"N{la:02d}" if la >= 0 else f"S{-la:02d}"; ew = f"E{lo:03d}" if lo >= 0 else f"W{-lo:03d}"
            names.append(f"Copernicus_DSM_COG_10_{ns}_00_{ew}_00_DEM")
    srcs = []
    for nm in names:
        try: srcs.append(rasterio.open(COP.format(n=nm)))
        except Exception: pass  # no tile = ocean
    if not srcs: return None
    mos, tr = merge(srcs, bounds=(w, s, e, n), nodata=np.nan, dtype="float32")
    dst = np.full((N, N), np.nan, "float32")  # equal-metre grid: equal-angle box sized in metres
    reproject(mos[0], dst, src_transform=tr, src_crs="EPSG:4326", src_nodata=np.nan, dst_transform=from_bounds(w, s, e, n, N, N),
              dst_crs="EPSG:4326", dst_nodata=np.nan, resampling=Resampling.average)
    for x in srcs: x.close()
    return dst


def trek(base, bbox, n_req):
    u = f"{base}/exportImage?bbox={bbox}&size={n_req},{n_req}&pixelType=F32&format=bsq&interpolation=RSP_BilinearInterpolation&f=image"
    b = get(u)
    if len(b) < n_req * n_req * 4: raise RuntimeError("short Trek response")
    a = np.frombuffer(b[: n_req * n_req * 4], "<f4").reshape(n_req, n_req).astype("float64")
    a[(~np.isfinite(a)) | (np.abs(a) > 1e5)] = np.nan
    return a


def block_mean(a, k):
    return np.nanmean(a.reshape(N, k, N, k), axis=(1, 3))


def moon(lat, lon):
    rho = 2 * R_MOON * math.tan(math.radians(90 + lat) / 2)
    x, y = rho * math.sin(math.radians(lon)), rho * math.cos(math.radians(lon)); h = SIZE / 2
    return block_mean(trek(MOON, f"{x-h},{y-h},{x+h},{y+h}", N * 4), 4)  # ~29 m request, averaged to 114.6 m


def mars(lat, lon):
    lon = ((lon + 180) % 360) - 180
    dlat = math.degrees(SIZE / R_MARS); dlon = dlat / math.cos(math.radians(lat))
    return trek(MARS, f"{lon-dlon/2},{lat-dlat/2},{lon+dlon/2},{lat+dlat/2}", N)  # native 200 m, bilinear to 114.6 m


def stats(z):
    if z is None or np.isnan(z).mean() > 0.2: return None
    zf = np.where(np.isnan(z), np.nanmean(z), z)
    gy, gx = np.gradient(zf, STEP)
    sl = np.degrees(np.arctan(np.hypot(gx, gy)))
    yy, xx = np.mgrid[0:N, 0:N]; A = np.c_[xx.ravel(), yy.ravel(), np.ones(N * N)]
    coef, *_ = np.linalg.lstsq(A, zf.ravel(), rcond=None); res = zf.ravel() - A @ coef
    return {"slopeMeanDeg": round(float(sl.mean()), 2), "slopeP90Deg": round(float(np.percentile(sl, 90)), 2),
            "roughnessStdM": round(float(res.std()), 1), "reliefM": round(float(np.nanmax(z) - np.nanmin(z)), 1),
            "nodataFraction": round(float(np.isnan(z).mean()), 3)}


def main():
    d = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(f"{out}/terrain", exist_ok=True)
    pts = {}
    for m in d["missions"]:
        t = m["target"]; pts[f"target-{m['id']}"] = (t["body"], t["lat"], t["lon"], t["name"])
        for s in m["sites"]: pts[s["id"]] = ("earth", s["lat"], s["lon"], s["name"])
    index = {"grid": {"n": N, "sizeM": SIZE, "stepM": round(STEP, 1), "format": "Float32 little-endian, row 0 = north, column 0 = west, metres",
                      "slopeMethod": "central differences on the 96 x 96 grid (114.6 m step), all bodies",
                      "roughnessMethod": "standard deviation of elevation after removing the best-fit plane"}, "sources": SRC, "items": {}}
    for pid, (body, lat, lon, name) in pts.items():
        try:
            z = earth(lat, lon) if body == "earth" else (moon(lat, lon) if body == "moon" else mars(lat, lon))
        except Exception as e:
            z = None; err = str(e)[:120]
        rec = {"name": name, "body": body, "lat": lat, "lon": lon, "file": None, "stats": None, "source": body}
        if z is not None and np.isfinite(z).any():
            zz = np.where(np.isnan(z), np.nanmin(z), z).astype("<f4"); zz.tofile(f"{out}/terrain/{pid}.bin")
            rec.update(file=f"terrain/{pid}.bin", minM=round(float(np.nanmin(z)), 1), maxM=round(float(np.nanmax(z)), 1), stats=stats(z))
            if np.isnan(z).any(): rec["note"] = f"{int(np.isnan(z).sum())} nodata cells filled with the minimum"
        else:
            rec["note"] = "no elevation data" + (f": {err}" if z is None and 'err' in dir() else " (ocean or outside DEM)")
        index["items"][pid] = rec; print(pid, rec.get("stats"))
    json.dump(index, open(f"{out}/terrain-index.json", "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
