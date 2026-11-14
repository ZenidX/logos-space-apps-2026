// AI-assisted (Claude), reviewed by team Logos
import dynamic from "next/dynamic";
import Count from "@/components/Count";
import { fmt, idx, type Mission, type Site } from "@/lib/missions";
import ConditionStrip, { hasStrip, rangeText } from "@/components/ConditionStrip";
import detailsRaw from "@/data/site-details.json";

interface Details {
  when?: { surfaceTempC?: (number | null)[] | null };
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
      <p className="label">Ground temperature by month</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label={`Monthly ground temperature here: ${Math.min(...v).toFixed(0)} to ${hi.toFixed(0)} degrees Celsius.`}>
        {lo < 0 && hi > 0 && <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="var(--line2)" strokeWidth={1} />}
        {targetC !== null && <><line x1={0} x2={W} y1={y(targetC)} y2={y(targetC)} stroke="var(--mars)" strokeDasharray="4 3" strokeWidth={1} /><text x={W - 2} y={y(targetC) - 3} textAnchor="end" fontSize="9" fill="var(--mars)" fontFamily="var(--mono)">{targetName} mean {targetC.toFixed(0)} °C</text></>}
        <polyline className="line-draw" points={pts} fill="none" stroke="var(--earth)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} />
        {v.map((c, i) => (c === hi || c === Math.min(...v)) && <text key={i} x={x(i)} y={y(c) + (c === hi ? -4 : 11)} textAnchor="middle" fontSize="9" fill="var(--ink)" fontFamily="var(--mono)">{c.toFixed(0)}°</text>)}
      </svg>
      <p className="text-[11.5px] text-[var(--dim)]">NASA POWER climatology 2001–2025 (MERRA-2 model cell of about 50 km, not a station).</p>
    </div>
  );
}

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
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full" role="img" aria-label={`Noon Sun elevation by month at this site: from ${Math.max(0, Math.min(...v)).toFixed(0)} to ${Math.max(...v).toFixed(0)} degrees.`}>
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
        {low ? <>Lowest noon Sun: <b className="text-[var(--ink)]">{full[low.i]}</b>, about {low.d.toFixed(0)}° above the horizon{v.some((d) => d <= 0) && "; the Sun stays below the horizon at noon in the darkest months"}.</> : "The Sun stays below the horizon at noon all year at this latitude."}
        {targetMax !== null && (low && low.d <= targetMax + 8 ? " That is close to the target's grazing light: the best season to rehearse low-Sun work here." : " It never gets as low as at the target, so low-Sun work here needs night operations with artificial light.")}
      </p>
    </div>
  );
}

