# AI-assisted (Claude), reviewed by team Logos
"""Reverse-geocode new regions (OpenStreetMap Nominatim, 1 req/s) and write the site list for 04_access.py.
Usage: LOGOS_WORK=... python -I 03_names.py"""
import json, os, time, unicodedata, urllib.request
WORK = os.environ.get("LOGOS_WORK", "work"); UA = {"User-Agent": "space-apps-research-client/1.0", "Accept-Language": "en"}
m = json.load(open(f"{WORK}/missions.json")); names, sites = {}, []
for mid, r in m.items():
    for k in r["known"]:
        if k["id"] not in [s["id"] for s in sites]: sites.append({"id": k["id"], "lat": k["lat"], "lon": k["lon"]})
    for i, n in enumerate(r["new"]):
        sid = n.get("id") or f"{mid}-new{i+1}"; sites.append({"id": sid, "lat": n["lat"], "lon": n["lon"]})
        u = f"https://nominatim.openstreetmap.org/reverse?format=json&zoom=8&accept-language=en&lat={n['lat']}&lon={n['lon']}"
        a = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30)).get("address", {})
        latin = lambda x: x if x and all("LATIN" in unicodedata.name(ch, "") for ch in x if ch.isalpha()) else None  # English/Latin script only
        place = next((p for p in (latin(a.get(k)) for k in ("county", "state_district", "municipality", "region")) if p), None)
        names[sid] = {"place": place, "state": latin(a.get("state")), "country": latin(a.get("country"))}
        time.sleep(1.2)
json.dump(names, open(f"{WORK}/names.json", "w"), indent=1); json.dump(sites, open(f"{WORK}/sites_list.json", "w"))
print(len(sites), "sites")
