"use client";

// Portada en modo «historia»: poco texto, animación e interacción. Las pestañas de datos quedan detrás de «Explore the data».
import dynamic from "next/dynamic";
import { AnimatePresence, LayoutGroup, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import eeGlobal from "@/data/ee-global.json";
import { TARGETS } from "@/data/targets";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { TARGET_TERRAIN } from "@/lib/targetTerrain";
import type { GlobeMarker } from "@/components/Globe";
import Link from "next/link";
import { useAppState } from "@/components/AppState";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const Viewer3D = dynamic(() => import("@/components/Viewer3D"), { ssr: false });
const Planet3D = dynamic(() => import("@/components/Planet3D"), { ssr: false });

interface Cand {
  c: [number, number];
  total: number;
  forma?: number | null;
  superficie: number | null;
  relieve: number | null;
  accesibilidad: number | null;
  access_h: number | null;
  place?: string | null;
}
interface Res {
  top: Cand[];
  dist: { total_p50: number; total_p90: number; total_p99: number };
  known: { name: string; total: number | null }[];
}
const DATA = eeGlobal as unknown as Record<string, Res>;

const ease = [0.2, 0.7, 0.2, 1] as const;
const fmtH = (h: number | null) => (h == null ? "—" : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : `${h.toFixed(1)} h`);
// v3: analogía = media(fase 1 forma, fase 2 clima) = c.total; v2 (sin forma): media(superficie, relieve)
const analog = (c: Cand) => (c.forma != null ? c.total : ((c.superficie ?? 0) + (c.relieve ?? 0)) / 2);
const short = (p?: string | null) => (p ?? "Unnamed").split(",")[0].replace(/ (Province|Governorate|Region)$/, "");
const country = (p?: string | null) => (p ?? "").split(",").slice(1).join(",").trim();

/* ---------- piezas ---------- */

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to, suffix = "", prefix = "", decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [txt, setTxt] = useState(`${prefix}0${suffix}`);
  useEffect(() => mv.on("change", (v) => setTxt(`${prefix}${v.toFixed(decimals)}${suffix}`)), [mv, prefix, suffix, decimals]);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return void mv.set(to);
    const c = animate(mv, to, { duration: 1.6, ease });
    return () => c.stop();
  }, [inView, to, mv, reduce]);
  return <span ref={ref}>{txt}</span>;
}

