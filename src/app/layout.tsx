// AI-assisted (Claude), reviewed by team Logos
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Logos · Mission Analogs",
  description: "Where on Earth can we rehearse a specific Moon or Mars mission? NASA Space Apps Challenge 2026, team Logos.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#04060c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plex.variable} ${jetbrains.variable} ${grotesk.variable}`}>{children}</body>
    </html>
  );
}
