// AI-assisted (Claude), reviewed by team Logos
// Mission model. Data: src/data/sites.json (Logos Datos, v2; method in docs/method.md).
// Each mission comes from real analog field campaigns; each Earth site has a 0–1 match built from
// per-condition similarities combined into an analog index (0.5 · conditions met + 0.5 · closeness to known analogs, method v3), plus where the analogy breaks and access complexity.
import raw from "@/data/sites.json";
import type { GlobeBody } from "@/lib/globe-tex";

export type MissionId = "m1-eva-basalt" | "m2-rover-sand" | "m3-ground-ice";

interface RawValue { value: number | null; unit?: string; source?: string; url?: string | null }
interface RawVar { id: string; label: string; unit: string; why: string; inMatch: boolean; ideal?: string; tolerance?: number; weight?: number; value?: null }
interface RawPV { value: number | null; similarity: number | null; source: string; inMatch?: boolean }
interface RawAccess { level: "low" | "medium" | "high" | null; score: number | null; permitFlag?: string; basis?: string; note?: string; sources?: string[] }
interface RawSite { region?: { cells: number; areaKm2: number } | null; id: string; name: string; country: string | null; lat: number; lon: number; kind: "known" | "new"; match: number | null; matchPercentile?: number | null; perVariable: Record<string, RawPV | null>; breaks: string[]; accessRisk: RawAccess | null; campaign?: string }
interface RawMission {
  id: MissionId; title: string; campaigns: { name: string; url: string }[];
  target: { body: GlobeBody; name: string; lat: number; lon: number; coordSource: string; description?: string; values: Record<string, RawValue> };
  variables: RawVar[]; breaks?: { text: string; source: string; url: string | null }[]; sites: RawSite[];
  validation: { method: string; result: string; landCells?: number; control?: { match: number; matchPercentile: number } };
}
const data = raw as unknown as { generatedAt: string; missions: RawMission[] };

export interface Variable { id: string; label: string; unit: string; why: string; inMatch: boolean; ideal: string | null; tolerance: number | null; weight: number }
export interface PerVar { id: string; label: string; unit: string; value: number | null; similarity: number | null; source: string; inMatch: boolean }
export interface Access { level: "Low" | "Medium" | "High" | "Not assessed"; score: number | null; basis: string; sources: string[]; note: string; permit: string | null }
export interface Site { areaKm2: number | null; id: string; name: string; country: string | null; lat: number; lon: number; kind: "known" | "new"; match: number | null; percentile: number | null; vars: PerVar[]; breaks: string[]; access: Access; campaign: string | null }
export interface Target { name: string; body: GlobeBody; lat: number; lon: number; coordSource: string; description?: string; values: Record<string, RawValue> }
export interface Mission {
  id: MissionId; short: string; title: string; blurb: string; target: Target;
  campaigns: { name: string; url: string }[]; variables: Variable[]; sites: Site[];
  validation: { method: string; result: string; controlPercentile: number | null }; notScored: string[]; keyLimit: string; rehearse: string; matters: string;
  always: { text: string; source: string; url: string | null }[];
}

// Team copy for each mission (short name, one-line pitch, what Earth can never reproduce).
const COPY: Record<MissionId, { short: string; blurb: string; rehearse: string; matters: string; keyLimit: string; notScored: string[]; always: string[] }> = {
  "m1-eva-basalt": {
    short: "Suited EVA on volcanic terrain",
    blurb: "An operational analogue for suited traverses and field geology — not a match to Mons Mouton's highland rock.",
    rehearse: "Suited traverses, sampling and field geology over bare volcanic ground, as in NASA's JETT and Desert RATS tests and ESA's PANGAEA training.",
    matters: "Crews rehearse surface operations on Earth before they fly. Where a test runs decides what it can teach.",
    keyLimit: "Volcanic rock is mapped within ~80 km (0.5° geological map); basalt at the site itself is not confirmed.",
    notScored: ["Rock type at the outcrop — volcanic class comes from a 0.5° map (GLiM)", "Walkable slope — needs a 30 m elevation model"],
    always: ["Gravity: 1.62 m/s² on the Moon vs 9.80 on Earth."],
  },
  "m2-rover-sand": {
    short: "Rover on sand",
    blurb: "Loose, sandy, bare ground where rovers can get stuck — and learn not to.",
    rehearse: "Driving a rover over loose sand and dune slopes, as JPL did with its Scarecrow test rover at Dumont Dunes (2012).",
    matters: "Soft sand can stop a rover. Mobility tests on Earth help set driving limits before landing.",
    keyLimit: "Sand fraction is a soil-model value; dunes are not confirmed on imagery.",
    notScored: ["Dune slopes — needs a 30 m elevation model", "Jezero sand fraction — no comparable value yet"],
    always: ["Gravity: 3.73 m/s² on Mars vs 9.80 on Earth."],
  },
  "m3-ground-ice": {
    short: "Water from ground ice",
    blurb: "Cold, dry regions to screen for possible near-surface ice; the score does not detect ice.",
    rehearse: "Drilling through dry soil into ice-cemented ground, as NASA's TRIDENT drill did at Haughton crater (2024).",
    matters: "Ice near the surface could supply water for crews. Drills must be proven on frozen ground first.",
    keyLimit: "Ground ice is inferred from temperature and dryness; no ice was detected directly.",
    notScored: ["Ground ice itself — temperature is used as a proxy", "Arcadia ice map (NASA SWIM) — server down when we checked"],
    always: ["Gravity: 3.73 m/s² on Mars vs 9.80 on Earth."],
  },
};

