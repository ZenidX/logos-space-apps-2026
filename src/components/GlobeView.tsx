"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Visor from "@/components/Visor";
import { GLOBE_TEX, type GlobeBody } from "@/lib/globe-tex";
import type { GlobeMarker } from "@/components/Globe";
import type { Body } from "@/components/TileMap";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const TileMap = dynamic(() => import("@/components/TileMap"), { ssr: false });

export interface TileMarker {
  lat: number;
  lon: number;
  label: string;
  highlight?: boolean;
}

interface Props {
  body: GlobeBody & Body;
  markers: GlobeMarker[];
  tileMarkers: TileMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  tl?: React.ReactNode;
  tr?: React.ReactNode;
  bl?: React.ReactNode;
}

// Globo 3D girable con reserva automática al mapa 2D (sin WebGL o si falla la textura) y botón manual.
export default function GlobeView({ body, markers, tileMarkers, selectedId, onSelect, className = "h-[22rem]", tl, tr, bl }: Props) {
  const [failed, setFailed] = useState(false);
  const [flat, setFlat] = useState(false);
  const show2d = failed || flat;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Visor
        className="globo min-h-0 flex-1"
        glitchKey={body}
        reticle={false}
        tl={tl}
        tr={tr}
        bl={bl}
        br={<span className="k">{show2d ? "2D map (fallback)" : GLOBE_TEX[body].credit}</span>}
      >
        {show2d ? (
          <TileMap key={body} body={body} markers={tileMarkers} />
        ) : (
          <Globe key={body} body={body} markers={markers} selectedId={selectedId} onSelect={onSelect} onError={() => setFailed(true)} />
        )}
      </Visor>
      {!failed && (
        <button
          type="button"
          onClick={() => setFlat((f) => !f)}
          className="font-mono text-[11px] uppercase tracking-[.08em] text-[var(--acc2-t)] underline underline-offset-2"
        >
          {flat ? "Show 3D globe" : "Show 2D map · tap a point for details"}
        </button>
      )}
    </div>
  );
}
