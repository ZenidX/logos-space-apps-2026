import { CHALLENGE_URL, TARGET_SELECTION_NOTE, type Target } from "@/data/targets";

// Panel «¿Por qué este objetivo?»: se muestra al seleccionar Shackleton, Jezero o Arcadia.
export default function TargetWhy({ target }: { target: Target }) {
  return (
    <details className="cut mt-3" open>
      <summary className="in cursor-pointer list-none px-3 py-2 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--acc)]">
        Why this target? ▾
      </summary>
      <div className="in space-y-2 px-3 pb-3 text-xs leading-relaxed">
        <p className="text-[var(--ink)]">{target.whyChosen}</p>
        <ul className="space-y-0.5">
          {target.refs.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer" className="text-sky-300 underline">
                {r.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="border-l border-[var(--acc)] pl-2 text-[11px] text-[var(--mut)]">
          {TARGET_SELECTION_NOTE}{" "}
          <a href={CHALLENGE_URL} target="_blank" rel="noreferrer" className="text-sky-300 underline">
            Challenge statement ↗
          </a>
        </p>
      </div>
    </details>
  );
}
