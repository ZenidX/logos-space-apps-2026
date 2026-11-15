// Busca los mejores sitios para una base en la Luna y en Marte, valorando TODOS los aspectos con el mismo modelo que la
// página /base/ (src/lib/base-plan.ts): luz y temperatura reales del relieve, hielo, terreno edificable, pista, ruta.
// Uso:  node --experimental-strip-types scripts/base/find-sites.mts   →   src/data/base-sites.json
// Luna: barrido del polo sur (84°–89,5°S) con LOLA (Moon Trek). Marte: barrido de las regiones con hielo publicado
// (SWIM/Arcadia, Utopia, Deuteronilus, este de Hellas) con MOLA + HRSC (Mars Trek). Fuentes en docs/sitios-base.md.
import { writeFileSync } from "node:fs";
import { planBase, marsPressurePa, type BasePlan } from "../../src/lib/base-plan.ts";

const T = "https://trek.nasa.gov";
const S = 11000, n = 96;
const MOON_R = 1737400, MARS_R = 3389500;

async function dem(url: string, bbox: string): Promise<Float32Array> {
  for (let tries = 0; tries < 3; tries++) {
    try {
      const r = await fetch(`${url}/exportImage?bbox=${bbox}&size=${n},${n}&pixelType=F32&format=bsq&interpolation=RSP_BilinearInterpolation&f=image`);
      if (!r.ok) throw new Error(String(r.status));
      const b = await r.arrayBuffer();
      if (b.byteLength < n * n * 4) throw new Error("short");
      return new Float32Array(b.slice(0, n * n * 4));
    } catch (e) {
      if (tries === 2) throw e;
    }
  }
  throw new Error("unreachable");
}
async function moonGrid(lat: number, lon: number) {
  const rho = 2 * MOON_R * Math.tan(((90 - Math.abs(lat)) * Math.PI) / 360);
  const x = rho * Math.sin((lon * Math.PI) / 180), y = rho * Math.cos((lon * Math.PI) / 180);
  const svc = Math.abs(lat) >= 87.5 ? "LRO_LOLA_DEM_SPole875_5mp_v04" : "LRO_LOLA_DEM_SPole75_30mp_v04";
  const h = await dem(`${T}/moon/trekarcgis/rest/services/${svc}/ImageServer`, `${x - S / 2},${y - S / 2},${x + S / 2},${y + S / 2}`);
  return { heights: h, n, widthM: S, heightM: S, northBearingDeg: lon };
}
async function marsGrid(lat: number, lon: number) {
  const d = (S / MARS_R) * (180 / Math.PI), dl = d / Math.cos((lat * Math.PI) / 180);
  const h = await dem(`${T}/mars/trekarcgis/rest/services/Mars_MOLA_blend200ppx_HRSC_DEM_clon0dd_200mpp_lzw/ImageServer`, `${lon - dl / 2},${lat - d / 2},${lon + dl / 2},${lat + d / 2}`);
  return { heights: h, n, widthM: S, heightM: S };
}

const lin = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a))); // 0 en a, 1 en b
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

