// Apéndice: la primera versión de la web (búsqueda global con Earth Engine), antes de que la app de misiones
// (zexuguo/SpaceApp-Logos) pasara a ser la portada. Se conserva como material de consulta.
import Link from "next/link";
import { PageIntro } from "@/components/HowItWorks";
import { NextPage } from "@/components/SiteNav";

const PAGES = [
  ["/appendix/story/", "A1 · Story", "The first home page: what an analog is, the Moon-to-Earth scene and the problem."],
  ["/appendix/discover/", "A2 · Discover", "Global search on Google Earth Engine: Earth candidates for Shackleton, Jezero and Arcadia, with a science ↔ logistics slider."],
  ["/appendix/3d/", "A3 · 3D", "11 × 11 km of terrain, an Earth candidate next to the Moon or Mars target, same scale and light."],
  ["/appendix/method/", "A4 · Method", "Validation against 25 known analogs, limits and sources of that search."],
  ["/appendix/data/", "A5 · Data", "Every Earth Engine layer, the scoring tabs and maps."],
] as const;

export default function AppendixPage() {
  return (
    <div className="pt-12">
      <PageIntro kicker="Appendix · Earlier prototype" title="How we started.">
        Before the mission app on the home page, Terra Vista was a global search: every 0.1° of Earth&apos;s land scored against three
        Moon and Mars targets with NASA data in Google Earth Engine. Its pages are kept here for reference; its data still feeds the
        Earth rehearsal sites in Plan a base.
      </PageIntro>
      <ul className="mx-auto mt-10 grid w-full max-w-6xl gap-3 px-5 sm:grid-cols-2">
        {PAGES.map(([href, title, text]) => (
          <li key={href}>
            <Link href={href} className="block h-full rounded-2xl border border-[var(--line)] bg-[var(--bg2)] p-5 transition-colors hover:border-[var(--acc)]">
              <span className="block text-lg font-semibold text-[var(--ink)]">{title}</span>
              <span className="mt-1 block text-sm text-[var(--mut)]">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <NextPage href="/" label="Back to the missions" />
    </div>
  );
}
