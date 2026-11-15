"use client";

import { useEffect, useState } from "react";
import DataTab from "@/components/DataTab";
import AnalysisTab from "@/components/AnalysisTab";
import CandidatesTab from "@/components/CandidatesTab";
import GlobeView from "@/components/GlobeView";
import { SITES } from "@/data/catalog";
import type { Body } from "@/components/TileMap";


const TARGET_MARKERS: Record<Body, { lat: number; lon: number; label: string; highlight?: boolean }[]> = {
  earth: SITES.map((s) => ({ lat: s.lat, lon: s.lon, label: s.name, highlight: s.known })),
  moon: [{ lat: -89.5, lon: 0, label: "Shackleton rim (south pole)", highlight: true }],
  mars: [
    { lat: 18.4, lon: 77.5, label: "Jezero crater", highlight: true },
    { lat: 40, lon: -160, label: "Arcadia Planitia (ice)", highlight: true },
  ],
};

const BODY_LABEL: Record<Body, string> = { earth: "Earth", moon: "Moon", mars: "Mars" };

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

// Página /data: las pestañas técnicas (antes, el modo «explore» de la portada).
export default function DataExplorer() {
  const [tab, setTab] = useState<Tab>("candidatos");
  const [body, setBody] = useState<Body>("earth");
  const idx = TABS.findIndex(([id]) => id === tab);
  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="border-b border-[var(--line)] px-4 pb-3 pt-20">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-medium leading-none">Explore the data</h1>
          <div className="text-right font-mono text-[10px] uppercase leading-tight tracking-[.08em] text-[var(--mut)]">
            <span className="vivo text-[var(--ok)]">EE · ONLINE</span>
            <br />
            <Clock />
          </div>
        </div>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[.12em] text-[var(--dim)]">
          Step 5 of 5 · NASA Space Apps 2026 · Team Logos
        </p>
        <p className="mt-3 text-[15px] text-[var(--mut)]">
          The full ranking, the score of each variable and the NASA datasets behind them. This page is for checking our work.
        </p>
      </header>

      <div key={tab} className="entra flex-1 px-4 py-5 pb-28">
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
            <GlobeView
              body={body}
              className="flex-1"
              markers={TARGET_MARKERS[body].map((m, i) => ({ id: `t${i}`, lat: m.lat, lon: m.lon, label: m.label, kind: "target" as const }))}
              tileMarkers={TARGET_MARKERS[body]}
              tl={
                <>
                  <span className="k">Body</span>
                  <br />
                  {BODY_LABEL[body]}
                </>
              }
            />
          </div>
        )}
      </div>

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
