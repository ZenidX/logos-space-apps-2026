// AI-assisted (Claude), reviewed by team Logos
// Acceptance band of a condition. Similarity = exp(−½ (d/τ)²), with d = distance to the ideal range and τ = tolerance;
// the rule is met when similarity ≥ 0.5, i.e. at ≤ 1.1774·τ from the range (docs/method.md). Checked against every similarity in sites.json (rules.test.mjs).
export const K = Math.sqrt(2 * Math.LN2); // 1.1774
/** "<= 0.05" → [-∞, 0.05] · "<= -5" → [-∞, -5] · ">= 50" → [50, ∞] · "0.07-0.20" → [0.07, 0.2] · "1" → [1, 1] */
export function parseIdeal(t: string): [number, number] {
  const s = t.trim(), num = "(-?\\d+(?:\\.\\d+)?)";
  let m = s.match(new RegExp(`^<=\\s*${num}$`)); if (m) return [-Infinity, Number(m[1])];
  m = s.match(new RegExp(`^>=\\s*${num}$`)); if (m) return [Number(m[1]), Infinity];
  m = s.match(new RegExp(`^${num}\\s*[-–]\\s*(\\d+(?:\\.\\d+)?)$`)); if (m) return [Number(m[1]), Number(m[2])]; // "a-b": the 2nd number has no sign
  m = s.match(new RegExp(`^${num}$`)); if (m) return [Number(m[1]), Number(m[1])];
  throw new Error(`unrecognised ideal: "${t}"`);
}
export const similarity = (value: number, ideal: string, tol: number): number => {
  const [lo, hi] = parseIdeal(ideal), d = Math.max(lo - value, 0, value - hi);
  return Math.exp(-0.5 * (d / tol) ** 2);
};
/** Range in which the rule is met (ideal ± K·τ). */
export const acceptance = (ideal: string, tol: number): [number, number] => {
  const [lo, hi] = parseIdeal(ideal);
  return [lo - K * tol, hi + K * tol];
};

/** What the app says about one condition: "in range" only inside the ideal range; "accepted" when the rule is met by tolerance. */
export type ConditionStatus = "in range" | "accepted (within tolerance)" | "out of range";
export function conditionStatus(value: number, ideal: string, tol: number): ConditionStatus {
  const [lo, hi] = parseIdeal(ideal), [alo, ahi] = acceptance(ideal, tol);
  if (value >= lo && value <= hi) return "in range";
  return value >= alo && value <= ahi ? "accepted (within tolerance)" : "out of range";
}
