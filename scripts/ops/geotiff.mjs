// Lector mínimo de los GeoTIFF de data/ee/ (float32, tiles, deflate, sin predictor), sin dependencias.
// Devuelve { W, H, data, x0, y0, rx, ry } con la georreferencia del propio fichero y sin dato = NaN.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

export function readTiff(path) {
  const b = readFileSync(path);
  const le = b.toString("ascii", 0, 2) === "II";
  const u16 = (o) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
  const u32 = (o) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
  const f64 = (o) => (le ? b.readDoubleLE(o) : b.readDoubleBE(o));
  const ifd = u32(4);
  const tags = {};
  for (let i = 0; i < u16(ifd); i++) {
    const e = ifd + 2 + i * 12, tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
    const size = { 3: 2, 4: 4, 12: 8, 5: 8 }[type] ?? 1;
    const at = cnt * size > 4 ? u32(e + 8) : e + 8;
    if (type === 2) {
      tags[tag] = b.toString("ascii", at, at + cnt).split(String.fromCharCode(0))[0];
      continue;
    }
    const vals = [];
    for (let k = 0; k < Math.min(cnt, 4096); k++) vals.push(type === 3 ? u16(at + k * 2) : type === 4 ? u32(at + k * 4) : type === 12 ? f64(at + k * 8) : 0);
    tags[tag] = vals;
  }
  const W = tags[256][0], H = tags[257][0], comp = tags[259][0];
  if (tags[258][0] !== 32 || tags[339]?.[0] !== 3) throw new Error(`${path}: se esperaba float32`);
  if (tags[317] && tags[317][0] !== 1) throw new Error(`${path}: predictor no soportado`);
  if (!tags[322]) throw new Error(`${path}: se esperaban tiles`);
  const TW = tags[322][0], TH = tags[323][0], offs = tags[324], lens = tags[325];
  const across = Math.ceil(W / TW);
  const out = new Float32Array(W * H).fill(NaN);
  offs.forEach((off, t) => {
    let raw = b.subarray(off, off + lens[t]);
    if (comp === 8 || comp === 32946) raw = inflateSync(raw);
    else if (comp !== 1) throw new Error(`${path}: compresión ${comp} no soportada`);
    const tx = (t % across) * TW, ty = Math.floor(t / across) * TH;
    for (let y = 0; y < TH && ty + y < H; y++)
      for (let x = 0; x < TW && tx + x < W; x++) {
        const o = (y * TW + x) * 4;
        out[(ty + y) * W + tx + x] = le ? raw.readFloatLE(o) : raw.readFloatBE(o);
      }
  });
  // Georreferencia: ModelTransformation (34264) o tie point (33922) + escala (33550).
  let x0, y0, rx, ry;
  if (tags[34264]) {
    const m = tags[34264];
    [rx, x0, ry, y0] = [m[0], m[3], -m[5], m[7]];
  } else {
    [x0, y0, rx, ry] = [tags[33922][3], tags[33922][4], tags[33550][0], tags[33550][1]];
  }
  // Sin dato: GDAL_NODATA (42113) si existe, y siempre −9999 y ±Infinity.
  const nd = tags[42113] != null ? parseFloat(tags[42113]) : -9999;
  for (let i = 0; i < out.length; i++) if (out[i] === nd || out[i] === -9999 || !Number.isFinite(out[i])) out[i] = NaN;
  return { W, H, data: out, x0, y0, rx, ry };
}
