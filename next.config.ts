import type { NextConfig } from "next";

// Exportación estática para GitHub Pages (https://zenidx.github.io/logos-space-apps-2026/).
// En desarrollo (npm run dev) no hay basePath; en el build de Pages se usa NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // El build de Pages usa su propia carpeta para no pisar la de `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
