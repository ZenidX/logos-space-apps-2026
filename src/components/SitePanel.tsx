"use client";
// AI-assisted (Claude), reviewed by team Logos
import dynamic from "next/dynamic";
import { useState } from "react";
import Count from "@/components/Count";
import { EVIDENCE, FILTERS, INDEPENDENT, MISSIONS, SHORT_LABEL, fmt, idx, topNote, travelText, type Mission, type Site } from "@/lib/missions";
import EvidenceBadge from "@/components/Evidence";
import { TerrainStats, terrainOf } from "@/components/TerrainCompare";
import LocatorMap from "@/components/LocatorMap";
import RadialDial, { RadialLegend, RadialMini } from "@/components/RadialDial";
import { buildRings } from "@/lib/radial-data";
import ConditionStrip, { hasStrip, rangeText } from "@/components/ConditionStrip";
import { conditionStatus } from "@/lib/rules";
import detailsRaw from "@/data/site-details.json";

interface Details {
  when?: { surfaceTempC?: (number | null)[] | null; solarKWhM2Day?: (number | null)[] | null; clearnessIndex?: (number | null)[] | null };
  how?: {
    nearestCity50k?: { name: string; country: string; straightLineKm: number } | null;
    travelTimeToCityHours?: number | null;
    nearestLargeAirport?: { name: string; iata?: string; straightLineKm: number } | null;
    campaign?: { text: string; urls: string[] } | null;
  };
}
const DETAILS = (detailsRaw as unknown as { items: Record<string, Details> }).items;

