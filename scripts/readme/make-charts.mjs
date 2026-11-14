// Genera los gráficos SVG del README a partir de src/data/ee-global.json.
// Uso: node scripts/readme/make-charts.mjs  →  docs/img/validation.svg
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const data = JSON.parse(readFileSync("src/data/ee-global.json", "utf8"));
const TARGETS = [
  { id: "shackleton", label: "Shackleton rim", body: "Moon" },
  { id: "jezero", label: "Jezero crater", body: "Mars" },
  { id: "arcadia", label: "Arcadia Planitia", body: "Mars" },
];

const W = 820, ML = 150, MR = 150, MT = 92, ROW = 96, MB = 56;
const H = MT + ROW * TARGETS.length + MB;
const X0 = 0.25, X1 = 0.95;
const x = (v) => ML + ((v - X0) / (X1 - X0)) * (W - ML - MR);
const f = (n) => n.toFixed(1);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Enjambre simple: apila hacia arriba/abajo los puntos que se solapan.
function swarm(values, r) {
  const placed = [];
  return values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
    .map((p) => {
      const px = x(p.v);
      for (let k = 0; ; k++) {
        const dy = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (r * 2 + 1);
        if (!placed.some((q) => Math.hypot(q.px - px, q.dy - dy) < r * 2 + 1)) {
          placed.push({ px, dy });
          return { ...p, px, dy };
        }
      }
    });
}

let body = "";
// Rejilla y eje
for (let t = 0.3; t <= 0.9001; t += 0.1) {
  body += `<line class="grid" x1="${f(x(t))}" x2="${f(x(t))}" y1="${MT - 14}" y2="${H - MB + 4}"/>`;
  body += `<text class="axis" x="${f(x(t))}" y="${H - MB + 22}" text-anchor="middle">${t.toFixed(1)}</text>`;
}
body += `<text class="axis" x="${f((ML + W - MR) / 2)}" y="${H - MB + 42}" text-anchor="middle">Similarity score (0 = nothing alike · 1 = identical position in Earth's range)</text>`;

TARGETS.forEach((t, ri) => {
  const d = data[t.id];
  const cy = MT + ROW * ri + ROW / 2;
  const { total_p50: p50, total_p90: p90 } = d.dist;
  const above50 = d.known.filter((k) => k.total > p50).length;
  const above90 = d.known.filter((k) => k.total > p90).length;
  const best = d.top[0];

  body += `<g class="row" style="animation-delay:${ri * 0.25}s">`;
  // Franja p50–p90 de toda la Tierra
  body += `<rect class="band" x="${f(x(p50))}" y="${cy - 34}" width="${f(x(p90) - x(p50))}" height="68" rx="4"/>`;
  body += `<line class="ref" x1="${f(x(p50))}" x2="${f(x(p50))}" y1="${cy - 34}" y2="${cy + 34}"/>`;
  body += `<line class="ref" x1="${f(x(p90))}" x2="${f(x(p90))}" y1="${cy - 34}" y2="${cy + 34}"/>`;
  if (ri === 0) {
    body += `<text class="refl" x="${f(x(p50))}" y="${cy - 40}" text-anchor="middle">Earth median</text>`;
    body += `<text class="refl" x="${f(x(p90))}" y="${cy - 40}" text-anchor="middle">top 10 %</text>`;
  }
  // Etiquetas de fila
  body += `<text class="lab" x="${ML - 16}" y="${cy - 2}" text-anchor="end">${t.label}</text>`;
  body += `<text class="sub" x="${ML - 16}" y="${cy + 15}" text-anchor="end">${t.body}</text>`;
  // Análogos conocidos
  for (const p of swarm(d.known.map((k) => k.total), 5)) {
    const k = d.known[p.i];
    body += `<circle class="known" cx="${f(p.px)}" cy="${f(cy + p.dy)}" r="5"><title>${esc(k.name)}: ${k.total.toFixed(2)}</title></circle>`;
  }
  // Mejor candidato nuevo
  const bx = x(best.total);
  body += `<path class="best" d="M${f(bx)} ${cy - 9} L${f(bx + 9)} ${cy} L${f(bx)} ${cy + 9} L${f(bx - 9)} ${cy} Z"><title>Best new candidate · ${esc(best.place)}: ${best.total.toFixed(2)}</title></path>`;
  // Recuento a la derecha
  body += `<text class="val" x="${W - MR + 22}" y="${cy - 2}">${above50}/25 &gt; median</text>`;
  body += `<text class="sub" x="${W - MR + 22}" y="${cy + 15}">${above90}/25 in top 10 %</text>`;
  body += `</g>`;
});

// Leyenda
const LY = 34;
body += `<circle class="known" cx="${ML + 6}" cy="${LY}" r="5"/><text class="leg" x="${ML + 18}" y="${LY + 4}">Known analog site (25)</text>`;
body += `<path class="best" d="M${ML + 206} ${LY - 8} L${ML + 214} ${LY} L${ML + 206} ${LY + 8} L${ML + 198} ${LY} Z"/><text class="leg" x="${ML + 222}" y="${LY + 4}">Best new candidate</text>`;
body += `<rect class="band" x="${ML + 380}" y="${LY - 7}" width="22" height="14" rx="3"/><text class="leg" x="${ML + 410}" y="${LY + 4}">All Earth land, median → top 10 %</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Validation: similarity scores of 25 known Earth analog sites versus the Earth-wide distribution, for three Moon and Mars targets">
<style>
  svg { --surface:#fcfcfb; --ink:#0b0b0b; --ink2:#52514e; --muted:#8a8984; --grid:#e6e5e0; --band:#cde2fb; --s1:#2a78d6; --s2:#eb6834; }
  @media (prefers-color-scheme: dark) {
    svg { --surface:#1a1a19; --ink:#f0efec; --ink2:#c3c2b7; --muted:#8f8e86; --grid:#2e2e2c; --band:#1f3a5c; --s1:#3987e5; --s2:#d95926; }
  }
  text { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }
  .bg { fill: var(--surface); }
  .grid { stroke: var(--grid); stroke-width: 1; }
  .axis { fill: var(--muted); font-size: 12px; }
  .lab { fill: var(--ink); font-size: 14px; font-weight: 600; }
  .sub { fill: var(--ink2); font-size: 12px; }
  .val { fill: var(--ink); font-size: 13px; font-weight: 600; }
  .leg { fill: var(--ink2); font-size: 12px; }
  .refl { fill: var(--ink2); font-size: 11px; }
  .band { fill: var(--band); opacity: .7; }
  .ref { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 3 3; }
  .known { fill: var(--s1); stroke: var(--surface); stroke-width: 2; }
  .best { fill: var(--s2); stroke: var(--surface); stroke-width: 2; }
  .row { opacity: 0; animation: in .7s ease-out forwards; }
  @keyframes in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .row { animation: none; opacity: 1; } }
</style>
<rect class="bg" width="100%" height="100%" rx="12"/>
${body}
</svg>
`;

mkdirSync("docs/img", { recursive: true });
writeFileSync("docs/img/validation.svg", svg);
console.log("docs/img/validation.svg written");
