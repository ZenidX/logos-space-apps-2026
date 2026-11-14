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
  // Por qué elegimos este objetivo. El reto NO da una lista de sitios de la Luna/Marte: la elección es nuestra.
  whyChosen: string;
  refs: { label: string; url: string }[];
}

// El enunciado del reto pide análogos de "candidate permanent Moon-base locations" y "future Mars landing
// and exploration sites" sin nombrar ninguno; solo nombra análogos terrestres (Atacama, Haughton, Death Valley).
export const TARGET_SELECTION_NOTE =
  'The Space Apps challenge does not provide a list of Moon or Mars sites: it asks for analogs of "candidate permanent Moon-base locations" and "future Mars landing and exploration sites" without naming any (the only places it names are Earth analogs: Atacama, Haughton Crater, Death Valley). These three targets are our own choice, each backed by a NASA source.';
export const CHALLENGE_URL = "https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/";

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
    whyChosen:
      "The lunar south pole is where NASA plans the first long-term Artemis presence: crater rims get sunlight most of the year (power) next to permanently shadowed craters that may hold water ice (resources). Shackleton's rim was among NASA's 13 candidate Artemis III landing regions in 2022 (\"Peak Near Shackleton\" and \"Connecting Ridge\"). NASA's October 2024 update narrowed the list to 9 regions and Shackleton is no longer named (Malapert Massif, Haworth and Mons Mouton remain, among others); we keep it as the best-studied reference for a permanent south-pole base.",
    refs: [
      { label: "NASA (2022): 13 candidate Artemis III regions", url: "https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/" },
      { label: "NASA (2024): update to 9 regions", url: "https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/" },
    ],
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
    whyChosen:
      "Jezero is where NASA's Perseverance rover landed in 2021: a 45 km crater that once held a lake, with a preserved river delta. It is the best-characterised Mars landing site (orbital data plus ground truth, samples cached for Mars Sample Return) and the reference site for ancient habitability.",
    refs: [{ label: "NASA Mars 2020 Perseverance mission", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }],
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
    whyChosen:
      "Arcadia Planitia is a mid-latitude plain where NASA's Subsurface Water Ice Mapping (SWIM) project finds water ice within a few metres of the surface: flat and safe for landing, with a resource for a crewed outpost, which makes it one of the leading candidate regions for future human missions.",
    refs: [{ label: "NASA SWIM: Subsurface Water Ice Mapping", url: "https://swim.psi.edu/" }],
  },
];
