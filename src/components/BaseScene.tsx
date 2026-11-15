"use client";

// Escena de la base (página /base/): el terreno REAL del sitio elegido y, encima, las piezas que coloca
// src/lib/base-plan.ts. La misión se anima por pasos: aterrizaje → hábitat → energía → recursos → rover → paseo.
// Las piezas son símbolos dibujados más grandes que en la realidad (si no, en 10–24 km no se verían).
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as models from "@/lib/base-models";
import type { TerrainData } from "@/lib/terrain";
import type { BasePlan, Spot } from "@/lib/base-plan";
import type { FocusKey } from "@/lib/submissions";

export const STEP_IDS = ["landing", "habitat", "power", "isru", "traverse", "eva"] as const;
export const STEP_DONE = STEP_IDS.length; // todo colocado
export type Layer = "relief" | "photo" | "slope" | "sun" | "ice";

interface Props {
  terrain: TerrainData;
  plan: BasePlan;
  step: number; // 0..STEP_DONE
  stepKey: number; // cambia para repetir el mismo paso
  layer: Layer;
  exaggeration: number;
  sunDeg: number;
  onStepEnd?: (step: number) => void;
  // Con la base montada (step = STEP_DONE): submisión en la que se centra la cámara.
  focus?: FocusKey | null;
  // Aspecto del mundo: por defecto el del plan. "earth" = el mismo plan dibujado en un sitio de ensayo terrestre.
  world?: "moon" | "mars" | "earth";
  // Con la base montada y un foco: repite en bucle solo la operación de esa submisión (comparación Tierra ↔ base).
  loopFocus?: boolean;
  // Escala real: piezas a tamaño de verdad y cámara a pie de base
  realScale?: boolean;
  onSymbolScale?: (factor: number) => void;
  onImagery?: (state: "" | "loading" | "none") => void;
}

const STEP_MS = 2200; // montaje rápido: lo importante es la base funcionando
const CARGO_MS = 16000; // ciclo de una nave de carga (llega, se queda, otra)
const ROVER_MS = 22000; // ida y vuelta del rover
const LOOP_MS = 5200; // bucle de una submisión en la comparación
const FOCUS_STEP: Record<FocusKey, number> = { pad: 0, habitat: 1, power: 2, isru: 3, route: 4, eva: 5 };
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

