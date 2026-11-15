"use client";

// Navegación común a todas las páginas: marca, enlaces numerados e indicador animado de la página activa.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { asset } from "@/lib/logos/asset";

export const PAGES = [
  { href: "/", label: "Missions" }, // portada: la app de misiones (antes SpaceApp-Logos), con su propio layout
  { href: "/base/", label: "Plan a base" },
  { href: "/appendix/", label: "Appendix" }, // prototipo anterior: Story, Discover, 3D, Method, Data
] as const;

const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export default function SiteNav() {
  const path = norm(usePathname() || "/");
  return (
    <header className="fixed inset-x-0 top-0 z-[1000] bg-[var(--bg)] pb-2 md:bg-[linear-gradient(rgba(4,6,12,.92),rgba(4,6,12,.55)_70%,transparent)] md:pb-3">
      <nav aria-label="Pages" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-3 md:px-5">
        {/* Igual que la cabecera de la portada (Logos): símbolo + «Terra Vista» */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[16px] font-semibold" aria-label="Terra Vista, home">
          <span aria-hidden className="inline-block h-[26px] w-[26px] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${asset("/logo-symbol.svg")})` }} />
          <span className="hidden sm:inline">Terra Vista</span>
        </Link>
        <ul className="-mr-1 flex items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none]">
          {PAGES.map((p) => {
            const on = p.href === "/appendix/" ? path.startsWith("/appendix/") : path === norm(p.href);
            return (
              <li key={p.href} className="shrink-0">
                <Link
                  href={p.href}
                  aria-current={on ? "page" : undefined}
                  className={`glass-tab !min-h-[36px] !px-3.5 text-[13.5px] ${on ? "" : "text-[var(--ink)]"}`}
                >
                  {p.label}
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
