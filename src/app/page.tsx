"use client";
// AI-assisted (Claude), reviewed by team Logos

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { SceneMarker } from "@/components/SolarScene";
import SitePanel, { AccessBars, KindChip } from "@/components/SitePanel";
import MethodSheet from "@/components/MethodSheet";
import Count from "@/components/Count";
import { MISSIONS, NEXT_MISSIONS, TOP_NOTE, type Mission, type MissionId } from "@/lib/missions";

const SolarScene = dynamic(() => import("@/components/SolarScene"), { ssr: false });
const DEMO_MS = 7000;
// Project in numbers, computed from the data file (nothing typed by hand).
const STATS: [string, string][] = [
  [String(MISSIONS.length), "missions from real field campaigns"],
  [`${(Math.min(...MISSIONS.map((m) => m.landCells ?? Infinity)) / 1e6).toFixed(1)}M+`, "land cells scored per mission"],
  [String(MISSIONS.reduce((n, m) => n + m.sites.filter((s) => s.kind === "new").length, 0)), "new regions to investigate"],
  [String(MISSIONS.reduce((n, m) => n + m.sites.filter((s) => s.kind === "known").length, 0)), "known analogs used to validate"],
];
const BODY_COLOR = { moon: "var(--moon)", mars: "var(--mars)", earth: "var(--earth)" } as const;

function sceneFor(m: Mission) {
  const tId = `t-${m.id}`;
  const markers: SceneMarker[] = [
    { id: tId, body: m.target.body, lat: m.target.lat, lon: m.target.lon, kind: "target", label: m.target.name.split(" (")[0] },
    ...m.sites.map((s, i) => ({ id: s.id, body: "earth" as const, lat: s.lat, lon: s.lon, kind: "candidate" as const, label: s.name.split(",")[0], rank: i + 1 })),
  ];
  return { markers };
}

