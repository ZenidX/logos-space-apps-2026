"use client";

import TargetWhy from "@/components/TargetWhy";
import { useMemo, useState } from "react";
import GlobeView from "@/components/GlobeView";
import type { GlobeMarker } from "@/components/Globe";
import { TARGETS } from "@/data/targets";
import Viewer3D, { type ViewerTarget } from "@/components/Viewer3D";
import { TARGET_TERRAIN } from "@/lib/targetTerrain";
import eeGlobal from "@/data/ee-global.json";
import eeSamples from "@/data/ee-samples.json";


interface Candidate {
  c: [number, number]; // [lon, lat]
  total: number;
  superficie: number | null;
  relieve: number | null;
  accesibilidad: number | null; // 0–1, from travel time to the nearest city
  access_h: number | null; // travel time to the nearest city (h), Oxford MAP 2015
  urban_frac?: number | null;
  elev?: number | null;
  lst_day: number | null; // climate: shown for context, NOT scored (v2)
  lst_min: number | null;
  precip: number | null;
  ndvi: number | null;
  albedo: number | null;
  slope: number | null;
  place?: string;
}
interface TargetResult {
  top: Candidate[];
  dist: { total_p50: number; total_p90: number; total_p99: number };
  known: { name: string; total: number | null }[];
}
const DATA = eeGlobal as unknown as Record<string, TargetResult | undefined>;
// Extremos reales de la Tierra (mín./máx. global de 01_inventario_capas.js) para decidir "fuera de la Tierra".
const EXTREMES: Record<string, [number, number]> = Object.fromEntries(
  (eeSamples as unknown as { layers: { id: string; stats?: Record<string, number | null> | null }[] }).layers
    .filter((l) => l.stats?.v_min != null && l.stats?.v_max != null)
    .map((l) => [l.id, [l.stats!.v_min!, l.stats!.v_max!]]),
);
const RANGES = (eeGlobal as unknown as { ranges?: Record<string, number> }).ranges ?? {};

// v2: climate is no longer scored; only these analog variables enter the explanation.
const VAR_LABEL: Record<string, string> = {
  ndvi: "Vegetation",
  albedo: "Albedo",
  slope: "Slope",
};

// La pendiente global se mide a 5 km (GMTED2010): a esa escala el p99 de la Tierra es ~4,4°.
// Si el sitio y el objetivo superan los dos el p99, la similitud sale 1 pero no significa nada
// (los dos están "en el techo" de la escala). Se muestra aparte como empate en el límite.
const SATURABLE = new Set(["slope"]);

// Similitud por variable (misma fórmula que en Earth Engine): 1 − |pos(sitio) − pos(objetivo)| en p1–p99.
function explain(c: Candidate, targetValues: Record<string, number | null>) {
  const rows: { k: string; sim: number; beyond: boolean }[] = [];
  const saturated: string[] = [];
  for (const k of Object.keys(VAR_LABEL)) {
    const lo = RANGES[`${k}_p1`];
    const hi = RANGES[`${k}_p99`];
    const v = c[k as keyof Candidate] as number | null;
    const t = targetValues[k];
    if (lo == null || hi == null || v == null || t == null) continue;
    const pos = (x: number) => Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
    if (SATURABLE.has(k) && v >= hi && t >= hi) {
      saturated.push(k);
      continue;
    }
    rows.push({ k, sim: 1 - Math.abs(pos(v) - pos(t)), beyond: EXTREMES[k] != null && (t < EXTREMES[k][0] || t > EXTREMES[k][1]) });
  }
  rows.sort((a, b) => b.sim - a.sim);
  return { strong: rows.slice(0, 3), weak: rows.slice(-2).filter((r) => r.sim < 0.7).reverse(), beyond: rows.filter((r) => r.beyond), saturated };
}

const worldview = ([lon, lat]: [number, number]) =>
  `https://worldview.earthdata.nasa.gov/?v=${lon - 1.5},${lat - 1},${lon + 1.5},${lat + 1}&l=MODIS_Terra_CorrectedReflectance_TrueColor,Coastlines_15m`;

const C = { site: "#3d7dff", target: "#ffb547", muted: "#8197ad", track: "#12233a" };
const pct = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v * 100)}`);
const num = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toFixed(d));
const fmtHours = (h: number | null | undefined) =>
  h == null ? "—" : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1)} h` : `${Math.round(h / 24)} days`;
const coord = ([lon, lat]: [number, number]) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;

