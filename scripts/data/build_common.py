# AI-assisted (Claude), reviewed by team Logos
"""Shared definitions: sources, credits, mission specs, accessRisk text."""
"""Build Shared/logos/datos/sites.json in Logos Lider's schema (v2)."""
import json, math

SRC = {
    "ndvi": "NASA MODIS MOD13C1 v061, 2024 mean, 0.1 deg (public domain)",
    "albedo": "NASA MODIS MCD43C3 v061 white-sky shortwave albedo, 2024 mean, 0.1 deg (public domain)",
    "precip": "NASA GPM IMERG V07 monthly, 2024 mean, 0.1 deg (public domain)",
    "lst_mean": "NASA MODIS MOD11A2 v061, mean of 2024 day and night LST, 0.1 deg (public domain)",
    "low_sun_months": "computed from latitude: months (15th of each month) with the noon Sun above the horizon and at most 12 deg; declination by Cooper (1969); no terrain, no refraction",
    "polar_night_months": "computed from latitude: months (15th) with the noon Sun at or below the horizon",
    "sand": "ISRIC SoilGrids 2.0 sand 0-5 cm, 5 km aggregate regridded to 0.1 deg (CC BY 4.0); model prediction",
    "sun_max_deg": "computed from latitude (Earth obliquity 23.44 deg); no dataset",
    "sun_winter_solstice_deg": "computed from latitude (Earth obliquity 23.44 deg); no dataset",
}
URL = {"ndvi": "https://lpdaac.usgs.gov/products/mod13c1v061/", "albedo": "https://lpdaac.usgs.gov/products/mcd43c3v061/",
       "precip": "https://gpm.nasa.gov/data/imerg", "lst_mean": "https://lpdaac.usgs.gov/products/mod11a2v061/",
       "sand": "https://www.isric.org/explore/soilgrids"}
CREDITS = [
    "World Bank, Worldwide Governance Indicators, 2026 update (2025 data), CC BY 4.0 - perceptions-based and inherently subjective",
    "UCDP GED Global 26.1 + Candidate v26.0.9, Uppsala Conflict Data Program, CC BY 4.0",
    "U.S. Department of State, travel.state.gov (retrieved 2026-11-14). Travel advice from two governments (US, UK); other governments may assess differently.",
    "UK FCDO foreign travel advice, gov.uk/foreign-travel-advice (retrieved 2026-11-14). Contains public sector information licensed under the Open Government Licence v3.0.",
    "Boundaries are de facto (Natural Earth) and imply no position on sovereignty",
    "Weights and level thresholds are a design choice by team Logos, adjustable. Not travel advice.",
]

