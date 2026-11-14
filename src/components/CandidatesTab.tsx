"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { TARGETS } from "@/data/targets";
import eeGlobal from "@/data/ee-global.json";

const TileMap = dynamic(() => import("@/components/TileMap"), { ssr: false });

interface Candidate {
  c: [number, number]; // [lon, lat]
  total: number;
  clima: number | null;
  superficie: number | null;
  relieve: number | null;
  lst_day: number | null;
  lst_night: number | null;
  lst_max: number | null;
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

const C = { site: "#3987e5", target: "#d95926", muted: "#898781", track: "#2c2c2a" };
const pct = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v * 100)}`);
const num = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toFixed(d));
const coord = ([lon, lat]: [number, number]) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;

function tier(v: number | null, d: TargetResult["dist"]) {
  if (v == null) return { label: "sin dato", cls: "text-slate-500" };
  if (v >= d.total_p99) return { label: "top 1 %", cls: "text-emerald-400" };
  if (v >= d.total_p90) return { label: "top 10 %", cls: "text-sky-300" };
  if (v >= d.total_p50) return { label: "mitad alta", cls: "text-slate-300" };
  return { label: "mitad baja", cls: "text-orange-400" };
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

  if (!available.length) {
    return <p className="text-sm text-slate-400">Calculando la búsqueda global en Earth Engine…</p>;
  }

  const knownSorted = [...(res?.known ?? [])].sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const knownAboveP90 = res ? res.known.filter((k) => k.total != null && k.total >= res.dist.total_p90).length : 0;
  const knownWithData = res ? res.known.filter((k) => k.total != null).length : 0;

  return (
    <div className="space-y-6">
      <section>
        <p className="mb-2 text-xs" style={{ color: C.muted }}>
          Objetivo a imitar
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              disabled={!DATA[t.id]}
              onClick={() => setTargetId(t.id)}
              className={`rounded-xl px-2 py-2 text-xs font-semibold disabled:opacity-40 ${
                t.id === targetId ? "bg-orange-500 text-black" : "bg-white/10"
              }`}
            >
              {t.body === "moon" ? "🌕" : "🔴"} {t.short}
            </button>
          ))}
        </div>
      </section>

      {res && (
        <>
          <section className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 p-4">
            <h2 className="text-lg font-bold">Nuevos análogos de {target.short}</h2>
            <p className="text-xs text-slate-300">
              Toda la tierra firme entre 85°N y 85°S en celdas de 0,1° (~11 km), puntuada con datos NASA en Earth Engine.
              Excluidos 25 análogos ya catalogados (radio 300 km). Candidatos separados ≥ 300 km entre sí.
            </p>
          </section>

          <section className="h-72">
            <TileMap body="earth" markers={markers} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-base font-bold">Validación</h3>
            <p className="mb-2 text-xs" style={{ color: C.muted }}>
              Puntuación de toda la Tierra: mediana {pct(res.dist.total_p50)} · p90 {pct(res.dist.total_p90)} · p99{" "}
              {pct(res.dist.total_p99)}. Los análogos conocidos deberían caer arriba.
            </p>
            <p className="mb-2 text-sm">
              <b>
                {knownAboveP90} de {knownWithData}
              </b>{" "}
              análogos conocidos están en el top 10 % del planeta.
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
            <h3 className="text-base font-bold">Ranking de candidatos</h3>
            {res.top.map((c, i) => (
              <article key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      <span className="mr-1 text-orange-400">#{i + 1}</span>
                      {c.place ?? coord(c.c)}
                    </p>
                    {c.place && <p className="text-[11px]" style={{ color: C.muted }}>{coord(c.c)}</p>}
                  </div>
                  <span className="rounded-lg bg-orange-500 px-2 py-0.5 text-sm font-black text-black">{pct(c.total)}</span>
                </header>
                <div className="space-y-1">
                  <DimBar label="Clima" v={c.clima} />
                  <DimBar label="Superficie" v={c.superficie} />
                  <DimBar label="Relieve" v={c.relieve} />
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
                  <div>
                    <dt style={{ color: C.muted }}>T. día / noche</dt>
                    <dd className="font-mono">
                      {num(c.lst_day, 0)} / {num(c.lst_night, 0)} °C
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Mín. / máx.</dt>
                    <dd className="font-mono">
                      {num(c.lst_min, 0)} / {num(c.lst_max, 0)} °C
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Lluvia</dt>
                    <dd className="font-mono">{num(c.precip, 0)} mm/a</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>NDVI</dt>
                    <dd className="font-mono">{num(c.ndvi, 2)}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Albedo</dt>
                    <dd className="font-mono">{num(c.albedo, 2)}</dd>
                  </div>
                  <div>
                    <dt style={{ color: C.muted }}>Pendiente</dt>
                    <dd className="font-mono">{num(c.slope, 1)}°</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
