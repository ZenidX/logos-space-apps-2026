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
  // "relief": material neutro igual para los dos terrenos (comparar formas); "imagery": foto de satélite si la hay.
  look?: "relief" | "imagery";
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

export default function Terrain3D({ load, title, subtitle, sunElevationDeg, exaggeration, look = "relief", className = "" }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const sunRef = useRef<THREE.DirectionalLight | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const dataRef = useRef<TerrainData | null>(null);
  const exRef = useRef(exaggeration);
  exRef.current = exaggeration;
  const lookRef = useRef(look);
  lookRef.current = look;
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
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      // Sin WebGL: aviso visible en vez de un cuadro negro.
      queueMicrotask(() => {
        setErr("WebGL is not available in this browser or device. Try another browser or enable hardware acceleration.");
        setState("error");
      });
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x04080f);
    // Sombras proyectadas: con el Sol bajo (polo sur lunar, 1,5°) el relieve se lee por sus sombras largas.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    scene.add(new THREE.AmbientLight(0x6f88a8, 0.18));
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -0.9;
    sc.right = sc.top = 0.9;
    sc.near = 0.1;
    sc.far = 12;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.003;
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
        for (let i = 0; i < n * n; i++) pos.setY(i, geo.userData.base[i] * exRef.current);
        geo.computeVertexNormals();
        const canvas = d.texture; // la foto, si se pide, la pone el efecto de «look»
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
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

  // Cambiar entre relieve neutro y foto de satélite sin recargar el relieve.
  // La foto se descarga la primera vez que se pide y se guarda.
  const imageryRef = useRef<HTMLCanvasElement | null | undefined>(undefined);
  const [photoState, setPhotoState] = useState<"" | "cargando" | "sin foto">("");
  useEffect(() => {
    let cancel = false;
    const apply = (canvas: HTMLCanvasElement) => {
      const mesh = meshRef.current;
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.map?.image === canvas) return;
      mat.map?.dispose();
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      mat.map = tex;
      mat.needsUpdate = true;
    };
    const d = dataRef.current;
    if (!d || state !== "ok") return;
    if (look !== "imagery" || !d.loadImagery) {
      apply(d.texture);
      setPhotoState("");
      return;
    }
    if (imageryRef.current !== undefined) {
      if (imageryRef.current) apply(imageryRef.current);
      setPhotoState(imageryRef.current ? "" : "sin foto");
      return;
    }
    setPhotoState("cargando");
    d.loadImagery().then((c) => {
      imageryRef.current = c;
      if (cancel) return;
      if (c) apply(c);
      setPhotoState(c ? "" : "sin foto");
    });
    return () => {
      cancel = true;
    };
  }, [look, state]);

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
              <span className="k">Relief</span> {Math.round(stats.reliefM)} m
              <br />
              <span className="k">Mean slope</span> {stats.meanSlopeDeg.toFixed(1)}°
              <br />
              <span className="k">Max slope</span> {stats.maxSlopeDeg.toFixed(0)}°
            </>
          )
        }
        bl={
          state === "cargando" ? (
            <span className="vivo">Loading elevation…</span>
          ) : state === "error" ? (
            <span style={{ color: "var(--warn)" }}>Error: {err}</span>
          ) : (
            <span className="k">
              Mesh ≈ {res ? Math.round(res) : "?"} m/px · ×{exaggeration} vertical
              {photoState === "cargando" && " · loading imagery…"}
              {photoState === "sin foto" && " · no imagery here"}
            </span>
          )
        }
      >
        <div
          ref={mount}
          role="img"
          aria-label={`3D terrain, ${subtitle}: ${title}.${
            stats
              ? ` Relief ${Math.round(stats.reliefM)} m, mean slope ${stats.meanSlopeDeg.toFixed(1)}°, max slope ${stats.maxSlopeDeg.toFixed(0)}°.`
              : ""
          }`}
          className="h-full w-full"
        />
        {state === "error" && (
          <div role="alert" className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm" style={{ color: "var(--warn)" }}>
            {err}
          </div>
        )}
      </Visor>
      {src && <p className="font-mono text-[9px] leading-tight text-[var(--dim)]">{src}</p>}
    </div>
  );
}
