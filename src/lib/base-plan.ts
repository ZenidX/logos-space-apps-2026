// Planificador de base (página /base/): lógica pura, sin DOM, se puede probar en Node.
// Entrada: la malla de alturas REAL del sitio (LOLA en la Luna, MOLA+HRSC en Marte) y su latitud/longitud.
// Salida: dónde iría cada pieza de la base y la ruta del rover, con reglas sacadas de docs/estrategias-bases.md.
// Todo lo que es suposición nuestra (distancias, límites de pendiente) está en RULES y la web lo dice.

export type PlanetBody = "moon" | "mars";

export interface HeightGrid {
  heights: Float32Array; // n × n, fila 0 = norte (o +y en la proyección polar)
  n: number;
  widthM: number;
  heightM: number;
}

export interface Spot {
  r: number;
  c: number;
  x: number; // m, este (+) desde el centro
  z: number; // m, sur (+) desde el centro (fila 0 = z negativo)
  h: number; // m, altura del dato
  slope: number; // °, pendiente media alrededor
}

export type PowerKind = "solar-masts" | "solar-fission" | "fission-solar";
export type IsruKind = "ice-shadow" | "ice-ground" | "oxygen-regolith" | "oxygen-co2";

export interface BasePlan {
  body: PlanetBody;
  lat: number;
  lon: number;
  cellM: number;
  slope: Float32Array; // ° por celda
  stats: { meanSlope: number; flatPct: number; reliefM: number; minH: number; maxH: number };
  habitat: Spot;
  pad: Spot;
  power: { kind: PowerKind; spots: Spot[] };
  isru: { kind: IsruKind; spot: Spot };
  science: Spot;
  route: Spot[];
  routeLenM: number;
  routeMaxGrade: number;
  routeLimitDeg: number; // límite de pendiente que hubo que usar (sube si no hay camino con el normal)
  evaRadiusM: number;
  polar: boolean;
  conditions: Condition[];
  taskIds: string[]; // misiones de operations.json que aplican aquí
}

export interface Condition {
  label: string;
  value: string;
  note: string;
  kind: "data" | "physics" | "assumption";
}

// Reglas. «src» = de dónde sale; «assumption» = elección nuestra razonada (la web lo marca).
export const RULES = {
  flatDeg: 10, // mismo umbral que la «viabilidad» v3: % de terreno con pendiente < 10°
  padMinM: 1500, // pista lejos del hábitat por el chorro del motor (Metzger et al.; distancia exacta: suposición)
  padMaxM: 3000,
  reactorM: 1000, // reactor de fisión separado del hábitat (suposición, a falta de cifra pública de FSP)
  roverLimitDeg: 20, // pendiente máxima para el rover (suposición; el LRV del Apolo estaba diseñado para ~25°)
  evaRadiusM: 2000, // radio de paseo a pie con vuelta segura (suposición)
  polarLat: 80, // por encima, Sol rasante: paneles en mástiles verticales sobre los altos
  marsIceLat: 35, // hielo somero probable hacia los polos (aprox. según mapas SWIM; solo latitud)
} as const;

const DEG = 180 / Math.PI;

export function slopeGrid(g: HeightGrid): Float32Array {
  const { heights: h, n, widthM, heightM } = g;
  const dx = widthM / (n - 1);
  const dy = heightM / (n - 1);
  const s = new Float32Array(n * n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const c0 = Math.max(0, c - 1), c1 = Math.min(n - 1, c + 1);
      const r0 = Math.max(0, r - 1), r1 = Math.min(n - 1, r + 1);
      const gx = (h[r * n + c1] - h[r * n + c0]) / ((c1 - c0) * dx);
      const gy = (h[r1 * n + c] - h[r0 * n + c]) / ((r1 - r0) * dy);
      s[r * n + c] = Math.atan(Math.hypot(gx, gy)) * DEG;
    }
  return s;
}

// Pendiente media en una ventana de radio k celdas (zona llana donde cabe una pieza).
function windowMean(s: Float32Array, n: number, k: number): Float32Array {
  const out = new Float32Array(n * n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      let sum = 0, cnt = 0;
      for (let i = Math.max(0, r - k); i <= Math.min(n - 1, r + k); i++)
        for (let j = Math.max(0, c - k); j <= Math.min(n - 1, c + k); j++) {
          sum += s[i * n + j];
          cnt++;
        }
      out[r * n + c] = sum / cnt;
    }
  return out;
}

export function maxSunElevation(body: PlanetBody, lat: number): number {
  const tilt = body === "moon" ? 1.54 : 25.19; // oblicuidad (IAU)
  return Math.min(90, 90 - Math.abs(lat) + tilt);
}

