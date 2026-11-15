"use client";

// Comparación de una submisión: el MISMO plan de base dibujado en el sitio de ensayo de la Tierra (izquierda) y en el
// sitio de la Luna o Marte (derecha), con la operación de esa submisión en bucle en los dos. Debajo, por qué sirve
// el sitio de la Tierra (criterios de operations.json con sus valores reales), cuánto se parece el terreno y
// dónde se rompe la analogía.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Visor from "@/components/Visor";
import { STEP_DONE, type Layer } from "@/components/BaseScene";
import { loadEarthTerrain, type TerrainData } from "@/lib/terrain";
import { planBase, type BasePlan } from "@/lib/base-plan";
import { shapeMatch, shapeSig, type ShapeSig, type SubMission } from "@/lib/submissions";
import { breaks, whyRows, type Criterion } from "@/lib/rehearsal";
import operations from "@/data/operations.json";

const BaseScene = dynamic(() => import("@/components/BaseScene"), { ssr: false });

export interface RehearsalSite {
  key: string;
  lat: number;
  lon: number;
  place: string;
  taskScore: number;
  accessH: number | null;
  byTask: Record<string, Record<string, number | null>>; // valores medidos, por tarea en la que aparece
}

interface Base {
  terrain: TerrainData;
  plan: BasePlan;
  sig: ShapeSig;
  name: string;
  sun: number;
  layer: Layer;
}

const TASKS = new Map(operations.tasks.map((t) => [t.id, t]));
const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
const mark = (s: number | null) => (s == null ? { t: "–", c: "var(--dim)" } : s >= 0.75 ? { t: "✓", c: "var(--ok)" } : s > 0 ? { t: "~", c: "var(--acc)" } : { t: "✕", c: "var(--warn)" });

