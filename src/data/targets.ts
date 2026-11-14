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
    name: "Borde de Shackleton · polo sur lunar",
    short: "Shackleton",
    body: "moon",
    description: "Candidata a base permanente de Artemis: luz rasante casi continua y cráteres en sombra con hielo.",
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
    sources: "LRO Diviner (temperaturas), LRO LOLA (pendiente), LROC WAC (albedo) · aproximados",
  },
  {
    id: "jezero",
    name: "Cráter Jezero · Marte",
    short: "Jezero",
    body: "mars",
    description: "Antiguo delta lacustre explorado por Perseverance; referencia astrobiológica.",
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
    sources: "Perseverance MEDA (temperaturas), MGS TES (albedo), MOLA (pendiente) · aproximados",
  },
  {
    id: "arcadia",
    name: "Arcadia Planitia · Marte",
    short: "Arcadia",
    body: "mars",
    description: "Llanura de latitud media con hielo a poca profundidad, candidata a misiones humanas (SWIM).",
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
    sources: "MGS TES / Mars Climate Database (temperaturas), MOLA (pendiente) · aproximados",
  },
];
