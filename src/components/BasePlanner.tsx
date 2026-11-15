"use client";

// Página Base: elige cualquier punto de la Luna o de Marte → terreno real (Trek) → base colocada por reglas
// (src/lib/base-plan.ts) → misión animada paso a paso, y para cada paso dónde ensayarlo en la Tierra
// (src/data/operations.json, la misma búsqueda global sobre la rejilla de Earth Engine).
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Visor from "@/components/Visor";
import type { GlobeMarker } from "@/components/Globe";
import { loadJezeroCTX, loadMarsBlend, loadMoonAny, type TerrainData } from "@/lib/terrain";
import { planBase, RULES, type BasePlan, type PlanetBody } from "@/lib/base-plan";
import { STEP_DONE, STEP_IDS, type Layer } from "@/components/BaseScene";
import operations from "@/data/operations.json";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const BaseScene = dynamic(() => import("@/components/BaseScene"), { ssr: false });

interface Site {
  lat: number;
  lon: number;
  name: string;
}

const PRESETS: Record<PlanetBody, (Site & { id: string; why: string })[]> = {
  moon: [
    { id: "shackleton", name: "Shackleton ridge", lat: -89.45, lon: -138, why: "Connecting ridge to de Gerlache: sunlit most of the year, next to permanent shadow." },
    { id: "mouton", name: "Mons Mouton", lat: -84.987, lon: 36.7, why: "One of NASA's 9 Artemis III candidate regions (2024)." },
    { id: "tranquility", name: "Tranquility Base", lat: 0.674, lon: 23.473, why: "Apollo 11, 1969: flat mare, two-week nights." },
  ],
  mars: [
    { id: "jezero", name: "Jezero crater", lat: 18.45, lon: 77.45, why: "Perseverance's landing site: river delta and stored samples." },
    { id: "arcadia", name: "Arcadia Planitia", lat: 40, lon: -160, why: "Smooth plain with shallow ice (NASA SWIM)." },
  ],
};

const SIZE_M: Record<PlanetBody, number> = { moon: 10000, mars: 14000 };

// Marte: el DTM de CTX a 20 m si el sitio cae en Jezero; si no (o si falla), MOLA + HRSC a ~200 m.
const loadMars = (lat: number, lon: number) =>
  Math.abs(lat - 18.45) < 0.12 && Math.abs(lon - 77.45) < 0.12
    ? loadJezeroCTX(lat, lon, SIZE_M.mars, 160).catch(() => loadMarsBlend(lat, lon, SIZE_M.mars, 120))
    : loadMarsBlend(lat, lon, SIZE_M.mars, 120);

const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
const km = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

type Task = (typeof operations.tasks)[number];
const TASKS = new Map<string, Task>(operations.tasks.map((t) => [t.id, t]));

interface StepText {
  title: string;
  what: string;
  why: string;
  task: string | null; // id en operations.json
}

