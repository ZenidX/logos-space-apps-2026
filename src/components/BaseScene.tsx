"use client";

// Escena de la base (página /base/): el terreno REAL del sitio elegido y, encima, las piezas que coloca
// src/lib/base-plan.ts. La misión se anima por pasos: aterrizaje → hábitat → energía → recursos → rover → paseo.
// Las piezas son símbolos dibujados más grandes que en la realidad (si no, en 10–24 km no se verían).
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TerrainData } from "@/lib/terrain";
import type { BasePlan, Spot } from "@/lib/base-plan";

export const STEP_IDS = ["landing", "habitat", "power", "isru", "traverse", "eva"] as const;
export const STEP_DONE = STEP_IDS.length; // todo colocado
export type Layer = "relief" | "photo" | "slope";

interface Props {
  terrain: TerrainData;
  plan: BasePlan;
  step: number; // 0..STEP_DONE
  stepKey: number; // cambia para repetir el mismo paso
  layer: Layer;
  exaggeration: number;
  sunDeg: number;
  onStepEnd?: (step: number) => void;
  onSymbolScale?: (factor: number) => void;
  onImagery?: (state: "" | "loading" | "none") => void;
}

const STEP_MS = 3400;
const ease = (k: number) => 1 - Math.pow(1 - k, 3);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

