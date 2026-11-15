"use client";

// 04 · Base: cualquier punto de la Luna o de Marte → terreno real → base colocada por reglas → misión animada
// → dónde ensayar cada paso en la Tierra.
import BasePlanner from "@/components/BasePlanner";
import { NextPage } from "@/components/SiteNav";
import { PageIntro } from "@/components/HowItWorks";

export default function BasePage() {
  return (
    <div className="pt-12">
      <PageIntro step={4} title="Build a base anywhere on the Moon or Mars.">
        Pick any point. We load NASA&apos;s real elevation data for it, lay out a base with simple rules and play the mission:
        landing, habitat, power, resources, rover and spacesuit walks. Each step tells you where on Earth to rehearse it.
      </PageIntro>
      <BasePlanner />
      <NextPage href="/method/" label="Does it work?" />
    </div>
  );
}
