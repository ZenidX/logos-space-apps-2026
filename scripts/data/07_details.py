# AI-assisted (Claude), to be reviewed by team Logos
"""Per-site details for the comparison view: WHEN (noon Sun, daylight, monthly temperature) and HOW
(campaign sentence for known sites; nearest city, travel time and large airport for all sites).
Usage: LOGOS_IN=... python -I 07_details.py <sites.json> <terrain-index.json> <out site-details.json>
Inputs in LOGOS_IN: access_hours.tif (team 0.1 deg export of Oxford MAP 2015), ne_10m_populated_places.zip,
ourairports_airports.csv. Live: NASA POWER climatology API (no key).
"""
import csv, io, json, math, os, sys, time, urllib.request, zipfile
import numpy as np, rasterio, shapefile

IN = os.environ["LOGOS_IN"]; UA = {"User-Agent": "space-apps-research-client/1.0"}
MONTH_DAY15 = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]  # day of year of the 15th (non-leap)
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
POWER = "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=TS,T2M&community=RE&longitude={lon}&latitude={lat}&format=JSON"

CAMPAIGN = {
    "sp_crater_az": ("NASA's JETT3 (Oct 2022) and JETT5 (May 2024) ran simulated Artemis moonwalks here, some at night under artificial low-angle light.",
                     ["https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log", "https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field"]),
    "craters_of_the_moon_id": ("NASA's BASALT team did volcanology and microbiology field sampling here in 2016 for simulated Mars EVAs.",
                               ["https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/"]),
    "timanfaya_lanzarote": ("ESA's PANGAEA course trains astronauts in field geology and traverses on Lanzarote's volcanic terrain.",
                            ["https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/CAVES_and_PANGAEA/What_is_PANGAEA"]),
    "kilauea_iki_hi": ("BASALT's final deployment (Nov 2017) ran science EVAs on Mars-relevant lava flows in Hawai'i Volcanoes National Park; Kilauea Iki itself is not named in the source.",
                       ["https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/"]),
    "dumont_dunes_ca": ("JPL drove Scarecrow, a mobility test rover for Curiosity, up and down dune slopes here in May 2012.",
                        ["https://www.jpl.nasa.gov/news/mojave-desert-tests-prepare-for-nasa-mars-roving/"]),
    "yungay_atacama": ("NASA's ARADS project (2015-2019) tested a rover with a 1 m drill and life-detection instruments in the Atacama at Yungay.",
                       ["https://ntrs.nasa.gov/citations/20220002136"]),
    "mdrs_hanksville_ut": ("The Mars Society runs crewed Mars-simulation rotations at its Mars Desert Research Station near Hanksville (location from OpenStreetMap).",
                           ["https://www.marssociety.org/"]),
    "haughton_crater": ("NASA Ames drilled about 11 m with the TRIDENT drill here in August 2024, 4 m of it into ice-cemented ground.",
                        ["https://ntrs.nasa.gov/api/citations/20250004164/downloads/LSIC25-Glass_abst2.docx"]),
    "mcmurdo_dry_valleys": ("NASA's ASTEP project IceBite (selected 2008) planned to test a ground-ice auger in University Valley in the Dry Valleys; the field outcome is not verified here.",
                            ["https://astrobiology.nasa.gov/news/new-astep-projects-reach-from-arctic-to-antarctic-mars-to-europa/"]),
}


