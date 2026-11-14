// Recalcula la matriz «tarea de misión → sitios terrestres» sobre TODA la rejilla de data/ee/.
// Uso: node scripts/ops/score-ops.mjs [--no-geocode]   →   src/data/operations.json
// Criterios de cada tarea en scripts/ops/tasks.mjs. Explicación en docs/estrategias-bases.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { readTiff } from "./geotiff.mjs";
import { TASKS, desirability } from "./tasks.mjs";

const GEOCODE = !process.argv.includes("--no-geocode");
const N_BEST = 5, N_ACCESS = 3, MIN_KM = 300, ACCESS_MAX_H = 6;

// ── Capas ────────────────────────────────────────────────────────────────────
const F = "data/ee/terra_features_01deg/";
const L = {};
for (const v of ["lst_day", "lst_night", "lst_max", "lst_min", "precip", "ndvi", "albedo", "slope", "elev"]) L[v] = readTiff(F + v + ".tif");
L.access_h = readTiff("data/ee/access/access_hours.tif");
L.urban = readTiff("data/ee/access/urban_fraction.tif");
// Atmósfera MERRA-2 (fase 2 de C_0), si ya está exportada como GeoTIFF.
const ATMO = {};
for (const v of ["ps_hpa", "wind_ms", "dust_aod"]) {
  const p = `data/ee/atmo/${v}.tif`;
  if (existsSync(p)) ATMO[v] = L[v] = readTiff(p);
}
const { W, H } = L.elev;

// ── Georreferencia: la del propio fichero (todas las capas comparten rejilla) ──
const G = L.elev;
for (const [k, t] of Object.entries(L)) if (t.W !== W || t.H !== H || Math.abs(t.y0 - G.y0) > 1e-6 || Math.abs(t.ry - G.ry) > 1e-9) throw new Error(`${k}: rejilla distinta de elev`);
function idx(lat, lon) {
  const r = Math.floor((G.y0 - lat) / G.ry), c = Math.floor((lon - G.x0) / G.rx);
  return r < 0 || r >= H || c < 0 || c >= W ? -1 : r * W + c;
}
const latOf = (r) => G.y0 - (r + 0.5) * G.ry;
const lonOf = (c) => G.x0 + (c + 0.5) * G.rx;
const gridName = `${G.y0.toFixed(0)}°N to ${(G.y0 - H * G.ry).toFixed(0)}°, ${G.rx.toFixed(3)}° × ${G.ry.toFixed(3)}°`;
// Comprobación: las altitudes de los candidatos de ee-global.json (directas de EE) deben cuadrar.
const global = JSON.parse(readFileSync("src/data/ee-global.json", "utf8"));
const ref = ["shackleton", "jezero", "arcadia"].flatMap((t) => global[t].top).filter((c) => Number.isFinite(c.elev));
const elevErr = ref.reduce((s, c) => s + Math.abs((G.data[idx(c.c[1], c.c[0])] ?? NaN) - c.elev || 0), 0) / ref.length;
console.log(`Rejilla ${gridName}; error medio de altitud frente a ee-global: ${elevErr.toFixed(0)} m`);
if (elevErr > 200) console.warn("⚠ La rejilla no cuadra con ee-global.json: revisa la georreferencia de data/ee/");
// NDVI: el asset del 14-11 lo tenía ×1e-4 de más; los GeoTIFF corregidos ya vienen bien. Se detecta por el rango.
let ndviMax = 0;
for (const v of L.ndvi.data) if (v > ndviMax) ndviMax = v;
const NDVI_FIX = ndviMax < 0.01 ? 10000 : 1;
console.log(`NDVI máx. ${ndviMax.toExponential(2)} → factor ${NDVI_FIX}`);

// ── Variables por celda ──────────────────────────────────────────────────────
const ok = (x) => Number.isFinite(x);
function vars(i) {
  const g = (k) => (L[k] ? L[k].data[i] : NaN);
  const r = Math.floor(i / W);
  const elev = g("elev"), lst_day = g("lst_day"), lst_night = g("lst_night");
  const v = {
    lat: latOf(r), abs_lat: Math.abs(latOf(r)),
    lst_day, lst_night, lst_max: g("lst_max"), lst_min: g("lst_min"),
    lst_mean: ok(lst_day) && ok(lst_night) ? (lst_day + lst_night) / 2 : NaN,
    precip: g("precip"),
    ndvi: g("ndvi") * NDVI_FIX,
    albedo: g("albedo"), slope: g("slope"), elev,
    access_h: g("access_h"), urban: g("urban"),
    // Presión: MERRA-2 si existe; si no, atmósfera estándar desde la altitud (proxy declarado).
    ps_hpa: ATMO.ps_hpa ? g("ps_hpa") : ok(elev) ? 1013.25 * Math.pow(1 - 2.25577e-5 * elev, 5.25588) : NaN,
    wind_ms: g("wind_ms"), dust_aod: g("dust_aod"),
  };
  return v;
}
// Tierra firme útil: fuera mar/hielo de borde (sin LST), ciudades (>5 %) y costa con agua (albedo < 0,08), como la v2/v3.
const usable = (v) => ok(v.lst_min) && ok(v.albedo) && v.albedo >= 0.08 && !(v.urban > 0.05);

