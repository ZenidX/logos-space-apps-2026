"use client";
// AI-assisted (Claude), reviewed by team Logos
// Two modes on one page. Story (no mission chosen): the first screen is the 3D scene alone; scrolling tells the idea one
// screen at a time while the scene follows (each mission step flies to its target world) and ends in the mission picker.
// Explorer (a mission chosen, or a link with ?m=): the scene, the mission's list with filters, and the site panel.

import { asset } from "@/lib/logos/asset";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SceneMarker } from "@/components/logos/SolarScene";
import SitePanel, { AccessBars } from "@/components/logos/SitePanel";
import EvidenceBadge from "@/components/logos/Evidence";
import MethodSheet from "@/components/logos/MethodSheet";
import Count from "@/components/logos/Count";
import MissionPreview from "@/components/logos/MissionPreview";
import { GLOBE_TEX } from "@/lib/logos/globe-tex";
import { EVIDENCE, EVIDENCE_ORDER, FILTERS, HARDWARE, MISSIONS, NEXT_MISSIONS, NO_FILTER, byEvidence, passes, sceneLabel, topNote, travelText, type ListFilter, type Mission, type MissionId, type Site } from "@/lib/logos/missions";

const SolarScene = dynamic(() => import("@/components/logos/SolarScene"), { ssr: false });
// Project in numbers, computed from the data file (nothing typed by hand).
const STATS: [string, string][] = [
  [String(MISSIONS.length), "missions from real field campaigns"],
  [`${(Math.floor(Math.min(...MISSIONS.map((m) => m.landCells ?? Infinity)) / 1e5) / 10).toFixed(1)}M+`, "land cells scored per mission"], // rounded down, so "+" is true
  [String(MISSIONS.reduce((n, m) => n + m.sites.filter((s) => s.kind === "new").length, 0)), "new regions to investigate"],
  [String(MISSIONS.filter((m) => m.validated).reduce((n, m) => n + m.sites.filter((s) => s.kind === "known").length, 0)), "known analogs used to validate"],
];
const BODY_COLOR = { moon: "var(--moon)", mars: "var(--mars)", earth: "var(--earth)" } as const;
const NO_MARKERS: SceneMarker[] = [];
const DOCK_NAME: Record<MissionId, string> = { "m1-eva-basalt": "Suited EVA", "m2-rover-sand": "Rover", "m3-ground-ice": "Ground ice", "m4-low-sun": "Low Sun" };
type Step = "hero" | "intro" | "idea" | MissionId | "figures" | "explore";

/** Markers of the scene: the target and the sites of the list, in the order of the list (filtered-out sites are not drawn). */
function sceneFor(m: Mission, list: Site[]) {
  const tId = `t-${m.id}`;
  const markers: SceneMarker[] = [
    { id: tId, body: m.target.body, lat: m.target.lat, lon: m.target.lon, kind: "target", label: m.target.name.split(" (")[0] },
    ...list.map((s, i) => ({ id: s.id, body: "earth" as const, lat: s.lat, lon: s.lon, kind: "candidate" as const, label: sceneLabel(s, m.sites), rank: i + 1, primary: s.kind === "new" })),
  ];
  return { markers };
}
const STORY_SCENES = Object.fromEntries(MISSIONS.map((m) => [m.id, sceneFor(m, byEvidence(m.sites)).markers])) as Record<MissionId, SceneMarker[]>;