def hav(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def decl_earth(n):  # Cooper (1969): degrees
    return 23.44 * math.sin(math.radians(360 * (284 + n) / 365))


def noon_elev(lat, dec):
    return 90 - abs(lat - dec)  # <= 0: Sun stays below the horizon at noon (polar night)


def daylight_h(lat, dec):
    x = -math.tan(math.radians(lat)) * math.tan(math.radians(dec))
    return 24.0 if x <= -1 else (0.0 if x >= 1 else 2 * math.degrees(math.acos(x)) / 15)


def load_places():
    z = zipfile.ZipFile(f"{IN}/ne_10m_populated_places.zip"); b = [n[:-4] for n in z.namelist() if n.endswith(".shp")][0]
    r = shapefile.Reader(shp=io.BytesIO(z.read(b + ".shp")), dbf=io.BytesIO(z.read(b + ".dbf")))
    f = [x[0] for x in r.fields[1:]]; out = []
    for rec in r.records():
        d = dict(zip(f, rec))
        if (d.get("POP_MAX") or 0) >= 50000:
            out.append((d["NAME"], d.get("ADM0NAME"), float(d["LATITUDE"]), float(d["LONGITUDE"]), int(d["POP_MAX"])))
    return out


def load_airports():
    out = []
    for row in csv.DictReader(open(f"{IN}/ourairports_airports.csv", encoding="utf-8")):
        if row["type"] == "large_airport":
            out.append((row["name"], row["iata_code"] or None, row["iso_country"], float(row["latitude_deg"]), float(row["longitude_deg"])))
    return out


def power(lat, lon):
    try:
        with urllib.request.urlopen(urllib.request.Request(POWER.format(lat=lat, lon=lon), headers=UA), timeout=90) as r:
            p = json.load(r)["properties"]["parameter"]
        f = lambda k: [None if p[k][m] == -999 else p[k][m] for m in MONTHS]
        return {"surfaceTempC": f("TS"), "airTemp2mC": f("T2M")}
    except Exception as e:
        return {"error": str(e)[:80]}


def main():
    sites = json.load(open(sys.argv[1])); terr = json.load(open(sys.argv[2]))["items"]
    places, airports = load_places(), load_airports()
    acc = rasterio.open(f"{IN}/access_hours.tif"); A = acc.read(1, masked=True)
    out = {"generatedWith": "AI-assisted (Claude), to be reviewed by team Logos", "sources": {
        "sun": "computed: declination by Cooper (1969) for the 15th of each month; noon elevation = 90 - |lat - declination|; daylight from the sunrise hour angle (no refraction, no terrain)",
        "temperature": "NASA POWER Climatology API v2.10.1 (MERRA-2, 2001-2025 monthly climatology, 0.5 x 0.625 deg), parameters TS (earth skin temperature) and T2M (air at 2 m), retrieved 2026-11-14. Data obtained from the NASA Langley Research Center POWER Project funded through the NASA Earth Science Division",
        "temperatureUrl": "https://power.larc.nasa.gov/docs/referencing/",
        "travelTime": "Weiss et al. 2018, Nature 553:333, doi:10.1038/nature25181 (Oxford MAP accessibility to cities 2015), CC BY 4.0; team 0.1 deg cell mean",
        "city": "Natural Earth 10m populated places (public domain), POP_MAX >= 50,000; straight-line (great-circle) distance",
        "airport": "OurAirports airports.csv (public domain), type large_airport; straight-line (great-circle) distance; 'large' is OurAirports' class, not an official international status",
        "marsSun": "computed: solar declination = asin(sin 25.19 deg * sin Ls) (Mars obliquity 25.19 deg, NASA NSSDC); noon elevation = 90 - |lat - declination|"}, "items": {}}
    for m in sites["missions"]:
        t = m["target"]; tid = f"target-{m['id']}"
        rec = {"name": t["name"], "body": t["body"], "terrain": terr.get(tid)}
        if t["body"] == "moon":
            rec["when"] = {"sunNoonMaxDeg": round(90 - (abs(t["lat"]) - 1.54), 1), "sunNoonMinDeg": round(90 - abs(t["lat"]) - 1.54, 1),
                           "note": "computed from latitude and the 1.54 deg tilt of the lunar equator to the ecliptic; terrain ignored. A lunar day lasts about 29.5 Earth days"}
        else:
            ls = list(range(0, 360, 30)); dec = [math.degrees(math.asin(math.sin(math.radians(25.19)) * math.sin(math.radians(x)))) for x in ls]
            rec["when"] = {"ls": ls, "sunNoonDeg": [round(noon_elev(t["lat"], d), 1) for d in dec],
                           "daylightHoursMars": [round(daylight_h(t["lat"], d) * 24.66 / 24, 1) for d in dec],
                           "note": "Ls = solar longitude (season); daylight in Earth hours of a 24.66 h sol; no atmosphere refraction, no terrain"}
        out["items"][tid] = rec
        for s in m["sites"]:
            if s["id"] in out["items"]: continue
            la, lo = s["lat"], s["lon"]
            dec = [decl_earth(n) for n in MONTH_DAY15]
            r = {"name": s["name"], "body": "earth", "kind": s["kind"], "terrain": terr.get(s["id"]),
                 "when": {"months": MONTHS, "sunNoonDeg": [round(noon_elev(la, d), 1) for d in dec],
                          "daylightHours": [round(daylight_h(la, d), 1) for d in dec], **power(la, lo)}}
            time.sleep(1.0)
            i, j = acc.index(lo, la); h = A[i, j]
            c = min(places, key=lambda p: hav(la, lo, p[2], p[3])); a = min(airports, key=lambda p: hav(la, lo, p[3], p[4]))
            how = {"nearestCity50k": {"name": c[0], "country": c[1], "population": c[4], "straightLineKm": round(hav(la, lo, c[2], c[3]))},
                   "travelTimeToCityHours": None if np.ma.is_masked(h) else round(float(h), 1),
                   "nearestLargeAirport": {"name": a[0], "iata": a[1], "country": a[2], "straightLineKm": round(hav(la, lo, a[3], a[4]))}}
            if np.ma.is_masked(h): how["travelTimeNote"] = "not available (Oxford MAP covers 85N-60S)"
            if s["id"] in CAMPAIGN: how["campaign"] = {"text": CAMPAIGN[s["id"]][0], "urls": CAMPAIGN[s["id"]][1]}
            r["how"] = how; out["items"][s["id"]] = r; print(s["id"], how["nearestCity50k"]["name"], how["travelTimeToCityHours"], a[0][:30])
    json.dump(out, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
