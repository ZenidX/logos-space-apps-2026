"use client";

// Página Base. Misión global: montar y mantener una base permanente en CUALQUIER punto de la Luna o de Marte.
// 1) Eliges el sitio → relieve real (NASA Trek) → la base se coloca con reglas (src/lib/base-plan.ts).
// 2) Submisiones (transporte, agua, energía…): operaciones que se repiten; cada una con su veredicto en ese sitio
//    (src/lib/submissions.ts). En 3D, primero el montaje y luego la base funcionando en bucle.
// 3) Simular en la Tierra: para cada submisión, los sitios de operations.json (búsqueda global en Earth Engine)
//    ordenados por condiciones + parecido del relieve con el sitio elegido, y comparación en 3D lado a lado.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Visor from "@/components/Visor";
import type { GlobeMarker } from "@/components/Globe";
import type { RehearsalSite } from "@/components/MissionCompare";
import { whyRows, type Criterion } from "@/lib/rehearsal";
import { loadEarthTerrain, loadJezeroCTX, loadMarsBlend, loadMoonAny, type TerrainData } from "@/lib/terrain";
import { planBase, RULES, type BasePlan, type PlanetBody } from "@/lib/base-plan";
import { shapeMatch, shapeSig, subMissions, type Level, type ShapeSig, type SubMission } from "@/lib/submissions";
import { STEP_DONE, type Layer } from "@/components/BaseScene";
import operations from "@/data/operations.json";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const BaseScene = dynamic(() => import("@/components/BaseScene"), { ssr: false });
const MissionCompare = dynamic(() => import("@/components/MissionCompare"), { ssr: false });

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

// 11 × 11 km, como el resto de la web: así el sitio y su análogo terrestre se comparan a la misma escala.
const SIZE_M = 11000;
const N = 128;
const SETUP = ["Landing", "Habitat", "Power", "Resources", "Rover", "Spacesuit walks"];

// Marte: el DTM de CTX a 20 m si el sitio cae en Jezero; si no (o si falla), MOLA + HRSC a ~200 m.
const loadSite = (body: PlanetBody, lat: number, lon: number) =>
  body === "moon"
    ? loadMoonAny(lat, lon, SIZE_M, N)
    : Math.abs(lat - 18.45) < 0.12 && Math.abs(lon - 77.45) < 0.12
      ? loadJezeroCTX(lat, lon, SIZE_M, N).catch(() => loadMarsBlend(lat, lon, SIZE_M, N))
      : loadMarsBlend(lat, lon, SIZE_M, N);

const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;

const LEVEL: Record<Level, { label: string; color: string }> = {
  good: { label: "Works here", color: "var(--ok)" },
  limited: { label: "With limits", color: "var(--acc)" },
  hard: { label: "Hard here", color: "var(--warn)" },
};

// ---------- Sitios de la Tierra por submisión ----------
type Task = (typeof operations.tasks)[number];
const TASKS = new Map<string, Task>(operations.tasks.map((t) => [t.id, t]));

interface EarthSite extends RehearsalSite {
  easy: boolean; // de la lista «accesible» (≤ N h de una ciudad)
}

function earthSitesFor(sub: SubMission): EarthSite[] {
  const out = new Map<string, EarthSite>();
  for (const id of sub.tasks) {
    const t = TASKS.get(id);
    if (!t) continue;
    const lists: [typeof t.best, boolean][] = [[t.best, false], [t.accessible, true]];
    for (const [list, easy] of lists)
      for (const s of list ?? []) {
        const key = `${s.lat},${s.lon}`;
        const v = s.values as Record<string, number | undefined>;
        const prev = out.get(key);
        out.set(key, {
          key,
          lat: s.lat,
          lon: s.lon,
          place: s.place,
          taskScore: Math.max(prev?.taskScore ?? 0, s.score),
          accessH: v.access_h ?? prev?.accessH ?? null,
          easy: easy || !!prev?.easy,
          byTask: { ...prev?.byTask, [id]: v as Record<string, number | null> },
        });
      }
  }
  return [...out.values()];
}

