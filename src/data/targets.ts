// Huellas de los objetivos lunares y marcianos, en las MISMAS variables que las
// capas terrestres de Earth Engine. Valores APROXIMADOS de referencia para el MVP;
// null = aún no comparable (requiere procesar el producto planetario).

export interface Target {
  id: string;
  name: string;
  short: string;
  body: "moon" | "mars";
  description: string;
  values: Record<string, number | null>;
  sources: string;
}

export const TARGETS: Target[] = [
  {
    id: "shackleton",
    name: "Shackleton crater rim · lunar south pole",
    short: "Shackleton",
    body: "moon",
    description: "Candidate Artemis base region: near-continuous low-angle sunlight next to permanently shadowed craters with ice.",
    values: {
      lst_day: -100,
      lst_night: -180,
      lst_max: -50,
      lst_min: -230,
      precip: 0,
      ndvi: 0,
      albedo: 0.15,
      snow: null,
      emis: null,
      slope: 8,
      elev: null,
      cop_dem: null,
    },
    sources: "Approximate literature values (not yet extracted from PDS products): LRO Diviner (temperatures), LRO LOLA (slope), LROC WAC (albedo). Day/max values describe the sunlit rim; the minimum (−230 °C) is the shadowed crater floor.",
  },
  {
    id: "jezero",
    name: "Jezero crater · Mars",
    short: "Jezero",
    body: "mars",
    description: "Ancient lake delta explored by Perseverance; an astrobiology reference site.",
    values: {
      lst_day: -40,
      lst_night: -80,
      lst_max: 10,
      lst_min: -90,
      precip: 0,
      ndvi: 0,
      albedo: 0.2,
      snow: null,
      emis: null,
      slope: 3,
      elev: null,
      cop_dem: null,
    },
    sources: "Approximate literature values (not yet extracted from PDS products): Perseverance MEDA (temperatures), MGS TES (albedo), MOLA (slope).",
  },
  {
    id: "arcadia",
    name: "Arcadia Planitia · Mars",
    short: "Arcadia",
    body: "mars",
    description: "Mid-latitude plain with shallow buried ice, a candidate region for human missions (SWIM project).",
    values: {
      lst_day: -60,
      lst_night: -100,
      lst_max: -10,
      lst_min: -120,
      precip: 0,
      ndvi: 0,
      albedo: 0.2,
      snow: null,
      emis: null,
      slope: 1,
      elev: null,
      cop_dem: null,
    },
    sources: "Approximate literature values (not yet extracted from PDS products): MGS TES / Mars Climate Database (temperatures), MOLA (slope).",
  },
];
