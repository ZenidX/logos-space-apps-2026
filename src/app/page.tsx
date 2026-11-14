"use client";
// AI-assisted (Claude), reviewed by team Logos

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { OrreryArc, OrreryMarker } from "@/components/Orrery";
import SitePanel, { AccessBars, KindChip, pct } from "@/components/SitePanel";
import MethodSheet from "@/components/MethodSheet";
import { MISSIONS, arcDims, type Mission, type MissionId } from "@/lib/missions";

const Orrery = dynamic(() => import("@/components/Orrery"), { ssr: false });
const DEMO_MS = 7000;
const BODY_COLOR = { moon: "var(--moon)", mars: "var(--mars)", earth: "var(--earth)" } as const;

function sceneFor(m: Mission) {
  const tId = `t-${m.id}`;
  const markers: OrreryMarker[] = [
    { id: tId, body: m.target.body, lat: m.target.lat, lon: m.target.lon, kind: "target", label: m.target.name.split(" (")[0] },
    ...m.sites.map((s, i) => ({ id: s.id, body: "earth" as const, lat: s.lat, lon: s.lon, kind: "candidate" as const, label: s.name.split(",")[0], rank: i + 1 })),
  ];
  const arcs: OrreryArc[] = m.sites.map((s) => ({ id: s.id, from: tId, to: s.id, dims: arcDims(m, s) }));
  return { markers, arcs };
}

