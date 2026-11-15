import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import { AppStateProvider } from "@/components/AppState";

const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["300", "400", "500"] });
// Variable (sin lista de pesos): con pesos fijos Google sirve a veces URLs /l/font?kit= sin extensión y next/font falla.
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "TerraVista",
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
      <body className={`${plex.variable} ${jetbrains.variable} ${grotesk.variable} antialiased`}>
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
