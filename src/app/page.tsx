"use client";
// AI-assisted (Claude), reviewed by team Logos

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SceneMarker } from "@/components/SolarScene";
import SitePanel, { AccessBars } from "@/components/SitePanel";
import EvidenceBadge from "@/components/Evidence";
import MethodSheet from "@/components/MethodSheet";
import Count from "@/components/Count";
import { EVIDENCE, EVIDENCE_ORDER, FILTERS, HARDWARE, MISSIONS, NEXT_MISSIONS, NO_FILTER, byEvidence, passes, sceneLabel, topNote, travelText, type ListFilter, type Mission, type MissionId, type Site } from "@/lib/missions";

const SolarScene = dynamic(() => import("@/components/SolarScene"), { ssr: false });
const DEMO_MS = 7000;
// Project in numbers, computed from the data file (nothing typed by hand).
const STATS: [string, string][] = [
  [String(MISSIONS.length), "missions from real field campaigns"],
  [`${(Math.floor(Math.min(...MISSIONS.map((m) => m.landCells ?? Infinity)) / 1e5) / 10).toFixed(1)}M+`, "land cells scored per mission"], // rounded down, so "+" is true
  [String(MISSIONS.reduce((n, m) => n + m.sites.filter((s) => s.kind === "new").length, 0)), "new regions to investigate"],
  [String(MISSIONS.filter((m) => m.validated).reduce((n, m) => n + m.sites.filter((s) => s.kind === "known").length, 0)), "known analogs used to validate"],
];
const BODY_COLOR = { moon: "var(--moon)", mars: "var(--mars)", earth: "var(--earth)" } as const;

