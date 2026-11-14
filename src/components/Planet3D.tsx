"use client";

// Planeta 3D real (three.js) para la portada: esfera con textura NASA, luz lateral (día/noche),
// atmósfera opcional y giro lento. Solo dibuja cuando está en pantalla. No captura la rueda ni el tacto.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLOBE_TEX, type GlobeBody } from "@/lib/globe-tex";

const ATMO_VERT = "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const ATMO_FRAG = "uniform vec3 c; varying vec3 n; void main(){ float i = pow(0.72 - dot(n, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * clamp(i, 0.0, 1.0); }";

interface Props {
  body: GlobeBody;
  size: number | string; // px o CSS (p.ej. "min(30vw,240px)")
  active?: boolean; // gira más rápido y muestra un anillo
  speed?: number;
  tilt?: number; // inclinación del eje (rad)
  className?: string;
}

export default function Planet3D({ body, size, active = false, speed = 1, tilt = 0.35, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      el.style.backgroundImage = `url(${GLOBE_TEX[body].lo})`; // sin WebGL: imagen plana
      el.classList.add("orb");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
    el.appendChild(renderer.domElement);

    let dirty = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 4.2);

    const tex = new THREE.TextureLoader().load(GLOBE_TEX[body].lo, () => (dirty = true));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 }),
    );
    const pivot = new THREE.Group();
    pivot.rotation.z = tilt;
    pivot.add(planet);
    scene.add(pivot);

    const atmo = GLOBE_TEX[body].atmosphere;
    if (atmo != null) {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.08, 64, 48),
        new THREE.ShaderMaterial({
          vertexShader: ATMO_VERT,
          fragmentShader: ATMO_FRAG,
          uniforms: { c: { value: new THREE.Color(atmo) } },
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        }),
      );
      scene.add(glow);
    }
    // Luz lateral: terminador día/noche como en las fotos de las misiones
    const sun = new THREE.DirectionalLight(0xffffff, 3.2);
    sun.position.set(-3, 1.2, 2.2);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x8fb4ff, 0.18));

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      if (!reduce.matches) {
        planet.rotation.y += dt * 0.12 * speed * (activeRef.current ? 2.4 : 1);
        dirty = true;
      }
      if (dirty) {
        renderer.render(scene, camera);
        dirty = false;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      tex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      el.innerHTML = "";
    };
  }, [body, speed, tilt]);

  return (
    <span
      ref={host}
      aria-hidden
      className={`planet3d relative inline-block rounded-full ${active ? "on" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