function Chapter({ n, title, kicker, children, id }: { n: string; title: ReactNode; kicker?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-5 py-24 md:py-32">
      <Reveal>
        <p className="etq mb-5" data-n={n}>
          {kicker}
        </p>
        <h2 className="max-w-[18ch] text-[clamp(32px,5vw,64px)] font-medium leading-[1.02]">{title}</h2>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Orb({ body, size = 120, active }: { body: "moon" | "mars" | "earth"; size?: number | string; active?: boolean }) {
  return <Planet3D body={body} size={size} active={active} />;
}

function ScoreRing({ v, size = 64 }: { v: number; size?: number }) {
  const r = size / 2 - 4;
  const len = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={3} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--acc)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={len}
        initial={{ strokeDashoffset: len }}
        animate={{ strokeDashoffset: len * (1 - v) }}
        transition={{ duration: 1.1, ease }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" className="fill-[var(--ink)] font-mono text-[15px]">
        {Math.round(v * 100)}
      </text>
    </svg>
  );
}

/* ---------- efectos de scroll estilo Apple ---------- */

// Texto que se ilumina palabra a palabra según avanza el scroll (sube y baja con la rueda).
function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord key={i} p={scrollYProgress} a={i / words.length} b={(i + 1) / words.length}>
          {w}
        </ScrubWord>
      ))}
    </p>
  );
}
function ScrubWord({ p, a, b, children }: { p: ReturnType<typeof useScroll>["scrollYProgress"]; a: number; b: number; children: string }) {
  const o = useTransform(p, [a, b], [0.16, 1]);
  return (
    <motion.span style={{ opacity: o }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

// Escena de una pantalla, ligada al TIEMPO y no al scroll: al entrar en vista, la Luna se encoge y se aparta,
// entra la Tierra y tres mensajes se relevan (≈12 s). Se pausa sola al salir de la vista y tiene Pausa / Repetir.
const SCENE_S = 12;
function ContrastScene() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.55 });
  const p = useMotionValue(0);
  const ctl = useRef<ReturnType<typeof animate> | null>(null);
  const userPaused = useRef(false);
  const [state, setState] = useState<"idle" | "playing" | "paused" | "done">("idle");
  const play = useCallback(
    (from?: number) => {
      ctl.current?.stop();
      if (from != null) p.set(from);
      setState("playing");
      ctl.current = animate(p, 1, { duration: SCENE_S * (1 - p.get()), ease: "linear", onComplete: () => setState("done") });
    },
    [p],
  );
  const pause = useCallback(() => {
    ctl.current?.stop();
    setState("paused");
  }, []);
  useEffect(() => {
    if (reduce) return;
    if (inView && (state === "idle" || (state === "paused" && !userPaused.current))) play(state === "idle" ? 0 : undefined);
    if (!inView && state === "playing") pause();
  }, [inView, state, play, pause, reduce]);
  useEffect(() => () => ctl.current?.stop(), []);
  const moonScale = useTransform(p, [0, 0.45, 1], [1.25, 0.55, 0.38]);
  const moonX = useTransform(p, [0, 0.45, 1], ["0vw", "-26vw", "-30vw"]);
  const moonO = useTransform(p, [0.85, 1], [1, 0.6]);
  const earthScale = useTransform(p, [0.25, 0.6, 1], [0.2, 0.62, 0.72]);
  const earthX = useTransform(p, [0.25, 0.6], ["30vw", "18vw"]);
  const earthO = useTransform(p, [0.25, 0.4], [0, 1]);
  const steps = [
    { r: [0, 0.08, 0.26, 0.34], k: "Moon · south pole", big: "−230 °C", t: "Inside the shadowed craters where the ice is." },
    { r: [0.34, 0.42, 0.6, 0.68], k: "Earth · coldest land", big: "−81 °C", t: "The coldest surface NASA's MODIS saw on all of Earth in 2024." },
    { r: [0.68, 0.76, 1, 1.01], k: "So", big: "Same extreme,\nnot same number.", t: "We look for the places that sit at the edge of Earth's range in the same direction." },
  ];
  if (reduce) {
    return (
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-24 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.k}>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[var(--dim)]">{s.k}</p>
            <p className="mt-2 whitespace-pre-line font-mono text-4xl text-[var(--acc)]">{s.big}</p>
            <p className="mt-2 text-sm text-[var(--mut)]">{s.t}</p>
          </div>
        ))}
      </section>
    );
  }
  return (
    <section ref={ref} aria-label="Moon versus Earth: the coldest places" className="relative">
      <div className="relative flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div style={{ scale: moonScale, x: moonX, opacity: moonO }} className="absolute">
          <Orb body="moon" size={420} active />
        </motion.div>
        <motion.div style={{ scale: earthScale, x: earthX, opacity: earthO }} className="absolute">
          <Orb body="earth" size={420} active />
        </motion.div>
        {steps.map((s) => (
          <SceneCaption key={s.k} p={p} r={s.r} k={s.k} big={s.big} t={s.t} />
        ))}
        <div className="absolute bottom-4 right-5 z-20 flex gap-2 font-mono text-xs uppercase tracking-[.08em]">
          {state === "playing" ? (
            <button
              type="button"
              onClick={() => {
                userPaused.current = true;
                pause();
              }}
              className="btn-cut min-h-[var(--tap)] border border-[var(--line2)] bg-[rgba(4,8,15,.7)] px-4 hover:text-[var(--acc)]"
            >
              Pause
            </button>
          ) : (
            state === "paused" && (
              <button
                type="button"
                onClick={() => {
                  userPaused.current = false;
                  play();
                }}
                className="btn-cut min-h-[var(--tap)] border border-[var(--line2)] bg-[rgba(4,8,15,.7)] px-4 hover:text-[var(--acc)]"
              >
                Play
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => {
              userPaused.current = false;
              play(0);
            }}
            className="btn-cut min-h-[var(--tap)] border border-[var(--line2)] bg-[rgba(4,8,15,.7)] px-4 hover:text-[var(--acc)]"
          >
            Replay ↺
          </button>
        </div>
        <motion.div style={{ scaleX: p }} className="absolute bottom-0 left-0 h-px w-full origin-left bg-[var(--acc)]" />
      </div>
    </section>
  );
}
function SceneCaption({ p, r, k, big, t }: { p: MotionValue<number>; r: number[]; k: string; big: string; t: string }) {
  const o = useTransform(p, r, [0, 1, 1, 0]);
  const y = useTransform(p, r, [40, 0, 0, -40]);
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute bottom-[12vh] left-5 right-5 z-10 mx-auto max-w-6xl [text-shadow:0_2px_24px_rgba(4,8,15,.95),0_0_8px_rgba(4,8,15,.9)] md:bottom-auto md:left-auto md:right-[8vw] md:w-[34rem] md:text-right">
      <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[var(--dim)]">{k}</p>
      <p className="mt-3 whitespace-pre-line text-[clamp(44px,7vw,96px)] font-medium leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">{big}</p>
      <p className="mt-4 text-[var(--mut)] md:ml-auto md:max-w-[30ch]">{t}</p>
    </motion.div>
  );
}