export default function Home() {
  const [missionId, setMissionId] = useState<MissionId | null>(null);
  const [demoIdx, setDemoIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [method, setMethod] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const shown = missionId ? MISSIONS.find((m) => m.id === missionId)! : MISSIONS[demoIdx % MISSIONS.length];
  const scene = useMemo(() => sceneFor(shown), [shown]);
  const site = sel ? shown.sites.find((s) => s.id === sel) ?? null : null;
  const t = shown.target;

  // Deep link: ?m=<mission id> opens a mission directly (useful for sharing and for recording).
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("m");
    const q = new URLSearchParams(window.location.search), mm = MISSIONS.find((x) => x.id === m);
    if (mm) { setMissionId(mm.id); const sid = q.get("s"); if (sid && mm.sites.some((x) => x.id === sid)) setSel(sid); }
  }, []);

  useEffect(() => {
    if (missionId || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setDemoIdx((i) => i + 1), DEMO_MS);
    return () => window.clearInterval(id);
  }, [missionId, paused]);

  // Keep the address bar in sync so any mission or site can be linked and shared.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (missionId) q.set("m", missionId); else q.delete("m");
    if (missionId && sel) q.set("s", sel); else q.delete("s");
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    if (sel && window.innerWidth < 768) window.scrollTo({ top: 0 }); // phones: the site panel sits right under the small scene, so start from the top
  }, [missionId, sel]);

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

  // A plain function (not a component defined during render): rows keep their identity, so keyboard focus is not lost.
  const row = (s: Mission["sites"][number], n: number) => (
    <li key={s.id}>
      <button onClick={() => { setSel(s.id); setHover(null); }} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(s.id)} onBlur={() => setHover(null)} className="row grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)] focus-visible:border-[var(--ink)]">
        <span className="mono text-[12px]" style={{ color: BODY_COLOR[t.body] }}>{String(n).padStart(2, "0")}</span>
        <span className="min-w-0"><span className="place block text-[15px] leading-snug">{s.name}</span><span className="block truncate text-[11.5px] text-[var(--dim)]">{s.campaign ? `${s.country ?? ""} · ${s.campaign}` : s.country}</span></span>
        <span className="flex flex-col items-end gap-1"><span className="mono text-[13px]"><Count value={s.match} decimals={3} /></span><AccessBars site={s} /></span>
      </button>
    </li>
  );

  return (
    <main className="stars relative min-h-dvh overflow-x-clip">
      {/* 3D scene */}
      <div className={`sticky top-0 z-0 w-full pt-12 md:pt-0 ${site ? "h-[22dvh]" : missionId ? "h-[40dvh]" : "h-[32dvh]"} transition-[left,right] duration-700 md:fixed md:inset-y-0 md:h-dvh md:w-auto ${missionId ? (site ? "md:left-0 md:right-[calc(min(760px,60vw)+16px)]" : "md:left-0 md:right-[396px]") : "md:left-[36%] md:right-0"}`}>
        {glFailed ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-[var(--mut)]">The 3D view needs WebGL. The lists below have all the information.</div>
        ) : (
          <SolarScene
            mode={missionId ? { kind: "focus", body: t.body as "moon" | "mars" } : { kind: "overview" }}
            markers={scene.markers}
            selectedId={sel}
            highlightId={hover}
            onSelect={(id) => { if (!missionId) pick(shown.id); setSel(id.startsWith("t-") ? null : id); }}
            paused={paused}
            primaryCount={shown.sites.filter((x) => x.kind === "new").length}
            onError={() => setGlFailed(true)}
          />
        )}
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-[var(--bg)] px-4 py-2 md:bg-transparent md:p-4 md:px-8">
        <button onClick={home} className="title-sm pointer-events-auto flex items-center gap-2 text-[16px]"><span aria-hidden className="inline-block h-[26px] w-[26px] bg-[url(/logo-symbol.svg)] bg-contain bg-center bg-no-repeat" />Logos <span className="hidden text-[var(--mut)] sm:inline">· Mission Analogs</span></button>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden sm:inline"><span className="chip text-[var(--amber)]" style={{ borderColor: "var(--amber)" }}>Prototype</span></span>
          <button className="chip hover:border-[var(--ink)]" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={() => setPaused((p) => !p)}><span aria-hidden>{paused ? "▶" : "❚❚"}</span><span className="hidden sm:inline">{paused ? "Play motion" : "Pause motion"}</span></button>
          <button className="chip hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Method &amp; sources</button>
        </div>
      </header>

      {/* Left column: hero + mission picker (landing) or mission tabs (mission) */}
      <section className={`relative z-10 px-4 pb-6 md:px-8 ${site ? "hidden md:block" : ""} ${missionId ? "md:absolute md:left-0 md:top-0 md:pt-20" : "md:w-[36%] md:max-w-[560px] md:pb-4 md:pt-20"}`}>
        {!missionId && (
          <div className="fade-in pt-1 md:pt-0">
            <p className="label">NASA Space Apps Challenge 2026</p>
            <h1 className="display mt-3 text-[length:var(--t-hero)] leading-[.92] tracking-[-.045em]">Rehearse the Moon and Mars on Earth.</h1>
            <p className="mt-3 max-w-[440px] text-[15.5px] leading-snug text-[var(--mut)]">Pick a mission to see where on Earth it could be rehearsed, how each region compares with the target, and where the comparison breaks.</p>
          </div>
        )}
        <div className={missionId ? "flex flex-wrap gap-2" : "stagger mt-4 grid gap-2"} role="group" aria-label="Choose a mission">
          {MISSIONS.map((m) => {
            const active = m.id === missionId || (!missionId && m.id === shown.id);
            const c = BODY_COLOR[m.target.body];
            return missionId ? (
              <button key={m.id} aria-pressed={m.id === missionId} onClick={() => pick(m.id)} className="chip glass !py-1.5" style={active ? { borderColor: c, color: c } : undefined}>{m.short}</button>
            ) : (
              <button key={m.id} onClick={() => pick(m.id)} className="card glass rounded-xl px-3 py-2.5 text-left hover:border-[var(--ink)]" style={{ ...(active ? { borderColor: c } : {}), ["--glow" as string]: c }}>
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <b className="display text-[19px] leading-tight">{m.short}</b>
                  <span className="text-[14px]" style={{ color: c }}>{m.target.body === "moon" ? "Moon" : "Mars"} · <span className="place">{m.target.name.split(" (")[0]}</span></span>
                </span>
                <small className="mt-0.5 hidden text-[13px] text-[var(--mut)] md:block md:[@media(max-height:900px)]:hidden">{m.blurb}</small>
              </button>
            );
          })}
        </div>
        {!missionId && (<>
          <dl className="mt-4 grid grid-cols-4 gap-3" aria-label="Project in numbers">
            {STATS.map(([n, l]) => <div key={l} className="flex flex-col"><dt className="order-2 mt-1 text-[11px] leading-tight text-[var(--dim)]">{l}</dt><dd className="mono order-1 text-[20px] leading-none tracking-[-.03em]">{n}</dd></div>)}
          </dl>
          <p className="mt-3 text-[12px] text-[var(--dim)]" aria-live="polite">Showing: {shown.short} → {t.name.split(" (")[0]}</p>
        </>)}
      </section>

      {missionId && <h1 className="sr-only">Logos Mission Analogs: {shown.short}, target {t.name}</h1>}
      {missionId && (
        <aside id="panel" className={`slide-in glass relative z-10 scroll-mt-14 mx-4 mb-6 rounded-[20px] p-5 transition-[width] duration-500 md:fixed md:bottom-4 md:right-4 md:top-16 md:mx-0 md:mb-0 md:overflow-y-auto ${site ? "md:w-[min(760px,60vw)] md:p-8" : "md:w-[380px] md:p-6"}`} aria-label={shown.title}>
          {site ? (
            <SitePanel site={site} mission={shown} onBack={() => setSel(null)} />
          ) : (
            <div className="fade-in" key={shown.id}>
              <p className="text-[14px]" style={{ color: BODY_COLOR[t.body] }}>Target · {t.body === "moon" ? "Moon" : "Mars"} · <span className="place">{t.name}</span></p>
              <h2 className="display mt-1 text-[30px] leading-[1]">{shown.short}</h2>
              <p className="mt-1 text-[13.5px] text-[var(--mut)]">{shown.blurb}</p>
              <dl className="mt-3 grid gap-2 text-[13px]">
                <div><dt className="label">What is rehearsed</dt><dd className="mt-0.5 text-[var(--mut)]">{shown.rehearse}</dd></div>
                <div><dt className="label">Why it matters</dt><dd className="mt-0.5 text-[var(--mut)]">{shown.matters}</dd></div>
              </dl>
              {t.description && <p className="mt-2 text-[12px] text-[var(--dim)]">About the target: {t.description}</p>}
              <p className="mt-3 border-l-2 pl-3 text-[12.5px]" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>{shown.keyLimit}</p>

              <h3 className="label mt-4">Rehearsed for real by</h3>
              <ul className="mt-2 grid gap-1 text-[13px]">
                {shown.campaigns.map((c) => <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{c.name}</a> <span aria-hidden className="text-[var(--dim)]">↗</span></li>)}
              </ul>

              <div className="mt-5 flex items-baseline justify-between"><h3 className="label">New regions to investigate</h3><span className="mono whitespace-nowrap text-[11px] text-[var(--dim)]">index · access</span></div>
              <p className="mt-1 text-[11.5px] leading-snug text-[var(--dim)]">{TOP_NOTE}</p>
              <ul className="stagger mt-1 grid gap-0.5">{fresh.map((s, i) => row(s, i + 1))}</ul>

              <h3 className="label mt-4">Known analogs · used to validate</h3>
              <ul className="stagger mt-1 grid gap-0.5">{known.map((s, i) => row(s, fresh.length + i + 1))}</ul>

              <p className="mt-4 text-[12.5px] text-[var(--mut)]"><b className="text-[var(--ink)]">Validation.</b> {shown.validation.result}</p>
              <p className="mt-2 text-[11.5px] text-[var(--dim)]">Access complexity: Low · Medium · High (team-defined, neutral). Not travel advice.</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><KindChip kind="new" /><KindChip kind="known" /></div>
            </div>
          )}
        </aside>
      )}

      {!missionId && (
        <section className="relative z-10 px-4 pb-10 md:w-[36%] md:max-w-[560px] md:px-8" aria-labelledby="how">
          <h2 id="how" className="display text-[28px]">How it works</h2>
          <ol className="stagger mt-4 grid gap-4">
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">1</span><div><b className="title-sm text-[15px]">Start from a real mission</b><p className="text-[13.5px] text-[var(--mut)]">We read what NASA, ESA and Mars Society field campaigns actually rehearsed, and turned each task into a few surface conditions that open data can measure.</p></div></li>
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">2</span><div><b className="title-sm text-[15px]">Score all land on Earth</b><p className="text-[13.5px] text-[var(--mut)]">NASA MODIS and GPM grids, soil and rock maps: every 0.1° cell gets an analog index per mission. Known analog sites are used to check that the index finds them.</p></div></li>
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">3</span><div><b className="title-sm text-[15px]">Show new regions — and their limits</b><p className="text-[13.5px] text-[var(--mut)]">Each mission gets new regions to investigate, compared with its target condition by condition, with where the analogy breaks and how complex access is.</p></div></li>
          </ol>
          <p className="mt-4 text-[13px] text-[var(--dim)]">For EVA and rover field teams, this is a first-pass shortlist to verify with high-resolution imagery, terrain and field checks before planning a rehearsal — not a site recommendation.</p>
          <button className="chip mt-5 hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Read the method and sources</button>
          <h2 className="display mt-10 text-[28px]">Next missions</h2>
          <p className="mt-1 text-[13px] text-[var(--mut)]">Real analog campaigns we have not scored: they are not driven by terrain, or there is no global data to compare. Listed for context.</p>
          <ul className="mt-3 grid gap-2">
            {NEXT_MISSIONS.map((n) => <li key={n.name} className="text-[13.5px]"><a href={n.url} target="_blank" rel="noopener noreferrer" className="title-sm underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{n.name}</a> <span className="text-[11.5px] text-[var(--dim)]">· {n.who} · not scored</span><br /><span className="text-[var(--mut)]">{n.what}</span></li>)}
          </ul>
        </section>
      )}

      <footer className={`relative z-10 px-4 pb-4 text-[11.5px] text-[var(--dim)] md:max-w-[34%] md:px-8 ${missionId ? "md:fixed md:bottom-3 md:left-0 md:pb-0" : ""}`}>
        Imagery: NASA GIBS · NASA SVS / LROC WAC · NASA/USGS Viking MDIM 2.1. To scale: orbit radii (Earth 1 : Mars 1.52), orbital periods (1 : 1.88) and the relative sizes of Earth, Mars and the Moon. Not to scale: body sizes against the orbits, the Sun, the Moon’s orbit (enlarged) and orbit shapes (drawn as circles); the target world is shown beside Earth for comparison. Not endorsed by NASA.
      </footer>

      {method && <MethodSheet onClose={() => setMethod(false)} />}
    </main>
  );
}
