"use client";

// AI-assisted (Claude), reviewed by team Logos. Design proposal «Orbit» by Diseño (team agent).
// «Orrery»: Earth, Moon and Mars in ONE scene (one canvas, one WebGL context) with arcs between them.
// Propuesta de Diseño para Logos. Reutiliza globe-math.ts, globe-tex.ts y las texturas de ~/spaceapp.
// Probado: tsc + ESLint + pruebas numéricas de orrery-math. NO probado en pantalla (ni rendimiento).
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { declutter, easeInOutCubic } from "@/lib/globe-math";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { ArcSet, type ArcSpec } from "@/lib/arcs";
import { FOV, lerpPose, orientToFace, poseFor, worldPoint, type BodyId, type Dims, type Mode, type Pose } from "@/lib/orrery-math";
import { latLonToVec3 } from "@/lib/globe-math";

export interface OrreryMarker { id: string; body: BodyId; lat: number; lon: number; kind: "candidate" | "target"; label: string; rank?: number }
export interface OrreryArc { id: string; from: string; to: string; dims: Dims }
interface Props {
  mode: Mode; // overview | focus(luna|marte)
  markers: OrreryMarker[];
  arcs: OrreryArc[]; // from = id del marcador objetivo, to = id del candidato
  selectedId: string | null;
  onSelect?: (id: string) => void;
  paused?: boolean; // «Pause demo»: sin fotones ni inercia
  onError?: (e: unknown) => void; // sin WebGL → el padre pinta el mapa 2D
  className?: string;
}