// Presión media en Marte según la altura MOLA: 610 Pa en el datum, escala ~11 km (aprox.).
export const marsPressurePa = (elevM: number) => 610 * Math.exp(-elevM / 11100);

export function planBase(g: HeightGrid, body: PlanetBody, lat: number, lon: number): BasePlan {
  const { heights: h, n, widthM, heightM } = g;
  const cellM = widthM / (n - 1);
  const slope = slopeGrid(g);
  const flat = windowMean(slope, n, Math.max(1, Math.round(150 / cellM)));
  const polar = Math.abs(lat) >= RULES.polarLat;

  let minH = Infinity, maxH = -Infinity, sum = 0, flatCnt = 0;
  for (let i = 0; i < n * n; i++) {
    minH = Math.min(minH, h[i]);
    maxH = Math.max(maxH, h[i]);
    sum += slope[i];
    if (slope[i] < RULES.flatDeg) flatCnt++;
  }
  const span = Math.max(1, maxH - minH);

  const spot = (r: number, c: number): Spot => ({
    r,
    c,
    x: (c / (n - 1) - 0.5) * widthM,
    z: (r / (n - 1) - 0.5) * heightM,
    h: h[r * n + c],
    slope: flat[r * n + c],
  });
  const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
  const margin = Math.max(2, Math.round(n * 0.08));
  const inner = (r: number, c: number) => r >= margin && c >= margin && r < n - margin && c < n - margin;

  // Elige la celda de menor coste entre las que cumplan `ok`, a ≥ 250 m de las piezas ya colocadas.
  const used: Spot[] = [];
  const pick = (cost: (r: number, c: number) => number, ok: (r: number, c: number) => boolean = () => true) => {
    let best: Spot | null = null, bestCost = Infinity;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (!inner(r, c) || !ok(r, c)) continue;
        if (used.length && used.some((u) => dist(u, spot(r, c)) < 250)) continue;
        const k = cost(r, c);
        if (k < bestCost) {
          bestCost = k;
          best = spot(r, c);
        }
      }
    const s = best ?? spot(n >> 1, n >> 1);
    used.push(s);
    return s;
  };
  const centre = { x: 0, z: 0 };
  const ring = (from: Spot, lo: number, hi: number) => (r: number, c: number) => {
    const d = dist(spot(r, c), from);
    return d >= lo && d <= hi;
  };

  // 1. Hábitat: llano y cerca del punto elegido. En el polo lunar, en alto (más horas de luz, Mazarico et al. 2011).
  const habitat = pick((r, c) => {
    const s = spot(r, c);
    const elev = (h[r * n + c] - minH) / span;
    return flat[r * n + c] + (dist(s, centre) / (0.25 * widthM)) * 2.5 - (body === "moon" && polar ? elev * 6 : 0);
  });

  // 2. Pista: lo más llana posible, a 1,5–3 km del hábitat (chorro del motor).
  const padHi = Math.min(RULES.padMaxM, 0.42 * widthM);
  const padLo = Math.min(RULES.padMinM, padHi * 0.6);
  const pad = pick((r, c) => flat[r * n + c] * 2 + Math.abs(dist(spot(r, c), habitat) - 2000) / 1500, ring(habitat, padLo, padHi));

  // 3. Energía.
  let power: BasePlan["power"];
  if (body === "moon" && polar) {
    // Mástiles solares verticales en los puntos más altos a ≤ 3,5 km, separados ≥ 600 m.
    const spots: Spot[] = [];
    const cand: Spot[] = [];
    for (let r = 1; r < n - 1; r++)
      for (let c = 1; c < n - 1; c++) {
        if (!inner(r, c)) continue;
        const v = h[r * n + c];
        let top = true;
        for (let i = -1; i <= 1 && top; i++) for (let j = -1; j <= 1; j++) if ((i || j) && h[(r + i) * n + c + j] > v) top = false;
        const s = spot(r, c);
        if (top && dist(s, habitat) <= 3500 && dist(s, habitat) >= 250 && dist(s, pad) > 500) cand.push(s);
      }
    cand.sort((a, b) => b.h - a.h);
    for (const s of cand) if (spots.length < 3 && spots.every((o) => dist(o, s) >= 600) && dist(s, habitat) >= 150) spots.push(s);
    used.push(...spots);
    if (!spots.length) spots.push(pick((r, c) => -h[r * n + c], ring(habitat, 200, 1500)));
    power = { kind: "solar-masts", spots };
  } else {
    const field = pick((r, c) => flat[r * n + c] + dist(spot(r, c), habitat) / 400, ring(habitat, 250, 700));
    const reactor = pick(
      (r, c) => flat[r * n + c] + Math.abs(dist(spot(r, c), habitat) - RULES.reactorM) / 300,
      (r, c) => ring(habitat, 700, 1600)(r, c) && dist(spot(r, c), pad) > 800,
    );
    // Luna fuera del polo: 14 días de noche → el reactor manda. Marte: tormentas de polvo → igual.
    power = { kind: body === "moon" ? "solar-fission" : "fission-solar", spots: [field, reactor] };
  }

  // 4. Recursos (ISRU).
  let isru: BasePlan["isru"];
  if (body === "moon" && polar) {
    // Lo más hondo de la zona: proxy de suelo en sombra permanente (trampa fría). No es un mapa de sombra.
    isru = { kind: "ice-shadow", spot: pick((r, c) => h[r * n + c], ring(habitat, 800, 0.48 * widthM)) };
  } else if (body === "mars" && Math.abs(lat) >= RULES.marsIceLat) {
    isru = { kind: "ice-ground", spot: pick((r, c) => flat[r * n + c] + Math.abs(dist(spot(r, c), habitat) - 500) / 200, ring(habitat, 300, 900)) };
  } else {
    isru = {
      kind: body === "moon" ? "oxygen-regolith" : "oxygen-co2",
      spot: pick((r, c) => flat[r * n + c] + Math.abs(dist(spot(r, c), habitat) - 350) / 150, ring(habitat, 200, 600)),
    };
  }

  // 5. Ciencia: el punto de más relieve local a 1–4 km (paredes, escarpes, afloramientos).
  const rough = (r: number, c: number) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = Math.max(0, r - 2); i <= Math.min(n - 1, r + 2); i++)
      for (let j = Math.max(0, c - 2); j <= Math.min(n - 1, c + 2); j++) {
        lo = Math.min(lo, h[i * n + j]);
        hi = Math.max(hi, h[i * n + j]);
      }
    return hi - lo;
  };
  const science = pick(
    (r, c) => -rough(r, c),
    (r, c) => ring(habitat, 1000, Math.min(4000, 0.45 * widthM))(r, c) && dist(spot(r, c), pad) > 700 && dist(spot(r, c), isru.spot) > 500,
  );

  // 6. Ruta del rover: hábitat → objetivo de la travesía (hielo en sombra si hay; si no, ciencia).
  const goal = isru.kind === "ice-shadow" ? isru.spot : science;
  let limit: number = RULES.roverLimitDeg;
  let path = route(h, n, cellM, habitat, goal, limit);
  while (!path && limit < 35) {
    limit += 5;
    path = route(h, n, cellM, habitat, goal, limit);
  }
  const cells = path ?? [habitat, goal].map((s) => [s.r, s.c] as [number, number]);
  const routeSpots = cells.map(([r, c]) => spot(r, c));
  let len = 0, maxGrade = 0;
  for (let i = 1; i < routeSpots.length; i++) {
    const d = dist(routeSpots[i], routeSpots[i - 1]);
    len += d;
    maxGrade = Math.max(maxGrade, Math.atan(Math.abs(routeSpots[i].h - routeSpots[i - 1].h) / d) * DEG);
  }

  const stats = { meanSlope: sum / (n * n), flatPct: (100 * flatCnt) / (n * n), reliefM: maxH - minH, minH, maxH };
  return {
    body,
    lat,
    lon,
    cellM,
    slope,
    stats,
    habitat,
    pad,
    power,
    isru,
    science,
    route: routeSpots,
    routeLenM: len,
    routeMaxGrade: maxGrade,
    routeLimitDeg: limit,
    evaRadiusM: RULES.evaRadiusM,
    polar,
    conditions: conditions(body, lat, lon, stats, habitat.h),
    taskIds: tasksFor(body, lat, polar, isru.kind),
  };
}

