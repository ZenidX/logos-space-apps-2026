# AI-assisted (Claude), reviewed by team Logos
"""access_complexity per site (design: Shared/logos/datos/geopolitica.md; legal rules:
Shared/logos/legal/informe-geopolitica.md). Usage:
python -I 04_access.py <sites.json> <inputs_dir>  -> JSON on stdout
"""
import os, csv, io, json, math, re, sys, time, urllib.parse, urllib.request, zipfile
import openpyxl, shapefile
from shapely.geometry import Point, shape

W = {"G": 0.40, "C": 0.35, "A": 0.25}  # design choice by team Logos, adjustable
UK_MAP = {"": 0.0, "avoid_all_but_essential_travel_to_parts": 0.33, "avoid_all_travel_to_parts": 0.5,
          "avoid_all_but_essential_travel_to_whole_country": 0.67, "avoid_all_travel_to_whole_country": 1.0}
UK_SLUG = {"USA": "usa", "ESP": "spain", "CAN": "canada", "CHL": "chile", "BRA": "brazil"}
US_NAME = {"ESP": "Spain", "CAN": "Canada", "CHL": "Chile", "BRA": "Brazil"}  # match on advisory Title
UA = {"User-Agent": "space-apps-research-client/1.0"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def shapes(zpath):
    z = zipfile.ZipFile(zpath)
    base = [n[:-4] for n in z.namelist() if n.endswith(".shp")][0]
    r = shapefile.Reader(shp=io.BytesIO(z.read(base + ".shp")), dbf=io.BytesIO(z.read(base + ".dbf")))
    f = [x[0] for x in r.fields[1:]]
    return [(shape(s.shape.__geo_interface__), dict(zip(f, s.record))) for s in r.shapeRecords()]


def hav(lat1, lon1, lat2, lon2):
    p = math.pi / 180
    a = math.sin((lat2 - lat1) * p / 2) ** 2 + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(a))


def ucdp_events(d):
    ev = []
    z = zipfile.ZipFile(f"{d}/ged261-csv.zip")
    name = [n for n in z.namelist() if n.endswith(".csv")][0]
    for row in csv.DictReader(io.TextIOWrapper(z.open(name), encoding="utf-8")):
        if int(row["year"]) >= 2021:
            ev.append((float(row["latitude"]), float(row["longitude"]), 1.0))
    for row in csv.DictReader(open(f"{d}/GEDEvent_v26_0_9.csv", encoding="utf-8")):
        if row["date_start"][:4] == "2026":
            ev.append((float(row["latitude"]), float(row["longitude"]), 0.5))
    return ev


def main():
    sites, d = json.load(open(sys.argv[1])), sys.argv[2]
    countries, disputed = shapes(f"{d}/ne_10m_admin_0_countries.zip"), shapes(f"{d}/ne_10m_admin_0_disputed_areas.zip")
    wb = openpyxl.load_workbook(os.path.join(d, "wgidataset_with_sourcedata-2026.xlsx"), read_only=True)
    ws = wb["pv"]; rows = ws.iter_rows(values_only=True); hdr = None
    wgi = {}
    for r in rows:
        if hdr is None:
            if r and "Economy (code)" in r: hdr = list(r)
            continue
        rec = dict(zip(hdr, r))
        if str(rec.get("Year")) == "2025" and rec.get("Governance score (0-100)") not in (None, ".."):
            wgi[rec["Economy (code)"]] = (float(rec["Governance score (0-100)"]), rec.get("Standard error (gov. score)"))
    us = json.load(open(f"{d}/us_travel_advisories.json"))
    ev = ucdp_events(d)
    global UK_INDEX
    UK_INDEX = json.loads(get("https://www.gov.uk/api/content/foreign-travel-advice"))["links"]["children"]
    out = {}
    for s in sites:
        lat, lon = s["lat"], s["lon"]; pt = Point(lon, lat)
        ca = next((a for g, a in countries if g.contains(pt)), {})
        iso = ca.get("ADM0_A3"); cnames = {ca.get("NAME"), ca.get("ADMIN"), ca.get("NAME_LONG"), ca.get("SOVEREIGNT")} - {None}
        disp = any(g.contains(pt) for g, _ in disputed)
        rec_iso = None
        rec = {"country_iso3_de_facto": None, "country_name": ca.get("NAME"), "disputed_area": disp}
        # C: nearby organised-violence events
        ssum = sum(w * math.exp(-dk / 50) for (la, lo, w) in ev if abs(la - lat) < 3 and (dk := hav(lat, lon, la, lo)) <= 200)
        C = 1 - math.exp(-ssum)
        comp = {"C": round(C, 3)}
        rec["ucdp_weighted_events_200km"] = round(ssum, 3)
        if lat < -60:
            rec.update(G=None, A=None, C=comp["C"], access_complexity=None, coverage=None,
                       status="not computed: Antarctic Treaty area (no country attributed, Art. IV)",
                       permit_flag="ANTARCTIC_TREATY_AREA", aspa_check="not checked (AADC download needs a browser)")
            us_ant = next((a for a in us if a["Title"].startswith("Antarctica")), None)
            rec["us_advisory"] = None if us_ant is None else {"level": int(re.search(r"Level (\d)", us_ant["Title"]).group(1)), "updated": us_ant.get("Updated")}
            out[s["id"]] = rec; continue
        if not disp and iso in wgi:
            g, se = wgi[iso]; comp["G"] = round(1 - g / 100, 3)
            rec["wgi_pv_2025_score_0_100"] = g; rec["wgi_pv_2025_se"] = se
        a_parts = []
        rec["country_iso3_de_facto"] = iso
        if not disp and iso != "USA":
            hit = next((a for a in us if a["Title"].split(" - Level")[0].strip() in cnames), None)
            rec["us_advisory"] = None if hit is None else rec.get("us_advisory")
            if hit:
                L = int(re.search(r"Level (\d)", hit["Title"]).group(1))
                a_parts.append((L - 1) / 3); rec["us_advisory"] = {"label": f"US level {L} of 4", "updated": hit.get("Updated")}
        elif iso == "USA":
            rec["us_advisory"] = "n/a (site is in the US)"
        cn = cnames | {"USA"} if iso == "USA" else cnames
        slug = next((c["base_path"] for c in UK_INDEX if c["title"].removesuffix(" travel advice") in cn
                     or c.get("details", {}).get("country", {}).get("name") in cn), None)
        if not disp and slug:
            uk = json.loads(get(f"https://www.gov.uk/api/content{slug}"))
            st = uk.get("details", {}).get("alert_status") or []
            key = st[0] if st else ""
            a_parts.append(UK_MAP.get(key, None) if key in UK_MAP else None)
            rec["uk_advisory"] = {"alert_status": st, "updated": uk.get("public_updated_at"),
                                  "note": "country-level advisory mentions specific regions; see source" if key.endswith("_parts") else None}
            time.sleep(0.5)
        a_parts = [x for x in a_parts if x is not None]
        if a_parts: comp["A"] = round(sum(a_parts) / len(a_parts), 3)
        avail = {k: v for k, v in comp.items() if v is not None}
        cov = len(avail) / 3
        score = sum(W[k] * v for k, v in avail.items()) / sum(W[k] for k in avail)
        rec.update(G=comp.get("G"), C=comp["C"], A=comp.get("A"), coverage=round(cov, 2),
                   access_complexity=round(score, 3) if cov >= 2 / 3 else None,
                   status="ok" if cov >= 2 / 3 else "not computed (missing sources)")
        rec["permit_flag"] = "NONE"
        out[s["id"]] = rec
    json.dump(out, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