/** Markers of the scene: the target and the sites of the list, in the order of the list (filtered-out sites are not drawn). */
function sceneFor(m: Mission, list: Site[]) {
  const tId = `t-${m.id}`;
  const markers: SceneMarker[] = [
    { id: tId, body: m.target.body, lat: m.target.lat, lon: m.target.lon, kind: "target", label: m.target.name.split(" (")[0] },
    ...list.map((s, i) => ({ id: s.id, body: "earth" as const, lat: s.lat, lon: s.lon, kind: "candidate" as const, label: sceneLabel(s, m.sites), rank: i + 1, primary: s.kind === "new" })),
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
  const [filter, setFilter] = useState<ListFilter>(NO_FILTER);

  const shown = missionId ? MISSIONS.find((m) => m.id === missionId)! : MISSIONS[demoIdx % MISSIONS.length];
  // The list: ordered by independent evidence (the index does not tell the new regions apart), then filtered.
  const list = useMemo(() => byEvidence(shown.sites).filter((s) => passes(s, filter)), [shown, filter]);
  const scene = useMemo(() => sceneFor(shown, list), [shown, list]);
  const groups = EVIDENCE_ORDER.map((e) => ({ e, items: list.filter((s) => s.evidence === e) })).filter((g) => g.items.length);
  const filtered = filter.reach !== "any" || filter.ground !== "any" || filter.lowAccess;
  const site = sel ? shown.sites.find((s) => s.id === sel) ?? null : null;
  const t = shown.target;

  // The address says which mission and site are open (?m=<mission id>&s=<site id>): it can be shared, and Back / Forward work.
  const cur = useRef({ m: missionId, s: sel }), fromUrl = useRef(false), firstSync = useRef(true), quietFocus = useRef(false);
  useEffect(() => { cur.current = { m: missionId, s: sel }; }, [missionId, sel]);
  useEffect(() => {
    const apply = (first = false) => {
      const q = new URLSearchParams(window.location.search), mm = MISSIONS.find((x) => x.id === q.get("m")), sid = q.get("s");
      const m = mm ? mm.id : null, st = mm && sid && mm.sites.some((x) => x.id === sid) ? sid : null;
      if (m === cur.current.m && st === cur.current.s) return;
      fromUrl.current = true; // this change comes from the address: do not add a history entry for it
      quietFocus.current = first && !!st; // a page opened directly on a site does not take the keyboard focus
      setMissionId(m); setSel(st);
    };
    apply(true);
    const onPop = () => apply();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (missionId || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setDemoIdx((i) => i + 1), DEMO_MS);
    return () => window.clearInterval(id);
  }, [missionId, paused]);

  // Keep the address in step with what is open. A choice made on the page adds a history entry, so Back undoes it.
  useEffect(() => {
    if (firstSync.current) { firstSync.current = false; return; } // first render: the address has not been read yet
    const q = new URLSearchParams(window.location.search);
    if (missionId) q.set("m", missionId); else q.delete("m");
    if (missionId && sel) q.set("s", sel); else q.delete("s");
    const qs = q.toString(), search = qs ? `?${qs}` : "";
    if (search !== window.location.search) {
      const url = search || window.location.pathname;
      if (fromUrl.current) window.history.replaceState(null, "", url); else window.history.pushState(null, "", url);
    }
    fromUrl.current = false;
    if (sel && window.innerWidth < 768) window.scrollTo({ top: 0 }); // phones: the site panel sits right under the small scene, so start from the top
  }, [missionId, sel]);

  // The panel: a site opens at its top; going back returns to the place in the list, with the keyboard focus on that site.
  const scroller = useRef<HTMLDivElement>(null), methodBtn = useRef<HTMLButtonElement>(null), listScroll = useRef(0), lastSite = useRef<string | null>(null), mounted = useRef(false);
  useLayoutEffect(() => { const el = scroller.current; if (el) el.scrollTop = sel ? 0 : listScroll.current; }, [sel, missionId]);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (quietFocus.current) { quietFocus.current = false; lastSite.current = sel; return; }
    if (sel) { lastSite.current = sel; document.querySelector<HTMLElement>("#panel .back-btn")?.focus({ preventScroll: true }); }
    else if (lastSite.current) document.querySelector<HTMLElement>(`#panel [data-site="${lastSite.current}"]`)?.focus({ preventScroll: true });
  }, [sel]);
  const openSite = (id: string) => { listScroll.current = scroller.current?.scrollTop ?? 0; setSel(id); setHover(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (method) setMethod(false); else if (sel) setSel(null); else setMissionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [method, sel]);

  const pick = (id: MissionId) => { listScroll.current = 0; lastSite.current = null; setMissionId(id); setSel(null); setFilter(NO_FILTER); }; // filters start clean in each mission
  const home = () => { listScroll.current = 0; lastSite.current = null; setMissionId(null); setSel(null); };
  const chip = (on: boolean, label: string, onClick: () => void) => <button key={label} type="button" className="fchip" aria-pressed={on} onClick={onClick}>{label}</button>;

  // A plain function (not a component defined during render): rows keep their identity, so keyboard focus is not lost.
  const row = (s: Mission["sites"][number], n: number) => (
    <li key={s.id}>
      <button data-site={s.id} onClick={() => openSite(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(s.id)} onBlur={() => setHover(null)} className="row grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)] focus-visible:border-[var(--ink)]">
        <span className="mono text-[12px]" style={{ color: EVIDENCE[s.evidence].color }}>{String(n).padStart(2, "0")}</span>
        <span className="min-w-0"><span className="place block text-[15px] leading-snug">{s.name}</span><span className="block truncate text-[11.5px] text-[var(--dim)]">{s.campaign ? `${s.country ?? ""} · ${s.campaign}` : `${s.country ?? ""} · ${travelText(s.travelH)}${s.slopeDeg !== null ? ` · slope ${s.slopeDeg.toFixed(1)}°` : ""}`}</span></span>
        <span className="flex flex-col items-end gap-1"><span className="mono text-[13px]"><Count value={s.match} decimals={3} /></span><AccessBars site={s} /></span>
      </button>
    </li>
  );

  return (
    <main className="stars relative min-h-dvh overflow-x-clip">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-[var(--bg)] px-4 py-2 md:bg-transparent md:p-4 md:px-8">
        <button onClick={home} data-scene-avoid className="title-sm pointer-events-auto flex items-center gap-2 text-[16px]"><span aria-hidden className="inline-block h-[26px] w-[26px] bg-[url(/logo-symbol.svg)] bg-contain bg-center bg-no-repeat" />Logos <span className="hidden text-[var(--mut)] sm:inline">· Mission Analogs</span></button>
        <div className="pointer-events-auto flex items-center gap-2" data-scene-avoid>
          <span className="hidden sm:inline"><span className="chip text-[var(--amber)]" style={{ borderColor: "var(--amber)" }}>Prototype</span></span>
          <button className="chip hover:border-[var(--ink)]" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={() => setPaused((p) => !p)}><span aria-hidden>{paused ? "▶" : "❚❚"}</span><span className="hidden sm:inline">{paused ? "Play motion" : "Pause motion"}</span></button>
          <button ref={methodBtn} className="chip hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Method &amp; sources</button>
        </div>
      </header>

      {/* 3D scene */}
      <div className={`sticky top-0 z-0 w-full pt-12 md:pt-0 ${site ? "h-[22dvh]" : missionId ? "h-[40dvh]" : "h-[32dvh]"} transition-[left,right] duration-700 md:fixed md:inset-y-0 md:h-dvh md:w-auto ${missionId ? (site ? "md:left-0 md:right-[calc(min(760px,60vw)+16px)]" : "md:left-0 md:right-[436px]") : "md:left-[36%] md:right-0"}`}>
        {glFailed ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-[var(--mut)]">The 3D view needs WebGL. The lists below have all the information.</div>
        ) : (
          <SolarScene
            mode={missionId ? { kind: "focus", body: t.body as "moon" | "mars" } : { kind: "overview" }}
            markers={scene.markers}
            selectedId={sel}
            highlightId={hover}
            onHover={setHover}
            onSelect={(id) => { if (!missionId) pick(shown.id); if (id.startsWith("t-")) setSel(null); else openSite(id); }}
            paused={paused}
            onError={() => setGlFailed(true)}
          />
        )}
      </div>


      {/* Left column: hero + mission picker (landing) or mission tabs (mission) */}
      <section className={`relative z-10 px-4 pb-6 md:px-8 ${site ? "hidden md:block" : ""} ${missionId ? `md:absolute md:left-0 md:top-0 md:pt-20 ${site ? "md:max-w-[calc(100vw-min(760px,60vw)-16px)]" : "md:max-w-[calc(100vw-436px)]"}` : "md:w-[36%] md:max-w-[560px] md:pb-4 md:pt-20"}`}>
        {!missionId && (
          <div className="fade-in pt-1 md:pt-0">
            <p className="label">NASA Space Apps Challenge 2026</p>
            <h1 className="display mt-3 text-[length:var(--t-hero)] leading-[.92] tracking-[-.045em]">Rehearse the Moon and Mars on Earth.</h1>
            <p className="mt-3 max-w-[440px] text-[15.5px] leading-snug text-[var(--mut)]">Pick a mission to see where on Earth it could be rehearsed, how each region compares with the target, and where the comparison breaks.</p>
          </div>
        )}
        <div className={missionId ? "flex flex-wrap gap-2" : "stagger mt-4 grid gap-2"} role="group" aria-label="Choose a mission" data-scene-avoid>
          {MISSIONS.map((m) => {
            const active = m.id === missionId || (!missionId && m.id === shown.id);
            const c = BODY_COLOR[m.target.body];
            return missionId ? (
              <button key={m.id} aria-pressed={m.id === missionId} onClick={() => pick(m.id)} className="chip glass !py-1.5" style={active ? { borderColor: c, color: c } : undefined}>{m.short}</button>
            ) : (
              <button key={m.id} onClick={() => pick(m.id)} title={m.blurb} className="card glass rounded-xl px-3 py-2.5 text-left hover:border-[var(--ink)]" style={{ ...(active ? { borderColor: c } : {}), ["--glow" as string]: c }}>
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
        <aside id="panel" className={`slide-in glass relative z-10 scroll-mt-14 mx-4 mb-6 rounded-[20px] transition-[width] duration-500 md:fixed md:bottom-4 md:right-4 md:top-16 md:mx-0 md:mb-0 md:overflow-hidden ${site ? "md:w-[min(760px,60vw)]" : "md:w-[420px]"}`} aria-label={shown.title}>
          <div ref={scroller} className={`p-5 md:h-full md:overflow-y-auto ${site ? "md:p-8" : "md:p-6"}`}>
          {site ? (
            <SitePanel site={site} mission={shown} onBack={() => setSel(null)} />
          ) : (
            <div className="fade-in" key={shown.id}>
              <p className="text-[14px]" style={{ color: BODY_COLOR[t.body] }}>Target · {t.body === "moon" ? "Moon" : "Mars"} · <span className="place">{t.name}</span></p>
              <h2 className="display mt-1 text-[30px] leading-[1]">{shown.short}</h2>
              <p className="mt-1 text-[13.5px] text-[var(--mut)]">{shown.blurb}</p>
              <p className="mt-2 border-l-2 pl-3 text-[12.5px]" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>{shown.keyLimit}</p>

              <p className="mt-3 text-[12.5px] leading-snug text-[var(--mut)]"><span className="label mr-1.5">Hardware rehearsed</span>
                {HARDWARE[shown.id].map((h, i) => <span key={h.text}>{i > 0 && " · "}<a href={h.url} target="_blank" rel="noopener noreferrer" title={`${h.text} (${h.by})`} className="text-[var(--ink)] underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{h.short}</a></span>)}
              </p>

              <div className="mt-4 flex items-baseline justify-between"><h3 className="label">Sites · {filtered ? `${list.length} of ${shown.sites.length}` : shown.sites.length}</h3><span className="mono whitespace-nowrap text-[11px] text-[var(--dim)]">index · access</span></div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-snug text-[var(--dim)]"><span className="ev-pips" style={{ ["--ev" as string]: "var(--mut)" }} aria-hidden><i className="f" /><i className="f" /><i className="f" /><i /></span>dots: independent evidence, more is stronger<span aria-hidden>·</span><span className="inline-flex items-center gap-0.5" aria-hidden><i className="inline-block h-2.5 w-1.5 rounded-sm bg-[var(--sand)]" /><i className="inline-block h-2.5 w-1.5 rounded-sm bg-[var(--line2)]" /><i className="inline-block h-2.5 w-1.5 rounded-sm bg-[var(--line2)]" /></span>bars: access complexity, low to high</p>
              <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Filter the sites by logistics">
                {chip(filter.reach === "near", `Reachable in < ${FILTERS.reachH} h`, () => setFilter((f) => ({ ...f, reach: f.reach === "near" ? "any" : "near" })))}
                {chip(filter.reach === "remote", `Remote > ${FILTERS.remoteH} h`, () => setFilter((f) => ({ ...f, reach: f.reach === "remote" ? "any" : "remote" })))}
                {chip(filter.lowAccess, "Low access complexity", () => setFilter((f) => ({ ...f, lowAccess: !f.lowAccess })))}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1" role="group" aria-label="Filter the sites by terrain">
                <span className="label mr-1">Terrain</span>
                {(["any", "flat", "steep"] as const).map((g) => chip(filter.ground === g, g === "any" ? "Any" : g === "flat" ? `Flat ≤ ${FILTERS.flatDeg}°` : `Steep > ${FILTERS.flatDeg}°`, () => setFilter((f) => ({ ...f, ground: g }))))}
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-[var(--dim)]">Travel time to a city, mean slope and access are not part of the index. Remoteness can be the point: some analog missions rehearse isolation.</p>

              {groups.map((g) => (
                <section key={g.e} aria-label={EVIDENCE[g.e].group}>
                  <h4 className="mt-3 flex items-center justify-between gap-2 text-[11px] font-normal uppercase tracking-[.08em]" style={{ color: EVIDENCE[g.e].color }} title={EVIDENCE[g.e].note}><span>{shown.validated ? EVIDENCE[g.e].group : g.e === "agency" ? "Known analog · campaign for another task" : `${EVIDENCE[g.e].group} · ground only`}</span><EvidenceBadge level={g.e} compact /></h4>
                  <ul className="stagger mt-0.5 grid gap-0.5">{g.items.map((s) => row(s, list.indexOf(s) + 1))}</ul>
                </section>
              ))}
              {!list.length && <p className="mt-3 text-[13px] text-[var(--mut)]">No site of this mission passes these filters. <button className="underline" onClick={() => setFilter(NO_FILTER)}>Clear filters</button></p>}
              {filtered && list.length > 0 && <p className="mt-2 text-[12px] text-[var(--mut)]">{shown.sites.length - list.length} hidden by the filters. <button className="underline" onClick={() => setFilter(NO_FILTER)}>Clear filters</button></p>}
              <p className="mt-3 text-[11.5px] leading-snug text-[var(--dim)]">Ordered by independent evidence (a campaign ran there, or what a literature check found near a new region), not by the index. {topNote(shown)}</p>

              <details className="about mt-4">
                <summary>About this mission</summary>
                <dl className="mt-2 grid gap-2 text-[13px]">
                  <div><dt className="label">What is rehearsed</dt><dd className="mt-0.5 text-[var(--mut)]">{shown.rehearse}</dd></div>
                  <div><dt className="label">Hardware rehearsed</dt><dd className="mt-0.5 text-[var(--mut)]"><ul className="grid gap-0.5">{HARDWARE[shown.id].map((h) => <li key={h.text}><a href={h.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{h.text}</a> <span className="text-[var(--dim)]">· {h.by}</span></li>)}</ul></dd></div>
                  <div><dt className="label">Why it matters</dt><dd className="mt-0.5 text-[var(--mut)]">{shown.matters}</dd></div>
                  {t.description && <div><dt className="label">About the target</dt><dd className="mt-0.5 text-[var(--mut)]">{t.description} {t.descriptionSources?.map((d, i) => <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="underline" title={d.name}>[{i + 1}]</a>)}</dd></div>}
                </dl>
                <h3 className="label mt-3">{shown.validated ? "Rehearsed for real by" : "Closest real campaigns · the low Sun was simulated"}</h3>
                <ul className="mt-1 grid gap-1 text-[13px]">
                  {shown.campaigns.map((c) => <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{c.name}</a> <span aria-hidden className="text-[var(--dim)]">↗</span></li>)}
                </ul>
                <p className="mt-3 text-[12.5px] text-[var(--mut)]"><b className="text-[var(--ink)]">{shown.validated ? "Validation." : "Not validated."}</b> {shown.validation.result}</p>
                <p className="mt-2 text-[11.5px] text-[var(--dim)]">Access complexity: Low · Medium · High (team-defined, neutral). Not travel advice.</p>
              </details>
            </div>
          )}
          </div>
        </aside>
      )}

      {!missionId && (
        <section className="relative z-10 px-4 pb-10 md:w-[36%] md:max-w-[560px] md:px-8" aria-labelledby="how">
          <h2 id="how" className="display text-[28px]">How it works</h2>
          <ol className="stagger mt-4 grid gap-4">
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">1</span><div><b className="title-sm text-[15px]">Start from a real mission</b><p className="text-[13.5px] text-[var(--mut)]">We read what NASA, ESA and Mars Society field campaigns actually rehearsed, and turned each task into a few surface conditions that open data can measure.</p></div></li>
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">2</span><div><b className="title-sm text-[15px]">Score all land on Earth</b><p className="text-[13.5px] text-[var(--mut)]">NASA MODIS and GPM grids, soil and rock maps: every 0.1° cell gets an analog index per mission. Known analog sites are used to check that the index finds them; where no campaign site exists, the mission says “computed, not validated”.</p></div></li>
            <li className="grid grid-cols-[36px_1fr] gap-2"><span className="step-n">3</span><div><b className="title-sm text-[15px]">Show new regions — and their limits</b><p className="text-[13.5px] text-[var(--mut)]">Each mission gets new regions to investigate, compared with its target condition by condition, with where the analogy breaks and how complex access is.</p></div></li>
          </ol>
          <p className="mt-4 text-[13px] text-[var(--dim)]">For EVA and rover field teams, this is a first-pass shortlist to verify with high-resolution imagery, terrain and field checks before planning a rehearsal — not a site recommendation.</p>
          <button className="chip mt-5 hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Read the method and sources</button>
          <h2 className="display mt-10 text-[28px]">Other real campaigns</h2>
          <p className="mt-1 text-[13px] text-[var(--mut)]">Analog campaigns that have already run and that we have not scored: they are not driven by terrain, or there is no global data to compare. Listed for context.</p>
          <ul className="mt-3 grid gap-2">
            {NEXT_MISSIONS.map((n) => <li key={n.name} className="text-[13.5px]"><a href={n.url} target="_blank" rel="noopener noreferrer" className="title-sm underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{n.name}</a> <span className="text-[11.5px] text-[var(--dim)]">· {n.who} · not scored</span><br /><span className="text-[var(--mut)]">{n.what}</span></li>)}
          </ul>
        </section>
      )}

      <footer data-scene-avoid className={`relative z-10 px-4 pb-4 text-[11.5px] text-[var(--dim)] md:max-w-[34%] md:px-8 ${missionId ? "md:fixed md:bottom-3 md:left-0 md:pb-0" : ""}`}>
        Imagery: NASA Blue Marble, Black Marble, LROC WAC and LOLA, Viking MDIM 2.1 and MOLA (credits in Method &amp; sources); the Sun is drawn by code. To scale: orbit radii (Earth 1 : Mars 1.52), orbital periods (1 : 1.88) and the relative sizes of Earth, Mars and the Moon. Not to scale: body sizes against the orbits, the Sun, the Moon’s orbit (enlarged) and orbit shapes (drawn as circles); the target world is shown beside Earth for comparison. Not endorsed by NASA, ESA, JAXA, CSA or any organisation named here.
      </footer>

      {method && <MethodSheet onClose={() => { setMethod(false); window.requestAnimationFrame(() => methodBtn.current?.focus()); }} />}
    </main>
  );
}
