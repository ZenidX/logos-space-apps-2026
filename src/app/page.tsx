"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DataTab from "@/components/DataTab";
import AnalysisTab from "@/components/AnalysisTab";
import CandidatesTab from "@/components/CandidatesTab";
import Visor from "@/components/Visor";
import { SITES } from "@/data/catalog";
import type { Body } from "@/components/TileMap";

const TileMap = dynamic(() => import("@/components/TileMap"), { ssr: false });

const TARGET_MARKERS: Record<Body, { lat: number; lon: number; label: string; highlight?: boolean }[]> = {
  earth: SITES.map((s) => ({ lat: s.lat, lon: s.lon, label: s.name, highlight: s.known })),
  moon: [{ lat: -89.5, lon: 0, label: "Shackleton rim (south pole)", highlight: true }],
  mars: [
    { lat: 18.4, lon: 77.5, label: "Jezero crater", highlight: true },
    { lat: 40, lon: -160, label: "Arcadia Planitia (ice)", highlight: true },
  ],
};

const BODY_LABEL: Record<Body, string> = { earth: "Earth", moon: "Moon", mars: "Mars" };
const BODY_SRC: Record<Body, string> = { earth: "NASA GIBS · BLUE MARBLE", moon: "MOON TREK · LRO WAC", mars: "MARS TREK · MGS MOLA" };

const TABS = [
  ["candidatos", "Candidates"],
  ["analisis", "Analysis"],
  ["datos", "Data"],
  ["mapas", "Maps"],
] as const;
type Tab = (typeof TABS)[number][0];

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toISOString().slice(11, 19) + "Z");
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("candidatos");
  const [body, setBody] = useState<Body>("earth");
  const idx = TABS.findIndex(([id]) => id === tab);

  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-[1000] border-b border-[var(--line)] bg-[rgba(4,8,15,.82)] px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <i className="relative inline-block h-4 w-4 rotate-45 border border-[var(--acc)]">
              <span className="absolute inset-[3px] bg-[var(--acc)]" />
            </i>
            <h1 className="text-xl font-semibold leading-none">
              Terra <span className="text-[var(--acc)]">Analog</span>
            </h1>
          </div>
          <div className="text-right font-mono text-[10px] uppercase leading-tight tracking-[.08em] text-[var(--mut)]">
            <span className="vivo text-[var(--ok)]">EE · ONLINE</span>
            <br />
            <Clock />
          </div>
        </div>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[.12em] text-[var(--dim)]">
          NASA Space Apps 2026 · Team Logos · Barcelona 41.39N 2.17E
        </p>
      </header>

      <main key={tab} className="entra flex-1 px-4 py-5 pb-28">
        {tab === "candidatos" && <CandidatesTab />}
        {tab === "analisis" && <AnalysisTab />}
        {tab === "datos" && <DataTab />}
        {tab === "mapas" && (
          <div className="flex h-[calc(100dvh-13rem)] flex-col gap-3">
            <p className="etq" data-n="04">
              Planetary maps
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(BODY_LABEL) as Body[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBody(b)}
                  className={`btn-cut border py-2 font-mono text-xs uppercase tracking-[.08em] transition-colors ${
                    body === b
                      ? "border-[var(--acc)] bg-[var(--acc)] text-[var(--bg)]"
                      : "border-[var(--line2)] text-[var(--ink)] hover:text-[var(--acc)]"
                  }`}
                >
                  {BODY_LABEL[b]}
                </button>
              ))}
            </div>
            <Visor
              className="flex-1"
              glitchKey={body}
              reticle={false}
              tl={
                <>
                  <span className="k">Body</span>
                  <br />
                  {BODY_LABEL[body]}
                </>
              }
              br={<span className="k">{BODY_SRC[body]}</span>}
            >
              <TileMap key={body} body={body} markers={TARGET_MARKERS[body]} />
            </Visor>
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-[var(--line)] bg-[rgba(4,8,15,.92)] backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1.5 px-4 pt-0 pb-[max(env(safe-area-inset-bottom),10px)]">
          {TABS.map(([id, label], i) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`border-t-2 pt-2 text-left font-mono text-[10px] uppercase tracking-[.08em] transition-colors ${
                tab === id
                  ? "border-[var(--acc)] text-[var(--acc)]"
                  : i < idx
                    ? "border-[var(--line2)] text-[var(--mut)]"
                    : "border-[var(--line)] text-[var(--dim)]"
              }`}
            >
              <b className="block font-medium">0{i + 1}</b>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