function stepTexts(p: BasePlan): StepText[] {
  const moon = p.body === "moon";
  const power: StepText =
    p.power.kind === "solar-masts"
      ? {
          title: "Raise the solar masts",
          what: `${p.power.spots.length} vertical solar masts on the highest points nearby (up to ${km(Math.max(...p.power.spots.map((s) => dist(s, p.habitat))))} from the habitat), cabled back to it.`,
          why: "Near the pole the Sun stays within a few degrees of the horizon: panels must be vertical and high. The best peaks are lit 80–90 % of the year (Bussey et al. 2010; Mazarico et al. 2011).",
          task: "grazing_sun",
        }
      : {
          title: moon ? "Solar field + fission reactor" : "Fission reactor + solar field",
          what: `Solar field ${km(dist(p.power.spots[0], p.habitat))} from the habitat; reactor ${km(dist(p.power.spots[1], p.habitat))} away, kept clear of the crew and the pad.`,
          why: moon
            ? "Away from the poles a lunar night lasts ~14.8 Earth days, too long for batteries alone: NASA's Fission Surface Power (40 kWe class) covers it."
            : "Dust storms can dim the Sun for weeks, so fission carries the base and solar helps (NASA Fission Surface Power).",
          task: moon ? null : "power_mars",
        };
  const isru: StepText =
    p.isru.kind === "ice-shadow"
      ? {
          title: "Prospect for ice in the shadows",
          what: `Ice prospecting at the lowest ground in the area (${Math.round(p.isru.spot.h - p.habitat.h)} m relative to the habitat, ${km(dist(p.isru.spot, p.habitat))} away).`,
          why: "Polar hollows that never see the Sun stay below ~40 K and can trap water ice (LCROSS, Colaprete et al. 2010; Li et al. 2018). Lowest ground is our proxy: this is not a computed shadow map.",
          task: "cold_trap",
        }
      : p.isru.kind === "ice-ground"
        ? {
            title: "Drill for ground ice",
            what: `Ice drill ${km(dist(p.isru.spot, p.habitat))} from the habitat on flat ground (${p.isru.spot.slope.toFixed(1)}°).`,
            why: `At ${Math.abs(p.lat).toFixed(0)}° latitude NASA's SWIM maps suggest ice within metres of the surface: water, oxygen and rocket fuel. Our rule uses latitude only.`,
            task: "permafrost_drill",
          }
        : {
            title: moon ? "Oxygen from regolith" : "Oxygen from the air",
            what: `Processing plant ${km(dist(p.isru.spot, p.habitat))} from the habitat.`,
            why: moon
              ? "No accessible ice this far from the poles: oxygen can be extracted from the oxides in lunar soil."
              : "No shallow ice expected at this latitude: oxygen can be split from the CO₂ atmosphere, as Perseverance's MOXIE showed (2021–2023).",
            task: null,
          };
  const goal = p.isru.kind === "ice-shadow" ? "the ice site" : "the science stop";
  return [
    {
      title: "Land on the flattest pad",
      what: `Pad on ${p.pad.slope.toFixed(1)}° ground, ${km(dist(p.pad, p.habitat))} from the habitat.`,
      why: "Engine plumes blast regolith at high speed: pads go far from the habitat (Metzger et al.). NASA also picks landing regions by slope. The 1.5–3 km distance is our assumption.",
      task: "landing_pad",
    },
    {
      title: "Set up the habitat",
      what: `Habitat on ${p.habitat.slope.toFixed(1)}° ground${p.polar && moon ? ", on high ground for light" : ""}, with a regolith berm for shielding.`,
      why: "Flat and stable ground near the chosen point; regolith piled around the modules blocks radiation and blast debris.",
      task: "regolith_build",
    },
    power,
    isru,
    {
      title: "Rover traverse",
      what: `Route to ${goal}: ${km(p.routeLenM)}, steepest stretch ${p.routeMaxGrade.toFixed(0)}° (limit ${p.routeLimitDeg}°${p.routeLimitDeg > RULES.roverLimitDeg ? ", raised because no gentler route exists" : ""}).`,
      why: `Shortest path that avoids slopes over ${RULES.roverLimitDeg}° (our assumption; Apollo's rover was designed for ~25°), computed on the real elevation grid.`,
      task: moon ? (p.polar ? "cold_trap" : "eva_cold_rough") : "rover_traverse",
    },
    {
      title: "Walk out on EVA",
      what: `Spacesuit walks within ${km(p.evaRadiusM)} of the habitat (dashed ring).`,
      why: "Walk-back distance kept short so the crew can always return on foot (our assumption).",
      task: "eva_cold_rough",
    },
  ];
}

