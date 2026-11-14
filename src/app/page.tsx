"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import DataTab from "@/components/DataTab";
import AnalysisTab from "@/components/AnalysisTab";
import CandidatesTab from "@/components/CandidatesTab";
import { SITES } from "@/data/catalog";
import type { Body } from "@/components/TileMap";

const TileMap = dynamic(() => import("@/components/TileMap"), { ssr: false });

const TARGET_MARKERS: Record<Body, { lat: number; lon: number; label: string; highlight?: boolean }[]> = {
  earth: SITES.map((s) => ({ lat: s.lat, lon: s.lon, label: s.name, highlight: s.known })),
  moon: [{ lat: -89.5, lon: 0, label: "Borde de Shackleton (polo sur)", highlight: true }],
  mars: [
    { lat: 18.4, lon: 77.5, label: "Cráter Jezero", highlight: true },
    { lat: 40, lon: -160, label: "Arcadia Planitia (hielo)", highlight: true },
  ],
};

const BODY_LABEL: Record<Body, string> = { earth: "🌍 Tierra", moon: "🌕 Luna", mars: "🔴 Marte" };

type Tab = "candidatos" | "analisis" | "datos" | "mapas";

export default function Home() {
  const [tab, setTab] = useState<Tab>("candidatos");
  const [body, setBody] = useState<Body>("earth");

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="sticky top-0 z-[1000] border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-black tracking-tight">
          Terra <span className="text-orange-400">Analog</span>
        </h1>
        <p className="text-xs text-slate-400">Encontrar la Luna y Marte en la Tierra · NASA Space Apps 2026</p>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        {tab === "candidatos" && <CandidatesTab />}
        {tab === "analisis" && <AnalysisTab />}
        {tab === "datos" && <DataTab />}
        {tab === "mapas" && (
          <div className="flex h-[calc(100dvh-11rem)] flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(BODY_LABEL) as Body[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBody(b)}
                  className={`rounded-xl py-2 text-sm font-semibold ${
                    body === b ? "bg-orange-500 text-black" : "bg-white/10"
                  }`}
                >
                  {BODY_LABEL[b]}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <TileMap key={body} body={body} markers={TARGET_MARKERS[body]} />
            </div>
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {(
            [
              ["candidatos", "🎯", "Candidatos"],
              ["analisis", "🔬", "Análisis"],
              ["datos", "📊", "Datos"],
              ["mapas", "🗺️", "Mapas"],
            ] as const
          ).map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center py-3 text-xs ${tab === id ? "text-orange-400" : "text-slate-400"}`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
