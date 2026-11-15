// AI-assisted (Claude), reviewed by team Logos
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Martian_Mono } from "next/font/google";
import "./globals.css";

// Both SIL OFL 1.1; next/font self-hosts them (CSP font-src 'self').
const sans = Bricolage_Grotesque({ subsets: ["latin"], weight: "variable", axes: ["opsz"], variable: "--f-sans", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], weight: "400", variable: "--f-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Logos · Mission Analogs",
  description: "Where on Earth can we rehearse a specific Moon or Mars mission? NASA Space Apps Challenge 2026, team Logos.",
  metadataBase: new URL("https://spaceapp-logos.vercel.app"),
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  twitter: { card: "summary_large_image" },
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Logos: rehearse the Moon and Mars on Earth" }],
    title: "Logos · Mission Analogs",
    description: "Rehearse the Moon and Mars on Earth: mission-based Earth analogs, where the comparison breaks, and access complexity.",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#04060c", viewportFit: "cover" }; // cover: the page draws under the notch; header and bottom bar keep the safe areas

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
