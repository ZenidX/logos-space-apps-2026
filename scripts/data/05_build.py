# AI-assisted (Claude), reviewed by team Logos
"""Build sites.json (v4). Usage: python -I 05_build.py [out.json]"""
import json, math
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_common import *
WORK = os.environ.get("LOGOS_WORK", "work")
v3 = json.load(open(f"{WORK}/missions.json")); acc = acc3 = json.load(open(f"{WORK}/access.json")); nm3 = json.load(open(f"{WORK}/names.json"))
SRC["volcanic"] = "GLiM (Hartmann & Moosdorf 2012), 0.5 deg gridded v1.0, class 'vb' (basic volcanic) in the 3x3 0.5 deg window; CC BY 3.0; doi:10.1594/PANGAEA.788537"
NS = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
MB = {
 "m1-eva-basalt": [
  {"text": "Gravity: 1.62 m/s2 on the Moon vs 9.80 on Earth (0.165 g); suits, walking and sampling loads differ.", "source": "NASA NSSDC Moon fact sheet", "url": NS + "moonfact.html"},
  {"text": "Vacuum: lunar surface pressure ~3e-15 bar (night) vs 1014 mb on Earth; no air for cooling or to slow dust.", "source": "NASA NSSDC Moon and Earth fact sheets", "url": NS + "moonfact.html"},
  {"text": "Lighting: at Mons Mouton the Sun stays below ~7 deg (computed from latitude 84.6 S and the 1.54 deg tilt of the lunar equator to the ecliptic); low-latitude Earth sites see it near overhead.", "source": "computed", "url": None},
  {"text": "Rock: the lunar south pole is highland terrain with anorthosite (feldspar-rich rock), not mare basalt; basalt sites train EVA operations, not target composition.", "source": "NASA JSC, Houston We Have a Podcast ep. 236 (D. Kring, LPI)", "url": "https://www.nasa.gov/johnson/HWHAP/moon-geology"}],
 "m2-rover-sand": [
  {"text": "Gravity: 3.73 m/s2 on Mars (0.38 g); a rover weighs ~2.6x more on Earth, so sinkage differs unless mass is reduced (JPL's Scarecrow).", "source": "NASA NSSDC Mars fact sheet; JPL 2012", "url": NS + "marsfact.html"},
  {"text": "Atmosphere: 6.36 mb mean surface pressure on Mars vs 1014 mb on Earth; wind moves sand differently.", "source": "NASA NSSDC Mars fact sheet", "url": NS + "marsfact.html"},
  {"text": "Temperature: Mars average ~-59 C (Viking 1 site range -89 to -31 C); Earth sand deserts are far warmer.", "source": "NASA NSSDC Mars fact sheet", "url": NS + "marsfact.html"}],
 "m3-ground-ice": [
  {"text": "Low pressure (6.36 mb): on Mars drilled ice sublimes instead of melting and refreezing on the bit, unlike Earth permafrost.", "source": "NASA NSSDC Mars fact sheet; Honeybee chamber tests (phys.org 2010)", "url": "https://phys.org/news/2010-06-drilling-mars.html"},
  {"text": "Temperature: Mars average ~-59 C; Arcadia annual mean about -76 C (Mars Climate Database); the Earth sites in this mission have 2024 mean surface temperatures of about -13 to -29 C (MODIS) and a summer thaw layer.", "source": "NASA NSSDC Mars fact sheet; Mars Climate Database v6.2 (http://www-mars.lmd.jussieu.fr/mcd_python/); MODIS 2024 (this dataset)", "url": NS + "marsfact.html"},
  {"text": "Gravity 0.38 g and no liquid precipitation on Mars; Earth polar deserts still get snow.", "source": "NASA NSSDC Mars fact sheet", "url": NS + "marsfact.html"}],
}
MISSIONS["m1-eva-basalt"]["variables"].insert(3, {"id": "volcanic", "label": "Basic volcanic rock nearby (GLiM)", "unit": "0/1", "why": "the EVA campaigns ran on basalt lava fields", "inMatch": True, "ideal": "1", "tolerance": 0.5, "weight": 1.0})
MISSIONS["m1-eva-basalt"]["target"]["values"]["volcanic"] = {"value": None, "unit": "0/1", "source": "not applicable: the rule describes the Earth campaign terrain, not the target (see breaks)", "url": None}
KN = {k: v for k, v in KNOWN_NAMES.items()}


