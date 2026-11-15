"use client";
// AI-assisted (Claude), reviewed by team Logos
// Small "where is it" map: a crop of the same NASA global mosaic used on the globes, centred on the point,
// with a marker. Regional scale: the 11 × 11 km terrain area is smaller than one pixel here, so it is drawn as a dot.
import { useEffect, useRef, useState } from "react";
import { GLOBE_TEX, type GlobeBody } from "@/lib/logos/globe-tex";

const W = 132, H = 74;

/** Source window (degrees) centred on the point; wider near the poles, clamped to the map's latitude range. */
export function windowFor(lat: number, lon: number) {
  const polar = Math.abs(lat) > 65, spanLat = polar ? 50 : 36, spanLon = (spanLat * W) / H * (polar ? 2 : 1);
  const top = Math.min(90, Math.max(-90 + spanLat, lat + spanLat / 2));
  return { lon0: lon - spanLon / 2, top, spanLon, spanLat, x: 0.5, y: (top - lat) / spanLat };
}

export default function LocatorMap({ body, lat, lon, color, label }: { body: GlobeBody; lat: number; lon: number; color: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const ctx = cv.getContext("2d");
      if (!ctx) { setOk(false); return; }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      const w = windowFor(lat, lon), iw = img.naturalWidth, ih = img.naturalHeight;
      const sw = (w.spanLon / 360) * iw, sh = (w.spanLat / 180) * ih, sy = ((90 - w.top) / 180) * ih;
      let sx = (((w.lon0 + 180) / 360) * iw) % iw; if (sx < 0) sx += iw;
      const first = Math.min(sw, iw - sx);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, first, sh, 0, 0, (first / sw) * cv.width, cv.height);
      if (first < sw) ctx.drawImage(img, 0, sy, sw - first, sh, (first / sw) * cv.width, 0, ((sw - first) / sw) * cv.width, cv.height); // wrap across the date line
      const px = w.x * cv.width, py = w.y * cv.height;
      ctx.lineWidth = 1.5 * dpr; ctx.strokeStyle = "rgba(4,6,12,.9)"; ctx.beginPath(); ctx.arc(px, py, 8.5 * dpr, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 7 * dpr, 0, 7); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 3 * dpr, 0, 7); ctx.fill();
    };
    img.onerror = () => { if (!cancelled) setOk(false); };
    img.src = GLOBE_TEX[body].hi;
    return () => { cancelled = true; };
  }, [body, lat, lon, color]);
  if (!ok) return null;
  const w = windowFor(lat, lon), km = body === "earth" ? 111.2 : body === "mars" ? 59.3 : 30.3; // km per degree of latitude
  return (
    <figure className="pointer-events-none overflow-hidden rounded-lg border border-[var(--line2)] bg-[var(--bg)]" style={{ width: W }}>
      <canvas ref={ref} style={{ width: W, height: H, display: "block" }} role="img" aria-label={`Locator map: ${label} at ${lat.toFixed(1)}°, ${lon.toFixed(1)}°`} />
      <figcaption className="mono px-1.5 py-1 text-[9.5px] leading-tight text-[var(--mut)]">{lat.toFixed(1)}°, {lon.toFixed(1)}° · map ≈ {Math.round((w.spanLat * km) / 100) * 100} km tall</figcaption>
    </figure>
  );
}
