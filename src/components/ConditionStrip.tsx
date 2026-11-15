// AI-assisted (Claude), reviewed by team Logos. Design by the team's "Orbit v2" art direction.
// One mission condition as a range strip: the IDEAL band (solid), the ACCEPTED band (dashed: fit ≥ 0.5),
// the value here (dot) and, when it exists, the target's value (tick). The fit is measured against the
// mission range, not against the target value.
import { acceptance, parseIdeal } from "@/lib/rules";
import { fmt } from "@/lib/missions";

const AXES: Record<string, [number, number]> = { ndvi: [0, 0.9], albedo: [0, 0.9], precip: [0, 2000], sand: [0, 100], lst_mean: [-80, 40], low_sun_months: [0, 12], polar_night_months: [0, 12] };
const W = 380, X0 = 8, SPAN = 364;

export const hasStrip = (id: string, ideal: string | null, tol: number | null) => id in AXES && !!ideal && !!tol;

export function rangeText(ideal: string, unit: string, tolerance?: number | null) {
  const [lo, hi] = parseIdeal(ideal), u = unit === "index" || unit === "0-1" ? "" : unit;
  const acc = tolerance ? acceptance(ideal, tolerance) : null;
  if (lo === -Infinity) return `${fmt(hi, u)} or less${acc ? ` (accepted up to ${fmt(acc[1], u)})` : ""}`;
  if (hi === Infinity) return `${fmt(lo, u)} or more${acc ? ` (accepted from ${fmt(acc[0], u)})` : ""}`;
  return `${fmt(lo)} to ${fmt(hi, u)}${acc ? ` (accepted ${fmt(Math.max(0, acc[0]))} to ${fmt(acc[1], u)})` : ""}`;
}

export default function ConditionStrip({ id, label, ideal, tolerance, value, target, targetEstimate, unit }: { id: string; label: string; ideal: string; tolerance: number; value: number; target: number | null; targetEstimate: boolean; unit: string }) {
  const [a0, a1] = AXES[id], cl = (v: number) => Math.min(a1, Math.max(a0, v)), x = (v: number) => X0 + ((cl(v) - a0) / (a1 - a0)) * SPAN;
  const [lo, hi] = parseIdeal(ideal), [alo, ahi] = acceptance(ideal, tolerance);
  const band = (l: number, h: number) => ({ x: x(l), w: Math.max(2, x(h) - x(l)) });
  const A = band(alo, ahi), I = band(lo, hi), here = x(value), tx = target === null ? null : x(target);
  const u = unit === "index" || unit === "0-1" ? "" : unit;
  return (
    <svg viewBox={`0 0 ${W} 50`} className="block h-auto w-full overflow-visible" role="img" aria-label={`${label}: here ${fmt(value, u)}; mission range ${rangeText(ideal, unit)}${target !== null ? `; target ${fmt(target, u)}` : ""}.`}>
      <rect x={X0} y={21} width={SPAN} height={2} fill="var(--line2)" />
      <rect x={A.x} y={13} width={A.w} height={18} rx={9} fill="rgba(93,180,255,.10)" stroke="rgba(93,180,255,.5)" strokeDasharray="3 3" />
      <rect x={I.x} y={13} width={I.w} height={18} rx={9} fill="rgba(93,180,255,.40)" />
      {tx !== null && <><line x1={tx} x2={tx} y1={7} y2={37} stroke="var(--moon)" strokeWidth={2} /><text x={tx < W - 120 ? tx + 5 : tx - 5} y={9} textAnchor={tx < W - 120 ? "start" : "end"} fill="var(--moon)" fontFamily="var(--mono)" fontSize="10">target {targetEstimate ? "≈ " : ""}{fmt(target, u)}{target !== null && target < a0 ? " (off scale)" : ""}</text></>}
      <g className="dot-slide" style={{ ["--from" as string]: `${(tx === null ? X0 - here : tx - here).toFixed(0)}px` }}>
        <circle cx={here} cy={22} r={6.5} fill="var(--earth)" stroke="var(--bg)" strokeWidth={2} /><circle cx={here} cy={22} r={9.5} fill="none" stroke="#fff" strokeWidth={1.5} />
      </g>
      {[a0, (a0 + a1) / 2, a1].map((t, i) => <text key={t} x={x(t)} y={47} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} fill="var(--dim)" fontFamily="var(--mono)" fontSize="10">{fmt(t, i === 2 ? u : "")}</text>)}
    </svg>
  );
}
