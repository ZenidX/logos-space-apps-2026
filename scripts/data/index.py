# AI-assisted (Claude), reviewed by team Logos
"""Analog index (v3), scalar reference implementation. 02_missions.py applies the same formula on grids."""
import math


def similarity(x, lo, hi, tol):
    """1 inside [lo, hi]; Gaussian fall-off with tolerance tol outside."""
    d = lo - x if x < lo else (x - hi if x > hi else 0.0)
    return math.exp(-0.5 * (d / tol) ** 2)


def rule_met(x, lo, hi, tol):
    return similarity(x, lo, hi, tol) >= 0.5


def analog_index(rule_fraction, percentile_distance):
    """0.5 * F + 0.5 * (1 - D); F, D in [0, 1]."""
    return 0.5 * rule_fraction + 0.5 * (1 - percentile_distance)


def percentile_distance(p_site, p_median):
    """Mean |percentile - known-analog median| / 100 over variables (lists in 0-100)."""
    return sum(abs(a - b) for a, b in zip(p_site, p_median)) / (100.0 * len(p_site))
