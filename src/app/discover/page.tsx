"use client";

// 02 · Discover: elegir destino, globo con candidatos y deslizador ciencia ↔ logística.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";

export default function DiscoverPage() {
  return (
    <div className="pt-12">
      <Story sections={["destination", "tradeoff"]} />
      <NextPage href="/3d/" label="Step inside in 3D" />
    </div>
  );
}
