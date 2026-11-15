"use client";
// AI-assisted (Claude), reviewed by team Logos
// Hover (or keyboard focus) preview of a mission: its target world, what it is about, a few figures from the data file
// and its main limit. The wrapped control keeps its own click (it opens the mission). Touch screens skip the preview.
import type { ReactNode } from "react";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { EVIDENCE, byEvidence, type Mission } from "@/lib/missions";

const COLOR = { moon: "var(--moon)", mars: "var(--mars)", earth: "var(--earth)" } as const;

export default function MissionPreview({ m, at = "top", children, className = "" }: { m: Mission; at?: "top" | "bottom" | "right"; children: ReactNode; className?: string }) {
  const known = m.sites.filter((s) => s.kind === "known").length, fresh = m.sites.length - known;
  const top = byEvidence(m.sites)[0], best = Math.max(...m.sites.map((s) => s.match ?? 0));
  const body = m.target.body as "moon" | "mars", c = COLOR[body];
  return (
    <span className={`mh mh-${at} ${className}`}>
      {children}
      <span className="mh-pop glass-strong" role="presentation" aria-hidden>
        <span className="mh-head">
          <span className="mh-world" style={{ backgroundImage: `url(${GLOBE_TEX[body].lo})`, ["--c" as string]: c }} />
          <span className="min-w-0">
            <span className="mh-k" style={{ color: c }}>{body === "moon" ? "Moon" : "Mars"} · {m.target.name.split(" (")[0]}</span>
            <b className="mh-t">{m.short}</b>
          </span>
        </span>
        <span className="mh-blurb">{m.blurb}</span>
        <span className="mh-stats">
          <span><b>{m.sites.length}</b> sites<i>{known} known · {fresh} new</i></span>
          <span><b>{best.toFixed(3)}</b> best index<i>0–1, not suitability</i></span>
          <span><b style={{ color: m.validated ? "var(--earth)" : "var(--amber)" }}>{m.validated ? "Validated" : "Computed"}</b> {m.validated ? "with campaigns" : "not validated"}<i>{m.validated ? m.validation.result.split(" (")[0] : "no campaign under a real low Sun"}</i></span>
        </span>
        {top && <span className="mh-first"><span style={{ color: EVIDENCE[top.evidence].color }}>●</span> First in the list: <b>{top.name.split(",")[0]}</b>{top.campaign ? ` · ${top.campaign}` : ""}</span>}
        <span className="mh-limit">≠ {m.keyLimit}</span>
        <span className="mh-go">Click to explore <span aria-hidden>→</span></span>
      </span>
    </span>
  );
}
