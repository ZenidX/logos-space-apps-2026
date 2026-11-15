import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Martian_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import { AppStateProvider } from "@/components/AppState";

// Mismas fuentes que la portada (Logos): Bricolage Grotesque (texto y títulos) y Martian Mono (datos y rótulos).
// Se cargan en las variables que ya usa el CSS del equipo (--font-plex, --font-jetbrains); --font-grotesk apunta a la misma sans.
const plex = Bricolage_Grotesque({ subsets: ["latin"], weight: "variable", axes: ["opsz"], variable: "--font-plex", display: "swap" });
const jetbrains = Martian_Mono({ subsets: ["latin"], weight: "400", variable: "--font-jetbrains", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Terra Vista",
  description: "Finding the Moon and Mars on Earth with NASA data — NASA Space Apps Challenge 2026, team Logos.",
  manifest: "manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04080f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plex.variable} ${jetbrains.variable}  antialiased`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppStateProvider>
          <SiteNav />
          <main id="main" tabIndex={-1} className="relative z-[1] outline-none">
            {children}
          </main>
        </AppStateProvider>
      </body>
    </html>
  );
}