// A* en rejilla de 8 vecinos. Coste = distancia × (1 + 3·(pendiente/límite)²); por encima del límite, prohibido.
function route(h: Float32Array, n: number, cellM: number, a: Spot, b: Spot, limitDeg: number): [number, number][] | null {
  const N = n * n;
  const gScore = new Float64Array(N).fill(Infinity);
  const from = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const start = a.r * n + a.c, goal = b.r * n + b.c;
  const heur = (i: number) => Math.hypot((i % n) - b.c, Math.floor(i / n) - b.r) * cellM;
  // Montículo binario sencillo [f, índice]
  const heap: [number, number][] = [];
  const push = (f: number, i: number) => {
    heap.push([f, i]);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  const lim = Math.tan(limitDeg / DEG);
  gScore[start] = 0;
  push(heur(start), start);
  while (heap.length) {
    const [, i] = pop();
    if (closed[i]) continue;
    if (i === goal) break;
    closed[i] = 1;
    const r = Math.floor(i / n), c = i % n;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        const j = rr * n + cc;
        if (closed[j]) continue;
        const d = Math.hypot(dr, dc) * cellM;
        const grade = Math.abs(h[j] - h[i]) / d;
        if (grade > lim) continue;
        const g2 = gScore[i] + d * (1 + 3 * (grade / lim) ** 2);
        if (g2 < gScore[j]) {
          gScore[j] = g2;
          from[j] = i;
          push(g2 + heur(j), j);
        }
      }
  }
  if (!Number.isFinite(gScore[goal])) return null;
  const out: [number, number][] = [];
  for (let i = goal; i !== -1; i = from[i]) out.push([Math.floor(i / n), i % n]);
  return out.reverse();
}

