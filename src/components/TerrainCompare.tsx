"use client";
// AI-assisted (Claude), reviewed by team Logos
// Two 11 × 11 km terrains side by side (Earth site vs Moon/Mars target), same horizontal and vertical scale,
// lit by a Sun whose elevation the user sets. Heightmaps are precomputed (scripts/data/06_terrain.py).
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import index from "@/data/terrain-index.json";

interface Item { name: string; body: "earth" | "moon" | "mars"; lat: number; lon: number; file: string; minM: number; maxM: number; stats: { slopeMeanDeg: number; slopeP90Deg: number; roughnessStdM: number; reliefM: number } }
const IDX = index as unknown as { grid: { n: number; sizeM: number; stepM: number }; items: Record<string, Item> };
export const terrainOf = (id: string): Item | null => IDX.items[id] ?? null;

const N = IDX.grid.n, SIZE_M = IDX.grid.sizeM, EXAG = 2;
const TINT: Record<Item["body"], number> = { earth: 0xb9c7d6, moon: 0xcfd3da, mars: 0xd9a184 };

async function loadHeights(file: string): Promise<Float32Array> {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`terrain ${res.status}`);
  const h = new Float32Array(await res.arrayBuffer());
  if (h.length !== N * N) throw new Error("terrain size");
  return h;
}

function buildMesh(h: Float32Array, body: Item["body"]): THREE.Mesh {
  const g = new THREE.PlaneGeometry(1, 1, N - 1, N - 1);
  g.rotateX(-Math.PI / 2); // x east, z south, y up; row 0 = north
  let mean = 0;
  for (let i = 0; i < h.length; i++) mean += h[i];
  mean /= h.length;
  const pos = g.attributes.position;
  for (let i = 0; i < h.length; i++) pos.setY(i, ((h[i] - mean) / SIZE_M) * EXAG);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: TINT[body], roughness: 1, metalness: 0 }));
}

