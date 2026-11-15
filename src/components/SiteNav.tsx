"use client";

// Navegación común a todas las páginas: marca, enlaces numerados e indicador animado de la página activa.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export const PAGES = [
  { href: "/", label: "Missions" }, // portada: la app de misiones (antes SpaceApp-Logos), con su propio layout
  { href: "/story/", label: "Story" },
  { href: "/discover/", label: "Discover" },
  { href: "/3d/", label: "3D" },
  { href: "/base/", label: "Base" },
  { href: "/method/", label: "Method" },
  { href: "/data/", label: "Data" },
] as const;

const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export default function SiteNav() {
  const path = norm(usePathname() || "/");
  return (
    <header className="fixed inset-x-0 top-0 z-[1000] border-b border-[var(--line)] bg-[rgba(4,8,15,.78)] backdrop-blur-md">
      <nav aria-label="Pages" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-1.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="TerraVista, home">
          <i className="relative inline-block h-4 w-4 rotate-45 border border-[var(--acc)]">
            <span className="absolute inset-[3px] bg-[var(--acc)]" />
          </i>
          <span className="font-[family-name:var(--font-grotesk)] text-xl font-semibold leading-none">
            Terra<span className="text-[var(--acc)]">Vista</span>
          </span>
        </Link>
        <ul className="-mr-2 flex items-center gap-1 overflow-x-auto font-mono text-[11px] uppercase tracking-[.08em] [scrollbar-width:none]">
          {PAGES.map((p, i) => {
            const on = path === norm(p.href);
            return (
              <li key={p.href} className="relative">
                <Link
                  href={p.href}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex min-h-[var(--tap)] items-center whitespace-nowrap px-2.5 transition-colors ${on ? "text-[var(--acc)]" : "text-[var(--mut)] hover:text-[var(--ink)]"}`}
                >
                  <span className="mr-1 hidden text-[var(--dim)] sm:inline">0{i + 1}</span>
                  {p.label}
                  {on && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-[7px] h-[2px] bg-[var(--acc)]"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

// Enlace grande a la siguiente página, al final de cada página.
export function NextPage({ href, label, kicker = "Next" }: { href: string; label: string; kicker?: string }) {
  const reduce = useReducedMotion();
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28 pt-6">
      <Link href={href} className="group flex items-end justify-between gap-6 border-t border-[var(--line2)] pt-8">
        <span>
          <span className="block font-mono text-[11px] uppercase tracking-[.16em] text-[var(--dim)]">{kicker}</span>
          <span className="mt-2 block text-[clamp(32px,5vw,64px)] font-medium leading-none transition-colors group-hover:text-[var(--acc)]">
            {label}
          </span>
        </span>
        <motion.span
          className="font-mono text-[clamp(28px,4vw,48px)] text-[var(--acc)]"
          aria-hidden
          animate={reduce ? undefined : { x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          →
        </motion.span>
      </Link>
    </section>
  );
}
