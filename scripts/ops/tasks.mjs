// Matriz de operaciones análogas: cada tarea de misión se define SOLO con nuestras variables,
// para poder recalcular los sitios cuando cambien los datos (node scripts/ops/score-ops.mjs).
//
// Funciones de deseabilidad (0–1):
//   lo(good, bad): 1 si x <= good, 0 si x >= bad, lineal entre medias  ("cuanto menos, mejor")
//   hi(bad, good): 0 si x <= bad, 1 si x >= good                       ("cuanto más, mejor")
//   band(a, b, c, d): 0 fuera de [a, d], 1 dentro de [b, c], rampas entre medias
// Nota de la tarea = media geométrica ponderada de sus criterios (un criterio a 0 anula el sitio).
// Empates: a igual nota gana el sitio más accesible (la misma simulación, más barata).
// `window`: radio en celdas para exigir que el terreno favorable sea continuo (media local de la nota).

export const lo = (good, bad) => ({ fn: "lo", p: [good, bad] });
export const hi = (bad, good) => ({ fn: "hi", p: [bad, good] });
export const band = (a, b, c, d) => ({ fn: "band", p: [a, b, c, d] });

export function desirability({ fn, p }, x) {
  if (x == null || !Number.isFinite(x)) return null;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  if (fn === "lo") return clamp((p[1] - x) / (p[1] - p[0]));
  if (fn === "hi") return clamp((x - p[0]) / (p[1] - p[0]));
  if (fn === "band") return x < p[0] || x > p[3] ? 0 : x < p[1] ? (x - p[0]) / (p[1] - p[0]) : x > p[2] ? (p[3] - x) / (p[3] - p[2]) : 1;
  throw new Error(fn);
}

