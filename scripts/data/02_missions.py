# AI-assisted (Claude), reviewed by team Logos
"""v3: rule fraction + percentile distance to known-analog median; contiguous candidate regions.
Usage: python -I 02_missions.py <out.json>   (method: Shared/logos/datos/method.md, section v3)
"""
import io, json, math, sys, zipfile
import numpy as np, rasterio, shapefile
from rasterio.features import rasterize
from scipy import ndimage
from shapely.geometry import shape, Point

import os
IN = os.environ["LOGOS_IN"]      # inputs folder (see README)
WORK = os.environ.get("LOGOS_WORK", "work")
E = f"{IN}/terra_features_01deg"


def rd(p, k=1.0):
    with rasterio.open(p) as r:
        return r.read(1, masked=True).astype("float64").filled(np.nan) * k, r


def shp(z):
    z = zipfile.ZipFile(z); b = [n[:-4] for n in z.namelist() if n.endswith(".shp")][0]
    r = shapefile.Reader(shp=io.BytesIO(z.read(b + ".shp")), dbf=io.BytesIO(z.read(b + ".dbf")))
    f = [x[0] for x in r.fields[1:]]
    return [(shape(s.shape.__geo_interface__), dict(zip(f, s.record))) for s in r.shapeRecords()]


ndvi, ref = rd(f"{E}/ndvi.tif", 10000); T = ref.transform
lst_day = rd(f"{E}/lst_day.tif")[0]; lst_night = rd(f"{E}/lst_night.tif")[0]
precip = rd(f"{E}/precip.tif")[0]; albedo = rd(f"{E}/albedo.tif")[0]
sand = rd(f"{WORK}/sand_pct_01deg.tif")[0]
H, W = ndvi.shape
lats = T.f + T.e * (np.arange(H) + 0.5); lons = T.c + T.a * (np.arange(W) + 0.5)
countries = shp(f"{IN}/ne_10m_admin_0_countries.zip")
LAND = rasterize([(g, 1) for g, _ in countries], out_shape=(H, W), transform=T, fill=0, dtype="uint8").astype(bool)
for a in (ndvi, lst_day, lst_night, precip, albedo, sand):
    a[~LAND] = np.nan
lst_mean = (lst_day + lst_night) / 2

# GLiM 0.5 deg (Hartmann & Moosdorf 2012, CC BY 3.0): basic volcanic (vb=2) within the 3x3 0.5 deg window
g = np.loadtxt(f"{IN}/glim_wgs84_0point5deg.txt.asc", skiprows=6)
vb = ndimage.maximum_filter((g == 2).astype(float), size=3)
anydata = ndimage.maximum_filter((g > 0).astype(float), size=3)
volc05 = np.where(anydata > 0, vb, np.nan)
gi = np.clip(((90 - lats) / 0.5).astype(int), 0, 359); gj = np.clip(((lons + 180) / 0.5).astype(int), 0, 719)
volcanic = volc05[gi[:, None], gj[None, :]]; volcanic[~LAND] = np.nan

