// AI-assisted (Claude), reviewed by team Logos
import { fmt, idx, type Mission, type Site } from "@/lib/missions";

export function KindChip({ kind }: { kind: Site["kind"] }) {
  const c = kind === "new" ? "var(--earth)" : "var(--moon)";
  return <span className="chip" style={{ color: c, borderColor: c }}>{kind === "new" ? "New region to investigate" : "Known analog"}</span>;
}

export function AccessBars({ site }: { site: Site }) {
  const lv = ["Low", "Medium", "High"].indexOf(site.access.level) + 1;
  return (
    <span className="inline-flex items-center gap-1" title={`Access complexity: ${site.access.level}`} aria-label={`Access complexity: ${site.access.level}`}>
      {[1, 2, 3].map((i) => <i key={i} className="inline-block h-2.5 w-1.5 rounded-sm" style={{ background: lv === 0 ? "transparent" : i <= lv ? "var(--sand)" : "var(--line2)", border: lv === 0 ? "1px dashed var(--dim)" : undefined }} />)}
    </span>
  );
}

export const pct = idx;

function Bar({ v }: { v: number | null }) {
  const c = v === null ? "var(--dim)" : v >= 0.95 ? "var(--earth)" : v >= 0.9 ? "var(--earth)" : "var(--amber)";
  return (
    <span className="relative inline-block h-1.5 w-20 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(v ?? 0) * 100}%`, background: c }} />
    </span>
  );
}

export default function SitePanel({ site, mission, onBack }: { site: Site; mission: Mission; onBack: () => void }) {
  const t = mission.target;
  const matchVars = site.vars.filter((v) => v.inMatch);
  const sun = site.vars.find((v) => v.id === "sun_max_deg");
  const sunW = site.vars.find((v) => v.id === "sun_winter_solstice_deg");
  return (
    <div className="fade-in">
      <button onClick={onBack} className="back-btn label -ml-1 px-1 py-2 hover:text-[var(--ink)]">← All sites</button>
      <div className="mt-3 flex flex-wrap items-center gap-2"><KindChip kind={site.kind} />{site.campaign && <span className="text-[12px] text-[var(--mut)]">Used by: {site.campaign}</span>}</div>
      <h3 className="display mt-2 text-[22px] font-semibold leading-tight">{site.name}</h3>
      {site.country && <p className="text-[13px] text-[var(--mut)]">{site.country}</p>}
      <p className="mono text-[12px] text-[var(--dim)]">{site.lat.toFixed(2)}°, {site.lon.toFixed(2)}° · 0.1° cell (~11 km){site.kind === "new" && ` · region of ${site.areaKm2 ? `~${Math.round(site.areaKm2).toLocaleString("en")} km²` : "several cells"} to investigate, not a surveyed site`}</p>

      <section className="mt-4 flex items-end justify-between rounded-xl border border-[var(--line2)] p-3">
        <div><h4 className="label">Analog index · 0 to 1</h4><p className="display text-[34px] font-semibold leading-none tabular-nums">{idx(site.match)}</p></div>
        {site.percentile !== null && <p className="text-right text-[12.5px] text-[var(--mut)]">Higher than<br /><b className="text-[var(--ink)]">{site.percentile.toFixed(1)} %</b> of land cells</p>}
      </section>
      <p className="mt-1 text-[11.5px] text-[var(--dim)]">A ranking index from our mission conditions, not a probability. See “Method & sources”.</p>
      <section className="mt-3 rounded-lg border p-2 text-[12.5px]" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>
        ▲ {mission.keyLimit}
      </section>

      <section className="mt-4">
        <h4 className="label">Condition by condition (similarity 0–1) · vs {t.name}</h4>
        <ul className="mt-2 grid gap-1.5">
          {matchVars.map((v) => {
            const tv = t.values[v.id]?.value ?? null;
            return (
              <li key={v.id} className="rounded-lg border border-[var(--line)] p-2 text-[13px]">
                <div className="flex items-center justify-between gap-2"><span>{v.label}</span><span className="flex items-center gap-2"><Bar v={v.similarity} /><span className="mono w-10 text-right text-[12px]">{idx(v.similarity)}</span></span></div>
                <div className="mono mt-0.5 text-[11.5px] text-[var(--mut)]">here {fmt(v.value, v.unit)} · target {tv === null ? "n/a" : fmt(tv, v.unit)}</div>
              </li>
            );
          })}
          {mission.notScored.map((n) => <li key={n} className="flex gap-2 px-2 text-[12.5px] text-[var(--dim)]"><span aria-hidden>◌</span>Not scored: {n}</li>)}
        </ul>
      </section>

      {sun && (
        <section className="mt-4">
          <h4 className="label">Sun angle at noon (computed from latitude)</h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-lg border border-[var(--line)] p-2"><div className="text-[var(--mut)]">Here: highest · winter</div><div className="mono">{fmt(sun.value, "deg")} · {sunW?.value !== null && sunW?.value !== undefined && sunW.value <= 0 ? "polar night" : fmt(sunW?.value ?? null, "deg")}</div></div>
            <div className="rounded-lg border border-[var(--line)] p-2"><div className="text-[var(--mut)]">{t.name.split(" (")[0]}</div><div className="mono">{fmt(t.values.sun_max_deg?.value ?? null, "deg")} · {fmt(t.values.sun_winter_solstice_deg?.value ?? null, "deg")}</div></div>
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--mut)]">At the lunar south pole the Sun never climbs more than a few degrees. NASA&apos;s JETT3 and JETT5 tests rehearsed this by walking at night with a light cart.</p>
        </section>
      )}

      <section className="mt-4">
        <h4 className="label">Where it breaks</h4>
        <ul className="mt-2 grid gap-1 text-[13px] text-[var(--mut)]">
          {site.breaks.map((b) => <li key={b} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span>{b}</li>)}
          {mission.always.map((b) => (
            <li key={b.text} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span><span>{b.text} <span className="text-[11px] text-[var(--dim)]">— {b.url ? <a className="underline" href={b.url} target="_blank" rel="noopener noreferrer">{b.source}</a> : b.source}</span></span></li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-[var(--line2)] p-3">
        <div className="flex items-center justify-between"><h4 className="label">Access complexity</h4><AccessBars site={site} /></div>
        <p className="mt-1 text-[15px]" style={{ color: "var(--sand)" }}>
          {site.access.level}{site.access.score !== null && <span className="mono ml-2 text-[12px] text-[var(--mut)]">{site.access.score.toFixed(2)} / 1</span>}
        </p>
        {site.access.permit && <p className="mt-1 text-[12.5px] text-[var(--mut)]">• {site.access.permit}</p>}
        <p className="mt-1 text-[12px] text-[var(--mut)]">{site.access.basis}</p>
        <p className="mt-2 text-[11.5px] text-[var(--dim)]">How much coordination an external field team may need. Not travel advice and not a judgement of any country. Sources in “Method & sources”.</p>
      </section>
    </div>
  );
}
