# AI-assisted (Claude), to be reviewed by team Logos
"""Screen the ranked candidate regions of 02_missions.py and pick the new regions shown in the app.
A candidate (its best 0.1 deg cell, 11 x 11 km window) is kept only if:
  1. mean slope <= 10 deg on the common 114.6 m grid (Copernicus DEM GLO-30, same code as 06_terrain.py);
  2. snow/ice <= 10 % and water <= 20 % of the window (ESA WorldCover 2021 v200, 10 m; ocean/no-data counts as water);
     south of 60 S (no WorldCover): the point must lie outside Natural Earth glaciated areas and ice shelves,
     and DEM cells at exactly 0 m (sea) must be <= 20 %;
  3. it is >= 800 km from every region already picked (greedy, in rank order).
If a region's best cell fails, up to 6 more cells of the same region are tried (next best, >= 50 km apart).
Stable ids: site_ids.json (next to this script) maps mission|lat|lon -> id; new picks get the next free number.
Usage: LOGOS_IN=... LOGOS_WORK=... python -I 02b_screen.py     (rewrites work/missions.json "new", writes work/screening.json)
"""
import importlib.util, io, json, math, os, sys, zipfile
import numpy as np, rasterio, shapefile
from rasterio.windows import from_bounds
from shapely.geometry import Point, shape
from shapely.prepared import prep

HERE = os.path.dirname(os.path.abspath(__file__)); IN = os.environ["LOGOS_IN"]; WORK = os.environ.get("LOGOS_WORK", "work")
spec = importlib.util.spec_from_file_location("terrain", os.path.join(HERE, "06_terrain.py")); T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)
MAX_SLOPE, MAX_ICE, MAX_WATER, SEP_KM, NREG = 10.0, 0.10, 0.20, 800, 6
MIN_BARE = {"m4-low-sun": 0.5}  # extra rule per mission: bare/sparse + moss/lichen share of the window (WorldCover classes 60 and 100)
WC = "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{t}_Map.tif"
CLASSES = {10: "tree", 20: "shrub", 30: "grass", 40: "crop", 50: "built", 60: "bare", 70: "snow_ice", 80: "water", 90: "wetland", 95: "mangrove", 100: "moss_lichen", 0: "nodata"}


def polys(name):
    z = zipfile.ZipFile(f"{IN}/{name}.zip"); b = [n[:-4] for n in z.namelist() if n.endswith(".shp")][0]
    r = shapefile.Reader(shp=io.BytesIO(z.read(b + ".shp")), dbf=io.BytesIO(z.read(b + ".dbf")))
    return [prep(shape(s.__geo_interface__)) for s in r.shapes()]


