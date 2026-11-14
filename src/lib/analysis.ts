import { LAYERS, SITES, type Layer } from "@/data/catalog";
import eeSamples from "@/data/ee-samples.json";
import type { Target } from "@/data/targets";

interface EeLayer {
  id: string;
  stats?: Record<string, number | null> | null;
  samples?: (number | null)[];
}
const EE = (eeSamples as unknown as { layers: EeLayer[] }).layers;

// Rangos fijos para variables sin estadística global útil a 50 km.
const FALLBACK_RANGE: Record<string, [number, number]> = { slope: [0, 30] };

export interface VariableAnalysis {
  layer: Layer;
  range: [number, number] | null; // rango terrestre robusto (p1–p99)
  extremes: [number, number] | null; // min–max global
  median: number | null;
  samples: (number | null)[]; // por sitio, en el orden de SITES
  target: number | null;
  targetPos: number | null; // 0..1 dentro del rango (recortado)
  targetBeyond: "below" | "above" | null;
  discrimination: number | null; // |media análogos conocidos − control| / rango
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function position(range: [number, number], v: number) {
  return clamp01((v - range[0]) / (range[1] - range[0]));
}

export function analyzeVariables(target: Target): VariableAnalysis[] {
  return LAYERS.map((layer) => {
    const ee = EE.find((l) => l.id === layer.id);
    const s = ee?.stats ?? null;
    const range: [number, number] | null =
      s && s.v_p1 != null && s.v_p99 != null ? [s.v_p1, s.v_p99] : FALLBACK_RANGE[layer.id] ?? null;
    const extremes: [number, number] | null =
      s && s.v_min != null && s.v_max != null ? [s.v_min, s.v_max] : null;
    const samples = ee?.samples ?? SITES.map(() => null);
    const t = target.values[layer.id] ?? null;

    let targetPos: number | null = null;
    let targetBeyond: VariableAnalysis["targetBeyond"] = null;
    if (t != null && range) {
      targetPos = position(range, t);
      // "Fuera de rango" solo si supera los extremos reales de la Tierra (mín./máx.),
      // no el rango robusto p1–p99 usado para posicionar.
      const [lo, hi] = extremes ?? range;
      if (t < lo) targetBeyond = "below";
      else if (t > hi) targetBeyond = "above";
    }

    let discrimination: number | null = null;
    if (range) {
      const known = SITES.map((site, i) => (site.known ? samples[i] : null)).filter((v): v is number => v != null);
      const ctrlIdx = SITES.findIndex((site) => !site.known);
      const ctrl = samples[ctrlIdx];
      if (known.length && ctrl != null) {
        const m = known.reduce((a, b) => a + b, 0) / known.length;
        discrimination = clamp01(Math.abs(m - ctrl) / (range[1] - range[0]));
      }
    }

    return {
      layer,
      range,
      extremes,
      median: s?.v_p50 ?? null,
      samples,
      target: t,
      targetPos,
      targetBeyond,
      discrimination,
    };
  });
}

export const DIMENSIONS = ["Climate", "Surface", "Relief", "Geology", "Ice & water"] as const;

export interface SiteDimensionScore {
  siteId: string;
  dims: Record<string, { score: number | null; n: number }>;
  total: number | null;
}

// Similitud por posición relativa: 1 − |pos(sitio) − pos(objetivo)| en el rango terrestre.
export function scoreSites(vars: VariableAnalysis[]): SiteDimensionScore[] {
  return SITES.map((site, i) => {
    const dims: SiteDimensionScore["dims"] = {};
    for (const d of DIMENSIONS) {
      const scores = vars
        .filter((v) => v.layer.dimension === d && v.range && v.targetPos != null && v.samples[i] != null)
        .map((v) => 1 - Math.abs(position(v.range!, v.samples[i]!) - v.targetPos!));
      dims[d] = {
        score: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
        n: scores.length,
      };
    }
    const valid = Object.values(dims)
      .map((d) => d.score)
      .filter((s): s is number => s != null);
    return {
      siteId: site.id,
      dims,
      total: valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null,
    };
  });
}
