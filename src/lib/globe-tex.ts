// AI-assisted (Claude), reviewed by team Logos
export type GlobeBody = "earth" | "moon" | "mars";

// Equirectangular textures (credits and licences: docs/licencias-texturas.md).
export const GLOBE_TEX: Record<GlobeBody, { lo: string; hi: string; credit: string; atmosphere: number | null }> = {
  earth: { lo: "/tex/earth-1024.jpg", hi: "/tex/earth-2048.jpg", credit: "NASA GIBS · Blue Marble", atmosphere: 0x5aaaff },
  moon: { lo: "/tex/moon-1024.jpg", hi: "/tex/moon-2048.jpg", credit: "LROC WAC · NASA's Scientific Visualization Studio", atmosphere: null },
  mars: { lo: "/tex/mars-1024.jpg", hi: "/tex/mars-2048.jpg", credit: "Viking MDIM 2.1 · NASA/USGS", atmosphere: 0xe68c5a },
};
