"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  tl?: ReactNode;
  tr?: ReactNode;
  bl?: ReactNode;
  br?: ReactNode;
  glitchKey?: string | number; // al cambiar, dispara el glitch
  className?: string;
  reticle?: boolean;
}

// Marco de instrumento estilo «Consola»: escuadras, viñeta, retícula y textos HUD en las esquinas.
export default function Visor({ children, tl, tr, bl, br, glitchKey, className = "", reticle = true }: Props) {
  const [glitch, setGlitch] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 400);
    return () => clearTimeout(t);
  }, [glitchKey]);

  return (
    <div className={`visor ${glitch ? "glitch" : ""} ${className}`}>
      <div className={`absolute inset-0 ${glitch ? "glitch" : ""}`}>{children}</div>
      <div className="vineta" />
      <div className="marco" />
      {reticle && <div className="reticula" />}
      <div className="ruido" />
      {tl && <div className="hud tl">{tl}</div>}
      {tr && <div className="hud tr">{tr}</div>}
      {bl && <div className="hud bl">{bl}</div>}
      {br && <div className="hud br">{br}</div>}
    </div>
  );
}
