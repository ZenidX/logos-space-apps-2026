# Earth and Mars positions from JPL's approximate elements · AI-assisted (Claude), to be reviewed by team Logos

Source: JPL Solar System Dynamics, "Approximate Positions of the Planets", Table 1 (Keplerian elements and rates with respect to the mean ecliptic and equinox of J2000, valid 1800 AD – 2050 AD). https://ssd.jpl.nasa.gov/planets/approx_pos.html (HTTP 200, read 2026-11-15). The page says the content is from an article by E. M. Standish and J. G. Williams (1992). "Earth" is the Earth–Moon barycentre (EM Bary).

| Body | a (au) | e | I (deg) | L (deg) | long.peri ϖ (deg) | long.node Ω (deg) |
|---|---|---|---|---|---|---|
| EM Bary | 1.00000261 | 0.01671123 | −0.00001531 | 100.46457166 | 102.93768193 | 0.0 |
| rate / century | 0.00000562 | −0.00004392 | −0.01294668 | 35999.37244981 | 0.32327364 | 0.0 |
| Mars | 1.52371034 | 0.09339410 | 1.84969142 | −4.55343205 | −23.94362959 | 49.55953891 |
| rate / century | 0.00001847 | 0.00007882 | −0.00813131 | 19140.30268499 | 0.44441088 | −0.29257343 |

Formula (as on the JPL page):
1. T = (JD − 2451545.0) / 36525; each element = value + rate · T.
2. ω = ϖ − Ω; M = L − ϖ, reduced to −180°…180°.
3. Solve Kepler's equation M = E − e·sin E (Newton, start E = M + e·sin M; angles in radians).
4. In the orbit plane: x′ = a(cos E − e), y′ = a·√(1 − e²)·sin E.
5. J2000 ecliptic: x = (cos ω cos Ω − sin ω sin Ω cos I)x′ + (−sin ω cos Ω − cos ω sin Ω cos I)y′; y = (cos ω sin Ω + sin ω cos Ω cos I)x′ + (−sin ω sin Ω + cos ω cos Ω cos I)y′; z = (sin ω sin I)x′ + (cos ω sin I)y′.
6. Earth–Mars distance = |r_Mars − r_Earth|. 1 au = 149,597,870.7 km.
Julian Day of a calendar date at 00:00: see `jd()` in `kepler_check.py`.

Control values (00:00 TT), against JPL Horizons (Mars 499 seen from Earth's centre 399, quantity 20 "delta"), queried 2026-11-15:
| Date | JD | Earth x, y, z (au) | Mars x, y, z (au) | Distance (au), this formula | Horizons (au) | Difference |
|---|---|---|---|---|---|---|
| 2003-08-27 (close approach) | 2452878.5 | 0.902660, −0.454220, 0.000004 | 1.239641, −0.608223, −0.043201 | 0.37301 | 0.37273 | +0.076 % |
| 2020-10-06 | 2459128.5 | 0.974450, 0.223489, −0.000011 | 1.354744, 0.387427, −0.025119 | 0.41488 | 0.41494 | −0.013 % |
| 2026-11-15 | 2461359.5 | 0.605591, 0.782259, −0.000048 | −0.470963, 1.537644, 0.043773 | 1.31586 | 1.31586 | 0.000 % |
| 2027-02-20 | 2461456.5 | −0.862419, 0.483317, −0.000030 | −1.449126, 0.818670, 0.052690 | 0.67784 | 0.67792 | −0.012 % |
Suggested test tolerance: 0.2 % (or 0.001 au). Limits: Earth here is the Earth–Moon barycentre (up to about 4,700 km from Earth's centre); approximate elements, not an ephemeris; valid 1800–2050. Horizons API: https://ssd.jpl.nasa.gov/api/horizons.api (public, no key). Reference code and JSON: `kepler_check.py`, `kepler_controls.json`.
