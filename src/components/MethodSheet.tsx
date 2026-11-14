// AI-assisted (Claude), reviewed by team Logos
import { DATA_DATE, MISSIONS } from "@/lib/missions";

export default function MethodSheet({ onClose }: { onClose: () => void }) {
  const accessSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.access.sources))));
  const varSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.vars.map((v) => v.source)))));
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Method and sources" onClick={onClose}>
      <div className="glass fade-in h-full w-full max-w-[600px] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="display text-[34px]">Method & sources</h2><button onClick={onClose} className="chip" autoFocus>Close ✕</button></div>

        <h3 className="label mt-6">1 · Start from real missions</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">We did not ask “which place looks like the Moon?”. We listed real analog field campaigns run by NASA, ESA and the Mars Society, read which task each one rehearsed, and turned each task into a few surface conditions that open global data can measure.</p>

        <h3 className="label mt-6">2 · Analog index (0–1), condition by condition</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each condition has an ideal range in physical units. A condition&apos;s similarity is 1 inside the range and falls off smoothly outside it (Gaussian with a tolerance); it counts as <b>met</b> when the similarity is at least 0.5. Then, for every 0.1° land cell on Earth:</p>
        <pre className="mono mt-2 overflow-x-auto rounded-lg border border-[var(--line)] p-2 text-[12px]">F = conditions met / conditions available{"\n"}D = mean |percentile here − median percentile of known analogs| / 100{"\n"}index = 0.5 · F + 0.5 · (1 − D)</pre>
        <p className="mt-2 text-[13px] text-[var(--mut)]">F says <i>whether</i> a place meets the mission&apos;s conditions; D says how close it sits, in Earth&apos;s own distribution, to where agencies actually ran the mission. It is a ranking index built from our team&apos;s choices (ranges, 0.5 threshold, 50/50 mix), not a probability. D favours places similar to the known analogs, and percentiles are relative to Earth, so D says nothing absolute about the Moon or Mars — the target-based ranges in F do that.</p>

        <h3 className="label mt-6">3 · Validation: does it find where agencies really went?</h3>
        <ul className="mt-2 grid gap-2 text-[13px]">
          {MISSIONS.map((m) => <li key={m.id} className="rounded-lg border border-[var(--line)] p-2"><b>{m.short}</b><span className="text-[var(--mut)]"> — {m.validation.result}</span></li>)}
        </ul>
        <p className="mt-2 text-[12.5px] text-[var(--dim)]">Negative control (central Amazonia), percentile among land cells: {MISSIONS.map((m) => `${m.short} ${m.validation.controlPercentile ?? "–"}`).join(" · ")}. Partly circular: the known analogs also set the median used in D, so their high rank is partly by construction; the independent checks are the condition fraction F and the control. Few known sites per mission (two for ground ice). This is a screening hypothesis: independent field validation is still needed.</p>

        <h3 className="label mt-6">4 · New regions to investigate</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Contiguous high-scoring cells grouped into regions, at least 300 km from every known analog. Only cells meeting every available condition are eligible (missing variables are skipped, with at least 66 % of the total condition weight required); regions under 4 cells dropped; each represented by its best cell and picked at least 800 km apart. They are regions to investigate, not surveyed sites. Key limits: moonwalk — volcanic rock within ~80 km, not confirmed basalt; ground ice — inferred from temperature, not detected.</p>

        <h3 className="label mt-6">5 · Where the analogy breaks</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each site lists what was not scored and what Earth cannot reproduce (gravity, vacuum, radiation, cold). On the globes, each arc links the target to one Earth region; the comparison itself is in the site view.</p>

        <h3 className="label mt-6">6 · Access complexity (neutral)</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">A relative 0–1 score of how much coordination an external field team may need: governance perception 40 %, nearby recorded organised-violence events 35 %, travel advice from two governments (US, UK) 25 %, plus an Antarctic Treaty flag. Protected areas are not mapped: check national park and research permits before fieldwork. Weights and levels (Low &lt; 0.25 ≤ Medium &lt; 0.5 ≤ High) are our team&apos;s choice. Antarctica is not scored (Antarctic Treaty). Not travel advice and not a judgement of any country. Boundaries are de facto and imply no position on sovereignty.</p>

        <h3 className="label mt-6">Mission campaigns</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {MISSIONS.flatMap((m) => m.campaigns).map((c) => <li key={c.name}>• <a className="underline" href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></li>)}
        </ul>
        <h3 className="label mt-6">Targets</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {MISSIONS.map((m) => <li key={m.id}>• {m.target.name}: {m.target.coordSource}. Target surface values come from published maps and models (MGS TES albedo, Mars Climate Database) or are marked “estimate”; they informed the ideal ranges of the conditions and are shown for context. Details in docs/sources.md.</li>)}
        </ul>
        <h3 className="label mt-6">Earth data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{varSources.map((v) => <li key={v}>• {v}</li>)}<li>• Sand fraction: ISRIC SoilGrids 2.0 (CC BY 4.0), model prediction.</li>
          <li>• Volcanic rock: GLiM, Hartmann &amp; Moosdorf (2012), G³ 13, Q12004, doi:10.1029/2012GC004370; data doi:10.1594/PANGAEA.788537, <a className="underline" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>; modified: basic-volcanic class aggregated in a 3×3 window of 0.5° cells.</li>
          <li>• Place names: Natural Earth (public domain) and © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL).</li>
          <li>• Elevation (Earth, 30 m): produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved. Not endorsed by the European Union, ESA, DLR or Airbus.</li>
          <li>• Elevation (Moon): NASA LRO LOLA 30 m/px south-pole DEM v04 (NASA GSFC) via NASA Moon Trek.</li>
          <li>• Elevation (Mars): Fergason, Hare &amp; Laura (2018), HRSC and MOLA Blended DEM 200 m v2, USGS Astrogeology. MOLA: NASA/GSFC (CC0); HRSC: ESA/DLR/FU Berlin (<a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/igo/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0 IGO</a>); cropped and resampled by the team, shared under the same licence.</li>
          <li>• Monthly temperature: NASA POWER Climatology API v2.10.1, retrieved 2026-11-14. The data was obtained from the National Aeronautics and Space Administration (NASA) Langley Research Center (LaRC) Prediction of Worldwide Energy Resource (POWER) Project funded through the NASA Earth Science Division.</li>
          <li>• Nearest city: Natural Earth populated places (public domain). Travel time: Weiss et al. 2018, Nature 553:333 (CC BY 4.0). Airports: OurAirports (public domain).</li>
          <li>• Target constants (gravity, pressure, temperature): NASA NSSDC Moon, Mars and Earth fact sheets (D. R. Williams, NASA GSFC).</li></ul>
        <h3 className="label mt-6">Access data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{accessSources.map((v) => <li key={v}>• {v}</li>)}</ul>
        <h3 className="label mt-6">Imagery and code</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          <li>• Earth: NASA Blue Marble via NASA GIBS.</li>
          <li>• Moon: LROC WAC mosaic, CGI Moon Kit, NASA&apos;s Scientific Visualization Studio (NASA/GSFC/Arizona State University).</li>
          <li>• Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek.</li>
          <li>• three.js, Next.js, React (MIT). Fonts (SIL Open Font License 1.1): Instrument Serif © 2022 The Instrument Serif Project Authors; Instrument Sans © 2022 The Instrument Sans Project Authors; Geist Mono © 2024 The Geist Project Authors.</li>
        </ul>
        <h3 className="label mt-6">Use of Super Intelligence (SI) / AI</h3>
        <p className="mt-2 text-[12.5px] text-[var(--mut)]">The idea and the problem framing are our team&apos;s own. AI assistants (Claude) were used as tools, under the team&apos;s direction, for code, data search, drafting the scoring method, design proposals and texts; outputs are reviewed by the team before submission. No AI-generated images or video.</p>
        <p className="mt-6 text-[12px] text-[var(--dim)]">Data prepared {DATA_DATE}. NASA Space Apps Challenge 2026 · team Logos. Globes not to scale. This project is not endorsed by NASA.</p>
      </div>
    </div>
  );
}
