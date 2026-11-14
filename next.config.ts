// AI-assisted (Claude), reviewed by team Logos
import type { NextConfig } from "next";

// Static export: deployable on Vercel (or any static host) with no server and no database.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