function tier(v: number | null, d: TargetResult["dist"]) {
  if (v == null) return { label: "no data", cls: "text-slate-500" };
  if (v >= d.total_p99) return { label: "top 1%", cls: "text-emerald-400" };
  if (v >= d.total_p90) return { label: "top 10%", cls: "text-sky-300" };
  if (v >= d.total_p50) return { label: "upper half", cls: "text-slate-300" };
  return { label: "lower half", cls: "text-orange-400" };
}

function DimBar({ label, v }: { label: string; v: number | null }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-16 shrink-0" style={{ color: C.muted }}>
        {label}
      </span>
      <div className="h-1.5 flex-1 rounded-full" style={{ background: C.track }}>
        {v != null && <div className="h-1.5 rounded-full" style={{ width: `${v * 100}%`, background: C.site }} />}
      </div>
      <span className="w-6 text-right font-mono">{pct(v)}</span>
    </div>
  );
}

export default function CandidatesTab() {
  const available = TARGETS.filter((t) => DATA[t.id]);
  const [targetId, setTargetId] = useState(available[0]?.id ?? TARGETS[0].id);
  const target = TARGETS.find((t) => t.id === targetId)!;
  const res = DATA[targetId];
  const [view3d, setView3d] = useState<Candidate | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const viewerTarget: ViewerTarget = { name: target.name, short: target.short, ...TARGET_TERRAIN[target.id] };

  const markers = useMemo(
    () =>
      (res?.top ?? []).map((c, i) => ({
        lat: c.c[1],
        lon: c.c[0],
        label: `#${i + 1} · ${c.place ?? coord(c.c)} · ${pct(c.total)}`,
        highlight: i < 5,
      })),
    [res],
  );

  const globeMarkers: GlobeMarker[] = (res?.top ?? []).map((c, i) => ({
    id: String(i),
    lat: c.c[1],
    lon: c.c[0],
    label: `#${i + 1} · ${c.place ?? coord(c.c)}`,
    kind: "candidate",
    rank: i + 1,
  }));

  if (!available.length) {
    return <p className="text-sm text-slate-400">Running the global search in Earth Engine…</p>;
  }

  const knownSorted = [...(res?.known ?? [])].sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const knownAboveP90 = res ? res.known.filter((k) => k.total != null && k.total >= res.dist.total_p90).length : 0;
  const knownWithData = res ? res.known.filter((k) => k.total != null).length : 0;

  return (
    <div className="space-y-6">
      <section>
        <p className="etq mb-3" data-n="01">
          Target to match
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              disabled={!DATA[t.id]}
              onClick={() => setTargetId(t.id)}
              className={`btn-cut border px-2 py-2 font-mono text-[11px] uppercase tracking-[.06em] transition-colors disabled:opacity-40 ${t.id === targetId ? "border-[var(--acc)] bg-[var(--acc)] text-[var(--bg)]" : "border-[var(--line2)] text-[var(--ink)] hover:text-[var(--acc)]"}`}
            >
              <span className="opacity-60">{t.body === "moon" ? "Moon" : "Mars"} ·</span> {t.short}
            </button>
          ))}
        </div>
        <TargetWhy target={target} />
      </section>

      {res && (
        <>
          <section className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 p-4">
            <h2 className="text-lg font-bold">New analogs of {target.short}</h2>
            <p className="text-xs text-slate-300">
              All land between 85°N and 85°S in 0.1° cells (~11 km), scored in Earth Engine on three equal-weight
              dimensions: Surface and Relief (analogy with the target, NASA MODIS data) and Access (how easy it is to
              bring people and materials: travel time to the nearest city). Climate is not scored. Urban and
              water-dominated cells and the 25 already-catalogued analogs (300 km radius) are excluded; candidates are
              at least 300 km apart.
            </p>
          </section>

          <GlobeView
            body="earth"
            markers={globeMarkers}
            tileMarkers={markers}
            selectedId={selectedCard}
            onSelect={(id) => {
              if (selectedCard === id) {
                setView3d(res.top[Number(id)]);
                return;
              }
              setSelectedCard(id);
              document.getElementById(`cand-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            tl={<><span className="k">Target</span><br />{target.short}</>}
            tr={<><span className="k">Cells</span><br />0.1° · 85N–85S</>}
            bl={<span className="k">Top {res.top.length}</span>}
          />

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="etq mb-3" data-n="02">Validation</p>
            <p className="mb-2 text-xs" style={{ color: C.muted }}>
              Score over all of Earth&apos;s land: median {pct(res.dist.total_p50)} · p90 {pct(res.dist.total_p90)} · p99{" "}
              {pct(res.dist.total_p99)}. Known analogs should score high.
            </p>
            <p className="mb-2 text-sm">
              <b>
                {knownAboveP90} of {knownWithData}
              </b>{" "}
              known analogs are in the planet&apos;s top 10%.
            </p>
            <ul className="grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2">
              {knownSorted.map((k) => {
                const t = tier(k.total, res.dist);
                return (
                  <li key={k.name} className="flex justify-between gap-2">
                    <span className="truncate">{k.name}</span>
                    <span className="shrink-0 font-mono">
                      {pct(k.total)} <span className={t.cls}>{t.label}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-2">
            <p className="etq mb-3" data-n="03">Candidate ranking</p>
            {res.top.map((c, i) => (
              <article key={i} id={`cand-${i}`} className={`rounded-xl border bg-white/[0.03] p-3 ${selectedCard === String(i) ? "border-[var(--acc)]" : "border-white/10"}`}>
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      <span className="mr-1 text-orange-400">#{i + 1}</span>
                      {c.place ?? coord(c.c)}
                    </p>
                    {c.place && <p className="text-[11px]" style={{ color: C.muted }}>{coord(c.c)}</p>}
                  </div>
                  <span className="btn-cut bg-[var(--acc)] px-2 py-0.5 font-mono text-sm font-medium text-[var(--bg)]">{pct(c.total)}</span>
                </header>
                <div className="space-y-1">
                  <DimBar label="Surface" v={c.superficie} />
                  <DimBar label="Relief" v={c.relieve} />
                  <DimBar label="Access" v={c.accesibilidad} />
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
                  <div>
                    <dt style={{ color: C.muted }}>To nearest city</dt>
                    <dd className="font-mono">{fmtHours(c.access_h)}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Elevation</dt>
                    <dd className="font-mono">{c.elev == null ? "—" : `${c.elev} m`}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Climate (not scored)</dt>
                    <dd className="font-mono">
                      {num(c.lst_day, 0)} °C · {num(c.precip, 0)} mm/yr
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>NDVI</dt>
                    <dd className="font-mono" title={c.ndvi == null ? "Pending re-export: the stored NDVI was scaled twice" : undefined}>{num(c.ndvi, 2)}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Albedo</dt>
                    <dd className="font-mono">{num(c.albedo, 2)}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Slope (5 km)</dt>
                    <dd className="font-mono">{num(c.slope, 1)}°</dd>
                  </div>
                </dl>
                {(() => {
                  const e = explain(c, target.values);
                  return (
                    <div className="mt-2 space-y-0.5 text-[11px]">
                      <p>
                        <span className="text-emerald-400">✔ Similar in:</span>{" "}
                        {e.strong.map((r) => `${VAR_LABEL[r.k]} (${pct(r.sim)})`).join(" · ")}
                      </p>
                      {e.weak.length > 0 && (
                        <p>
                          <span className="text-orange-400">✘ Differs in:</span>{" "}
                          {e.weak.map((r) => `${VAR_LABEL[r.k]} (${pct(r.sim)})`).join(" · ")}
                        </p>
                      )}
                      {e.saturated.length > 0 && (
                        <p style={{ color: C.muted }}>
                          Tie at Earth&apos;s limit (not a real match):{" "}
                          {e.saturated.map((k) => VAR_LABEL[k]).join(", ")}. At 5 km scale both are steeper than 99% of
                          Earth, so this variable cannot tell them apart.
                        </p>
                      )}
                      {e.beyond.length > 0 && (
                        <p style={{ color: C.muted }}>
                          Where the analogy breaks: no place on Earth reaches {target.short} in{" "}
                          {e.beyond.map((r) => VAR_LABEL[r.k].replace(/\.$/, "")).join(", ")}.
                        </p>
                      )}
                      <a
                        href={worldview(c.c)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block pt-1 text-sky-300 underline"
                      >
                        View in NASA Worldview ↗
                      </a>{" "}
                      <button
                        onClick={() => setView3d(c)}
                        className="btn-cut ml-2 border border-[var(--acc)] px-2 py-1 font-mono text-[10px] uppercase tracking-[.08em] text-[var(--acc)] hover:bg-[var(--acc)] hover:text-[var(--bg)]"
                      >
                        View in 3D ▸
                      </button>
                    </div>
                  );
                })()}
              </article>
            ))}
          </section>
        </>
      )}
      {view3d && (
        <Viewer3D
          site={{ lat: view3d.c[1], lon: view3d.c[0], name: view3d.place ?? coord(view3d.c) }}
          target={viewerTarget}
          onClose={() => setView3d(null)}
        />
      )}
    </div>
  );
}