const LEVEL: Record<string, Access["level"]> = { low: "Low", medium: "Medium", high: "High" };
const PERMIT_NOTE = "Check national park and research permits before fieldwork.";
function accessOf(a: RawAccess | null): Access {
  if (!a) return { level: "Not assessed", score: null, basis: "", sources: [], note: PERMIT_NOTE, permit: null };
  return {
    level: a.level ? LEVEL[a.level] : "Not assessed",
    score: a.score,
    basis: a.basis ?? "",
    sources: a.sources ?? [],
    note: a.note ?? PERMIT_NOTE,
    permit: a.permitFlag === "ANTARCTIC_TREATY_AREA" ? "Antarctic Treaty area: no country attributed; a national permit is required" : null,
  };
}

const lon180 = (l: number) => (l > 180 ? l - 360 : l);

export const MISSIONS: Mission[] = data.missions.map((m) => {
  const vars: Variable[] = m.variables.map((v) => ({ id: v.id, label: v.label, unit: v.unit, why: v.why, inMatch: v.inMatch, ideal: v.ideal ?? null, tolerance: v.tolerance ?? null, weight: v.weight ?? 0 }));
  const byId = new Map(vars.map((v) => [v.id, v]));
  const sites: Site[] = m.sites.map((s) => ({
    id: s.id,
    areaKm2: s.region?.areaKm2 ?? null,
    name: s.name.replace(/^Candidate cell near /, "").split(" · ").filter((x, i) => !(i === 0 && /^(Asia|Africa|Europe|North America|South America|Oceania)$/.test(x))).slice(0, 2).join(" · "),
    country: s.country,
    lat: s.lat,
    lon: lon180(s.lon),
    kind: s.kind,
    match: s.match,
    percentile: s.matchPercentile ?? null,
    vars: Object.entries(s.perVariable).map(([id, p]) => ({ id, label: byId.get(id)?.label ?? id, unit: byId.get(id)?.unit ?? "", value: p?.value ?? null, similarity: p?.similarity ?? null, source: p?.source ?? "no data", inMatch: p?.inMatch ?? byId.get(id)?.inMatch ?? true })),
    breaks: s.breaks,
    access: accessOf(s.accessRisk),
    campaign: s.campaign ?? null,
  }));
  // New candidates keep the order Logos Datos ranked them in; known analogs by match.
  sites.sort((a, b) => Number(b.kind === "new") - Number(a.kind === "new") || (a.kind === "new" ? 0 : (b.match ?? -1) - (a.match ?? -1)));
  return {
    id: m.id,
    title: m.title,
    ...COPY[m.id],
    always: m.breaks?.length ? m.breaks : COPY[m.id].always.map((text) => ({ text, source: "NASA NSSDC planetary fact sheets", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/" })),
    target: { ...m.target, lon: lon180(m.target.lon) },
    campaigns: m.campaigns,
    variables: vars,
    sites,
    validation: { method: m.validation.method, result: m.validation.result, controlPercentile: m.validation.control?.matchPercentile ?? null },
  };
});

export const DATA_DATE = data.generatedAt.slice(0, 10);
export const missionById = (id: MissionId) => MISSIONS.find((m) => m.id === id)!;

/** Up to 3 match variables' similarities, for the arc segments (null = no data). */
export function arcDims(m: Mission, s: Site): [number | null, number | null, number | null] {
  const ids = m.variables.filter((v) => v.inMatch).sort((a, b) => b.weight - a.weight).slice(0, 3).map((v) => v.id);
  const sim = (id?: string) => (id ? s.vars.find((v) => v.id === id)?.similarity ?? null : null);
  return [sim(ids[0]), sim(ids[1]), sim(ids[2])];
}

/** Analog index (0–1): a ranking index built from team choices and Earth percentiles, not a probability. */
/** The index is shown to two decimals and never as a perfect 1.00: values of 0.99 and above read "≥ 0.99". */
export const TOP = 0.99;
export const idx = (x: number | null) => (x === null ? "–" : x >= TOP ? "≥ 0.99" : x.toFixed(2));
export const TOP_NOTE = "New regions are picked because they sit at the top of the index, so they can score above a known analog. The index compares surface conditions; it is not a measure of suitability.";

export const fmt = (x: number | null, unit = "") => {
  if (x === null || Number.isNaN(x)) return "–";
  const a = Math.abs(x), s = a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : a >= 1 ? x.toFixed(1) : x.toFixed(2);
  const u = unit === "degC" ? " °C" : unit === "deg" ? "°" : unit === "%" ? " %" : unit === "mm/yr" ? " mm/yr" : "";
  return s + u;
};
