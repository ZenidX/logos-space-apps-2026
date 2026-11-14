"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TerrainData } from "@/lib/terrain";
import Visor from "@/components/Visor";

interface Props {
  load: () => Promise<TerrainData>;
  title: string;
  subtitle?: string;
  sunElevationDeg: number; // altura del Sol (°): 1,5° ≈ polo sur lunar
  exaggeration: number;
  className?: string;
}

export interface TerrainStats {
  reliefM: number;
  meanSlopeDeg: number;
  maxSlopeDeg: number;
}

function slopeStats(d: TerrainData): TerrainStats {
  const { heights, n, widthM, heightM } = d;
  const dx = widthM / (n - 1);
  const dy = heightM / (n - 1);
  let sum = 0;
  let max = 0;
  let c = 0;
  for (let r = 1; r < n - 1; r++) {
    for (let col = 1; col < n - 1; col++) {
      const gx = (heights[r * n + col + 1] - heights[r * n + col - 1]) / (2 * dx);
      const gy = (heights[(r + 1) * n + col] - heights[(r - 1) * n + col]) / (2 * dy);
      const s = (Math.atan(Math.hypot(gx, gy)) * 180) / Math.PI;
      sum += s;
      if (s > max) max = s;
      c++;
    }
  }
  return { reliefM: d.maxH - d.minH, meanSlopeDeg: sum / c, maxSlopeDeg: max };
}

export default function Terrain3D({ load, title, subtitle, sunElevationDeg, exaggeration, className = "" }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const sunRef = useRef<THREE.DirectionalLight | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const dataRef = useRef<TerrainData | null>(null);
  const [state, setState] = useState<"cargando" | "ok" | "error">("cargando");
  const [err, setErr] = useState("");
  const [stats, setStats] = useState<TerrainStats | null>(null);
  const [res, setRes] = useState<number | null>(null);
  const [src, setSrc] = useState("");

  // Escena: se monta una vez por terreno
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x04080f);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x04080f, 2.2, 5);
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.01, 50);
    camera.position.set(0, 1.0, 1.25);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 0.3;
    controls.maxDistance = 3;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.addEventListener("start", () => (controls.autoRotate = false));

    scene.add(new THREE.AmbientLight(0x6f88a8, 0.25));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    scene.add(sun);
    sunRef.current = sun;

    // Rejilla de referencia bajo el terreno
    const grid = new THREE.GridHelper(2, 20, 0x5ee6ff, 0x1b3550);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    grid.position.y = -0.002;
    scene.add(grid);

    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    setState("cargando");
    load()
      .then((d) => {
        if (disposed) return;
        dataRef.current = d;
        const { n, heights, widthM, heightM } = d;
        // Escala: el lado mayor mide 1 unidad; la altura usa la misma escala (×exageración)
        const s = 1 / Math.max(widthM, heightM);
        const geo = new THREE.PlaneGeometry(widthM * s, heightM * s, n - 1, n - 1);
        geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position as THREE.BufferAttribute;
        geo.userData.base = new Float32Array(n * n);
        for (let i = 0; i < n * n; i++) geo.userData.base[i] = (heights[i] - d.minH) * s;
        for (let i = 0; i < n * n; i++) pos.setY(i, geo.userData.base[i] * exaggeration);
        geo.computeVertexNormals();
        const tex = new THREE.CanvasTexture(d.texture);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        meshRef.current = mesh;
        // Contorno cian de la celda
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(widthM * s, 0.0001, heightM * s)),
          new THREE.LineBasicMaterial({ color: 0x5ee6ff, transparent: true, opacity: 0.6 }),
        );
        scene.add(edges);
        setStats(slopeStats(d));
        setRes(d.resolutionM);
        setSrc(d.source);
        setState("ok");
      })
      .catch((e: Error) => {
        if (!disposed) {
          setErr(e.message);
          setState("error");
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      meshRef.current = null;
    };
  }, [load]);

  // Sol: azimut fijo (sureste), elevación variable
  useEffect(() => {
    const sun = sunRef.current;
    if (!sun) return;
    const el = (sunElevationDeg * Math.PI) / 180;
    const az = (135 * Math.PI) / 180;
    sun.position.set(Math.cos(el) * Math.sin(az) * 5, Math.sin(el) * 5, Math.cos(el) * Math.cos(az) * 5);
  }, [sunElevationDeg, state]);

  // Exageración vertical sin recargar
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const geo = mesh.geometry as THREE.PlaneGeometry;
    const base = geo.userData.base as Float32Array;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < base.length; i++) pos.setY(i, base[i] * exaggeration);
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [exaggeration, state]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Visor
        className="min-h-0 flex-1"
        reticle={false}
        tl={
          <>
            <span className="k">{subtitle}</span>
            <br />
            {title}
          </>
        }
        tr={
          stats && (
            <>
              <span className="k">Relieve</span> {Math.round(stats.reliefM)} m
              <br />
              <span className="k">Pend. media</span> {stats.meanSlopeDeg.toFixed(1)}°
              <br />
              <span className="k">Pend. máx</span> {stats.maxSlopeDeg.toFixed(0)}°
            </>
          )
        }
        bl={
          state === "cargando" ? (
            <span className="vivo">Cargando elevación…</span>
          ) : state === "error" ? (
            <span style={{ color: "var(--warn)" }}>Error: {err}</span>
          ) : (
            <span className="k">Malla ≈ {res ? Math.round(res) : "?"} m/px · ×{exaggeration} vertical</span>
          )
        }
      >
        <div ref={mount} className="h-full w-full" />
      </Visor>
      {src && <p className="font-mono text-[9px] leading-tight text-[var(--dim)]">{src}</p>}
    </div>
  );
}
