"use client";
// AI-assisted (Claude), reviewed by team Logos
// One three.js scene with two views. Overview: the Sun in the centre, the Earth and Mars on their orbits (radii and
// periods in real proportion) and the Moon around the Earth. Close-up: the Earth with the mission's sites, and the target
// world shown beside it; no orbit is drawn there. Choosing a mission flies the camera from the overview to the target
// world and then to the Earth. Sites are named with thin dashed leader lines (the same visual language as the orbits);
// the opened site gets one brighter dashed line to its target, with the dashes moving. No line ever crosses a globe.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { latLonToVec3 } from "@/lib/globe-math";
import { GLOBE_TEX } from "@/lib/globe-tex";
import { EARTH_R, FOV, ORBIT, RADIUS, SUN_R, closePose, companionPos, ease, lerpPose, linkAlpha, orientToFace, overviewPose, positions, segmentHitsSphere, siteFacing, targetPose, type BodyId, type Mode } from "@/lib/solar-math";

export interface SceneMarker { id: string; body: BodyId; lat: number; lon: number; kind: "candidate" | "target"; label: string; rank?: number }
interface Props {
  mode: Mode;
  markers: SceneMarker[];
  selectedId: string | null;
  highlightId?: string | null;
  onSelect?: (id: string) => void;
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
const JOURNEY_S = 2.8, BACK_S = 1.3, LEADER = 0.34, MAX_SITES = 24;
const smooth = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

export default function SolarScene({ mode, markers, selectedId, highlightId = null, onSelect, paused = false, primaryCount, onError, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const names = useRef(new Map<string, HTMLSpanElement>());
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
    const mesh = {} as Record<BodyId, THREE.Mesh>, mat = {} as Record<BodyId, THREE.MeshStandardMaterial>, atmo = {} as Partial<Record<BodyId, THREE.Mesh>>;
    const loadTex = (url: string) => new Promise<THREE.Texture>((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, rej));
    const segs: [number, number] = lite ? [48, 32] : [64, 48];
    for (const id of BODIES) {
      const m = keep(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 }));
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

    // ---------- site leaders (dashed, low opacity) and the link of the opened / hovered site (dashed Line2) ----------
    const leadPos = new Float32Array(MAX_SITES * 6), leadGeo = keep(new THREE.BufferGeometry());
    leadGeo.setAttribute("position", new THREE.BufferAttribute(leadPos, 3));
    const leaders = new THREE.LineSegments(leadGeo, keep(new THREE.LineDashedMaterial({ color: 0xcfe2ff, transparent: true, opacity: 0.38, dashSize: 0.035, gapSize: 0.03 })));
    leaders.frustumCulled = false; scene.add(leaders);
    const mkLink = (w: number) => { const l = new Line2(keep(new LineGeometry()), keep(new LineMaterial({ color: 0xffffff, linewidth: w, transparent: true, opacity: 0, dashed: true, dashSize: 0.07, gapSize: 0.05, depthTest: true, depthWrite: false }))); l.visible = false; l.renderOrder = 5; scene.add(l); return l; };
    const linkSel = mkLink(2.4), linkHover = mkLink(1.6);

    // ---------- state ----------
    const started = performance.now();
    let tScene = 0, k = 0, back = false, last = performance.now(), raf = 0, onScreen = true, dirty = true, lastKey = "";
    let compBody: "moon" | "mars" | null = null, compAlpha = 0;
    const earthQ = new THREE.Quaternion(), tmpQ = new THREE.Quaternion(), yAxis = new THREE.Vector3(0, 1, 0), camPos = new THREE.Vector3();
    let drag: { x: number; y: number; pid: number } | null = null, userTurned = false, lastMission = "";

    const resize = () => {
      width = el.clientWidth; height = el.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      for (const l of [linkSel, linkHover]) l.material.resolution.set(width, height);
      dirty = true;
    };
    const setAlpha = (id: BodyId, a: number) => { mesh[id].visible = a > 0.01; mat[id].opacity = a; mat[id].transparent = a < 0.999; if (atmo[id]) atmo[id]!.visible = a > 0.6; };
    const world = (m: SceneMarker) => { const n = latLonToVec3(m.lat, m.lon).applyQuaternion(mesh[m.body].quaternion).normalize(); return { n, p: mesh[m.body].position.clone().addScaledVector(n, mesh[m.body].scale.x) }; };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { markers: ms, selectedId: sel, highlightId: hi, paused: isPaused, mode: md } = latest.current;
      const still = isPaused || reduce, focus = md.kind === "focus" ? md.body : null, aspect = width / height;
      let moving = false;

      // journey: 0 = overview, 1 = close-up of the Earth (via the target world on the way in)
      const goal = focus ? 1 : 0;
      if (k !== goal) {
        back = goal === 0;
        // a direct link opens straight in the close-up; the camera journey plays for choices made on the page
        k = reduce || now - started < 700 ? goal : goal === 1 ? Math.min(1, k + dt / JOURNEY_S) : Math.max(0, k - dt / BACK_S);
        moving = true;
      }
      // the planets keep their real proportions of speed in the overview and stand still in the close-up
      const flow = 1 - smooth(k * 2);
      if (!still && flow > 0) { tScene += dt * flow; moving = true; }
      const P = positions(tScene), E = P.earth;

      // which world is shown beside the Earth
      const want = focus && k > (back ? 0.7 : 0.62) ? focus : null;
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
      const over = overviewPose(aspect), pose = !focus && k === 0 ? over
        : back || !focus ? lerpPose(over, closePose(E, (focus ?? compBody ?? "mars") as "moon" | "mars", aspect), ease(k))
        : k <= 0.5 ? lerpPose(over, targetPose(P[focus], focus), ease(k / 0.5))
        : lerpPose(targetPose(P[focus], focus), closePose(E, focus, aspect), ease((k - 0.5) / 0.5));
      camera.position.copy(pose.pos); camera.lookAt(pose.look); camera.updateMatrixWorld(true); camPos.copy(pose.pos);

      // the Earth: slow spin, or turn the opened site to its facing direction
      const mKey = ms[0]?.id ?? ""; if (mKey !== lastMission) { lastMission = mKey; userTurned = false; }
      const nNew = latest.current.primaryCount ?? 99;
      const byId = new Map(ms.map((m) => [m.id, m])), selSite = sel ? byId.get(sel) : undefined, target = ms.find((m) => m.kind === "target");
      const open = selSite && selSite.body === "earth" && compBody ? selSite : null;
      if (open && compBody) {
        tmpQ.copy(orientToFace(latLonToVec3(open.lat, open.lon), siteFacing(E, compBody)));
        if (earthQ.angleTo(tmpQ) > 1e-3) { if (still) earthQ.copy(tmpQ); else earthQ.slerp(tmpQ, 1 - Math.exp(-dt * 3.2)); moving = true; }
      } else if (focus && k > 0.5 && !userTurned) {
        // close-up with no site open: show the mission's sites, turned towards the camera and the target world
        const cs = ms.filter((m) => m.body === "earth" && (m.rank ?? 99) <= nNew), c = cs.reduce((acc, m) => acc.add(latLonToVec3(m.lat, m.lon)), new THREE.Vector3());
        if (c.lengthSq() > 1e-6) { tmpQ.copy(orientToFace(c.normalize(), siteFacing(E, focus))); if (earthQ.angleTo(tmpQ) > 1e-3) { if (still) earthQ.copy(tmpQ); else earthQ.slerp(tmpQ, 1 - Math.exp(-dt * 2.4)); moving = true; } }
      } else if (!still && !drag && !focus) { earthQ.premultiply(tmpQ.setFromAxisAngle(yAxis, dt * 0.07)); moving = true; }
      mesh.earth.quaternion.copy(earthQ);
      // the companion keeps its marked point turned between the camera and the Earth (or the opened site)
      if (compBody && target && target.body === compBody) {
        const aim = open ? world(open).p : E, C = mesh[compBody].position;
        const face = camPos.clone().sub(C).normalize().multiplyScalar(0.45).addScaledVector(aim.clone().sub(C).normalize(), 0.55).normalize();
        mesh[compBody].quaternion.copy(orientToFace(latLonToVec3(target.lat, target.lon), face));
      }

      // links: only the opened site (bright, moving dashes) and the hovered one (dim)
      const near = k > 0.9 && compBody && compAlpha > 0.5 && target && target.body === compBody;
      const drawLink = (line: Line2, site: SceneMarker | undefined | null, base: number) => {
        line.visible = false;
        if (!near || !site || site.body !== "earth" || !target || !compBody) return;
        const S = world(site), M = world(target), a = linkAlpha(S.p, S.n, M.p, E, mesh[compBody].position, RADIUS[compBody], camPos, true);
        if (a <= 0) return;
        line.geometry.setPositions([S.p.x, S.p.y, S.p.z, M.p.x, M.p.y, M.p.z]); line.computeLineDistances();
        line.material.color.setHex(COLOR[compBody]); line.material.opacity = base * compAlpha; line.visible = true;
      };
      drawLink(linkSel, open, 0.95);
      drawLink(linkHover, !open && hi ? byId.get(hi) : null, 0.4);
      if (linkSel.visible && !still) { linkSel.material.dashOffset -= dt * 0.22; moving = true; }
      return moving || drag !== null;
    };