function conditions(body: PlanetBody, lat: number, lon: number, s: BasePlan["stats"], habH: number): Condition[] {
  const sun = maxSunElevation(body, lat);
  const out: Condition[] = [
    { label: "Buildable ground", value: `${Math.round(s.flatPct)} %`, note: `Share of this patch with slope under ${RULES.flatDeg}° (same rule as our Earth buildability score).`, kind: "data" },
    { label: "Mean slope", value: `${s.meanSlope.toFixed(1)}°`, note: "From the elevation data at the resolution shown.", kind: "data" },
    { label: "Relief", value: `${Math.round(s.reliefM)} m`, note: "Highest minus lowest point in the patch.", kind: "data" },
    {
      label: "Highest Sun",
      value: `${sun.toFixed(1)}°`,
      note: body === "moon" ? "Above the horizon, at best (latitude + the Moon's 1.5° tilt)." : "Above the horizon at noon in the best season (latitude + Mars' 25° tilt).",
      kind: "physics",
    },
    { label: "Gravity", value: body === "moon" ? "1.62 m/s² (⅙ g)" : "3.72 m/s² (⅜ g)", note: "Standard values.", kind: "physics" },
  ];
  if (body === "moon") {
    const near = Math.abs(((lon + 540) % 360) - 180) < 90;
    out.push({
      label: "Day / night",
      value: Math.abs(lat) >= RULES.polarLat ? "Grazing sun" : "~14.8 / 14.8 Earth days",
      note: Math.abs(lat) >= RULES.polarLat ? "Near the poles the Sun circles the horizon; high ground can stay lit most of the year, hollows stay dark." : "One lunar day lasts 29.5 Earth days: two weeks of night to survive on stored or nuclear power.",
      kind: "physics",
    });
    out.push({
      label: "Earth link",
      value: Math.abs(lat) >= RULES.polarLat ? "Low, intermittent" : near ? "Direct (near side)" : "Needs relay (far side)",
      note: Math.abs(lat) >= RULES.polarLat ? "Earth sits on the horizon; relief and libration block it at times (relay satellites planned)." : near ? "The near side always faces Earth. ~2.6 s round trip." : "The far side never sees Earth: a relay satellite is required.",
      kind: "physics",
    });
  } else {
    const p = marsPressurePa(habH);
    out.push({ label: "Air pressure", value: `≈ ${Math.round(p)} Pa`, note: "Approx. from elevation (610 Pa at datum, ~11 km scale height). Earth: 101 325 Pa.", kind: "physics" });
    out.push({ label: "Day", value: "24 h 39 min", note: "One sol. Dust storms can dim the Sun for weeks.", kind: "physics" });
    out.push({ label: "Earth link", value: "4–24 min one way", note: "Depends on where Mars and Earth are in their orbits: no real-time control.", kind: "physics" });
    out.push({
      label: "Shallow ice",
      value: Math.abs(lat) >= RULES.marsIceLat ? "Likely (by latitude)" : "Unlikely",
      note: `Rough rule from NASA SWIM ice maps: shallow ice mostly poleward of ~${RULES.marsIceLat}°. Latitude only, not measured here.`,
      kind: "assumption",
    });
  }
  return out;
}

function tasksFor(body: PlanetBody, lat: number, polar: boolean, isru: IsruKind): string[] {
  const t = ["landing_pad", "regolith_build", "eva_cold_rough"];
  if (body === "moon") {
    if (polar) t.push("grazing_sun", "cold_trap");
    if (isru === "ice-shadow") t.push("permafrost_drill");
  } else {
    t.push("power_mars", "dust_ops", "rover_traverse");
    if (isru === "ice-ground") t.push("permafrost_drill");
  }
  t.push("isolation");
  return t;
}
