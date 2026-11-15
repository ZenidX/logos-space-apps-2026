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
  northBearingDeg?: number; // rumbo del norte geográfico respecto a «arriba» de la malla (polares)
}

// Luz solar sobre el relieve real (ver sunlight()).
export interface SunMap {
  lit: Float32Array; // fracción del tiempo (día + noche, todo el año) con el Sol por encima del horizonte local
  irr: Float32Array; // energía media sobre el suelo, relativa a «Sol en el cénit todo el tiempo» = 1
  psr: Uint8Array; // 1 = sombra permanente: ningún Sol del modelo llega nunca (trampa fría posible)
  psrPct: number;
  litMean: number;
  maxDot: Float32Array; // insolación directa más fuerte que recibe el suelo (coseno de incidencia), 0–1
}

// Temperatura e hielo (ver docs/hielo-lunar.md). Clases: 2 = trampa fría en superficie (máx. < 110 K),
// 1 = hielo enterrado posible (media < 110 K), 0 = ninguno.
export interface IceMap {
  tmax: Float32Array;
  tmean: Float32Array;
  cls: Uint8Array;
  surfPct: number;
  buriedPct: number;
  coldestK: number;
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

// Para dibujar el mismo plan en un sitio de ensayo de la Tierra: el Sol es el de la Tierra en ese sitio,
// y el tipo de recurso se copia de la base (se ensaya la misma operación).
export interface PlanOptions {
  sunLat?: number;
  tiltDeg?: number;
  radiusM?: number;
  isruKind?: IsruKind;
}

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
  sun: SunMap;
  ice: IceMap | null; // solo Luna
  iceClass: 0 | 1 | 2; // dónde se excava: 2 = trampa fría en superficie, 1 = hielo enterrado
  plant: Spot | null; // planta de extracción en el borde iluminado (si hay hielo)
  habitatLit: number; // fracción del tiempo con sol en el hábitat
  powerLit: number; // la mejor fracción de luz entre las piezas solares
  noIce: "" | "no-psr" | "not-polar"; // Luna sin hielo: por qué
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

const BODY = {
  moon: { tilt: 1.54, radius: 1737400 },
  mars: { tilt: 25.19, radius: 3389500 },
} as const;

// Luz solar real sobre el relieve.
// 1) Horizonte de cada celda en NAZ direcciones (marcha sobre la malla, con la caída por la curvatura del cuerpo).
// 2) Recorrido del Sol: ángulo horario cada 7,5° × 5 declinaciones entre −inclinación y +inclinación (día y estaciones).
// 3) Una celda tiene sol si el Sol está por encima de su horizonte en ese acimut.
// Límite: el horizonte solo ve dentro de la caja (11 km); montañas más lejanas no tapan, así que la luz se sobreestima
// un poco y la sombra permanente se subestima en los bordes.
export function sunlight(g: HeightGrid, lat: number, tiltDeg: number, radiusM: number, nAz = 24): SunMap {
  const { heights: h, n, widthM } = g;
  const N = n * n;
  const cell = widthM / (n - 1);
  const north = ((g.northBearingDeg ?? 0) * Math.PI) / 180;
  const hor = new Float32Array(nAz * N); // tangente del ángulo de horizonte
  const maxSteps = Math.ceil(n * 1.45);
  for (let k = 0; k < nAz; k++) {
    const gb = (k / nAz) * 2 * Math.PI + north; // rumbo en la malla de la dirección geográfica k
    const dc = Math.sin(gb), dr = -Math.cos(gb);
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        const h0 = h[r * n + c];
        let best = -Infinity;
        for (let s = 1; s <= maxSteps; s++) {
          const rr = Math.round(r + dr * s), cc = Math.round(c + dc * s);
          if (rr < 0 || cc < 0 || rr >= n || cc >= n) break;
          const d = s * cell;
          const tan = (h[rr * n + cc] - h0 - (d * d) / (2 * radiusM)) / d;
          if (tan > best) best = tan;
        }
        hor[k * N + r * n + c] = best === -Infinity ? -1 : best;
      }
  }
  // Normales del suelo (este, norte geográficos) para la energía según la orientación
  const dx = cell;
  const gE = new Float32Array(N), gN = new Float32Array(N);
  const cn = Math.cos(north), sn = Math.sin(north);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const c0 = Math.max(0, c - 1), c1 = Math.min(n - 1, c + 1), r0 = Math.max(0, r - 1), r1 = Math.min(n - 1, r + 1);
      const gx = (h[r * n + c1] - h[r * n + c0]) / ((c1 - c0) * dx); // hacia +columna (derecha de la malla)
      const gy = (h[r0 * n + c] - h[r1 * n + c]) / ((r1 - r0) * dx); // hacia arriba de la malla
      // de ejes de malla a este/norte geográficos (la malla está girada «north» respecto al norte)
      gE[r * n + c] = gx * cn - gy * sn;
      gN[r * n + c] = gx * sn + gy * cn;
    }
  const lit = new Float32Array(N), irr = new Float32Array(N), seen = new Uint8Array(N), maxDot = new Float32Array(N);
  const phi = (lat * Math.PI) / 180;
  const decl = [-1, -0.5, 0, 0.5, 1].map((f) => (f * tiltDeg * Math.PI) / 180);
  let total = 0;
  for (const d of decl)
    for (let H = -180; H < 180; H += 7.5) {
      total++;
      const hr = (H * Math.PI) / 180;
      const sinE = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(hr);
      const e = Math.asin(Math.max(-1, Math.min(1, sinE)));
      if (e <= -0.01) continue; // noche (el radio del Sol visto desde la Luna ≈ 0,27°)
      const A = Math.atan2(Math.sin(hr), Math.cos(hr) * Math.sin(phi) - Math.tan(d) * Math.cos(phi)) + Math.PI;
      const kf = ((A / (2 * Math.PI)) * nAz) % nAz;
      const k0 = Math.floor(kf), k1 = (k0 + 1) % nAz, t = kf - k0;
      const tanE = Math.tan(e);
      const sE = Math.cos(e) * Math.sin(A), sN = Math.cos(e) * Math.cos(A), sU = Math.sin(e);
      for (let i = 0; i < N; i++) {
        const hz = hor[k0 * N + i] * (1 - t) + hor[k1 * N + i] * t;
        if (tanE <= hz) continue;
        lit[i]++;
        seen[i] = 1;
        const nx = -gE[i], ny = -gN[i];
        const dot = (nx * sE + ny * sN + sU) / Math.hypot(nx, ny, 1);
        if (dot > 0) {
          irr[i] += dot;
          if (dot > maxDot[i]) maxDot[i] = dot;
        }
      }
    }
  let psrCnt = 0, litSum = 0;
  const psr = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    lit[i] /= total;
    irr[i] /= total;
    litSum += lit[i];
    if (!seen[i]) {
      psr[i] = 1;
      psrCnt++;
    }
  }
  return { lit, irr, psr, psrPct: (100 * psrCnt) / N, litMean: litSum / N, maxDot };
}