// Resumen del «por qué» en la fila: cada criterio con su valor real y si se cumple
function WhyChips({ sub, site }: { sub: SubMission; site: EarthSite }) {
  const id = sub.tasks.find((t) => site.byTask[t]);
  const t = id ? TASKS.get(id) : null;
  if (!t || !id) return null;
  const rows = whyRows(t.criteria as Criterion[], site.byTask[id], Math.abs(site.lat));
  return (
    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-[var(--mut)]">
      {rows.map((r) => (
        <span key={r.label}>
          <span aria-hidden style={{ color: r.score == null ? "var(--dim)" : r.score >= 0.75 ? "var(--ok)" : r.score > 0 ? "var(--acc)" : "var(--warn)" }}>
            {r.score == null ? "–" : r.score >= 0.75 ? "✓" : r.score > 0 ? "~" : "✕"}
          </span>{" "}
          {r.label} {r.value}
        </span>
      ))}
    </span>
  );
}

// Firma de forma de cada sitio terrestre: se descarga una vez (teselas Terrarium) y se guarda.
const earthSigCache = new Map<string, Promise<ShapeSig>>();
const earthSig = (s: EarthSite) => {
  let p = earthSigCache.get(s.key);
  if (!p) {
    p = loadEarthTerrain(s.lat, s.lon, N, SIZE_M).then(shapeSig);
    p.catch(() => earthSigCache.delete(s.key));
    earthSigCache.set(s.key, p);
  }
  return p;
};