C = lambda n, u: {"name": n, "url": u}
MISSIONS = {
 "m1-eva-basalt": {
  "title": "Suited EVA on volcanic terrain",
  "campaigns": [C("NASA JETT3 (2022)", "https://www.nasa.gov/humans-in-space/nasa-to-practice-artemis-moonwalking-roving-operations-in-arizona-desert"),
                C("NASA JETT5 (2024)", "https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field"),
                C("NASA Desert RATS (2022, with JAXA)", "https://www.nasa.gov/humans-in-space/nasa-practices-rover-operations-in-simulated-lunar-environment/"),
                C("NASA BASALT (2016-2017)", "https://www.nasa.gov/general/basalt-research-program-hawaii-2017-field-deployment/"),
                C("ESA PANGAEA", "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/CAVES_and_PANGAEA/What_is_PANGAEA")],
  "target": {"body": "moon", "name": "Mons Mouton (lunar south pole)", "lat": -84.60, "lon": 31.00,
             "description": "A lunar south-pole region NASA listed among its Artemis III landing candidates in 2024. NASA now describes Artemis III as a crewed demonstration in low Earth orbit (launch 2027), with lunar landings beginning with Artemis IV.",
             "descriptionSources": [{"name": "NASA (2024): update to 9 Artemis III landing regions", "url": "https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/"}, {"name": "NASA Artemis III mission page (read 2026-11-14)", "url": "https://www.nasa.gov/mission/artemis-III/"}],
             "coordSource": "USGS Gazetteer Feature 16070, https://planetarynames.wr.usgs.gov/Feature/16070",
             "values": {"ndvi": {"value": 0, "unit": "index", "source": "no vegetation (by definition)", "url": None},
                        "albedo": {"value": 0.15, "unit": "0-1", "source": "estimate: broadband albedo = 0.49 x LOLA 1064 nm normal albedo (Hayne et al. 2017, doi:10.1002/2017JE005387) with typical highland normal albedo ~0.3 (Lucey et al. 2014, doi:10.1002/2013JE004592); not a site-specific measurement", "url": "https://doi.org/10.1002/2017JE005387"},
                        "precip": {"value": 0, "unit": "mm/yr", "source": "airless body", "url": None},
                        "sun_max_deg": {"value": 6.9, "unit": "deg", "source": "computed: 90 - (84.6 - 1.54); lunar equator tilt to the ecliptic 1.54 deg (Cassini state); terrain and summit height ignored", "url": None},
                        "sun_winter_solstice_deg": {"value": 3.9, "unit": "deg", "source": "computed: 90 - 84.6 - 1.54", "url": None}}},
  "variables": [
   {"id": "ndvi", "label": "Vegetation (NDVI)", "unit": "index", "why": "EVA analogs need bare rock; target has none", "inMatch": True, "ideal": "<= 0.05", "tolerance": 0.10, "weight": 1.0},
   {"id": "albedo", "label": "Surface albedo", "unit": "0-1", "why": "dark ground like lunar regolith (broadband ~0.15, estimate)", "inMatch": True, "ideal": "0.07-0.20", "tolerance": 0.06, "weight": 1.0},
   {"id": "precip", "label": "Precipitation", "unit": "mm/yr", "why": "arid ground stays bare and unweathered", "inMatch": True, "ideal": "<= 250", "tolerance": 300, "weight": 0.5},
   {"id": "sun_max_deg", "label": "Highest noon Sun elevation in the year", "unit": "deg", "why": "south-pole EVAs work under a Sun always near the horizon (JETT3/5 used a 'sun cart')", "inMatch": False, "ideal": "~6.9", "tolerance": 15, "weight": 0},
   {"id": "sun_winter_solstice_deg", "label": "Noon Sun elevation at winter solstice", "unit": "deg", "why": "<= 0 means polar night", "inMatch": False, "weight": 0},
   {"id": "slope", "label": "Slope", "unit": "deg", "why": "walkable terrain; needs Copernicus DEM 30 m (not available tonight)", "inMatch": False, "value": None}]},
 "m2-rover-sand": {
  "title": "Rover mobility on loose sand and slopes",
  "campaigns": [C("JPL Scarecrow at Dumont Dunes (2012)", "https://www.jpl.nasa.gov/news/mojave-desert-tests-prepare-for-nasa-mars-roving/"),
                C("ESA SAFER, Atacama (2013)", "https://www.esa.int/Enabling_Support/Space_Engineering_Technology/ESA_rover_completes_exploring_Mars-like_desert"),
                C("NASA ARADS, Atacama (2015-2019)", "https://www.nasa.gov/image-article/astrobiology-technology-atacama-rover-astrobiology-drilling-studies/"),
                C("Mars Society MDRS, Utah", "https://www.marssociety.org/")],
  "target": {"body": "mars", "name": "Jezero crater", "lat": 18.4, "lon": 77.7,
             "coordSource": "USGS Gazetteer Feature 14300: 18.4082 N, 77.6873 E (planetocentric, +East), https://planetarynames.wr.usgs.gov/Feature/14300",
             "values": {"sand": {"value": None, "unit": "%", "source": "no comparable measurement found; scored against mission need (loose sand), not a Mars value", "url": None},
                        "ndvi": {"value": 0, "unit": "index", "source": "no vegetation", "url": None},
                        "precip": {"value": 0, "unit": "mm/yr", "source": "no liquid precipitation", "url": None},
                        "albedo": {"value": 0.18, "unit": "0-1", "source": "MGS TES bolometric (Lambert) albedo, 8 ppd global map, mean of 18.2-18.7N/77.3-77.9E (Christensen et al. 2001, doi:10.1029/2000JE001370; PDS GLOBAL_ALBEDO_8PPD). In-situ MEDA noon albedo 0.10-0.23 (Vicente-Retortillo et al. 2026, doi:10.5194/epsc2026-1140)", "url": "https://doi.org/10.1029/2000JE001370"}}},
  "variables": [
   {"id": "sand", "label": "Sand fraction (topsoil)", "unit": "%", "why": "loose sand is where rovers sink and slip (Spirit was lost in soft soil)", "inMatch": True, "ideal": ">= 50", "tolerance": 12, "weight": 1.0},
   {"id": "ndvi", "label": "Vegetation (NDVI)", "unit": "index", "why": "plants bind sand; Mars has none", "inMatch": True, "ideal": "<= 0.05", "tolerance": 0.10, "weight": 1.0},
   {"id": "precip", "label": "Precipitation", "unit": "mm/yr", "why": "dry, uncemented sand", "inMatch": True, "ideal": "<= 150", "tolerance": 250, "weight": 0.5},
   {"id": "albedo", "label": "Surface albedo", "unit": "0-1", "why": "Mars-like brightness (Jezero TES albedo ~0.18)", "inMatch": True, "ideal": "0.12-0.28", "tolerance": 0.08, "weight": 0.5},
   {"id": "slope", "label": "Slope", "unit": "deg", "why": "dune slopes; needs Copernicus DEM 30 m (not available tonight)", "inMatch": False, "value": None}]},
 "m3-ground-ice": {
  "title": "Shallow ground ice for ISRU and drilling",
  "campaigns": [C("NASA TRIDENT drill at Haughton (2024)", "https://ntrs.nasa.gov/api/citations/20250004164/downloads/LSIC25-Glass_abst2.docx"),
                C("IceBite, University Valley, Antarctica (NASA ASTEP, selected 2008)", "https://astrobiology.nasa.gov/news/new-astep-projects-reach-from-arctic-to-antarctic-mars-to-europa/"),
                C("NASA/CSA RESOLVE at Mauna Kea (2010)", "https://ntrs.nasa.gov/citations/20100033667")],
  "target": {"body": "mars", "name": "Arcadia Planitia", "lat": 46.66, "lon": 192.00,
             "coordSource": "USGS Gazetteer Feature 348 web page (planetocentric, +East 0-360), https://planetarynames.wr.usgs.gov/Feature/348; the gazetteer GIS file gives 49.02 N, 188.15 E. Arcadia spans ~2,245 km, so the centre is nominal",
             "values": {"lst_mean": {"value": -76, "unit": "degC", "source": "annual and diurnal mean surface temperature (197 K) at 46.7N, 192E, Mars Climate Database v6.2 (climatology, average solar scenario; all Ls in 15 deg steps, all local times, equal Ls weighting); Mars Climate Database (c) LMD/OU/IAA/ESA/CNES. Model value", "url": "http://www-mars.lmd.jussieu.fr/mcd_python/"},
                        "precip": {"value": 0, "unit": "mm/yr", "source": "no liquid precipitation", "url": None},
                        "albedo": {"value": 0.23, "unit": "0-1", "source": "MGS TES bolometric (Lambert) albedo, 8 ppd global map, mean of 47-49N/188-192E (Christensen et al. 2001, doi:10.1029/2000JE001370; PDS GLOBAL_ALBEDO_8PPD)", "url": "https://doi.org/10.1029/2000JE001370"},
                        "ndvi": {"value": 0, "unit": "index", "source": "no vegetation", "url": None},
                        "ice": {"value": None, "unit": "", "source": "SWIM ice-consistency map exists (1/20 deg GeoTIFF) but server was down on 2026-11-14", "url": "https://swim.psi.edu/"}}},
  "variables": [
   {"id": "lst_mean", "label": "Mean surface temperature", "unit": "degC", "why": "ground ice persists where the mean is below freezing (permafrost proxy)", "inMatch": True, "ideal": "<= -5", "tolerance": 6, "weight": 1.0},
   {"id": "precip", "label": "Precipitation", "unit": "mm/yr", "why": "polar desert: ice in the ground, not snow on top", "inMatch": True, "ideal": "<= 250", "tolerance": 250, "weight": 1.0},
   {"id": "albedo", "label": "Surface albedo", "unit": "0-1", "why": "excludes ice sheets and glaciers (~0.8); Arcadia is dark ground (TES albedo ~0.23) over ice", "inMatch": True, "ideal": "<= 0.5", "tolerance": 0.12, "weight": 1.0},
   {"id": "ndvi", "label": "Vegetation (NDVI)", "unit": "index", "why": "bare ground", "inMatch": True, "ideal": "<= 0.10", "tolerance": 0.10, "weight": 0.5}]},
}
MISSIONS["m4-low-sun"] = {
  "title": "Low-Sun operations and solar power",
  "campaigns": [C("NASA JETT3 (2022): night moonwalks with a lighting cart", "https://www.nasa.gov/feature/moonwalking-test-mission-daily-field-log"),
                C("NASA JETT5 (2024): night EVAs with a portable spotlight acting as the Sun", "https://www.usgs.gov/centers/astrogeology-science-center/news/artemis-iii-mission-tests-san-francisco-volcanic-field"),
                C("NASA Ames Lunar Lab and regolith testbeds (low-angle lighting for VIPER)", "https://www.nasa.gov/centers-and-facilities/ames/the-lunar-lab-and-regolith-testbeds/"),
                C("Apollo geology field training in Iceland (1965, 1967; NASA SP-2015-626): known analog, not a low-Sun rehearsal", "https://ntrs.nasa.gov/citations/20190026783")],
  "target": {"body": "moon", "name": "Mons Mouton (lunar south pole)", "lat": -84.60, "lon": 31.00,
             "description": MISSIONS["m1-eva-basalt"]["target"]["description"], "descriptionSources": MISSIONS["m1-eva-basalt"]["target"]["descriptionSources"],
             "coordSource": "USGS Gazetteer Feature 16070, https://planetarynames.wr.usgs.gov/Feature/16070",
             "values": {"low_sun_months": {"value": 12, "unit": "months/yr", "source": "computed: at 84.6 S the noon Sun stays between about 3.9 and 6.9 deg all year (latitude and the 1.54 deg tilt of the lunar equator to the ecliptic); terrain ignored", "url": None},
                        "polar_night_months": {"value": None, "unit": "months/yr", "source": "not computed: darkness at the lunar pole depends on local terrain (illumination maps not processed)", "url": None},
                        "ndvi": {"value": 0, "unit": "index", "source": "no vegetation (by definition)", "url": None},
                        "albedo": MISSIONS["m1-eva-basalt"]["target"]["values"]["albedo"]}},
  "variables": [
   {"id": "low_sun_months", "label": "Months with a low noon Sun (0-12 deg)", "unit": "months/yr", "why": "a real low Sun is what crews and solar arrays face at the lunar pole; campaigns so far had to simulate it at night", "inMatch": True, "ideal": ">= 2", "tolerance": 1.0, "weight": 1.0},
   {"id": "polar_night_months", "label": "Months with the Sun below the horizon at noon", "unit": "months/yr", "why": "long polar night stops solar power and daylight work; candidate lunar sites are chosen for near-continuous light", "inMatch": True, "ideal": "<= 1", "tolerance": 1.5, "weight": 0.5},
   {"id": "ndvi", "label": "Vegetation (NDVI)", "unit": "index", "why": "bare ground, so shadows fall on rock and soil", "inMatch": True, "ideal": "<= 0.15", "tolerance": 0.10, "weight": 1.0},
   {"id": "albedo", "label": "Surface albedo", "unit": "0-1", "why": "no year-round snow or ice cover (annual mean)", "inMatch": True, "ideal": "<= 0.35", "tolerance": 0.10, "weight": 1.0}]}