// Temperatura por equilibrio radiativo (albedo 0,12, emisividad 0,95) e hielo estable por debajo de 110 K.
// Sombra permanente: calor interno (~0,02 W/m²) + luz y calor reflejados por el terreno iluminado cercano (radio ~700 m),
// con un factor CALIBRADO (0,006) para que el fondo de los grandes cráteres dé 40–90 K como mide Diviner (Paige et al. 2010).
export const ICE_K = 110;
export function iceModel(sun: SunMap, n: number, cellM: number, solarWm2: number): IceMap {
  const N = n * n;
  const k = 0.95 * 5.670e-8;
  const absorbed = (1 - 0.12) * solarWm2;
  const fGeo = 0.02;
  // flujo medio que reciben los vecinos (para el reflejo / calor de paredes): media en ventana
  const R = Math.max(1, Math.round(700 / cellM));
  const pre = new Float64Array((n + 1) * (n + 1));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) pre[(r + 1) * (n + 1) + c + 1] = absorbed * sun.maxDot[r * n + c] + pre[r * (n + 1) + c + 1] + pre[(r + 1) * (n + 1) + c] - pre[r * (n + 1) + c];
  const tmax = new Float32Array(N), tmean = new Float32Array(N), cls = new Uint8Array(N);
  let surf = 0, buried = 0, coldest = Infinity;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const r0 = Math.max(0, r - R), r1 = Math.min(n, r + R + 1), c0 = Math.max(0, c - R), c1 = Math.min(n, c + R + 1);
      const sumN = pre[r1 * (n + 1) + c1] - pre[r0 * (n + 1) + c1] - pre[r1 * (n + 1) + c0] + pre[r0 * (n + 1) + c0];
      const fSec = 0.006 * (sumN / ((r1 - r0) * (c1 - c0)));
      const i = r * n + c;
      tmax[i] = Math.pow((absorbed * sun.maxDot[i] + fGeo + fSec) / k, 0.25);
      tmean[i] = Math.pow((absorbed * sun.irr[i] + fGeo + fSec) / k, 0.25);
      if (tmax[i] < ICE_K) { cls[i] = 2; surf++; }
      else if (tmean[i] < ICE_K) { cls[i] = 1; buried++; }
      if (tmax[i] < coldest) coldest = tmax[i];
    }
  return { tmax, tmean, cls, surfPct: (100 * surf) / N, buriedPct: (100 * buried) / N, coldestK: coldest };
}

