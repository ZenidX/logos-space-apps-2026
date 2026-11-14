"use client";

import dynamic from "next/dynamic";
import { GLOBE_TEX, type GlobeBody } from "@/lib/globe-tex";
import type { GlobeMarker } from "@/components/Globe";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

// Skeleton page: real missions and analog sites arrive after the mission research.
// Target coordinates are approximate placeholders.
const MARKERS: Record<GlobeBody, GlobeMarker[]> = {
  earth: [],
  moon: [{ id: "mouton", lat: -84.99, lon: 36.7, label: "Mons Mouton (Artemis III region)", kind: "target" }],
  mars: [
    { id: "arcadia", lat: 40, lon: -160, label: "Arcadia Planitia", kind: "target" },
    { id: "jezero", lat: 18.45, lon: 77.45, label: "Jezero crater", kind: "target" },
  ],
};

export default function Home() {
  const bodies: GlobeBody[] = ["moon", "earth", "mars"];
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Logos · Mission Analogs</h1>
      <p className="mt-2 max-w-2xl text-[var(--mut)]">
        Where on Earth can we rehearse a specific Moon or Mars mission? Work in progress — NASA Space Apps Challenge 2026.
      </p>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {bodies.map((b) => (
          <figure key={b} className="flex flex-col">
            <div className="h-80 rounded-lg bg-black/30">
              <Globe body={b} markers={MARKERS[b]} />
            </div>
            <figcaption className="mt-1 text-xs text-[var(--mut)]">{GLOBE_TEX[b].credit}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