KNOWN_NAMES = {
 "askja_iceland": ("Askja highlands, Iceland", "Apollo geology training 1965 (not a low-Sun rehearsal)"),
 "sp_crater_az": ("SP Crater, San Francisco Volcanic Field, Arizona", "JETT3/JETT5"),
 "craters_of_the_moon_id": ("Craters of the Moon, Idaho", "BASALT"),
 "timanfaya_lanzarote": ("Timanfaya, Lanzarote", "PANGAEA"),
 "kilauea_iki_hi": ("Kilauea Iki, Hawai'i", "BASALT"),
 "dumont_dunes_ca": ("Dumont Dunes, California", "Scarecrow"),
 "yungay_atacama": ("Yungay, Atacama Desert", "ARADS (SAFER ran elsewhere in the Atacama, near Paranal)"),
 "mdrs_hanksville_ut": ("Mars Desert Research Station, Utah", "MDRS"),
 "haughton_crater": ("Haughton impact crater, Devon Island", "TRIDENT / HMP"),
 "mcmurdo_dry_valleys": ("McMurdo Dry Valleys", "IceBite"),
}
VLABEL = {(mid, v["id"]): (v["label"], v["unit"], v.get("ideal")) for mid, m in MISSIONS.items() for v in m["variables"]}  # per mission