const BODY_IDS: BodyId[] = ["earth", "moon", "mars"];
const ATMO_VERT = "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const ATMO_FRAG = "uniform vec3 c; varying vec3 n; void main(){ float i = pow(0.7 - dot(n, vec3(0.0, 0.0, 1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * clamp(i, 0.0, 1.0) * 0.55; }";
const COLOR: Record<BodyId, number> = { earth: 0x5db4ff, moon: 0xd7dce6, mars: 0xff8d5e };
const TWEEN_MS = 900, ROTATE_MS = 700;

interface Body { group: THREE.Group; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; hi: boolean }
interface Tween { t0: number; dur: number; from: Pose; to: Pose; qFrom: Record<BodyId, THREE.Quaternion>; qTo: Partial<Record<BodyId, THREE.Quaternion>>; hideArcs: boolean }

export default function Orrery({ mode, markers, arcs, selectedId, onSelect, paused = false, onError, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const latest = useRef({ mode, markers, arcs, selectedId, paused, onError });
  const api = useRef<{ sync: () => void; invalidate: () => void } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    latest.current = { mode, markers, arcs, selectedId, paused, onError };
    api.current?.sync();
  }, [mode, markers, arcs, selectedId, paused, onError]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Staged start: yield to the browser between heavy steps so the page stays responsive while the scene boots.
    let cancelled = false;
    let cleanup = () => {};
    const tick = () => new Promise<void>((r) => setTimeout(r, 0));
    void (async () => {
    await tick();
    if (cancelled) return;
    let renderer: THREE.WebGLRenderer;
    try {
      // ?capture=1 keeps the drawing buffer so screenshots and screen-recording tools can read the canvas.
      const capture = new URLSearchParams(window.location.search).has("capture");
      renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth >= 700, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: capture });
    } catch (e) {
      latest.current.onError?.(e);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lite = navigator.hardwareConcurrency <= 4 || window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);
    await tick();
    if (cancelled) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-2, 1.4, 3);
    camera.add(sun); // la luz va con la cámara: siempre se ve la cara iluminada

    // ---------- cuerpos ----------
    const segs: [number, number] = lite ? [48, 32] : [64, 48];
    const bodies = {} as Record<BodyId, Body>;
    const loader = new THREE.TextureLoader(), aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    let disposed = false, dirty = true, arcsDirty = false, aspect = 1, width = 1, height = 1;
    const loadTex = (url: string) => new Promise<THREE.Texture>((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, rej));
    const setTex = (id: BodyId, t: THREE.Texture, hi: boolean) => {
      if (disposed) { t.dispose(); return; }
      bodies[id].mat.map?.dispose(); bodies[id].mat.map = t; bodies[id].mat.needsUpdate = true; bodies[id].hi = hi; dirty = true;
    };
    const ensureHi = (id: BodyId) => {
      if (bodies[id].hi || lite || saveData) return;
      bodies[id].hi = true;
      loadTex(GLOBE_TEX[id].hi).then((t) => setTex(id, t, true)).catch(() => { bodies[id].hi = false; });
    };
    const disposables: { dispose: () => void }[] = [];
    for (const id of BODY_IDS) {
      const group = new THREE.Group(), geo = new THREE.SphereGeometry(1, segs[0], segs[1]);
      const mat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh); disposables.push(geo, mat);
      const atm = GLOBE_TEX[id].atmosphere;
      if (atm !== null) {
        const ag = new THREE.SphereGeometry(1.045, 40, 28), am = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(atm) } }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG });
        group.add(new THREE.Mesh(ag, am)); disposables.push(ag, am);
      }
      scene.add(group);
      bodies[id] = { group, mesh, mat, hi: false };
    }
    for (const id of BODY_IDS) loadTex(GLOBE_TEX[id].lo).then((t) => { setTex(id, t, false); if (id === "earth" && !lite) ensureHi("earth"); if (BODY_IDS.every((b) => bodies[b].mat.map)) setLoading(false); }).catch((e) => { if (!disposed) latest.current.onError?.(e); });

    // ---------- arcos ----------
    const arcSet = new ArcSet(lite, reduce);
    scene.add(arcSet.group);

    // ---------- poses y transiciones ----------
    let cur: Pose = poseFor(latest.current.mode, 1);
    let tween: Tween | null = null, lastKey = "";
    const applyPose = (p: Pose) => {
      cur = p;
      camera.position.copy(p.pos); camera.lookAt(p.look);
      for (const id of BODY_IDS) {
        const b = bodies[id], l = p.layout[id];
        b.group.position.set(...l.pos); b.group.scale.setScalar(l.r * p.scale[id]); b.mat.opacity = p.opacity[id]; b.mat.transparent = p.opacity[id] < 0.999;
      }
      dirty = true; arcsDirty = true;
    };
    const centerOf = (p: Pose, id: BodyId) => new THREE.Vector3(...p.layout[id].pos);
    /** Orientación final de cada globo: el objetivo mira a cámara (su marcador «target» o el seleccionado) y la Tierra, al candidato seleccionado. */
    const targetQuats = (to: Pose): Partial<Record<BodyId, THREE.Quaternion>> => {
      const { markers: ms, selectedId: sel, mode: md } = latest.current, out: Partial<Record<BodyId, THREE.Quaternion>> = {};
      const selM = ms.find((m) => m.id === sel);
      const face = (id: BodyId, m: OrreryMarker | undefined) => {
        if (!m) return;
        const dir = to.pos.clone().sub(centerOf(to, id)).normalize();
        out[id] = orientToFace(latLonToVec3(m.lat, m.lon), dir);
      };
      if (md.kind === "focus") face(md.body, selM?.body === md.body ? selM : ms.find((m) => m.body === md.body && m.kind === "target"));
      if (selM?.body === "earth") face("earth", selM);
      else {
        // No Earth site selected: turn the Earth to the centre of its candidate sites so the arcs land in view.
        const cs = ms.filter((m) => m.body === "earth");
        if (cs.length) {
          const c = cs.reduce((acc, m) => acc.add(latLonToVec3(m.lat, m.lon)), new THREE.Vector3());
          if (c.lengthSq() > 1e-6) { c.normalize(); out.earth = orientToFace(c, to.pos.clone().sub(centerOf(to, "earth")).normalize()); }
        }
      }
      return out;
    };

    const markerWorld = (m: OrreryMarker) => worldPoint(cur.layout, m.body, bodies[m.body].group.quaternion, bodies[m.body].group.scale.x / cur.layout[m.body].r, m.lat, m.lon);
    const facing = (p: THREE.Vector3, n: THREE.Vector3) => n.dot(camera.position.clone().sub(p).normalize()) > 0.12;
    const rebuildArcs = (nowSec: number, keep: boolean) => {
      const { markers: ms, arcs: as } = latest.current, byId = new Map(ms.map((m) => [m.id, m]));
      const specs: ArcSpec[] = [];
      for (const a of as) {
        const f = byId.get(a.from), t = byId.get(a.to);
        if (!f || !t) continue;
        const A = markerWorld(f), B = markerWorld(t);
        specs.push({ id: a.id, dims: a.dims, a: A.p, na: A.n, b: B.p, nb: B.n, color0: COLOR[f.body], color1: COLOR[t.body], hiddenEnd: !facing(B.p, B.n) });
      }
      arcSet.setArcs(specs, nowSec, keep);
      arcSet.setHighlight(latest.current.selectedId && specs.some((s) => s.id === latest.current.selectedId) ? latest.current.selectedId : null);
      dirty = true;
    };

    const sync = () => {
      const { mode: md, selectedId: sel } = latest.current, to = poseFor(md, aspect), key = JSON.stringify(md);
      const qTo = targetQuats(to), from = cur, qFrom = { earth: bodies.earth.group.quaternion.clone(), moon: bodies.moon.group.quaternion.clone(), mars: bodies.mars.group.quaternion.clone() };
      const modeChanged = key !== lastKey;
      lastKey = key;
      if (md.kind === "focus") ensureHi(md.body);
      arcSet.setHighlight(sel && latest.current.arcs.some((a) => a.id === sel) ? sel : null);
      const dur = reduce ? 0 : modeChanged ? TWEEN_MS : ROTATE_MS;
      if (modeChanged) arcSet.setArcs([], performance.now() / 1000); // los arcos se ocultan y se vuelven a dibujar al llegar
      tween = { t0: performance.now(), dur, from, to, qFrom, qTo, hideArcs: modeChanged };
      dirty = true;
      if (dur === 0) step(performance.now());
    };

    // ---------- marcadores HTML (botones) ----------
    const place = () => {
      const pts: { id: string; x: number; y: number; rank?: number }[] = [], v = new THREE.Vector3();
      const info = new Map<string, { x: number; y: number; vis: boolean }>();
      for (const m of latest.current.markers) {
        const w = markerWorld(m), vis = facing(w.p, w.n);
        v.copy(w.p).project(camera);
        const x = (v.x * 0.5 + 0.5) * width, y = (-v.y * 0.5 + 0.5) * height;
        info.set(m.id, { x, y, vis });
        if (vis && m.kind === "candidate") pts.push({ id: m.id, x, y, rank: m.rank });
      }
      const show = declutter(pts, latest.current.selectedId, coarse ? 40 : 28);
      for (const m of latest.current.markers) {
        const b = buttons.current.get(m.id), i = info.get(m.id);
        if (!b || !i) continue;
        const ok = i.vis && (m.kind === "target" || show.has(m.id));
        b.style.visibility = ok ? "visible" : "hidden";
        b.style.opacity = String(cur.opacity[m.body] < 0.9 ? 0.5 : 1);
        b.classList.toggle("flip", m.kind !== "target" && i.x > width * 0.62);
        if (ok) b.style.transform = `translate(${i.x.toFixed(1)}px, ${i.y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    };

    // ---------- arrastrar un planeta (no la cámara) con inercia ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let drag: { id: BodyId; x: number; y: number; vx: number; vy: number; pid: number } | null = null, inertia: { id: BodyId; vx: number; vy: number } | null = null;
    const rotate = (id: BodyId, dx: number, dy: number) => {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.006).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.006));
      bodies[id].group.quaternion.premultiply(q); dirty = true; arcsDirty = true;
    };
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return; // los marcadores son botones: no arrastran
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(BODY_IDS.map((id) => bodies[id].mesh))[0];
      if (!hit) return;
      const id = BODY_IDS.find((b) => bodies[b].mesh === hit.object)!;
      drag = { id, x: e.clientX, y: e.clientY, vx: 0, vy: 0, pid: e.pointerId }; inertia = null;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY; drag.vx = drag.vx * 0.6 + dx * 0.4; drag.vy = drag.vy * 0.6 + dy * 0.4;
      rotate(drag.id, dx, dy);
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      if (!reduce && !latest.current.paused && Math.hypot(drag.vx, drag.vy) > 1) inertia = { id: drag.id, vx: drag.vx, vy: drag.vy };
      drag = null;
    };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    // ---------- bucle ----------
    const step = (now: number) => {
      if (tween) {
        const k = tween.dur === 0 ? 1 : Math.min(1, (now - tween.t0) / tween.dur);
        applyPose(lerpPose(tween.from, tween.to, k)); // lerpPose ya aplica easeInOutCubic
        for (const id of BODY_IDS) { const qt = tween.qTo[id]; if (qt) bodies[id].group.quaternion.copy(tween.qFrom[id]).slerp(qt, easeInOutCubic(k)); }
        if (k >= 1) { const hid = tween.hideArcs; tween = null; arcsDirty = false; if (hid) rebuildArcs(now / 1000, false); else rebuildArcs(now / 1000, true); }
      }
      if (inertia) { rotate(inertia.id, inertia.vx, inertia.vy); inertia.vx *= 0.93; inertia.vy *= 0.93; if (Math.hypot(inertia.vx, inertia.vy) < 0.05) inertia = null; }
      if (arcsDirty && !(tween && tween.hideArcs)) { arcsDirty = false; rebuildArcs(now / 1000, true); } // los arcos siguen a los globos mientras giran
    };
    let raf = 0, onScreen = true;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !onScreen) return;
      step(now);
      const busy = arcSet.update(now / 1000, latest.current.paused);
      if (busy) dirty = true;
      if (dirty) { renderer.render(scene, camera); place(); dirty = false; }
    };
    const resize = () => {
      width = el.clientWidth; height = el.clientHeight;
      if (!width || !height) return;
      aspect = width / height; renderer.setSize(width, height, false); camera.aspect = aspect; camera.updateProjectionMatrix(); arcSet.setResolution(width, height);
      const to = poseFor(latest.current.mode, aspect); // al redimensionar solo cambia el encuadre; la rotación manual del usuario se respeta
      if (tween) tween.to = to; else applyPose(to);
      arcsDirty = true;
    };
    const ro = new ResizeObserver(resize); ro.observe(el);
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; dirty = true; }); io.observe(el);
    resize(); sync();
    raf = requestAnimationFrame(frame);
    api.current = { sync, invalidate: () => (dirty = true) };

    cleanup = () => {
      disposed = true; api.current = null;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      arcSet.dispose();
      for (const id of BODY_IDS) bodies[id].mat.map?.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
    if (cancelled) cleanup();
    })();
    return () => { cancelled = true; cleanup(); };
  }, []);

  return (
    <div ref={host} className={`relative h-full w-full overflow-hidden ${className}`} style={{ touchAction: "pan-y" }} role="group" aria-roledescription="3D scene" aria-label="Earth, Moon and Mars. Drag a planet to rotate it. The list has the same places as text.">
      {loading && <div role="status" aria-label="Loading globes" className="skel absolute inset-[18%] rounded-full" />}
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <button
            key={m.id}
            ref={(n) => { if (n) buttons.current.set(m.id, n); else buttons.current.delete(m.id); }}
            type="button"
            className={`mk ${m.kind === "target" ? "target" : ""} ${m.id === selectedId ? "sel" : ""} pointer-events-auto`}
            style={{ left: 0, top: 0, visibility: "hidden", ["--c" as string]: `#${COLOR[m.body].toString(16).padStart(6, "0")}` }}
            aria-label={`${m.label}${m.rank ? `, rank ${m.rank}` : ""}`}
            aria-pressed={m.id === selectedId}
            onClick={() => onSelect?.(m.id)}
          >
            <i />
            {(m.id === selectedId || m.kind === "target") && <span className="mk-l">{m.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
