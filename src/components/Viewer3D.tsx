"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { loadEarthTerrain, type TerrainData } from "@/lib/terrain";

const Terrain3D = dynamic(() => import("@/components/Terrain3D"), { ssr: false });

export interface ViewerSite {
  lat: number;
  lon: number;
  name: string;
}

export interface ViewerTarget {
  name: string;
  short: string;
  // Cargador del terreno del objetivo (Luna/Marte). null = aún no disponible.
  load: (() => Promise<TerrainData>) | null;
  sunPresetDeg: number;
}

const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;

export default function Viewer3D({ site, target, onClose }: { site: ViewerSite; target: ViewerTarget; onClose: () => void }) {
  const [sun, setSun] = useState(25);
  const [ex, setEx] = useState(1);
  const [look, setLook] = useState<"relief" | "imagery">("relief");
  const loadEarth = useCallback(() => loadEarthTerrain(site.lat, site.lon), [site.lat, site.lon]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex flex-col bg-[rgba(4,8,15,.97)] backdrop-blur" role="dialog" aria-modal="true">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
        <div className="min-w-0">
          <p className="etq" data-n="3D">
            11 × 11 km in 3D · same scale
          </p>
          <h2 className="mt-1 truncate text-lg">{site.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="btn-cut shrink-0 border border-[var(--line2)] px-3 py-2 font-mono text-xs uppercase tracking-[.08em] hover:text-[var(--acc)]"
        >
          Close ✕
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 p-3 md:grid-cols-2 md:grid-rows-1">
        <Terrain3D
          className="min-h-0"
          load={loadEarth}
          title={coord(site.lat, site.lon)}
          subtitle="Earth · candidate"
          sunElevationDeg={sun}
          exaggeration={ex}
          look={look}
        />
        {target.load ? (
          <Terrain3D
            className="min-h-0"
            load={target.load}
            title={target.name}
            subtitle="Target"
            sunElevationDeg={sun}
            exaggeration={ex}
          />
        ) : (
          <div className="cut min-h-0">
            <div className="in flex items-center justify-center p-6 text-center font-mono text-xs text-[var(--mut)]">
              3D terrain for {target.short}: elevation data pending.
            </div>
          </div>
        )}
      </div>

      <footer className="grid gap-3 border-t border-[var(--line)] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] font-mono text-[11px] uppercase tracking-[.06em] text-[var(--mut)] sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span>
            Sun elevation: <b className="text-[var(--acc)]">{sun.toFixed(1)}°</b>
          </span>
          <input type="range" min={0.5} max={70} step={0.5} value={sun} onChange={(e) => setSun(+e.target.value)} className="accent-[var(--acc)]" />
          <span className="flex gap-2">
            <button onClick={() => setSun(target.sunPresetDeg)} className="text-[var(--acc)] underline">
              {target.short} sun ({target.sunPresetDeg}°)
            </button>
            <button onClick={() => setSun(45)} className="underline">
              Midday (45°)
            </button>
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span>
            Vertical exaggeration: <b className="text-[var(--acc)]">×{ex}</b>
          </span>
          <input type="range" min={1} max={5} step={0.5} value={ex} onChange={(e) => setEx(+e.target.value)} className="accent-[var(--acc)]" />
          <span className="flex gap-2">
            <button onClick={() => setLook("relief")} className={look === "relief" ? "text-[var(--acc)] underline" : "underline"}>
              Same material (compare shapes)
            </button>
            <button onClick={() => setLook("imagery")} className={look === "imagery" ? "text-[var(--acc)] underline" : "underline"}>
              Earth satellite photo
            </button>
          </span>
          <span className="normal-case tracking-normal text-[var(--dim)]">Drag to rotate · pinch to zoom</span>
        </label>
      </footer>
    </div>,
    document.body,
  );
}
