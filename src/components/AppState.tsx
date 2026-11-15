"use client";

// Estado compartido entre páginas: el destino elegido y el peso ciencia ↔ logística se mantienen al navegar.
import { createContext, useContext, useState, type ReactNode } from "react";

interface AppState {
  targetId: string;
  setTargetId: (id: string) => void;
  w: number; // peso de la accesibilidad; 1/3 = la nota oficial
  setW: (w: number) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [targetId, setTargetId] = useState("shackleton");
  const [w, setW] = useState(1 / 3);
  return <Ctx.Provider value={{ targetId, setTargetId, w, setW }}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAppState fuera de AppStateProvider");
  return c;
}
