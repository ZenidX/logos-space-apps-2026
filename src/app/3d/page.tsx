"use client";

// 03 · 3D: 11 × 11 km del candidato frente a 11 × 11 km del objetivo, misma escala y misma luz.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";

export default function ThreeDPage() {
  return (
    <div className="pt-12">
      <Story sections={["step3d"]} />
      <NextPage href="/method/" label="Does it work?" />
    </div>
  );
}
