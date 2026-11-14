import { LAYERS, SITES, type Layer } from "@/data/catalog";
import eeSamples from "@/data/ee-samples.json";

interface EeLayer {
  id: string;
  bandType?: { type?: string; precision?: string; min?: number | null; max?: number | null };
  nominalScale?: number;
  meta?: { n?: number; t0?: number | null; t1?: number | null };
  stats?: Record<string, number | null> | null;
  samples?: (number | null)[];
}

const ee = eeSamples as unknown as { generatedAt: string | null; layers: EeLayer[] };

const fmt = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "—" : Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : v.toFixed(d);

const date = (ms?: number | null) => (ms ? new Date(ms).toISOString().slice(0, 10) : "—");

function agencyColor(a: Layer["agency"]) {
  return a === "NASA" ? "bg-blue-600" : a === "ESA" ? "bg-emerald-600" : "bg-rose-600";
}

function LayerCard({ layer }: { layer: Layer }) {
  const data = ee.layers.find((l) => l.id === layer.id);
  const bt = data?.bandType;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{layer.name}</h3>
          <p className="text-xs text-slate-400">{layer.product}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${agencyColor(layer.agency)}`}>
          {layer.agency}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-slate-400">Earth Engine</dt>
        <dd className="truncate font-mono">{layer.eeId}</dd>
        <dt className="text-slate-400">Band</dt>
        <dd className="font-mono">{layer.band}</dd>
        <dt className="text-slate-400">Raw type</dt>
        <dd className="font-mono">
          {bt ? `${bt.precision ?? bt.type ?? "?"} [${fmt(bt.min, 0)} … ${fmt(bt.max, 0)}]` : "pending"}
        </dd>
        <dt className="text-slate-400">Resolution</dt>
        <dd>{data?.nominalScale ? `${fmt(data.nominalScale, 0)} m` : "pending"}</dd>
        <dt className="text-slate-400">Conversion</dt>
        <dd>{layer.transform}</dd>
        <dt className="text-slate-400">Images / dates</dt>
        <dd>
          {data?.meta ? `${fmt(data.meta.n, 0)} · ${date(data.meta.t0)} → ${date(data.meta.t1)}` : "pending"}
        </dd>
        <dt className="text-slate-400">Summary used</dt>
        <dd>{layer.aggregation}</dd>
      </dl>

      {data?.stats && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-slate-400">Earth range ({layer.unit}, global 50 km sampling)</p>
          <div className="grid grid-cols-5 gap-1 text-center text-[11px]">
            {(["v_min", "v_p1", "v_p50", "v_p99", "v_max"] as const).map((k) => (
              <div key={k} className="rounded bg-black/30 py-1">
                <div className="text-slate-500">{k.replace("v_", "")}</div>
                <div className="font-mono">{fmt(data.stats?.[k] ?? null)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.samples && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-slate-400">Site samples ({layer.unit})</p>
          <ul className="space-y-0.5 text-xs">
            {SITES.map((s, i) => (
              <li key={s.id} className="flex justify-between">
                <span className={s.known ? "" : "text-slate-500"}>{s.name}</span>
                <span className="font-mono">{fmt(data.samples?.[i] ?? null)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid gap-1 text-xs">
        {layer.moon && (
          <p>
            <span className="mr-1">🌕</span>
            <span className="text-slate-300">{layer.moon}</span>
          </p>
        )}
        {layer.mars && (
          <p>
            <span className="mr-1">🔴</span>
            <span className="text-slate-300">{layer.mars}</span>
          </p>
        )}
        {layer.note && <p className="text-amber-300/90">⚠ {layer.note}</p>}
      </div>
    </article>
  );
}

export default function DataTab() {
  const dims = Array.from(new Set(LAYERS.map((l) => l.dimension)));
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 p-4 text-sm">
        <h2 className="mb-1 text-lg font-bold">Data layers</h2>
        <p className="text-slate-300">
          Each Earth layer is computed in Google Earth Engine from NASA/ESA data and paired with its Moon and Mars
          counterpart (NASA PDS/Trek).
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {ee.generatedAt ? `Samples generated: ${ee.generatedAt}` : "Earth Engine samples: pending"}
        </p>
      </section>
      {dims.map((d) => (
        <section key={d}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-sky-300">{d}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {LAYERS.filter((l) => l.dimension === d).map((l) => (
              <LayerCard key={l.id} layer={l} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
