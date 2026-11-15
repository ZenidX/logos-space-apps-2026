// Submisiones de una base (página /base/). La misión global es una sola: montar y mantener una base permanente
// en el sitio elegido. Las submisiones son las operaciones que se repiten mientras la base funciona; cada una
// tiene un veredicto en ESE sitio (con su relieve real) y una tarea de operations.json para ensayarla en la Tierra.
// Lógica pura: se puede probar en Node.
import { slopeGrid, RULES, type BasePlan, type HeightGrid } from "@/lib/base-plan";

export type FocusKey = "pad" | "habitat" | "power" | "isru" | "route" | "eva";
export type Level = "good" | "limited" | "hard";

export interface SubMission {
  id: string;
  name: string;
  cadence: string; // con qué frecuencia se repite (suposición razonada)
  needs: string; // qué necesita del terreno, en cualquier sitio
  level: Level;
  verdict: string; // qué ofrece ESTE sitio
  tasks: string[]; // ids de operations.json (ensayo en la Tierra)
  focus: FocusKey;
}

const km = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

// Pendiente media a ≤ radio del hábitat (zona de paseo).
function meanSlopeAround(p: BasePlan, g: HeightGrid, radiusM: number) {
  const { n, widthM, heightM } = g;
  let sum = 0, cnt = 0;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const x = (c / (n - 1) - 0.5) * widthM, z = (r / (n - 1) - 0.5) * heightM;
      if (Math.hypot(x - p.habitat.x, z - p.habitat.z) > radiusM) continue;
      sum += p.slope[r * n + c];
      cnt++;
    }
  return cnt ? sum / cnt : 0;
}