// Bloque que se expande desde un recuadro hasta todo el ancho al hacer scroll.
function ExpandOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const inset = useTransform(scrollYProgress, [0, 1], ["inset(8% 22% 8% 22%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { clipPath: inset, scale }}>
      {children}
    </motion.div>
  );
}

/* ---------- historia ---------- */

export type Section = "hero" | "contrast" | "destination" | "tradeoff" | "step3d" | "validation" | "honesty" | "closing";

// La historia se reparte en páginas: cada página pide sus secciones. El destino y el peso viven en AppState.
export default function Story({ sections }: { sections: Section[] }) {
  const has = (x: Section) => sections.includes(x);
  const reduceMotion = useReducedMotion();
  const { targetId, setTargetId, w, setW } = useAppState();
  const [sel, setSel] = useState<string | null>(null);
  const [view3d, setView3d] = useState<Cand | null>(null);
  const [pick, setPick] = useState(0); // candidato elegido en la página 3D (posición en el ranking)
  const target = TARGETS.find((t) => t.id === targetId)!;
  const res = DATA[targetId];

  // Re-ranking en vivo: (1 − w)·analogía + w·accesibilidad, sobre los 20 mejores de cada objetivo
  const ranked = useMemo(
    () =>
      [...res.top]
        .map((c, i) => ({ c, id: `${targetId}-${i}`, s: (1 - w) * analog(c) + w * (c.accesibilidad ?? 0) }))
        .sort((a, b) => b.s - a.s),
    [res, w, targetId],
  );
  const markers: GlobeMarker[] = ranked.slice(0, 10).map((r, i) => ({
    id: r.id,
    lat: r.c.c[1],
    lon: r.c.c[0],
    label: `${i + 1}. ${short(r.c.place)}`,
    kind: "candidate",
    rank: i + 1,
  }));
  useEffect(() => {
    setSel(null);
    setPick(0);
  }, [targetId]);
  const best = ranked[0];
  const picked = ranked[Math.min(pick, ranked.length - 1)];

  // Parallax de la portada
  const hero = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const globeY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = ["Where", "on", "Earth", "is", "the", "Moon?"];
  const known = [...res.known].filter((k) => k.total != null) as { name: string; total: number }[];
  const inTop = known.filter((k) => k.total >= res.dist.total_p90).length;
  const lo = Math.min(...known.map((k) => k.total), res.dist.total_p50) - 0.05;
  const hi = Math.max(...known.map((k) => k.total), res.dist.total_p99) + 0.03;
  const xpos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;

  return (
    <div className="relative">
      {/* ───────── PORTADA ───────── */}
      {has("hero") && (
        <>
      <div ref={hero} className="relative min-h-[100svh] overflow-hidden">
        <motion.div style={{ y: globeY }} className="pointer-events-auto absolute inset-0 md:left-[38%]">
          <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_72%,transparent)]">
            <Globe body="earth" markers={markers} selectedId={sel} onSelect={setSel} zoom={false} />
          </div>
        </motion.div>
        <motion.div style={{ y: titleY, opacity: fade }} className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-20 md:justify-center md:pb-0">
          <motion.p
            className="mb-5 font-mono text-[11px] uppercase tracking-[.18em] text-[var(--acc)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            NASA Space Apps 2026 · Team Logos
          </motion.p>
          <h1 className="max-w-[9ch] text-[clamp(48px,9vw,128px)] font-medium leading-[0.92] tracking-[-0.04em]">
            {words.map((wd, i) => (
              <motion.span
                key={i}
                className={`mr-[0.22em] inline-block ${wd === "Moon?" ? "text-[var(--acc)]" : ""}`}
                initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.09, ease }}
              >
                {wd}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-[34ch] text-[clamp(16px,1.6vw,20px)] font-light text-[var(--ink)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
          >
            We scanned every 11 km of Earth&apos;s land with NASA satellites to find the places that look like the Moon and
            Mars, and that a team can actually reach.
          </motion.p>
          <motion.div
            className="pointer-events-auto mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.7 }}
          >
            <Link href="/appendix/discover/" className="btn-cut bg-[var(--acc)] px-5 py-3.5 font-mono text-[13px] uppercase tracking-[.06em] text-[var(--bg)]">
              Start the search →
            </Link>
            <Link href="/appendix/data/" className="btn-cut border border-[var(--line2)] px-5 py-3.5 font-mono text-[13px] uppercase tracking-[.06em] hover:text-[var(--acc)]">
              Explore the data
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[.2em] text-[var(--dim)]"
          aria-hidden
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          scroll
        </motion.div>
      </div>
        </>
      )}

{/* ───────── 01 · EL CONTRASTE (escena fija con scroll) ───────── */}
      {has("contrast") && (
        <>
      <ContrastScene />

      <Chapter n="01" kicker="The problem" title={<>Nowhere on Earth is <em className="not-italic text-[var(--acc)]">really</em> the Moon.</>}>
        <ScrubText
          className="max-w-[30ch] text-[clamp(24px,3vw,40px)] font-light leading-snug"
          text="Today's analog sites were picked one by one, by experience. We searched the whole planet, and we say where each analog stops being useful."
        />
        <div className="mt-12 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          {[
            { big: <Counter to={25} />, k: "Analog sites in use", t: "Atacama, Devon Island, Iceland, Hawaii… each chosen by hand." },
            { big: <Counter to={2.1} decimals={1} suffix=" M" />, k: "Cells we scored", t: "Every 0.1° (~11 km) of land between 85°N and 85°S." },
            { big: <Counter to={3} />, k: "Questions per place", t: "Does it look like the target? Is the terrain alike? Can a team get there?" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.12} className="bg-[var(--bg)] p-6 md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[var(--dim)]">{s.k}</p>
              <p className="mt-3 font-mono text-[clamp(40px,5vw,64px)] leading-none text-[var(--acc)]">{s.big}</p>
              <p className="mt-4 max-w-[28ch] text-sm text-[var(--mut)]">{s.t}</p>
            </Reveal>
          ))}
        </div>
      </Chapter>
        </>
      )}

