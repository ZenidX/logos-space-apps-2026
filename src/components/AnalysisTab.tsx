"use client";

import { useMemo, useState } from "react";
import { SITES } from "@/data/catalog";
import { TARGETS } from "@/data/targets";
import { analyzeVariables, DIMENSIONS, position, scoreSites, type VariableAnalysis } from "@/lib/analysis";

// Paleta (referencia dataviz, modo oscuro): serie 1 azul = sitios terrestres, serie 2 naranja = objetivo.
const C = {
  site: "#3987e5",
  target: "#d95926",
  track: "#2c2c2a",
  band: "#383835",
  muted: "#898781",
  secondary: "#c3c2b7",
};
// Rampa secuencial azul (oscuro: bajo = cerca de la superficie, alto = claro).
const SEQ = ["#0d366b", "#104281", "#184f95", "#1c5cab", "#256abf", "#2a78d6", "#3987e5", "#5598e7", "#6da7ec", "#86b6ef"];

const SITE_LETTER: Record<string, string> = {
  atacama: "A",
  haughton: "H",
  deathvalley: "D",
  dryvalleys: "M",
  amazonia: "Z",
};

const fmt = (v: number | null | undefined, unit = "") => {
  if (v == null || Number.isNaN(v)) return "—";
  const n = Math.abs(v) >= 100 ? Math.round(v).toLocaleString("es-ES") : Math.abs(v) >= 1 ? v.toFixed(1) : v.toFixed(2);
  return unit && unit !== "índice" && unit !== "0–1" ? `${n} ${unit}` : n;
};

function RangeStrip({ v }: { v: VariableAnalysis }) {
  if (!v.range) {
    return <p className="text-xs text-slate-500">Sin rango global comparable.</p>;
  }
  const r = v.range;
  const pct = (x: number) => `${position(r, x) * 100}%`;
  return (
    <div className="relative mt-5 mb-1 h-10" role="img" aria-label={`Rango terrestre de ${v.layer.name}`}>
      {/* pista */}
      <div className="absolute top-4 h-2 w-full rounded-full" style={{ background: C.track }} />
      {/* mediana */}
      {v.median != null && (
        <div
          className="absolute top-3 h-4 w-0.5"
          style={{ left: pct(v.median), background: C.muted }}
          title={`Mediana terrestre: ${fmt(v.median, v.layer.unit)}`}
        />
      )}
      {/* sitios */}
      {SITES.map((s, i) => {
        const val = v.samples[i];
        if (val == null) return null;
        return (
          <div
            key={s.id}
            className="group absolute top-2.5 -translate-x-1/2"
            style={{ left: pct(val) }}
            title={`${s.name}: ${fmt(val, v.layer.unit)}`}
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2"
              style={{ background: s.known ? C.site : C.muted, ["--tw-ring-color" as string]: "#0b1220" }}
            >
              {SITE_LETTER[s.id]}
            </div>
          </div>
        );
      })}
      {/* objetivo */}
      {v.targetPos != null && (
        <div
          className="absolute -top-3 -translate-x-1/2 text-center"
          style={{ left: `${v.targetPos * 100}%` }}
          title={`Objetivo: ${fmt(v.target, v.layer.unit)}${v.targetBeyond ? " (fuera del rango terrestre)" : ""}`}
        >
          <div className="mx-auto h-3 w-3 rotate-45" style={{ background: C.target }} />
          {v.targetBeyond && (
            <span className="absolute top-0 whitespace-nowrap text-[10px] font-bold" style={{ color: C.target, [v.targetBeyond === "below" ? "left" : "right"]: "14px" }}>
              {v.targetBeyond === "below" ? "◀ fuera" : "fuera ▶"}
            </span>
          )}
        </div>
      )}
      {/* ejes */}
      <div className="absolute top-7 flex w-full justify-between text-[10px]" style={{ color: C.muted }}>
        <span>p1 {fmt(r[0])}</span>
        <span>p99 {fmt(r[1])}</span>
      </div>
    </div>
  );
}

function VariableRow({ v }: { v: VariableAnalysis }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold">{v.layer.name}</h4>
        <span className="shrink-0 text-[11px]" style={{ color: C.muted }}>
          {v.layer.agency} · {v.layer.eeId.split("/").slice(-2).join("/")}
        </span>
      </div>
      <RangeStrip v={v} />
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span style={{ color: C.muted }}>Objetivo: </span>
          <span className="font-mono">{v.target == null ? "sin dato aún" : fmt(v.target, v.layer.unit)}</span>
          {v.targetBeyond && <span style={{ color: C.target }}> · la analogía se rompe</span>}
        </div>
        <div className="text-right">
          <span style={{ color: C.muted }}>Discrimina análogos: </span>
          <span className="font-mono">{v.discrimination == null ? "—" : `${Math.round(v.discrimination * 100)}%`}</span>
        </div>
      </div>
      {v.discrimination != null && (
        <div className="mt-1 h-1.5 w-full rounded-full" style={{ background: C.track }}>
          <div className="h-1.5 rounded-full" style={{ width: `${v.discrimination * 100}%`, background: C.site }} />
        </div>
      )}
    </div>
  );
}

function cellColor(s: number) {
  return SEQ[Math.min(SEQ.length - 1, Math.floor(s * SEQ.length))];
}

