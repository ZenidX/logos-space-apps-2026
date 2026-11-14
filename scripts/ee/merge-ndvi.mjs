// Mete en src/data/ee-global.json el NDVI real que imprime 07_ndvi_candidatos.js.
// Uso: node scripts/ee/merge-ndvi.mjs <archivo con la línea TERRA_NDVI::[...]>
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("Falta el archivo con la salida TERRA_NDVI::[...]");
const raw = readFileSync(file, "utf8");
const m = raw.match(/TERRA_NDVI::(\[.*\])/s);
if (!m) throw new Error("No encuentro TERRA_NDVI:: en el archivo");
const rows = JSON.parse(m[1]);

const path = new URL("../../src/data/ee-global.json", import.meta.url);
const data = JSON.parse(readFileSync(path, "utf8"));
let n = 0;
for (const [t, i, v] of rows) {
  const c = data[t]?.top?.[i];
  if (!c) throw new Error(`Candidato ${t} #${i} no existe: ¿ha cambiado ee-global.json desde el 14-11?`);
  c.ndvi = v;
  n++;
}
data.notes = `ndvi of candidates restored with scripts/ee/07_ndvi_candidatos.js (${new Date().toISOString().slice(0, 10)}).`;
writeFileSync(path, JSON.stringify(data, null, 1) + "\n");
console.log(`NDVI actualizado en ${n} candidatos`);
