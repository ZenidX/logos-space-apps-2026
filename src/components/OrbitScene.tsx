"use client";
// AI-assisted (Claude), reviewed by team Logos
// «Shared orbit»: the Earth in the centre, turning slowly; the Moon and Mars travel around it on two drawn orbits and
// pass in front of and behind it (depth-tested). A site is linked to its target by a straight line of light that only
// appears when the target is on the site's side and near it, and never crosses a globe. A schematic, not to scale.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { declutter, latLonToVec3 } from "@/lib/globe-math";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { EARTH_R, FOV, angleDelta, cameraDir, frameDistance, laserAlpha, layoutFor, orbitPoint, orientToFace, parkAngle, segmentHitsSphere, siteFacing, type BodyId, type Mode } from "@/lib/orbit-math";

export interface SceneMarker { id: string; body: BodyId; lat: number; lon: number; kind: "candidate" | "target"; label: string; rank?: number }
export interface SceneLink { id: string; from: string; to: string } // from = target marker id, to = site marker id
interface Props {
  mode: Mode;
  markers: SceneMarker[];
  links: SceneLink[];
  selectedId: string | null;
  highlightId?: string | null;
  onSelect?: (id: string) => void;
  paused?: boolean;
  onError?: (e: unknown) => void;
  className?: string;
}