export default function SitePanel({ site, mission, onBack }: { site: Site; mission: Mission; onBack: () => void }) {
  const t = mission.target;
  const matchVars = site.vars.filter((v) => v.inMatch);
  const tSun = t.values.sun_max_deg?.value ?? null;
  const targetShort = t.name.split(" (")[0];
  const det = DETAILS[site.id], how = det?.how;
  const H = ({ children }: { children: React.ReactNode }) => <h4 className="display text-[26px] leading-none">{children}</h4>;
  return (
    <div className="stagger">
      <button onClick={onBack} className="back-btn label -ml-1 px-1 py-2 hover:text-[var(--ink)]">← All sites</button>
      <header className="mt-1 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><KindChip kind={site.kind} />{site.campaign && <span className="text-[12.5px] text-[var(--mut)]">Used by: {site.campaign}</span>}</div>
          <h3 className="place mt-2 text-[36px] leading-[1.02]">{site.name}</h3>
          <p className="text-[13.5px] text-[var(--mut)]">{site.country} <span className="mono text-[12px] text-[var(--dim)]">· {site.lat.toFixed(2)}°, {site.lon.toFixed(2)}°</span></p>
          <p className="mt-0.5 text-[12px] text-[var(--dim)]">{site.kind === "new" ? `A region of ${site.areaKm2 ? `about ${Math.round(site.areaKm2).toLocaleString("en")} km²` : "several cells"} to investigate, not a surveyed site.` : "Values describe the 0.1° cell (~11 km) around the site."}</p>
        </div>
        <div className="rounded-xl border border-[var(--line2)] px-4 py-2 md:text-right">
          <p className="label">Analog index · 0 to 1</p>
          <p className="mono text-[44px] leading-none tracking-[-.04em]"><Count value={site.match} ms={900} /></p>
          {site.percentile !== null && <p className="text-[12px] text-[var(--mut)]">higher than {site.percentile.toFixed(1)} % of land cells</p>}
          <p className="text-[11px] text-[var(--dim)]">a ranking index, not a probability</p>
        </div>
      </header>

      <p className="mt-3 rounded-lg border p-2 text-[12.5px]" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>▲ {mission.keyLimit}</p>

      <div className="mt-5 grid gap-x-6 gap-y-6 md:grid-cols-2">
        <section className="md:col-span-2">
          <H>Shape</H>
          <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">The ground here next to <i className="place text-[15px]">{targetShort}</i>, at the same scale.</p>
          <TerrainCompare siteId={site.id} targetId={`target-${mission.id}`} targetSunDeg={tSun} />
        </section>

        <section>
          <H>Why</H>
          <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">Each condition is checked against the <b>range the mission needs</b> (solid band; dashed = still accepted), not against the target&apos;s exact value. The dot is this site; the tick is the target.</p>
          <ul className="grid gap-1.5">
            {matchVars.map((v) => {
              const def = mission.variables.find((x) => x.id === v.id), tval = t.values[v.id], tv = tval?.value ?? null, est = /approx|^estimate/i.test(tval?.source ?? "");
              const strip = def && v.value !== null && hasStrip(v.id, def.ideal, def.tolerance);
              const met = v.similarity !== null && v.similarity >= 0.5;
              return (
                <li key={v.id} className="rounded-lg border border-[var(--line)] p-2 text-[13px]">
                  <div className="flex items-baseline justify-between gap-2"><span>{v.label}</span><span className="mono text-[11.5px]" style={{ color: v.similarity === null ? "var(--dim)" : met ? "var(--earth)" : "var(--amber)" }}>{v.similarity === null ? "no data" : met ? "in range" : "out of range"} · fit {idx(v.similarity)}</span></div>
                  {strip && def ? (
                    <>
                      <ConditionStrip id={v.id} label={v.label} ideal={def.ideal!} tolerance={def.tolerance!} value={v.value!} target={tv} targetEstimate={est} unit={v.unit} />
                      <div className="mono text-[11.5px] text-[var(--mut)]">here {fmt(v.value, v.unit)} · mission needs {rangeText(def.ideal!, v.unit)}</div>
                    </>
                  ) : (
                    <div className="mono mt-0.5 text-[11.5px] text-[var(--mut)]">{v.id === "volcanic" ? (v.value === 1 ? "basic volcanic rock mapped within ~80 km" : v.value === 0 ? "no basic volcanic rock mapped within ~80 km" : "no data") : `here ${fmt(v.value, v.unit)}`}</div>
                  )}
                  {def?.why && <div className="mt-0.5 text-[11.5px] text-[var(--dim)]">{def.why}</div>}
                </li>
              );
            })}
            {mission.notScored.map((n) => <li key={n} className="flex gap-2 px-2 text-[12.5px] text-[var(--dim)]"><span aria-hidden>◌</span>Not scored: {n}</li>)}
          </ul>
        </section>

        <section>
          <H>When</H>
          <p className="mb-2 mt-1 text-[13px] text-[var(--mut)]">Noon Sun height through the year, computed from latitude only (terrain ignored).</p>
          <SunChart lat={site.lat} targetMax={t.body === "moon" ? tSun : null} targetName={targetShort} />
          {det?.when?.surfaceTempC && <TempChart t={det.when.surfaceTempC} targetC={t.values.lst_mean?.value ?? null} targetName={targetShort} />}
          {t.body === "moon" && <p className="mt-1 text-[12px] text-[var(--dim)]">NASA&apos;s JETT3 test rehearsed the low polar Sun with night moonwalks and a lighting cart; JETT5 used a portable spotlight acting as the Sun (USGS).</p>}
        </section>

        <section>
          <H>How</H>
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
          {how && (
            <dl className="mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12.5px]">
              {how.nearestCity50k && <><dt className="text-[var(--dim)]">Nearest city</dt><dd>{how.nearestCity50k.name}, {how.nearestCity50k.country} · {Math.round(how.nearestCity50k.straightLineKm).toLocaleString("en")} km</dd></>}
              <dt className="text-[var(--dim)]">Travel time</dt><dd>{how.travelTimeToCityHours != null ? `about ${how.travelTimeToCityHours < 10 ? how.travelTimeToCityHours.toFixed(1) : Math.round(how.travelTimeToCityHours)} h to a city (2015 model)` : "no data"}</dd>
              {how.nearestLargeAirport && <><dt className="text-[var(--dim)]">Large airport</dt><dd>{how.nearestLargeAirport.name}{how.nearestLargeAirport.iata ? ` (${how.nearestLargeAirport.iata})` : ""} · {Math.round(how.nearestLargeAirport.straightLineKm).toLocaleString("en")} km</dd></>}
            </dl>
          )}
          {how && <p className="mt-1 text-[11.5px] text-[var(--dim)]">Straight-line distances, not routes; the nearest city or airport may be in another country.</p>}
          <div className="mt-3 rounded-xl border border-[var(--line2)] p-3">
            <div className="flex items-center justify-between"><p className="label">Access complexity</p><AccessBars site={site} /></div>
            <p className="mt-1 text-[15px]" style={{ color: "var(--sand)" }}>{site.access.level}{site.access.score !== null && <span className="mono ml-2 text-[12px] text-[var(--mut)]">{site.access.score.toFixed(2)} / 1</span>}</p>
            {site.access.permit && <p className="mt-1 text-[12.5px] text-[var(--mut)]">• {site.access.permit}</p>}
            <p className="mt-1 text-[12px] text-[var(--mut)]">{site.access.basis}</p>
            <p className="mt-1 text-[12.5px] text-[var(--mut)]">• {site.access.note}</p>
            <p className="mt-2 text-[11.5px] text-[var(--dim)]">How much coordination an external field team may need. Not travel advice and not a judgement of any country.</p>
          </div>
        </section>

        <section>
          <H>Where it breaks</H>
          <ul className="mt-2 grid gap-1.5 text-[13px] text-[var(--mut)]">
            {site.breaks.map((b) => <li key={b} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span>{b}</li>)}
            {mission.always.map((b) => (
              <li key={b.text} className="flex gap-2"><span className="text-[var(--amber)]" aria-hidden>≠</span><span>{b.text} <span className="text-[11px] text-[var(--dim)]">— {b.url ? <a className="underline" href={b.url} target="_blank" rel="noopener noreferrer">{b.source}</a> : b.source}</span></span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
