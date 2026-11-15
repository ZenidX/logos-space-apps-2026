"use client";
// AI-assisted (Claude), reviewed by team Logos
// One three.js scene with two views. Overview: the Sun in the centre, the Earth and Mars on their orbits (radii and
// periods in real proportion) and the Moon around the Earth. Close-up: the Earth with the mission's sites, and the target
// world shown beside it; no orbit is drawn there. Choosing a mission flies the camera from the overview to the target
// world and then to the Earth. Every visible site has a thin dashed line (the visual language of the orbits) from its
// dot to its name, which is placed outside the globe (src/lib/label-layout.ts): names never overlap, hide with their site
// on the far side and come back when the Earth is turned. No line is drawn to the target world.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { latLonToVec3 } from "@/lib/globe-math";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { layoutLabels, type Disc, type LabelOut, type Rect } from "@/lib/label-layout";
import { EARTH_R, FOV, NAME_ROOM, ORBIT, RADIUS, SUN_R, closeFrame, closePose, companionPos, ease, facesCamera, lerpPose, orientToFace, overviewPose, positions, segmentHitsSphere, siteFacing, targetPose, type BodyId, type Mode } from "@/lib/solar-math";

export interface SceneMarker { id: string; body: BodyId; lat: number; lon: number; kind: "candidate" | "target"; label: string; rank?: number }
interface Props {
  mode: Mode;
  markers: SceneMarker[];
  selectedId: string | null;
  highlightId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  paused?: boolean;
  primaryCount?: number; // the first N candidate markers (the new regions) are the ones the Earth turns to show
  onError?: (e: unknown) => void;
  className?: string;
}