# Low-Sun variables, from latitude only (Cooper 1969 declination on the 15th of each month; no terrain, no refraction)
_DOY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]
_dec = np.array([23.44 * math.sin(math.radians(360 * (284 + d) / 365)) for d in _DOY])
_elev = 90 - np.abs(lats[:, None] - _dec[None, :])                      # noon Sun elevation, rows x 12 months
LOW_SUN_MAX = 12.0                                                      # "low Sun" = noon Sun above the horizon but <= 12 deg
low_sun_months = np.repeat(((_elev > 0) & (_elev <= LOW_SUN_MAX)).sum(1)[:, None].astype("float64"), W, 1)
polar_night_months = np.repeat((_elev <= 0).sum(1)[:, None].astype("float64"), W, 1)
low_sun_months[~LAND] = np.nan; polar_night_months[~LAND] = np.nan
NO_D = {"m4-low-sun"}  # no campaign rehearsed this under a real low Sun: index = mean similarity (unweighted), no known-analog term
# (array, lo, hi, tol, weight, binary)
M = {
    "m1-eva-basalt": {"ndvi": (ndvi, -1, 0.05, 0.10, 1.0, 0), "albedo": (albedo, 0.07, 0.20, 0.06, 1.0, 0),
                      "precip": (precip, 0, 250, 300, 0.5, 0), "volcanic": (volcanic, 1, 1, 0.5, 1.0, 1)},
    "m2-rover-sand": {"sand": (sand, 50, 100, 12, 1.0, 0), "ndvi": (ndvi, -1, 0.05, 0.10, 1.0, 0),
                      "precip": (precip, 0, 150, 250, 0.5, 0), "albedo": (albedo, 0.12, 0.28, 0.08, 0.5, 0)},
    "m3-ground-ice": {"lst_mean": (lst_mean, -100, -5, 6, 1.0, 0), "precip": (precip, 0, 250, 250, 1.0, 0),
                      "albedo": (albedo, 0, 0.5, 0.12, 1.0, 0), "ndvi": (ndvi, -1, 0.10, 0.10, 0.5, 0)},
    "m4-low-sun": {"low_sun_months": (low_sun_months, 2, 12, 1.0, 1.0, 0), "polar_night_months": (polar_night_months, 0, 1, 1.5, 0.5, 0),
                   "ndvi": (ndvi, -1, 0.15, 0.10, 1.0, 0), "albedo": (albedo, 0, 0.35, 0.10, 1.0, 0)},
}
KNOWN = {
    "m1-eva-basalt": [("sp_crater_az", 35.5823524, -111.63186), ("craters_of_the_moon_id", 43.4050421, -113.5060838),
                      ("timanfaya_lanzarote", 29.0216435, -13.7812357), ("kilauea_iki_hi", 19.4148967, -155.25574)],
    "m2-rover-sand": [("dumont_dunes_ca", 35.6810623, -116.2247997), ("yungay_atacama", -24.08, -69.93),
                      ("mdrs_hanksville_ut", 38.4053762, -110.7898833)],
    "m3-ground-ice": [("haughton_crater", 75.3771298, -89.6804276), ("mcmurdo_dry_valleys", -77.5145082, 161.9469821)],
    "m4-low-sun": [("askja_iceland", 65.05, -16.75)],  # known planetary analog (Apollo training, rover tests), NOT a low-Sun rehearsal: sanity check only
}
# every analog site named in misiones.md with a usable location (excluded from 'new'); Black Point is ~40 km from SP Crater
OTHER = [(36.46, -116.87), (19.82, -155.47), (35.58, -111.63), (37.75, 14.99), (17.0, 54.0), (30.6, 34.8), (40.0, 44.6), (28.97, -13.6), (79.5, -91.0), (79.45, 13.3), (38.0, 92.5), (14.24, 40.3)]
# + Axel Heiberg Is. (NASA analog), Svalbard Bockfjorden (AMASE), Qaidam Basin (Mars analog in the literature), Dallol/Danakil (astrobiology analog). Death Valley; Mauna Kea (PISCES); Black Point ~SP; Etna (ARCHES); Dhofar (AMADEE-18); Negev (AMADEE-20); Ararat prov. (AMADEE-24); Lanzarote
# OTHER coordinates are approximate region centres (team estimates), used only for exclusion.
EXCL_KM, MIN_CELLS, NREG, SEP_KM, NCAND = 300, 4, 6, 800, 150

# land percentile per continuous variable
def pct_grid(a):
    v = a[np.isfinite(a)]; s = np.sort(v)
    out = np.full(a.shape, np.nan); ok = np.isfinite(a)
    out[ok] = 100.0 * np.searchsorted(s, a[ok], side="right") / s.size
    return out