export default function Home() {
  const [missionId, setMissionId] = useState<MissionId | null>(null);
  const [demoIdx, setDemoIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [method, setMethod] = useState(false);
  const [glFailed, setGlFailed] = useState(false);

  const shown = missionId ? MISSIONS.find((m) => m.id === missionId)! : MISSIONS[demoIdx % MISSIONS.length];
  const scene = useMemo(() => sceneFor(shown), [shown]);
  const site = sel ? shown.sites.find((s) => s.id === sel) ?? null : null;
  const t = shown.target;

  useEffect(() => {
    if (missionId || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setDemoIdx((i) => i + 1), DEMO_MS);
    return () => window.clearInterval(id);
  }, [missionId, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (method) setMethod(false); else if (sel) setSel(null); else setMissionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [method, sel]);

  const pick = (id: MissionId) => { setMissionId(id); setSel(null); };
  const home = () => { setMissionId(null); setSel(null); };
  const known = shown.sites.filter((s) => s.kind === "known");
  const fresh = shown.sites.filter((s) => s.kind === "new");

  const Row = ({ s, n }: { s: Mission["sites"][number]; n: number }) => (
    <li>
      <button onClick={() => setSel(s.id)} className="grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)] focus-visible:border-[var(--ink)]">
        <span className="mono text-[12px]" style={{ color: BODY_COLOR[t.body] }}>{String(n).padStart(2, "0")}</span>
        <span className="min-w-0"><span className="block truncate text-[14px]">{s.name}</span><span className="block truncate text-[11.5px] text-[var(--dim)]">{s.campaign ? `${s.country ?? ""} · ${s.campaign}` : s.country}</span></span>
        <span className="flex flex-col items-end gap-1"><span className="mono text-[13px] tabular-nums">{pct(s.match)}</span><AccessBars site={s} /></span>
      </button>
    </li>
  );

  return (
    <main className="stars relative min-h-dvh overflow-x-clip">
      {/* 3D scene */}
      <div className={`sticky top-0 z-0 h-[50dvh] w-full transition-[left,right] duration-700 md:fixed md:inset-y-0 md:h-dvh md:w-auto ${missionId ? "md:left-0 md:right-[404px]" : "md:left-[36%] md:right-0"}`}>
        {glFailed ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-[var(--mut)]">The 3D view needs WebGL. The lists below have all the information.</div>
        ) : (
          <Orrery
            mode={missionId ? { kind: "focus", body: t.body as "moon" | "mars" } : { kind: "overview" }}
            markers={scene.markers}
            arcs={scene.arcs}
            selectedId={sel}
            onSelect={(id) => { if (!missionId) pick(shown.id); setSel(id.startsWith("t-") ? null : id); }}
            paused={paused}
            onError={() => setGlFailed(true)}
          />
        )}
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 md:px-8">
        <button onClick={home} className="display pointer-events-auto text-[17px] font-semibold">Logos <span className="text-[var(--mut)]">· Mission Analogs</span></button>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="chip hidden text-[var(--amber)] sm:inline-flex" style={{ borderColor: "var(--amber)" }}>Prototype</span>
          <button className="chip hover:border-[var(--ink)]" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? "▶ Play motion" : "❚❚ Pause motion"}</button>
          <button className="chip hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Method & sources</button>
        </div>
      </header>

      {/* Left column: hero + mission picker (landing) or mission tabs (mission) */}
      <section className={`relative z-10 px-4 pb-6 md:absolute md:left-0 md:top-0 md:px-8 ${missionId ? "md:pt-20" : "md:w-[36%] md:max-w-[560px] md:pt-24"}`}>
        {!missionId && (
          <div className="fade-in pt-4 md:pt-0">
            <p className="label">NASA Space Apps 2026 · Earth analogs for the Moon and Mars</p>
            <h1 className="display mt-3 text-[length:var(--t-hero)] font-semibold leading-[1.02]">Rehearse the Moon and Mars on Earth.</h1>
            <p className="mt-4 max-w-[460px] text-[16px] text-[var(--mut)]">Pick a mission. We show regions on Earth worth investigating to rehearse it, how they compare with the target, where the comparison breaks — and how complex it is to get there.</p>
          </div>
        )}
        <div className={missionId ? "flex flex-wrap gap-2" : "mt-6 grid gap-2"} role="group" aria-label="Choose a mission">
          {MISSIONS.map((m) => {
            const active = m.id === missionId || (!missionId && m.id === shown.id);
            const c = BODY_COLOR[m.target.body];
            return missionId ? (
              <button key={m.id} aria-pressed={m.id === missionId} onClick={() => pick(m.id)} className="chip glass !py-1.5" style={active ? { borderColor: c, color: c } : undefined}>{m.short}</button>
            ) : (
              <button key={m.id} onClick={() => pick(m.id)} className="glass rounded-xl p-3 text-left transition-colors hover:border-[var(--ink)]" style={active ? { borderColor: c } : undefined}>
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <b className="display text-[17px]">{m.short}</b>
                  <span className="label" style={{ color: c }}>{m.target.body} · {m.target.name.split(" (")[0]}</span>
                </span>
                <small className="mt-0.5 block text-[13px] text-[var(--mut)]">{m.blurb}</small>
              </button>
            );
          })}
        </div>
        {!missionId && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[12px] text-[var(--dim)]">Showing: {shown.short} → {t.name.split(" (")[0]}</span>
          </div>
        )}
      </section>

      {missionId && <h1 className="sr-only">Logos Mission Analogs: {shown.short}, target {t.name}</h1>}
      {missionId && (
        <aside className="glass relative z-10 mx-4 mb-6 rounded-[20px] p-5 md:fixed md:bottom-4 md:right-4 md:top-16 md:mx-0 md:mb-0 md:w-[380px] md:overflow-y-auto" aria-label={shown.title}>
          {site ? (
            <SitePanel site={site} mission={shown} onBack={() => setSel(null)} />
          ) : (
            <div className="fade-in" key={shown.id}>
              <p className="label" style={{ color: BODY_COLOR[t.body] }}>Target · {t.body} · {t.name}</p>
              <h2 className="display mt-1 text-[24px] font-semibold leading-tight">{shown.short}</h2>
              <p className="mt-1 text-[13.5px] text-[var(--mut)]">{shown.blurb}</p>
              <p className="mt-2 rounded-lg border p-2 text-[12.5px]" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>▲ {shown.keyLimit}</p>

              <h3 className="label mt-4">Rehearsed for real by</h3>
              <ul className="mt-2 grid gap-1 text-[13px]">
                {shown.campaigns.map((c) => <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{c.name}</a> <span aria-hidden className="text-[var(--dim)]">↗</span></li>)}
              </ul>

              <div className="mt-5 flex items-baseline justify-between"><h3 className="label">New regions to investigate</h3><span className="mono text-[11px] text-[var(--dim)]">index · access</span></div>
              <ul className="mt-1 grid gap-0.5">{fresh.map((s, i) => <Row key={s.id} s={s} n={i + 1} />)}</ul>

              <h3 className="label mt-4">Known analogs · used to validate</h3>
              <ul className="mt-1 grid gap-0.5">{known.map((s, i) => <Row key={s.id} s={s} n={fresh.length + i + 1} />)}</ul>

              <p className="mt-3 rounded-lg border border-[var(--line)] p-2 text-[12.5px] text-[var(--mut)]"><b className="text-[var(--ink)]">Validation.</b> {shown.validation.result}</p>
              <p className="mt-2 text-[11.5px] text-[var(--dim)]">Access complexity: Low · Medium · High (team-defined, neutral). Not travel advice.</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><KindChip kind="new" /><KindChip kind="known" /></div>
            </div>
          )}
        </aside>
      )}

      <footer className="relative z-10 px-4 pb-4 text-[11.5px] text-[var(--dim)] md:fixed md:bottom-3 md:left-8 md:max-w-[34%] md:px-0 md:pb-0">
        Imagery: NASA GIBS · NASA SVS / LROC WAC · NASA/USGS Viking MDIM 2.1. Globes not to scale. This project is not endorsed by NASA.
      </footer>

      {method && <MethodSheet onClose={() => setMethod(false)} />}
    </main>
  );
}
