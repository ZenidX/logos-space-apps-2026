// Cargadores de terreno para el visor 3D.
// Cada cargador devuelve una malla de alturas (m) y una textura para una caja de lat/lon.

export interface TerrainData {
  heights: Float32Array; // n × n, fila 0 = norte
  n: number;
  widthM: number; // extensión este-oeste en metros
  heightM: number; // extensión norte-sur en metros
  texture: HTMLCanvasElement; // relieve neutro: misma apariencia en Tierra, Luna y Marte
  imagery?: HTMLCanvasElement | null; // solo Tierra: foto de satélite (opcional)
  minH: number;
  maxH: number;
  source: string; // atribución
  resolutionM: number; // resolución aproximada del dato de elevación
}

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export const cellBBox = (lat: number, lon: number, sizeDeg = 0.1): BBox => ({
  west: lon - sizeDeg / 2,
  east: lon + sizeDeg / 2,
  south: lat - sizeDeg / 2,
  north: lat + sizeDeg / 2,
});

// Con tiempo máximo: una tesela que no responde no puede dejar el visor «cargando» para siempre.
const loadImage = (url: string, timeoutMs = 15000) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = "";
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Could not load ${url}`));
    };
    img.src = url;
  });

// Zoom de teselas Web Mercator que da ≈ `mPerPx` metros por píxel a esta latitud.
// Cerca de los polos las teselas encogen (cos lat): con un zoom fijo, 11 km a 82°N eran ~1.300 teselas.
const zoomFor = (lat: number, mPerPx: number, min: number, max: number) => {
  const circ = 40075016 * Math.cos((lat * Math.PI) / 180);
  return Math.max(min, Math.min(max, Math.ceil(Math.log2(circ / (256 * mPerPx)))));
};

// ---------- Web Mercator (Tierra) ----------
const lon2x = (lon: number, z: number) => ((lon + 180) / 360) * 2 ** z;
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};

// Mosaico de teselas XYZ recortado exactamente a la caja, en un canvas de `size` px.
async function mercatorMosaic(template: string, bbox: BBox, z: number, size: number) {
  const x0 = lon2x(bbox.west, z);
  const x1 = lon2x(bbox.east, z);
  const y0 = lat2y(bbox.north, z);
  const y1 = lat2y(bbox.south, z);
  const tiles: Promise<{ tx: number; ty: number; img: HTMLImageElement }>[] = [];
  for (let tx = Math.floor(x0); tx <= Math.floor(x1); tx++) {
    for (let ty = Math.floor(y0); ty <= Math.floor(y1); ty++) {
      const url = template.replace("{z}", String(z)).replace("{x}", String(tx)).replace("{y}", String(ty));
      tiles.push(loadImage(url).then((img) => ({ tx, ty, img })));
    }
  }
  const loaded = await Promise.all(tiles);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  const sx = size / (x1 - x0);
  const sy = size / (y1 - y0);
  for (const { tx, ty, img } of loaded) {
    ctx.drawImage(img, (tx - x0) * sx, (ty - y0) * sy, sx + 0.5, sy + 0.5);
  }
  return canvas;
}

// Elevación: AWS Terrain Tiles (formato terrarium), con SRTM/NASADEM en tierra firme.
// height = (R·256 + G + B/256) − 32768
// Cuadrado de sizeM × sizeM metros (no 0,1° × 0,1°: cerca de los polos un grado de longitud se encoge).
export async function loadEarthTerrain(lat: number, lon: number, n = 192, sizeM = 11000): Promise<TerrainData> {
  const dLat = sizeM / 110540;
  const dLon = sizeM / (111320 * Math.cos((lat * Math.PI) / 180));
  const bbox: BBox = { west: lon - dLon / 2, east: lon + dLon / 2, south: lat - dLat / 2, north: lat + dLat / 2 };
  const z = zoomFor(lat, sizeM / n, 6, 14); // teselas con la resolución de la malla, no más
  const demCanvas = await mercatorMosaic(
    "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    bbox,
    z,
    n,
  );
  const px = demCanvas.getContext("2d")!.getImageData(0, 0, n, n).data;
  const heights = new Float32Array(n * n);
  let minH = Infinity;
  let maxH = -Infinity;
  for (let i = 0; i < n * n; i++) {
    const h = px[i * 4] * 256 + px[i * 4 + 1] + px[i * 4 + 2] / 256 - 32768;
    heights[i] = h;
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }
  // Foto Sentinel-2 opcional (≈11 m/px, unas 25 teselas como máximo). Si falla, el relieve se ve igual.
  let imagery: HTMLCanvasElement | null = null;
  let imgNote = "Satellite photo: Sentinel-2 cloudless 2016 by EOX (ESA Copernicus, CC BY 4.0)";
  try {
    const tz = zoomFor(lat, sizeM / 1024, 6, 14);
    imagery = await mercatorMosaic("https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg", bbox, tz, 1024);
  } catch {
    imgNote = "No Sentinel-2 photo available here";
  }
  const latR = (lat * Math.PI) / 180;
  return {
    heights,
    n,
    widthM: sizeM,
    heightM: sizeM,
    texture: reliefTexture(heights, n, minH, maxH),
    imagery,
    minH,
    maxH,
    resolutionM: Math.max(sizeM / n, (40075016 * Math.cos(latR)) / 2 ** z / 256),
    source: `Elevation: AWS Terrain Tiles (SRTM/NASADEM, ArcticDEM…) · ${imgNote}`,
  };
}

// ---------- Luna y Marte (NASA Solar System Treks · ArcGIS ImageServer) ----------
// exportImage con format=bsq + pixelType=F32 devuelve alturas float32 little-endian (m), fila 0 = norte.

// Textura neutra para comparar formas: gris uniforme con un leve tinte por altura y SIN sombras pintadas.
// Las sombras las pone la luz del visor (el mismo Sol para los dos terrenos), así la Tierra, la Luna y
// Marte se ven con exactamente el mismo material y solo cambia la forma del relieve.
export function reliefTexture(h: Float32Array, n: number, minH: number, maxH: number) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    const t = maxH > minH ? (h[i] - minH) / (maxH - minH) : 0.5;
    const v = 150 + 50 * t;
    img.data[i * 4] = v * 0.96;
    img.data[i * 4 + 1] = v * 0.98;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function finish(heights: Float32Array, n: number, widthM: number, heightM: number, resolutionM: number, source: string): TerrainData {
  let minH = Infinity;
  let maxH = -Infinity;
  for (let i = 0; i < heights.length; i++) {
    const v = heights[i];
    if (!Number.isFinite(v) || v < -1e5 || v > 1e5) {
      heights[i] = NaN;
      continue;
    }
    if (v < minH) minH = v;
    if (v > maxH) maxH = v;
  }
  for (let i = 0; i < heights.length; i++) if (Number.isNaN(heights[i])) heights[i] = minH; // nodata → mínimo
  return {
    heights,
    n,
    widthM,
    heightM,
    minH,
    maxH,
    resolutionM: Math.max(resolutionM, widthM / n), // resolución de la malla dibujada, comparable con la Tierra
    source,
    texture: reliefTexture(heights, n, minH, maxH),
  };
}

async function trekExport(base: string, bbox: string, n: number, extra = "") {
  // Interpolación bilineal: el vecino más cercano sobre un DEM de 5 m deja rayas (aliasing) a ~57 m/px.
  const url = `${base}/exportImage?bbox=${bbox}${extra}&size=${n},${n}&pixelType=F32&format=bsq&interpolation=RSP_BilinearInterpolation&f=image`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Trek ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength < n * n * 4) throw new Error("Incomplete response from Trek");
  return new Float32Array(buf.slice(0, n * n * 4));
}

const MOON_SP = "https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_SPole875_5mp_v04/ImageServer";
const MARS_BLEND = "https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MOLA_blend200ppx_HRSC_DEM_clon0dd_200mpp_lzw/ImageServer";
const MOON_R = 1737400;
const MARS_R = 3396190;

// Luna, polo sur: proyección estereográfica polar (m). Caja cuadrada de `sizeM` centrada en lat/lon.
export async function loadMoonSouthPole(lat: number, lon: number, sizeM = 11000, n = 192): Promise<TerrainData> {
  const rho = 2 * MOON_R * Math.tan(((90 + lat) * Math.PI) / 360);
  const x = rho * Math.sin((lon * Math.PI) / 180);
  const y = rho * Math.cos((lon * Math.PI) / 180);
  const hs = sizeM / 2;
  // Se pide al doble de resolución y se promedia 2×2: menos rayas de las pasadas del láser LOLA.
  const h2 = await trekExport(MOON_SP, `${x - hs},${y - hs},${x + hs},${y + hs}`, 2 * n);
  const h = new Float32Array(n * n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const i = 2 * r * 2 * n + 2 * c;
      h[r * n + c] = (h2[i] + h2[i + 1] + h2[i + 2 * n] + h2[i + 2 * n + 1]) / 4;
    }
  return finish(h, n, sizeM, sizeM, 5, "Elevation: NASA LRO LOLA south pole DEM 5 m/px (Moon Trek ImageServer) · Same neutral material as Earth");
}

// Marte: mezcla HRSC + MOLA (~200 m/px), coordenadas lat/lon.
export async function loadMarsBlend(lat: number, lon: number, sizeM = 11000, n = 96): Promise<TerrainData> {
  const dLat = (sizeM / MARS_R) * (180 / Math.PI);
  const dLon = dLat / Math.cos((lat * Math.PI) / 180);
  const bbox = `${lon - dLon / 2},${lat - dLat / 2},${lon + dLon / 2},${lat + dLat / 2}`;
  const h = await trekExport(MARS_BLEND, bbox, n);
  return finish(h, n, sizeM, sizeM, 200, "Elevation: MOLA + Mars Express HRSC blend ~200 m/px (Mars Trek ImageServer) · Same neutral material as Earth");
}

// Marte, Jezero: CTX DTM de 20 m (USGS Astrogeology, Mars 2020). GeoTIFF Float32 sin comprimir,
// una tira por fila, datos desde el byte 9779. Se lee solo el bloque de filas necesario (Range).
const JEZ_CTX = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/CTX/JEZ_ctx_B_soc_008_DTM_MOLAtopography_DeltaGeoid_20m_Eqc_latTs0_lon0.tif";
export async function loadJezeroCTX(lat: number, lon: number, sizeM = 11000, n = 192): Promise<TerrainData> {
  const W = 1596;
  const H = 1512;
  const OFF = 9779;
  const PX = 20;
  const X0 = 4573663.25;
  const Y0 = 1109693.14;
  const cx = (MARS_R * lon * Math.PI) / 180;
  const cy = (MARS_R * lat * Math.PI) / 180;
  const half = Math.round(sizeM / PX / 2);
  const c0 = Math.max(0, Math.round((cx - X0) / PX) - half);
  const r0 = Math.max(0, Math.round((Y0 - cy) / PX) - half);
  const side = Math.min(2 * half, W - c0, H - r0);
  const start = OFF + r0 * W * 4;
  const end = OFF + (r0 + side) * W * 4 - 1;
  const res = await fetch(JEZ_CTX, { headers: { Range: `bytes=${start}-${end}` } });
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const buf = await res.arrayBuffer();
  const view = new DataView(buf);
  const out = new Float32Array(n * n);
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const sr = Math.min(side - 1, Math.round((r / (n - 1)) * (side - 1)));
      const sc = c0 + Math.min(side - 1, Math.round((col / (n - 1)) * (side - 1)));
      out[r * n + col] = view.getFloat32((sr * W + sc) * 4, true);
    }
  }
  return finish(out, n, side * PX, side * PX, 20, "Elevation: CTX DTM 20 m Jezero (USGS Astrogeology / Mars 2020 TRN) · Same neutral material as Earth");
}