def hav(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def near_mask(points, km):
    m = np.zeros((H, W), bool)
    for la, lo in points:
        dlat = km / 111.0; i0, i1 = np.searchsorted(-lats, [-(la + dlat), -(la - dlat)])
        for i in range(max(i0, 0), min(i1 + 1, H)):
            c = max(math.cos(math.radians(lats[i])), 0.01); dlon = km / (111.0 * c)
            js = np.where(np.abs(((lons - lo + 180) % 360) - 180) <= dlon)[0]
            for j in js:
                if hav(la, lo, lats[i], lons[j]) <= km: m[i, j] = True
    return m


allknown = [(la, lo) for v in KNOWN.values() for _, la, lo in v] + OTHER
EXCL = near_mask(allknown, EXCL_KM)
regions_ne = shp(f"{IN}/ne_10m_geography_regions_polys.zip")
out = {}
for mid, spec in M.items():
    P = {k: (v[0] if v[5] else pct_grid(v[0])) for k, v in spec.items()}  # binary: raw 0/1
    met = np.zeros((H, W)); avail = np.zeros((H, W)); wavail = np.zeros((H, W)); wall = sum(v[4] for v in spec.values())
    for k, (a, lo, hi, tol, w, b) in spec.items():
        ok = np.isfinite(a); avail += ok; wavail += np.where(ok, w, 0)
        d = np.where(a < lo, lo - a, np.where(a > hi, a - hi, 0.0))
        met += np.where(ok & (np.exp(-0.5 * (d / tol) ** 2) >= 0.5), 1, 0)
    F = np.where(avail > 0, met / np.maximum(avail, 1), np.nan)
    # median of known analogs (percentile space; binary raw)
    kidx = [(int(np.argmin(np.abs(lats - la))), int(np.argmin(np.abs(((lons - lo + 180) % 360) - 180)))) for _, la, lo in KNOWN[mid]]
    med = {k: float(np.nanmedian([P[k][i, j] for i, j in kidx])) if np.isfinite([P[k][i, j] for i, j in kidx]).any() else np.nan for k in spec}
    dsum = np.zeros((H, W)); dn = np.zeros((H, W))
    for k, (a, lo, hi, tol, w, b) in spec.items():
        if not np.isfinite(med[k]): continue
        d = np.abs(P[k] - med[k]) / (1.0 if b else 100.0); ok = np.isfinite(d)
        dsum += np.where(ok, d, 0); dn += ok
    D = np.where(dn > 0, dsum / np.maximum(dn, 1), np.nan)
    S = 0.5 * F + 0.5 * (1 - D)
    if mid in NO_D:
        num = np.zeros((H, W)); den = np.zeros((H, W))
        for k, (a, lo, hi, tol, w, b) in spec.items():
            d = np.where(a < lo, lo - a, np.where(a > hi, a - hi, 0.0)); ok = np.isfinite(a)
            num += np.where(ok, np.exp(-0.5 * (d / tol) ** 2), 0); den += ok  # unweighted, like F and D
        S = np.where(den > 0, num / np.maximum(den, 1e-9), np.nan); D = np.full((H, W), np.nan)
    S[(wavail < 0.66 * wall) | ~LAND] = np.nan
    Sv = np.sort(S[np.isfinite(S)])
    Spct = lambda x: None if not np.isfinite(x) else round(100 * np.searchsorted(Sv, x, side="right") / Sv.size, 1)

    def cell(i, j):
        pv = {}
        for k, (a, lo, hi, tol, w, b) in spec.items():
            x = a[i, j]
            pv[k] = None if not np.isfinite(x) else {"value": round(float(x), 3), "percentile": None if b else round(float(P[k][i, j]), 1),
                                                    "similarity": round(math.exp(-0.5 * ((lo - x if x < lo else (x - hi if x > hi else 0)) / tol) ** 2), 3), "meetsRule": bool(math.exp(-0.5 * ((lo - x if x < lo else (x - hi if x > hi else 0)) / tol) ** 2) >= 0.5)}
        return {"lat": round(float(lats[i]), 3), "lon": round(float(lons[j]), 3), "ruleFraction": round(float(F[i, j]), 3),
                "percentileDistance": None if not np.isfinite(D[i, j]) else round(float(D[i, j]), 3), "similarity": None if not np.isfinite(S[i, j]) else round(float(S[i, j]), 3),
                "similarityPercentile": Spct(S[i, j]), "perVariable": pv}

    res = {"knownMedian": {k: (None if not np.isfinite(v) else round(v, 1)) for k, v in med.items()}, "landCells": int(Sv.size),
           "known": [], "new": []}
    for (sid, la, lo), (i, j) in zip(KNOWN[mid], kidx):
        res["known"].append({"id": sid, **cell(i, j), "lat": la, "lon": lo})
    ci, cj = int(np.argmin(np.abs(lats + 3.4))), int(np.argmin(np.abs(lons + 60.0)))
    res["control"] = {"id": "amazonia_control", **cell(ci, cj), "lat": -3.4, "lon": -60.0}
    cand = (F >= 0.999) & np.isfinite(S) & ~EXCL
    lab, n = ndimage.label(cand, structure=np.ones((3, 3)))
    regs = []
    for r_id, sl in enumerate(ndimage.find_objects(lab), start=1):
        sub = lab[sl] == r_id; cells = int(sub.sum())
        if cells < MIN_CELLS: continue
        Ssub = np.where(sub, S[sl], -1); k = np.unravel_index(np.argmax(Ssub), Ssub.shape)
        i, j = sl[0].start + k[0], sl[1].start + k[1]
        ii, jj = np.nonzero(sub)
        area = float(sum(11.1 * 11.1 * abs(T.e / 0.1) * math.cos(math.radians(lats[sl[0].start + a])) for a in ii))
        regs.append((float(S[i, j]), cells, i, j, {"cells": cells, "areaKm2": round(area),
                     "bbox": [round(float(lons[sl[1].start + jj.min()]), 2), round(float(lats[sl[0].start + ii.max()]), 2),
                              round(float(lons[sl[1].start + jj.max()]), 2), round(float(lats[sl[0].start + ii.min()]), 2)],
                     "meanSimilarity": round(float(S[sl][sub].mean()), 3)}))
    regs.sort(key=lambda r: (-r[0], -r[1]))
    chosen = []
    for s, cells, i, j, info in regs:
        if any(hav(lats[i], lons[j], lats[a], lons[b]) < SEP_KM for a, b in chosen): continue
        chosen.append((i, j))
        if len(chosen) > NREG: break
        c = cell(i, j); pt = Point(c["lon"], c["lat"])
        reg = next((a.get("NAME_EN") or a.get("NAME") for gg, a in regions_ne if gg.contains(pt)), None)
        res["new"].append({**c, "region": info, "naturalEarthRegion": reg})
    res["candidates"] = []  # ranked regions (no spacing applied) for 02b_screen.py
    for s, cells, i, j, info in regs[:NCAND]:
        c = cell(i, j); pt = Point(c["lon"], c["lat"])
        reg = next((a.get("NAME_EN") or a.get("NAME") for gg, a in regions_ne if gg.contains(pt)), None)
        # alternates: next-best cells of the same region, >= 50 km apart, tried by 02b_screen.py if the best cell fails
        sl = ndimage.find_objects((lab == lab[i, j]).astype(int))[0]; sub = lab[sl] == lab[i, j]
        ii, jj = np.nonzero(sub); order = np.argsort(-S[sl][sub]); alts = [(i, j)]
        for q in order[:4000]:
            a, b = sl[0].start + ii[q], sl[1].start + jj[q]
            if all(hav(lats[a], lons[b], lats[x], lons[y]) >= 50 for x, y in alts): alts.append((a, b))
            if len(alts) == 7: break
        res["candidates"].append({**c, "region": info, "naturalEarthRegion": reg, "alternates": [cell(a, b) for a, b in alts[1:]]})
    res["nRegionsFound"] = len(regs)
    out[mid] = res
json.dump(out, open(sys.argv[1], "w"), indent=1)
for mid, r in out.items():
    print(mid, "regions", r["nRegionsFound"], "median", r["knownMedian"])
    for k in r["known"]: print("  K", k["id"], k["similarity"], k["similarityPercentile"], k["ruleFraction"])
    print("  C", r["control"]["similarity"], r["control"]["similarityPercentile"])
    for k in r["new"]: print("  N", k["lat"], k["lon"], k["similarity"], k["similarityPercentile"], k["region"]["cells"], k["naturalEarthRegion"])
