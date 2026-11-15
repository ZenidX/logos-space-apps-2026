import { asset } from "@/lib/logos/asset";
// AI-assisted (Claude), reviewed by team Logos
export type GlobeBody = "earth" | "moon" | "mars";

// Equirectangular textures (credits and licences: README.md and docs/sources.md).
export const GLOBE_TEX: Record<GlobeBody, { lo: string; hi: string; credit: string; atmosphere: number | null }> = {
  earth: { lo: asset("/tex/earth-1024.jpg"), hi: asset("/tex/earth-2048.jpg"), credit: "NASA GIBS · Blue Marble", atmosphere: 0x5aaaff },
  moon: { lo: asset("/tex/moon-1024.jpg"), hi: asset("/tex/moon-2048.jpg"), credit: "LROC WAC · NASA's Scientific Visualization Studio", atmosphere: null },
  mars: { lo: asset("/tex/mars-1024.jpg"), hi: asset("/tex/mars-2048.jpg"), credit: "Viking MDIM 2.1 · NASA/USGS", atmosphere: 0xe68c5a },
};

// Extra layers of the Earth, as [phones, desktop]. Built by scripts/tex/make-textures.sh from NASA sources:
// city lights = NASA Black Marble 2016 (Earth Observatory); clouds = NASA Blue Marble cloud layer (Visible Earth);
// water mask = the uniform ocean colour of the same Black Marble image.
export const EARTH_EXTRA = {
  night: [asset("/tex/earth-night-1024.jpg"), asset("/tex/earth-night-2048.jpg")],
  clouds: [asset("/tex/earth-clouds-1024.jpg"), asset("/tex/earth-clouds-2048.jpg")],
  ocean: [asset("/tex/earth-ocean-1024.jpg"), asset("/tex/earth-ocean-1024.jpg")],
} as const;
// Relief of the Moon (LOLA, NASA SVS CGI Moon Kit ldem_4) and Mars (MOLA MEGDR, NASA PDS) as tangent-space normal maps.
export const NORMAL_TEX: Record<"moon" | "mars", string> = { moon: asset("/tex/moon-normal-1024.jpg"), mars: asset("/tex/mars-normal-1024.jpg") };
