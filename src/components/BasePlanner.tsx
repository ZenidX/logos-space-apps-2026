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
import { marsPressurePa, planBase, RULES, type BasePlan, type PlanetBody } from "@/lib/base-plan";
import { shapeMatch, shapeSig, subMissions, type Level, type ShapeSig, type SubMission } from "@/lib/submissions";
import { STEP_DONE, type Layer } from "@/components/BaseScene";
import operations from "@/data/operations.json";
import bestSites from "@/data/base-sites.json";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const BaseScene = dynamic(() => import("@/components/BaseScene"), { ssr: false });
const MissionCompare = dynamic(() => import("@/components/MissionCompare"), { ssr: false });

interface Site {
  lat: number;
  lon: number;
  name: string;
}

// Los mejores sitios de nuestra búsqueda (scripts/base/find-sites.mts → src/data/base-sites.json; método en docs/sitios-base.md)
const pctS = (x: number) => `${Math.round(x * 100)} %`;
const BEST: Record<PlanetBody, (Site & { id: string; why: string; best: true })[]> = {
  moon: bestSites.moon.map((s, i) => ({
    id: `best-moon-${i}`,
    best: true as const,
    name: `★ Best site ${String.fromCharCode(65 + i)} · ${Math.abs(s.lat)}°S ${Math.abs(s.lon).toFixed(1)}°${s.lon >= 0 ? "E" : "W"}`,
    lat: s.lat,
    lon: s.lon,
    why: `Our search, #${i + 1} of ${bestSites.searched.moon} south-pole sites (score ${s.score.toFixed(2)}): sun ${pctS(s.facts.sunAtHabitat)} of the time at the habitat, cold trap with ice ${s.facts.iceHaulKm ?? "–"} km away, ${s.facts.buildablePct} % buildable.`,
  })),
  mars: [
    {
      id: "best-mars-wo",
      best: true as const,
      name: `★ Best for water + oxygen · ${bestSites.marsWaterOxygen.region}`,
      lat: bestSites.marsWaterOxygen.lat,
      lon: bestSites.marsWaterOxygen.lon,
      why: `${bestSites.marsWaterOxygen.ice} (${bestSites.marsWaterOxygen.iceSource}); air at ${bestSites.marsWaterOxygen.facts.pressurePa} Pa (${(bestSites.marsWaterOxygen.facts.elevationM / 1000).toFixed(1)} km) for oxygen from CO₂.`,
    },
    ...bestSites.mars.map((s, i) => ({
      id: `best-mars-${i}`,
      best: true as const,
      name: `★ Best site ${String.fromCharCode(65 + i)} · ${s.region}`,
      lat: s.lat,
      lon: s.lon,
      why: `#${i + 1} of ${bestSites.searched.mars} (score ${s.score.toFixed(2)}). ${s.ice}. Air ${s.facts.pressurePa} Pa; ${s.facts.buildablePct} % buildable.`,
    })),
  ],
};

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

const hoursText = (h: number) => (h < 1 ? "< 1 h" : `${Math.round(h)} h`);
const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;

const WORLD_COLOR = { moon: "#d7dce6", mars: "#ff8d5e" } as const; // = BODY_COLOR of the home page

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
// Sitios de ensayo por puntuación de condiciones (sin esperar al parecido del relieve): para abrir la comparación directamente
const byTaskScore = (sub: SubMission) => earthSitesFor(sub).sort((a, b) => b.taskScore - a.taskScore);
// Un sitio de la Tierra que llega en la URL (?elat=..&elon=..&en=..), p. ej. desde una región de la portada de misiones
const urlEarthSite = (lat: number, lon: number, place: string): EarthSite => ({ key: `${lat},${lon}`, lat, lon, place, taskScore: 0, accessH: null, easy: false, byTask: {} });