    const place = () => {
      const { markers: ms, selectedId: sel, highlightId: hi } = latest.current, v = new THREE.Vector3();
      const closeUp = k > 0.9, kept: { x0: number; x1: number; y0: number; y1: number }[] = [];
      let nLead = 0;
      const order = [...ms].sort((a, b) => Number(b.id === sel) - Number(a.id === sel) || Number(b.id === hi) - Number(a.id === hi) || (a.rank ?? 99) - (b.rank ?? 99));
      for (const m of order) {
        const b = buttons.current.get(m.id);
        if (!b) continue;
        const shown = m.kind === "target" ? !!compBody && m.body === compBody && compAlpha > 0.5 : closeUp;
        const w = shown ? world(m) : null;
        let vis = !!w && camPos.clone().sub(w.p).normalize().dot(w.n) > 0.12;
        if (vis && w) for (const o of BODIES) if (o !== m.body && mesh[o].visible && segmentHitsSphere(w.p, camPos, mesh[o].position, mesh[o].scale.x)) { vis = false; break; }
        b.style.visibility = vis ? "visible" : "hidden";
        if (!vis || !w) continue;
        v.copy(w.p).project(camera);
        const x = (v.x * 0.5 + 0.5) * width, y = (-v.y * 0.5 + 0.5) * height;
        b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        b.classList.toggle("edge-r", m.kind === "target" && x > width - 96); b.classList.toggle("edge-l", m.kind === "target" && x < 96);
        const lab = b.querySelector<HTMLElement>(".mk-l");
        if (m.kind !== "candidate" || !lab) continue;
        // leader: a short dashed line straight out from the site, with its name at the end (only if the name has room)
        const end = w.p.clone().addScaledVector(w.n, LEADER * EARTH_R);
        v.copy(end).project(camera);
        const ex = (v.x * 0.5 + 0.5) * width, ey = (-v.y * 0.5 + 0.5) * height, left = ex < x, tw = lab.offsetWidth || 120, th = 22;
        const r = { x0: left ? ex - tw - 4 : ex + 4, x1: left ? ex - 4 : ex + tw + 4, y0: ey - th / 2, y1: ey + th / 2 };
        const room = width >= 620 && nLead < MAX_SITES && r.x0 > 4 && r.x1 < width - 4 && r.y0 > 44 && r.y1 < height - 4 && !kept.some((q) => r.x0 < q.x1 + 6 && r.x1 > q.x0 - 6 && r.y0 < q.y1 + 3 && r.y1 > q.y0 - 3);
        lab.style.visibility = room ? "visible" : "hidden";
        if (!room) continue;
        kept.push(r);
        lab.style.transform = `translate(${(ex - x + (left ? -4 : 4)).toFixed(1)}px, ${(ey - y).toFixed(1)}px) translate(${left ? "-100%" : "0"}, -50%)`;
        leadPos.set([w.p.x, w.p.y, w.p.z, end.x, end.y, end.z], nLead * 6); nLead++;
      }
      leadGeo.setDrawRange(0, nLead * 2); leadGeo.attributes.position.needsUpdate = true; leaders.computeLineDistances(); leaders.visible = nLead > 0;
      // names of the bodies in the overview
      const fade = 1 - smooth(k / 0.35);
      for (const [id, , ] of NAMES) {
        const s = names.current.get(id);
        if (!s) continue;
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
      if (sig !== lastKey) { lastKey = sig; dirty = true; }
      const moving = step(now);
      if (moving || dirty) { place(); renderer.render(scene, camera); dirty = false; }
    };
    const ro = new ResizeObserver(resize); ro.observe(el);
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; dirty = true; }); io.observe(el);
    resize(); raf = requestAnimationFrame(frame);

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      for (const id of BODIES) mat[id].map?.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={host} className={`relative h-full w-full overflow-hidden ${className}`} style={{ touchAction: "pan-y" }} role="group" aria-roledescription="3D scene" aria-label="The Sun with the Earth and Mars on their orbits, and the Moon around the Earth. Choosing a mission moves to a close-up of the Earth with the target world beside it. Sizes are not to scale. The list has the same places as text.">
      {loading && <div role="status" aria-label="Loading" className="skel absolute inset-[30%] rounded-full" />}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {NAMES.map(([id, label]) => <span key={id} ref={(n) => { if (n) names.current.set(id, n); else names.current.delete(id); }} className="body-name absolute left-0 top-0" style={{ visibility: "hidden" }}>{label}</span>)}
      </div>
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <button
            key={m.id}
            ref={(n) => { if (n) buttons.current.set(m.id, n); else buttons.current.delete(m.id); }}
            type="button"
            className={`mk ${m.kind === "target" ? "target" : "cand lead"} ${m.id === selectedId || m.id === highlightId ? "sel" : ""} pointer-events-auto`}
            style={{ left: 0, top: 0, visibility: "hidden", ["--c" as string]: `#${COLOR[m.body].toString(16).padStart(6, "0")}` }}
            aria-label={`${m.label}${m.rank ? `, number ${m.rank}` : ""}`}
            aria-pressed={m.id === selectedId}
            onClick={() => onSelect?.(m.id)}
          >
            <i />
            <span className="mk-l">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
