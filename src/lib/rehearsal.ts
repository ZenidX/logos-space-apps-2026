// Por qué un sitio de la Tierra sirve para ensayar una submisión (página /base/, comparación Tierra ↔ base).
// Lee los criterios de operations.json (los mismos que puntúa scripts/ops/score-ops.mjs) y los explica con
// el valor real del sitio. Lógica pura: se puede probar en Node.

export type Rule = { fn: "lo" | "hi" | "band"; p: number[] };

// "lo(-40, 0)" → { fn: "lo", p: [-40, 0] }
export function parseRule(s: string): Rule | null {
  const m = /^(lo|hi|band)\(([^)]*)\)$/.exec(s.trim());
  if (!m) return null;
  return { fn: m[1] as Rule["fn"], p: m[2].split(",").map((x) => Number(x.trim())) };
}

// Igual que desirability() de scripts/ops/tasks.mjs.
export function desirability(r: Rule, x: number | null | undefined): number | null {
  if (x == null || !Number.isFinite(x)) return null;
  const c = (v: number) => Math.max(0, Math.min(1, v));
  const p = r.p;
  if (r.fn === "lo") return c((p[1] - x) / (p[1] - p[0]));
  if (r.fn === "hi") return c((x - p[0]) / (p[1] - p[0]));
  return x < p[0] || x > p[3] ? 0 : x < p[1] ? (x - p[0]) / (p[1] - p[0]) : x > p[2] ? (p[3] - x) / (p[3] - p[2]) : 1;
}

const VARS: Record<string, { label: string; unit: string; digits: number }> = {
  lst_min: { label: "Coldest nights", unit: " °C", digits: 0 },
  lst_max: { label: "Hottest days", unit: " °C", digits: 0 },
  lst_mean: { label: "Mean ground temperature", unit: " °C", digits: 0 },
  lst_day: { label: "Daytime ground temperature", unit: " °C", digits: 0 },
  lst_night: { label: "Night-time ground temperature", unit: " °C", digits: 0 },
  slope: { label: "Mean slope (5 km)", unit: "°", digits: 1 },
  ps_hpa: { label: "Air pressure", unit: " hPa", digits: 0 },
  ndvi: { label: "Vegetation (NDVI)", unit: "", digits: 2 },
  abs_lat: { label: "Latitude", unit: "°", digits: 0 },
  albedo: { label: "Ground brightness (albedo)", unit: "", digits: 2 },
  precip: { label: "Rain", unit: " mm/yr", digits: 0 },
  dust_aod: { label: "Airborne dust (AOD)", unit: "", digits: 2 },
  wind_ms: { label: "Wind", unit: " m/s", digits: 1 },
  access_h: { label: "Travel time to a city", unit: " h", digits: 0 },
  elev: { label: "Altitude", unit: " m", digits: 0 },
};

const fmt = (v: string, x: number) => {
  const m = VARS[v];
  return m ? `${x.toFixed(m.digits)}${m.unit}` : String(x);
};

// Texto de lo que pide la regla, en las unidades de la variable.
export function ruleText(v: string, r: Rule): string {
  const f = (x: number) => fmt(v, x);
  if (r.fn === "lo") return `best ≤ ${f(r.p[0])}, fails ≥ ${f(r.p[1])}`;
  if (r.fn === "hi") return `best ≥ ${f(r.p[1])}, fails ≤ ${f(r.p[0])}`;
  return `best ${f(r.p[1])} to ${f(r.p[2])}, fails outside ${f(r.p[0])} to ${f(r.p[3])}`;
}

export interface WhyRow {
  label: string;
  value: string;
  need: string;
  why: string;
  score: number | null; // 0–1
}

export interface Criterion {
  var: string;
  w: number;
  why: string;
  rule: string;
}

export function whyRows(criteria: Criterion[], values: Record<string, number | null | undefined>, absLat?: number): WhyRow[] {
  return criteria.map((c) => {
    const r = parseRule(c.rule);
    const x = c.var === "abs_lat" ? absLat : values[c.var];
    return {
      label: VARS[c.var]?.label ?? c.var,
      value: x == null || !Number.isFinite(x) ? "no data" : fmt(c.var, x),
      need: r ? ruleText(c.var, r) : c.rule,
      why: c.why,
      score: r ? desirability(r, x) : null,
    };
  });
}

// Lo que ningún sitio de la Tierra reproduce: se dice siempre, para cualquier submisión.
export function breaks(body: "moon" | "mars", earthPsHpa?: number | null): string[] {
  const air = earthPsHpa != null ? `${Math.round(earthPsHpa)} hPa here` : "Earth's air";
  return body === "moon"
    ? [
        "Gravity: 1.62 m/s² on the Moon vs 9.81 here (⅙ g): walking, digging and driving all behave differently.",
        `Vacuum: no air at all on the Moon vs ${air}; suits, seals and cooling must be tested in chambers too.`,
        "Radiation and micrometeorites: Earth's atmosphere and magnetic field block what the Moon's surface gets.",
        "Regolith: sharp, glassy, electrostatic lunar dust has no natural equivalent on Earth.",
      ]
    : [
        "Gravity: 3.72 m/s² on Mars vs 9.81 here (⅜ g).",
        `Air: ~6 hPa of CO₂ on Mars vs ${air}; you cannot breathe it and it barely cools or slows anything.`,
        "Radiation: no global magnetic field and a thin atmosphere let far more reach the surface.",
        "Cold: Martian nights reach −80 °C to −100 °C, colder than almost anywhere people live on Earth.",
      ];
}