def level(a):
    x = a.get("access_complexity")
    if x is None: return None
    return "low" if x < 0.25 else ("medium" if x < 0.5 else "high")


def access(a):
    if a.get("permit_flag") == "ANTARCTIC_TREATY_AREA":
        basis = ("Not computed: Antarctic Treaty area (no country attributed). Activities require prior EIA and national "
                 "authorisation; entry to an Antarctic Specially Protected Area requires a permit. ASPA status of this point not checked.")
    elif a.get("access_complexity") is None:
        basis = (f"Not computed: disputed area (boundaries de facto, no country attributed). Only nearby organised-violence "
                 f"events are shown: {a.get('C')} (0-1, UCDP).") if a.get("disputed_area") else "Not computed (missing sources)."
    else:
        parts = [f"Access complexity {a['access_complexity']} (0-1, relative)",
                 f"Governance perception (WGI, perceptions-based) {a['G']}", f"nearby organised-violence events {a['C']}",
                 f"travel advice {a['A']}"]
        us = a.get("us_advisory"); uk = a.get("uk_advisory") or {}
        if isinstance(us, dict) and us.get("label"): parts.append(f"{us['label']} ({us['updated'][:10]})")
        if uk.get("alert_status"): parts.append("UK advice mentions specific regions; see source" if all(s.endswith("_parts") for s in uk["alert_status"]) else "UK advice covers whole country; see source")
        elif uk: parts.append("UK: no travel alert")
        basis = "; ".join(parts)
    lvl, floor = level(a), None
    us = a.get("us_advisory"); uk = (a.get("uk_advisory") or {}).get("alert_status") or []
    top = []
    if isinstance(us, dict) and "level 4 of 4" in (us.get("label") or ""): top.append("US advisory at its highest level (4 of 4)")
    if "avoid_all_travel_to_whole_country" in uk: top.append("UK advises against all travel to the whole country")
    if top and lvl in ("low", "medium"):  # declared rule: an official advisory at its maximum sets the level to at least high
        lvl = "high"; floor = "Level raised to high: " + "; ".join(top) + ". The 0-1 score is unchanged."
    return {"level": lvl, "floor": floor, "score": a.get("access_complexity"),
            "permitFlag": a.get("permit_flag"), "basis": basis,
            "note": "Check national park and research permits before fieldwork.", "sources": CREDITS}


