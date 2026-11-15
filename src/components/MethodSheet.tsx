// AI-assisted (Claude), reviewed by team Logos
import type { KeyboardEvent } from "react";
import { DATA_DATE, DATA_VERSION, EVIDENCE, EVIDENCE_ORDER, FILTERS, MISSIONS, REMOVED } from "@/lib/missions";
import EvidenceBadge from "@/components/Evidence";

const REPO = "https://github.com/zexuguo/SpaceApp-Logos/blob/main/";
/** A file of the public repository, as a link. */
const Doc = ({ path }: { path: string }) => <a className="underline" href={REPO + path} target="_blank" rel="noopener noreferrer">{path}</a>;

export default function MethodSheet({ onClose }: { onClose: () => void }) {
  const accessSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.access.sources))));
  const varSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.vars.map((v) => v.source))))).filter((v) => v && v !== "no data");
  const targets = MISSIONS.filter((m, i) => MISSIONS.findIndex((x) => x.target.name === m.target.name) === i); // two missions share Mons Mouton
  const count = (e: (typeof EVIDENCE_ORDER)[number]) => MISSIONS.reduce((n, m) => n + m.sites.filter((s) => s.evidence === e).length, 0);
  // Keyboard: Tab stays inside the sheet while it is open.
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const f = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a[href], button")), first = f[0], last = f[f.length - 1];
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Method and sources" onClick={onClose} onKeyDown={trap}>
      <div className="glass fade-in h-full w-full max-w-[600px] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="display text-[30px]">Method & sources</h2><button onClick={onClose} className="chip" autoFocus>Close ✕</button></div>

        <h3 className="label mt-6">1 · Start from real missions</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">We did not ask “which place looks like the Moon?”. We listed real analog field campaigns run by NASA, ESA and the Mars Society, read which task each one rehearsed, and turned each task into a few surface conditions that open global data can measure.</p>

        <h3 className="label mt-6">2 · Analog index (0–1), condition by condition</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each condition has an ideal range in physical units. A condition&apos;s similarity is 1 inside the range and falls off smoothly outside it (Gaussian with a tolerance); it counts as <b>met</b> when the similarity is at least 0.5. Then, for every 0.1° land cell on Earth:</p>
        <pre className="mono mt-2 overflow-x-auto rounded-lg border border-[var(--line)] p-2 text-[12px]">F = conditions met / conditions available{"\n"}D = mean |percentile here − median percentile of known analogs| / 100{"\n"}index = 0.5 · F + 0.5 · (1 − D)</pre>
        <p className="mt-2 text-[13px] text-[var(--mut)]">F says <i>whether</i> a place meets the mission&apos;s conditions; D says how close it sits, in Earth&apos;s own distribution, to where agencies actually ran the mission. F and D are plain (unweighted) means over the conditions; the “coverage weight” stored with each condition in the data file is only used for the minimum data coverage (at least 66 %). The low-Sun mission has no campaign site to compare with, so there the index is the plain mean of the condition similarities, without D. It is a ranking index built from our team&apos;s choices (ranges, 0.5 threshold, 50/50 mix), not a probability. D favours places similar to the known analogs, and percentiles are relative to Earth, so D says nothing absolute about the Moon or Mars — the target-based ranges in F do that.</p>

        <h3 className="label mt-6">3 · Validation: does it find where agencies really went?</h3>
        <ul className="mt-2 grid gap-2 text-[13px]">
          {MISSIONS.map((m) => <li key={m.id} className="rounded-lg border border-[var(--line)] p-2"><b>{m.short}</b><span className="text-[var(--mut)]"> — {m.validation.result}</span></li>)}
        </ul>
        <p className="mt-2 text-[12.5px] text-[var(--dim)]">Negative control (central Amazonia), percentile among land cells: {MISSIONS.map((m) => `${m.short} ${m.validation.controlPercentile ?? "–"}`).join(" · ")}. Partly circular: the known analogs also set the median used in D, so their high rank is partly by construction; the independent checks are the condition fraction F and the control. Few known sites per mission (two for ground ice). The low-Sun mission is computed, not validated: its control and its one known analog are sanity checks only. This is a screening hypothesis: independent field validation is still needed.</p>

        <h3 className="label mt-6">4 · New regions to investigate</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Contiguous high-scoring cells grouped into regions, at least 300 km from every known analog. Only cells meeting every available condition are eligible (missing variables are skipped, with at least 66 % of the total condition weight required); regions under 4 cells dropped; each represented by its best cell and picked at least 800 km apart. They are regions to investigate, not surveyed sites. Because they are picked from the top of the index, they score above the known analogs and within a few thousandths of each other: read them as a shortlist, not a ranking. The index compares surface conditions; it is not a measure of suitability. An independent check against literature and agency sources found no source naming any of these points as an established analog; the property is confirmed nearby for {count("nearby")} of them{count("unchecked") > 0 && `, ${count("unchecked")} have not been checked yet`}, and each site says what was found (How tab; <Doc path="docs/independent-check.md" /> and <Doc path="docs/independent-check-v8.md" />).</p>
        <p className="mt-2 text-[13px] text-[var(--mut)]"><b className="text-[var(--ink)]">Removed after the terrain and land-cover screen (elevation and satellite data, no fieldwork) or after the independent check</b> (11 × 11 km window: mean slope above 10°, more than 10 % snow or ice, or more than 20 % water; the low-Sun mission also needs at least 50 % bare ground, moss or lichen; Copernicus DEM and ESA WorldCover 2021, CC BY 4.0; every candidate tried is logged in <Doc path="docs/region-screening.json" />): {Object.values(REMOVED).map((r) => `${r.name} — ${r.reason}`).join("; ")}. Key limits: suited EVA — volcanic rock within ~80 km, not confirmed basalt; ground ice — inferred from temperature, not detected.</p>

        <h3 className="label mt-6">5 · Where the analogy breaks</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each site lists what was not scored and what Earth cannot reproduce (gravity, vacuum or thin air, lighting, cold). In the scene, the overview shows the Sun with the Earth and Mars on their orbits (radii 1 : 1.52 and periods 1 : 1.88, in proportion; NASA NSSDC fact sheets) and the Moon around the Earth; body sizes against the orbits, the Sun and the Moon’s distance are not in proportion. In the close-up the target world is shown beside the Earth for comparison, not at its real distance; each visible site is joined to its name by a thin dashed line, and no line is drawn to the target world.</p>

        <h3 className="label mt-6">6 · Access complexity (neutral)</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">A relative 0–1 score of how much coordination an external field team may need: governance perception 40 %, nearby recorded organised-violence events 35 %, travel advice from two governments (US, UK) 25 %, plus an Antarctic Treaty flag. Protected areas are not mapped: check national park and research permits before fieldwork. Weights and levels (Low &lt; 0.25 ≤ Medium &lt; 0.5 ≤ High) are our team&apos;s choice. Floor: when an official travel advisory is at its highest level (US level 4 of 4, or UK advice against all travel to the whole country) the level is at least High, whatever the score. Special entry or research permits are not captured by the score. Where an official page states one (Tibet entry permit, research licences in Nunavut and the Northwest Territories) the site quotes it with its source; where we only suspect one, the site says “may apply; not checked”. Antarctica is not scored (Antarctic Treaty). Not travel advice and not a judgement of any country. Boundaries are de facto and imply no position on sovereignty.</p>

        <h3 className="label mt-6">7 · Evidence levels, filters and hardware</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each mission&apos;s list is ordered by independent evidence, not by the index, because the index does not tell the new regions apart. No source names any new region as an established analog; the levels say what was found:</p>
        <ul className="mt-2 grid gap-1.5 text-[13px] text-[var(--mut)]">
          {EVIDENCE_ORDER.filter((e) => count(e) > 0).map((e) => <li key={e} className="grid grid-cols-[150px_1fr] items-baseline gap-2"><EvidenceBadge level={e} /><span>{e === "nearby" ? "A source confirms the key property, or analog use, within about 100 km or for the island or lava field the point lies on." : e === "partial" ? "The source is farther away, regional in scale, or covers only part of the property." : EVIDENCE[e].note.replace(/^New region: /, "").replace(/^./, (c) => c.toUpperCase())} <span className="text-[var(--dim)]">({count(e)} sites)</span></span></li>)}
        </ul>
        <p className="mt-2 text-[13px] text-[var(--mut)]"><b className="text-[var(--ink)]">Filters</b> (thresholds chosen by the team; none is part of the index). “Reachable in &lt; {FILTERS.reachH} h” and “Remote &gt; {FILTERS.remoteH} h” use the modelled travel time to the nearest city (Weiss et al. 2018, year 2015; mean of the 0.1° cell; no data for Antarctica). Remote is offered as a choice because isolation is itself part of some analog missions (for example NEEMO, under “Next missions”). “Flat” and “Steep” split the sites at a mean slope of {FILTERS.flatDeg}° over the 11 × 11 km window (115 m grid). “Low access complexity” keeps sites with access level Low and no special permit noted.</p>
        <p className="mt-2 text-[13px] text-[var(--mut)]"><b className="text-[var(--ink)]">Hardware rehearsed.</b> Each item is taken from the agency page or report linked next to it (checks in <Doc path="docs/sources.md" />, rows C3, C6, C7, C8a, C10, C12a and L15–L17). Equipment that was only announced or planned is left out.</p>

        <h3 className="label mt-6">Mission campaigns</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {MISSIONS.flatMap((m) => m.campaigns).map((c) => <li key={c.name}>• <a className="underline" href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></li>)}
        </ul>
        <h3 className="label mt-6">Targets</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {targets.map((m) => <li key={m.id}>• {m.target.name}: shown at {Math.abs(m.target.lat).toFixed(1)}° {m.target.lat < 0 ? "S" : "N"}, {Math.abs(m.target.lon).toFixed(1)}° {m.target.lon < 0 ? "W" : "E"}. {m.target.coordSource}. {m.target.body === "moon" ? "Albedo 0.15 is an estimate: broadband ≈ 0.49 × LOLA 1064 nm normal albedo (Hayne et al. 2017; Lucey et al. 2014)." : "Surface values from published maps and models (MGS TES albedo, Christensen et al. 2001; Mars Climate Database for temperature)."} Target values informed the ideal ranges and are shown for context. Details in <Doc path="docs/sources.md" />.</li>)}
        </ul>
        <h3 className="label mt-6">Earth data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{varSources.map((v) => <li key={v}>• {v}</li>)}<li>• Sand fraction: ISRIC SoilGrids 2.0 (CC BY 4.0), model prediction.</li>
          <li>• Volcanic rock: GLiM, Hartmann &amp; Moosdorf (2012), G³ 13, Q12004, doi:10.1029/2012GC004370; data doi:10.1594/PANGAEA.788537, <a className="underline" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>; modified: basic-volcanic class aggregated in a 3×3 window of 0.5° cells.</li>
          <li>• Place names: Natural Earth (public domain) and © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL).</li>
          <li>• Elevation (Earth, 30 m): produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved. The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM-30. Not endorsed by the European Union, ESA, DLR or Airbus.</li>
          <li>• Elevation (Moon): NASA LRO LOLA 30 m/px south-pole DEM (LDEM_75S_30M, LRO LOLA Team, NASA GSFC; Smith et al. 2010, Space Sci. Rev. 150:209) via NASA Moon Trek.</li>
          <li>• Elevation (Mars): Fergason, Hare &amp; Laura (2018), HRSC and MOLA Blended DEM 200 m v2, USGS Astrogeology. MOLA: NASA/GSFC (CC0); HRSC: ESA/DLR/FU Berlin (<a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/igo/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0 IGO</a>); cropped and resampled by the team, shared under the same licence.</li>
          <li>• Monthly temperature (MERRA-2), sunlight at the surface and clearness index (satellite-based, CERES SYN1deg): NASA POWER Climatology API v2.10.1, retrieved 2026-11-14. The data was obtained from the National Aeronautics and Space Administration (NASA) Langley Research Center (LaRC) Prediction of Worldwide Energy Resource (POWER) Project funded through the NASA Earth Science Division.</li>
          <li>• Nearest city: Natural Earth populated places (public domain). Travel time: Weiss et al. 2018, Nature 553:333 (CC BY 4.0). Airports: OurAirports (public domain).</li>
          <li>• Ground screening (snow, ice and water cover): © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium, CC BY 4.0; Natural Earth glaciated areas (public domain).</li>
          <li>• Target constants (gravity, pressure, temperature): NASA NSSDC Moon, Mars and Earth fact sheets (D. R. Williams, NASA GSFC).</li></ul>
        <h3 className="label mt-6">Access data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{accessSources.map((v) => <li key={v}>• {v}</li>)}</ul>
        <h3 className="label mt-6">Imagery and code</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          <li>• Earth: NASA Blue Marble via NASA GIBS.</li>
          <li>• Moon: LROC WAC mosaic, CGI Moon Kit, NASA&apos;s Scientific Visualization Studio (NASA/GSFC/Arizona State University).</li>
          <li>• Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek.</li>
          <li>• Earth at night and clouds: city lights from NASA Earth Observatory&apos;s Black Marble 2016 (Suomi NPP VIIRS), which also gives the water mask for the sun glint; clouds from the NASA Visible Earth Blue Marble cloud layer (MODIS).</li>
          <li>• Relief: Moon from LOLA elevation (NASA SVS CGI Moon Kit), Mars from MGS MOLA elevation (NASA PDS), turned into lighting maps with the relief exaggerated ×12 and ×10 so it shows at globe size.</li>
          <li>• The Sun&apos;s surface, glow and the stars are drawn by our code (decoration, not data). The light on every body comes from the Sun&apos;s position. Script: <Doc path="scripts/tex/make-textures.sh" />.</li>
          <li>• The logistics filters, the terrain selector, the evidence levels and the “Hardware rehearsed” list were adapted from feature ideas of our team&apos;s parallel prototype for the same challenge; no code was reused.</li>
          <li>• three.js, Next.js, React (MIT). Fonts (SIL Open Font License 1.1): Bricolage Grotesque © 2022 The Bricolage Grotesque Project Authors; Martian Mono © 2021 The Martian Mono Project Authors.</li>
        </ul>
        <h3 className="label mt-6">Use of Super Intelligence (SI) / AI</h3>
        <p className="mt-2 text-[12.5px] text-[var(--mut)]">The idea and the problem framing are our team&apos;s own. AI assistants (Claude) were used as tools, under the team&apos;s direction, for code, data search, drafting the scoring method, design proposals and texts; outputs are reviewed by the team before submission. No AI-generated images or video.</p>
        <p className="mt-6 text-[12px] text-[var(--dim)]">Data {DATA_VERSION}, prepared {DATA_DATE}. NASA Space Apps Challenge 2026 · team Logos. Globes not to scale. This project is not endorsed by NASA, ESA, JAXA, CSA or any organisation named here.</p>
      </div>
    </div>
  );
}