def hav(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def worldcover(lat, lon):
    dlat = T.SIZE / 110540.0; dlon = T.SIZE / (111320.0 * math.cos(math.radians(lat)))
    w, e, s, n = lon - dlon / 2, lon + dlon / 2, lat - dlat / 2, lat + dlat / 2
    counts = {}; found = False
    for la in range(3 * math.floor(s / 3), 3 * math.floor(n / 3) + 1, 3):
        for lo in range(3 * math.floor(w / 3), 3 * math.floor(e / 3) + 1, 3):
            t = ("N" if la >= 0 else "S") + f"{abs(la):02d}" + ("E" if lo >= 0 else "W") + f"{abs(lo):03d}"
            bw, be, bs, bn = max(w, lo), min(e, lo + 3), max(s, la), min(n, la + 3)
            if be <= bw or bn <= bs: continue
            try:
                with rasterio.open(WC.format(t=t)) as r:
                    win = from_bounds(bw, bs, be, bn, r.transform)
                    a = r.read(1, window=win, out_shape=(max(1, int(win.height / 8)), max(1, int(win.width / 8))))  # ~80 m
                    found = True
            except Exception:
                a = np.zeros((max(1, int((bn - bs) * 1500)), max(1, int((be - bw) * 1500))), "uint8")  # no tile = ocean / not mapped
            for v, c in zip(*np.unique(a, return_counts=True)): counts[int(v)] = counts.get(int(v), 0) + int(c)
    tot = sum(counts.values())
    fr = {CLASSES.get(k, str(k)): round(v / tot, 3) for k, v in sorted(counts.items(), key=lambda x: -x[1])}
    return (fr if found else None)


def main():
    m = json.load(open(f"{WORK}/missions.json"))
    ids_path = os.path.join(HERE, "site_ids.json"); ids = json.load(open(ids_path)) if os.path.exists(ids_path) else {}
    glac, shelf = polys("ne_10m_glaciated_areas"), polys("ne_10m_antarctic_ice_shelves_polys")
    log = {"criteria": {"maxMeanSlopeDeg": MAX_SLOPE, "maxSnowIceFraction": MAX_ICE, "maxWaterFraction": MAX_WATER, "minSeparationKm": SEP_KM, "minBareFractionByMission": MIN_BARE, "bareDefinition": "WorldCover classes 60 (bare/sparse vegetation) + 100 (moss and lichen)",
                        "window": "11 x 11 km around the region's best 0.1 deg cell", "landCover": "ESA WorldCover 2021 v200 (10 m, read at ~80 m), CC BY 4.0; south of 60 S: Natural Earth glaciated areas and Antarctic ice shelves (public domain)",
                        "slope": "Copernicus DEM GLO-30 on the 114.6 m grid"}, "missions": {}}
    for mid, r in m.items():
        picked, rows = [], []
        cells = [(rank, k, {**c, **alt} if k else c, (c["lat"], c["lon"])) for rank, c in enumerate(r["candidates"], start=1)
                 for k, alt in enumerate([None] + c.get("alternates", []))]
        done = set()
        for rank, k, c, best in cells:
            if len(picked) == NREG: break
            if rank in done: continue
            la, lo = c["lat"], c["lon"]
            # spacing is decided on the region's best cell (alternates cannot dodge it) and also holds for the cell used
            if any(hav(best[0], best[1], p["lat"], p["lon"]) < SEP_KM or hav(la, lo, p["lat"], p["lon"]) < SEP_KM for p in picked): done.add(rank); continue
            row = {"rank": rank, "cellInRegion": k + 1, "lat": la, "lon": lo, "similarity": c["similarity"], "naturalEarthRegion": c.get("naturalEarthRegion")}
            z = T.earth(la, lo); st = T.stats(z) if z is not None else None
            reasons = []
            if st is None: reasons.append("no elevation data")
            else:
                row["slopeMeanDeg"] = st["slopeMeanDeg"]; row["reliefM"] = st["reliefM"]
                if st["slopeMeanDeg"] > MAX_SLOPE: reasons.append(f"mean slope {st['slopeMeanDeg']} deg > {MAX_SLOPE}")
            if mid in MIN_BARE and la <= -60: reasons.append("no land-cover map south of 60 S for the bare-ground rule")
            if la > -60:
                wc = worldcover(la, lo); row["landCover"] = wc
                if wc is None: reasons.append("no land-cover tile")
                else:
                    ice = wc.get("snow_ice", 0); wat = wc.get("water", 0) + wc.get("nodata", 0)
                    if ice > MAX_ICE: reasons.append(f"snow/ice {100 * ice:.1f} % > {round(100 * MAX_ICE)} %")
                    if wat > MAX_WATER: reasons.append(f"water {100 * wat:.1f} % > {round(100 * MAX_WATER)} %")
                    bare = wc.get("bare", 0) + wc.get("moss_lichen", 0)
                    if mid in MIN_BARE and bare < MIN_BARE[mid]: reasons.append(f"bare ground {100 * bare:.1f} % < {round(100 * MIN_BARE[mid])} %")
            else:
                pt = Point(lo, la); g = any(p.contains(pt) for p in glac); s = any(p.contains(pt) for p in shelf)
                sea = float((z == 0).mean()) if z is not None else None
                row["landCover"] = {"naturalEarthGlaciated": g, "naturalEarthIceShelf": s, "demSeaFraction": None if sea is None else round(sea, 3)}
                if g: reasons.append("inside a Natural Earth glaciated area (ice sheet or glacier)")
                if s: reasons.append("on an ice shelf (Natural Earth)")
                if sea is not None and sea > MAX_WATER: reasons.append(f"sea {100 * sea:.1f} % > {round(100 * MAX_WATER)} %")
            row["verdict"] = "keep" if not reasons else "remove"; row["reasons"] = reasons
            if not reasons:
                key = f"{mid}|{la:.3f}|{lo:.3f}"
                if key not in ids:
                    used = [int(v.rsplit("new", 1)[1]) for k, v in ids.items() if k.startswith(mid + "|")]
                    ids[key] = f"{mid}-new{max(used, default=0) + 1}"
                row["id"] = ids[key]
                done.add(rank); c = {x: y for x, y in c.items() if x != "alternates"}
                picked.append({**c, "id": ids[key], "screen": {"rank": rank, "cellInRegion": k + 1, "slopeMeanDeg": row.get("slopeMeanDeg"), "landCover": row["landCover"]}})
            rows.append(row); print(mid, rank, k + 1, la, lo, row["verdict"], row.get("id", ""), row.get("slopeMeanDeg"), reasons, flush=True)
        r["new"] = picked; log["missions"][mid] = rows
    json.dump(ids, open(ids_path, "w"), indent=1)
    json.dump(m, open(f"{WORK}/missions.json", "w"), indent=1); json.dump(log, open(f"{WORK}/screening.json", "w"), indent=1)


if __name__ == "__main__":
    main()