function EarthSim({ sub, siteSig, onCompare }: { sub: SubMission; siteSig: ShapeSig; onCompare: (s: EarthSite) => void }) {
  const sites = useMemo(() => earthSitesFor(sub), [sub]);
  const [match, setMatch] = useState<Record<string, number | "error">>({});
  useEffect(() => {
    let cancel = false;
    setMatch({});
    // De tres en tres para no saturar la red del móvil
    const queue = [...sites];
    const worker = async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        const site = s;
        try {
          const sig = await earthSig(site);
          if (!cancel) setMatch((m) => ({ ...m, [site.key]: shapeMatch(siteSig, sig) }));
        } catch {
          if (!cancel) setMatch((m) => ({ ...m, [site.key]: "error" }));
        }
      }
    };
    void Promise.all([worker(), worker(), worker()]);
    return () => {
      cancel = true;
    };
  }, [sites, siteSig]);

  if (!sub.tasks.length)
    return <p className="text-sm text-[var(--dim)]">There is no Earth rehearsal task for this sub-mission in our catalogue yet.</p>;

  const total = (s: EarthSite) => {
    const m = match[s.key];
    return typeof m === "number" ? 0.5 * s.taskScore + 0.5 * m : -1;
  };
  const ranked = [...sites].sort((a, b) => total(b) - total(a) || b.taskScore - a.taskScore);
  const pending = sites.filter((s) => match[s.key] === undefined).length;
  return (
    <div>
      <p className="text-sm text-[var(--mut)]">
        {sub.tasks.map((id) => TASKS.get(id)?.name).filter(Boolean).join(" · ")}
        {pending > 0 && <span className="vivo ml-2 font-mono text-xs text-[var(--acc)]">comparing terrain… {sites.length - pending}/{sites.length}</span>}
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {ranked.map((s, i) => {
          const m = match[s.key];
          const t = total(s);
          return (
            <li key={s.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-[var(--line)] bg-[var(--bg2)] px-3 py-2.5">
              <span className="font-mono text-xs text-[var(--dim)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] text-[var(--ink)]">{s.place}</span>
                <span className="block font-mono text-[11px] text-[var(--dim)]">
                  {coord(s.lat, s.lon)} · conditions {Math.round(s.taskScore * 100)}% · terrain{" "}
                  {typeof m === "number" ? `${Math.round(m * 100)}%` : m === "error" ? "n/a" : "…"}
                  {s.easy && s.accessH !== null ? ` · ${s.accessH.toFixed(0)} h from a city` : ""}
                </span>
                <WhyChips sub={sub} site={s} />
                {t >= 0 && (
                  <span className="mt-1 block h-[3px] w-full bg-[var(--line)]">
                    <span className="block h-full bg-[var(--acc)]" style={{ width: `${Math.round(t * 100)}%` }} />
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onCompare(s)}
                className="btn-cut min-h-[var(--tap)] border border-[var(--line2)] px-3 font-mono text-[11px] uppercase tracking-[.08em] text-[var(--acc)] hover:border-[var(--acc)]"
              >
                Rehearse <span aria-hidden>▶</span>
                <span className="sr-only"> {sub.name} at {s.place}, side by side with the base site</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-[var(--dim)]">
        Conditions: how well the place meets this sub-mission&apos;s needs (cold, thin air, dust, ice, access…), from our global search of
        Earth&apos;s 0.1° grid with NASA data in Google Earth Engine, known analog sites excluded. Terrain: how close its 11 × 11 km slope mix
        and relief are to your base site, computed now from elevation data. Rank = half each.
      </p>
    </div>
  );
}

// Antetítulo numerado de cada bloque de la página
function H({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[var(--acc)]">
      {n} · {children}
    </p>
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
  const [subId, setSubId] = useState<string | null>(null);
  const [layer, setLayer] = useState<Layer>("relief");
  const [ex, setEx] = useState(1.5);
  const [sun, setSun] = useState(20);
  const [symbol, setSymbol] = useState<number | null>(null);
  const [imagery, setImagery] = useState<"" | "loading" | "none">("");
  const [form, setForm] = useState({ lat: "", lon: "" });
  const [rehearse, setRehearse] = useState<EarthSite | null>(null);
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
    setStatus("loading");
    loadSite(body, site.lat, site.lon)
      .then((terrain) => {
        if (cancel) return;
        const plan = planBase(terrain, body, site.lat, site.lon);
        setData({ terrain, plan, key: `${body}:${site.lat}:${site.lon}` });
        setStatus("");
        setStep(0);
        setStepKey((k) => k + 1);
        setSubId(null);
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

  // Montaje automático: un paso tras otro hasta que la base queda en marcha
  const onStepEnd = useCallback((s: number) => {
    if (s >= STEP_DONE) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStep(s + 1), 350);
  }, []);
  const replay = () => {
    window.clearTimeout(timer.current);
    setSubId(null);
    setStep(0);
    setStepKey((k) => k + 1);
  };

  const plan = data?.plan;
  const subs = useMemo(() => (data ? subMissions(data.plan, data.terrain) : []), [data]);
  const siteSig = useMemo(() => (data ? shapeSig(data.terrain) : null), [data]);
  const sub = subs.find((s) => s.id === subId) ?? subs.find((s) => s.tasks.length) ?? null;
  const running = step >= STEP_DONE;

  const pickSub = (id: string) => {
    window.clearTimeout(timer.current);
    if (!running) {
      setStep(STEP_DONE);
      setStepKey((k) => k + 1);
    }
    setSubId(id);
  };

  const compare = (s: EarthSite) => setRehearse(s);

  const markers: GlobeMarker[] = useMemo(
    () => [
      ...PRESETS[body].map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, label: p.name, kind: "target" as const })),
      ...(site ? [{ id: "pick", lat: site.lat, lon: site.lon, label: site.name, kind: "candidate" as const }] : []),
    ],
    [body, site],
  );

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
          <H n={1}>Choose the site</H>
          <h2 id="pick-h" className="mt-2 text-2xl font-medium">Where will the base be?</h2>
          <p className="mt-2 text-sm text-[var(--mut)]">
            Tap any point on the globe, pick a suggestion or type coordinates. We download NASA&apos;s real elevation data for an 11 × 11 km
            patch around it.
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

      {/* 2 · La base y sus submisiones */}
      <section ref={sceneRef} aria-labelledby="base-h" className="mt-12 scroll-mt-16">
        <H n={2}>The base and its sub-missions</H>
        <h2 id="base-h" className="mt-2 text-2xl font-medium">
          {site ? `A permanent base at ${site.name}` : "Your base appears here"}
          {site && <span className="ml-2 font-mono text-sm text-[var(--dim)]">{coord(site.lat, site.lon)} · {body === "moon" ? "Moon" : "Mars"}</span>}
        </h2>
        {plan && (
          <p className="mt-1 max-w-[70ch] text-sm text-[var(--mut)]">
            One mission: set up the base and keep it running. Below are the operations it must repeat for as long as it exists, and how
            well this site supports each one.
          </p>
        )}
        <Visor
          className="mt-3 h-[min(68vh,38rem)] min-h-[24rem]"
          reticle={false}
          tl={plan && (running ? <><span className="k">Base running</span><br />{sub ? sub.name : "All sub-missions"}</> : <><span className="k">Setting up · {Math.min(step + 1, SETUP.length)}/{SETUP.length}</span><br />{SETUP[Math.min(step, SETUP.length - 1)]}</>)}
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
              focus={running && subId ? (sub?.focus ?? null) : null}
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
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button type="button" onClick={replay} className={tab(true)}>
                Replay set-up
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

            {/* Submisiones */}
            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Sub-missions">
              {subs.map((s) => {
                const on = sub?.id === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pickSub(s.id)}
                      aria-pressed={on}
                      className={`flex h-full w-full flex-col border bg-[var(--bg2)] p-3 text-left transition-colors hover:border-[var(--acc)] ${on ? "border-[var(--acc)]" : "border-[var(--line)]"}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[15px] text-[var(--ink)]">{s.name}</span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.06em]" style={{ color: LEVEL[s.level].color }}>
                          {LEVEL[s.level].label}
                        </span>
                      </span>
                      <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-[var(--dim)]">{s.cadence}</span>
                      <span className="mt-1.5 text-[13px] text-[var(--mut)]">{s.verdict}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* 3 · Simular en la Tierra */}
      {plan && sub && siteSig && (
        <section aria-labelledby="earth-h" className="mt-12" aria-live="polite">
          <H n={3}>Simulate it on Earth</H>
          <h2 id="earth-h" className="mt-2 text-2xl font-medium">Where to rehearse “{sub.name}” for this base</h2>
          <p className="mt-1 max-w-[70ch] text-sm text-[var(--mut)]">
            <span className="text-[var(--ink)]">Needs: </span>
            {sub.needs} Pick another sub-mission above to change the list; tap <span className="font-mono text-[var(--acc)]">Rehearse ▶</span> to watch this sub-mission played on the Earth site and on your base, side by side, and see why the place qualifies.
          </p>
          <div className="mt-4">
            <EarthSim key={`${data?.key}:${sub.id}`} sub={sub} siteSig={siteSig} onCompare={compare} />
          </div>
        </section>
      )}

      {plan && (
        <>
          <h3 className="mt-12 text-xl">What this site is like</h3>
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
              TerraVista places each part with simple rules on real NASA elevation data: pad {RULES.padMinM / 1000}–{RULES.padMaxM / 1000} km from
              the habitat, reactor ~{RULES.reactorM / 1000} km away, rover slopes under {RULES.roverLimitDeg}°, walks within{" "}
              {RULES.evaRadiusM / 1000} km, &quot;buildable&quot; = under {RULES.flatDeg}°. Distances and how often each sub-mission repeats
              are our assumptions. Elevation at {Math.round(plan.cellM)} m per pixel hides boulders and small craters, and modules are drawn
              larger than life so you can see them.
            </p>
          </aside>
        </>
      )}

      {rehearse && data && site && sub && siteSig && (
        <MissionCompare
          sub={sub}
          site={rehearse}
          base={{ terrain: data.terrain, plan: data.plan, sig: siteSig, name: site.name, sun, layer }}
          onClose={() => setRehearse(null)}
        />
      )}
    </div>
  );
}
