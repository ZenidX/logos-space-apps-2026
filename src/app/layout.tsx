// AI-assisted (Claude), reviewed by team Logos
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

// All SIL OFL 1.1; next/font self-hosts them (CSP font-src 'self').
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], weight: "variable", variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Logos · Mission Analogs",
  description: "Where on Earth can we rehearse a specific Moon or Mars mission? NASA Space Apps Challenge 2026, team Logos.",
  openGraph: {
    title: "Logos · Mission Analogs",
    description: "Rehearse the Moon and Mars on Earth: mission-based Earth analogs, where the comparison breaks, and access complexity.",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#04060c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
