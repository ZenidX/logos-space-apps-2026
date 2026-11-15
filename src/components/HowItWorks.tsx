"use client";

// Que la web se explique sola: qué es un análogo y cómo funciona TerraVista en 3 pasos (portada),
// y una introducción por página (dónde estás, qué ves y qué puedes hacer). Lenguaje llano, sin jerga.
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const STEPS = [
  {
    n: "1",
    title: "Measure",
    text: "NASA satellites and models measure every 11 km of land on Earth: heat, cold, rain, plants, brightness and steepness, plus air pressure, wind and dust.",
  },
  {
    n: "2",
    title: "Compare",
    text: "Each place gets a score against a planned base site on the Moon or Mars. 0 means nothing alike, 100 means a twin.",
  },
  {
    n: "3",
    title: "Rank",
    text: "Every place must pass three filters: 1 the shape of the land, 2 climate and air, 3 a team can get there. About 1.7 million places go in; 20 come out. We also show where each match breaks down.",
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="how-title" className="relative mx-auto w-full max-w-6xl px-5 py-24 md:py-32">
      <p className="font-mono text-xs uppercase tracking-[.16em] text-[var(--acc)]">How it works</p>
      <h2 id="how-title" className="mt-4 max-w-[22ch] text-[clamp(30px,4.5vw,56px)] font-medium leading-[1.04]">
        Astronauts train on Earth. We find the best places for it.
      </h2>
      <p className="mt-6 max-w-[60ch] text-[clamp(16px,1.5vw,19px)] text-[var(--mut)]">
        An <strong className="font-medium text-[var(--ink)]">analog</strong> is a place on Earth that looks and behaves like
        the Moon or Mars. Teams use analogs to test rovers, suits and drills before flying them. TerraVista searches the
        whole planet for them.
      </p>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            className="cut"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.12, ease }}
          >
            <div className="in p-6">
              <span aria-hidden className="font-mono text-[clamp(36px,4vw,52px)] leading-none text-[var(--acc)]">
                0{s.n}
              </span>
              <h3 className="mt-4 text-xl font-medium">
                <span className="sr-only">Step {s.n}: </span>
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--mut)]">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

// Cabecera de cada página interior: paso N de 5, título (h1) y una frase de qué hacer aquí.
export function PageIntro({ kicker, title, children }: { kicker?: string; step?: number; title: ReactNode; children: ReactNode }) {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 pt-16 md:pt-20">
      {kicker && <p className="font-mono text-xs uppercase tracking-[.16em] text-[var(--acc)]">{kicker}</p>}
      <h1 className="mt-4 max-w-[20ch] text-[clamp(34px,5.5vw,72px)] font-medium leading-[1.02] tracking-[-0.02em]">{title}</h1>
      <p className="mt-5 max-w-[56ch] text-[clamp(16px,1.5vw,19px)] text-[var(--mut)]">{children}</p>
    </header>
  );
}