// Puntuaciones 0–1 por aspecto (las mismas ideas que los veredictos de src/lib/submissions.ts)
function common(p: BasePlan) {
  return {
    build: lin(p.stats.flatPct, 15, 70), // terreno edificable (< 10°)
    landing: 1 - lin(p.pad.slope, 2, 10), // pista llana
    traverse: p.routeLimitDeg <= 20 ? 1 : p.routeLimitDeg <= 25 ? 0.6 : 0.2,
  };
}
function moonScores(p: BasePlan) {
  const c = common(p);
  const water = p.iceClass === 2 ? 1 - 0.6 * lin(p.routeLenM, 2000, 8000) : p.iceClass === 1 ? 0.45 : 0;
  const power = lin(p.powerLit, 0.3, 0.75);
  const crew = lin(p.habitatLit, 0.2, 0.7); // luz y calor en el hábitat
  return { ...c, water, power, crew };
}
interface MarsRegion { name: string; ice: string; iceScore: number; src: string; lats: number[]; lons: number[] }
const MARS_REGIONS: MarsRegion[] = [
  { name: "Arcadia Planitia", ice: "Ice within about a metre in places (NASA SWIM maps)", iceScore: 1, src: "SWIM, NASA/JPL 2023", lats: [38, 40, 42, 44, 46], lons: [-170, -165, -160, -155, -150] },
  { name: "Utopia Planitia (west)", ice: "Ice sheet 80–170 m thick under 1–10 m of soil, up to 14,300 km³ of water", iceScore: 0.8, src: "Stuurman et al. 2016", lats: [40, 42, 44, 46, 48], lons: [80, 85, 90, 95, 100] },
  { name: "Deuteronilus Mensae", ice: "Debris-covered glaciers, radar says mostly pure ice", iceScore: 0.7, src: "Plaut et al. 2009", lats: [40, 42, 44, 46], lons: [20, 24, 28, 32] },
  { name: "Eastern Hellas rim", ice: "Buried glaciers 250–450 m thick under a rocky cover", iceScore: 0.7, src: "Holt et al. 2008", lats: [-44, -42, -40, -38], lons: [100, 103, 106, 109] },
];
function marsScores(p: BasePlan, region: MarsRegion, elev: number) {
  const c = common(p);
  const pa = marsPressurePa(elev);
  const oxygen = lin(pa, 450, 1000); // aire más denso: más CO₂ para MOXIE (y más protección y frenado)
  const power = lin(Math.cos((p.lat * Math.PI) / 180), Math.cos((55 * Math.PI) / 180), 1); // más cerca del ecuador, más sol
  return { ...c, water: region.iceScore, oxygen, power, pressurePa: Math.round(pa) };
}
// Nota total: media geométrica ponderada (si un aspecto es 0, el sitio no sirve)
function total(sc: Record<string, number>, w: Record<string, number>) {
  let lw = 0, sw = 0;
  for (const k of Object.keys(w)) {
    lw += w[k] * Math.log(Math.max(0.02, sc[k]));
    sw += w[k];
  }
  return Math.exp(lw / sw);
}

async function pool<T, R>(items: T[], k: number, fn: (t: T) => Promise<R>) {
  const out: R[] = [];
  let i = 0;
  await Promise.all(Array.from({ length: k }, async () => {
    while (i < items.length) {
      const it = items[i++];
      try { out.push(await fn(it)); } catch (e) { console.warn("skip", it, (e as Error).message); }
    }
  }));
  return out;
}

const r2 = (x: number) => Math.round(x * 100) / 100;

// ---------- Luna ----------
const moonPts: { lat: number; lon: number }[] = [];
for (const lat of [-84, -85, -86, -87, -88, -89, -89.5]) {
  const circ = 2 * Math.PI * MOON_R * Math.cos((lat * Math.PI) / 180) / 1000;
  const k = Math.max(4, Math.round(circ / 40));
  for (let i = 0; i < k; i++) moonPts.push({ lat, lon: -180 + (i * 360) / k });
}
console.log(`Moon: ${moonPts.length} points`);
const W_MOON = { water: 1.2, power: 1.2, crew: 0.6, build: 1, landing: 0.8, traverse: 0.6 };
const moon = await pool(moonPts, 6, async ({ lat, lon }) => {
  const g = await moonGrid(lat, lon);
  const p = planBase(g, "moon", lat, lon);
  const sc = moonScores(p);
  return { lat, lon, score: total(sc, W_MOON), scores: Object.fromEntries(Object.entries(sc).map(([k, v]) => [k, r2(v)])), facts: { sunAtHabitat: r2(p.habitatLit), bestSolar: r2(p.powerLit), surfaceIcePct: r2(p.ice?.surfPct ?? 0), buriedIcePct: r2(p.ice?.buriedPct ?? 0), coldestK: Math.round(p.ice?.coldestK ?? 0), iceHaulKm: p.iceClass ? r2(p.routeLenM / 1000) : null, buildablePct: Math.round(p.stats.flatPct), padSlope: r2(p.pad.slope), habitatToPadKm: r2(dist(p.habitat, p.pad) / 1000) } };
});
moon.sort((a, b) => b.score - a.score);

