"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [look, setLook] = useState<"relief" | "imagery">("imagery");
  const loadEarth = useCallback(() => loadEarthTerrain(site.lat, site.lon), [site.lat, site.lon]);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null; // el foco vuelve aquí al cerrar
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeRef.current();
      // Atrapa el foco dentro del diálogo (Tab / Mayús+Tab)
      if (e.key !== "Tab" || !dialog.current) return;
      const f = dialog.current.querySelectorAll<HTMLElement>("button, input, [href], [tabindex]:not([tabindex='-1'])");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const pill = "min-h-[32px] px-1 underline";
  return createPortal(
    <div
      ref={dialog}
      className="fixed inset-0 z-[2000] flex flex-col bg-[rgba(4,8,15,.97)] backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer3d-title"
      aria-describedby="viewer3d-desc"
    >
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
        <div className="min-w-0">
          <p className="etq" data-n="3D">
            11 × 11 km in 3D · same scale
          </p>
          <h2 id="viewer3d-title" className="mt-1 truncate text-lg">
            {site.name} <span className="sr-only">compared with {target.name}</span>
          </h2>
          <p id="viewer3d-desc" className="sr-only">
            Left, the Earth candidate; right, the {target.short} site. Both show the same area with the same light. Their
            relief and slope are listed on each view.
          </p>
        </div>
        <button
          ref={closeBtn}
          onClick={onClose}
          className="btn-cut min-h-[var(--tap)] shrink-0 border border-[var(--line2)] px-3 font-mono text-xs uppercase tracking-[.08em] hover:text-[var(--acc)]"
        >
          Close <span aria-hidden>✕</span>
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
            look={look}
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
        {/* Cada <label> envuelve solo su deslizador; los botones van fuera para no entrar en su nombre accesible */}
        <div className="flex flex-col gap-1">
          <label className="flex flex-col gap-1">
            <span>
              Sun elevation: <b className="text-[var(--acc)]">{sun.toFixed(1)}°</b>
            </span>
            <input
              type="range"
              min={0.5}
              max={70}
              step={0.5}
              value={sun}
              aria-valuetext={`${sun.toFixed(1)} degrees`}
              onChange={(e) => setSun(+e.target.value)}
              className="accent-[var(--acc)]"
            />
          </label>
          <span className="flex gap-3">
            <button onClick={() => setSun(target.sunPresetDeg)} className={`${pill} text-[var(--acc)]`}>
              {target.short} sun ({target.sunPresetDeg}°)
            </button>
            <button onClick={() => setSun(45)} className={pill}>
              Midday (45°)
            </button>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex flex-col gap-1">
            <span>
              Vertical exaggeration: <b className="text-[var(--acc)]">×{ex}</b>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={ex}
              aria-valuetext={`times ${ex}`}
              onChange={(e) => setEx(+e.target.value)}
              className="accent-[var(--acc)]"
            />
          </label>
          <span className="flex gap-3" role="group" aria-label="Surface look">
            <button
              aria-pressed={look === "imagery"}
              onClick={() => setLook("imagery")}
              className={`${pill} ${look === "imagery" ? "text-[var(--acc)]" : ""}`}
            >
              Real imagery
            </button>
            <button
              aria-pressed={look === "relief"}
              onClick={() => setLook("relief")}
              className={`${pill} ${look === "relief" ? "text-[var(--acc)]" : ""}`}
            >
              Same grey (compare shapes)
            </button>
          </span>
          <span className="normal-case tracking-normal text-[var(--dim)]">Drag to rotate · pinch to zoom</span>
        </div>
      </footer>
    </div>,
    document.body,
  );
}