// Colores de pendiente: verde = se puede construir (< 10°), ámbar = rover con cuidado, rojo = fuera de alcance.
function slopeCanvas(slope: Float32Array, n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(n, n);
  const stops: [number, [number, number, number]][] = [
    [0, [46, 196, 120]],
    [5, [150, 214, 92]],
    [10, [242, 196, 76]],
    [20, [240, 122, 58]],
    [30, [214, 58, 70]],
  ];
  for (let i = 0; i < n * n; i++) {
    const s = slope[i];
    let k = stops.length - 1;
    for (let j = 1; j < stops.length; j++) if (s < stops[j][0]) { k = j; break; }
    const [a, ca] = stops[Math.max(0, k - 1)];
    const [b, cb] = stops[k];
    const t = b > a ? clamp01((s - a) / (b - a)) : 1;
    for (let ch = 0; ch < 3; ch++) img.data[i * 4 + ch] = ca[ch] + (cb[ch] - ca[ch]) * t;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export default function BaseScene({ terrain, plan, step, stepKey, layer, exaggeration, sunDeg, onStepEnd, onSymbolScale, onImagery }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const labelsHost = useRef<HTMLDivElement>(null);
  const stepRef = useRef({ step, t0: 0, ended: false });
  const exRef = useRef(exaggeration);
  const cb = useRef({ onStepEnd, onSymbolScale, onImagery });
  const api = useRef<{ setEx: (e: number) => void; setSun: (d: number) => void; setLayer: (l: Layer) => void } | null>(null);
  const [glError, setGlError] = useState("");

  useEffect(() => {
    cb.current = { onStepEnd, onSymbolScale, onImagery };
  }, [onStepEnd, onSymbolScale, onImagery]);

  useEffect(() => {
    stepRef.current = { step, t0: performance.now(), ended: false };
  }, [step, stepKey]);

  // Escena: una por sitio
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      queueMicrotask(() => setGlError("WebGL is not available in this browser or device, so the 3D base cannot be drawn. The plan below is still valid."));
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mars = plan.body === "mars";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(mars ? 0x1a0e08 : 0x020407);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = "pan-y";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (mars) scene.fog = new THREE.Fog(0x3a2214, 1.6, 4.2); // aire con polvo; la Luna no tiene niebla
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.005, 60);
    camera.position.set(0.35, 0.42, 0.62);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 0.12;
    controls.maxDistance = 2.6;
    controls.autoRotate = !reduce.matches;
    controls.autoRotateSpeed = 0.35;
    controls.addEventListener("start", () => (controls.autoRotate = false));

    // Estrellas (solo Luna: en Marte de día el cielo es de polvo)
    let stars: THREE.Points | null = null;
    if (!mars) {
      const pts = new Float32Array(1500 * 3);
      for (let i = 0; i < 1500; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(20);
        v.y = Math.abs(v.y) * 0.9 + 0.5;
        pts.set([v.x, v.y, v.z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfe3ff, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
      scene.add(stars);
    }

    scene.add(new THREE.AmbientLight(mars ? 0xffc9a0 : 0x6f88a8, mars ? 0.42 : 0.26));
    const sun = new THREE.DirectionalLight(mars ? 0xffe6cc : 0xffffff, mars ? 2.2 : 2.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -0.75;
    sc.right = sc.top = 0.75;
    sc.near = 0.1;
    sc.far = 14;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.002;
    scene.add(sun);
    scene.add(sun.target);

    // ---------- Terreno ----------
    const { n, heights, widthM, heightM, minH } = terrain;
    const s = 1 / Math.max(widthM, heightM);
    const geo = new THREE.PlaneGeometry(widthM * s, heightM * s, n - 1, n - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const setTerrainY = () => {
      for (let i = 0; i < n * n; i++) pos.setY(i, (heights[i] - minH) * s * exRef.current);
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    };
    setTerrainY();
    const reliefTex = new THREE.CanvasTexture(terrain.texture);
    const slopeTex = new THREE.CanvasTexture(slopeCanvas(plan.slope, n));
    for (const t of [reliefTex, slopeTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
    if (mars) reliefTex.colorSpace = THREE.SRGBColorSpace;
    const terrainMat = new THREE.MeshStandardMaterial({ map: reliefTex, roughness: 0.96, metalness: 0, color: mars ? 0xe0a27a : 0xffffff });
    const ground = new THREE.Mesh(geo, terrainMat);
    ground.receiveShadow = true;
    ground.castShadow = true;
    scene.add(ground);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(widthM * s, 0.0001, heightM * s)),
      new THREE.LineBasicMaterial({ color: 0x5ee6ff, transparent: true, opacity: 0.5 }),
    );
    scene.add(edges);

    // Altura del suelo (m del dato) en un punto x/z en metros, bilineal.
    const hAt = (x: number, z: number) => {
      const fc = clamp01(x / widthM + 0.5) * (n - 1);
      const fr = clamp01(z / heightM + 0.5) * (n - 1);
      const c0 = Math.floor(fc), r0 = Math.floor(fr);
      const c1 = Math.min(n - 1, c0 + 1), r1 = Math.min(n - 1, r0 + 1);
      const tc = fc - c0, tr = fr - r0;
      const a = heights[r0 * n + c0] * (1 - tc) + heights[r0 * n + c1] * tc;
      const b = heights[r1 * n + c0] * (1 - tc) + heights[r1 * n + c1] * tc;
      return a * (1 - tr) + b * tr;
    };
    const yAt = (x: number, z: number) => (hAt(x, z) - minH) * s * exRef.current;

    // ---------- Piezas (símbolos a escala U) ----------
    // U ≈ 1,2 % del lado. Un módulo de hábitat real mide ~10 m: el factor de exageración se enseña en la web.
    const U = 0.026;
    const realModuleM = 10;
    cb.current.onSymbolScale?.(Math.round((U * 0.9) / s / realModuleM));
    const M = {
      white: new THREE.MeshStandardMaterial({ color: 0xe9eef5, roughness: 0.45, metalness: 0.25 }),
      grey: new THREE.MeshStandardMaterial({ color: 0x8c96a3, roughness: 0.7, metalness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xd8b25c, roughness: 0.35, metalness: 0.8 }),
      panel: new THREE.MeshStandardMaterial({ color: 0x1d3f7a, roughness: 0.25, metalness: 0.7, side: THREE.DoubleSide, emissive: 0x061a3a }),
      berm: new THREE.MeshStandardMaterial({ color: mars ? 0x9a5a38 : 0x77746e, roughness: 1 }),
      pad: new THREE.MeshStandardMaterial({ color: 0xb7bdc4, roughness: 0.9 }),
      accent: new THREE.MeshStandardMaterial({ color: 0x5ee6ff, emissive: 0x2aa8c4, emissiveIntensity: 0.9 }),
      ice: new THREE.MeshStandardMaterial({ color: 0x9fdcff, emissive: 0x3fa6ff, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 }),
      plume: new THREE.MeshBasicMaterial({ color: 0xffb066, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
    const disposables: { dispose: () => void }[] = [...Object.values(M)];
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
      disposables.push(g);
      const o = new THREE.Mesh(g, m);
      o.castShadow = true;
      o.receiveShadow = true;
      return o;
    };

    interface Piece { obj: THREE.Object3D; spot: { x: number; z: number }; stepIdx: number; lift?: number; label?: string; anim?: (p: number) => void }
    const pieces: Piece[] = [];
    const add = (p: Piece) => {
      p.obj.visible = false;
      scene.add(p.obj);
      pieces.push(p);
      return p;
    };

    // Pista + módulo de aterrizaje (paso 0)
    const padG = new THREE.Group();
    padG.add(mesh(new THREE.CylinderGeometry(1.1 * U, 1.2 * U, 0.05 * U, 40), M.pad));
    const ringPad = mesh(new THREE.TorusGeometry(0.85 * U, 0.03 * U, 6, 48), M.accent);
    ringPad.rotation.x = Math.PI / 2;
    ringPad.position.y = 0.04 * U;
    padG.add(ringPad);
    add({ obj: padG, spot: plan.pad, stepIdx: 0, label: "Landing pad" });

    const lander = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(0.28 * U, 0.34 * U, 0.55 * U, 16), M.gold);
    body.position.y = 0.55 * U;
    lander.add(body);
    const top = mesh(new THREE.ConeGeometry(0.28 * U, 0.4 * U, 16), M.white);
    top.position.y = 1.02 * U;
    lander.add(top);
    for (let i = 0; i < 4; i++) {
      const leg = mesh(new THREE.CylinderGeometry(0.02 * U, 0.02 * U, 0.55 * U, 6), M.grey);
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      leg.position.set(Math.cos(a) * 0.38 * U, 0.22 * U, Math.sin(a) * 0.38 * U);
      leg.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      lander.add(leg);
    }
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.3 * U, 1.1 * U, 16, 1, true), M.plume);
    disposables.push(plume.geometry);
    plume.rotation.x = Math.PI;
    plume.position.y = -0.2 * U;
    lander.add(plume);
    add({
      obj: lander,
      spot: plan.pad,
      stepIdx: 0,
      anim: (p) => {
        const k = ease(p);
        lander.position.y += (1 - k) * 0.35; // baja desde ~3,5 km de «altura» de escena
        plume.visible = p < 0.97;
        plume.scale.set(1, 0.6 + (1 - k) * 1.4, 1);
        M.plume.opacity = 0.85 * (1 - k * 0.6);
      },
    });

    // Hábitat (paso 1): tres módulos, cúpula y berma de regolito
    const hab = new THREE.Group();
    const modG = new THREE.CylinderGeometry(0.2 * U, 0.2 * U, 0.9 * U, 20);
    disposables.push(modG);
    for (const [x, z, r] of [[0, 0, 0], [0.75, 0, 0], [0.38, 0.55, Math.PI / 2]] as const) {
      const m = new THREE.Mesh(modG, M.white);
      m.castShadow = m.receiveShadow = true;
      m.rotation.z = Math.PI / 2;
      m.rotation.y = r;
      m.position.set((x - 0.38) * U, 0.2 * U, (z - 0.2) * U);
      hab.add(m);
    }
    const dome = mesh(new THREE.SphereGeometry(0.38 * U, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.white);
    dome.position.set(0, 0.05 * U, 0.15 * U);
    hab.add(dome);
    const berm = mesh(new THREE.TorusGeometry(1.0 * U, 0.12 * U, 6, 40), M.berm);
    berm.rotation.x = Math.PI / 2;
    berm.scale.set(1, 1, 0.6);
    hab.add(berm);
    add({ obj: hab, spot: plan.habitat, stepIdx: 1, label: "Habitat", anim: (p) => hab.scale.setScalar(Math.max(0.001, ease(p))) });

    // Energía (paso 2)
    const sunAz = (135 * Math.PI) / 180;
    const cable = (a: { x: number; z: number }, b: { x: number; z: number }) => {
      const N = 40;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      disposables.push(g);
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.9 }));
      disposables.push(line.material as THREE.Material);
      const update = () => {
        const p = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < N; i++) {
          const t = i / (N - 1);
          const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
          p.setXYZ(i, x * s, yAt(x, z) + 0.06 * U, z * s);
        }
        p.needsUpdate = true;
      };
      update();
      line.visible = false;
      scene.add(line);
      return { line, update, g, N };
    };
    const cables: ReturnType<typeof cable>[] = [];
    if (plan.power.kind === "solar-masts") {
      plan.power.spots.forEach((sp, i) => {
        const g = new THREE.Group();
        const mastH = 2.2 * U;
        const pole = mesh(new THREE.CylinderGeometry(0.035 * U, 0.05 * U, mastH, 8), M.grey);
        pole.position.y = mastH / 2;
        g.add(pole);
        const panel = mesh(new THREE.PlaneGeometry(0.55 * U, 1.1 * U), M.panel);
        panel.position.y = mastH - 0.4 * U;
        panel.rotation.y = sunAz; // panel vertical mirando al Sol rasante
        g.add(panel);
        add({ obj: g, spot: sp, stepIdx: 2, label: i === 0 ? "Solar masts" : undefined, anim: (p) => g.scale.set(1, Math.max(0.001, ease(p)), 1) });
        cables.push(cable(sp, plan.habitat));
      });
    } else {
      const [field, reactor] = plan.power.spots;
      const g = new THREE.Group();
      const pg = new THREE.PlaneGeometry(0.42 * U, 0.7 * U);
      disposables.push(pg);
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          const pnl = new THREE.Mesh(pg, M.panel);
          pnl.castShadow = true;
          pnl.position.set((i - 1) * 0.55 * U, 0.3 * U, (j - 1) * 0.6 * U);
          pnl.rotation.x = -Math.PI / 2 + 0.6;
          g.add(pnl);
        }
      add({ obj: g, spot: field, stepIdx: 2, label: "Solar field", anim: (p) => g.scale.setScalar(Math.max(0.001, ease(p))) });
      const r = new THREE.Group();
      const core = mesh(new THREE.CylinderGeometry(0.2 * U, 0.24 * U, 0.6 * U, 16), M.grey);
      core.position.y = 0.3 * U;
      r.add(core);
      for (let i = 0; i < 4; i++) {
        const fin = mesh(new THREE.BoxGeometry(0.03 * U, 0.55 * U, 0.75 * U), M.white);
        const a = (i * Math.PI) / 2;
        fin.position.set(Math.cos(a) * 0.55 * U, 0.38 * U, Math.sin(a) * 0.55 * U);
        fin.rotation.y = -a;
        r.add(fin);
      }
      add({ obj: r, spot: reactor, stepIdx: 2, label: "Reactor", anim: (p) => r.scale.setScalar(Math.max(0.001, ease(p))) });
      cables.push(cable(field, plan.habitat), cable(reactor, plan.habitat));
    }

    // Recursos (paso 3)
    const isruG = new THREE.Group();
    if (plan.isru.kind === "ice-shadow" || plan.isru.kind === "ice-ground") {
      for (let i = 0; i < 3; i++) {
        const leg = mesh(new THREE.CylinderGeometry(0.025 * U, 0.025 * U, 1.0 * U, 6), M.grey);
        const a = (i * 2 * Math.PI) / 3;
        leg.position.set(Math.cos(a) * 0.18 * U, 0.45 * U, Math.sin(a) * 0.18 * U);
        leg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
        isruG.add(leg);
      }
      const bit = mesh(new THREE.CylinderGeometry(0.04 * U, 0.04 * U, 1.1 * U, 8), M.gold);
      bit.position.y = 0.3 * U;
      isruG.add(bit);
      const ice = mesh(new THREE.OctahedronGeometry(0.22 * U), M.ice);
      ice.position.y = 1.3 * U;
      isruG.add(ice);
      add({ obj: isruG, spot: plan.isru.spot, stepIdx: 3, label: plan.isru.kind === "ice-shadow" ? "Ice in shadow" : "Ice drill", anim: (p) => { isruG.scale.setScalar(Math.max(0.001, ease(p))); ice.rotation.y = p * 6; } });
    } else {
      const plant = mesh(new THREE.BoxGeometry(0.6 * U, 0.35 * U, 0.4 * U), M.white);
      plant.position.y = 0.18 * U;
      isruG.add(plant);
      for (let i = 0; i < 2; i++) {
        const tank = mesh(new THREE.SphereGeometry(0.17 * U, 16, 10), M.gold);
        tank.position.set((i - 0.5) * 0.4 * U + 0.55 * U, 0.17 * U, 0);
        isruG.add(tank);
      }
      add({ obj: isruG, spot: plan.isru.spot, stepIdx: 3, label: "Oxygen plant", anim: (p) => isruG.scale.setScalar(Math.max(0.001, ease(p))) });
    }

    // Ciencia: baliza (paso 4, destino de la travesía si no hay hielo en sombra)
    const beacon = new THREE.Group();
    const gem = mesh(new THREE.OctahedronGeometry(0.2 * U), M.accent);
    gem.position.y = 1.1 * U;
    beacon.add(gem);
    const stick = mesh(new THREE.CylinderGeometry(0.015 * U, 0.015 * U, 1.0 * U, 6), M.accent);
    stick.position.y = 0.5 * U;
    beacon.add(stick);
    add({ obj: beacon, spot: plan.science, stepIdx: 4, label: "Science stop", anim: (p) => { beacon.scale.setScalar(Math.max(0.001, ease(Math.min(1, p * 2)))); gem.rotation.y = p * 4; } });

    // Ruta del rover + rover (paso 4): tubo visible (las líneas WebGL miden 1 px)
    const routePts = plan.route.length;
    const routeMat = new THREE.MeshStandardMaterial({ color: 0x5ee6ff, emissive: 0x2aa8c4, emissiveIntensity: 0.8 });
    disposables.push(routeMat);
    const routeLine = new THREE.Mesh(new THREE.BufferGeometry(), routeMat);
    routeLine.visible = false;
    scene.add(routeLine);
    let routeIdx = 0;
    const updateRoute = () => {
      const pts = plan.route.map((r) => new THREE.Vector3(r.x * s, yAt(r.x, r.z) + 0.12 * U, r.z * s));
      if (pts.length < 2) pts.push(pts[0].clone().add(new THREE.Vector3(0.001, 0, 0)));
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(16, pts.length * 3), 0.07 * U, 6, false);
      routeLine.geometry.dispose();
      routeLine.geometry = g;
      routeIdx = g.index ? g.index.count : 0;
    };
    updateRoute();
    const routeG = { setDrawRange: (_a: number, b: number) => routeLine.geometry.setDrawRange(0, Math.floor((routeIdx * Math.min(b, routePts)) / routePts / 36) * 36) };
    const cum = [0];
    for (let i = 1; i < routePts; i++) cum.push(cum[i - 1] + Math.hypot(plan.route[i].x - plan.route[i - 1].x, plan.route[i].z - plan.route[i - 1].z));
    const along = (k: number): { x: number; z: number; i: number } => {
      const d = k * cum[cum.length - 1];
      let i = 1;
      while (i < routePts - 1 && cum[i] < d) i++;
      const a = plan.route[i - 1], b = plan.route[Math.min(i, routePts - 1)];
      const seg = cum[i] - cum[i - 1] || 1;
      const t = clamp01((d - cum[i - 1]) / seg);
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, i };
    };
    const rover = new THREE.Group();
    const chassis = mesh(new THREE.BoxGeometry(0.5 * U, 0.14 * U, 0.32 * U), M.white);
    chassis.position.y = 0.2 * U;
    rover.add(chassis);
    const mastR = mesh(new THREE.CylinderGeometry(0.02 * U, 0.02 * U, 0.3 * U, 6), M.grey);
    mastR.position.set(0.15 * U, 0.4 * U, 0);
    rover.add(mastR);
    const wheelG = new THREE.CylinderGeometry(0.09 * U, 0.09 * U, 0.06 * U, 12);
    disposables.push(wheelG);
    for (const [x, z] of [[-0.18, -0.19], [0.18, -0.19], [-0.18, 0.19], [0.18, 0.19]]) {
      const w = new THREE.Mesh(wheelG, M.grey);
      w.rotation.x = Math.PI / 2;
      w.position.set(x * U, 0.09 * U, z * U);
      rover.add(w);
    }
    rover.scale.setScalar(1.3);
    const roverSpot = { x: plan.habitat.x, z: plan.habitat.z };
    add({
      obj: rover,
      spot: roverSpot,
      stepIdx: 4,
      label: "Rover",
      anim: (p) => {
        const k = p; // velocidad constante
        const a = along(k), b = along(Math.min(1, k + 0.01));
        roverSpot.x = a.x;
        roverSpot.z = a.z;
        rover.position.set(a.x * s, yAt(a.x, a.z), a.z * s);
        if (Math.hypot(b.x - a.x, b.z - a.z) > 1e-6) rover.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x);
        routeG.setDrawRange(0, Math.max(2, a.i + 1));
      },
    });

    // Radio de paseo a pie (paso 5)
    const RING = 96;
    const ringG = new THREE.BufferGeometry();
    ringG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RING * 3), 3));
    disposables.push(ringG);
    const ringMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.01, gapSize: 0.007, transparent: true, opacity: 0.9 });
    disposables.push(ringMat);
    const evaRing = new THREE.LineLoop(ringG, ringMat);
    evaRing.visible = false;
    scene.add(evaRing);
    const updateRing = (scale = 1) => {
      const p = ringG.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < RING; i++) {
        const a = (i / RING) * Math.PI * 2;
        const x = plan.habitat.x + Math.cos(a) * plan.evaRadiusM * scale;
        const z = plan.habitat.z + Math.sin(a) * plan.evaRadiusM * scale;
        p.setXYZ(i, x * s, yAt(x, z) + 0.05 * U, z * s);
      }
      p.needsUpdate = true;
      evaRing.computeLineDistances();
    };
    updateRing();
    const astros: THREE.Mesh[] = [];
    const astroG = new THREE.CapsuleGeometry(0.06 * U, 0.16 * U, 4, 8);
    disposables.push(astroG);
    for (let i = 0; i < 2; i++) {
      const a = mesh(astroG, M.white);
      a.visible = false;
      scene.add(a);
      astros.push(a);
    }

    // ---------- Etiquetas HTML proyectadas ----------
    const host = labelsHost.current!;
    host.replaceChildren();
    const labelEls = pieces.map((p) => {
      if (!p.label) return null;
      const d = document.createElement("span");
      d.textContent = p.label;
      d.className = "base-tag";
      host.appendChild(d);
      return d;
    });

    // Foco de cámara por paso
    const mid = plan.route[Math.floor(plan.route.length / 2)] ?? plan.habitat;
    const focusOf = (st: number): Spot | { x: number; z: number } =>
      [plan.pad, plan.habitat, plan.power.spots[plan.power.spots.length - 1], plan.isru.spot, mid, plan.habitat][st] ?? plan.habitat;
    const focus = new THREE.Vector3();

    // ---------- Bucle ----------
    let raf = 0, onScreen = true;
    const tmp = new THREE.Vector3();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !onScreen) return;
      const st = stepRef.current;
      const p = reduce.matches ? 1 : clamp01((now - st.t0) / STEP_MS);
      if (p >= 1 && !st.ended) {
        st.ended = true;
        queueMicrotask(() => cb.current.onStepEnd?.(st.step));
      }
      for (const pc of pieces) {
        const show = pc.stepIdx <= st.step;
        pc.obj.visible = show;
        if (!show) continue;
        pc.obj.position.set(pc.spot.x * s, yAt(pc.spot.x, pc.spot.z), pc.spot.z * s);
        pc.anim?.(pc.stepIdx === st.step ? p : 1);
      }
      for (const c of cables) {
        c.line.visible = st.step >= 2;
        c.g.setDrawRange(0, st.step === 2 ? Math.max(2, Math.floor(c.N * ease(clamp01(p * 1.4 - 0.3)))) : c.N);
      }
      routeLine.visible = st.step >= 4;
      if (st.step > 4) routeG.setDrawRange(0, routePts);
      evaRing.visible = st.step >= 5;
      if (st.step === 5) updateRing(Math.max(0.02, ease(p)));
      astros.forEach((a, i) => {
        a.visible = st.step >= 5;
        if (!a.visible) return;
        const k = st.step === 5 ? ease(p) : 1;
        const ang = i * 2.1 + now * 0.00008 * (reduce.matches ? 0 : 1);
        const x = plan.habitat.x + Math.cos(ang) * 600 * k;
        const z = plan.habitat.z + Math.sin(ang) * 600 * k;
        a.position.set(x * s, yAt(x, z) + 0.12 * U, z * s);
      });
      // Cámara: el objetivo se desliza hacia lo que se está montando
      const f = focusOf(Math.min(st.step, STEP_IDS.length - 1));
      focus.set(f.x * s, yAt(f.x, f.z), f.z * s);
      controls.target.lerp(focus, reduce.matches ? 1 : 0.04);
      controls.update();
      renderer.render(scene, camera);
      // Etiquetas
      const w = el.clientWidth, h = el.clientHeight;
      const placed: [number, number][] = [];
      pieces.forEach((pc, i) => {
        const d = labelEls[i];
        if (!d) return;
        if (!pc.obj.visible) { d.style.display = "none"; return; }
        tmp.copy(pc.obj.position);
        tmp.y += 1.6 * U;
        tmp.project(camera);
        if (tmp.z > 1) { d.style.display = "none"; return; }
        const px = (tmp.x * 0.5 + 0.5) * w, py = (-tmp.y * 0.5 + 0.5) * h;
        if (placed.some(([qx, qy]) => Math.abs(qx - px) < 90 && Math.abs(qy - py) < 22)) { d.style.display = "none"; return; }
        placed.push([px, py]);
        d.style.display = "block";
        d.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      });
    };
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(el);

    // Capas de textura
    let photo: THREE.CanvasTexture | null | undefined;
    let wantLayer: Layer = "relief";
    const applyLayer = (l: Layer) => {
      wantLayer = l;
      if (l === "slope") { terrainMat.map = slopeTex; terrainMat.color.set(0xffffff); }
      else if (l === "photo" && photo) { terrainMat.map = photo; terrainMat.color.set(0xffffff); }
      else { terrainMat.map = reliefTex; terrainMat.color.set(mars ? 0xe0a27a : 0xffffff); }
      terrainMat.needsUpdate = true;
      if (l === "photo" && photo === undefined && terrain.loadImagery) {
        photo = null;
        cb.current.onImagery?.("loading");
        terrain.loadImagery().then((c) => {
          if (!c) { cb.current.onImagery?.("none"); return; }
          photo = new THREE.CanvasTexture(c);
          photo.colorSpace = THREE.SRGBColorSpace;
          photo.anisotropy = 8;
          cb.current.onImagery?.("");
          if (wantLayer === "photo") applyLayer("photo");
        });
      } else if (l === "photo" && photo === null && !terrain.loadImagery) cb.current.onImagery?.("none");
    };

    api.current = {
      setEx: (e) => {
        exRef.current = e;
        setTerrainY();
        cables.forEach((c) => c.update());
        updateRoute();
        updateRing();
      },
      setSun: (deg) => {
        const el2 = (deg * Math.PI) / 180;
        sun.position.set(Math.cos(el2) * Math.sin(sunAz) * 5, Math.sin(el2) * 5, Math.cos(el2) * Math.cos(sunAz) * 5);
        sun.target.position.set(0, 0, 0);
      },
      setLayer: applyLayer,
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      routeLine.geometry.dispose();
      geo.dispose();
      terrainMat.dispose();
      reliefTex.dispose();
      slopeTex.dispose();
      photo?.dispose();
      if (stars) { stars.geometry.dispose(); (stars.material as THREE.Material).dispose(); }
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.replaceChildren();
      api.current = null;
    };
  }, [terrain, plan]);

  useEffect(() => api.current?.setEx(exaggeration), [exaggeration, terrain, plan]);
  useEffect(() => api.current?.setSun(sunDeg), [sunDeg, terrain, plan]);
  useEffect(() => api.current?.setLayer(layer), [layer, terrain, plan]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mount} className="absolute inset-0" />
      <div ref={labelsHost} aria-hidden className="pointer-events-none absolute inset-0" />
      {glError && (
        <div role="alert" className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm" style={{ color: "var(--warn)" }}>
          {glError}
        </div>
      )}
    </div>
  );
}
