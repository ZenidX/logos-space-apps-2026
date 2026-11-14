// AI-assisted (Claude), reviewed by team Logos
import { DATA_DATE, MISSIONS } from "@/lib/missions";

export default function MethodSheet({ onClose }: { onClose: () => void }) {
  const accessSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.access.sources))));
  const varSources = Array.from(new Set(MISSIONS.flatMap((m) => m.sites.flatMap((s) => s.vars.map((v) => v.source)))));
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Method and sources" onClick={onClose}>
      <div className="glass fade-in h-full w-full max-w-[600px] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="display text-[26px] font-semibold">Method & sources</h2><button onClick={onClose} className="chip" autoFocus>Close ✕</button></div>

        <h3 className="label mt-6">1 · Start from real missions</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">We did not ask “which place looks like the Moon?”. We listed real analog field campaigns run by NASA and ESA, read which task each one rehearsed, and turned each task into a few surface conditions that open global data can measure.</p>

        <h3 className="label mt-6">2 · Match, condition by condition</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each condition has an ideal range in physical units. Inside the range the similarity is 1; outside it falls off smoothly (Gaussian, with a tolerance). The match is a weighted <b>geometric</b> mean, so one failed condition cannot be hidden by the others. Every 0.1° land cell on Earth is scored.</p>

        <h3 className="label mt-6">3 · Validation: does it find where agencies really went?</h3>
        <ul className="mt-2 grid gap-2 text-[13px]">
          {MISSIONS.map((m) => <li key={m.id} className="rounded-lg border border-[var(--line)] p-2"><b>{m.short}</b><span className="text-[var(--mut)]"> — {m.validation.result}</span></li>)}
        </ul>
        <p className="mt-2 text-[12.5px] text-[var(--dim)]">Negative control (central Amazonia), percentile among land cells: {MISSIONS.map((m) => `${m.short} ${m.validation.controlPercentile ?? "–"}`).join(" · ")}. Limits: ranges and weights are team choices made knowing where the known sites are, so the test is not fully independent; few known sites per mission.</p>

        <h3 className="label mt-6">4 · New candidates</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Contiguous high-scoring cells grouped into regions, at least 300 km from every known analog. Ranked by 0.5 × fraction of conditions met + 0.5 × closeness to the known analogs (percentile distance to their median). They are regions to investigate, not surveyed sites.</p>

        <h3 className="label mt-6">5 · Where the analogy breaks</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">Each site lists what was not scored and what Earth cannot reproduce (gravity, vacuum, radiation, cold). On the globes, arc segments show the top conditions: solid = met, amber dashes = the analogy breaks, faint dots = not scored.</p>

        <h3 className="label mt-6">6 · Access complexity (neutral)</h3>
        <p className="mt-2 text-[14px] text-[var(--mut)]">A relative 0–1 score of how much coordination an external field team may need: governance perception 40 %, nearby recorded organised-violence events 35 %, travel advice from two governments (US, UK) 25 %, plus permit flags. Weights and levels (Low &lt; 0.25 ≤ Medium &lt; 0.5 ≤ High) are our team&apos;s choice. Antarctica is not scored (Antarctic Treaty). Not travel advice and not a judgement of any country. Boundaries are de facto and imply no position on sovereignty.</p>

        <h3 className="label mt-6">Mission campaigns</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {MISSIONS.flatMap((m) => m.campaigns).map((c) => <li key={c.name}>• <a className="underline" href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></li>)}
        </ul>
        <h3 className="label mt-6">Targets</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          {MISSIONS.map((m) => <li key={m.id}>• {m.target.name}: {m.target.coordSource}. Target surface values are approximate literature values, not yet extracted from NASA PDS products.</li>)}
        </ul>
        <h3 className="label mt-6">Earth data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{varSources.map((v) => <li key={v}>• {v}</li>)}<li>• Sand fraction: ISRIC SoilGrids 2.0 (CC BY 4.0), model prediction. Volcanic rock: GLiM, Hartmann &amp; Moosdorf 2012 (CC BY 3.0). Place names: Natural Earth (public domain) and © OpenStreetMap contributors (ODbL).</li></ul>
        <h3 className="label mt-6">Access data</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">{accessSources.map((v) => <li key={v}>• {v}</li>)}</ul>
        <h3 className="label mt-6">Imagery and code</h3>
        <ul className="mt-2 grid gap-1 text-[12.5px] text-[var(--mut)]">
          <li>• Earth: NASA Blue Marble via NASA GIBS.</li>
          <li>• Moon: LROC WAC mosaic, CGI Moon Kit, NASA&apos;s Scientific Visualization Studio (NASA/GSFC/Arizona State University).</li>
          <li>• Mars: Viking MDIM 2.1 colour mosaic (NASA/USGS) via NASA Mars Trek.</li>
          <li>• three.js, Next.js, React (MIT). Fonts: Space Grotesk, IBM Plex Sans, JetBrains Mono (SIL OFL 1.1).</li>
        </ul>
        <h3 className="label mt-6">Use of AI</h3>
        <p className="mt-2 text-[12.5px] text-[var(--mut)]">The idea and approach are our team&apos;s own. AI assistants (Claude) were used only as tools for code, data search and drafting texts; the team reviewed everything. No AI-generated images or video.</p>
        <p className="mt-6 text-[12px] text-[var(--dim)]">Data prepared {DATA_DATE}. NASA Space Apps Challenge 2026 · team Logos. Globes not to scale. This project is not endorsed by NASA.</p>
      </div>
    </div>
  );
}
