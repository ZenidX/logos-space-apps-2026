"use client";

// Transición suave al cambiar de página (Next.js monta template.tsx de nuevo en cada navegación).
// Solo opacidad: un transform/filter aquí rompería los elementos position:fixed de las páginas.
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}
