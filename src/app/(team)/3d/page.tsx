"use client";

// 03 · 3D: 11 × 11 km del candidato frente a 11 × 11 km del objetivo, misma escala y misma luz.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";
import { PageIntro } from "@/components/HowItWorks";

export default function ThreeDPage() {
  return (
    <div className="pt-12">
      <PageIntro step={4} title="See the terrain side by side.">
        Each view is a real 11 × 11 km patch of terrain from satellite height data: an Earth candidate next to the Moon or
        Mars site. Drag to turn it and move the Sun to see the shadows.
      </PageIntro>
      <Story sections={["step3d"]} />
      <NextPage href="/base/" label="Build a base there" />
    </div>
  );
}