function scoreTask(task, v) {
  let num = 0, den = 0;
  for (const c of task.criteria) {
    const x = v[c.var];
    if (!ok(x)) {
      if (c.optional) continue; // capa aún no disponible (MERRA-2): se omite el criterio
      return NaN;
    }
    const d = desirability(c.rule, x);
    if (d === 0) return 0;
    num += c.w * Math.log(d);
    den += c.w;
  }
  return den ? Math.exp(num / den) : NaN;
}

// ── Análogos conocidos (misma lista que scripts/ee/10_tres_fases.js) ─────────
const src10 = readFileSync("scripts/ee/10_tres_fases.js", "utf8");
const KNOWN = JSON.parse(src10.match(/var KNOWN = (\[\[.*?\]\]);/s)[1].replace(/'/g, '"')).map(([name, lat, lon]) => ({ name, lat, lon }));

// ── Puntuación global ────────────────────────────────────────────────────────
const N = W * H;
const V = new Array(N);
for (let i = 0; i < N; i++) {
  const v = vars(i);
  V[i] = usable(v) ? v : null;
}
const km = (a, b) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const round = (x, d = 2) => (ok(x) ? +x.toFixed(d) : null);
const SHOW = ["lat", "lst_min", "lst_max", "lst_mean", "precip", "ndvi", "albedo", "slope", "elev", "ps_hpa", "wind_ms", "dust_aod", "access_h"];
function siteValues(task, v) {
  const keys = new Set([...task.criteria.map((c) => c.var), "access_h", "elev"]);
  return Object.fromEntries(SHOW.filter((k) => keys.has(k) || (k === "lat" && keys.has("abs_lat"))).map((k) => [k, round(v[k], k === "ndvi" || k === "albedo" || k === "dust_aod" ? 3 : 1)]));
}
function pick(order, S, n, filter = () => true) {
  const out = [];
  for (const i of order) {
    if (out.length >= n) break;
    const v = V[i];
    if (!filter(v)) continue;
    const p = { lat: latOf(Math.floor(i / W)), lon: lonOf(i % W) };
    if (out.some((q) => km(q, p) < MIN_KM)) continue;
    out.push({ ...p, i, score: S[i] });
  }
  return out;
}

const results = [];
for (const task of TASKS) {
  let S = new Float32Array(N).fill(NaN);
  for (let i = 0; i < N; i++) if (V[i]) S[i] = scoreTask(task, V[i]);
  if (task.window) {
    const r = task.window, M = new Float32Array(N).fill(NaN);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!ok(S[i])) continue;
        let s = 0, n = 0;
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const yy = y + dy, xx = (x + dx + W) % W;
            if (yy < 0 || yy >= H) continue;
            const q = S[yy * W + xx];
            s += ok(q) ? q : 0; // mar o hielo cuentan como terreno no transitable
            n++;
          }
        M[i] = Math.min(S[i], s / n) ** 0.5 * S[i] ** 0.5; // la celda y su entorno
      }
    S = M;
  }
  const order = [];
  for (let i = 0; i < N; i++) if (S[i] > 0) order.push(i);
  const acc = (i) => (ok(V[i].access_h) && V[i].access_h >= 0 ? V[i].access_h : 1e9);
  order.sort((a, b) => Math.round(S[b] * 100) - Math.round(S[a] * 100) || acc(a) - acc(b)); // empate → más accesible
  const fmt = (p) => {
    const near = KNOWN.map((k) => ({ k, d: km(k, p) })).sort((a, b) => a.d - b.d)[0];
    return {
      lat: round(p.lat), lon: round(p.lon), score: round(p.score),
      nearKnown: near.d < 200 ? near.k.name : null,
      values: siteValues(task, V[p.i]),
    };
  };
  const best = pick(order, S, N_BEST).map(fmt);
  const accessible = pick(order, S, N_ACCESS, (v) => ok(v.access_h) && v.access_h >= 0 && v.access_h <= ACCESS_MAX_H).map(fmt);
  const known = KNOWN.map((k) => {
    const i = idx(k.lat, k.lon);
    return { name: k.name, score: i >= 0 && V[i] ? round(S[i]) : null };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const usedOptional = task.criteria.filter((c) => c.optional).map((c) => ({ var: c.var, available: !!ATMO[c.var] }));
  results.push({ ...task, criteria: task.criteria.map(({ rule, ...c }) => ({ ...c, rule: `${rule.fn}(${rule.p.join(", ")})` })), optionalLayers: usedOptional, best, accessible, known });
  console.log(`${task.id.padEnd(17)} mejor ${best[0]?.score} · ${best.map((b) => `${b.lat},${b.lon}`).join(" | ")}`);
}

// Candidatos de ee-global: qué tareas puede alojar cada uno (top 5 por objetivo).
const candidates = {};
for (const t of ["shackleton", "jezero", "arcadia"]) {
  candidates[t] = global[t].top.slice(0, 5).map((c) => {
    const i = idx(c.c[1], c.c[0]);
    const v = i >= 0 ? V[i] : null;
    return { place: c.place, lat: c.c[1], lon: c.c[0], tasks: Object.fromEntries(TASKS.map((task) => [task.id, v ? round(scoreTask(task, v)) : null])) };
  });
}

// ── Nombres de lugar (OpenStreetMap Nominatim, caché local) ──────────────────
const CACHE = "scripts/ops/geocode-cache.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
async function place(lat, lon) {
  const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  if (key in cache) return cache[key];
  if (!GEOCODE) return null;
  await new Promise((r) => setTimeout(r, 1100)); // política de uso: 1 petición/s
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=8&accept-language=en&lat=${lat}&lon=${lon}`, { headers: { "User-Agent": "terra-analog-ops-script/1.0" } });
    const j = await res.json();
    const a = j.address ?? {};
    cache[key] = j.error ? null : [a.state ?? a.region ?? a.archipelago ?? a.province ?? a.county, a.country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
  return cache[key];
}
for (const r of results) for (const s of [...r.best, ...r.accessible]) s.place = (await place(s.lat, s.lon)) ?? (s.lat < -60 ? "Antarctica" : null);
writeFileSync(CACHE, JSON.stringify(cache, null, 1));

writeFileSync(
  "src/data/operations.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "scripts/ops/score-ops.mjs over data/ee/ GeoTIFFs (0.1° grid); criteria in scripts/ops/tasks.mjs; method in docs/estrategias-bases.md",
      grid: gridName,
      proxies: [
        ATMO.ps_hpa ? null : "ps_hpa estimated from elevation (standard atmosphere) until MERRA-2 surface pressure is available",
        ATMO.dust_aod ? null : "dust_aod and wind_ms (MERRA-2) not available yet: dust criteria are skipped",
        NDVI_FIX !== 1 ? "ndvi corrected ×10 000 (asset exported with the scale factor applied twice)" : null,
      ].filter(Boolean),
      selection: { best: N_BEST, accessible: N_ACCESS, accessibleMaxHours: ACCESS_MAX_H, minSeparationKm: MIN_KM },
      tasks: results,
      candidates,
    },
    null,
    1,
  ),
);
console.log("src/data/operations.json escrito");

// ── Tabla del §5 de docs/estrategias-bases.md (entre <!-- ops:start --> y <!-- ops:end -->) ──
const DOC = "docs/estrategias-bases.md";
if (existsSync(DOC)) {
  const T = { shackleton: "Shackleton", jezero: "Jezero", arcadia: "Arcadia" };
  const site = (s) => `${s.place ?? `${s.lat}, ${s.lon}`} (${s.score.toFixed(2)}${ok(s.values.access_h) && s.values.access_h >= 0 ? `, ${s.values.access_h < 10 ? s.values.access_h.toFixed(1) : Math.round(s.values.access_h)} h` : ""})`;
  const rows = results.map((r) => {
    const cond = r.criteria.map((c) => `\`${c.var}\` ${c.rule}${c.optional && !r.optionalLayers.find((o) => o.var === c.var)?.available ? " *(sin dato aún)*" : ""}`).join("<br>");
    const known = r.known.filter((k) => k.score >= 0.9).map((k) => k.name).join(", ") || "—";
    return `| **${r.name}**<br>\`${r.id}\` | ${r.targets.map((t) => T[t]).join(", ")} | ${cond} | ${r.best.slice(0, 3).map(site).join("<br>")} | ${r.accessible.slice(0, 2).map(site).join("<br>") || "—"} | ${known} |`;
  });
  const table = [
    `_Generado el ${new Date().toISOString().slice(0, 10)} con \`node scripts/ops/score-ops.mjs\` · rejilla ${gridName} · ${operationsProxies().join(" · ")}. Entre paréntesis: nota de la tarea (0–1) y horas hasta la ciudad más cercana._`,
    "",
    "| Tarea | Objetivos | Condiciones (variable y regla) | Mejores sitios de la Tierra | Accesibles (≤ 6 h) | Análogos conocidos ≥ 0,9 |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
  const doc = readFileSync(DOC, "utf8").replace(/<!-- ops:start -->[\s\S]*?<!-- ops:end -->/, `<!-- ops:start -->\n${table}\n<!-- ops:end -->`);
  writeFileSync(DOC, doc);
  console.log("Tabla de docs/estrategias-bases.md actualizada");
}
function operationsProxies() {
  return [ATMO.ps_hpa ? "presión MERRA-2" : "presión estimada desde la altitud [proxy]", ATMO.dust_aod ? "polvo y viento MERRA-2" : "sin polvo ni viento MERRA-2 todavía"];
}