// NDVI: en las celdas hiperáridas (< 50 mm/año) MODIS da NDVI p10 0,06 · p50 0,10 · p90 0,12 (suelo desnudo claro),
// así que «sin vegetación» es NDVI ≤ ~0,12, no ≤ 0,05 (con 0,05 quedaba fuera el núcleo de Atacama, NDVI 0,106).
// Umbrales de polvo y viento: posición relativa dentro del rango terrestre (MERRA-2 2024 sobre tierra firme:
// dust_aod p50 0,013 · p75 0,03 · p90 0,12 · p95 0,21 · máx. 0,51; wind_ms p50 4,3 · p90 8,1), como en docs/metodo.md.
// Variables disponibles por celda (ver score-ops.mjs):
// lat, abs_lat, lst_day, lst_night, lst_max, lst_min, lst_mean, precip, ndvi, albedo, slope, elev,
// access_h, ps_hpa (MERRA-2 si existe; si no, estimada desde la altitud), wind_ms, dust_aod (solo MERRA-2).
export const TASKS = [
  {
    id: "eva_cold_rough",
    name: "Spacesuit EVA on cold, rough, thin-air terrain",
    targets: ["shackleton", "jezero", "arcadia"],
    need: "Suit mobility, fatigue and procedures on broken, bare terrain, in the cold and at low pressure (less oxygen, like a pressurised suit with a low-pressure mix).",
    criteria: [
      { var: "lst_min", rule: lo(-40, 0), w: 1, why: "Night-time cold below −40 °C stresses suits, gloves and batteries" },
      { var: "slope", rule: band(1, 2.5, 6, 10), w: 1, why: "Rough but walkable ground (5 km slope)" },
      { var: "ps_hpa", rule: lo(600, 900), w: 1, why: "Thin air: below ~600 hPa means above ~4 km altitude" },
      { var: "ndvi", rule: lo(0.12, 0.25), w: 1, why: "Bare ground, no vegetation (MODIS NDVI of bare soil is up to ~0.12)" },
    ],
  },
  {
    id: "grazing_sun",
    name: "Navigation and operations under low-angle sun and long shadows",
    targets: ["shackleton"],
    need: "At the lunar south pole the Sun stays within ~1.5° of the horizon: long shadows, glare and spots where cameras and people go blind. Navigation, rover driving and solar panels on vertical masts.",
    criteria: [
      { var: "abs_lat", rule: hi(66.5, 78), w: 2, why: "Polar latitude: the Sun circles low over the horizon (polar day and night)" },
      { var: "slope", rule: band(1, 3, 8, 15), w: 1, why: "Relief that casts long shadows" },
      { var: "albedo", rule: lo(0.35, 0.6), w: 1, why: "Snow-free ground in summer (regolith, not ice)" },
      { var: "ndvi", rule: lo(0.12, 0.25), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
    ],
  },
  {
    id: "cold_trap",
    name: "Hardware and EVA in extreme cold (permanently shadowed craters)",
    targets: ["shackleton"],
    need: "Shackleton's shadowed floor stays below −230 °C, colder than anywhere on Earth. Earth can only test the start of that curve: seals, lubricants, batteries and short EVAs at −60 °C or below.",
    criteria: [
      { var: "lst_min", rule: lo(-75, -30), w: 2, why: "The colder the better, up to Earth's p1 (−75 °C)" },
      { var: "lst_max", rule: lo(-10, 10), w: 1, why: "Even the summer maximum stays cold" },
      { var: "precip", rule: lo(100, 300), w: 1, why: "Polar desert: little snow" },
    ],
  },
  {
    id: "permafrost_drill",
    name: "Drilling and extracting shallow ground ice",
    targets: ["arcadia", "shackleton"],
    need: "Arcadia has water ice under less than 1 m of soil (SWIM). Shackleton has ice in permanently shadowed regolith. Drilling, sampling ice-cemented ground and extracting water (ISRU).",
    criteria: [
      { var: "lst_mean", rule: lo(-10, -2), w: 2, why: "Mean annual surface temperature well below 0 °C (continuous-permafrost proxy)" },
      { var: "precip", rule: lo(150, 400), w: 1, why: "Dry permafrost (polar desert), not boggy" },
      { var: "slope", rule: lo(2, 6), w: 1, why: "Plain, like Arcadia" },
      { var: "ndvi", rule: lo(0.12, 0.25), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
    ],
    gaps: ["We have no direct ground-ice or permafrost layer: ESA CCI Permafrost (ground temperature and probability, Obu et al. 2019) would replace the proxy."],
  },
  {
    id: "dust_ops",
    name: "Operations with dust: abrasion, seals and panel cleaning",
    targets: ["jezero", "arcadia"],
    need: "Martian dust is fine and electrostatic, and dust storms cut solar power (Opportunity, 2018). Testing seals, filters, airlocks and panel cleaning.",
    criteria: [
      { var: "dust_aod", rule: hi(0.03, 0.2), w: 2, why: "Dusty air: from Earth's p75 (0.03) to p95 (0.2). Mars (τ≈0.5) sits at Earth's absolute maximum", optional: true },
      { var: "wind_ms", rule: hi(4, 7), w: 1, why: "Wind that lifts dust: from Earth's median (4.3 m/s, close to Mars) up to ~p85", optional: true },
      { var: "precip", rule: lo(50, 200), w: 1, why: "Aridity: dust is not washed out" },
      { var: "ndvi", rule: lo(0.12, 0.2), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
      { var: "albedo", rule: band(0.18, 0.25, 0.35, 0.45), w: 1, why: "Loose, bright sediment (not rock, not ice)" },
      { var: "lst_max", rule: hi(15, 35), w: 1, why: "Hot surface: convection and dust devils lift dust (as on Mars)" },
    ],
    proxyNote: "Without MERRA-2 dust and wind, the task falls back to aridity and loose sediment only.",
  },
  {
    id: "landing_pad",
    name: "Landing and launch: pad, plume and ejected debris",
    targets: ["arcadia", "jezero", "shackleton"],
    need: "Engine plumes dig craters and throw regolith (Apollo 12, Chang'e). Testing pads, berms and hazard detection.",
    criteria: [
      { var: "slope", rule: lo(0.5, 2), w: 2, why: "Very flat, like Arcadia" },
      { var: "ndvi", rule: lo(0.12, 0.2), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
      { var: "precip", rule: lo(100, 400), w: 1, why: "Dry, loose surface" },
      { var: "albedo", rule: band(0.12, 0.18, 0.35, 0.5), w: 1, why: "Sediment or rock, not water or ice" },
    ],
  },
  {
    id: "power_mars",
    name: "Deploying power in cold, dusty, thin air (solar + fission)",
    targets: ["jezero", "arcadia"],
    need: "On Mars sunlight is ~43 % of Earth's, dust covers the panels and the cold eats batteries. Deploying panels, cables and a small reactor mock-up (Fission Surface Power).",
    criteria: [
      { var: "precip", rule: lo(50, 250), w: 1, why: "Clear skies, dry" },
      { var: "ndvi", rule: lo(0.12, 0.2), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
      { var: "lst_min", rule: lo(-30, 0), w: 1, why: "Night-time cold for batteries" },
      { var: "ps_hpa", rule: lo(650, 950), w: 1, why: "Thin air: less convective cooling, like Mars" },
      { var: "dust_aod", rule: hi(0.013, 0.12), w: 1, why: "Dust that dims and soils panels: from Earth's median (0.013) to p90 (0.12)", optional: true },
    ],
  },
  {
    id: "regolith_build",
    name: "Building with regolith (sintering, 3D printing, berms)",
    targets: ["shackleton", "jezero", "arcadia"],
    need: "Shielding against radiation and micrometeorites with local material: dark basaltic soil is the closest feedstock to lunar and Martian simulants.",
    criteria: [
      { var: "albedo", rule: band(0.08, 0.1, 0.18, 0.25), w: 2, why: "Dark ground (basalt proxy)" },
      { var: "ndvi", rule: lo(0.12, 0.2), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
      { var: "slope", rule: lo(1, 3), w: 1, why: "Flat for a construction site" },
      { var: "precip", rule: lo(100, 300), w: 1, why: "Dry" },
    ],
    gaps: ["Albedo does not distinguish basalt from other dark rock: ASTER GED (emissivity, silica index) would say whether it is truly basaltic. Shackleton's highlands are anorthositic (bright): there, dark ground is NOT the right analog."],
  },
  {
    id: "rover_traverse",
    name: "Long-distance rover traverses",
    targets: ["jezero", "arcadia"],
    need: "Perseverance-style traverses: tens of km over plains and delta sediment, with autonomous navigation and communications relay.",
    criteria: [
      { var: "slope", rule: band(0.3, 0.8, 3, 6), w: 1, why: "Drivable but not trivial" },
      { var: "ndvi", rule: lo(0.12, 0.2), w: 1, why: "Bare ground (MODIS NDVI of bare desert soil is up to ~0.12)" },
      { var: "precip", rule: lo(100, 300), w: 1, why: "Dry" },
    ],
    window: 3,
    windowNote: "Score averaged over a 7 × 7-cell window (~75 km): the favourable terrain has to be continuous for a long traverse.",
  },
  {
    id: "isolation",
    name: "Crew isolation and delayed communications",
    targets: ["shackleton", "jezero", "arcadia"],
    need: "Psychology, autonomy and procedures with no quick help (HERA, CHAPEA, Concordia). The communication delay (2.6 s Moon; 4–24 min Mars) is simulated anywhere; remoteness is not.",
    criteria: [
      { var: "access_h", rule: hi(24, 72), w: 2, why: "More than a day from the nearest city" },
      { var: "ndvi", rule: lo(0.15, 0.35), w: 1, why: "Barren landscape" },
      { var: "lst_min", rule: lo(-30, 0), w: 1, why: "Hostile climate" },
    ],
  },
  {
    id: "astrobio",
    name: "Astrobiology sampling in hyper-arid sediments",
    targets: ["jezero"],
    need: "Jezero is an ancient lake delta. Testing contamination-free sampling, caching and life detection at the dry limit of life (Atacama, Mars 2020).",
    criteria: [
      { var: "precip", rule: lo(25, 100), w: 2, why: "Hyper-arid" },
      { var: "ndvi", rule: lo(0.11, 0.16), w: 1, why: "No vegetation (at or below the hyper-arid median of 0.10)" },
      { var: "albedo", rule: band(0.15, 0.2, 0.35, 0.45), w: 1, why: "Sediment" },
      { var: "slope", rule: lo(1, 3), w: 1, why: "Basin or plain" },
    ],
    gaps: ["We have no lacustrine or deltaic geology layer: a dry-lake map (Global Lakes and Wetlands Database, playas) would separate deltas and salars from rocky desert."],
  },
];
