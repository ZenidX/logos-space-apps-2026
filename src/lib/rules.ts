// AI-assisted (Claude), reviewed by team Logos
// Banda de aceptación de una condición. Similitud = exp(−½ (d/τ)²), con d = distancia al rango ideal y τ = tolerancia;
// la regla se cumple con similitud ≥ 0,5, es decir a ≤ 1,1774·τ del rango (docs/method.md). Comprobado con las 105 similitudes de sites.json.
export const K = Math.sqrt(2 * Math.LN2); // 1,1774
/** «<= 0.05» → [-∞, 0.05] · «<= -5» → [-∞, -5] · «>= 50» → [50, ∞] · «0.07-0.20» → [0.07, 0.2] · «1» → [1, 1] */
export function parseIdeal(t: string): [number, number] {
  const s = t.trim(), num = "(-?\\d+(?:\\.\\d+)?)";
  let m = s.match(new RegExp(`^<=\\s*${num}$`)); if (m) return [-Infinity, Number(m[1])];
  m = s.match(new RegExp(`^>=\\s*${num}$`)); if (m) return [Number(m[1]), Infinity];
  m = s.match(new RegExp(`^${num}\\s*[-–]\\s*(\\d+(?:\\.\\d+)?)$`)); if (m) return [Number(m[1]), Number(m[2])]; // «a-b»: el 2.º número no lleva signo
  m = s.match(new RegExp(`^${num}$`)); if (m) return [Number(m[1]), Number(m[1])];
  throw new Error(`ideal no reconocido: «${t}»`);
}
export const similarity = (value: number, ideal: string, tol: number): number => {
  const [lo, hi] = parseIdeal(ideal), d = Math.max(lo - value, 0, value - hi);
  return Math.exp(-0.5 * (d / tol) ** 2);
};
/** Rango en el que la regla se cumple (ideal ± K·τ). */
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