def pv_out(mid, r):
    pv = {}
    for k, v in r["perVariable"].items():
        pv[k] = None if v is None else {**v, "source": SRC[k]}
    if mid == "m1-eva-basalt":
        la = r["lat"]; e = 90 - max(abs(la) - 23.44, 0); w = 90 - abs(la) - 23.44
        pv["sun_max_deg"] = {"value": round(e, 1), "similarity": round(math.exp(-0.5 * ((e - 6.9) / 15) ** 2), 3), "source": SRC["sun_max_deg"], "inMatch": False}
        pv["sun_winter_solstice_deg"] = {"value": round(w, 1), "similarity": None, "source": SRC["sun_winter_solstice_deg"], "inMatch": False}
    return pv


def site_breaks(mid, r, kind):
    b = []
    for k, v in r["perVariable"].items():
        if v and not v["meetsRule"]:
            lab, unit, ideal = VLABEL.get((mid, k), (k, "", "")) if k != "volcanic" else ("Basic volcanic rock nearby", "", "1")
            b.append(f"{lab} {v['value']} {unit} outside the mission range ({ideal})")
    if mid == "m1-eva-basalt" and kind == "new": b.append("Basalt from a 0.5 deg geological map: outcrop not confirmed")
    if mid == "m2-rover-sand" and kind == "new": b.append("Sand fraction is a 5 km model value: dunes not confirmed on imagery")
    if mid == "m3-ground-ice" and kind == "new": b.append("Ground ice inferred from temperature only: no ice or permafrost map used")
    b.append("0.1 deg cell (~11 km): describes the cell, not a specific outcrop")
    return b


def mk(mid, r, kind, sid, name, a, extra):
    country = a.get("country_name")
    if a.get("disputed_area"): country = "Disputed area (boundaries de facto; no position on sovereignty)"
    return {"id": sid, "name": name, "country": country, "lat": r["lat"], "lon": r["lon"], "kind": kind,
            "match": r["similarity"], "ruleFraction": r["ruleFraction"], "percentileDistance": r["percentileDistance"],
            "matchPercentile": r["similarityPercentile"], "perVariable": pv_out(mid, r), **extra,
            "breaks": site_breaks(mid, r, kind), "accessRisk": access(a)}


VAL3 = {
 "m1-eva-basalt": "3 of 4 known analogs in the top 2 % of land cells (SP Crater 99.9, Craters of the Moon 98.6, Timanfaya 99.6); Kilauea Iki 86.4 (11 km cell mostly rainforest). Amazonia control: 31.2th percentile.",
 "m2-rover-sand": "3 of 3 known analogs in the top 2.1 % (Dumont Dunes 100.0, Yungay 97.9, MDRS 100.0). Amazonia control: 1.5th percentile.",
 "m3-ground-ice": "2 of 2 known analogs in the top 1 % (Haughton 99.6, McMurdo Dry Valleys 99.2). Amazonia control: 2.8th percentile. Only 2 verified known sites: weak test.",
}
out = {"generatedWith": "AI-assisted (Claude), reviewed by team Logos", "generatedAt": __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds"),
       "version": "v4", "method": "see method.md (section v3) in the same folder", "missions": []}
for mid, spec in MISSIONS.items():
    r = v3[mid]; sites = []
    for k in r["known"]:
        n, camp = KN[k["id"]]
        sites.append(mk(mid, k, "known", k["id"], n, acc[k["id"]], {"campaign": camp}))
    for i, k in enumerate(r["new"]):
        sid = k.get("id") or f"{mid}-new{i+1}"; nm = nm3.get(sid, {})
        parts = [x for x in [k.get("naturalEarthRegion"), nm.get("place"), nm.get("state")] if x]
        if acc3[sid].get("disputed_area"): parts = [k.get("naturalEarthRegion") or "Unnamed region", "disputed area (no administrative names used)"]
        name = " · ".join(dict.fromkeys(parts)) or "Unnamed region"
        sites.append(mk(mid, k, "new", sid, name, acc3[sid], {"region": k["region"],
                        "nameSource": "Natural Earth geography regions (public domain) + OpenStreetMap Nominatim reverse geocode (ODbL), 2026-11-14"}))
    out["missions"].append({"id": mid, **spec, "breaks": MB[mid], "sites": sites,
        "validation": {"method": "similarity = 0.5 x rule fraction + 0.5 x (1 - percentile distance to the known-analog median); every 0.1 deg land cell scored; percentile of each known analog among all land cells; Amazonia as negative control.",
                       "result": VAL3[mid], "landCells": r["landCells"], "knownMedianPercentiles": r["knownMedian"], "candidateRegionsFound": r["nRegionsFound"],
                       "control": {"match": r["control"]["similarity"], "matchPercentile": r["control"]["similarityPercentile"]}}})
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else f"{WORK}/sites.json", "w"), indent=1, ensure_ascii=False)
print("ok")