{/* ───────── 02 · ELIGE DESTINO ───────── */}
      {has("destination") && (
        <>
      <Chapter id="destino" n="02" kicker="Your turn" title="Pick a destination.">
        <div className="grid grid-cols-3 gap-3 md:max-w-3xl">
          {TARGETS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <motion.button
                onClick={() => setTargetId(t.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={t.id === targetId}
                className={`group flex w-full flex-col items-center gap-3 border p-4 transition-colors ${
                  t.id === targetId ? "border-[var(--acc)] bg-[rgba(94,230,255,.06)]" : "border-[var(--line)] hover:border-[var(--line2)]"
                }`}
              >
                <Orb body={t.body} size={88} active={t.id === targetId} />
                <span className="text-center">
                  <span className="block font-mono text-[10px] uppercase tracking-[.14em] text-[var(--dim)]">{t.body === "moon" ? "Moon" : "Mars"}</span>
                  <span className="text-[15px]">{t.short}</span>
                </span>
              </motion.button>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="visor h-[min(70vw,460px)]">
            <div className="absolute inset-0">
              <Globe body="earth" markers={markers} selectedId={sel ?? (best ? best.id : null)} onSelect={setSel} zoom={false} />
            </div>
            <div className="marco" />
            <div className="hud tl">
              <span className="k">Analogs of</span>
              <br />
              {target.short}
            </div>
            <div className="hud br">
              <span className="k">Top 10 · tap a pin</span>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[var(--dim)]">Best new matches on Earth</p>
            <LayoutGroup>
              <ul className="mt-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {ranked.slice(0, 3).map((r, i) => (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <button
                        onClick={() => setSel(r.id)}
                        className={`flex w-full items-center gap-4 border p-3 text-left transition-colors ${sel === r.id ? "border-[var(--acc)]" : "border-[var(--line)] hover:border-[var(--line2)]"}`}
                      >
                        <span className="w-6 font-mono text-[var(--acc)]">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[17px]">{short(r.c.place)}</span>
                          <span className="block truncate text-xs text-[var(--mut)]">
                            {country(r.c.place)} · {fmtH(r.c.access_h)} to a city
                          </span>
                        </span>
                        <ScoreRing v={r.s} size={52} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </LayoutGroup>
            <AnimatePresence mode="wait">
              <motion.p
                key={targetId}
                className="mt-5 text-sm text-[var(--mut)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {target.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </Chapter>
        </>
      )}

{/* ───────── 03 · CIENCIA VS LOGÍSTICA ───────── */}
      {has("tradeoff") && (
        <>
      <Chapter n="03" kicker="Trade-off" title="Science or logistics? You decide.">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <ScrubText
              className="max-w-[24ch] text-[clamp(22px,2.4vw,32px)] font-light leading-snug"
              text="The perfect analog is useless if you can't get a rover, a drill and a team there. Slide, and watch the ranking reorder."
            />
            <div className="mt-8">
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[.12em]">
                <span className={w < 0.5 ? "text-[var(--acc)]" : "text-[var(--dim)]"}>Looks like {target.short}</span>
                <span className={w >= 0.5 ? "text-[var(--warn)]" : "text-[var(--dim)]"}>Easy to reach</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={w}
                onChange={(e) => setW(+e.target.value)}
                aria-label="Weight of accessibility versus similarity"
                className="slider mt-3 w-full"
                style={{ ["--p" as string]: `${w * 100}%` }}
              />
              <p className="mt-3 font-mono text-xs text-[var(--mut)]">
                {Math.round((1 - w) * 100)}% analogy · {Math.round(w * 100)}% access
                {Math.abs(w - 1 / 3) < 0.02 && <span className="text-[var(--acc)]"> · our official score</span>}
              </p>
              <button onClick={() => setW(1 / 3)} className="mt-2 font-mono text-[11px] uppercase tracking-[.1em] text-sky-300 underline">
                Reset to official
              </button>
            </div>
          </Reveal>
          <LayoutGroup>
            <ol className="space-y-1.5">
              {ranked.slice(0, 7).map((r, i) => (
                <motion.li key={r.id} layout transition={{ type: "spring", stiffness: 420, damping: 36 }} className="flex items-center gap-3 border border-[var(--line)] bg-[var(--bg2)] px-3 py-2.5">
                  <span className="w-5 font-mono text-sm text-[var(--acc)]">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{short(r.c.place)}</span>
                  <span className="hidden w-28 sm:block">
                    <span className="flex h-1.5 overflow-hidden bg-[var(--line)]">
                      <motion.span className="bg-[var(--acc)]" animate={{ width: `${(1 - w) * analog(r.c) * 100}%` }} />
                      <motion.span className="bg-[var(--warn)]" animate={{ width: `${w * (r.c.accesibilidad ?? 0) * 100}%` }} />
                    </span>
                  </span>
                  <span className="w-16 text-right font-mono text-xs text-[var(--mut)]">{fmtH(r.c.access_h)}</span>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
        </div>
      </Chapter>
        </>
      )}

{/* ───────── 04 · ENTRA EN 3D ───────── */}
      {has("step3d") && (
        <>
      <Chapter n="04" kicker="Step inside" title={<>Same scale. Same sunlight.<br />Two worlds.</>}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTargetId(t.id)}
              aria-pressed={t.id === targetId}
              className={`btn-cut border px-3 py-2 font-mono text-[11px] uppercase tracking-[.08em] transition-colors ${t.id === targetId ? "border-[var(--acc)] bg-[var(--acc)] text-[var(--bg)]" : "border-[var(--line2)] hover:text-[var(--acc)]"}`}
            >
              {t.short}
            </button>
          ))}
        </div>
        <LayoutGroup>
          <div className="mb-8 flex flex-wrap gap-2">
            {ranked.slice(0, 5).map((r, i) => (
              <button
                key={r.id}
                onClick={() => setPick(i)}
                aria-pressed={i === pick}
                className={`relative border px-3 py-2 text-left text-sm transition-colors ${i === pick ? "border-[var(--acc)]" : "border-[var(--line)] hover:border-[var(--line2)]"}`}
              >
                {i === pick && <motion.span layoutId="pick3d" className="absolute inset-0 bg-[rgba(94,230,255,.08)]" />}
                <span className="relative">
                  <span className="mr-2 font-mono text-[var(--acc)]">{i + 1}</span>
                  {short(r.c.place)}
                  <span className="ml-2 text-xs text-[var(--mut)]">{country(r.c.place)}</span>
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <ExpandOnScroll>
          <button
            onClick={() => picked && setView3d(picked.c)}
            className="group relative block w-full overflow-hidden border border-[var(--line2)] text-left"
          >
            <div className="relative flex items-center justify-center gap-[6vw] bg-[radial-gradient(60%_80%_at_50%_50%,rgba(61,125,255,.12),transparent)] px-6 py-14 md:py-20">
              <span className="flex flex-col items-center gap-4">
                <Orb body="earth" size="min(30vw,240px)" active />
                <span className="font-mono text-[11px] uppercase tracking-[.12em]">Earth · {short(picked?.c.place)}</span>
              </span>
              <span className="font-mono text-[clamp(22px,3vw,36px)] text-[var(--dim)]">≈</span>
              <span className="flex flex-col items-center gap-4">
                <Orb body={target.body} size="min(30vw,240px)" active />
                <span className="font-mono text-[11px] uppercase tracking-[.12em]">{target.body === "moon" ? "Moon" : "Mars"} · {target.short}</span>
              </span>
            </div>
            <span className="absolute inset-x-0 bottom-4 flex justify-center">
              <span className="btn-cut bg-[var(--acc)] px-5 py-3 font-mono text-[13px] uppercase tracking-[.08em] text-[var(--bg)]">
                Open 11 × 11 km in 3D ▸
              </span>
            </span>
          </button>
        </ExpandOnScroll>
        <Reveal>
          <p className="mt-4 max-w-[60ch] text-sm text-[var(--mut)]">
            Real elevation: Earth from SRTM, the Moon from NASA LRO LOLA (5 m), Mars from CTX and MOLA. Drop the Sun to 1.5°
            and see the candidate lit like the lunar south pole.
          </p>
        </Reveal>
      </Chapter>
        </>
      )}

{/* ───────── 05 · ¿FUNCIONA? ───────── */}
      {has("validation") && (
        <>
      <Chapter n="05" kicker="Does it work?" title={<><Counter to={inTop} /> of {known.length} known analogs land in Earth&apos;s top 10%.</>}>
        <Reveal>
          <div className="relative mt-4 h-40 border-b border-[var(--line2)]">
            <div className="absolute bottom-0 top-0 border-l border-dashed border-[var(--dim)]" style={{ left: xpos(res.dist.total_p50) }}>
              <span className="absolute -top-1 left-1 font-mono text-[10px] uppercase text-[var(--dim)]">Earth median</span>
            </div>
            <div className="absolute bottom-0 top-0 border-l border-[var(--acc)]" style={{ left: xpos(res.dist.total_p90) }}>
              <span className="absolute -top-1 left-1 font-mono text-[10px] uppercase text-[var(--acc)]">top 10%</span>
            </div>
            {known.map((k, i) => (
              <motion.span
                key={k.name}
                title={`${k.name}: ${Math.round(k.total * 100)}`}
                className={`absolute h-3 w-3 -translate-x-1/2 rounded-full ${k.total >= res.dist.total_p90 ? "bg-[var(--acc)]" : "bg-[var(--mut)]"}`}
                style={{ left: xpos(k.total), bottom: 10 + (i % 6) * 18 }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 300, damping: 18 }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--dim)]">
            <span>less similar</span>
            <span>more similar to {target.short}</span>
          </div>
          <p className="mt-6 max-w-[56ch] text-sm text-[var(--mut)]">
            Each dot is a site NASA, ESA or researchers already use (Death Valley, Hawaii, Wadi Rum, Lanzarote…), scored
            blind by our method. Most sit above the Earth median: the scoring points the right way.
          </p>
        </Reveal>
      </Chapter>
        </>
      )}

{/* ───────── 06 · DÓNDE SE ROMPE ───────── */}
      {has("honesty") && (
        <>
      <Chapter n="06" kicker="Honesty" title="Where every analogy breaks.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["1/6 g", "Lunar gravity"],
            ["0 atm", "Vacuum"],
            ["−230 °C", "Shadowed craters"],
            ["Cosmic rays", "No magnetic shield"],
          ].map(([a, b], i) => (
            <Reveal key={b} delay={i * 0.08} className="border border-[rgba(255,181,71,.35)] p-5">
              <p className="font-mono text-2xl text-[var(--warn)]">{a}</p>
              <p className="mt-2 text-sm text-[var(--mut)]">{b}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-[56ch] text-sm text-[var(--mut)]">
            No place on Earth reproduces these. TerraVista tells you, for every candidate, what it can rehearse and what it
            cannot.
          </p>
        </Reveal>
      </Chapter>
        </>
      )}

{/* ───────── CIERRE ───────── */}
      {has("closing") && (
        <>
      <section className="mx-auto max-w-6xl px-5 pb-32 pt-10">
        <Reveal className="cut">
          <div className="in flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-medium leading-tight">Every number, every source.</h2>
              <p className="mt-2 max-w-[48ch] text-sm text-[var(--mut)]">
                The full method, all 20 candidates per target, the layers behind each score and the Moon/Mars maps.
              </p>
            </div>
            <Link href="/appendix/data/" className="btn-cut shrink-0 bg-[var(--acc)] px-6 py-4 font-mono text-[13px] uppercase tracking-[.08em] text-[var(--bg)]">
              Explore the data ▸
            </Link>
          </div>
        </Reveal>
        <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[.1em] text-[var(--dim)]">
          Data · NASA MODIS · GPM IMERG · ASTER · LRO LOLA &amp; WAC · MGS MOLA · Mars 2020 CTX · Viking · Oxford MAP accessibility ·
          ESA Sentinel-2 (EOX) · Google Earth Engine
        </p>
      </section>
        </>
      )}

      {view3d && (
        <Viewer3D
          site={{ lat: view3d.c[1], lon: view3d.c[0], name: view3d.place ?? "Candidate" }}
          target={{ name: target.name, short: target.short, ...TARGET_TERRAIN[target.id] }}
          onClose={() => setView3d(null)}
        />
      )}
    </div>
  );
}