export default function MissionCompare({ sub, site, sites = [], onSite, base, onClose }: { sub: SubMission; site: RehearsalSite; sites?: RehearsalSite[]; onSite?: (s: RehearsalSite) => void; base: Base; onClose: () => void }) {
  const [realScale, setRealScale] = useState(false);
  const idx = sites.findIndex((x) => x.key === site.key);
  const go = (d: number) => {
    if (!onSite || sites.length < 2) return;
    onSite(sites[(idx + d + sites.length) % sites.length]);
  };
  const [earth, setEarth] = useState<{ terrain: TerrainData; plan: BasePlan; sig: ShapeSig } | null>(null);
  const [err, setErr] = useState("");
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // El mismo plan (reglas de la base en la Luna o Marte) sobre el terreno real del sitio de la Tierra
  useEffect(() => {
    let cancel = false;
    setEarth(null);
    setErr("");
    loadEarthTerrain(site.lat, site.lon, base.terrain.n, base.terrain.widthM)
      .then((terrain) => {
        if (cancel) return;
        // Reglas de la base, pero con el Sol real de la Tierra en ese sitio (latitud e inclinación terrestres)
        const plan = planBase(terrain, base.plan.body, base.plan.lat, base.plan.lon, { sunLat: site.lat, tiltDeg: 23.44, radiusM: 6371000, isruKind: base.plan.isru.kind });
        setEarth({ terrain, plan, sig: shapeSig(terrain) });
      })
      .catch((e: Error) => !cancel && setErr(e.message));
    return () => {
      cancel = true;
    };
  }, [site, base]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const world = base.plan.body;
  const tasks = sub.tasks.filter((id) => site.byTask[id]);
  const anyValues = Object.values(site.byTask)[0] ?? {};
  const match = earth ? shapeMatch(base.sig, earth.sig) : null;
  const row = (label: string, a: string, b: string) => (
    <tr className="border-t border-[var(--line)]">
      <th scope="row" className="py-1.5 pr-2 text-left font-normal text-[var(--mut)]">{label}</th>
      <td className="py-1.5 pr-2 text-right font-mono text-[var(--ink)]">{a}</td>
      <td className="py-1.5 text-right font-mono text-[var(--ink)]">{b}</td>
    </tr>
  );

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex flex-col bg-[rgba(4,8,15,.97)] backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="mc-title">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[.12em] text-[var(--acc)]">Rehearse on Earth · {sub.name}</p>
          <h2 id="mc-title" className="mt-1 truncate text-lg">
            {site.place} <span className="text-[var(--dim)]">↔</span> {base.name}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {sites.length > 1 && (
            <>
              <button type="button" className="glass-tab text-[14px]" onClick={() => go(-1)} aria-label="Previous Earth site">‹</button>
              <span className="font-mono text-[11px] text-[var(--mut)]">{idx + 1} / {sites.length}</span>
              <button type="button" className="glass-tab text-[14px]" onClick={() => go(1)} aria-label="Next Earth site">›</button>
            </>
          )}
          <button type="button" className="glass-tab text-[14px]" aria-pressed={realScale} onClick={() => setRealScale((v) => !v)}>Real scale</button>
        <button
          ref={closeBtn}
          onClick={onClose}
          className="glass-tab shrink-0 text-[14px]"
        >
          Close <span aria-hidden>✕</span>
        </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Visor
            className="h-[38vh] min-h-[16rem]"
            reticle={false}
            tl={<><span className="k">Earth · rehearsal site</span><br />{site.place}</>}
            tr={earth && <><span className="k">Buildable</span> {Math.round(earth.plan.stats.flatPct)} %<br /><span className="k">Relief</span> {Math.round(earth.plan.stats.reliefM)} m</>}
            bl={<span className="k">{err ? `Error: ${err}` : earth ? coord(site.lat, site.lon) : "Downloading terrain…"}</span>}
          >
            {earth ? (
              <BaseScene key={site.key} terrain={earth.terrain} plan={earth.plan} world="earth" step={STEP_DONE} stepKey={0} layer="photo" exaggeration={realScale ? 1 : 1.5} sunDeg={35} focus={sub.focus} loopFocus realScale={realScale} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--mut)]">{err || "Loading the Earth site…"}</div>
            )}
          </Visor>
          <Visor
            className="h-[38vh] min-h-[16rem]"
            reticle={false}
            tl={<><span className="k">{world === "moon" ? "Moon" : "Mars"} · your base</span><br />{base.name}</>}
            tr={<><span className="k">Buildable</span> {Math.round(base.plan.stats.flatPct)} %<br /><span className="k">Relief</span> {Math.round(base.plan.stats.reliefM)} m</>}
            bl={<span className="k">{coord(base.plan.lat, base.plan.lon)}</span>}
          >
            <BaseScene terrain={base.terrain} plan={base.plan} step={STEP_DONE} stepKey={0} layer={base.layer} exaggeration={realScale ? 1 : 1.5} sunDeg={base.sun} focus={sub.focus} loopFocus realScale={realScale} />
          </Visor>
        </div>
        <p className="mt-1 font-mono text-[10px] text-[var(--dim)]">
          Same base layout rules on both: 11 × 11 km of real elevation each, same scale; the operation of this sub-mission plays on a loop.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
          <section aria-labelledby="mc-why">
            <h3 id="mc-why" className="text-lg">Why this place works</h3>
            {tasks.length === 0 && <p className="mt-1 text-sm text-[var(--dim)]">No measured values for this sub-mission&apos;s tasks here.</p>}
            {tasks.map((id) => {
              const t = TASKS.get(id)!;
              const rows = whyRows(t.criteria as Criterion[], site.byTask[id], Math.abs(site.lat));
              return (
                <div key={id} className="mt-2">
                  <p className="text-sm text-[var(--ink)]">{t.name}</p>
                  <p className="text-xs text-[var(--dim)]">{t.need}</p>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {rows.map((r) => {
                      const m = mark(r.score);
                      return (
                        <li key={r.label} className="grid grid-cols-[1.2rem_1fr] gap-1 text-sm">
                          <span aria-hidden style={{ color: m.c }}>{m.t}</span>
                          <span>
                            <span className="text-[var(--ink)]">{r.label}: {r.value}</span>
                            <span className="text-[var(--dim)]"> ({r.need})</span>
                            <span className="block text-xs text-[var(--mut)]">{r.why}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            <p className="mt-2 text-xs text-[var(--dim)]">Values: NASA MODIS, GPM, MERRA-2 and elevation on Earth&apos;s 0.1° grid (Google Earth Engine).</p>
          </section>

          <section aria-labelledby="mc-ground">
            <h3 id="mc-ground" className="text-lg">Same ground?</h3>
            <p className="mt-1 text-sm text-[var(--mut)]">
              Terrain match: <span className="font-mono text-[var(--acc)]">{match == null ? "…" : `${Math.round(match * 100)} %`}</span> (slope mix + relief over 11 km).
            </p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[.08em] text-[var(--dim)]">
                  <th />
                  <th className="pb-1 text-right font-normal">Earth</th>
                  <th className="pb-1 text-right font-normal">{world === "moon" ? "Moon" : "Mars"}</th>
                </tr>
              </thead>
              <tbody>
                {earth && row("Buildable (< 10°)", `${Math.round(earth.plan.stats.flatPct)} %`, `${Math.round(base.plan.stats.flatPct)} %`)}
                {earth && row("Mean slope", `${earth.plan.stats.meanSlope.toFixed(1)}°`, `${base.plan.stats.meanSlope.toFixed(1)}°`)}
                {earth && row("Relief", `${Math.round(earth.plan.stats.reliefM)} m`, `${Math.round(base.plan.stats.reliefM)} m`)}
                {earth && row("Sun at the habitat", `${Math.round(earth.plan.habitatLit * 100)} %`, `${Math.round(base.plan.habitatLit * 100)} %`)}
                {earth && row("Best solar spot", `${Math.round(earth.plan.powerLit * 100)} %`, `${Math.round(base.plan.powerLit * 100)} %`)}
                {earth && row("Rover route", `${(earth.plan.routeLenM / 1000).toFixed(1)} km`, `${(base.plan.routeLenM / 1000).toFixed(1)} km`)}
              </tbody>
            </table>
            {site.accessH != null && <p className="mt-2 text-xs text-[var(--dim)]">About {site.accessH.toFixed(0)} h by land from the nearest city (Oxford MAP).</p>}
          </section>

          <section aria-labelledby="mc-break">
            <h3 id="mc-break" className="text-lg" style={{ color: "var(--warn)" }}>Where it breaks</h3>
            <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-4 text-sm text-[var(--mut)]">
              {breaks(world, anyValues.ps_hpa ?? null).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