const BODIES: BodyId[] = ["earth", "moon", "mars"];
const COLOR: Record<BodyId, number> = { earth: 0x5db4ff, moon: 0xd7dce6, mars: 0xff8d5e };
const NAMES = [["sun", "Sun"], ["earth", "Earth"], ["moon", "Moon"], ["mars", "Mars"]] as const;
const ATMO_VERT = "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const ATMO_FRAG = "uniform vec3 c; uniform float k; varying vec3 n; void main(){ float i = pow(0.7 - dot(n, vec3(0.0, 0.0, 1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * clamp(i, 0.0, 1.0) * k; }";
const JOURNEY_S = 2.8, BACK_S = 1.3, IDLE_MS = 30000, COMPACT_W = 620, COMPACT_NAMES = 3, ROOM_W = 560;
const smooth = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

export default function SolarScene({ mode, markers, selectedId, highlightId = null, onSelect, onHover, paused = false, primaryCount, onError, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const names = useRef(new Map<string, HTMLSpanElement>());
  const labs = useRef(new Map<string, HTMLSpanElement>());
  const lines = useRef(new Map<string, SVGLineElement>());
  const latest = useRef({ mode, markers, selectedId, highlightId, paused, primaryCount, onError });
  const [loading, setLoading] = useState(true);

  useEffect(() => { latest.current = { mode, markers, selectedId, highlightId, paused, primaryCount, onError }; }, [mode, markers, selectedId, highlightId, paused, primaryCount, onError]);

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
    const lite = small || window.matchMedia("(pointer: coarse)").matches || navigator.hardwareConcurrency <= 4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 400);
    scene.add(camera, new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-2, 1.4, 3); camera.add(key); // light travels with the camera so the visible side is always lit
    let width = 1, height = 1, disposed = false;
    const disposables: { dispose: () => void }[] = [];
    const keep = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

    // ---------- Sun ----------
    const sun = new THREE.Mesh(keep(new THREE.SphereGeometry(SUN_R, 40, 28)), keep(new THREE.MeshBasicMaterial({ color: 0xfff1cf })));
    const halo = new THREE.Mesh(keep(new THREE.SphereGeometry(SUN_R * 2.6, 40, 28)), keep(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(0xffe2a0) }, k: { value: 0.45 } }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG })));
    sun.add(halo); scene.add(sun);

    // ---------- globes ----------
    const loader = new THREE.TextureLoader(), aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const mesh = {} as Record<BodyId, THREE.Mesh>, mat = {} as Record<BodyId, THREE.MeshLambertMaterial>, atmo = {} as Partial<Record<BodyId, THREE.Mesh>>;
    const loadTex = (url: string) => new Promise<THREE.Texture>((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, rej));
    const segs: [number, number] = lite ? [48, 32] : [64, 48];
    for (const id of BODIES) {
      const m = keep(new THREE.MeshLambertMaterial());
      mesh[id] = new THREE.Mesh(keep(new THREE.SphereGeometry(1, segs[0], segs[1])), m); mat[id] = m; mesh[id].scale.setScalar(RADIUS[id]);
      const a = GLOBE_TEX[id].atmosphere;
      if (a !== null) { atmo[id] = new THREE.Mesh(keep(new THREE.SphereGeometry(1.045, 40, 28)), keep(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(a) }, k: { value: 0.55 } }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG }))); mesh[id].add(atmo[id]!); }
      scene.add(mesh[id]);
      loadTex(GLOBE_TEX[id].lo).then((t) => {
        if (disposed) { t.dispose(); return; }
        m.map = t; m.needsUpdate = true;
        if (BODIES.every((b) => mat[b].map)) setLoading(false);
        if (id === "earth" && !lite) window.setTimeout(() => { if (!disposed) loadTex(GLOBE_TEX.earth.hi).then((hi) => { if (disposed) { hi.dispose(); return; } m.map?.dispose(); m.map = hi; m.needsUpdate = true; }).catch(() => {}); }, 6000);
      }).catch((e) => { if (!disposed) latest.current.onError?.(e); });
    }

    // ---------- orbits: thin dashed circles (overview only) ----------
    const circle = (r: number, color: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(new THREE.Vector3(r * Math.cos(a), 0, r * Math.sin(a))); }
      const line = new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(pts)), keep(new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.5, dashSize: r * 0.022, gapSize: r * 0.018 })));
      line.computeLineDistances(); scene.add(line); return line;
    };
    const orbitEarth = circle(ORBIT.earth, COLOR.earth), orbitMars = circle(ORBIT.mars, COLOR.mars), orbitMoon = circle(ORBIT.moon, COLOR.moon);

    // ---------- state ----------
    const started = performance.now();
    let tScene = 0, k = 0, back = false, last = performance.now(), raf = 0, onScreen = true, dirty = true, lastKey = "", first = true;
    let compBody: "moon" | "mars" | null = null, compAlpha = 0;
    const earthQ = new THREE.Quaternion(), tmpQ = new THREE.Quaternion(), yAxis = new THREE.Vector3(0, 1, 0), camPos = new THREE.Vector3();
    let drag: { x: number; y: number; pid: number } | null = null, userTurned = false, lastMission = "";
    // names: measured sizes, the position each one had in the last frame, and what is on top of the scene (kept clear)
    const sizeOf = new Map<string, { w: number; h: number }>(), slotOf = new Map<string, number>();
    const camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), v = new THREE.Vector3();
    let avoid: Rect[] = [], idleAt = performance.now();
    const readAvoid = () => {
      const hb = el.getBoundingClientRect(); avoid = [];
      document.querySelectorAll<HTMLElement>("[data-scene-avoid]").forEach((n) => {
        const r = n.getBoundingClientRect(), q = { x0: r.left - hb.left, y0: r.top - hb.top, x1: r.right - hb.left, y1: r.bottom - hb.top };
        if (r.width && r.height && q.x1 > 0 && q.x0 < hb.width && q.y1 > 0 && q.y0 < hb.height) avoid.push(q);
      });
    };

    const resize = () => {
      width = el.clientWidth; height = el.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      sizeOf.clear(); readAvoid(); dirty = true;
    };
    const setAlpha = (id: BodyId, a: number) => { mesh[id].visible = a > 0.01; mat[id].opacity = a; mat[id].transparent = a < 0.999; if (atmo[id]) atmo[id]!.visible = a > 0.6; };
    const world = (m: SceneMarker) => { const n = latLonToVec3(m.lat, m.lon).applyQuaternion(mesh[m.body].quaternion).normalize(); return { n, p: mesh[m.body].position.clone().addScaledVector(n, mesh[m.body].scale.x) }; };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { markers: ms, selectedId: sel, paused: isPaused, mode: md } = latest.current;
      // the overview stops after a while without any input (nothing is drawn then) and goes on at the next one
      const still = isPaused || reduce, jump = still || first, rest = still || now - idleAt > IDLE_MS, focus = md.kind === "focus" ? md.body : null, aspect = width / height;
      let moving = false;

      // journey: 0 = overview, 1 = close-up of the Earth (via the target world on the way in)
      const goal = focus ? 1 : 0;
      if (k !== goal) {
        back = goal === 0;
        // a direct link opens straight in the close-up; the camera journey plays for choices made on the page
        k = reduce || first || now - started < 700 ? goal : goal === 1 ? Math.min(1, k + dt / JOURNEY_S) : Math.max(0, k - dt / BACK_S);
        moving = true;
      }
      // the planets keep their real proportions of speed in the overview and stand still in the close-up
      const flow = 1 - smooth(k * 2);
      if (!rest && flow > 0) { tScene += dt * flow; moving = true; }
      const P = positions(tScene), E = P.earth;

      // which world is shown beside the Earth
      const want = focus && k > (back ? 0.7 : 0.62) ? focus : null;
      if (first && want) { compBody = want; compAlpha = 1; } // a direct link shows the target world at once
      if (compBody === want) { if (want && compAlpha < 1) { compAlpha = Math.min(1, compAlpha + dt * 3); moving = true; } }
      else if (compAlpha > 0) { compAlpha = Math.max(0, compAlpha - dt * 4.5); moving = true; }
      else { compBody = want; moving = true; }
      const far = 1 - smooth((k - 0.5) / 0.14); // how much of the overview is left
      mesh.earth.position.copy(E);
      for (const id of ["moon", "mars"] as const) {
        if (compBody === id) { mesh[id].position.copy(companionPos(E, id)); setAlpha(id, compAlpha); }
        else { mesh[id].position.copy(P[id]); setAlpha(id, far); }
      }
      sun.visible = far > 0.01; (halo.material as THREE.ShaderMaterial).uniforms.k.value = 0.45 * far; (sun.material as THREE.MeshBasicMaterial).opacity = far; (sun.material as THREE.MeshBasicMaterial).transparent = far < 0.999;
      for (const [line, o] of [[orbitEarth, 0.5], [orbitMars, 0.5], [orbitMoon, 0.38]] as const) { line.visible = far > 0.01; (line.material as THREE.LineDashedMaterial).opacity = o * far; }
      orbitMoon.position.copy(E);

      // camera
      const room = width >= ROOM_W ? NAME_ROOM : 0; // wide scenes keep room for names on the left of the Earth
      const over = overviewPose(aspect), pose = !focus && k === 0 ? over
        : back || !focus ? lerpPose(over, closePose(E, (focus ?? compBody ?? "mars") as "moon" | "mars", aspect, room), ease(k))
        : k <= 0.5 ? lerpPose(over, targetPose(P[focus], focus), ease(k / 0.5))
        : lerpPose(targetPose(P[focus], focus), closePose(E, focus, aspect, room), ease((k - 0.5) / 0.5));
      camera.position.copy(pose.pos); camera.lookAt(pose.look); camera.updateMatrixWorld(true); camPos.copy(pose.pos);

      // the Earth: slow spin, or turn the opened site to its facing direction
      const mKey = ms[0]?.id ?? ""; if (mKey !== lastMission) { lastMission = mKey; userTurned = false; }
      const nNew = latest.current.primaryCount ?? 99;
      const selSite = sel ? ms.find((m) => m.id === sel) : undefined, target = ms.find((m) => m.kind === "target");
      const open = selSite && selSite.body === "earth" && compBody ? selSite : null;
      if (open && compBody) {
        tmpQ.copy(orientToFace(latLonToVec3(open.lat, open.lon), siteFacing(E)));
        if (earthQ.angleTo(tmpQ) > 1e-3) { if (jump) earthQ.copy(tmpQ); else earthQ.slerp(tmpQ, 1 - Math.exp(-dt * 3.2)); moving = true; }
      } else if (focus && k > 0.5 && !userTurned) {
        // close-up with no site open: the middle of the mission's new regions faces the camera, so names fit all around
        const cs = ms.filter((m) => m.body === "earth" && (m.rank ?? 99) <= nNew), c = cs.reduce((acc, m) => acc.add(latLonToVec3(m.lat, m.lon)), new THREE.Vector3());
        if (c.lengthSq() > 1e-6) { tmpQ.copy(orientToFace(c.normalize(), closeFrame(E).dir)); if (earthQ.angleTo(tmpQ) > 1e-3) { if (jump) earthQ.copy(tmpQ); else earthQ.slerp(tmpQ, 1 - Math.exp(-dt * 2.4)); moving = true; } }
      } else if (!rest && !drag && !focus) { earthQ.premultiply(tmpQ.setFromAxisAngle(yAxis, dt * 0.07)); moving = true; }
      mesh.earth.quaternion.copy(earthQ);
      // the companion keeps its marked point turned between the camera and the Earth
      if (compBody && target && target.body === compBody) {
        const C = mesh[compBody].position;
        const face = camPos.clone().sub(C).normalize().multiplyScalar(0.45).addScaledVector(E.clone().sub(C).normalize(), 0.55).normalize();
        mesh[compBody].quaternion.copy(orientToFace(latLonToVec3(target.lat, target.lon), face));
      }

      first = false;
      return moving || drag !== null;
    };

    // screen disc (centre and radius in px) of a globe: its limb as seen from the camera
    const discOf = (c: THREE.Vector3, r: number): Disc => {
      const to = camPos.clone().sub(c), D = to.length(), lc = c.clone().addScaledVector(to, (r * r) / (D * D)), lr = r * Math.sqrt(Math.max(0, 1 - (r * r) / (D * D)));
      v.copy(c).project(camera);
      const x = (v.x * 0.5 + 0.5) * width, y = (-v.y * 0.5 + 0.5) * height;
      let R = 0;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { v.copy(lc).addScaledVector(camRight, a * lr).addScaledVector(camUp, b * lr).project(camera); R = Math.max(R, Math.hypot((v.x * 0.5 + 0.5) * width - x, (-v.y * 0.5 + 0.5) * height - y)); }
      return { x, y, r: R };
    };
    const sizeFor = (id: string) => {
      let z = sizeOf.get(id);
      if (!z) { const n = labs.current.get(id); z = { w: (n?.offsetWidth || 120) + 1, h: n?.offsetHeight || 22 }; if (n?.offsetWidth) sizeOf.set(id, z); }
      return z;
    };

    const place = () => {
      const { markers: ms, selectedId: sel, highlightId: hi } = latest.current;
      const closeUp = k > 0.9, sites: { id: string; x: number; y: number; rank: number }[] = [];
      let targetBox: Rect | null = null;
      camRight.setFromMatrixColumn(camera.matrixWorld, 0); camUp.setFromMatrixColumn(camera.matrixWorld, 1);
      for (const m of ms) {
        const b = buttons.current.get(m.id);
        if (!b) continue;
        const shown = m.kind === "target" ? !!compBody && m.body === compBody && compAlpha > 0.5 : closeUp;
        const w = shown ? world(m) : null;
        let vis = !!w && facesCamera(w.p, w.n, camPos);
        if (vis && w) for (const o of BODIES) if (o !== m.body && mesh[o].visible && segmentHitsSphere(w.p, camPos, mesh[o].position, mesh[o].scale.x)) { vis = false; break; }
        b.style.visibility = vis ? "visible" : "hidden";
        if (!vis || !w) continue;
        v.copy(w.p).project(camera);
        const x = (v.x * 0.5 + 0.5) * width, y = (-v.y * 0.5 + 0.5) * height;
        b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        if (m.kind === "target") {
          b.classList.toggle("edge-r", x > width - 96); b.classList.toggle("edge-l", x < 96);
          const z = sizeFor(m.id); targetBox = { x0: x - z.w, y0: y - 20 - z.h, x1: x + z.w, y1: y + 14 };
        } else sites.push({ id: m.id, x, y, rank: m.rank ?? 99 });
      }
      // names of the sites: outside the Earth, the opened one first, then the one pointed at in the list, then by rank
      const out = new Map<string, LabelOut>();
      if (closeUp && sites.length) {
        sites.sort((a, b) => Number(b.id === sel) - Number(a.id === sel) || Number(b.id === hi) - Number(a.id === hi) || a.rank - b.rank);
        let extra = 0;
        const asked = width >= COMPACT_W ? sites : sites.filter((c) => c.id === sel || c.id === hi || extra++ < COMPACT_NAMES); // small scenes: the opened site and the first few
        const res = layoutLabels({
          earth: discOf(mesh.earth.position, EARTH_R),
          discs: compBody && compAlpha > 0.05 ? [discOf(mesh[compBody].position, RADIUS[compBody])] : [],
          rects: targetBox ? [...avoid, targetBox] : avoid,
          bounds: { x0: 0, y0: 0, x1: width, y1: height },
          labels: asked.map((c) => ({ id: c.id, x: c.x, y: c.y, ...sizeFor(c.id), prev: slotOf.get(c.id) })),
          dots: sites, max: 12,
        });
        slotOf.clear();
        for (const o of res) { out.set(o.id, o); slotOf.set(o.id, o.slot); }
      }
      const at = new Map(sites.map((c) => [c.id, c]));
      for (const m of ms) {
        if (m.kind !== "candidate") continue;
        const lab = labs.current.get(m.id), line = lines.current.get(m.id), o = out.get(m.id), c = at.get(m.id);
        if (lab) { lab.classList.toggle("on", !!o); if (o && c) lab.style.transform = `translate(${(o.box.x0 - c.x).toFixed(1)}px, ${(o.box.y0 - c.y).toFixed(1)}px)`; }
        if (!line) continue;
        line.style.visibility = o ? "visible" : "hidden";
        if (!o || !c) continue;
        const len = Math.hypot(o.ex - c.x, o.ey - c.y) || 1, s0 = Math.min(9, len * 0.5) / len; // start at the edge of the dot
        line.setAttribute("x1", (c.x + (o.ex - c.x) * s0).toFixed(1)); line.setAttribute("y1", (c.y + (o.ey - c.y) * s0).toFixed(1));
        line.setAttribute("x2", o.ex.toFixed(1)); line.setAttribute("y2", o.ey.toFixed(1));
      }
      // names of the bodies in the overview
      const fade = 1 - smooth(k / 0.35);
      for (const [id] of NAMES) {
        const s = names.current.get(id);
        if (!s) continue;
        if (id === "moon" && width < COMPACT_W) { s.style.visibility = "hidden"; continue; } // small scenes: the Moon's name would sit on the Earth's
        const p = id === "sun" ? sun.position : mesh[id as BodyId].position, r = id === "sun" ? SUN_R : RADIUS[id as BodyId];
        v.copy(p).project(camera);
        const below = new THREE.Vector3().copy(p).addScaledVector(camera.up, -r * 1.25).project(camera);
        s.style.opacity = String(fade); s.style.visibility = fade > 0.02 ? "visible" : "hidden";
        s.style.transform = `translate(${((v.x * 0.5 + 0.5) * width).toFixed(1)}px, ${((-below.y * 0.5 + 0.5) * height + 6).toFixed(1)}px) translate(-50%, 0)`;
      }
    };

    // drag the Earth to turn it (close-up, while no site is open)
    const down = (e: PointerEvent) => { if ((e.target as HTMLElement).closest("button") || latest.current.selectedId || k < 0.9) return; drag = { x: e.clientX, y: e.clientY, pid: e.pointerId }; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; userTurned = true;
      earthQ.premultiply(tmpQ.setFromAxisAngle(yAxis, dx * 0.006)).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.006)); dirty = true;
    };
    const up = (e: PointerEvent) => { if (drag && e.pointerId === drag.pid) drag = null; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !onScreen) { last = now; return; }
      const c = latest.current, sig = `${c.selectedId}|${c.highlightId}|${c.paused}|${c.markers.length}|${c.markers[0]?.id}|${JSON.stringify(c.mode)}`;
      if (sig !== lastKey) { lastKey = sig; readAvoid(); dirty = true; window.setTimeout(() => { if (!disposed) { readAvoid(); dirty = true; } }, 900); }
      const moving = step(now);
      if (moving || dirty) { place(); renderer.render(scene, camera); dirty = false; }
    };
    const wake = () => { idleAt = performance.now(); };
    const WAKE = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"] as const;
    for (const e of WAKE) window.addEventListener(e, wake, { passive: true });
    document.fonts?.ready.then(() => { if (!disposed) { sizeOf.clear(); dirty = true; } }).catch(() => {});
    const ro = new ResizeObserver(resize); ro.observe(el);
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; dirty = true; }); io.observe(el);
    resize(); raf = requestAnimationFrame(frame);

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      for (const e of WAKE) window.removeEventListener(e, wake);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      for (const id of BODIES) mat[id].map?.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={host} className={`relative h-full w-full overflow-hidden ${paused ? "is-paused" : ""} ${className}`} style={{ touchAction: "pan-y" }} role="group" aria-roledescription="3D scene" aria-label="The Sun with the Earth and Mars on their orbits, and the Moon around the Earth. Choosing a mission moves to a close-up of the Earth with the target world beside it. Sizes are not to scale. The list has the same places as text.">
      {loading && <div role="status" aria-label="Loading" className="skel absolute inset-[30%] rounded-full" />}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {NAMES.map(([id, label]) => <span key={id} ref={(n) => { if (n) names.current.set(id, n); else names.current.delete(id); }} className="body-name absolute left-0 top-0" style={{ visibility: "hidden" }}>{label}</span>)}
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {markers.filter((m) => m.kind === "candidate").map((m) => <line key={m.id} ref={(n) => { if (n) lines.current.set(m.id, n); else lines.current.delete(m.id); }} className={`lead ${m.id === selectedId ? "sel" : m.id === highlightId ? "hi" : ""}`} style={{ visibility: "hidden" }} />)}
      </svg>
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <button
            key={m.id}
            ref={(n) => { if (n) buttons.current.set(m.id, n); else buttons.current.delete(m.id); }}
            type="button"
            className={`mk ${m.kind === "target" ? "target" : "cand"} ${m.id === selectedId ? "sel" : m.id === highlightId ? "hi" : ""} pointer-events-auto`}
            style={{ left: 0, top: 0, visibility: "hidden", ["--c" as string]: `#${COLOR[m.body].toString(16).padStart(6, "0")}` }}
            aria-label={`${m.label}${m.rank ? `, number ${m.rank}` : ""}`}
            aria-pressed={m.id === selectedId}
            onClick={() => onSelect?.(m.id)}
            onMouseEnter={m.kind === "candidate" ? () => onHover?.(m.id) : undefined}
            onMouseLeave={m.kind === "candidate" ? () => onHover?.(null) : undefined}
          >
            <i />
            <span className="mk-l" ref={(n) => { if (n) labs.current.set(m.id, n); else labs.current.delete(m.id); }}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