export function subMissions(p: BasePlan, g: HeightGrid): SubMission[] {
  const moon = p.body === "moon";
  const out: SubMission[] = [];

  out.push({
    id: "transport",
    name: "Transport & resupply",
    cadence: "Cargo and crew landers, every few months",
    needs: "Flat, firm ground for repeated landings, far enough from the habitat that engine blast does not hit it.",
    level: p.pad.slope < 3 ? "good" : p.pad.slope < 8 ? "limited" : "hard",
    verdict: `Pad on ${p.pad.slope.toFixed(1)}° ground, ${km(dist(p.pad, p.habitat))} from the habitat.`,
    tasks: ["landing_pad"],
    focus: "pad",
  });

  out.push({
    id: "construction",
    name: "Construction & shielding",
    cadence: "Continuous: berms, roads, new modules",
    needs: "Plenty of buildable ground and loose regolith to pile over the modules against radiation.",
    level: p.stats.flatPct >= 60 ? "good" : p.stats.flatPct >= 30 ? "limited" : "hard",
    verdict: `${Math.round(p.stats.flatPct)} % of this patch is under ${RULES.flatDeg}°.`,
    tasks: ["regolith_build"],
    focus: "habitat",
  });

  const ice = p.isru.kind === "ice-shadow" || p.isru.kind === "ice-ground";
  out.push({
    id: "water",
    name: "Water & oxygen",
    cadence: "Daily: mining, melting, splitting",
    needs: moon ? "Water ice within reach: only in permanently shadowed polar ground." : "Shallow ground ice (mostly poleward of ~35°), or else the CO₂ air for oxygen.",
    level: ice ? (p.isru.kind === "ice-shadow" ? "limited" : "good") : "hard",
    verdict:
      p.isru.kind === "ice-shadow"
        ? `Candidate ice in the lowest, darkest ground ${km(dist(p.isru.spot, p.habitat))} away: crews must work in the deep cold.`
        : p.isru.kind === "ice-ground"
          ? `Ice likely within metres at ${Math.abs(p.lat).toFixed(0)}° latitude; drill ${km(dist(p.isru.spot, p.habitat))} from the habitat.`
          : moon
            ? "No ice expected this far from the poles: oxygen from regolith, water shipped from Earth."
            : "No shallow ice expected here: oxygen from the CO₂ air, water is the hard part.",
    tasks: ice ? (p.isru.kind === "ice-shadow" ? ["permafrost_drill", "cold_trap"] : ["permafrost_drill"]) : moon ? ["regolith_build"] : [],
    focus: "isru",
  });

  out.push({
    id: "power",
    name: "Power",
    cadence: "Around the clock",
    needs: moon ? "Sunlit high ground near the pole, or a reactor to survive the two-week lunar night." : "Solar plus a reactor: dust storms can dim the Sun for weeks.",
    level: p.power.kind === "solar-masts" ? "good" : "limited",
    verdict:
      p.power.kind === "solar-masts"
        ? `${p.power.spots.length} vertical solar masts on the highest points; the Sun grazes the horizon at ${(90 - Math.abs(p.lat) + 1.54).toFixed(1)}° at most.`
        : moon
          ? "Away from the pole every night lasts ~14.8 Earth days: a fission reactor ~1 km away carries the base."
          : "Fission reactor ~1 km away plus a solar field next to the habitat.",
    tasks: p.power.kind === "solar-masts" ? ["grazing_sun"] : moon ? [] : ["power_mars"],
    focus: "power",
  });

  out.push({
    id: "exploration",
    name: "Exploration traverses",
    cadence: "Rover sorties, every week",
    needs: `Routes the rover can drive: slopes under ${RULES.roverLimitDeg}°.`,
    level: p.routeLimitDeg <= RULES.roverLimitDeg ? "good" : p.routeLimitDeg <= 30 ? "limited" : "hard",
    verdict: `${km(p.routeLenM)} to ${p.isru.kind === "ice-shadow" ? "the ice site" : "the science stop"}, steepest stretch ${p.routeMaxGrade.toFixed(0)}°${p.routeLimitDeg > RULES.roverLimitDeg ? ` (no route under ${RULES.roverLimitDeg}°)` : ""}.`,
    tasks: ["rover_traverse"],
    focus: "route",
  });

  const evaSlope = meanSlopeAround(p, g, p.evaRadiusM);
  out.push({
    id: "eva",
    name: "Science EVAs",
    cadence: "Spacesuit walks, several a week",
    needs: `Walkable ground within ${km(p.evaRadiusM)} of the habitat, in the cold and in a suit.`,
    level: evaSlope < 10 ? "good" : evaSlope < 18 ? "limited" : "hard",
    verdict: `Mean slope ${evaSlope.toFixed(1)}° within ${km(p.evaRadiusM)} of the habitat.`,
    tasks: ["eva_cold_rough"],
    focus: "eva",
  });

  if (!moon)
    out.push({
      id: "dust",
      name: "Dust & maintenance",
      cadence: "Weekly cleaning, seals, filters",
      needs: "Keeping panels, seals and suits working in fine, wind-blown dust.",
      level: "limited",
      verdict: "Dust settles everywhere on Mars; global storms come every few Mars years.",
      tasks: ["dust_ops"],
      focus: "power",
    });

  const pole = Math.abs(p.lat) >= RULES.polarLat;
  const near = Math.abs(((p.lon + 540) % 360) - 180) < 90;
  out.push({
    id: "crew",
    name: "Crew life & comms",
    cadence: "Every day of a months-long stay",
    needs: "Living isolated, with delayed or broken contact with Earth.",
    level: moon ? (pole ? "limited" : near ? "good" : "hard") : "limited",
    verdict: moon
      ? pole
        ? "Earth sits on the horizon: contact comes and goes; relay satellites needed."
        : near
          ? "Near side: Earth is always in view, ~2.6 s round trip."
          : "Far side: Earth is never in view, every call goes through a relay satellite."
      : "4–24 min one-way delay: the crew must act on their own.",
    tasks: ["isolation"],
    focus: "habitat",
  });
  return out;
}

// ---------- Forma del terreno: con qué se compara un sitio de la Tierra ----------
// Histograma de pendientes (0–5, 5–10, 10–20, 20–30, > 30°) + relieve. Misma caja (11 km) y misma rejilla.
export interface ShapeSig {
  hist: number[];
  reliefM: number;
}
const BINS = [5, 10, 20, 30];

export function shapeSig(g: HeightGrid): ShapeSig {
  const s = slopeGrid(g);
  const hist = [0, 0, 0, 0, 0];
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < s.length; i++) {
    let b = BINS.findIndex((x) => s[i] < x);
    if (b < 0) b = 4;
    hist[b]++;
    lo = Math.min(lo, g.heights[i]);
    hi = Math.max(hi, g.heights[i]);
  }
  return { hist: hist.map((v) => v / s.length), reliefM: hi - lo };
}

// 0–1: 70 % reparto de pendientes (intersección de histogramas) + 30 % relieve (menor / mayor).
export function shapeMatch(a: ShapeSig, b: ShapeSig): number {
  const inter = a.hist.reduce((acc, v, i) => acc + Math.min(v, b.hist[i]), 0);
  const rel = Math.min(a.reliefM, b.reliefM) / Math.max(1, a.reliefM, b.reliefM);
  return 0.7 * inter + 0.3 * rel;
}