function WhyChips({ sub, site }: { sub: SubMission; site: EarthSite }) {
  const id = sub.tasks.find((t) => site.byTask[t]);
  const t = id ? TASKS.get(id) : null;
  if (!t || !id) return null;
  const rows = whyRows(t.criteria as Criterion[], site.byTask[id], Math.abs(site.lat));
  return (
    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-[var(--mut)]">
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

function EarthSim({ sub, siteSig, onCompare }: { sub: SubMission; siteSig: ShapeSig; onCompare: (s: EarthSite, ranked: EarthSite[]) => void }) {
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
      <p className="text-[12.5px] text-[var(--mut)]">
        {sub.tasks.map((id) => TASKS.get(id)?.name).filter(Boolean).join(" · ")}
        {pending > 0 && <span className="vivo mono ml-2 text-[11px] text-[var(--earth)]">comparing terrain… {sites.length - pending}/{sites.length}</span>}
      </p>
      {ranked[0] && (
        <button type="button" onClick={() => onCompare(ranked[0], ranked)} className="chip mt-2 inline-flex hover:border-[var(--ink)]">
          Compare with the best Earth site <span aria-hidden>→</span>
        </button>
      )}
      <ol className="mt-2 grid gap-0.5">
        {ranked.map((s, i) => {
          const m = match[s.key];
          const t = total(s);
          return (
            <li key={s.key} className="row grid grid-cols-[22px_1fr_auto] items-start gap-2 rounded-xl border border-transparent p-2 hover:border-[var(--line2)]">
              <span className="mono pt-0.5 text-[12px] text-[var(--earth)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="place block truncate text-[14.5px] leading-snug">{s.place}</span>
                <span className="mono block text-[10.5px] text-[var(--dim)]">
                  {coord(s.lat, s.lon)} · conditions {Math.round(s.taskScore * 100)}% · terrain{" "}
                  {typeof m === "number" ? `${Math.round(m * 100)}%` : m === "error" ? "n/a" : "…"}
                  {s.easy && s.accessH !== null ? ` · ${hoursText(s.accessH)} from a city` : ""}
                </span>
                <WhyChips sub={sub} site={s} />
                {t >= 0 && (
                  <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-[var(--line)]">
                    <span className="block h-full rounded-full bg-[var(--earth)]" style={{ width: `${Math.round(t * 100)}%` }} />
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onCompare(s, ranked)}
                className="fchip self-center"
              >
                Rehearse <span aria-hidden>→</span>
                <span className="sr-only"> {sub.name} at {s.place}, side by side with the base site</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] leading-snug text-[var(--dim)]">
        Conditions: how well the place meets this sub-mission&apos;s needs (cold, thin air, dust, ice, access…), from our global search of
        Earth&apos;s 0.1° grid with NASA data in Google Earth Engine, known analog sites excluded. Terrain: how close its 11 × 11 km slope mix
        and relief are to your base site, computed now from elevation data. Rank = half each.
      </p>
    </div>
  );
}

// La base en la Tierra, nada más elegir el sitio. Dos respuestas:
// 1) el sitio de la Tierra con el relieve más parecido (su «gemelo»), entre los candidatos de ensayo de todos los trabajos;
// 2) dónde practicar cada trabajo: el mejor sitio para cada uno (mitad condiciones, mitad relieve, como en cada submisión).
// Cada ensayo se hace donde se cumplen las condiciones de esa tarea, así que suelen ser sitios distintos.
const TWIN_PER_JOB = 3; // candidatos por trabajo a los que se les compara el relieve (cada uno descarga su terreno)

function EarthTwin({ subs, siteSig, onCompare }: { subs: SubMission[]; siteSig: ShapeSig; onCompare: (s: EarthSite, ranked: EarthSite[], sub: SubMission) => void }) {
  const jobs = useMemo(() => subs.filter((x) => x.tasks.length), [subs]);
  const perJob = useMemo(() => jobs.map((sub) => ({ sub, list: byTaskScore(sub) })), [jobs]);
  const pool = useMemo(() => {
    const m = new Map<string, EarthSite>();
    for (const j of perJob) for (const e of j.list.slice(0, TWIN_PER_JOB)) if (!m.has(e.key)) m.set(e.key, e);
    return [...m.values()];
  }, [perJob]);
  const [match, setMatch] = useState<Record<string, number | "error">>({});
  useEffect(() => {
    let cancel = false;
    setMatch({});
    const queue = [...pool];
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
  }, [pool, siteSig]);

  if (!pool.length) return null;
  const terrain = (e: EarthSite) => { const m = match[e.key]; return typeof m === "number" ? m : null; };
  const pending = pool.filter((e) => match[e.key] === undefined).length;
  const pct = (x: number | null) => (x === null ? "…" : `${Math.round(x * 100)} %`);
  // trabajos que cada sitio puede ensayar (está entre los candidatos de ese trabajo)
  const jobsAt = (e: EarthSite) => perJob.filter((j) => j.list.slice(0, TWIN_PER_JOB).some((x) => x.key === e.key)).map((j) => j.sub);
  const twin = [...pool].sort((a, b) => (terrain(b) ?? -1) - (terrain(a) ?? -1))[0];
  const twinJob = jobsAt(twin)[0] ?? jobs[0];
  const bestFor = perJob.map(({ sub, list }) => {
    const cands = list.slice(0, TWIN_PER_JOB);
    const score = (e: EarthSite) => 0.5 * e.taskScore + 0.5 * (terrain(e) ?? 0);
    const top = [...cands].sort((a, b) => score(b) - score(a))[0];
    return { sub, top, list, score: top ? score(top) : 0 };
  });
  const go = (e: EarthSite, sub: SubMission, list: EarthSite[]) => onCompare(e, [e, ...list.filter((x) => x.key !== e.key)], sub);
  return (
    <section aria-labelledby="twin-h" className="mt-5 border-t border-[var(--line)] pt-4">
      <h2 id="twin-h" className="label" style={{ color: "var(--earth)" }}>This base on Earth</h2>
      {pending > 0 && <p className="vivo mono mt-1 text-[11px] text-[var(--earth)]">comparing its terrain with {pool.length} Earth sites… {pool.length - pending}/{pool.length}</p>}

      <div className="fade-in mt-2 rounded-xl border border-[var(--line2)] p-3" key={twin.key} style={{ background: "rgba(93,180,255,.05)" }}>
        <p className="label">Most alike ground</p>
        <p className="place mt-1 text-[22px] leading-[1.05] tracking-[-.03em]">{twin.place}</p>
        <p className="mono text-[11.5px] text-[var(--dim)]">{coord(twin.lat, twin.lon)}{twin.accessH !== null ? ` · ${hoursText(twin.accessH)} from a city` : ""}</p>
        <div className="mt-2 flex items-end gap-3">
          <p className="mono whitespace-nowrap text-[34px] leading-none tracking-[-.04em]" style={{ color: "var(--earth)" }}>{pct(terrain(twin))}</p>
          <p className="pb-0.5 text-[12px] leading-snug text-[var(--mut)]">terrain alike (slope mix and relief over 11 × 11 km)<br />good for: <b className="text-[var(--ink)]">{jobsAt(twin).map((j) => j.name).join(", ")}</b></p>
        </div>
        {twinJob && <button type="button" onClick={() => go(twin, twinJob, byTaskScore(twinJob))} className="chip mt-3 inline-flex hover:border-[var(--ink)]">See the base side by side with it <span aria-hidden>→</span></button>}
      </div>

      <h3 className="label mt-4" style={{ color: "var(--mut)" }}>Where to practise each job</h3>
      <ol className="mt-0.5 grid gap-0.5">
        {bestFor.map(({ sub, top, list }, i) => top && (
          <li key={sub.id}>
            <button type="button" onClick={() => go(top, sub, list)} className="row grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)]">
              <span className="mono text-[12px]" style={{ color: LEVEL[sub.level].color }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-[var(--mut)]">{sub.name}</span>
                <span className="place block truncate text-[14.5px] leading-snug">{top.place}</span>
                <span className="mono block text-[10.5px] text-[var(--dim)]">conditions {Math.round(top.taskScore * 100)} % · terrain {pct(terrain(top))}{top.easy && top.accessH !== null ? ` · ${hoursText(top.accessH)} from a city` : ""}</span>
              </span>
              <span className="fchip">Compare <span aria-hidden>→</span></span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] leading-snug text-[var(--dim)]">Each job is rehearsed where its own conditions are met (cold, thin air, dust, ice, access…), so the places differ. Conditions: our global search of Earth with NASA data. Terrain: computed now against this base site. Rank = half each; every job&apos;s full list is inside it below.</p>
    </section>
  );
}

const LAYER_NAME: Record<Layer, string> = { relief: "Relief", photo: "Photo", slope: "Slope", sun: "Sunlight", ice: "Ice" };
const LEGEND: Partial<Record<Layer, (p: BasePlan) => string>> = {
  slope: () => "Slope: green under 10° (buildable) · amber 10–20° (rover) · red over 20–30° (out of reach).",
  sun: (p) => `Share of the time each point sees the Sun (day, night and seasons, from the relief): dark = never, light = 70 %+, blue = permanent shadow${p.body === "moon" ? " (the only place lunar ice can last)" : ""}.`,
  ice: (p) => (p.ice ? `Where water ice can last: white = surface cold trap, never above 110 K (${p.ice.surfPct.toFixed(1)} %) · blue = buried ice possible (${p.ice.buriedPct.toFixed(1)} %) · grey = too warm. Coldest ${Math.round(p.ice.coldestK)} K.` : ""),
};

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
  const [realScale, setRealScale] = useState(false);
  const [ex, setEx] = useState(1.5);
  const [sun, setSun] = useState(20);
  const [symbol, setSymbol] = useState<number | null>(null);
  const [imagery, setImagery] = useState<"" | "loading" | "none">("");
  const [form, setForm] = useState({ lat: "", lon: "" });
  const [showGlobe, setShowGlobe] = useState(true); // escena: globo para elegir sitio / base
  const [viewOpen, setViewOpen] = useState(false);
  const [rehearse, setRehearse] = useState<{ site: EarthSite; list: EarthSite[] } | null>(null);
  const [cmpTick, setCmpTick] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  // Estado en la URL (?b=moon&lat=..&lon=..&n=..&s=sub&pick=1): «atrás» del navegador paso a paso y enlaces directos
  // (la portada de misiones enlaza aquí con el objetivo de cada misión).
  const bodyRef = useRef<PlanetBody>("moon");
  const pendingSub = useRef<string | null>(null);
  // comparación pedida en la URL: cmp=best (mejor sitio de la Tierra), cmp=<lat,lon> (uno del catálogo) o cmp=x con elat/elon/en
  const pendingCmp = useRef<{ cmp: string; earth: EarthSite | null } | null>(null);
  const pushURL = useCallback((q: { b: PlanetBody; site?: Site | null; s?: string | null; pick?: boolean; cmp?: EarthSite | null }) => {
    const u = new URLSearchParams();
    u.set("b", q.b);
    if (q.site) {
      u.set("lat", String(+q.site.lat.toFixed(4)));
      u.set("lon", String(+q.site.lon.toFixed(4)));
      u.set("n", q.site.name);
    }
    if (q.s) u.set("s", q.s);
    if (q.pick) u.set("pick", "1");
    if (q.cmp) {
      u.set("cmp", q.cmp.byTask && Object.keys(q.cmp.byTask).length ? q.cmp.key : "x");
      if (!Object.keys(q.cmp.byTask).length) {
        u.set("elat", String(q.cmp.lat));
        u.set("elon", String(q.cmp.lon));
        u.set("en", q.cmp.place);
      }
    }
    const url = `${window.location.pathname}?${u.toString()}`;
    if (url !== window.location.pathname + window.location.search) window.history.pushState(null, "", url);
  }, []);
  const choose = useCallback(
    (s: Site) => {
      setSite(s);
      setForm({ lat: s.lat.toFixed(3), lon: s.lon.toFixed(3) });
      setShowGlobe(false);
      setViewOpen(false);
      pushURL({ b: bodyRef.current, site: s });
    },
    [pushURL],
  );

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
        // con una submisión en la URL, la base aparece ya montada y centrada en ella
        const want = pendingSub.current;
        pendingSub.current = null;
        setStep(want ? STEP_DONE : 0);
        setStepKey((k) => k + 1);
        setSubId(want);
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
    if (!site) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [site]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const apply = () => {
      const q = new URLSearchParams(window.location.search);
      const b: PlanetBody = q.get("b") === "mars" ? "mars" : "moon";
      const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
      const has = q.has("lat") && q.has("lon") && Number.isFinite(lat) && Number.isFinite(lon);
      bodyRef.current = b;
      setBody(b);
      if (has) {
        setSite((cur) => (cur && cur.lat === lat && cur.lon === lon ? cur : { lat, lon, name: q.get("n") || coord(lat, lon) }));
        setForm({ lat: lat.toFixed(3), lon: lon.toFixed(3) });
      } else {
        setSite(null);
        setData(null);
        setStatus("");
      }
      setShowGlobe(!has || q.get("pick") === "1");
      const s = q.get("s");
      pendingSub.current = s;
      setSubId(s);
      const cmp = q.get("cmp"), elat = Number(q.get("elat")), elon = Number(q.get("elon"));
      const earth = cmp === "x" && Number.isFinite(elat) && Number.isFinite(elon) && q.has("elat") ? urlEarthSite(elat, elon, q.get("en") || coord(elat, elon)) : null;
      pendingCmp.current = has && cmp ? { cmp, earth } : null;
      setCmpTick((t) => t + 1);
      if (!cmp) setRehearse(null);
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

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

  const pickSub = (id: string, push = true) => {
    window.clearTimeout(timer.current);
    if (!running) {
      setStep(STEP_DONE);
      setStepKey((k) => k + 1);
    }
    setSubId(id);
    if (push) pushURL({ b: body, site, s: id });
  };
  const closeSub = () => {
    setSubId(null);
    pushURL({ b: body, site });
  };
  const openGlobe = (v: boolean) => {
    setShowGlobe(v);
    pushURL({ b: body, site, pick: v });
  };

  const compare = (s: EarthSite, ranked: EarthSite[], forSub: SubMission | null = sub) => {
    setRehearse({ site: s, list: ranked });
    pushURL({ b: body, site, s: forSub?.id ?? subId, cmp: s });
  };
  const closeCompare = () => {
    setRehearse(null);
    pushURL({ b: body, site, s: subId });
  };
  // Abrir la comparación de la URL en cuanto el terreno de la base está listo
  useEffect(() => {
    const want = pendingCmp.current;
    if (!want || !data || !siteSig) return;
    const target = subs.find((x) => x.id === subId && x.tasks.length) ?? subs.find((x) => x.tasks.length);
    if (!target) return;
    pendingCmp.current = null;
    const list = byTaskScore(target);
    const pick = want.earth ?? list.find((x) => x.key === want.cmp) ?? list[0];
    if (!pick) return;
    if (target.id !== subId) setSubId(target.id);
    setStep(STEP_DONE);
    setStepKey((k) => k + 1);
    setRehearse({ site: pick, list: want.earth ? [want.earth, ...list] : list });
  }, [data, siteSig, subs, subId, cmpTick]);
  // Desde la ficha del sitio: la submisión abierta (o la primera con ensayo en la Tierra) con su mejor sitio
  const compareFromCard = () => {
    const target = (sub?.tasks.length ? sub : null) ?? subs.find((x) => x.tasks.length);
    if (!target) return;
    const list = byTaskScore(target);
    if (!list[0]) return;
    if (target.id !== subId) pickSub(target.id, false);
    compare(list[0], list, target);
  };

  const markers: GlobeMarker[] = useMemo(
    () => [
      ...PRESETS[body].map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, label: p.name, kind: "target" as const })),
      ...BEST[body].map((p, i) => ({ id: p.id, lat: p.lat, lon: p.lon, label: p.name.replace(/ · .*/, ""), kind: "candidate" as const, rank: i + 1 })),
      ...(site ? [{ id: "pick", lat: site.lat, lon: site.lon, label: site.name, kind: "candidate" as const }] : []),
    ],
    [body, site],
  );

  const switchBody = (b: PlanetBody, push = true) => {
    if (b === body) return;
    bodyRef.current = b;
    if (push) pushURL({ b });
    setBody(b);
    setSite(null);
    setData(null);
    setStatus("");
    setShowGlobe(true);
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

  // Botones como en la portada (Logos): píldoras de cristal; la elegida, píldora clara (aria-pressed)
  const primary = "inline-flex min-h-[var(--tap)] items-center rounded-full bg-[var(--ink)] px-5 text-[14px] font-semibold text-[var(--bg)] hover:bg-white";

  return (
    <div className="pt-[4.25rem] md:h-dvh md:pt-0">
      {/* Escena: el globo para elegir sitio; después, la base sobre su terreno real. Fija mientras se lee el panel. */}
      <section ref={sceneRef} aria-label="3D view" className="sticky top-[4rem] z-20 h-[44dvh] bg-[var(--bg)] md:fixed md:inset-y-0 md:left-0 md:right-[436px] md:top-0 md:h-dvh md:bg-transparent">
        <div className="relative h-full">
          <Visor
            className={`bleed h-full ${showGlobe || !data ? "globo" : ""}`}
            reticle={false}
            glitchKey={body}
            tl={
              showGlobe || !data ? (
                <span className="k">{status === "loading" ? "Downloading NASA elevation data…" : "Tap any point to place a base"}</span>
              ) : (
                plan && (running ? <><span className="k">Base running</span><br />{subId && sub ? sub.name : "All sub-missions"}</> : <><span className="k">Setting up · {Math.min(step + 1, SETUP.length)}/{SETUP.length}</span><br />{SETUP[Math.min(step, SETUP.length - 1)]}</>)
              )
            }
            tr={!showGlobe && plan && <><span className="k">Buildable</span> {Math.round(plan.stats.flatPct)} %<br /><span className="k">Sun at habitat</span> {Math.round(plan.habitatLit * 100)} %</>}
            br={(showGlobe || !data) && <span className="k">{body === "moon" ? "LRO (NASA)" : "Viking (NASA)"}</span>}
          >
            {showGlobe || !data ? (
              <Globe
                key={body}
                body={body}
                markers={markers}
                selectedId={site ? "pick" : null}
                onSelect={(id) => {
                  const p = [...BEST[body], ...PRESETS[body]].find((x) => x.id === id);
                  if (p) choose(p);
                }}
                onPick={(lat, lon) => choose({ lat, lon, name: coord(lat, lon) })}
              />
            ) : (
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
                realScale={realScale}
                onStepEnd={onStepEnd}
                onSymbolScale={setSymbol}
                onImagery={setImagery}
              />
            )}
          </Visor>
          {/* Controles de vista, sobre la escena y recogidos */}
          {!showGlobe && data && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[700] flex items-end justify-between gap-2 md:inset-x-8 md:bottom-4">
              <div className="pointer-events-auto flex min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Ground layer">
                {(["relief", "photo", "slope", "sun", ...(plan?.ice ? (["ice"] as Layer[]) : [])] as Layer[]).map((l) => (
                  <button key={l} type="button" className="glass-tab !min-h-[42px] shrink-0 !px-4 text-[15px]" aria-pressed={layer === l} onClick={() => setLayer(l)}>
                    {LAYER_NAME[l]}
                  </button>
                ))}
              </div>
              <div className="pointer-events-auto flex shrink-0 gap-1.5">
                <button type="button" className="glass-tab !min-h-[42px] !px-4 text-[15px]" aria-pressed={realScale} onClick={() => setRealScale((v) => !v)}>
                  <span className="md:hidden">1:1</span>
                  <span className="hidden md:inline">Real scale</span>
                </button>
                <button type="button" className="glass-tab !min-h-[42px] !px-4 text-[15px]" aria-expanded={viewOpen} onClick={() => setViewOpen((v) => !v)}>
                  View ▾
                </button>
              </div>
              {viewOpen && (
                <div className="glass-strong pointer-events-auto absolute bottom-12 right-0 flex w-[min(320px,100%)] flex-col gap-3 p-4 text-[13px]">
                  <label className="flex flex-col gap-1">
                    <span className="text-[var(--mut)]">Height ×{ex}</span>
                    <input type="range" min={1} max={4} step={0.5} value={ex} onChange={(e) => setEx(Number(e.target.value))} aria-valuetext={`${ex} times vertical exaggeration`} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[var(--mut)]">Sun {sun.toFixed(1)}° above the horizon</span>
                    <input type="range" min={1} max={70} step={0.5} value={sun} onChange={(e) => setSun(Number(e.target.value))} aria-valuetext={`Sun ${sun} degrees above the horizon`} />
                  </label>
                  <button type="button" onClick={replay} className="glass-chip self-start">
                    Replay set-up
                  </button>
                  <p className="text-[11px] text-[var(--dim)]">
                    {symbol === 1 ? "Real scale: drag to orbit, scroll or pinch to zoom." : symbol ? `Modules drawn ${symbol}× real size so you can see them.` : ""}
                  </p>
                </div>
              )}
            </div>
          )}
          {!showGlobe && !data && status === "loading" && (
            <div role="status" className="glass-strong absolute left-1/2 top-1/2 z-[700] -translate-x-1/2 -translate-y-1/2 px-5 py-3 text-sm">
              Loading terrain…
            </div>
          )}
        </div>
        {!showGlobe && data && LEGEND[layer] && <p className="pointer-events-none absolute inset-x-8 bottom-[4.25rem] z-[600] hidden text-[11px] text-[var(--mut)] [text-shadow:0_1px_6px_rgba(4,6,12,.95)] md:block">{LEGEND[layer]!(plan!)}</p>}
      </section>

      {/* Panel: el flujo en orden */}
      <aside aria-label="Plan a base" className="mx-4 mb-24 mt-3 md:fixed md:bottom-4 md:right-4 md:top-16 md:z-30 md:m-0 md:w-[420px]">
        <div className="slide-in glass rounded-[20px] md:h-full md:overflow-hidden">
        <div className="p-5 md:h-full md:overflow-y-auto md:p-6 [scrollbar-width:thin]">
        <div className="fade-in" key={body}>
          <p className="text-[14px]" style={{ color: WORLD_COLOR[body] }}>Base concept · {body === "moon" ? "Moon" : "Mars"}{site && !showGlobe ? <> · <span className="place">{site.name.replace(/^★ /, "").replace(/ · .*/, "")}</span></> : null}</p>
          <h1 className="display mt-1 text-[30px] leading-[1]">Plan a base</h1>
          <p className="mt-1 text-[13.5px] text-[var(--mut)]">Pick a site, watch the base run on its real terrain, then see where on Earth to rehearse each job.</p>
          <div className="mt-3 flex gap-2" role="group" aria-label="World">
            {(["moon", "mars"] as const).map((b) => (
              <button key={b} type="button" aria-pressed={body === b} onClick={() => switchBody(b)} className="chip glass !py-1.5" style={body === b ? { borderColor: WORLD_COLOR[b], color: WORLD_COLOR[b] } : undefined}>
                {b === "moon" ? "Moon" : "Mars"}
              </button>
            ))}
          </div>
        </div>

        {/* 1 · Sitio */}
        {showGlobe || !site ? (
          <section aria-labelledby="pick-h" className="mt-5">
            <div className="flex items-center justify-between">
              <h2 id="pick-h" className="label">1 · Choose a site</h2>
              {data && site && (
                <button type="button" className="chip hover:border-[var(--ink)]" onClick={() => openGlobe(false)}>
                  Back to {site.name.replace(/^★ /, "").replace(/ · .*/, "")}
                </button>
              )}
            </div>
            <p className="mt-1 text-[12.5px] text-[var(--mut)]">Tap the globe, or start from a site our search recommends.</p>
            <h3 className="label mt-3 flex items-center justify-between" style={{ color: "var(--earth)" }}><span>★ Recommended by our search</span><span className="mono text-[var(--dim)]">{BEST[body].length}</span></h3>
            <ul className="stagger mt-0.5 grid gap-0.5">
              {BEST[body].map((p, i) => (
                <li key={p.id}>
                  <button type="button" onClick={() => choose(p)} className="row grid w-full grid-cols-[22px_1fr] items-start gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)] focus-visible:border-[var(--ink)]">
                    <span className="mono pt-0.5 text-[12px]" style={{ color: "var(--earth)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0"><span className="place block text-[15px] leading-snug">{p.name.replace(/^★ /, "")}</span><span className="block text-[11.5px] leading-snug text-[var(--dim)]">{p.why}</span></span>
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="label mt-3 flex items-center justify-between" style={{ color: "var(--mut)" }}><span>Well-known sites</span><span className="mono text-[var(--dim)]">{PRESETS[body].length}</span></h3>
            <ul className="stagger mt-0.5 grid gap-0.5">
              {PRESETS[body].map((p, i) => (
                <li key={p.id}>
                  <button type="button" onClick={() => choose(p)} className="row grid w-full grid-cols-[22px_1fr] items-start gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[var(--line2)] focus-visible:border-[var(--ink)]">
                    <span className="mono pt-0.5 text-[12px] text-[var(--mut)]">{String(BEST[body].length + i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0"><span className="place block text-[15px] leading-snug">{p.name}</span><span className="block truncate text-[11.5px] text-[var(--dim)]">{p.why}</span></span>
                  </button>
                </li>
              ))}
            </ul>
            <details className="about mt-4">
              <summary>Enter coordinates</summary>
              <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2">
                <label className="flex flex-col text-[12px] text-[var(--mut)]">
                  Latitude (°)
                  <input inputMode="decimal" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="mt-1 w-28 rounded-xl border border-[var(--line2)] bg-[var(--bg2)] px-3 py-2 text-base text-[var(--ink)]" />
                </label>
                <label className="flex flex-col text-[12px] text-[var(--mut)]">
                  Longitude (°)
                  <input inputMode="decimal" value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} className="mt-1 w-28 rounded-xl border border-[var(--line2)] bg-[var(--bg2)] px-3 py-2 text-base text-[var(--ink)]" />
                </label>
                <button type="submit" className={primary}>
                  Plan base
                </button>
              </form>
            </details>
            {status === "error" && <p role="alert" className="mt-3 text-sm" style={{ color: "var(--warn)" }}>{err}</p>}
          </section>
        ) : (
          <>
            <section aria-labelledby="site-h" className="mt-5 border-t border-[var(--line)] pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label">1 · Site</p>
                  <h2 id="site-h" className="place mt-1 text-[24px] leading-[1.05] tracking-[-.03em]">{site.name.replace(/^★ /, "")}</h2>
                  <p className="mono text-[11.5px] text-[var(--dim)]">{coord(site.lat, site.lon)} · {body === "moon" ? "Moon" : "Mars"}</p>
                </div>
                <button type="button" className="chip shrink-0 hover:border-[var(--ink)]" onClick={() => openGlobe(true)}>
                  Change site
                </button>
              </div>
              {status === "loading" && <p role="status" className="vivo mt-3 text-sm text-[var(--mut)]">Downloading NASA elevation data and laying out the base…</p>}
              {status === "error" && <p role="alert" className="mt-3 text-sm" style={{ color: "var(--warn)" }}>Could not load this site: {err}</p>}
              {plan && (
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["Buildable", `${Math.round(plan.stats.flatPct)} %`],
                    ["Sun at habitat", `${Math.round(plan.habitatLit * 100)} %`],
                    plan.ice
                      ? ["Ice at surface", plan.ice.surfPct > 0 ? `${plan.ice.surfPct.toFixed(1)} %` : "none"]
                      : ["Air", `${Math.round(marsPressurePa(plan.habitat.h))} Pa`],
                  ].map(([k, v]) => (
                    <div key={k} className="ltile">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {plan && subs.some((x) => x.tasks.length) && (
                <button type="button" onClick={compareFromCard} className="chip mt-3 inline-flex hover:border-[var(--ink)]">
                  Compare this base with an Earth site <span aria-hidden>→</span>
                </button>
              )}
            </section>

            {plan && siteSig && subs.some((x) => x.tasks.length) && (
              <EarthTwin
                key={data?.key}
                subs={subs}
                siteSig={siteSig}
                onCompare={(s, list, forSub) => {
                  if (forSub.id !== subId) pickSub(forSub.id, false);
                  compare(s, list, forSub);
                }}
              />
            )}

            {plan && (
              <section aria-labelledby="subs-h" className="mt-5">
                <h2 id="subs-h" className="label">2 · What the base must keep doing · {subs.length}</h2>
                <p className="mt-1 text-[11.5px] leading-snug text-[var(--dim)]">Open a job to see it in 3D, how well this site supports it and where on Earth to rehearse it.</p>
                <ul className="stagger mt-1.5 grid gap-0.5">
                  {subs.map((s, i) => {
                    const open = subId === s.id;
                    return (
                      <li key={s.id} className={`rounded-xl border transition-colors ${open ? "border-[var(--line2)] bg-[rgba(150,175,230,.05)]" : "border-transparent"}`}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => (open ? closeSub() : pickSub(s.id))}
                          className="row grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl p-2 text-left"
                        >
                          <span className="mono text-[12px]" style={{ color: LEVEL[s.level].color }}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="min-w-0">
                            <span className="place block text-[15px] leading-snug">{s.name}</span>
                            <span className="block truncate text-[11.5px] text-[var(--dim)]">{s.cadence}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: LEVEL[s.level].color }}>
                              <i aria-hidden className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: LEVEL[s.level].color, boxShadow: `0 0 8px ${LEVEL[s.level].color}` }} />
                              {LEVEL[s.level].label}
                            </span>
                            <span aria-hidden className={`text-[var(--mut)] transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
                          </span>
                        </button>
                        {open && (
                          <div className="fade-in px-2 pb-3 pl-[38px]">
                            <p className="text-[13.5px] text-[var(--ink)]">{s.verdict}</p>
                            <p className="mt-1.5 border-l-2 pl-3 text-[12.5px] text-[var(--mut)]" style={{ borderColor: LEVEL[s.level].color }}>
                              <span className="label mr-1.5">Needs</span>
                              {s.needs}
                            </p>
                            {siteSig && (
                              <div className="mt-4">
                                <p className="label">3 · Rehearse it on Earth</p>
                                <div className="mt-2">
                                  <EarthSim key={`${data?.key}:${s.id}`} sub={s} siteSig={siteSig} onCompare={compare} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {plan && (
              <>
                <details className="about mt-5">
                  <summary>What this site is like</summary>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    {plan.conditions.map((c) => (
                      <div key={c.label} className="ltile">
                        <dt className="flex items-center justify-between gap-2">
                          {c.label}
                          <span className={`text-[10.5px] ${c.kind === "data" ? "text-[var(--ok)]" : c.kind === "physics" ? "text-[var(--acc2-t)]" : "text-[var(--warn)]"}`}>
                            {c.kind === "data" ? "computed" : c.kind === "physics" ? "physics" : "rough rule"}
                          </span>
                        </dt>
                        <dd>{c.value}</dd>
                        <dd className="!text-[11.5px] !font-normal !tracking-normal text-[var(--dim)]" style={{ color: "var(--dim)" }}>{c.note}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <details className="about mt-3">
                  <summary>About this simulation</summary>
                  <div className="mt-2 text-[13px] text-[var(--mut)]">
                    <p className="text-[var(--ink)]">A concept, not a NASA design.</p>
                    <p className="mt-1">
                      Each part is placed with simple rules on real NASA elevation data: pad {RULES.padMinM / 1000}–{RULES.padMaxM / 1000} km from the
                      habitat, reactor ~{RULES.reactorM / 1000} km away, rover slopes under {RULES.roverLimitDeg}°, walks within {RULES.evaRadiusM / 1000} km,
                      &quot;buildable&quot; = under {RULES.flatDeg}°. Sunlight and temperature are computed from the relief (only this 11 km patch, at ground
                      level). On the Moon, ice is placed only where the ground stays below 110 K. Distances and how often each job repeats are our
                      assumptions.
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-[var(--dim)]">
                      Mesh ≈ {Math.round(plan.cellM)} m/px{imagery === "loading" ? " · loading imagery…" : imagery === "none" ? " · no imagery here" : ""} · {data?.terrain.source}
                    </p>
                  </div>
                </details>
              </>
            )}
          </>
        )}
        </div>
        </div>
      </aside>

      {rehearse && data && site && sub && siteSig && (
        <MissionCompare
          sub={sub}
          site={rehearse.site}
          sites={rehearse.list}
          onSite={(s) => setRehearse((r) => (r ? { ...r, site: s as EarthSite } : r))}
          base={{ terrain: data.terrain, plan: data.plan, sig: siteSig, name: site.name.replace(/^★ /, ""), sun, layer }}
          onClose={closeCompare}
        />
      )}
    </div>
  );
}
