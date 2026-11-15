// Junta las tres fases y escribe src/data/ee-global.json (v3).
// Entrada: una carpeta con shortlist_{t}.geojson y known_{t}.geojson (descargas de 10_tres_fases.js)
// y un JSON de meta con los percentiles de la fase 1 y los rangos p1–p99 por objetivo.
// Uso: node scripts/ee/merge-tres-fases.mjs <carpeta> <meta.json>
//   Fase 1 (ya aplicada en Earth Engine): forma ≥ p95 de la tierra firme → lista corta.
//   Fase 2: sobreviven las celdas de la lista corta con clima ≥ p90 de esa lista.
//   Fase 3: los supervivientes se ordenan por tiempo de viaje a la ciudad; se eligen 20 separados ≥ 300 km.
import fs from "node:fs";
import path from "node:path";

const [dir, metaPath] = process.argv.slice(2);
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const OUT = "src/data/ee-global.json";
const old = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const r3 = (v) => (v == null ? null : Math.round(v * 1000) / 1000);
const r2 = (v) => (v == null ? null : Math.round(v * 100) / 100);
const pct = (arr, q) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))];
};
const hav = (a, b) => {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[1] - a[1]) * t, dLon = (b[0] - a[0]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// caché de nombres de lugar ya resueltos
const cache = {};
for (const t of ["shackleton", "jezero", "arcadia"]) for (const o of old[t]?.top ?? []) if (o.place) cache[o.c.join(",")] = o.place;
async function place(c) {
  const k = c.join(",");
  if (k in cache) return cache[k];
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=6&accept-language=en&lat=${c[1]}&lon=${c[0]}`, {
      headers: { "User-Agent": "terra-analog-hackathon/0.1" },
    });
    const j = await r.json();
    const a = j.address || {};
    cache[k] = [a.state || a.region || a.county || a.province || a.island || j.name, a.country].filter(Boolean).join(", ") || null;
  } catch {
    cache[k] = null;
  }
  await sleep(1100);
  return cache[k];
}

const out = {
  generatedAt: new Date().toISOString(),
  version: 3,
  source:
    "Google Earth Engine · terra_features_01deg + terra_atmo_01deg (NASA MERRA-2) + terra_access_01deg (Oxford MAP, MODIS MCD12Q1) · scripts/ee/10_tres_fases.js + merge-tres-fases.mjs",
  method:
    "Three phases. 1 Geographic form = mean(Surface[NDVI, albedo], Relief[slope]); shortlist = form ≥ Earth land p95. 2 Climate conditioning = mean(Climate[MODIS day/night/max/min surface temperature, GPM rainfall], Atmosphere[MERRA-2 surface pressure, 10 m wind, humidity, dust optical depth]); survivors = climate ≥ p90 of the shortlist. 3 Accessibility: survivors ordered by travel time to the nearest city (Oxford MAP, Weiss et al. 2018), 20 picked ≥ 300 km apart. Similarity per variable = 1 − |pos(cell) − pos(target)| inside Earth's p1–p99 range. Excluded: 25 catalogued analogs (300 km), cells >5 % urban, cells with albedo < 0.08 (coastal water).",
  ranges: meta.ranges,
};

for (const t of ["shackleton", "jezero", "arcadia"]) {
  const sl = JSON.parse(fs.readFileSync(path.join(dir, `shortlist_${t}.geojson`), "utf8")).features;
  const kn = JSON.parse(fs.readFileSync(path.join(dir, `known_${t}.geojson`), "utf8")).features;
  const climas = sl.map((f) => f.properties.clima).filter((v) => v != null);
  const thr2 = pct(climas, 0.9);
  const survivors = sl.filter((f) => f.properties.clima != null && f.properties.clima >= thr2);
  // Fase 3: por accesibilidad (menos horas primero); separados ≥ 300 km
  survivors.sort((a, b) => (a.properties.access_h ?? 1e9) - (b.properties.access_h ?? 1e9));
  const top = [];
  for (const f of survivors) {
    if (top.length >= 20) break;
    const c = f.geometry.coordinates;
    if (!top.every((o) => hav(o.c, c) >= 300)) continue;
    const p = f.properties;
    top.push({
      c: [r3(c[0]), r3(c[1])],
      forma: r3(p.forma),
      superficie: r3(p.superficie),
      relieve: r3(p.relieve),
      clima: r3(p.clima),
      clima_t: r3(p.clima_t),
      atmos: r3(p.atmos),
      accesibilidad: r3(p.accesibilidad),
      access_h: r2(p.access_h),
      total: r3((p.forma + p.clima) / 2), // analogía (fases 1 + 2); la accesibilidad va aparte (fase 3)
      lst_day: r2(p.lst_day),
      lst_min: r2(p.lst_min),
      precip: r2(p.precip),
      ps_hpa: r2(p.ps_hpa),
      wind_ms: r2(p.wind_ms),
      qv_gkg: r2(p.qv_gkg),
      dust_aod: r3(p.dust_aod),
      ndvi: r3(p.ndvi),
      albedo: r3(p.albedo),
      slope: r2(p.slope),
      elev: p.elev == null ? null : Math.round(p.elev),
    });
  }
  for (const o of top) o.place = await place(o.c);
  const fp = meta.forma[t];
  const known = kn.map((f, i) => {
    const p = f.properties;
    const name = old[t]?.known?.[i]?.name ?? p.name;
    const pass1 = p.forma != null && p.forma >= fp.forma_p95;
    return { name, total: r3(p.forma), forma: r3(p.forma), clima: r3(p.clima), pass1, pass2: pass1 && p.clima != null && p.clima >= thr2 };
  });
  out[t] = {
    // dist = percentiles de la FORMA en toda la tierra firme (la validación de la web compara la fase 1)
    dist: { total_p50: r3(fp.forma_p50), total_p90: r3(fp.forma_p90), total_p99: r3(fp.forma_p99) },
    phases: {
      thr1: r3(fp.forma_p95),
      shortlist: sl.length,
      thr2: r3(thr2),
      survivors: survivors.length,
    },
    known,
    top,
  };
  const k1 = known.filter((k) => k.pass1).length, k2 = known.filter((k) => k.pass2).length;
  console.log(`${t}: fase1 ${sl.length} celdas (forma ≥ ${r3(fp.forma_p95)}) → fase2 ${survivors.length} (clima ≥ ${r3(thr2)}) → fase3 top ${top.length} | conocidos: ${k1}/25 pasan fase 1, ${k2}/25 fase 2`);
  console.log("   ", top.slice(0, 6).map((o, i) => `#${i + 1} ${o.place} (${o.access_h} h, forma ${o.forma}, clima ${o.clima})`).join(" | "));
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log("escrito", OUT);
