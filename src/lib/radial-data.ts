// AI-assisted (Claude), reviewed by team Logos
// Radial dial data: PURE function (no React, no imported JSON) → list of rings. Tested with the real data (radial-data.test.mjs).
// cyan = mission conditions · grey = shape vs target · amber = permits and politics.
import { conditionStatus } from "./rules.ts";

export type RingGroup = "mission" | "shape" | "access";
export type RingStatus = "in range" | "accepted" | "out of range" | "none";
export interface Ring { id: string; group: RingGroup; label: string; /** 0..1; null = no data (empty dotted ring) */ value: number | null; /** actual value, readable */ text: string; status: RingStatus }

export interface CondIn { id: string; label: string; unit: string; ideal: string | null; tolerance: number | null; value: number | null; similarity: number | null }
export interface ShapeIn { reliefM: number; slopeMeanDeg: number }
export interface AccessIn { score: number | null; level: string }

const num = (x: number, unit: string) => {
  const a = Math.abs(x), s = a === 0 ? "0" : a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : a >= 1 ? x.toFixed(2) : x.toFixed(3);
  const u = unit === "index" || unit === "0-1" || unit === "0/1" ? "" : unit === "degC" ? " °C" : unit === "deg" ? "°" : unit === "%" ? " %" : ` ${unit}`;
  if (unit === "months/yr") return `${Number.isInteger(x) ? x : x.toFixed(1)} ${x === 1 ? "month" : "months"}`;
  return unit === "0/1" ? (x >= 0.5 ? "yes" : "no") : s + u;
};
/** Shape likeness: smaller/larger ratio (1 = equal; symmetric: flatter or steeper than the target is penalised equally). */
export const shapeRatio = (site: number, target: number): number => (site <= 0 && target <= 0 ? 1 : Math.min(site, target) / Math.max(site, target));

export function buildRings(conds: CondIn[], site: ShapeIn | null, target: ShapeIn | null, access: AccessIn): Ring[] {
  const rings: Ring[] = conds.map((c) => {
    if (c.value === null || c.similarity === null) return { id: c.id, group: "mission", label: c.label, value: null, text: "no data", status: "none" };
    const st = c.ideal !== null && c.tolerance !== null ? conditionStatus(c.value, c.ideal, c.tolerance) : c.similarity >= 0.5 ? "accepted (within tolerance)" : "out of range";
    const status: RingStatus = st === "in range" ? "in range" : st === "out of range" ? "out of range" : "accepted";
    return { id: c.id, group: "mission", label: c.label, value: Math.min(1, Math.max(0, c.similarity)), text: `${num(c.value, c.unit)} · ${status}`, status };
  });
  const shape = (id: string, label: string, pick: (s: ShapeIn) => number, unit: string): Ring =>
    site && target
      ? { id, group: "shape", label, value: shapeRatio(pick(site), pick(target)), text: `${num(pick(site), unit)} vs ${num(pick(target), unit)} target`, status: "none" }
      : { id, group: "shape", label, value: null, text: "no terrain data", status: "none" };
  rings.push(shape("relief", "Relief over 11 km", (s) => s.reliefM, "m"), shape("slope", "Mean slope", (s) => s.slopeMeanDeg, "deg"));
  rings.push(access.score === null
    ? { id: "access", group: "access", label: "Access complexity", value: null, text: "not assessed", status: "none" }
    : { id: "access", group: "access", label: "Access complexity", value: Math.min(1, Math.max(0, access.score)), text: `${access.score.toFixed(2)} of 1 · ${access.level.toLowerCase()}`, status: "none" });
  return rings;
}

// ---------- geometry shared by the dial and the mockup ----------
export interface RingGeo { ring: Ring; r: number; /** degrees at the end of the arc, 0 = top, clockwise */ endDeg: number; x: number; y: number }
export const DIAL = { size: 260, outer: 122, stroke: 8, pitch: 11, groupGap: 4 };
export function dialGeometry(rings: Ring[]): RingGeo[] {
  let r = DIAL.outer, prev: RingGroup | null = null;
  return rings.map((ring) => {
    if (prev !== null) r -= DIAL.pitch + (ring.group !== prev ? DIAL.groupGap : 0);
    prev = ring.group;
    const endDeg = (ring.value ?? 0) * 360, a = ((endDeg - 90) * Math.PI) / 180;
    return { ring, r, endDeg, x: DIAL.size / 2 + r * Math.cos(a), y: DIAL.size / 2 + r * Math.sin(a) };
  });
}
/** Full sentence for screen readers. */
export const dialLabel = (index: string, rings: Ring[]): string =>
  `Analog index ${index}. ` + rings.map((g) => `${g.label}: ${g.text}${g.value === null ? "" : `, ring ${Math.round(g.value * 100)} percent`}`).join(". ") + ".";
export const GROUP_COLOR: Record<RingGroup, string> = { mission: "#5ee6ff", shape: "#b9c2d3", access: "#ffb454" };
export const GROUP_NAME: Record<RingGroup, string> = { mission: "Mission conditions", shape: "Shape vs target", access: "Permits and politics" };