function EarthRehearsal({ id }: { id: string | null }) {
  const t = id ? TASKS.get(id) : null;
  if (!t) return <p className="text-sm text-[var(--dim)]">No Earth rehearsal task defined for this step yet.</p>;
  const best = t.best?.[0];
  const acc = t.accessible?.[0];
  const osm = (s: { lat: number; lon: number }) => `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=7/${s.lat}/${s.lon}`;
  return (
    <div className="border-l-2 border-[var(--acc)] pl-3">
      <p className="font-mono text-[11px] uppercase tracking-[.08em] text-[var(--acc)]">Rehearse it on Earth</p>
      <p className="mt-1 text-sm text-[var(--ink)]">{t.name}</p>
      {best && (
        <p className="mt-1 text-sm text-[var(--mut)]">
          Best new site:{" "}
          <a className="underline underline-offset-2 hover:text-[var(--acc)]" href={osm(best)} target="_blank" rel="noreferrer">
            {best.place}
          </a>{" "}
          <span className="font-mono text-xs text-[var(--dim)]">({coord(best.lat, best.lon)})</span>
        </p>
      )}
      {acc && acc.place !== best?.place && (
        <p className="mt-0.5 text-sm text-[var(--mut)]">
          Easy to reach:{" "}
          <a className="underline underline-offset-2 hover:text-[var(--acc)]" href={osm(acc)} target="_blank" rel="noreferrer">
            {acc.place}
          </a>{" "}
          <span className="font-mono text-xs text-[var(--dim)]">(≤ {operations.selection.accessibleMaxHours} h from a city)</span>
        </p>
      )}
      <p className="mt-1 text-xs text-[var(--dim)]">From our global search of Earth&apos;s 0.1° grid (NASA data in Google Earth Engine), known analog sites excluded.</p>
    </div>
  );
}