const BODIES: BodyId[] = ["earth", "moon", "mars"];
const COLOR: Record<BodyId, number> = { earth: 0x5db4ff, moon: 0xd7dce6, mars: 0xff8d5e };
const ATMO_VERT = "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const ATMO_FRAG = "uniform vec3 c; varying vec3 n; void main(){ float i = pow(0.7 - dot(n, vec3(0.0, 0.0, 1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * clamp(i, 0.0, 1.0) * 0.55; }";

export default function OrbitScene({ mode, markers, links, selectedId, highlightId = null, onSelect, paused = false, onError, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const latest = useRef({ mode, markers, links, selectedId, highlightId, paused, onError });
  const [loading, setLoading] = useState(true);

  useEffect(() => { latest.current = { mode, markers, links, selectedId, highlightId, paused, onError }; }, [mode, markers, links, selectedId, highlightId, paused, onError]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    const small = window.innerWidth < 700;
    try {
      // ?capture=1 keeps the drawing buffer so screenshots and screen-recording tools can read the canvas.
      const capture = new URLSearchParams(window.location.search).has("capture");
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: capture });
    } catch (e) { latest.current.onError?.(e); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lite = small || coarse || navigator.hardwareConcurrency <= 4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    scene.add(camera, new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-2, 1.4, 3); camera.add(sun); // light travels with the camera: the lit side is always visible
    let L = layoutFor(small), width = 1, height = 1, disposed = false;

    // ---------- globes ----------
    const loader = new THREE.TextureLoader(), aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const disposables: { dispose: () => void }[] = [];
    const mesh = {} as Record<BodyId, THREE.Mesh>, mat = {} as Record<BodyId, THREE.MeshStandardMaterial>;
    const loadTex = (url: string) => new Promise<THREE.Texture>((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, rej));
    const segs: [number, number] = lite ? [48, 32] : [64, 48];
    for (const id of BODIES) {
      const g = new THREE.SphereGeometry(1, segs[0], segs[1]), m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
      mesh[id] = new THREE.Mesh(g, m); mat[id] = m; disposables.push(g, m);
      const atm = GLOBE_TEX[id].atmosphere;
      if (atm !== null) {
        const ag = new THREE.SphereGeometry(1.045, 40, 28), am = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(atm) } }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG });
        mesh[id].add(new THREE.Mesh(ag, am)); disposables.push(ag, am);
      }
      scene.add(mesh[id]);
      loadTex(GLOBE_TEX[id].lo).then((t) => {
        if (disposed) { t.dispose(); return; }
        m.map = t; m.needsUpdate = true;
        if (BODIES.every((b) => mat[b].map)) setLoading(false);
        if (id === "earth" && !lite) window.setTimeout(() => { if (!disposed) loadTex(GLOBE_TEX.earth.hi).then((hi) => { if (disposed) { hi.dispose(); return; } m.map?.dispose(); m.map = hi; m.needsUpdate = true; }).catch(() => {}); }, 6000);
      }).catch((e) => { if (!disposed) latest.current.onError?.(e); });
    }
    mesh.earth.scale.setScalar(EARTH_R);

    // ---------- orbits (thin dashed lines, depth-tested so they pass behind the Earth) ----------
    const orbitLines: Record<"moon" | "mars", THREE.Line> = {} as never;
    const buildOrbits = () => {
      for (const id of ["moon", "mars"] as const) {
        if (orbitLines[id]) { scene.remove(orbitLines[id]); orbitLines[id].geometry.dispose(); (orbitLines[id].material as THREE.Material).dispose(); }
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 256; i++) pts.push(orbitPoint(L[id], (i / 256) * Math.PI * 2));
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: COLOR[id], transparent: true, opacity: 0.5, dashSize: 0.07, gapSize: 0.06 }));
        line.computeLineDistances(); orbitLines[id] = line; scene.add(line);
        mesh[id].scale.setScalar(L[id].r);
      }
    };
    buildOrbits();

    // ---------- lasers: one core line and one soft glow per link, reused every frame ----------
    const lasers = new Map<string, { core: Line2; glow: Line2 }>();
    const laserFor = (id: string, color: number) => {
      let l = lasers.get(id);
      if (!l) {
        const mk = (w: number, o: number) => { const line = new Line2(new LineGeometry(), new LineMaterial({ color, linewidth: w, transparent: true, opacity: o, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending })); line.material.resolution.set(width, height); line.renderOrder = 5; scene.add(line); return line; };
        l = { core: mk(2, 1), glow: mk(7, 0.25) }; lasers.set(id, l);
      }
      return l;
    };
    const dropLasers = (keep: Set<string>) => { for (const [id, l] of lasers) if (!keep.has(id)) { for (const x of [l.core, l.glow]) { scene.remove(x); x.geometry.dispose(); x.material.dispose(); } lasers.delete(id); } };

    // ---------- state ----------
    const theta = { moon: L.moon.phase, mars: L.mars.phase };
    const earthQ = new THREE.Quaternion(); // user/spin orientation of the Earth
    let last = performance.now(), raf = 0, onScreen = true, dirty = true;
    let drag: { x: number; y: number; pid: number } | null = null;
    const camPos = new THREE.Vector3(), tmp = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), yAxis = new THREE.Vector3(0, 1, 0);

    const resize = () => {
      width = el.clientWidth; height = el.clientHeight;
      if (!width || !height) return;
      const compact = width < 620;
      if (compact !== (L.moon.a === layoutFor(true).moon.a)) { L = layoutFor(compact); buildOrbits(); }
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      camPos.copy(cameraDir(L.elev)).multiplyScalar(frameDistance(camera.aspect, L)); camera.position.copy(camPos); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(true);
      for (const l of lasers.values()) { l.core.material.resolution.set(width, height); l.glow.material.resolution.set(width, height); }
      dirty = true;
    };

    const world = (m: SceneMarker) => { const n = latLonToVec3(m.lat, m.lon).applyQuaternion(mesh[m.body].quaternion).normalize(); return { n, p: mesh[m.body].position.clone().addScaledVector(n, mesh[m.body].scale.x) }; };
    const info = new Map<string, { x: number; y: number; vis: boolean }>();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { markers: ms, links: ls, selectedId: sel, highlightId: hi, paused: isPaused, mode: md } = latest.current;
      const still = isPaused || reduce, byId = new Map(ms.map((m) => [m.id, m]));
      const selSite = sel ? byId.get(sel) : undefined, target = ms.find((m) => m.kind === "target");
      const parked = selSite && selSite.body === "earth" && target && target.body !== "earth" ? (target.body as "moon" | "mars") : null;
      let moving = false;

      // orbits: free travel, or the short way to the parking spot when one of this body's sites is open
      for (const id of ["moon", "mars"] as const) {
        if (parked === id) {
          const d = angleDelta(theta[id], parkAngle(L[id], L.elev));
          if (Math.abs(d) > 1e-3) { theta[id] += still ? d : d * (1 - Math.exp(-dt * 3.2)); moving = true; }
        } else if (parked) { // the other world steps aside to the far side, so it never covers the opened site or its link
          const d = angleDelta(theta[id], parkAngle(L[id], L.elev) + Math.PI);
          if (Math.abs(d) > 1e-3) { theta[id] += still ? d : d * (1 - Math.exp(-dt * 2.4)); moving = true; }
        } else if (!still) { theta[id] += (Math.PI * 2 * dt) / L[id].period; moving = true; }
        orbitPoint(L[id], theta[id], mesh[id].position);
      }
      // the Earth: slow spin, or turn the opened site to its facing direction
      if (parked && selSite) {
        tmpQ.copy(orientToFace(latLonToVec3(selSite.lat, selSite.lon), siteFacing(L[parked], L.elev)));
        if (earthQ.angleTo(tmpQ) > 1e-3) { if (still) earthQ.copy(tmpQ); else earthQ.slerp(tmpQ, 1 - Math.exp(-dt * 3.2)); moving = true; }
      } else if (!still && !drag) { earthQ.premultiply(tmpQ.setFromAxisAngle(yAxis, dt * 0.06)); moving = true; }
      mesh.earth.quaternion.copy(earthQ);
      // each target keeps its marked point turned between the camera and the Earth (or the opened site), so links land on it
      for (const id of ["moon", "mars"] as const) {
        const t = ms.find((m) => m.kind === "target" && m.body === id);
        const aim = parked === id && selSite ? world(selSite).p : tmp.set(0, 0, 0);
        const toAim = aim.clone().sub(mesh[id].position).normalize(), toCam = camPos.clone().sub(mesh[id].position).normalize();
        const face = toCam.multiplyScalar(0.45).addScaledVector(toAim, 0.55).normalize();
        if (t) mesh[id].quaternion.copy(orientToFace(latLonToVec3(t.lat, t.lon), face));
        const dim = md.kind === "focus" && md.body !== id;
        mat[id].color.setScalar(dim ? 0.38 : 1); (orbitLines[id].material as THREE.LineDashedMaterial).opacity = dim ? 0.16 : 0.5;
      }

      // lasers
      const keep = new Set<string>();
      for (const l of ls) {
        const f = byId.get(l.from), t = byId.get(l.to);
        if (!f || !t || f.body === "earth") continue;
        if (sel && byId.get(sel)?.body === "earth" && l.to !== sel) continue; // an opened site shows only its own link
        const S = world(t), M = world(f), body = f.body as "moon" | "mars";
        let a = laserAlpha(S.p, S.n, M.p, mesh[body].position, L[body].r, camPos, l.to === sel);
        if (a > 0 && hi && hi !== l.to && !sel) a *= 0.25;
        if (a <= 0.01) continue;
        keep.add(l.id);
        const las = laserFor(l.id, COLOR[body]), pos = [S.p.x, S.p.y, S.p.z, M.p.x, M.p.y, M.p.z];
        las.core.geometry.setPositions(pos); las.glow.geometry.setPositions(pos);
        las.core.material.opacity = a; las.glow.material.opacity = 0.28 * a;
      }
      dropLasers(keep);
      return moving || drag !== null;
    };

    const place = () => {
      const pts: { id: string; x: number; y: number; rank?: number }[] = [], v = new THREE.Vector3();
      info.clear();
      for (const m of latest.current.markers) {
        const w = world(m);
        let vis = camPos.clone().sub(w.p).normalize().dot(w.n) > 0.12;
        if (vis) for (const b of BODIES) if (b !== m.body && segmentHitsSphere(w.p, camPos, mesh[b].position, mesh[b].scale.x)) { vis = false; break; } // hidden behind another globe
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
        b.classList.toggle("flip", m.kind !== "target" && i.x > width * 0.62);
        b.classList.toggle("edge-r", m.kind === "target" && i.x > width - 96); b.classList.toggle("edge-l", m.kind === "target" && i.x < 96);
        if (ok) b.style.transform = `translate(${i.x.toFixed(1)}px, ${i.y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    };

    // drag the Earth to turn it (not while a site is open)
    const down = (e: PointerEvent) => { if ((e.target as HTMLElement).closest("button") || latest.current.selectedId) return; drag = { x: e.clientX, y: e.clientY, pid: e.pointerId }; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      earthQ.premultiply(tmpQ.setFromAxisAngle(yAxis, dx * 0.006)).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.006)); dirty = true;
    };
    const up = (e: PointerEvent) => { if (drag && e.pointerId === drag.pid) drag = null; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    let lastKey = "";
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !onScreen) { last = now; return; }
      const c = latest.current, key = `${c.selectedId}|${c.highlightId}|${c.paused}|${c.markers.length}|${c.markers[0]?.id}|${JSON.stringify(c.mode)}`;
      if (key !== lastKey) { lastKey = key; dirty = true; }
      const moving = step(now);
      if (moving || dirty) { renderer.render(scene, camera); place(); dirty = false; }
    };
    const ro = new ResizeObserver(resize); ro.observe(el);
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; dirty = true; }); io.observe(el);
    resize(); raf = requestAnimationFrame(frame);

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      dropLasers(new Set());
      for (const id of ["moon", "mars"] as const) { orbitLines[id].geometry.dispose(); (orbitLines[id].material as THREE.Material).dispose(); }
      for (const id of BODIES) mat[id].map?.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={host} className={`relative h-full w-full overflow-hidden ${className}`} style={{ touchAction: "pan-y" }} role="group" aria-roledescription="3D scene" aria-label="Schematic: the Earth in the centre, with the Moon and Mars on drawn orbits around it. Not to scale. Drag the Earth to turn it. The list has the same places as text.">
      {loading && <div role="status" aria-label="Loading globes" className="skel absolute inset-[24%] rounded-full" />}
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <button
            key={m.id}
            ref={(n) => { if (n) buttons.current.set(m.id, n); else buttons.current.delete(m.id); }}
            type="button"
            className={`mk ${m.kind === "target" ? "target" : "cand"} ${m.id === selectedId || m.id === highlightId ? "sel" : ""} pointer-events-auto`}
            style={{ left: 0, top: 0, visibility: "hidden", ["--c" as string]: `#${COLOR[m.body].toString(16).padStart(6, "0")}` }}
            aria-label={`${m.label}${m.rank ? `, number ${m.rank}` : ""}`}
            aria-pressed={m.id === selectedId}
            onClick={() => onSelect?.(m.id)}
          >
            <i />
            {(m.id === selectedId || m.id === highlightId || m.kind === "target") && <span className="mk-l">{m.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
