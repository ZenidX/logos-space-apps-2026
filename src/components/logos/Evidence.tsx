// AI-assisted (Claude), reviewed by team Logos
// Evidence level of a site: four pips (more filled = stronger independent evidence) and, optionally, its name.
// The level is never shown by colour alone: the pips and the text carry the same information.
import { EVIDENCE, type Evidence } from "@/lib/logos/missions";

export default function EvidenceBadge({ level, compact = false, className = "" }: { level: Evidence; compact?: boolean; className?: string }) {
  const e = EVIDENCE[level];
  return (
    <span className={`ev ${className}`} style={{ ["--ev" as string]: e.color }} title={`${e.label}. ${e.note}`} role="img" aria-label={`Evidence: ${e.label}`}>
      <span className="ev-pips" aria-hidden>{[1, 2, 3, 4].map((i) => <i key={i} className={i <= e.pips ? "f" : ""} />)}</span>
      {!compact && <span aria-hidden>{e.label}</span>}
    </span>
  );
}
