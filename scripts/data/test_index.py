# AI-assisted (Claude), reviewed by team Logos
"""Hand-computed cases for the analog index. Run: python -I test_index.py  (or pytest)."""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index import similarity, rule_met, analog_index, percentile_distance


def test_inside_range():           # NDVI 0.02 within <= 0.05  -> s = 1
    assert similarity(0.02, -1, 0.05, 0.10) == 1.0


def test_one_tolerance_outside():  # albedo 0.26, range 0.07-0.20, tol 0.06 -> d = 0.06 = 1 tol -> exp(-0.5) = 0.6065
    assert abs(similarity(0.26, 0.07, 0.20, 0.06) - math.exp(-0.5)) < 1e-12
    assert rule_met(0.26, 0.07, 0.20, 0.06)          # 0.61 >= 0.5


def test_two_tolerances_fail():    # precip 650 mm, range <= 150, tol 250 -> d = 500 = 2 tol -> exp(-2) = 0.1353, rule fails
    assert abs(similarity(650, 0, 150, 250) - math.exp(-2)) < 1e-12
    assert not rule_met(650, 0, 150, 250)


def test_index_by_hand():          # 3 of 4 rules, percentiles (90, 20, 40, 60) vs median (80, 15, 50, 50)
    D = percentile_distance([90, 20, 40, 60], [80, 15, 50, 50])   # (10+5+10+10)/400 = 0.0875
    assert abs(D - 0.0875) < 1e-12
    assert abs(analog_index(0.75, D) - 0.83125) < 1e-12           # 0.375 + 0.45625


def test_sites_json_consistent():  # every site: match == 0.5F + 0.5(1-D) within rounding (fields rounded to 3 dp)
    p = os.environ.get("LOGOS_SITES")
    if not p: return
    for m in json.load(open(p))["missions"]:
        for s in m["sites"]:
            if s.get("match") is None or s.get("percentileDistance") is None: continue  # missions without the known-analog term (m4)
            assert abs(s["match"] - analog_index(s["ruleFraction"], s["percentileDistance"])) <= 0.0011, s["id"]


def test_advisory_floor():          # an official advisory at its maximum -> level at least high, score unchanged
    from build_common import access
    a = {"access_complexity": 0.454, "G": 0.51, "C": 0.0, "A": 1.0, "permit_flag": "NONE", "us_advisory": {"label": "US level 4 of 4", "updated": "2025-12-28T00:00"},
         "uk_advisory": {"alert_status": ["avoid_all_travel_to_whole_country"]}}
    r = access(a); assert r["level"] == "high" and r["floor"] and r["score"] == 0.454
    b = {**a, "access_complexity": 0.167, "A": 0.167, "us_advisory": {"label": "US level 2 of 4", "updated": "2026-01-01T00:00"}, "uk_advisory": {"alert_status": []}}
    r = access(b); assert r["level"] == "low" and r["floor"] is None


if __name__ == "__main__":
    for n, f in list(globals().items()):
        if n.startswith("test_"): f(); print("ok", n)