// Hielo: trampa fría en superficie (blanco azulado), hielo enterrado posible (azul), sin hielo (gris según la luz).
function iceCanvas(cls: Uint8Array, lit: Float32Array, n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    const g = 60 + 110 * Math.min(1, lit[i] / 0.6);
    const rgb = cls[i] === 2 ? [220, 240, 255] : cls[i] === 1 ? [60, 130, 230] : [g, g * 0.97, g * 0.92];
    img.data.set([rgb[0], rgb[1], rgb[2], 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Horas de sol: negro-azulado (nunca) → ámbar → amarillo claro (casi siempre). Sombra permanente en azul hielo.
function sunCanvas(lit: Float32Array, psr: Uint8Array, n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    let rgb: [number, number, number];
    if (psr[i]) rgb = [70, 150, 255];
    else {
      const k = Math.min(1, lit[i] / 0.7); // 70 % o más = máximo
      rgb = [30 + 225 * k, 26 + 200 * Math.pow(k, 1.3), 40 + 120 * Math.pow(k, 3)];
    }
    img.data.set([rgb[0], rgb[1], rgb[2], 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export default function BaseScene({ terrain, plan, step, stepKey, layer, exaggeration, sunDeg, onStepEnd, onSymbolScale, onImagery, focus = null, world, loopFocus = false, realScale = false }: Props) {
  const loopRef = useRef(loopFocus);
  useEffect(() => {
    loopRef.current = loopFocus;
  }, [loopFocus]);
  const focusRef = useRef(focus);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);
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
      // Profundidad logarítmica: a escala real conviven piezas de 1 m y un terreno de 11 km
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
    } catch {
      queueMicrotask(() => setGlError("WebGL is not available in this browser or device, so the 3D base cannot be drawn. The plan below is still valid."));
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const look = world ?? plan.body;
    const mars = look === "mars";
    const earth = look === "earth";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(earth ? 0x0b1828 : mars ? 0x1a0e08 : 0x020407);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = "pan-y";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (mars) scene.fog = new THREE.Fog(0x3a2214, 1.6, 4.2); // aire con polvo; la Luna no tiene niebla
    if (earth) scene.fog = new THREE.Fog(0x1c3552, 1.8, 4.6); // aire de la Tierra
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, realScale ? 0.00002 : 0.005, 60);
    camera.position.set(0.35, 0.42, 0.62);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = realScale ? 0.0006 : 0.12; // a escala real, hasta ~7 m
    controls.maxDistance = realScale ? 0.25 : 2.6;
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

    scene.add(new THREE.AmbientLight(earth ? 0xcfe0ff : mars ? 0xffc9a0 : 0x6f88a8, earth ? 0.5 : mars ? 0.42 : 0.26));
    const sun = new THREE.DirectionalLight(mars ? 0xffe6cc : 0xffffff, earth ? 2.3 : mars ? 2.2 : 2.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = realScale ? -0.05 : -0.75; // a escala real: ±550 m alrededor de la base
    sc.right = sc.top = realScale ? 0.05 : 0.75;
    sc.near = realScale ? 0.01 : 0.1;
    sc.far = realScale ? 0.6 : 14;
    sun.shadow.bias = realScale ? -0.00002 : -0.0004;
    sun.shadow.normalBias = realScale ? 0.00002 : 0.002;
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
    const sunTex = new THREE.CanvasTexture(sunCanvas(plan.sun.lit, plan.sun.psr, n));
    const iceTex = new THREE.CanvasTexture(plan.ice ? iceCanvas(plan.ice.cls, plan.sun.lit, n) : sunCanvas(plan.sun.lit, plan.sun.psr, n));
    for (const t of [reliefTex, slopeTex, sunTex, iceTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
    if (mars) reliefTex.colorSpace = THREE.SRGBColorSpace;
    const terrainMat = new THREE.MeshStandardMaterial({ map: reliefTex, roughness: 0.96, metalness: 0, color: earth ? 0xc9bfa6 : mars ? 0xe0a27a : 0xffffff });
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

    // ---------- Piezas: modelos en METROS (src/lib/base-models.ts) ----------
    // Escala real (F = 1) para verlas de cerca; en la vista general se dibujan F veces más grandes para que se vean
    // sobre 11 km de terreno (la web enseña el factor).
    const F = realScale ? 1 : 22;
    const K = s * F; // metros → unidades de escena
    cb.current.onSymbolScale?.(F);
    const plumeMat = new THREE.MeshBasicMaterial({ color: 0xffb066, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x5db4ff, emissive: 0x2a78c4, emissiveIntensity: 0.9 });
    const disposables: { dispose: () => void }[] = [plumeMat, accentMat];
    const bermColor = earth ? 0x8a7a5e : mars ? 0x9a5a38 : 0x77746e;
    const recolorBerms = (o: THREE.Object3D) =>
      o.traverse((c) => {
        const mm = c.userData.recolor as THREE.MeshStandardMaterial | undefined;
        if (mm) mm.color.set(bermColor);
      });

    interface Piece { obj: THREE.Object3D; spot: { x: number; z: number }; stepIdx: number; label?: string; topM?: number; anim?: (p: number) => void; loop?: (now: number) => number }
    const pieces: Piece[] = [];
    const add = (p: Piece) => {
      p.obj.visible = false;
      p.obj.scale.setScalar(K);
      recolorBerms(p.obj);
      scene.add(p.obj);
      pieces.push(p);
      return p;
    };
    const grow = (o: THREE.Object3D, p: number) => o.scale.setScalar(K * Math.max(0.001, ease(p)));

    // Pista de regolito sinterizado + módulo de aterrizaje (paso 0)
    add({ obj: models.landingPad(), spot: plan.pad, stepIdx: 0, label: "Landing pad", topM: 2 });
    const lander = models.lander();
    const plume = new THREE.Mesh(new THREE.ConeGeometry(2.4, 14, 20, 1, true), plumeMat);
    disposables.push(plume.geometry);
    plume.rotation.x = Math.PI;
    plume.position.y = -6;
    lander.add(plume);
    const liftW = realScale ? 160 * s : 0.25; // altura desde la que baja (escena)
    add({
      obj: lander,
      spot: plan.pad,
      stepIdx: 0,
      label: "Lander",
      topM: 12,
      // En marcha: llega una nave de carga en cada ciclo (baja en el primer cuarto y se queda)
      loop: (now) => clamp01((now % CARGO_MS) / CARGO_MS / 0.25),
      anim: (p) => {
        const k = ease(p);
        lander.position.y += (1 - k) * liftW;
        plume.visible = p < 0.97;
        plume.scale.set(1, 0.5 + (1 - k) * 1.2, 1);
        plumeMat.opacity = 0.85 * (1 - k * 0.6);
      },
    });

    // Hábitat con berma de regolito (paso 1)
    const hab = new THREE.Group();
    hab.add(models.habitat(), models.berm(10));
    add({ obj: hab, spot: plan.habitat, stepIdx: 1, label: "Habitat", topM: 9, anim: (p) => grow(hab, p) });

    // Energía (paso 2)
    const sunAz = (135 * Math.PI) / 180;
    const cable = (a: { x: number; z: number }, b: { x: number; z: number }) => {
      const N = 60;
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
          p.setXYZ(i, x * s, yAt(x, z) + 0.4 * K, z * s);
        }
        p.needsUpdate = true;
      };
      update();
      line.visible = false;
      scene.add(line);
      return { line, update, g, N };
    };
    const cables: ReturnType<typeof cable>[] = [];
    const trackers: THREE.Object3D[] = [];
    if (plan.power.kind === "solar-masts") {
      plan.power.spots.forEach((sp, i) => {
        const g = models.solarMast();
        g.traverse((c) => {
          if (c.userData.tracker) trackers.push(c);
        });
        add({ obj: g, spot: sp, stepIdx: 2, label: i === 0 ? "Solar masts" : undefined, topM: 19, anim: (p) => g.scale.set(K, K * Math.max(0.001, ease(p)), K) });
        cables.push(cable(sp, plan.habitat));
      });
    } else {
      const [field, reactor] = plan.power.spots;
      const g = models.solarField();
      g.rotation.y = sunAz; // filas mirando al Sol
      add({ obj: g, spot: field, stepIdx: 2, label: "Solar field", topM: 3, anim: (p) => grow(g, p) });
      const r = models.reactor();
      add({ obj: r, spot: reactor, stepIdx: 2, label: "Reactor", topM: 8, anim: (p) => grow(r, p) });
      cables.push(cable(field, plan.habitat), cable(reactor, plan.habitat));
    }

    // Recursos (paso 3)
    const drums: THREE.Object3D[] = [];
    if (plan.isru.kind === "ice-shadow" || plan.isru.kind === "ice-ground") {
      const site = models.iceSite();
      add({ obj: site, spot: plan.isru.spot, stepIdx: 3, label: plan.isru.kind === "ice-shadow" ? (earth ? "Ice dig (rehearsal)" : "Ice dig (cold trap)") : "Ice drill", topM: 5, anim: (p) => grow(site, p) });
      const ex = models.excavator();
      const exSpot = { x: plan.isru.spot.x + 14, z: plan.isru.spot.z + 6 };
      (ex.userData.drums as THREE.Group).children.forEach((d) => drums.push(d));
      add({ obj: ex, spot: exSpot, stepIdx: 3, topM: 2, anim: (p) => grow(ex, p) });
      if (plan.plant) {
        const wp = models.waterPlant();
        add({ obj: wp, spot: plan.plant, stepIdx: 3, label: "Water plant", topM: 6, anim: (p) => grow(wp, p) });
        cables.push(cable(plan.plant, plan.habitat));
      }
    } else {
      const op = models.waterPlant();
      add({ obj: op, spot: plan.isru.spot, stepIdx: 3, label: "Oxygen plant", topM: 6, anim: (p) => grow(op, p) });
    }

    // Ciencia: estación con baliza (paso 4)
    const beacon = new THREE.Group();
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), accentMat);
    gem.position.y = 4.6;
    beacon.add(gem);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8), accentMat);
    stick.position.y = 2.1;
    beacon.add(stick);
    disposables.push(gem.geometry, stick.geometry);
    add({
      obj: beacon,
      spot: plan.science,
      stepIdx: 4,
      label: "Science stop",
      topM: 6,
      anim: (p) => {
        grow(beacon, Math.min(1, p * 2));
        gem.rotation.y = p * 4;
      },
    });

    // Ruta del rover + rover (paso 4): tubo visible
    const routePts = plan.route.length;
    const routeMat = new THREE.MeshStandardMaterial({ color: 0x5db4ff, emissive: 0x2a78c4, emissiveIntensity: 0.8, transparent: true, opacity: realScale ? 0.55 : 1 });
    disposables.push(routeMat);
    const routeLine = new THREE.Mesh(new THREE.BufferGeometry(), routeMat);
    routeLine.visible = false;
    scene.add(routeLine);
    let routeIdx = 0;
    const tubeR = (realScale ? 0.5 : 0.8) * K; // camino: ~1 m de ancho a escala real
    const updateRoute = () => {
      const pts = plan.route.map((r) => new THREE.Vector3(r.x * s, yAt(r.x, r.z) + tubeR, r.z * s));
      if (pts.length < 2) pts.push(pts[0].clone().add(new THREE.Vector3(0.001, 0, 0)));
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(16, pts.length * 3), tubeR, 6, false);
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
    const rover = models.rover();
    const wheels: THREE.Object3D[] = [];
    rover.traverse((c) => {
      if (c.userData.wheel) wheels.push(c);
    });
    const roverSpot = { x: plan.route[0]?.x ?? plan.habitat.x, z: plan.route[0]?.z ?? plan.habitat.z };
    let lastK = 0;
    add({
      obj: rover,
      spot: roverSpot,
      stepIdx: 4,
      label: plan.plant ? "Rover (hauling icy soil)" : "Rover",
      topM: 3,
      // En marcha: ida y vuelta continua por la ruta
      loop: (now) => {
        const u = (now % ROVER_MS) / ROVER_MS;
        return u < 0.5 ? u * 2 : 2 - u * 2;
      },
      anim: (p) => {
        const a = along(p), b = along(Math.min(1, p + 0.01));
        roverSpot.x = a.x;
        roverSpot.z = a.z;
        rover.position.set(a.x * s, yAt(a.x, a.z), a.z * s);
        if (Math.hypot(b.x - a.x, b.z - a.z) > 1e-6) rover.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x) + (p < lastK ? Math.PI : 0);
        const spin = ((p - lastK) * cum[cum.length - 1]) / 0.53; // vueltas de rueda (radio 0,53 m)
        wheels.forEach((w) => (w.rotation.z -= spin));
        lastK = p;
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
        p.setXYZ(i, x * s, yAt(x, z) + 0.3 * K, z * s);
      }
      p.needsUpdate = true;
      evaRing.computeLineDistances();
    };
    updateRing();
    const astros: THREE.Object3D[] = [];
    for (let i = 0; i < (realScale ? 3 : 2); i++) {
      const a = models.astronaut();
      a.scale.setScalar(K);
      a.visible = false;
      scene.add(a);
      astros.push(a);
    }
    const walkR = realScale ? 28 : 600; // metros: a escala real, alrededor del hábitat

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
    const focusSpot: Record<FocusKey, { x: number; z: number }> = {
      pad: plan.pad,
      habitat: plan.habitat,
      power: plan.power.spots[plan.power.spots.length - 1],
      isru: plan.isru.spot,
      route: mid,
      eva: plan.habitat,
    };
    const focusOf = (st: number): Spot | { x: number; z: number } =>
      [plan.pad, plan.habitat, plan.power.spots[plan.power.spots.length - 1], plan.isru.spot, mid, plan.habitat][st] ?? plan.habitat;
    const focus = new THREE.Vector3();
    if (realScale) {
      // Cámara a pie de base: a ~70 m del hábitat, mirando hacia él
      const hx = plan.habitat.x * s, hz = plan.habitat.z * s, hy = yAt(plan.habitat.x, plan.habitat.z);
      controls.target.set(hx, hy, hz);
      camera.position.set(hx + 55 * s, hy + 30 * s, hz + 55 * s);
      controls.autoRotateSpeed = 0.25;
    }

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
      // Bucle de una sola submisión (comparación): su grupo de piezas se repite; el resto queda montado
      const lk = st.step >= STEP_DONE && loopRef.current && focusRef.current ? FOCUS_STEP[focusRef.current] : -1;
      const lp = reduce.matches ? 1 : clamp01(((now % LOOP_MS) / LOOP_MS) * 1.35);
      for (const pc of pieces) {
        const show = pc.stepIdx <= st.step;
        pc.obj.visible = show;
        if (!show) continue;
        pc.obj.position.set(pc.spot.x * s, yAt(pc.spot.x, pc.spot.z), pc.spot.z * s);
        const running = st.step >= STEP_DONE && pc.loop && !reduce.matches;
        pc.anim?.(pc.stepIdx === lk && !(running && lk === 4) ? lp : running ? pc.loop!(now) : pc.stepIdx === st.step ? p : 1);
      }
      for (const c of cables) {
        c.line.visible = st.step >= 2;
        const cp = lk === 2 ? lp : st.step === 2 ? p : 1;
        c.g.setDrawRange(0, cp < 1 ? Math.max(2, Math.floor(c.N * ease(clamp01(cp * 1.4 - 0.3)))) : c.N);
      }
      routeLine.visible = st.step >= 4;
      if (st.step > 4) routeG.setDrawRange(0, routePts + 1);
      evaRing.visible = st.step >= 5;
      if (st.step === 5) updateRing(Math.max(0.02, ease(p)));
      else if (lk === 5) updateRing(Math.max(0.02, ease(lp)));
      astros.forEach((a, i) => {
        a.visible = st.step >= 5;
        if (!a.visible) return;
        const k = st.step === 5 ? ease(p) : lk === 5 ? ease(lp) : 1;
        const ang = i * 2.1 + now * (realScale ? 0.00006 : 0.00008) * (reduce.matches ? 0 : 1);
        const x = plan.habitat.x + Math.cos(ang) * walkR * k;
        const z = plan.habitat.z + Math.sin(ang) * walkR * k;
        a.position.set(x * s, yAt(x, z), z * s);
        a.rotation.y = -ang; // mira hacia donde anda
        if (!reduce.matches) models.walk(a, now / 1000 + i);
      });
      // Tambores de la excavadora y paneles que siguen al Sol
      if (!reduce.matches) {
        drums.forEach((d) => (d.rotation.z += 0.05 * (d.userData.spin ?? 1)));
        trackers.forEach((tr) => (tr.rotation.y = sunAz + Math.sin(now / 9000) * 0.25));
      }
      // Cámara: el objetivo se desliza hacia lo que se está montando
      const fk = st.step >= STEP_DONE ? focusRef.current : null;
      const f = fk ? focusSpot[fk] : focusOf(Math.min(st.step, STEP_IDS.length - 1));
      focus.set(f.x * s, yAt(f.x, f.z), f.z * s);
      if (realScale) {
        // a escala real, la cámara viaja con el objetivo (si no, una pieza a 2 km se vería desde demasiado lejos)
        const dv = focus.clone().sub(controls.target).multiplyScalar(reduce.matches ? 1 : 0.05);
        controls.target.add(dv);
        camera.position.add(dv);
        // nunca por debajo del suelo (las piezas están a distintas alturas: crestas, fondos de cráter)
        const ground = yAt(camera.position.x / s, camera.position.z / s) + 30 * s;
        if (camera.position.y < ground) camera.position.y = ground;
        const tg = yAt(controls.target.x / s, controls.target.z / s);
        if (controls.target.y < tg) controls.target.y = tg;
      } else controls.target.lerp(focus, reduce.matches ? 1 : 0.04);
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
        tmp.y += (pc.topM ?? 6) * K * 1.1;
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
      else if (l === "sun") { terrainMat.map = sunTex; terrainMat.color.set(0xffffff); }
      else if (l === "ice") { terrainMat.map = iceTex; terrainMat.color.set(0xffffff); }
      else if (l === "photo" && photo) { terrainMat.map = photo; terrainMat.color.set(0xffffff); }
      else { terrainMat.map = reliefTex; terrainMat.color.set(earth ? 0xc9bfa6 : mars ? 0xe0a27a : 0xffffff); }
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
        // A escala real, el Sol (y su mapa de sombras) se centra en la base: si no, una pieza de 10 m ocuparía
        // menos de un texel de sombra sobre 11 km.
        const c = realScale ? new THREE.Vector3(plan.habitat.x * s, yAt(plan.habitat.x, plan.habitat.z), plan.habitat.z * s) : new THREE.Vector3();
        const d = realScale ? 0.2 : 5;
        sun.position.set(c.x + Math.cos(el2) * Math.sin(sunAz) * d, c.y + Math.sin(el2) * d, c.z + Math.cos(el2) * Math.cos(sunAz) * d);
        sun.target.position.copy(c);
        sun.target.updateMatrixWorld();
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
      sunTex.dispose();
      iceTex.dispose();
      photo?.dispose();
      if (stars) { stars.geometry.dispose(); (stars.material as THREE.Material).dispose(); }
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.replaceChildren();
      api.current = null;
    };
  }, [terrain, plan, world, realScale]);

  useEffect(() => api.current?.setEx(exaggeration), [exaggeration, terrain, plan, realScale]);
  useEffect(() => api.current?.setSun(sunDeg), [sunDeg, terrain, plan, realScale]);
  useEffect(() => api.current?.setLayer(layer), [layer, terrain, plan, realScale]);

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
