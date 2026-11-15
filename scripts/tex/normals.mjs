// AI-assisted (Claude), reviewed by team Logos
// Turns a global elevation grid (simple cylindrical, west edge at 180° W, north row first) into a tangent-space
// normal map for the globes: x = east, y = north, z = up, stored as RGB 0–255 in a binary PPM.
// The relief is exaggerated (factor below) because real slopes are invisible at the size of a globe on screen.
// Usage: node scripts/tex/normals.mjs <in.raw> <width> <height> <float32le|int16be> <unit_m> <radius_m> <exaggeration> <roll_px> <out.ppm>
import { readFileSync, writeFileSync } from "node:fs";

const [inPath, W_, H_, type, unit_, radius_, k_, roll_, outPath] = process.argv.slice(2);
const W = +W_, H = +H_, unit = +unit_, R = +radius_, k = +k_, roll = +roll_;
const buf = readFileSync(inPath), dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const h = new Float64Array(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const src = j * W + ((i + roll) % W); // roll: move a 0–360° E grid to −180–180°
  h[j * W + i] = (type === "int16be" ? dv.getInt16(src * 2, false) : dv.getFloat32(src * 4, true)) * unit;
}
const out = Buffer.alloc(W * H * 3), dy = (Math.PI * R) / H;
for (let j = 0; j < H; j++) {
  const lat = 90 - ((j + 0.5) * 180) / H, dx = Math.max(0.05, Math.cos((lat * Math.PI) / 180)) * (2 * Math.PI * R) / W;
  const jn = Math.max(0, j - 1), js = Math.min(H - 1, j + 1);
  for (let i = 0; i < W; i++) {
    const e = h[j * W + ((i + 1) % W)], w = h[j * W + ((i - 1 + W) % W)], n = h[jn * W + i], s = h[js * W + i];
    const gx = (e - w) / (2 * dx), gy = (n - s) / ((js - jn) * dy); // slope towards east and towards north
    let nx = -k * gx, ny = -k * gy, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const o = (j * W + i) * 3; out[o] = Math.round((nx * 0.5 + 0.5) * 255); out[o + 1] = Math.round((ny * 0.5 + 0.5) * 255); out[o + 2] = Math.round((nz * 0.5 + 0.5) * 255);
  }
}
let min = Infinity, max = -Infinity; for (const v of h) { if (v < min) min = v; if (v > max) max = v; }
writeFileSync(outPath, Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`), out]));
console.log(`${outPath}: ${W}x${H}, elevation ${min.toFixed(0)} to ${max.toFixed(0)} m, exaggeration ×${k}`);