export default function AnalysisTab() {
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const target = TARGETS.find((t) => t.id === targetId)!;
  const vars = useMemo(() => analyzeVariables(target), [target]);
  const scores = useMemo(() => scoreSites(vars), [vars]);
  const breaks = vars.filter((v) => v.targetBeyond);
  const missing = vars.filter((v) => v.target == null);

  return (
    <div className="space-y-6">
      {/* selector de objetivo */}
      <section>
        <p className="mb-2 text-xs" style={{ color: C.muted }}>
          Objetivo a imitar
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTargetId(t.id)}
              className={`rounded-xl px-2 py-2 text-xs font-semibold ${t.id === targetId ? "bg-orange-500 text-black" : "bg-white/10"}`}
            >
              {t.body === "moon" ? "🌕" : "🔴"} {t.short}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-300">{target.description}</p>
        <p className="mt-1 text-[11px]" style={{ color: C.muted }}>
          Fuentes: {target.sources}
        </p>
      </section>

      {/* matriz sitios × dimensiones */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <h2 className="text-base font-bold">Similitud por dimensión</h2>
        <p className="mb-3 text-xs" style={{ color: C.muted }}>
          1 − distancia entre la posición del sitio y la del objetivo dentro del rango terrestre (p1–p99). 100% = mismo
          extremo de la Tierra.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-separate text-xs" style={{ borderSpacing: 2 }}>
            <thead>
              <tr>
                <th className="text-left font-normal" style={{ color: C.muted }}>
                  Sitio
                </th>
                {DIMENSIONS.map((d) => (
                  <th key={d} className="px-1 font-normal" style={{ color: C.muted }}>
                    {d}
                  </th>
                ))}
                <th className="px-1 font-semibold" style={{ color: C.secondary }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row) => {
                const site = SITES.find((s) => s.id === row.siteId)!;
                return (
                  <tr key={row.siteId}>
                    <td className="whitespace-nowrap pr-2">
                      <span
                        className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ background: site.known ? C.site : C.muted }}
                      >
                        {SITE_LETTER[site.id]}
                      </span>
                      <span className={site.known ? "" : "text-slate-500"}>{site.name}</span>
                    </td>
                    {DIMENSIONS.map((d) => {
                      const c = row.dims[d];
                      return c.score == null ? (
                        <td key={d} className="rounded text-center" style={{ color: C.muted, background: "#1a1a19" }} title="Sin datos comparables del objetivo o del sitio">
                          n/d
                        </td>
                      ) : (
                        <td
                          key={d}
                          className="rounded py-1.5 text-center font-mono"
                          style={{ background: cellColor(c.score), color: c.score > 0.6 ? "#0b0b0b" : "#ffffff" }}
                          title={`${site.name} · ${d}: ${Math.round(c.score * 100)}% (${c.n} variables)`}
                        >
                          {Math.round(c.score * 100)}
                        </td>
                      );
                    })}
                    <td className="text-center font-mono font-bold">{row.total == null ? "—" : Math.round(row.total * 100)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px]" style={{ color: C.muted }}>
          Validación: los análogos conocidos (A, H, D, M) deberían puntuar más que el control Z (Amazonía).
        </p>
      </section>

      {/* dónde se rompe la analogía */}
      <section className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3 text-xs">
        <h2 className="mb-1 text-base font-bold">Dónde se rompe la analogía</h2>
        {breaks.length ? (
          <ul className="list-disc space-y-0.5 pl-4">
            {breaks.map((v) => (
              <li key={v.layer.id}>
                <b>{v.layer.name}</b>: {target.short} {fmt(v.target, v.layer.unit)} —{" "}
                {v.targetBeyond === "below" ? "más extremo que el mínimo" : "más extremo que el máximo"} terrestre (
                {fmt(
                  v.targetBeyond === "below" ? (v.extremes ?? v.range!)[0] : (v.extremes ?? v.range!)[1],
                  v.layer.unit,
                )}
                ).
              </li>
            ))}
          </ul>
        ) : (
          <p>Todas las variables comparables caen dentro del rango terrestre.</p>
        )}
        {missing.length > 0 && (
          <p className="mt-2" style={{ color: C.secondary }}>
            Aún sin comparar ({missing.map((v) => v.layer.name).join(", ")}): requieren procesar productos planetarios
            (Diviner/TES para emisividad, LEND/SWIM para hielo).
          </p>
        )}
        <p className="mt-2" style={{ color: C.muted }}>
          La Tierra nunca reproduce la baja gravedad, el vacío lunar ni la radiación: eso queda siempre fuera.
        </p>
      </section>

      {/* variables por dimensión */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: C.secondary }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: C.site }} /> Análogo conocido
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: C.muted }} /> Control
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rotate-45" style={{ background: C.target }} /> {target.short}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-0.5" style={{ background: C.muted }} /> Mediana Tierra
          </span>
        </div>
        {DIMENSIONS.map((d) => {
          const vs = vars.filter((v) => v.layer.dimension === d);
          if (!vs.length) return null;
          return (
            <div key={d}>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-sky-300">{d}</h3>
              <div className="space-y-2">
                {vs.map((v) => (
                  <VariableRow key={v.layer.id} v={v} />
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-[11px]" style={{ color: C.muted }}>
          A = Atacama · H = Haughton · D = Death Valley · M = Valles Secos McMurdo · Z = Amazonía (control). «Discrimina
          análogos» = diferencia entre la media de los análogos conocidos y el control, relativa al rango terrestre: indica
          qué variables separan mejor un análogo de un lugar cualquiera.
        </p>
      </section>
    </div>
  );
}
