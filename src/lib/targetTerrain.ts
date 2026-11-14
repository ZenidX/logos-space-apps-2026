import { loadJezeroCTX, loadMarsBlend, loadMoonSouthPole, type TerrainData } from "@/lib/terrain";

// Terreno 3D de cada objetivo: el mismo tamaño que la celda terrestre (~11 km).
// sunPresetDeg: altura típica del Sol en el objetivo (polo sur lunar ≈ 1,5°).
// Las funciones son estables (nivel de módulo) para que el visor no recargue en cada render.
const shackleton = () => loadMoonSouthPole(-89.67, 129.78); // centro del cráter Shackleton: borde, laderas y suelo
const jezero = () => loadJezeroCTX(18.45, 77.45); // delta occidental de Jezero
const arcadia = () => loadMarsBlend(40, -160);

export const TARGET_TERRAIN: Record<string, { load: (() => Promise<TerrainData>) | null; sunPresetDeg: number }> = {
  shackleton: { load: shackleton, sunPresetDeg: 1.5 },
  jezero: { load: jezero, sunPresetDeg: 60 },
  arcadia: { load: arcadia, sunPresetDeg: 45 },
};