def breaks(mid, rec, kind):
    b = []
    for k, v in rec["perVariable"].items():
        if v is None or k.startswith("sun"): continue
        if v["similarity"] < 0.5:
            lab, unit, ideal = VLABEL[(mid, k)]; b.append(f"{lab} {v['value']} {unit} is outside the mission range ({ideal})")
    if mid == "m1-eva-basalt":
        b.append(f"Sun reaches {rec['sun']['sun_max_deg']} deg at noon (Mons Mouton about 6.9 deg): lighting not analogous")
        if kind == "new": b.append("Rock type not verified: bare dark ground, not confirmed basalt (needs ASTER emissivity)")
        b.append("Earth gravity and atmosphere: suit mobility and dust behave differently")
    if mid == "m2-rover-sand":
        b.append("Earth gravity is ~2.6x Mars: wheel sinkage differs unless rover mass is reduced (as JPL did with Scarecrow)")
        if kind == "new": b.append("Sand fraction is a 5 km model value: dunes not confirmed on imagery")
    if mid == "m3-ground-ice":
        b.append("Earth permafrost thaws seasonally at the surface; Arcadia is far colder (annual mean about -76 C, Mars Climate Database) with no active layer")
        if kind == "new": b.append("Ground ice inferred from temperature only: no ice or permafrost map used")
    b.append("0.1 deg cell (~11 km): value describes the cell, not a specific outcrop")
    return b


def site_rec(mid, r, kind, sid, name, a):
    pv = {}
    for k, v in r["perVariable"].items():
        pv[k] = None if v is None else {"value": v["value"], "similarity": v["similarity"], "source": SRC[k]}
    if mid == "m1-eva-basalt":
        e = r["sun"]["sun_max_deg"]
        pv["sun_max_deg"] = {"value": e, "similarity": round(math.exp(-0.5 * ((e - 6.9) / 15) ** 2), 3), "source": SRC["sun_max_deg"], "inMatch": False}
        pv["sun_winter_solstice_deg"] = {"value": r["sun"]["sun_winter_solstice_deg"], "similarity": None, "source": SRC["sun_winter_solstice_deg"], "inMatch": False}
    rec = {"id": sid, "name": name, "country": a.get("country_name"), "lat": r["lat"], "lon": r["lon"], "kind": kind,
           "match": r["match"], "matchPercentile": r["match_pct"], "perVariable": pv}
    rec["breaks"] = breaks(mid, {"perVariable": r["perVariable"], "sun": r["sun"]}, kind)
    rec["accessRisk"] = access(a)
    return rec