// ---------- Marte ----------
const marsPts = MARS_REGIONS.flatMap((region) => region.lats.flatMap((lat) => region.lons.map((lon) => ({ lat, lon, region }))));
console.log(`Mars: ${marsPts.length} points`);
const W_MARS = { water: 1.2, oxygen: 1, power: 0.8, build: 1, landing: 0.8, traverse: 0.5 };
const W_WO = { water: 1, oxygen: 1 }; // solo agua + oxígeno
const mars = await pool(marsPts, 6, async ({ lat, lon, region }) => {
  const g = await marsGrid(lat, lon);
  const p = planBase(g, "mars", lat, lon);
  let sum = 0;
  for (let i = 0; i < g.heights.length; i++) sum += g.heights[i];
  const elev = sum / g.heights.length;
  const sc = marsScores(p, region, elev);
  const { pressurePa, ...s } = sc;
  return { lat, lon, region: region.name, ice: region.ice, iceSource: region.src, score: total(s, W_MARS), waterOxygen: total(s, W_WO), scores: Object.fromEntries(Object.entries(s).map(([k, v]) => [k, r2(v)])), facts: { elevationM: Math.round(elev), pressurePa, buildablePct: Math.round(p.stats.flatPct), padSlope: r2(p.pad.slope), sunAtHabitat: r2(p.habitatLit) } };
});
mars.sort((a, b) => b.score - a.score);

// Los mejores, separados ≥ 150 km para no repetir el mismo sitio
function spread<T extends { lat: number; lon: number; region?: string }>(list: T[], R: number, minKm: number, k: number, perRegion = 99) {
  const out: T[] = [];
  const count = new Map<string, number>();
  const gc = (a: T, b: T) => {
    const p1 = (a.lat * Math.PI) / 180, p2 = (b.lat * Math.PI) / 180, dl = ((b.lon - a.lon) * Math.PI) / 180;
    return (R / 1000) * Math.acos(Math.min(1, Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl)));
  };
  for (const s of list) {
    const reg = s.region ?? "";
    if (out.length < k && (count.get(reg) ?? 0) < perRegion && out.every((o) => gc(o, s) >= minKm)) {
      out.push(s);
      count.set(reg, (count.get(reg) ?? 0) + 1);
    }
  }
  return out;
}
const bestWO = [...mars].sort((a, b) => b.waterOxygen - a.waterOxygen)[0];
const result = {
  generatedAt: new Date().toISOString(),
  method: "scripts/base/find-sites.mts: each point = 11 × 11 km of real elevation run through src/lib/base-plan.ts (sunlight, temperature, ice, slopes, pad, rover route). Total = weighted geometric mean of the aspect scores. Sources: docs/sitios-base.md.",
  searched: { moon: moon.length, mars: mars.length },
  weights: { moon: W_MOON, mars: W_MARS },
  moon: spread(moon, MOON_R, 25, 5),
  mars: spread(mars, MARS_R, 150, 5, 2), // como mucho 2 por región, para tener opciones distintas
  marsWaterOxygen: bestWO,
};
writeFileSync(new URL("../../src/data/base-sites.json", import.meta.url), JSON.stringify(result, null, 1) + "\n");
console.log("MOON best:", result.moon.map((s) => `${s.lat},${s.lon.toFixed(1)} ${s.score.toFixed(2)}`).join(" | "));
console.log("MARS best:", result.mars.map((s) => `${s.region} ${s.lat},${s.lon} ${s.score.toFixed(2)}`).join(" | "));
console.log("MARS water+oxygen:", bestWO.region, bestWO.lat, bestWO.lon, bestWO.waterOxygen.toFixed(2), bestWO.facts);