export function planBase(g: HeightGrid, body: PlanetBody, lat: number, lon: number, opt: PlanOptions = {}): BasePlan {
  const { heights: h, n, widthM, heightM } = g;
  const cellM = widthM / (n - 1);
  const slope = slopeGrid(g);
  const flat = windowMean(slope, n, Math.max(1, Math.round(150 / cellM)));
  const polar = Math.abs(lat) >= RULES.polarLat;
  const sun = sunlight(g, opt.sunLat ?? lat, opt.tiltDeg ?? BODY[body].tilt, opt.radiusM ?? BODY[body].radius);
  const L = sun.lit;
  const ice = body === "moon" && opt.sunLat === undefined ? iceModel(sun, n, cellM, 1361) : null;

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
    // En el polo lunar manda la luz calculada (horas de sol), con un poco de altura como desempate
    return flat[r * n + c] + (dist(s, centre) / (0.25 * widthM)) * 2.5 - (body === "moon" && polar ? L[r * n + c] * 8 + elev : 0);
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
    // Los puntos con más horas de sol (relieve real), no solo los más altos
    cand.sort((a, b) => L[b.r * n + b.c] - L[a.r * n + a.c] || b.h - a.h);
    for (const s of cand) if (spots.length < 3 && spots.every((o) => dist(o, s) >= 600) && dist(s, habitat) >= 150) spots.push(s);
    used.push(...spots);
    if (!spots.length) spots.push(pick((r, c) => -L[r * n + c], ring(habitat, 200, 1500)));
    power = { kind: "solar-masts", spots };
  } else {
    // Campo solar donde el suelo recibe más energía: cuenta la orientación de la ladera y las sombras
    const field = pick((r, c) => flat[r * n + c] * 0.6 + dist(spot(r, c), habitat) / 500 - sun.irr[r * n + c] * 12, (r, c) => ring(habitat, 250, 900)(r, c) && flat[r * n + c] < 12);
    const reactor = pick(
      (r, c) => flat[r * n + c] + Math.abs(dist(spot(r, c), habitat) - RULES.reactorM) / 300,
      (r, c) => ring(habitat, 700, 1600)(r, c) && dist(spot(r, c), pad) > 800,
    );
    // Luna fuera del polo: 14 días de noche → el reactor manda. Marte: tormentas de polvo → igual.
    power = { kind: body === "moon" ? "solar-fission" : "fission-solar", spots: [field, reactor] };
  }

  // 4. Recursos (ISRU).
  // Luna: hielo SOLO donde el modelo térmico lo permite: trampa fría en superficie (< 110 K) o, si no hay,
  // hielo enterrado bajo suelo que de media sigue por debajo de 110 K. Si no hay ninguna de las dos, no hay hielo.
  let isru: BasePlan["isru"];
  let noIce: BasePlan["noIce"] = "";
  let iceClass: 0 | 1 | 2 = 0;
  let plant: Spot | null = null;
  const wantKind = opt.isruKind;
  const clsAt = (r: number, c: number) => (ice ? ice.cls[r * n + c] : 0);
  const anyCls = (k: number) => {
    for (let r = margin; r < n - margin; r++) for (let c = margin; c < n - margin; c++) if (clsAt(r, c) >= k) return true;
    return false;
  };
  const target: 0 | 1 | 2 = ice ? (anyCls(2) ? 2 : anyCls(1) ? 1 : 0) : 0;
  if (wantKind === "ice-shadow" || (!wantKind && body === "moon" && target > 0)) {
    iceClass = wantKind ? 2 : target;
    // Planta de extracción: en el borde con más sol (energía para calentar el regolito), cerca del hábitat
    plant = pick((r, c) => -L[r * n + c] * 6 + flat[r * n + c] / 6 + dist(spot(r, c), habitat) / 800, (r, c) => ring(habitat, 250, 900)(r, c) && flat[r * n + c] < 12);
    // Excavación: el punto más cercano de la clase elegida (en un ensayo terrestre: el suelo con menos sol)
    isru = {
      kind: "ice-shadow",
      spot: pick(
        (r, c) => (wantKind ? L[r * n + c] * 20 : 0) + dist(spot(r, c), plant!) / 1000 + flat[r * n + c] / 10,
        (r, c) => (wantKind ? true : clsAt(r, c) >= target) && dist(spot(r, c), plant!) >= 400,
      ),
    };
  } else if (wantKind === "ice-ground" || (!wantKind && body === "mars" && Math.abs(lat) >= RULES.marsIceLat)) {
    isru = { kind: "ice-ground", spot: pick((r, c) => flat[r * n + c] + Math.abs(dist(spot(r, c), habitat) - 500) / 200, ring(habitat, 300, 900)) };
  } else {
    if (body === "moon" && !wantKind) noIce = polar ? "no-psr" : "not-polar";
    isru = {
      kind: wantKind ?? (body === "moon" ? "oxygen-regolith" : "oxygen-co2"),
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
  const start = plant ?? habitat; // con hielo, el rover hace de acarreo: planta ↔ zona de excavación
  let limit: number = RULES.roverLimitDeg;
  let path = route(h, n, cellM, start, goal, limit);
  while (!path && limit < 35) {
    limit += 5;
    path = route(h, n, cellM, start, goal, limit);
  }
  const cells = path ?? [start, goal].map((s) => [s.r, s.c] as [number, number]);
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
    sun,
    ice,
    iceClass,
    plant,
    habitatLit: L[habitat.r * n + habitat.c],
    powerLit: Math.max(...power.spots.slice(0, power.kind === "solar-masts" ? 3 : 1).map((s) => L[s.r * n + s.c])),
    noIce,
    conditions: conditions(body, lat, lon, stats, habitat.h, sun, L[habitat.r * n + habitat.c], noIce, ice),
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

function conditions(body: PlanetBody, lat: number, lon: number, s: BasePlan["stats"], habH: number, sunMap: SunMap, habLit: number, noIce: BasePlan["noIce"], ice: IceMap | null): Condition[] {
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
    {
      label: "Sun at the habitat",
      value: `${Math.round(habLit * 100)} % of the time`,
      note: "Computed from the real relief: the Sun's path over a day and a year against each point's horizon (inside the 11 km patch only).",
      kind: "data",
    },
  ];
  if (ice)
    out.push(
      {
        label: "Coldest ground",
        value: `${Math.round(ice.coldestK)} K (${Math.round(ice.coldestK - 273)} °C)`,
        note: "Daily maximum in the coldest spot, from a simple radiative model calibrated to LRO Diviner (40–90 K in large polar craters).",
        kind: "data",
      },
      {
        label: "Ice at the surface",
        value: `${ice.surfPct.toFixed(1)} % of the patch`,
        note: "Ground whose maximum stays below 110 K: ice there outlasts the solar system (Hayne et al. 2021). Mixed into the soil, a few % by mass.",
        kind: "data",
      },
      {
        label: "Buried ice possible",
        value: `${ice.buriedPct.toFixed(1)} % of the patch`,
        note: "Sunlit at times but cold on average: ice can survive centimetres to decimetres down ('lunar permafrost', Paige et al. 2010).",
        kind: "data",
      },
    );
  if (body === "moon")
    out.push({
      label: "Permanent shadow",
      value: `${sunMap.psrPct.toFixed(1)} % of the patch`,
      note:
        noIce === "not-polar"
          ? "Away from the poles every point sees the Sun for two weeks a month: no ice can survive."
          : sunMap.psrPct > 0
            ? "Ground the Sun never reaches in our model: the only place lunar water ice can last (LCROSS, LRO)."
            : "No ground in this patch stays dark all year, so no ice is expected here.",
      kind: "data",
    });
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
