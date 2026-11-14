"use client";

// Globo 3D girable (Tierra, Luna o Marte) con marcadores como BOTONES reales sobre el canvas.
// Propuesta de Diseño: copiar a src/components/Globe.tsx y src/lib/globe-math.ts (ajustar el import).
// Tipos comprobados con el tsc del repo; el aspecto y el rendimiento NO se han probado en pantalla.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { declutter, easeInOutCubic, flyPosition, isFacing, latLonToVec3, viewLat } from "@/lib/globe-math";

import { GLOBE_TEX, type GlobeBody } from "@/lib/globe-tex";
export type { GlobeBody };
export interface GlobeMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  kind: "candidate" | "known" | "target";
  rank?: number;
}
interface Props {
  body: GlobeBody;
  markers: GlobeMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onError?: (e: unknown) => void; // sin WebGL o fallo de carga → el padre muestra el mapa 2D (TileMap)
  className?: string;
}


const ATMO_VERT = "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const ATMO_FRAG = "uniform vec3 c; varying vec3 n; void main(){ float i = pow(0.7 - dot(n, vec3(0.0, 0.0, 1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * clamp(i, 0.0, 1.0); }";

export default function Globe({ body, markers, selectedId = null, onSelect, onError, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const markersRef = useRef(markers);
  const selectedRef = useRef(selectedId);
  const api = useRef<{ flyTo: (lat: number, lon: number) => void; invalidate: () => void } | null>(null);
  const onErrorRef = useRef(onError); // ref: un onError en línea no debe reiniciar la escena
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onErrorRef.current = onError;
    markersRef.current = markers;
    selectedRef.current = selectedId;
    api.current?.invalidate();
  }, [markers, selectedId, onError]);

  // Escena: se monta una vez por cuerpo
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      onErrorRef.current?.(e);
      return;
    }
    const def = GLOBE_TEX[body];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.set(0, 0, 3.8); // radio 1 → ocupa ~86 % del alto
    scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); // luz fija respecto a la cámara: siempre se ve la cara iluminada
    sun.position.set(-2, 1.4, 3);
    camera.add(sun);

    const material = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
    const geometry = new THREE.SphereGeometry(1, 64, 48);
    scene.add(new THREE.Mesh(geometry, material));
    let atmo: THREE.Mesh | null = null;
    if (def.atmosphere !== null) {
      atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.07, 48, 32),
        new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
          uniforms: { c: { value: new THREE.Color(def.atmosphere) } }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
        }),
      );
      scene.add(atmo);
    }

    // Texturas: 1024 px primero (≈80-100 KB) y 2048 px después, salvo con «ahorro de datos»
    let disposed = false;
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const load = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) =>
        loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; resolve(t); }, undefined, reject),
      );
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    let dirty = true;
    load(def.lo)
      .then((t) => {
        if (disposed) { t.dispose(); return; }
        material.map = t; material.needsUpdate = true; dirty = true; setLoading(false);
        if (saveData) return;
        // Si falla la textura grande, se queda la pequeña: el globo sigue funcionando.
        load(def.hi)
          .then((t2) => {
            if (disposed) { t2.dispose(); return; }
            material.map?.dispose(); material.map = t2; material.needsUpdate = true; dirty = true;
          })
          .catch((e) => console.warn("Globe: high-res texture failed, keeping low-res", e));
      })
      .catch((e) => { if (!disposed) onErrorRef.current?.(e); });

    // Controles: arrastrar gira, pellizcar acerca; sin giro automático con movimiento reducido
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 1.8; controls.maxDistance = 5; controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.7;
    controls.autoRotate = !reduce.matches; controls.autoRotateSpeed = 0.5;
    let idle = 0;
    controls.addEventListener("start", () => { controls.autoRotate = false; window.clearTimeout(idle); });
    controls.addEventListener("end", () => { if (!reduce.matches) idle = window.setTimeout(() => (controls.autoRotate = true), 6000); });
    controls.addEventListener("change", () => (dirty = true));
    const onReduce = () => { controls.autoRotate = !reduce.matches; window.clearTimeout(idle); };
    reduce.addEventListener("change", onReduce);

    // Vuelo a un punto (900 ms, o salto directo con movimiento reducido)
    let fly: { t0: number; from: THREE.Vector3; to: THREE.Vector3 } | null = null;
    api.current = {
      invalidate: () => (dirty = true),
      flyTo: (lat, lon) => {
        const to = latLonToVec3(viewLat(lat), lon, camera.position.length());
        controls.autoRotate = false;
        if (reduce.matches) { camera.position.copy(to); controls.update(); dirty = true; return; }
        fly = { t0: performance.now(), from: camera.position.clone(), to };
      },
    };

    // Marcadores: se proyectan a píxeles; los de la cara oculta y los que se pisan se esconden
    const tmp = new THREE.Vector3();
    const place = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const pts: { id: string; x: number; y: number; rank?: number }[] = [];
      for (const m of markersRef.current) {
        latLonToVec3(m.lat, m.lon, 1, tmp);
        if (!isFacing(tmp, camera.position)) continue;
        tmp.project(camera);
        pts.push({ id: m.id, x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, rank: m.rank });
      }
      const show = declutter(pts, selectedRef.current);
      const where = new Map(pts.map((p) => [p.id, p]));
      for (const [id, btn] of buttons.current) {
        const p = where.get(id);
        if (p && show.has(id)) { btn.style.visibility = "visible"; btn.classList.toggle("flip", p.x > w * 0.62); btn.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`; }
        else btn.style.visibility = "hidden";
      }
    };

    // Bucle: solo dibuja si algo cambió o gira solo; en pausa si la pestaña o el globo no se ven
    let raf = 0, onScreen = true;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !onScreen) return;
      if (fly) {
        const k = Math.min(1, (now - fly.t0) / 900);
        camera.position.copy(flyPosition(fly.from, fly.to, easeInOutCubic(k)));
        if (k >= 1) fly = null;
        dirty = true;
      }
      const moved = controls.update();
      if (moved || dirty || controls.autoRotate) { renderer.render(scene, camera); place(); dirty = false; }
    };
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = (2 * Math.atan(Math.tan((35 * Math.PI) / 360) / Math.min(1, camera.aspect)) * 180) / Math.PI; camera.updateProjectionMatrix(); dirty = true;
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; dirty = true; });
    io.observe(el);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf); window.clearTimeout(idle); ro.disconnect(); io.disconnect(); controls.dispose();
      material.map?.dispose(); material.dispose(); geometry.dispose();
      if (atmo) { atmo.geometry.dispose(); (atmo.material as THREE.Material).dispose(); }
      reduce.removeEventListener("change", onReduce);
      renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
      api.current = null;
    };
  }, [body]);

  // Elegir un marcador (o una fila de la lista) gira el globo hasta él
  useEffect(() => {
    const m = markersRef.current.find((x) => x.id === selectedId);
    if (m) api.current?.flyTo(m.lat, m.lon);
  }, [selectedId]);

  return (
    <div
      ref={host}
      className={`relative h-full w-full overflow-hidden ${className}`}
      role="group"
      aria-roledescription="3D globe"
      aria-label={`${body} globe. Drag to rotate, pinch to zoom.${markers.some((m) => m.kind === "candidate") ? " The list below has the same places as text." : ""}`}
    >
      {loading && <div role="status" aria-label="Loading globe" className="skel absolute inset-[7%] rounded-full" />}
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <button
            key={m.id}
            ref={(n) => { if (n) buttons.current.set(m.id, n); else buttons.current.delete(m.id); }}
            type="button"
            className={`mk ${m.kind === "candidate" ? "" : m.kind} ${m.id === selectedId ? "sel" : ""} pointer-events-auto`}
            style={{ left: 0, top: 0, visibility: "hidden" }}
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
