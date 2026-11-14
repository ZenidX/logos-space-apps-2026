import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logos · Mission Analogs",
  description: "Earth places to rehearse specific Moon and Mars missions, with NASA data — NASA Space Apps Challenge 2026, team Logos.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#04080f" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
