// AI-assisted (Claude), reviewed by team Logos
// "D · RADIAL": large index in the centre + one ring per condition. Pure SVG; draws in ONCE (CSS), static with prefers-reduced-motion.
// Status without relying on colour: "in range" = thick arc + filled dot ●; "accepted" = thick arc + hollow dot ○; "out of range" = thin arc + cross ✕.
// The legend repeats the status in words. Styles: the .dial* rules in src/app/globals.css.
import { DIAL, GROUP_COLOR, GROUP_NAME, dialGeometry, dialLabel, type Ring, type RingGroup } from "@/lib/radial-data";

const C = DIAL.size / 2;
const Glyph = ({ status, color }: { status: Ring["status"]; color: string }) =>
  status === "in range" ? <circle r="3.4" fill={color} stroke="#04060c" strokeWidth="1.2" />
  : status === "accepted" ? <circle r="3.4" fill="#04060c" stroke={color} strokeWidth="1.8" />
  : status === "out of range" ? <path d="M-3 -3 3 3M3 -3 -3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  : null;

export default function RadialDial({ index, caption = "analog index", rings, className = "" }: { index: string; caption?: string; rings: Ring[]; className?: string }) {
  const geo = dialGeometry(rings);
  return (
    <svg viewBox={`0 0 ${DIAL.size} ${DIAL.size}`} className={`dial ${className}`} role="img" aria-label={dialLabel(index, rings)}>
      {geo.map(({ ring, r, x, y }, i) => {
        const col = GROUP_COLOR[ring.group], circ = 2 * Math.PI * r, len = (ring.value ?? 0) * circ, thin = ring.status === "out of range"; // actual lengths (no pathLength)
        return (
          <g key={ring.id}>
            <circle cx={C} cy={C} r={r} fill="none" stroke={col} strokeOpacity=".16" strokeWidth={DIAL.stroke} strokeDasharray={ring.value === null ? "1.5 5" : undefined} />
            {len > 0 && (
              <circle className="dial-arc" cx={C} cy={C} r={r} fill="none" stroke={col} strokeWidth={thin ? 3 : DIAL.stroke} strokeLinecap="round"
                strokeDasharray={`${len.toFixed(2)} ${circ.toFixed(2)}`} transform={`rotate(-90 ${C} ${C})`} style={{ ["--len" as string]: len.toFixed(2), animationDelay: `${i * 70}ms` }} />
            )}
            {ring.group === "mission" && ring.value !== null && (
              <g className="dial-cap" transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`} style={{ animationDelay: `${i * 70 + 700}ms` }}><Glyph status={ring.status} color={col} /></g>
            )}
          </g>
        );
      })}
      <text x={C} y={C + 4} textAnchor="middle" className="dial-index" style={{ fontSize: index.length > 4 ? 24 : 30 }}>{index}</text>
      <text x={C} y={C + 20} textAnchor="middle" className="dial-caption">{caption}</text>
    </svg>
  );
}

/** Legend: group, colour swatch, label, actual value and status in words. Goes to the right of the dial (desktop). */
export function RadialLegend({ rings, sources = {} }: { rings: Ring[]; sources?: Record<string, string> }) {
  const groups: RingGroup[] = ["mission", "shape", "access"];
  return (
    <div className="dial-legend">
      {groups.map((g) => (
        <section key={g}>
          <h4 style={{ color: GROUP_COLOR[g] }}>{GROUP_NAME[g]}{g === "shape" && <span className="text-[var(--dim)]"> · here / target</span>}</h4>
          <ul>
            {rings.filter((r) => r.group === g).map((r) => (
              <li key={r.id} title={sources[r.id] ? `${r.label}: ${r.text}\nSource: ${sources[r.id]}` : `${r.label}: ${r.text}`}>
                <svg viewBox="-6 -6 12 12" aria-hidden="true">{r.group === "mission" && r.value !== null ? <Glyph status={r.status} color={GROUP_COLOR[g]} /> : <rect x="-4" y="-1.5" width="8" height="3" rx="1.5" fill={GROUP_COLOR[g]} />}</svg>
                <span className="l">{r.label}</span><span className="v">{g === "shape" ? r.text.replace(/ vs (.*) target$/, " / $1") : r.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Mobile: each ring is a mini gauge (48 px ring + value) in a 4-column grid → 2 rows. */
export function RadialMini({ rings }: { rings: Ring[] }) {
  return (
    <ul className="dial-mini">
      {rings.map((r, i) => {
        const col = GROUP_COLOR[r.group], circ = 2 * Math.PI * 19, len = (r.value ?? 0) * circ;
        return (
          <li key={r.id} aria-label={`${r.label}: ${r.text}`}>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="19" fill="none" stroke={col} strokeOpacity=".18" strokeWidth="5" strokeDasharray={r.value === null ? "1.5 5" : undefined} />
              {len > 0 && <circle className="dial-arc" cx="24" cy="24" r="19" fill="none" stroke={col} strokeWidth={r.status === "out of range" ? 2.5 : 5} strokeLinecap="round" strokeDasharray={`${len.toFixed(2)} ${circ.toFixed(2)}`} transform="rotate(-90 24 24)" style={{ ["--len" as string]: len.toFixed(2), animationDelay: `${i * 50}ms` }} />}
              <g transform="translate(24 24)">{r.group === "mission" && r.value !== null ? <g transform="scale(1.5)"><Glyph status={r.status} color={col} /></g> : <text textAnchor="middle" y="4" className="dial-mini-n">{r.value === null ? "–" : Math.round(r.value * 100)}</text>}</g>
            </svg>
            <span className="l">{r.label}</span><span className="v">{r.text.split(" · ")[0].split(" vs ")[0]}</span>
          </li>
        );
      })}
    </ul>
  );
}