export default function Home() {
  const [missionId, setMissionId] = useState<MissionId | null>(null);
  const [paused, setPaused] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [method, setMethod] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>(NO_FILTER);
  const [step, setStep] = useState<Step>("hero");
  const [wide, setWide] = useState(true);
  const [armed, setArmed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const on = () => setScrolled(window.scrollY > 40); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);

  const shown = missionId ? MISSIONS.find((m) => m.id === missionId)! : MISSIONS[0];
  // The list: ordered by independent evidence (the index does not tell the new regions apart), then filtered.
  const list = useMemo(() => byEvidence(shown.sites).filter((s) => passes(s, filter)), [shown, filter]);
  const scene = useMemo(() => sceneFor(shown, list), [shown, list]);
  const groups = EVIDENCE_ORDER.map((e) => ({ e, items: list.filter((s) => s.evidence === e) })).filter((g) => g.items.length);
  const filtered = filter.reach !== "any" || filter.ground !== "any" || filter.lowAccess;
  const site = sel ? shown.sites.find((s) => s.id === sel) ?? null : null;
  const t = shown.target;
  const storyMission = !missionId ? MISSIONS.find((m) => m.id === step) ?? null : null;
  const calm = !missionId && step === "hero"; // first screen: the scene alone

  // Story ⇄ explorer: the explorer starts at the top; coming back puts the reader where they left the story.
  const storyScroll = useRef(0), back = useRef(false);
  const leaveStory = () => { storyScroll.current = window.scrollY; };

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
      if (!m && cur.current.m) back.current = true; // Back to the story: return to where the reader left it
      if (m && !cur.current.m && !first) storyScroll.current = window.scrollY;
      setMissionId(m); setSel(st);
    };
    apply(true);
    const onPop = () => apply();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const q = window.matchMedia("(min-width: 768px)"), on = () => setWide(q.matches);
    on(); q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

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

  useEffect(() => { window.history.scrollRestoration = "manual"; }, []); // the page restores the story position itself
  useLayoutEffect(() => {
    if (missionId) { window.scrollTo({ top: 0 }); return; }
    if (back.current) { back.current = false; const y = storyScroll.current; window.scrollTo({ top: y }); requestAnimationFrame(() => window.scrollTo({ top: y })); }
  }, [missionId]);

  // Story: which step is in the middle of the screen (the scene follows it), and the text that fades in as it arrives.
  const storyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (missionId) return;
    const root = storyRef.current;
    if (!root) return;
    const steps = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setStep((e.target as HTMLElement).dataset.step as Step); }, { rootMargin: "-50% 0px -50% 0px" });
    root.querySelectorAll<HTMLElement>("[data-step]").forEach((n) => steps.observe(n));
    const reveal = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); } }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    root.querySelectorAll<HTMLElement>(".reveal").forEach((n) => reveal.observe(n));
    setArmed(true); // from now on, text below the fold waits to fade in (without JavaScript everything stays visible)
    return () => { steps.disconnect(); reveal.disconnect(); };
  }, [missionId]);

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
  // browse the mission's sites in place, in the order of the list (wraps around)
  const navList = site && list.some((x) => x.id === site.id) ? list : byEvidence(shown.sites);
  const navPos = site ? navList.findIndex((x) => x.id === site.id) : -1;
  const step1 = (d: number) => { if (navPos < 0) return; const n = navList[(navPos + d + navList.length) % navList.length]; setSel(n.id); setHover(null); };

  const pick = (id: MissionId) => { if (!missionId) leaveStory(); listScroll.current = 0; lastSite.current = null; setMissionId(id); setSel(null); setFilter(NO_FILTER); }; // filters start clean in each mission
  const home = () => { if (missionId) back.current = true; listScroll.current = 0; lastSite.current = null; setMissionId(null); setSel(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tg = e.target as HTMLElement;
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && sel && !method && !tg.closest("input, textarea, select, [role=tablist], [contenteditable]")) { e.preventDefault(); step1(e.key === "ArrowRight" ? 1 : -1); return; }
      if (e.key !== "Escape") return;
      if (method) setMethod(false); else if (sel) setSel(null); else if (missionId) { back.current = true; setMissionId(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [method, sel, missionId, navPos, navList]); // eslint-disable-line react-hooks/exhaustive-deps
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

  // Scene: in the story it fills the screen and frames its subject beside the text (right part on computers, top part on phones).
  const frame = useMemo(() => (missionId || calm ? { x: 0, y: 0 } : wide ? { x: 0.42, y: 0 } : { x: 0, y: 0.44 }), [missionId, calm, wide]);
  const sceneMode = useMemo(() => (missionId ? { kind: "focus" as const, body: t.body as "moon" | "mars" } : storyMission ? { kind: "focus" as const, body: storyMission.target.body as "moon" | "mars" } : { kind: "overview" as const }), [missionId, t.body, storyMission]);
  const sceneMarkers = missionId ? scene.markers : storyMission ? STORY_SCENES[storyMission.id] : NO_MARKERS;
  const credits = missionId ? (
    <footer data-scene-avoid className={`relative z-10 px-4 pb-4 text-[11px] text-[var(--dim)] md:fixed md:bottom-3 md:left-0 md:truncate md:px-8 md:pb-0 ${site ? "md:max-w-[calc(100vw-min(760px,60vw)-24px)]" : "md:max-w-[calc(100vw-444px)]"}`}>
      Imagery NASA (LRO, Viking, MOLA, Blue &amp; Black Marble) · sizes and distances not to scale · not endorsed by NASA · <button className="underline decoration-[var(--line2)] underline-offset-2 hover:text-[var(--ink)]" onClick={() => setMethod(true)}>credits &amp; scale</button>
    </footer>
  ) : null;
  const footer = (
    <footer data-scene-avoid className={`relative z-10 text-[11.5px] leading-relaxed text-[var(--dim)] ${missionId ? "px-4 pb-4 md:fixed md:bottom-3 md:left-0 md:max-w-[34%] md:px-8 md:pb-0" : "mt-12"}`}>
      {!missionId && (
        // Las páginas del equipo (antes un repo aparte): otra raíz de la web, con su propia barra
        <nav aria-label="More in Terra Vista" className="mb-8 flex flex-wrap gap-2 text-[13.5px]">
          {[["/base/", "Plan a base anywhere"], ["/appendix/", "Appendix: earlier prototype (Earth Engine global search)"]].map(([href, label]) => (
            <Link key={href} href={href} className="chip hover:border-[var(--ink)]">{label}</Link>
          ))}
        </nav>
      )}
      Imagery: NASA Blue Marble, Black Marble, LROC WAC and LOLA, Viking MDIM 2.1 and MOLA (credits in Method &amp; sources); the Sun is drawn by code. To scale: orbit radii (Earth 1 : Mars 1.52), orbital periods (1 : 1.88) and the relative sizes of Earth, Mars and the Moon. Not to scale: body sizes against the orbits, the Sun, the Moon’s orbit (enlarged) and orbit shapes (drawn as circles); the target world is shown beside Earth for comparison. Not endorsed by NASA, ESA, JAXA, CSA or any organisation named here.
    </footer>
  );

  return (
    <main className="stars relative min-h-dvh overflow-x-clip">
      {!missionId && <a href="#explore" className="skip">Skip to the mission explorer</a>}
      <header style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }} className={`pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-4 py-2 transition-[background-color] duration-500 md:p-4 md:px-8 ${missionId ? "bg-[var(--bg)] md:bg-transparent" : scrolled ? "head-veil" : ""}`}>
        <button onClick={home} data-scene-avoid className="title-sm pointer-events-auto flex items-center gap-2 text-[16px]" aria-label="Terra Vista, Mission Analogs: back to the start"><span aria-hidden className="inline-block h-[26px] w-[26px] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${asset("/logo-symbol.svg")})` }} />Terra Vista <span className={`hidden text-[var(--mut)] transition-opacity duration-500 sm:inline ${calm ? "opacity-0" : ""}`}>· Mission Analogs</span></button>
        <div className="pointer-events-auto flex items-center gap-2" data-scene-avoid>
          <Link href="/base/" className={`chip transition-[opacity,visibility,border-color] duration-500 hover:border-[var(--ink)] ${calm ? "invisible opacity-0" : ""}`}>Plan a base <span aria-hidden>→</span></Link>
          <span className={`hidden transition-[opacity,visibility] duration-500 sm:inline ${calm ? "invisible opacity-0" : ""}`}><span className="chip text-[var(--amber)]" style={{ borderColor: "var(--amber)" }}>Prototype</span></span>
          {!missionId && !calm && step !== "explore" && <span className="md:hidden"><button type="button" className="chip" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Missions <span aria-hidden>↓</span></button></span>}
          <button ref={methodBtn} className={`chip transition-[opacity,visibility,border-color] duration-500 hover:border-[var(--ink)] ${calm ? "invisible opacity-0" : ""}`} onClick={() => setMethod(true)}><span className="sm:hidden">Sources</span><span className="hidden sm:inline">Method &amp; sources</span></button>
          <button className="chip icon-btn hover:border-[var(--ink)]" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} title={paused ? "Play motion" : "Pause motion"} onClick={() => setPaused((p) => !p)}><span aria-hidden>{paused ? "▶" : "❚❚"}</span></button>
        </div>
      </header>

      {/* 3D scene */}
      <div className={missionId
        ? `sticky top-0 z-0 w-full pt-12 md:pt-0 ${site ? "h-[22dvh]" : "h-[40dvh]"} transition-[left,right] duration-700 md:fixed md:inset-y-0 md:h-dvh md:w-auto ${site ? "md:left-0 md:right-[calc(min(760px,60vw)+16px)]" : "md:left-0 md:right-[436px]"}`
        : `fixed inset-x-0 top-0 z-0 h-lvh ${calm ? "hide-names" : ""}`}>
        {glFailed ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-[var(--mut)]">The 3D view needs WebGL. The text and lists on this page have all the information.</div>
        ) : (
          <SolarScene
            mode={sceneMode}
            markers={sceneMarkers}
            selectedId={missionId ? sel : null}
            highlightId={hover}
            onHover={setHover}
            onSelect={(id) => { const m = missionId ?? storyMission?.id; if (!m) return; if (!missionId) pick(m); if (id.startsWith("t-")) setSel(null); else openSite(id); }}
            paused={paused}
            frame={frame}
            intro={calm}
            onError={() => setGlFailed(true)}
          />
        )}
      </div>

      {!missionId && (
        <div ref={storyRef} className={`story relative z-10 ${armed ? "armed" : ""} ${calm ? "calm" : ""}`}>
          <section data-step="hero" className="story-hero" aria-label="The Sun, the Earth with the Moon, and Mars on their orbits">
            <p className={`hero-line ${calm ? "" : "gone"}`}><span>Before the Moon and Mars,</span> <span>there is Earth.</span></p>
            <p className={`scroll-cue ${calm ? "" : "gone"} ${paused ? "still" : ""}`} aria-hidden><span>Scroll</span><i /></p>
          </section>

          <section data-step="intro" className="story-step">
            <div className="story-copy" data-scene-avoid>
              <p className="reveal label">NASA Space Apps Challenge 2026 · team Logos</p>
              <h1 className="reveal display story-title" style={{ ["--d" as string]: "80ms" }}>Rehearse the Moon and Mars on Earth.</h1>
              <p className="reveal story-lead" style={{ ["--d" as string]: "220ms" }}>Before crews walk on the Moon or drive on Mars, they practise here: on lava fields, sand, frozen ground and under a low polar Sun.</p>
            </div>
          </section>

          <section data-step="idea" className="story-step">
            <div className="story-copy" data-scene-avoid>
              <p className="reveal label">The idea</p>
              <h2 className="reveal display story-h2" style={{ ["--d" as string]: "80ms" }}>Start from the mission, not the planet.</h2>
              <p className="reveal story-lead" style={{ ["--d" as string]: "220ms" }}>For each field task we score all land on Earth against one target, condition by condition, and say where the comparison breaks.</p>
            </div>
          </section>

          {MISSIONS.map((m, i) => (
            <section key={m.id} data-step={m.id} className="story-step" aria-labelledby={`story-${m.id}`}>
              <div className="story-copy" data-scene-avoid>
                <p className="reveal label">Mission {i + 1} of {MISSIONS.length} · <span style={{ color: BODY_COLOR[m.target.body] }}>{m.target.body === "moon" ? "Moon" : "Mars"} · {m.target.name.split(" (")[0]}</span></p>
                <h2 id={`story-${m.id}`} className="reveal display story-h2" style={{ ["--d" as string]: "80ms" }}>{m.short}</h2>
                <p className="reveal story-lead" style={{ ["--d" as string]: "200ms" }}>{m.blurb}</p>
                <p className="reveal story-limit" style={{ ["--d" as string]: "320ms" }}>{m.keyLimit}</p>
                <button type="button" className="reveal chip story-go" style={{ ["--d" as string]: "420ms" }} onClick={() => pick(m.id)}>Explore this mission <span aria-hidden>→</span></button>
              </div>
            </section>
          ))}

          <section data-step="figures" className="story-step">
            <div className="story-copy" data-scene-avoid>
              <h2 className="reveal label">The project in numbers</h2>
              <dl className="story-figures" aria-label="Project in numbers">
                {STATS.map(([n, l], i) => <div key={l} className="reveal" style={{ ["--d" as string]: `${100 + i * 110}ms` }}><dt>{l}</dt><dd className="mono">{n}</dd></div>)}
              </dl>
            </div>
          </section>

          <section id="explore" data-step="explore" className="story-step story-explore" aria-labelledby="explore-h">
            <div className="story-copy" data-scene-avoid>
              <h2 id="explore-h" className="reveal display story-h2">Choose a mission</h2>
              <p className="reveal story-lead" style={{ ["--d" as string]: "100ms" }}>See where on Earth it could be rehearsed, how each region compares with the target, and where the comparison breaks.</p>
              <div className="reveal mt-5 grid gap-2" role="group" aria-label="Choose a mission" style={{ ["--d" as string]: "180ms" }}>
                {MISSIONS.map((m) => {
                  const c = BODY_COLOR[m.target.body];
                  return (
                    <MissionPreview key={m.id} m={m} at="right" className="block"><button onClick={() => pick(m.id)} className="card glass w-full rounded-xl px-3 py-2.5 text-left hover:border-[var(--ink)]" style={{ ["--glow" as string]: c }}>
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <b className="display text-[19px] leading-tight">{m.short}</b>
                        <span className="text-[14px]" style={{ color: c }}>{m.target.body === "moon" ? "Moon" : "Mars"} · <span className="place">{m.target.name.split(" (")[0]}</span></span>
                      </span>
                      <span className="card-meta md:hidden"><span className="mh-world" aria-hidden style={{ backgroundImage: `url(${GLOBE_TEX[m.target.body as "moon" | "mars"].lo})`, ["--c" as string]: c }} /><span><b>{m.sites.length}</b> sites · {m.validated ? <b style={{ color: "var(--earth)" }}>validated</b> : <b style={{ color: "var(--amber)" }}>computed, not validated</b>}<br /><span className="text-[var(--dim)]">{m.keyLimit.split(";")[0].split(". ")[0]}</span></span><span aria-hidden className="ml-auto text-[18px]">›</span></span>
                    </button></MissionPreview>
                  );
                })}
              </div>
              <p className="reveal mt-4 text-[13px] text-[var(--mut)]" style={{ ["--d" as string]: "240ms" }}>For EVA and rover field teams: a first-pass shortlist to verify with high-resolution imagery, terrain and field checks before planning a rehearsal — not a site recommendation.</p>
              <div className="reveal mt-4 flex flex-wrap gap-2" style={{ ["--d" as string]: "300ms" }}>
                <button className="chip hover:border-[var(--ink)]" onClick={() => setMethod(true)}>Read the method and sources</button>
                <span className="sm:hidden"><span className="chip text-[var(--amber)]" style={{ borderColor: "var(--amber)" }}>Prototype</span></span>
              </div>
              <details className="about reveal mt-5" style={{ ["--d" as string]: "340ms" }}>
                <summary>How it works</summary>
                <ol className="mt-3 grid gap-3">
                  <li className="grid grid-cols-[30px_1fr] gap-2"><span className="step-n">1</span><div><b className="title-sm text-[15px]">Start from a real mission</b><p className="text-[13.5px] text-[var(--mut)]">We read what NASA, ESA and Mars Society field campaigns actually rehearsed, and turned each task into a few surface conditions that open data can measure.</p></div></li>
                  <li className="grid grid-cols-[30px_1fr] gap-2"><span className="step-n">2</span><div><b className="title-sm text-[15px]">Score all land on Earth</b><p className="text-[13.5px] text-[var(--mut)]">NASA MODIS and GPM grids, soil and rock maps: every 0.1° cell gets an analog index per mission. Known analog sites are used to check that the index finds them; where no campaign site exists, the mission says “computed, not validated”.</p></div></li>
                  <li className="grid grid-cols-[30px_1fr] gap-2"><span className="step-n">3</span><div><b className="title-sm text-[15px]">Show new regions — and their limits</b><p className="text-[13.5px] text-[var(--mut)]">Each mission gets new regions to investigate, compared with its target condition by condition, with where the analogy breaks and how complex access is.</p></div></li>
                </ol>
              </details>
              <details className="about reveal mt-3" style={{ ["--d" as string]: "380ms" }}>
                <summary>Other real campaigns</summary>
                <p className="mt-2 text-[13px] text-[var(--mut)]">Analog campaigns that have already run and that we have not scored: they are not driven by terrain, or there is no global data to compare. Listed for context.</p>
                <ul className="mt-2 grid gap-2">
                  {NEXT_MISSIONS.map((n) => <li key={n.name} className="text-[13.5px]"><a href={n.url} target="_blank" rel="noopener noreferrer" className="title-sm underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{n.name}</a> <span className="text-[11.5px] text-[var(--dim)]">· {n.who} · not scored</span><br /><span className="text-[var(--mut)]">{n.what}</span></li>)}
                </ul>
              </details>
              {footer}
            </div>
          </section>
        </div>
      )}

      {!missionId && (
        <nav className={`dock ${calm || step === "explore" ? "off" : ""}`} aria-label="Jump to a mission">
          <span className="dock-k">Missions</span>
          {MISSIONS.map((m) => <MissionPreview key={m.id} m={m} at="top"><button type="button" aria-current={step === m.id ? "step" : undefined} onClick={() => pick(m.id)} style={{ ["--c" as string]: BODY_COLOR[m.target.body] }} aria-label={`${m.short}, target ${m.target.name}: open the mission`}><i aria-hidden />{DOCK_NAME[m.id]}</button></MissionPreview>)}
        </nav>
      )}

      {missionId && (
        <section className={`relative z-10 px-4 pb-6 md:px-8 ${site ? "hidden md:block" : ""} md:absolute md:left-0 md:top-0 md:pt-20 ${site ? "md:max-w-[calc(100vw-min(760px,60vw)-16px)]" : "md:max-w-[calc(100vw-436px)]"}`}>
          <div className="chip-row flex gap-2 md:flex-wrap" role="group" aria-label="Choose a mission" data-scene-avoid>
            {MISSIONS.map((m) => {
              const c = BODY_COLOR[m.target.body];
              return m.id === missionId
                ? <button key={m.id} aria-pressed onClick={() => pick(m.id)} className="chip glass !py-1.5" style={{ borderColor: c, color: c }}>{m.short}</button>
                : <MissionPreview key={m.id} m={m} at="bottom"><button aria-pressed={false} onClick={() => pick(m.id)} className="chip glass !py-1.5">{m.short}</button></MissionPreview>;
            })}
          </div>
        </section>
      )}

      {missionId && <h1 className="sr-only">Terra Vista, Mission Analogs: {shown.short}, target {t.name}</h1>}
      {missionId && (
        <aside id="panel" className={`slide-in glass relative z-10 scroll-mt-14 mx-4 ${site ? "mb-24" : "mb-6"} rounded-[20px] transition-[width] duration-500 md:fixed md:bottom-4 md:right-4 md:top-16 md:mx-0 md:mb-0 md:overflow-hidden ${site ? "md:w-[min(760px,60vw)]" : "md:w-[420px]"}`} aria-label={shown.title}>
          <div ref={scroller} className={`p-5 md:h-full md:overflow-y-auto ${site ? "md:p-8" : "md:p-6"}`}>
          {site ? (
            <SitePanel site={site} mission={shown} onBack={() => setSel(null)} nav={navPos >= 0 ? { pos: navPos + 1, total: navList.length, prev: () => step1(-1), next: () => step1(1) } : undefined} />
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
              <p className="mt-1 text-[11px] leading-snug text-[var(--dim)]">New regions score within a few thousandths of each other, or tie: read them as a shortlist, not a ranking (details at the end of the list).</p>
              <details className="filters mt-2" open={filtered || undefined}>
              <summary>Filter by logistics and terrain{filtered && <b> · on</b>}</summary>
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
              </details>

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

      {credits}
      {missionId && site && navPos >= 0 && !wide && (
        <nav className="site-bar" aria-label="Browse the sites of this mission">
          <button type="button" onClick={() => setSel(null)} aria-label="Back to all sites"><span aria-hidden>☰</span></button>
          <button type="button" onClick={() => step1(-1)} aria-label="Previous site"><span aria-hidden>‹</span></button>
          <span className="site-bar-t"><b>{site.name.split(",")[0]}</b><i className="mono">{String(navPos + 1).padStart(2, "0")} / {String(navList.length).padStart(2, "0")} · {shown.short}</i></span>
          <button type="button" onClick={() => step1(1)} aria-label="Next site"><span aria-hidden>›</span></button>
        </nav>
      )}

      {method && <MethodSheet onClose={() => { setMethod(false); window.requestAnimationFrame(() => methodBtn.current?.focus()); }} />}
    </main>
  );
}