export default function TerrainCompare({ siteId, targetId, targetSunDeg, compact = false }: { siteId: string; targetId: string; targetSunDeg: number | null; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const sunRef = useRef(targetSunDeg ?? 30);
  const api = useRef<{ setSun: (deg: number) => void } | null>(null);
  const [sun, setSun] = useState(Math.round(targetSunDeg ?? 30));
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const site = terrainOf(siteId), target = terrainOf(targetId);

  useEffect(() => { sunRef.current = sun; api.current?.setSun(sun); }, [sun]);

  useEffect(() => {
    const el = host.current;
    if (!el || !site || !target) { setState("error"); return; }
    let cancelled = false, cleanup = () => {};
    setState("loading");
    Promise.all([loadHeights(site.file), loadHeights(target.file)]).then(([hs, ht]) => {
      if (cancelled) return;
      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: new URLSearchParams(window.location.search).has("capture") }); }
      catch { setState("error"); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y";
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.prepend(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 2, 0.1, 20);
      scene.add(new THREE.AmbientLight(0xffffff, 0.22));
      const light = new THREE.DirectionalLight(0xfff4e0, 2.6);
      scene.add(light);
      const a = buildMesh(hs, site.body), b = buildMesh(ht, target.body);
      scene.add(a, b);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let yaw = -0.6, dirty = true, raf = 0, drag: { x: number; id: number } | null = null, auto = !reduce, visible = true;
      const place = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        const wide = w / h > 1.25, gap = 0.7;
        a.position.set(wide ? -gap : 0, 0, wide ? 0 : -gap); b.position.set(wide ? gap : 0, 0, wide ? 0 : gap);
        renderer.setSize(w, h, false); camera.aspect = w / h;
        const d = wide ? 2.5 / Math.min(1, camera.aspect / 2.0) : 3.3;
        camera.position.set(0, d * 0.62, d * 0.9); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); dirty = true;
      };
      const setSunDeg = (deg: number) => {
        const e = (Math.max(0.5, deg) * Math.PI) / 180, az = -2.2; // light from the north-west of the scene
        light.position.set(Math.cos(e) * Math.sin(az), Math.sin(e), Math.cos(e) * Math.cos(az)).multiplyScalar(5); dirty = true;
      };
      api.current = { setSun: setSunDeg };
      setSunDeg(sunRef.current);
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        if (auto && !drag) { yaw += 0.0018; dirty = true; }
        if (!dirty) return;
        a.rotation.y = yaw; b.rotation.y = yaw;
        renderer.render(scene, camera); dirty = false;
      };
      const down = (e: PointerEvent) => { drag = { x: e.clientX, id: e.pointerId }; auto = false; el.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => { if (!drag || e.pointerId !== drag.id) return; yaw += (e.clientX - drag.x) * 0.008; drag.x = e.clientX; dirty = true; };
      const up = () => { drag = null; };
      el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
      const ro = new ResizeObserver(place); ro.observe(el);
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; dirty = true; }); io.observe(el);
      place(); raf = requestAnimationFrame(frame); setState("ready");
      cleanup = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); api.current = null;
        el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
        for (const m of [a, b]) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); }
        renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };
      if (cancelled) cleanup();
    }).catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; cleanup(); };
  }, [siteId, targetId, site, target]);

  if (!site || !target) return <p className="text-[13px] text-[var(--dim)]">No terrain data for this site.</p>;
  return (
    <div>
      <div ref={host} className={`relative w-full cursor-grab overflow-hidden rounded-2xl bg-[rgba(4,6,12,.28)] active:cursor-grabbing ${compact ? "h-[150px] md:h-[clamp(130px,calc(100dvh-700px),240px)]" : "h-[280px] md:h-[360px]"}`} role="img" aria-label={`3D terrain, 11 by 11 kilometres: ${site.name} next to ${target.name}. The table below has the same comparison as numbers.`}>
        {state === "loading" && <div className="skel absolute inset-4 rounded-lg" role="status" aria-label="Loading terrain" />}
        {state === "error" && <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] text-[var(--dim)]">3D terrain could not be shown here. The numbers below are the same comparison.</p>}
        <span className="label pointer-events-none absolute left-3 top-3" style={{ color: "var(--earth)" }}>Earth · this site</span>
        <span className="label pointer-events-none absolute right-3 top-3" style={{ color: target.body === "moon" ? "var(--moon)" : "var(--mars)" }}>{target.body === "moon" ? "Moon" : "Mars"} · target</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[var(--dim)]">11 × 11 km each · same scale · heights ×{EXAG} on both · tinted by world, not the real ground colour · drag to rotate</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--mut)]">
        <label htmlFor="sun" className="label">Sun height</label>
        <input id="sun" type="range" min={1} max={70} step={1} value={sun} onChange={(e) => setSun(Number(e.target.value))} className="h-6 flex-1 accent-[var(--amber)]" aria-valuetext={`${sun} degrees above the horizon`} />
        <span className="mono w-9 text-right">{sun}°</span>
        {targetSunDeg !== null && <button className="chip" onClick={() => setSun(Math.round(targetSunDeg))}>Target Sun {targetSunDeg.toFixed(0)}°</button>}
      </div>
      {!compact && <TerrainStats siteId={siteId} targetId={targetId} />}
    </div>
  );
}

export function TerrainStats({ siteId, targetId }: { siteId: string; targetId: string }) {
  const site = terrainOf(siteId), target = terrainOf(targetId);
  if (!site || !target) return <p className="text-[13px] text-[var(--dim)]">No terrain data for this site.</p>;
  const rows: [string, (i: Item) => string][] = [
    ["Relief", (i) => `${Math.round(i.stats.reliefM)} m`],
    ["Mean slope", (i) => `${i.stats.slopeMeanDeg.toFixed(i.stats.slopeMeanDeg < 1 ? 2 : 1)}°`],
    ["Steepest 10 %", (i) => `> ${i.stats.slopeP90Deg.toFixed(i.stats.slopeP90Deg < 1 ? 2 : 1)}°`],
    ["Roughness", (i) => `${Math.round(i.stats.roughnessStdM)} m`],
  ];
  return (
    <div>
      <table className="mono mt-3 w-full text-[12.5px]">
        <thead><tr className="text-left text-[var(--dim)]"><th className="py-1 font-normal">11 × 11 km, 115 m grid</th><th className="font-normal">This site</th><th className="font-normal">Target</th></tr></thead>
        <tbody>{rows.map(([k, f]) => <tr key={k} className="border-t border-[var(--line)]"><td className="py-1 text-[var(--mut)]">{k}</td><td>{f(site)}</td><td>{f(target)}</td></tr>)}</tbody>
      </table>
      {target.body === "mars" && <p className="mt-1 text-[11.5px] text-[var(--dim)]">The Mars elevation model is 200 m per pixel, coarser than Earth&apos;s 30 m, so Mars looks smoother than it is.</p>}
      <p className="mt-1 text-[11.5px] text-[var(--dim)]">Terrain was not used in the analog index; it is shown to compare shape. Sea and lake cells read as 0 m and are included in these figures.</p>
    </div>
  );
}
