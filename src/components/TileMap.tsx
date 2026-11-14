"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type Body = "earth" | "moon" | "mars";

interface LayerDef {
  url: string;
  attribution: string;
  maxNativeZoom: number;
  crs: "3857" | "4326";
}

// Teselas públicas de NASA (sin login): GIBS para la Tierra, Trek para Luna y Marte.
export const BASEMAPS: Record<Body, LayerDef> = {
  earth: {
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
    attribution: "NASA GIBS · Blue Marble",
    maxNativeZoom: 8,
    crs: "3857",
  },
  moon: {
    url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
    attribution: "NASA Moon Trek · LRO WAC",
    maxNativeZoom: 7,
    crs: "4326",
  },
  mars: {
    url: "https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
    attribution: "NASA Mars Trek · MGS MOLA",
    maxNativeZoom: 6,
    crs: "4326",
  },
};

export interface Marker {
  lat: number;
  lon: number;
  label: string;
  highlight?: boolean;
}

export default function TileMap({ body, markers = [] }: { body: Body; markers?: Marker[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const def = BASEMAPS[body];
    const map = L.map(ref.current, {
      crs: def.crs === "4326" ? L.CRS.EPSG4326 : L.CRS.EPSG3857,
      center: [0, 0],
      zoom: def.crs === "4326" ? 1 : 1,
      minZoom: def.crs === "4326" ? 0 : 1,
      maxZoom: 10,
      worldCopyJump: true,
      attributionControl: true,
      zoomControl: false,
    });
    L.tileLayer(def.url, {
      attribution: def.attribution,
      maxNativeZoom: def.maxNativeZoom,
      noWrap: def.crs === "4326",
    }).addTo(map);

    for (const m of markers) {
      L.circleMarker([m.lat, m.lon], {
        radius: m.highlight ? 8 : 6,
        color: m.highlight ? "#ffb547" : "#5ee6ff",
        weight: 2,
        fillOpacity: 0.7,
      })
        .bindTooltip(m.label)
        .addTo(map);
    }
    if (markers.length > 1) {
      map.fitBounds(
        L.latLngBounds(markers.map((m) => [m.lat, m.lon] as [number, number])),
        { padding: [30, 30], maxZoom: 3 },
      );
    }
    return () => {
      map.remove();
    };
  }, [body, markers]);

  return <div ref={ref} className="h-full w-full bg-[var(--bg2)]" />;
}
