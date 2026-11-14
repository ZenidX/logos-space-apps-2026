export type GlobeBody = "earth" | "moon" | "mars";

// IMPORTANTE: el sitio se publica bajo basePath (/logos-space-apps-2026): sin este prefijo las texturas dan 404 en Pages.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const GLOBE_TEX: Record<GlobeBody, { lo: string; hi: string; credit: string; atmosphere: number | null }> = {
  earth: { lo: `${BASE}/tex/earth-1024.jpg`, hi: `${BASE}/tex/earth-2048.jpg`, credit: "NASA GIBS · Blue Marble", atmosphere: 0x5aaaff },
  moon: { lo: `${BASE}/tex/moon-1024.jpg`, hi: `${BASE}/tex/moon-2048.jpg`, credit: "LROC WAC · NASA SVS", atmosphere: null },
  mars: { lo: `${BASE}/tex/mars-1024.jpg`, hi: `${BASE}/tex/mars-2048.jpg`, credit: "Viking MDIM 2.1 · NASA/USGS", atmosphere: 0xe68c5a },
};
