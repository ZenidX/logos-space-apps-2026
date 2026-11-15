// Modelos 3D de la base (página /base/), en METROS reales. Inspirados en los conceptos de NASA para Artemis
// (hábitat de superficie, módulo de aterrizaje, rover no presurizado, mástiles solares verticales, reactor de fisión
// de superficie, excavadora de tambores, planta de extracción de agua), sin copiar ningún diseño ni marca concretos.
// Cada función devuelve un THREE.Group con el origen en el suelo (y = 0) y +y hacia arriba.
import * as THREE from "three";

// ---------- Texturas generadas (canvas) ----------
const texCache = new Map<string, THREE.Texture>();
function canvasTex(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, repeat = 1) {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Aislante multicapa (MLI) dorado, arrugado
const mliGold = () =>
  canvasTex("mli", 256, 256, (ctx, w, h) => {
    const r = rnd(7);
    ctx.fillStyle = "#c79a3c";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = r() * w, y = r() * h, l = 6 + r() * 26, a = r() * Math.PI;
      ctx.strokeStyle = `rgba(${r() > 0.5 ? "255,235,170" : "90,60,10"},${0.15 + r() * 0.35})`;
      ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  }, 2);
// Tela blanca exterior (beta cloth) con costuras de acolchado
const betaCloth = () =>
  canvasTex("beta", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#e9ebe6";
    ctx.fillRect(0, 0, w, h);
    const r = rnd(3);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${r() * 0.04})`;
      ctx.fillRect(r() * w, r() * h, 2, 2);
    }
    ctx.strokeStyle = "rgba(120,120,110,.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, (i * h) / 4); ctx.lineTo(w, (i * h) / 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo((i * w) / 4, 0); ctx.lineTo((i * w) / 4, h); ctx.stroke();
    }
  }, 3);
// Células solares: azul oscuro con rejilla plateada
const solarCells = () =>
  canvasTex("cells", 256, 512, (ctx, w, h) => {
    ctx.fillStyle = "#0e1d3d";
    ctx.fillRect(0, 0, w, h);
    const cw = w / 8, ch = h / 16;
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 16; j++) {
        const g = ctx.createLinearGradient(i * cw, j * ch, (i + 1) * cw, (j + 1) * ch);
        g.addColorStop(0, "#1b3a78"); g.addColorStop(1, "#0b1a3a");
        ctx.fillStyle = g;
        ctx.fillRect(i * cw + 1.5, j * ch + 1.5, cw - 3, ch - 3);
        ctx.fillStyle = "rgba(200,210,230,.35)";
        ctx.fillRect(i * cw + cw / 2 - 0.5, j * ch + 2, 1, ch - 4);
      }
  });
// Regolito sinterizado (plataforma de aterrizaje) con anillos y marcas
const padTex = () =>
  canvasTex("pad", 512, 512, (ctx, w, h) => {
    const r = rnd(11);
    ctx.fillStyle = "#6f6d68";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const v = 80 + r() * 60;
      ctx.fillStyle = `rgba(${v},${v - 2},${v - 6},.5)`;
      ctx.fillRect(r() * w, r() * h, 2, 2);
    }
    ctx.strokeStyle = "rgba(30,30,30,.45)";
    for (let k = 1; k <= 6; k++) { ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w / 2, h / 2, (k * w) / 13, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = "rgba(240,240,230,.85)";
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.36); ctx.lineTo(w * 0.42, h * 0.64); ctx.moveTo(w * 0.58, h * 0.36); ctx.lineTo(w * 0.58, h * 0.64); ctx.moveTo(w * 0.42, h / 2); ctx.lineTo(w * 0.58, h / 2); ctx.stroke();
  });
// Neumático de malla metálica
const meshTire = () =>
  canvasTex("tire", 128, 32, (ctx, w, h) => {
    ctx.fillStyle = "#3a3d42";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#9aa1aa";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 4) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + h, 0); ctx.lineTo(x, h); ctx.stroke(); }
    ctx.fillStyle = "#c8ccd2";
    for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 3, h);
  }, 1);

// ---------- Materiales compartidos ----------
let mats: ReturnType<typeof makeMats> | null = null;
function makeMats() {
  const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
  return {
    white: std({ map: betaCloth(), color: 0xffffff, roughness: 0.75, metalness: 0.05 }),
    whiteSmooth: std({ color: 0xf2f3f0, roughness: 0.4, metalness: 0.1 }),
    gold: std({ map: mliGold(), color: 0xffffff, roughness: 0.32, metalness: 0.85 }),
    alu: std({ color: 0xb9bec6, roughness: 0.35, metalness: 0.9 }),
    darkMetal: std({ color: 0x3b3f46, roughness: 0.5, metalness: 0.7 }),
    black: std({ color: 0x15171b, roughness: 0.6, metalness: 0.2 }),
    cells: std({ map: solarCells(), color: 0xffffff, roughness: 0.18, metalness: 0.6, side: THREE.DoubleSide, emissive: 0x050c1c }),
    radiator: std({ color: 0xf6f7f4, roughness: 0.25, metalness: 0.15, side: THREE.DoubleSide }),
    nozzle: std({ color: 0x6b5a4c, roughness: 0.4, metalness: 0.85, side: THREE.DoubleSide }),
    glass: std({ color: 0x0b1424, roughness: 0.05, metalness: 0.9 }),
    visor: std({ color: 0xd6a33a, roughness: 0.08, metalness: 1 }),
    pad: std({ map: padTex(), color: 0xffffff, roughness: 0.95 }),
    tire: std({ map: meshTire(), color: 0xffffff, roughness: 0.6, metalness: 0.6 }),
    orange: std({ color: 0xe0782c, roughness: 0.5, metalness: 0.2 }),
    ice: std({ color: 0xcfeaff, roughness: 0.15, metalness: 0.0, emissive: 0x1a4a7a, emissiveIntensity: 0.6 }),
    tank: std({ color: 0xdfe3e8, roughness: 0.25, metalness: 0.6 }),
    light: new THREE.MeshBasicMaterial({ color: 0xfff3c4 }),
  };
}
export const M = () => (mats ??= makeMats());

function part(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
// Tubo recto entre dos puntos
function strut(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const d = b.clone().sub(a);
  const m = part(new THREE.CylinderGeometry(r, r, d.length(), 8), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
// Superficie de revolución desde un perfil [radio, altura]
const lathe = (pts: [number, number][], seg = 32) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

// ---------- Modelos ----------

/** Hábitat de superficie: cilindro presurizado horizontal Ø 4,6 × 10 m sobre patas niveladoras, esclusa, radiador y antena. */
export function habitat() {
  const m = M(), g = new THREE.Group();
  const R = 2.3, L = 7.5, Y = 3.1;
  // cuerpo: perfil con cúpulas en los extremos, girado para quedar horizontal (eje X)
  const prof: [number, number][] = [[0.01, -L / 2 - 1.3]];
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([Math.sin(a) * R, -L / 2 - Math.cos(a) * 1.3]); }
  prof.push([R, L / 2]);
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([Math.cos(a) * R, L / 2 + Math.sin(a) * 1.3]); }
  const body = part(lathe(prof, 40), m.white, 0, Y, 0);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  // anillos estructurales
  for (const x of [-L / 2, -L / 6, L / 6, L / 2]) {
    const ring = part(new THREE.TorusGeometry(R + 0.04, 0.07, 8, 40), m.alu, x, Y, 0);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
  }
  // ventanas
  for (const x of [-1.6, 0, 1.6]) {
    const w = part(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 20), m.glass, x, Y + 0.6, R - 0.02);
    w.rotation.x = Math.PI / 2;
    g.add(w);
  }
  // patas con zapatas (4 por lado)
  for (const x of [-3, 3]) for (const z of [-1.4, 1.4]) {
    g.add(strut(new THREE.Vector3(x, Y - 1.6, z), new THREE.Vector3(x * 1.08, 0.12, z * 1.35), 0.09, m.alu));
    g.add(part(new THREE.CylinderGeometry(0.45, 0.55, 0.12, 20), m.darkMetal, x * 1.08, 0.06, z * 1.35));
  }
  // esclusa lateral con escotilla
  const lock = part(new THREE.CylinderGeometry(1.1, 1.1, 2.6, 28), m.white, 0, Y - 0.2, R + 1.1);
  lock.rotation.x = Math.PI / 2;
  g.add(lock);
  const hatch = part(new THREE.TorusGeometry(0.75, 0.08, 8, 28), m.alu, 0, Y - 0.2, R + 2.42);
  g.add(hatch);
  g.add(part(new THREE.CircleGeometry(0.72, 28), m.darkMetal, 0, Y - 0.2, R + 2.41));
  // escalera de la esclusa
  for (let i = 0; i < 5; i++) g.add(part(new THREE.BoxGeometry(0.7, 0.05, 0.08), m.alu, 0, 0.4 + i * 0.45, R + 2.55));
  g.add(strut(new THREE.Vector3(-0.35, 0, R + 2.6), new THREE.Vector3(-0.35, Y - 0.8, R + 2.45), 0.035, m.alu));
  g.add(strut(new THREE.Vector3(0.35, 0, R + 2.6), new THREE.Vector3(0.35, Y - 0.8, R + 2.45), 0.035, m.alu));
  // radiador en el techo y antena de alta ganancia
  const rad = part(new THREE.BoxGeometry(5, 0.06, 2.4), m.radiator, 0, Y + R + 0.55, 0);
  g.add(rad);
  g.add(strut(new THREE.Vector3(-2, Y + R - 0.1, 0), new THREE.Vector3(-2, Y + R + 0.52, 0), 0.05, m.alu));
  g.add(strut(new THREE.Vector3(2, Y + R - 0.1, 0), new THREE.Vector3(2, Y + R + 0.52, 0), 0.05, m.alu));
  g.add(strut(new THREE.Vector3(3.2, Y + R - 0.3, -0.8), new THREE.Vector3(3.2, Y + R + 1.8, -0.8), 0.05, m.alu));
  const dish = part(lathe([[0.02, 0], [0.4, 0.05], [0.75, 0.2], [0.78, 0.22]], 28), m.whiteSmooth, 3.2, Y + R + 1.9, -0.8);
  dish.rotation.x = -0.9;
  g.add(dish);
  // luces
  for (const x of [-4.4, 4.4]) g.add(part(new THREE.SphereGeometry(0.09, 8, 6), m.light, x, Y + 0.9, R * 0.7));
  return g;
}

/** Berma de regolito alrededor del hábitat (blindaje contra radiación y metralla del aterrizaje). */
export function berm(radius = 9) {
  const m = new THREE.MeshStandardMaterial({ color: 0x77736c, roughness: 1 });
  const geo = lathe([[radius - 2.2, 0], [radius - 1.4, 0.9], [radius - 0.6, 1.3], [radius + 0.2, 0.9], [radius + 1.2, 0]], 64);
  const b = part(geo, m);
  b.userData.recolor = m;
  return b;
}

/** Módulo de aterrizaje tripulado de dos etapas (~12 m): etapa de descenso con MLI dorado, cabina, patas y tobera. */
export function lander() {
  const m = M(), g = new THREE.Group();
  const deck = 2.6;
  const desc = part(new THREE.CylinderGeometry(3.2, 3.2, 2.4, 8), m.gold, 0, deck + 1.2, 0);
  g.add(desc);
  // tobera principal
  g.add(part(lathe([[0.45, 0], [0.7, -0.6], [1.15, -1.5], [1.25, -1.6]], 28), m.nozzle, 0, deck, 0));
  // patas con amortiguador y zapata
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const top = new THREE.Vector3(Math.cos(a) * 3, deck + 1.6, Math.sin(a) * 3);
    const foot = new THREE.Vector3(Math.cos(a) * 5.4, 0.15, Math.sin(a) * 5.4);
    const knee = new THREE.Vector3(Math.cos(a) * 3.2, deck + 0.1, Math.sin(a) * 3.2);
    g.add(strut(top, foot, 0.13, m.alu));
    g.add(strut(knee, foot, 0.08, m.alu));
    g.add(part(lathe([[0.01, 0], [0.75, 0.05], [0.8, 0.22], [0.5, 0.3]], 20), m.alu, foot.x, 0, foot.z));
  }
  // cabina de ascenso
  const cab = part(lathe([[1.9, 0], [1.9, 2.6], [1.5, 3.6], [0.7, 4.1], [0.01, 4.15]], 32), m.whiteSmooth, 0, deck + 2.4, 0);
  g.add(cab);
  for (const a of [0, 0.5]) {
    const w = part(new THREE.BoxGeometry(0.5, 0.35, 0.06), m.glass, Math.sin(a) * 1.75, deck + 5.4, Math.cos(a) * 1.75);
    w.rotation.y = a;
    w.rotation.x = -0.35;
    g.add(w);
  }
  // propulsores de control (4 grupos)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const q = part(new THREE.BoxGeometry(0.35, 0.35, 0.35), m.alu, Math.cos(a) * 1.95, deck + 4.2, Math.sin(a) * 1.95);
    g.add(q);
    const n = part(new THREE.ConeGeometry(0.1, 0.25, 10, 1, true), m.nozzle, Math.cos(a) * 2.2, deck + 4.2, Math.sin(a) * 2.2);
    n.rotation.z = -Math.PI / 2;
    n.rotation.y = -a;
    g.add(n);
  }
  // escalera y plataforma
  const la = Math.PI / 4;
  for (let i = 0; i < 9; i++) g.add(part(new THREE.BoxGeometry(0.6, 0.05, 0.06), m.alu, Math.cos(la) * (5 - i * 0.18), 0.4 + i * 0.4, Math.sin(la) * (5 - i * 0.18)));
  g.add(part(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), m.light, 0, deck + 6.6, 0));
  return g;
}

/** Rover no presurizado (~4 × 2,4 m): bastidor, 4 ruedas de malla, asientos, consola, antena y brazo. */
export function rover() {
  const m = M(), g = new THREE.Group();
  const wy = 0.5;
  g.add(part(new THREE.BoxGeometry(3.6, 0.18, 1.6), m.darkMetal, 0, wy + 0.25, 0));
  // ruedas
  for (const x of [-1.45, 1.45]) for (const z of [-1.15, 1.15]) {
    const w = new THREE.Group();
    const tire = part(new THREE.TorusGeometry(0.42, 0.11, 12, 28), m.tire);
    w.add(tire);
    for (let k = 0; k < 6; k++) {
      const sp = part(new THREE.BoxGeometry(0.06, 0.8, 0.04), m.alu);
      sp.rotation.z = (k / 6) * Math.PI;
      w.add(sp);
    }
    w.add(part(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), m.alu));
    w.children[w.children.length - 1].rotation.x = Math.PI / 2;
    w.position.set(x, wy, z);
    w.userData.wheel = true;
    g.add(w);
    // guardabarros
    const f = part(new THREE.CylinderGeometry(0.6, 0.6, 0.32, 16, 1, true, -Math.PI / 2, Math.PI), m.whiteSmooth, x, wy, z * 1.02);
    f.rotation.x = Math.PI / 2;
    g.add(f);
  }
  // asientos
  for (const x of [-0.2, 0.7]) for (const z of [-0.4, 0.4]) {
    g.add(part(new THREE.BoxGeometry(0.55, 0.12, 0.5), m.black, x, wy + 0.55, z));
    g.add(part(new THREE.BoxGeometry(0.1, 0.6, 0.5), m.black, x - 0.3, wy + 0.85, z));
  }
  // consola, mástil con antena y cámara, brazo
  g.add(part(new THREE.BoxGeometry(0.4, 0.5, 1.2), m.white, 1.35, wy + 0.65, 0));
  g.add(strut(new THREE.Vector3(-1.5, wy + 0.3, -0.6), new THREE.Vector3(-1.5, wy + 2.1, -0.6), 0.04, m.alu));
  const dish = part(lathe([[0.01, 0], [0.25, 0.03], [0.4, 0.12]], 20), m.whiteSmooth, -1.5, wy + 2.15, -0.6);
  dish.rotation.x = -1.1;
  g.add(dish);
  g.add(part(new THREE.BoxGeometry(0.25, 0.18, 0.18), m.darkMetal, 1.7, wy + 1.0, 0.55));
  g.add(strut(new THREE.Vector3(-1.7, wy + 0.4, 0.5), new THREE.Vector3(-2.3, wy + 0.9, 0.7), 0.05, m.alu));
  g.add(strut(new THREE.Vector3(-2.3, wy + 0.9, 0.7), new THREE.Vector3(-2.6, wy + 0.3, 0.7), 0.04, m.alu));
  return g;
}

/** Mástil solar vertical (~18 m) con panel de 3,5 × 8 m que sigue al Sol: para el Sol rasante del polo. */
export function solarMast() {
  const m = M(), g = new THREE.Group();
  // trípode de base con zapatas
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(strut(new THREE.Vector3(Math.cos(a) * 2.4, 0.1, Math.sin(a) * 2.4), new THREE.Vector3(0, 2.2, 0), 0.09, m.alu));
    g.add(part(new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16), m.darkMetal, Math.cos(a) * 2.4, 0.05, Math.sin(a) * 2.4));
  }
  // mástil telescópico
  const segs = [[0.32, 0, 6], [0.26, 6, 12], [0.2, 12, 17.5]];
  for (const [r, a, b] of segs) g.add(part(new THREE.CylinderGeometry(r, r, b - a, 16), m.whiteSmooth, 0, (a + b) / 2, 0));
  // cabezal y panel (gira en Y para seguir al Sol)
  const head = new THREE.Group();
  head.position.y = 17.5;
  head.add(part(new THREE.BoxGeometry(0.6, 0.6, 0.6), m.darkMetal));
  const panel = part(new THREE.BoxGeometry(3.5, 8, 0.08), m.cells, 0, -3.2, 0.45);
  head.add(panel);
  head.add(part(new THREE.BoxGeometry(3.6, 0.08, 0.12), m.alu, 0, 0.82, 0.45));
  head.add(part(new THREE.BoxGeometry(3.6, 0.08, 0.12), m.alu, 0, -7.22, 0.45));
  head.userData.tracker = true;
  g.add(head);
  return g;
}

/** Campo solar sobre el suelo: 3 filas de paneles inclinados sobre bastidores (≈ 24 × 12 m). */
export function solarField(tiltRad = 0.6) {
  const m = M(), g = new THREE.Group();
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 3; k++) {
      const x = (k - 1) * 8.4, z = (row - 1) * 4.6;
      const p = part(new THREE.BoxGeometry(8, 0.06, 2.4), m.cells, x, 1.2, z);
      p.rotation.x = -tiltRad;
      g.add(p);
      for (const dx of [-3.4, 3.4]) {
        g.add(strut(new THREE.Vector3(x + dx, 0, z - 0.7), new THREE.Vector3(x + dx, 1.6, z - 0.7), 0.05, m.alu));
        g.add(strut(new THREE.Vector3(x + dx, 0, z + 0.7), new THREE.Vector3(x + dx, 0.8, z + 0.7), 0.05, m.alu));
      }
    }
  return g;
}

/** Reactor de fisión de superficie (~40 kWe): núcleo con blindaje y radiadores en abanico, ~7 m. */
export function reactor() {
  const m = M(), g = new THREE.Group();
  g.add(part(lathe([[1.4, 0], [1.4, 0.4], [1.0, 0.6], [1.0, 3.4], [0.8, 3.8], [0.01, 3.9]], 32), m.darkMetal));
  g.add(part(new THREE.CylinderGeometry(1.05, 1.05, 0.5, 32), m.orange, 0, 2.2, 0));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fin = part(new THREE.BoxGeometry(0.05, 5.5, 2.4), m.radiator, Math.cos(a) * 2.2, 4.4, Math.sin(a) * 2.2);
    fin.rotation.y = -a;
    fin.rotation.z = Math.cos(a) * 0.12;
    fin.rotation.x = -Math.sin(a) * 0.12;
    g.add(fin);
  }
  g.add(part(new THREE.CylinderGeometry(0.3, 0.3, 3.4, 12), m.alu, 0, 5.4, 0));
  return g;
}

/** Excavadora de tambores contrarrotantes (~3 m): cava regolito helado sin necesitar mucho peso. */
export function excavator() {
  const m = M(), g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(1.5, 0.7, 1.1), m.white, 0, 0.9, 0));
  for (const z of [-0.75, 0.75]) {
    const w = part(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 18), m.tire, -0.35, 0.4, z);
    w.rotation.x = Math.PI / 2;
    g.add(w);
    const w2 = w.clone();
    w2.position.x = 0.35;
    g.add(w2);
  }
  const drums = new THREE.Group();
  for (const s of [-1, 1]) {
    const arm = strut(new THREE.Vector3(s * 0.6, 0.9, 0), new THREE.Vector3(s * 1.5, 0.45, 0), 0.08, m.alu);
    g.add(arm);
    const drum = new THREE.Group();
    drum.position.set(s * 1.6, 0.45, 0);
    const d = part(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 16), m.darkMetal);
    d.rotation.x = Math.PI / 2;
    drum.add(d);
    for (let k = 0; k < 6; k++) {
      const b = part(new THREE.BoxGeometry(0.12, 0.2, 1.12), m.alu);
      const a = (k / 6) * Math.PI * 2;
      b.position.set(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0);
      b.rotation.z = a;
      drum.add(b);
    }
    drum.userData.spin = s;
    drums.add(drum);
  }
  g.add(drums);
  g.userData.drums = drums;
  g.add(part(new THREE.BoxGeometry(0.2, 0.2, 0.2), m.light, 0.6, 1.3, 0.4));
  return g;
}

/** Planta de extracción de agua: tolva, horno de sublimación, condensador y tanques (~8 m). */
export function waterPlant() {
  const m = M(), g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(4, 2.4, 2.6), m.white, 0, 1.4, 0));
  g.add(part(lathe([[0.2, 0], [1.4, 1.5], [1.5, 1.6]], 4), m.alu, -1.2, 2.6, 0)); // tolva
  const oven = part(new THREE.CylinderGeometry(0.9, 0.9, 3.4, 24), m.gold, 1.8, 1.4, 0);
  oven.rotation.z = Math.PI / 2;
  g.add(oven);
  for (const [x, z] of [[-3.2, -1.4], [-3.2, 1.4], [3.8, 1.6]]) {
    g.add(part(new THREE.SphereGeometry(0.95, 24, 16), m.tank, x, 1.4, z));
    g.add(part(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), m.alu, x, 0.4, z));
  }
  const rad = part(new THREE.BoxGeometry(0.05, 2.6, 4), m.radiator, 0, 4.0, -2.2);
  rad.rotation.x = 0.3;
  g.add(rad);
  g.add(strut(new THREE.Vector3(0, 2.6, -1.2), new THREE.Vector3(0, 3.2, -2.0), 0.05, m.alu));
  return g;
}

/** Zona de hielo: escarcha mezclada con el regolito (no una placa: unos % en masa) y un taladro de prospección. */
export function iceSite() {
  const m = M(), g = new THREE.Group();
  const frost = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshStandardMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.22, roughness: 0.3, depthWrite: false }));
  frost.rotation.x = -Math.PI / 2;
  frost.position.y = 0.05;
  g.add(frost);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(strut(new THREE.Vector3(Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2), new THREE.Vector3(0, 3.2, 0), 0.06, m.alu));
  }
  const auger = part(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 10), m.darkMetal, 0, 1.4, 0);
  g.add(auger);
  g.add(part(new THREE.BoxGeometry(0.5, 0.5, 0.5), m.white, 0, 3.3, 0));
  g.add(part(new THREE.SphereGeometry(0.12, 8, 6), m.light, 0, 3.7, 0));
  return g;
}

/** Plataforma de aterrizaje de regolito sinterizado (Ø 60 m) con berma contra la metralla del chorro. */
export function landingPad() {
  const m = M(), g = new THREE.Group();
  const d = part(new THREE.CylinderGeometry(30, 30.5, 0.35, 64), m.pad, 0, 0.17, 0);
  g.add(d);
  const bm = berm(34);
  g.add(bm);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(part(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8), m.orange, Math.cos(a) * 31, 0.6, Math.sin(a) * 31));
    g.add(part(new THREE.SphereGeometry(0.12, 8, 6), m.light, Math.cos(a) * 31, 1.25, Math.sin(a) * 31));
  }
  return g;
}

/** Astronauta con traje presurizado (1,9 m): casco con visor dorado, mochila de soporte vital. Anima al andar. */
export function astronaut() {
  const m = M(), g = new THREE.Group();
  const torso = part(new THREE.CapsuleGeometry(0.26, 0.45, 6, 12), m.whiteSmooth, 0, 1.25, 0);
  g.add(torso);
  g.add(part(new THREE.BoxGeometry(0.5, 0.6, 0.28), m.white, 0, 1.35, -0.3)); // mochila
  const helmet = part(new THREE.SphereGeometry(0.2, 20, 14), m.whiteSmooth, 0, 1.78, 0);
  g.add(helmet);
  const visor = part(new THREE.SphereGeometry(0.19, 20, 12, -Math.PI / 2.4, Math.PI / 1.2, Math.PI / 3.2, Math.PI / 2.6), m.visor, 0, 1.78, 0.03);
  g.add(visor);
  const legs: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.13, 0.95, 0);
    leg.add(part(new THREE.CapsuleGeometry(0.1, 0.62, 4, 8), m.whiteSmooth, 0, -0.42, 0));
    leg.add(part(new THREE.BoxGeometry(0.17, 0.12, 0.3), m.darkMetal, 0, -0.88, 0.05));
    g.add(leg);
    legs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(s * 0.36, 1.48, 0);
    arm.add(part(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), m.whiteSmooth, 0, -0.3, 0));
    arm.rotation.z = s * 0.15;
    g.add(arm);
    legs.push(arm);
  }
  g.userData.limbs = legs;
  return g;
}

/** Anima la marcha de un astronauta (t en segundos). */
export function walk(a: THREE.Object3D, t: number) {
  const limbs = a.userData.limbs as THREE.Object3D[] | undefined;
  if (!limbs) return;
  const sw = Math.sin(t * 4) * 0.45;
  limbs[0].rotation.x = sw;
  limbs[1].rotation.x = -sw * 0.6;
  limbs[2].rotation.x = -sw;
  limbs[3].rotation.x = sw * 0.6;
}
