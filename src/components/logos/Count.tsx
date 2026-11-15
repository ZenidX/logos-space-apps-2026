"use client";
// AI-assisted (Claude), reviewed by team Logos
import { useEffect, useRef, useState } from "react";

/** Number that counts up to its value when it appears (instant with reduced motion). */
export default function Count({ value, decimals = 2, ms = 700, cap }: { value: number | null; decimals?: number; ms?: number; cap?: number }) {
  const [shown, setShown] = useState<number | null>(value);
  const raf = useRef(0);
  useEffect(() => {
    if (value === null) { setShown(null); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      setShown(value * e);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, ms]);
  if (cap !== undefined && shown !== null && value !== null && value >= cap && shown >= cap - 1e-9) return <span className="tabular-nums">≥ {cap.toFixed(decimals)}</span>;
  return <span className="tabular-nums">{shown === null ? "–" : Math.min(shown, cap ?? Infinity).toFixed(decimals)}</span>;
}