export default function BasePlanner() {
  const [body, setBody] = useState<PlanetBody>("moon");
  const [site, setSite] = useState<Site | null>(null);
  const [data, setData] = useState<{ terrain: TerrainData; plan: BasePlan; key: string } | null>(null);
  const [status, setStatus] = useState<"" | "loading" | "error">("");
  const [err, setErr] = useState("");
  const [step, setStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const [auto, setAuto] = useState(true);
  const [layer, setLayer] = useState<Layer>("relief");
  const [ex, setEx] = useState(1.5);
  const [sun, setSun] = useState(20);
  const [symbol, setSymbol] = useState<number | null>(null);
  const [imagery, setImagery] = useState<"" | "loading" | "none">("");
  const [form, setForm] = useState({ lat: "", lon: "" });
  const sceneRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  const choose = useCallback((s: Site) => {
    setSite(s);
    setForm({ lat: s.lat.toFixed(3), lon: s.lon.toFixed(3) });
  }, []);

  // Cargar terreno + planificar
  useEffect(() => {
    if (!site) return;
    let cancel = false;
    const key = `${body}:${site.lat}:${site.lon}`;
    setStatus("loading");
    const load = body === "moon" ? loadMoonAny(site.lat, site.lon, SIZE_M.moon, 160) : loadMars(site.lat, site.lon);
    load
      .then((terrain) => {
        if (cancel) return;
        const plan = planBase(terrain, body, site.lat, site.lon);
        setData({ terrain, plan, key });
        setStatus("");
        setStep(0);
        setStepKey((k) => k + 1);
        setAuto(true);
        setImagery("");
        // Sol: en el polo lunar, la altura máxima real (rasante); fuera, media mañana para ver el relieve.
        const max = Math.min(90, 90 - Math.abs(site.lat) + (body === "moon" ? 1.54 : 25.19));
        setSun(Math.max(1.5, Math.min(max, body === "moon" && plan.polar ? max : 30)));
        setLayer(body === "mars" ? "photo" : "relief");
      })
      .catch((e: Error) => {
        if (cancel) return;
        setErr(e.message);
        setStatus("error");
      });
    return () => {
      cancel = true;
    };
  }, [site, body]);

  useEffect(() => {
    if (site && sceneRef.current) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sceneRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [site]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onStepEnd = useCallback(
    (s: number) => {
      if (!auto || s >= STEP_DONE) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setStep(s + 1);
        if (s + 1 >= STEP_DONE) setAuto(false);
      }, 900);
    },
    [auto],
  );

  const goStep = (i: number) => {
    window.clearTimeout(timer.current);
    setAuto(false);
    setStep(i);
    setStepKey((k) => k + 1);
  };
  const replay = () => {
    window.clearTimeout(timer.current);
    setAuto(true);
    setStep(0);
    setStepKey((k) => k + 1);
  };

  const markers: GlobeMarker[] = useMemo(
    () => [
      ...PRESETS[body].map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, label: p.name, kind: "target" as const })),
      ...(site ? [{ id: "pick", lat: site.lat, lon: site.lon, label: site.name, kind: "candidate" as const }] : []),
    ],
    [body, site],
  );

  const plan = data?.plan;
  const texts = plan ? stepTexts(plan) : [];
  const cur = texts[Math.min(step, texts.length - 1)];
  const switchBody = (b: PlanetBody) => {
    if (b === body) return;
    setBody(b);
    setSite(null);
    setData(null);
    setStatus("");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(form.lat), lon = Number(form.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 89.9 || Math.abs(lon) > 180) {
      setErr("Latitude must be between −89.9 and 89.9, longitude between −180 and 180.");
      setStatus("error");
      return;
    }
    choose({ lat, lon, name: coord(lat, lon) });
  };

  const tab = (on: boolean) =>
    `min-h-[var(--tap)] px-3 font-mono text-xs uppercase tracking-[.08em] border ${on ? "border-[var(--acc)] text-[var(--acc)]" : "border-[var(--line2)] text-[var(--mut)] hover:text-[var(--ink)]"}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8">
      {/* 1 · Elegir sitio */}
      <section aria-labelledby="pick-h" className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2" role="group" aria-label="World">
            <button type="button" className={tab(body === "moon")} aria-pressed={body === "moon"} onClick={() => switchBody("moon")}>
              Moon
            </button>
            <button type="button" className={tab(body === "mars")} aria-pressed={body === "mars"} onClick={() => switchBody("mars")}>
              Mars
            </button>
          </div>
          <Visor className="globo h-[20rem] md:h-[26rem]" reticle={false} glitchKey={body} tl={<span className="k">Tap anywhere to place a base</span>} br={<span className="k">{body === "moon" ? "LRO (NASA)" : "Viking (NASA)"}</span>}>
            <Globe
              key={body}
              body={body}
              markers={markers}
              selectedId={site ? "pick" : null}
              onSelect={(id) => {
                const p = PRESETS[body].find((x) => x.id === id);
                if (p) choose(p);
              }}
              onPick={(lat, lon) => choose({ lat, lon, name: coord(lat, lon) })}
            />
          </Visor>
        </div>
        <div>
          <h2 id="pick-h" className="text-2xl font-medium">Pick a site</h2>
          <p className="mt-2 text-sm text-[var(--mut)]">
            Tap any point on the globe, choose a suggested site or type coordinates. We download the real elevation data for a{" "}
            {SIZE_M[body] / 1000} × {SIZE_M[body] / 1000} km patch and lay out a base on it with simple, stated rules.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {PRESETS[body].map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => choose(p)}
                  aria-pressed={site?.name === p.name}
                  className={`w-full border bg-[var(--bg2)] px-3 py-2.5 text-left transition-colors hover:border-[var(--acc)] ${site?.name === p.name ? "border-[var(--acc)]" : "border-[var(--line2)]"}`}
                >
                  <span className="block text-[15px] text-[var(--ink)]">{p.name}</span>
                  <span className="block text-xs text-[var(--mut)]">{p.why}</span>
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2">
            <label className="flex flex-col font-mono text-[11px] uppercase tracking-[.08em] text-[var(--mut)]">
              Lat (°)
              <input inputMode="decimal" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="mt-1 w-24 border border-[var(--line2)] bg-transparent px-2 py-2 text-base text-[var(--ink)]" />
            </label>
            <label className="flex flex-col font-mono text-[11px] uppercase tracking-[.08em] text-[var(--mut)]">
              Lon (°)
              <input inputMode="decimal" value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} className="mt-1 w-24 border border-[var(--line2)] bg-transparent px-2 py-2 text-base text-[var(--ink)]" />
            </label>
            <button type="submit" className={tab(true)}>
              Plan base
            </button>
          </form>
        </div>
      </section>

      {/* 2 · Base en 3D */}
      <section ref={sceneRef} aria-labelledby="base-h" className="mt-10 scroll-mt-16">
        <h2 id="base-h" className="text-2xl font-medium">
          {site ? `Base at ${site.name}` : "Your base appears here"}
          {site && <span className="ml-2 font-mono text-sm text-[var(--dim)]">{coord(site.lat, site.lon)} · {body === "moon" ? "Moon" : "Mars"}</span>}
        </h2>
        <Visor
          className="mt-3 h-[min(70vh,40rem)] min-h-[24rem]"
          reticle={false}
          tl={plan && <><span className="k">Step {Math.min(step + 1, STEP_IDS.length)} / {STEP_IDS.length}</span><br />{cur?.title}</>}
          tr={plan && <><span className="k">Buildable</span> {Math.round(plan.stats.flatPct)} %<br /><span className="k">Mean slope</span> {plan.stats.meanSlope.toFixed(1)}°<br /><span className="k">Relief</span> {Math.round(plan.stats.reliefM)} m</>}
          bl={
            status === "loading" ? <span className="vivo">Downloading NASA elevation data…</span>
            : status === "error" ? <span style={{ color: "var(--warn)" }}>Error: {err}</span>
            : plan ? <span className="k">Mesh ≈ {Math.round(plan.cellM)} m/px · ×{ex} vertical{imagery === "loading" ? " · loading imagery…" : imagery === "none" ? " · no imagery here" : ""}</span>
            : <span className="k">No site yet</span>
          }
          br={symbol ? <span className="k">Modules drawn ~{symbol}× real size</span> : undefined}
        >
          {data ? (
            <BaseScene
              key={data.key}
              terrain={data.terrain}
              plan={data.plan}
              step={step}
              stepKey={stepKey}
              layer={layer}
              exaggeration={ex}
              sunDeg={sun}
              onStepEnd={onStepEnd}
              onSymbolScale={setSymbol}
              onImagery={setImagery}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[var(--mut)]">
              {status === "loading" ? "Loading terrain…" : "Pick a site above: any point on the Moon or Mars."}
            </div>
          )}
        </Visor>
        {data && <p className="mt-1 font-mono text-[9px] leading-tight text-[var(--dim)]">{data.terrain.source}</p>}

        {plan && (
          <>
            {/* Controles */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button type="button" onClick={replay} className={tab(true)}>
                {step >= STEP_DONE ? "Replay mission" : "Restart mission"}
              </button>
              <div className="flex gap-1" role="group" aria-label="Ground layer">
                {(["relief", "photo", "slope"] as Layer[]).map((l) => (
                  <button key={l} type="button" className={tab(layer === l)} aria-pressed={layer === l} onClick={() => setLayer(l)}>
                    {l === "relief" ? "Relief" : l === "photo" ? "Photo" : "Slope"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.08em] text-[var(--mut)]">
                Height ×{ex}
                <input type="range" min={1} max={4} step={0.5} value={ex} onChange={(e) => setEx(Number(e.target.value))} aria-valuetext={`${ex} times vertical exaggeration`} />
              </label>
              <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.08em] text-[var(--mut)]">
                Sun {sun.toFixed(1)}°
                <input type="range" min={1} max={70} step={0.5} value={sun} onChange={(e) => setSun(Number(e.target.value))} aria-valuetext={`Sun ${sun} degrees above the horizon`} />
              </label>
            </div>
            {layer === "slope" && (
              <p className="mt-2 font-mono text-[11px] text-[var(--mut)]">
                <span style={{ color: "#2ec478" }}>■</span> &lt; 5° <span style={{ color: "#96d65c" }}>■</span> 5–10° buildable ·{" "}
                <span style={{ color: "#f2c44c" }}>■</span> 10–20° rover <span style={{ color: "#f07a3a" }}>■</span> 20–30°{" "}
                <span style={{ color: "#d63a46" }}>■</span> &gt; 30° out of reach
              </p>
            )}

            {/* Misión paso a paso */}
            <ol className="mt-6 grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="Mission steps">
              {texts.map((t, i) => (
                <li key={t.title}>
                  <button
                    type="button"
                    onClick={() => goStep(i)}
                    aria-current={i === Math.min(step, texts.length - 1) ? "step" : undefined}
                    className={`h-full w-full border px-2 py-2 text-left transition-colors ${i === Math.min(step, texts.length - 1) ? "border-[var(--acc)] text-[var(--ink)]" : i < step ? "border-[var(--line2)] text-[var(--mut)]" : "border-[var(--line)] text-[var(--dim)]"}`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-[.08em]">0{i + 1}</span>
                    <span className="block text-[13px] leading-tight">{t.title}</span>
                  </button>
                </li>
              ))}
            </ol>
            {cur && (
              <div className="mt-3 grid gap-4 border border-[var(--line2)] bg-[var(--bg2)] p-4 md:grid-cols-[1.2fr_1fr]" aria-live="polite">
                <div>
                  <h3 className="text-lg">{cur.title}</h3>
                  <p className="mt-1 text-[15px] text-[var(--ink)]">{cur.what}</p>
                  <p className="mt-2 text-sm text-[var(--mut)]">{cur.why}</p>
                </div>
                <EarthRehearsal id={cur.task} />
              </div>
            )}

            {/* Condiciones del sitio */}
            <h3 className="mt-8 text-xl">What this site is like</h3>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {plan.conditions.map((c) => (
                <div key={c.label} className="border border-[var(--line)] bg-[var(--bg2)] p-3">
                  <dt className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[.08em] text-[var(--mut)]">
                    {c.label}
                    <span className={`px-1 text-[10px] ${c.kind === "data" ? "text-[var(--ok)]" : c.kind === "physics" ? "text-[var(--acc2-t)]" : "text-[var(--warn)]"}`}>
                      {c.kind === "data" ? "measured" : c.kind === "physics" ? "physics" : "rough rule"}
                    </span>
                  </dt>
                  <dd className="mt-1 text-lg text-[var(--ink)]">{c.value}</dd>
                  <dd className="text-xs text-[var(--dim)]">{c.note}</dd>
                </div>
              ))}
            </dl>

            <aside className="mt-6 border-l-2 border-[var(--warn)] pl-3 text-sm text-[var(--mut)]">
              <p className="text-[var(--ink)]">A concept, not a NASA design.</p>
              <p className="mt-1">
                TerraVista places each part with simple rules on real NASA elevation data: pad {RULES.padMinM / 1000}–{RULES.padMaxM / 1000} km from the
                habitat, reactor ~{RULES.reactorM / 1000} km away, rover slopes under {RULES.roverLimitDeg}°, walks within {RULES.evaRadiusM / 1000} km,
                &quot;buildable&quot; = under {RULES.flatDeg}°. Distances are our assumptions; sources for the reasons are in each step. Elevation at
                {" "}{Math.round(plan.cellM)} m per pixel hides boulders and small craters, and modules are drawn larger than life so you can see them.
              </p>
            </aside>
          </>
        )}
      </section>
    </div>
  );
}