function TempChart({ t, targetC, targetName }: { t: (number | null)[]; targetC: number | null; targetName: string }) {
  const v = t.filter((x): x is number => x !== null);
  if (v.length < 12) return null;
  const lo = Math.min(...v, targetC ?? Infinity), hi = Math.max(...v), W = 300, H = 78, pad = 14;
  const y = (c: number) => pad + (1 - (c - lo) / Math.max(1, hi - lo)) * (H - 2 * pad), x = (i: number) => (i + 0.5) * (W / 12);
  const pts = v.map((c, i) => `${x(i).toFixed(1)},${y(c).toFixed(1)}`).join(" ");
  return (
    <div className="mt-3">
      <p className="label">Surface (skin) temperature by month</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full max-w-[460px]" role="img" aria-label={`Monthly surface temperature here: ${Math.min(...v).toFixed(0)} to ${hi.toFixed(0)} degrees Celsius.`}>
        {lo < 0 && hi > 0 && <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="var(--line2)" strokeWidth={1} />}
        {targetC !== null && <><line x1={0} x2={W} y1={y(targetC)} y2={y(targetC)} stroke="var(--mars)" strokeDasharray="4 3" strokeWidth={1} /><text x={W - 2} y={y(targetC) - 3} textAnchor="end" fontSize="9" fill="var(--mars)" fontFamily="var(--mono)">{targetName} mean {targetC.toFixed(0)} °C</text></>}
        <polyline className="line-draw" points={pts} fill="none" stroke="var(--earth)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} />
        {v.map((c, i) => (c === hi || c === Math.min(...v)) && <text key={i} x={x(i)} y={y(c) + (c === hi ? -4 : 11)} textAnchor="middle" fontSize="9" fill="var(--ink)" fontFamily="var(--mono)">{c.toFixed(0)}°</text>)}
      </svg>
      <p className="text-[11.5px] text-[var(--dim)]">NASA POWER climatology 2001–2025 (MERRA-2 model cell of about 50 km, not a station).</p>
    </div>
  );
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** Sunlight reaching the ground by month (NASA POWER, all-sky) and how clear the sky is. Context only: not part of the index. */
function SolarChart({ kwh, kt, lowMonths }: { kwh: (number | null)[]; kt: (number | null)[] | null; lowMonths: number[] }) {
  if (kwh.length !== 12 || kwh.every((x) => x === null)) return null;
  const v = kwh.map((x) => x ?? 0), max = Math.max(...v, 0.5), W = 300, H = 64, bw = W / 12, y = (d: number) => H - (d / max) * H;
  const clear = (kt ?? []).map((x, i) => ({ x, i })).filter((o): o is { x: number; i: number } => typeof o.x === "number" && o.x > 0);
  const best = clear.length ? clear.reduce((p, c) => (c.x > p.x ? c : p)) : null, worst = clear.length ? clear.reduce((p, c) => (c.x < p.x ? c : p)) : null;
  const low = lowMonths.map((i) => v[i]);
  return (
    <div className="mt-3">
      <p className="label">Sunlight reaching the ground by month · kWh/m² per day</p>
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="mt-1 w-full max-w-[460px]" role="img" aria-label={`Sunlight reaching the ground by month: from ${Math.min(...v).toFixed(1)} to ${Math.max(...v).toFixed(1)} kilowatt-hours per square metre per day.`}>
        {v.map((d, i) => (
          <g key={i}>
            <rect className="bar-up" x={i * bw + 3} y={y(d)} width={bw - 6} height={Math.max(1, H - y(d))} rx={2} fill={lowMonths.includes(i) ? "#5ee6ff" : "var(--amber)"} opacity={lowMonths.includes(i) ? 0.95 : 0.6} style={{ animationDelay: `${i * 35}ms` }} />
            {(d === Math.max(...v) || d === Math.min(...v)) && <text x={i * bw + bw / 2} y={Math.max(9, y(d) - 3)} textAnchor="middle" fontSize="9" fill="var(--ink)" fontFamily="var(--mono)">{d.toFixed(1)}</text>}
            <text x={i * bw + bw / 2} y={H + 12} textAnchor="middle" fontSize="9" fill={lowMonths.includes(i) ? "#5ee6ff" : "var(--dim)"} fontFamily="var(--mono)">{MONTHS[i]}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-[12.5px] text-[var(--mut)]">
        {lowMonths.length > 0 && <>In the low-Sun months here ({lowMonths.map((i) => MONTH_NAMES[i]).join(", ")}; cyan bars) the ground receives <b className="text-[var(--ink)]">{Math.min(...low).toFixed(2)}–{Math.max(...low).toFixed(2)} kWh/m² per day</b>. </>}
        {best && worst && <>Clearest skies: <b className="text-[var(--ink)]">{MONTH_NAMES[best.i]}</b> (clearness index {best.x.toFixed(2)}); cloudiest: <b className="text-[var(--ink)]">{MONTH_NAMES[worst.i]}</b> ({worst.x.toFixed(2)}).</>}
      </p>
      <p className="text-[11.5px] text-[var(--dim)]">NASA POWER climatology 2001–2025 (satellite-based, CERES SYN1deg; 1° cell, not a station). All-sky, on a horizontal surface. The clearness index is the share of the sunlight above the atmosphere that reaches the ground. Context only: not part of the index.</p>
    </div>
  );
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

const TerrainCompare = dynamic(() => import("@/components/TerrainCompare"), { ssr: false, loading: () => <div className="skel relative h-[240px] rounded-xl md:h-[280px]" role="status" aria-label="Loading terrain" /> });

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
/** Noon Sun elevation on day 15 of each month, from latitude only (declination by Cooper's formula). */
export function noonSunByMonth(lat: number): number[] {
  return MONTHS.map((_, m) => {
    const day = 15 + Math.round(m * 30.44), decl = 23.44 * Math.sin((2 * Math.PI * (284 + day)) / 365);
    return 90 - Math.abs(lat - decl);
  });
}

function SunChart({ lat, targetMax, targetName }: { lat: number; targetMax: number | null; targetName: string }) {
  const v = noonSunByMonth(lat), W = 300, H = 96, bw = W / 12, y = (d: number) => H - (Math.max(0, d) / 90) * H;
  const low = v.map((d, i) => ({ d, i })).filter((x) => x.d > 0).sort((a, b) => a.d - b.d)[0];
  const full = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full max-w-[460px]" role="img" aria-label={`Noon Sun elevation by month at this site: from ${Math.max(0, Math.min(...v)).toFixed(0)} to ${Math.max(...v).toFixed(0)} degrees.`}>
        {v.map((d, i) => (
          <g key={i}>
            <rect className="bar-up" x={i * bw + 3} y={y(d)} width={bw - 6} height={H - y(d)} rx={2} fill={d <= 0 ? "var(--line2)" : "var(--amber)"} opacity={d <= 0 ? 1 : 0.35 + 0.65 * (1 - Math.min(1, d / 90))} style={{ animationDelay: `${i * 35}ms` }} />
            {d <= 0 && <rect x={i * bw + 3} y={H - 3} width={bw - 6} height={3} fill="var(--line2)" />}
            <text x={i * bw + bw / 2} y={H + 12} textAnchor="middle" fontSize="9" fill="var(--dim)" fontFamily="var(--mono)">{MONTHS[i]}</text>
          </g>
        ))}
        {targetMax !== null && <><line x1={0} x2={W} y1={y(targetMax)} y2={y(targetMax)} stroke="var(--moon)" strokeDasharray="4 3" strokeWidth={1} /><text x={W - 2} y={y(targetMax) - 3} textAnchor="end" fontSize="9" fill="var(--moon)" fontFamily="var(--mono)">{targetName} max {targetMax.toFixed(0)}°</text></>}
      </svg>
      <p className="mt-1 text-[12.5px] text-[var(--mut)]">
        {v.some((d) => d <= 0)
          ? (low ? <>The Sun stays below the horizon at noon in the darkest months (no direct sunlight). Lowest noon Sun above the horizon: <b className="text-[var(--ink)]">{full[low.i]}</b>, about {Math.max(1, Math.round(low.d))}°.</> : "The Sun stays below the horizon at noon all year at this latitude.")
          : low && <>Lowest noon Sun: <b className="text-[var(--ink)]">{full[low.i]}</b>, about {low.d.toFixed(0)}° above the horizon.</>}
        {targetMax !== null && (low && low.d <= targetMax + 8 ? " Around then the light is close to the target's grazing Sun: the best season to rehearse low-Sun work here." : " It never gets as low as at the target, so low-Sun work here needs night operations with artificial light.")}
      </p>
    </div>
  );
}

export default function SitePanel({ site, mission, onBack }: { site: Site; mission: Mission; onBack: () => void }) {
  const [tab, setTab] = useState<"why" | "when" | "how" | "limits" | "shape" | null>("why"); // Why is open by default
  const t = mission.target;
  const matchVars = site.vars.filter((v) => v.inMatch);
  // highest noon Sun at the target; missions that share a target share the figure (it is computed from the target's latitude)
  const tSun = t.values.sun_max_deg?.value ?? MISSIONS.find((m) => m.target.name === t.name && m.target.values.sun_max_deg?.value != null)?.target.values.sun_max_deg.value ?? null;
  const targetShort = t.name.split(" (")[0];
  const det = DETAILS[site.id], how = det?.how;
  const ts = terrainOf(site.id), tt = terrainOf(`target-${mission.id}`);
  const rings = buildRings(
    mission.variables.filter((v) => v.inMatch).map((v) => { const p = site.vars.find((x) => x.id === v.id); return { id: v.id, label: SHORT_LABEL[v.id] ?? v.label, unit: v.unit, ideal: v.ideal, tolerance: v.tolerance, value: p?.value ?? null, similarity: p?.similarity ?? null }; }),
    ts?.stats ?? null, tt?.stats ?? null, { score: site.access.score, level: site.access.level });
  const TABS = [["why", "Why"], ["shape", "Shape"], ["when", "When"], ["how", "How"], ["limits", "Limits & sources"]] as const;
  return (
    <div>
      {/* ---- At a glance: everything essential on one screen ---- */}
      <div className="stagger">
        <div className="flex items-center justify-between gap-2">
          <button onClick={onBack} className="back-btn label -ml-1 px-1 py-1 hover:text-[var(--ink)]">← All sites</button>
          <span className="flex items-center gap-2">{site.campaign && <span className="hidden text-[12px] text-[var(--mut)] sm:inline">{site.campaign}</span>}<span className="chip" style={{ borderColor: EVIDENCE[site.evidence].color }}><EvidenceBadge level={site.evidence} /></span></span>
        </div>
        <header className="mt-1">
          <h3 className="place text-[clamp(22px,3.3vh,34px)] leading-[1] tracking-[-.03em]">{site.name}</h3>
          <p className="text-[13px] leading-snug text-[var(--mut)]">{site.country} <span className="mono text-[11.5px] text-[var(--dim)]">· {site.lat.toFixed(2)}°, {site.lon.toFixed(2)}° · {site.kind === "new" ? `new region to investigate, not a surveyed site${mission.validated ? ` · index rank ${site.rank} of ${site.of}` : ""}` : "known analog · 0.1° cell around the site"}</span></p>
        </header>

        {/* Radial: the index in the centre, one ring per mission condition (cyan), shape against the target (grey), permits and politics (amber) */}
        <div className="mt-2 hidden items-center gap-5 sm:grid sm:grid-cols-[auto_1fr]">
          <RadialDial index={idx(site.match)} rings={rings} className="h-[clamp(150px,24vh,232px)] w-[clamp(150px,24vh,232px)]" />
          <div><RadialLegend rings={rings} /><p className="mt-1 text-[11px] text-[var(--dim)]" title={topNote(mission)}>Analog index 0–1: a ranking index, not suitability. Grey rings: 1 = same as the target. Amber: fuller = more complex access.</p></div>
        </div>
        <div className="mt-2 sm:hidden">
          <p className="flex items-baseline gap-3"><span className="label">Analog index</span><span className="mono text-[40px] leading-none tracking-[-.04em]"><Count value={site.match} ms={900} decimals={3} /></span><span className="text-[11px] text-[var(--dim)]">0–1, not suitability</span></p>
          <RadialMini rings={rings} />
        </div>

        <div className="mt-3 grid items-end gap-3 lg:grid-cols-[1fr_auto]">
          <TerrainCompare siteId={site.id} targetId={`target-${mission.id}`} targetSunDeg={tSun} compact />
          <div className="hidden gap-2 lg:grid [@media(max-height:840px)]:lg:hidden">
            {ts && <LocatorMap body="earth" lat={ts.lat} lon={ts.lon > 180 ? ts.lon - 360 : ts.lon} color="#5db4ff" label={site.name} />}
            {tt && <LocatorMap body={tt.body} lat={tt.lat} lon={tt.lon > 180 ? tt.lon - 360 : tt.lon} color={tt.body === "moon" ? "#d7dce6" : "#ff8d5e"} label={t.name} />}
          </div>
        </div>
        {site.kind === "known" && ts && ts.stats.slopeMeanDeg > 10 && <p className="mt-2 text-[12px] text-[var(--amber)]">Steep ground here (mean slope {ts.stats.slopeMeanDeg.toFixed(0)}° over 11 km). This known analog is kept {mission.validated ? "only to validate the index" : "for reference"}; a new region this steep would have been screened out.</p>}
        <p className="mt-2 text-[12px] text-[var(--mut)]"><b className="text-[var(--ink)]">Logistics:</b> {site.travelH !== null ? `about ${travelText(site.travelH)}${site.travelH > FILTERS.remoteH ? " (remote)" : site.travelH < FILTERS.reachH ? " (within reach)" : ""}` : "no travel-time data here"}{site.slopeDeg !== null && ` · mean slope ${site.slopeDeg.toFixed(1)}° (${site.slopeDeg <= FILTERS.flatDeg ? "flat" : "steep"} by our ${FILTERS.flatDeg}° threshold)`}. Neither is part of the index or of the access ring.</p>

        <p className="mt-3 flex gap-2 border-l-2 pl-3 text-[13px] leading-snug" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}><span aria-hidden>≠</span><span><b>Where it breaks:</b> {mission.keyLimit} {mission.always[0]?.text.split(";")[0]}.</span></p>

        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Details">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} aria-controls="site-detail" onClick={() => { setTab(tab === id ? null : id); if (tab !== id) window.setTimeout(() => document.getElementById("site-detail")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 60); }} className="glass-tab chip">{label}</button>
          ))}
        </div>
      </div>

      {/* ---- Detail on demand ---- */}
      {tab && (
        <section id="site-detail" role="tabpanel" className="fade-in mt-4 scroll-mt-4 border-t border-[var(--line)] pt-4" key={tab}>
          {tab === "why" && <>
          <p className="mb-2 text-[12.5px] text-[var(--dim)]">{site.kind === "new" ? topNote(mission) : "Known analogs are scored the same way as every other cell; the index compares surface conditions, not suitability."}</p>
          <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">Each condition is checked against the <b>range the mission needs</b> (solid band; dashed = still accepted), not against the target&apos;s exact value. The dot is this site; the tick is the target.</p>
          <ul className="grid gap-1.5">
            {matchVars.map((v) => {
              const def = mission.variables.find((x) => x.id === v.id), tval = t.values[v.id], tv = tval?.value ?? null, est = /approx|^estimate/i.test(tval?.source ?? "");
              const strip = def && v.value !== null && hasStrip(v.id, def.ideal, def.tolerance);
              const met = v.similarity !== null && v.similarity >= 0.5;
              return (
                <li key={v.id} className="rounded-lg border border-[var(--line)] p-2 text-[13px]">
                  <div className="flex items-baseline justify-between gap-2"><span>{v.label}</span><span className="mono text-[11.5px]" style={{ color: v.similarity === null ? "var(--dim)" : met ? "var(--earth)" : "var(--amber)" }}>{v.similarity === null || v.value === null ? "no data" : strip && def ? conditionStatus(v.value, def.ideal!, def.tolerance!) : met ? "in range" : "out of range"} · fit {v.similarity === null ? "–" : v.similarity.toFixed(2)}</span></div>
                  {strip && def ? (
                    <>
                      <ConditionStrip id={v.id} label={v.label} ideal={def.ideal!} tolerance={def.tolerance!} value={v.value!} target={tv} targetEstimate={est} unit={v.unit} />
                      <div className="mono text-[11.5px] text-[var(--mut)]">here {fmt(v.value, v.unit)} · mission needs {rangeText(def.ideal!, v.unit, def.tolerance)}</div>
                    </>
                  ) : (
                    <div className="mono mt-0.5 text-[11.5px] text-[var(--mut)]">{v.id === "volcanic" ? (v.value === 1 ? "basic volcanic rock mapped within ~80 km" : v.value === 0 ? "no basic volcanic rock mapped within ~80 km" : "no data") : `here ${fmt(v.value, v.unit)}`}</div>
                  )}
                  {def?.why && <div className="mt-0.5 text-[11.5px] text-[var(--dim)]">{def.why}</div>}
                  {v.id === "sand" && <div className="mt-0.5 text-[11.5px] text-[var(--dim)]">Soil-model estimate (SoilGrids, 0.1° cell mean) with a wide uncertainty. New regions cluster near 54 % because the index favours places like the known analogs, whose median is 54 %.</div>}
                </li>
              );
            })}
            {mission.notScored.map((n) => <li key={n} className="flex gap-2 px-2 text-[12.5px] text-[var(--dim)]"><span aria-hidden>◌</span>Not scored: {n}</li>)}
          </ul>
        </>}
          {tab === "shape" && <><p className="mb-2 text-[13px] text-[var(--mut)]">Numbers behind the 3D view above: the ground here next to <span className="place">{targetShort}</span>: 11 × 11 km each, same horizontal and vertical scale.</p><TerrainStats siteId={site.id} targetId={`target-${mission.id}`} /></>}
          {tab === "when" && <>
          <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">Noon Sun height through the year, computed from latitude only (terrain ignored).</p>
          <SunChart lat={site.lat} targetMax={t.body === "moon" ? tSun : null} targetName={targetShort} />
          {det?.when?.surfaceTempC && (() => {
            const tv = det.when!.surfaceTempC!.map((x, i) => ({ x, i })).filter((o): o is { x: number; i: number } => o.x !== null);
            if (tv.length < 12) return null;
            const hot = tv.reduce((p, c) => (c.x > p.x ? c : p)), cold = tv.reduce((p, c) => (c.x < p.x ? c : p)), mn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return <p className="mt-3 text-[13px] text-[var(--mut)]">Warmest month: <b className="text-[var(--ink)]">{mn[hot.i]}</b> ({hot.x.toFixed(0)} °C at the surface). Coldest: <b className="text-[var(--ink)]">{mn[cold.i]}</b> ({cold.x.toFixed(0)} °C).{mission.id === "m3-ground-ice" && " Frozen ground is easier to drill and travel over outside the summer thaw; daylight and access are best in summer."}</p>;
          })()}
          {det?.when?.solarKWhM2Day && <SolarChart kwh={det.when.solarKWhM2Day} kt={det.when.clearnessIndex ?? null} lowMonths={mission.validated ? [] : noonSunByMonth(site.lat).map((d, i) => (d > 0 && d <= 12 ? i : -1)).filter((i) => i >= 0)} />}
          {det?.when?.surfaceTempC && <TempChart t={det.when.surfaceTempC} targetC={t.values.lst_mean?.value ?? null} targetName={targetShort} />}
          {t.body === "moon" && <p className="mt-1 text-[12px] text-[var(--dim)]">NASA&apos;s JETT3 test rehearsed the low polar Sun with night moonwalks and a lighting cart; JETT5 used a portable spotlight acting as the Sun (USGS).</p>}
        </>}
          {tab === "how" && <>
          <p className="mb-2 text-[13px]"><span className="label mr-2">What would be rehearsed</span><span className="text-[var(--mut)]">{mission.rehearse}</span></p>
          {how?.campaign ? (
            <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">{how.campaign.text} {how.campaign.urls.map((u, k) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="underline">[{k + 1}]</a>)}</p>
          ) : (
            <>
              <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">No field campaign has used this region that we know of. Comparable work elsewhere:</p>
              <ul className="grid gap-1 text-[13px]">
                {mission.campaigns.slice(0, 3).map((c) => <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line2)] underline-offset-2 hover:decoration-[var(--ink)]">{c.name}</a> <span aria-hidden className="text-[var(--dim)]">↗</span></li>)}
              </ul>
            </>
          )}
          {site.kind === "new" && (() => { const ic = INDEPENDENT[site.id] ?? { verdict: "Not checked" as const, text: "No independent check was done for this region." }; return (
            <div className="mt-3 border-l-2 pl-3 text-[13px]" style={{ borderColor: EVIDENCE[site.evidence].color }}>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="label">Independent check</span><EvidenceBadge level={site.evidence} /></p>
              <p className="mt-1 text-[var(--mut)]">{ic.text} {ic.url && <a className="underline" href={ic.url} target="_blank" rel="noopener noreferrer">Source</a>}</p>
              {ic.image && <p className="mt-1 text-[12.5px]"><a className="underline" href={ic.image.url} target="_blank" rel="noopener noreferrer">{ic.image.label}</a> <span aria-hidden className="text-[var(--dim)]">↗</span></p>}
              <p className="mt-1 text-[11.5px] text-[var(--dim)]">No source names this point as an established analog. Distances are approximate.{!mission.validated && " The check is about the ground and analog use nearby, not about low-Sun work."} Full notes: docs/independent-check.md and docs/independent-check-v8.md.</p>
            </div>
          ); })()}
          {how && (
            <dl className="mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12.5px]">
              {how.nearestCity50k && <><dt className="text-[var(--dim)]">Nearest city</dt><dd>{how.nearestCity50k.name}, {how.nearestCity50k.country} · {Math.round(how.nearestCity50k.straightLineKm).toLocaleString("en")} km</dd></>}
              <dt className="text-[var(--dim)]">Travel time</dt><dd>{how.travelTimeToCityHours != null ? `about ${how.travelTimeToCityHours < 10 ? how.travelTimeToCityHours.toFixed(1) : Math.round(how.travelTimeToCityHours)} h to a city (2015 model)` : "no data"}</dd>
              {how.nearestLargeAirport && <><dt className="text-[var(--dim)]">Large airport</dt><dd>{how.nearestLargeAirport.name}{how.nearestLargeAirport.iata ? ` (${how.nearestLargeAirport.iata})` : ""} · {Math.round(how.nearestLargeAirport.straightLineKm).toLocaleString("en")} km</dd></>}
            </dl>
          )}
          {how && <p className="mt-1 text-[11.5px] text-[var(--dim)]">Straight-line distances, not routes; the nearest city or airport may be in another country. Travel time is the 2015 Oxford MAP model to its own set of urban areas; it may not be the city named above.</p>}
          <div className="mt-3 rounded-xl border border-[var(--line2)] p-3">
            <div className="flex items-center justify-between"><p className="label">Access complexity</p><AccessBars site={site} /></div>
            <p className="mt-1 text-[15px]" style={{ color: "var(--sand)" }}>{site.access.level}{site.access.score !== null && <span className="mono ml-2 text-[12px] text-[var(--mut)]">{site.access.score.toFixed(2)} / 1</span>}</p>
            {site.access.permit && <p className="mt-1 text-[12.5px] text-[var(--mut)]">• {site.access.permit} {site.access.permitUrl && <a className="underline" href={site.access.permitUrl} target="_blank" rel="noopener noreferrer">Source</a>}</p>}
            <p className="mt-1 text-[12px] text-[var(--mut)]">{site.access.basis}</p>
            <p className="mt-1 text-[12.5px] text-[var(--mut)]">• {site.access.note}</p>
            <p className="mt-2 text-[11.5px] text-[var(--dim)]">How much coordination an external field team may need. Not travel advice and not a judgement of any country.</p>
          </div>
        </>}
          {tab === "limits" && <><h4 className="label">Where the analogy breaks</h4>
          <ul className="mt-2 grid gap-1.5 text-[13px] text-[var(--mut)]">
            {site.breaks.map((b) => <li key={b} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span>{b}</li>)}
            {mission.always.map((b) => (
              <li key={b.text} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span><span>{b.text} <span className="text-[11px] text-[var(--dim)]">— {b.url ? <a className="underline" href={b.url} target="_blank" rel="noopener noreferrer">{b.source}</a> : b.source}</span></span></li>
            ))}
          </ul>
        <p className="mt-3 text-[12px] text-[var(--dim)]">Every dataset and its licence is listed in “Method &amp; sources” (top right) and in docs/sources.md.</p></>}
        </section>
      )}
    </div>
  );
}
