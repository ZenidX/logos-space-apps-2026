"use client";

// 04 · Base: cualquier punto de la Luna o de Marte → base sobre el terreno real → submisiones → dónde simular
// cada una en la Tierra (el objetivo del reto: análogos terrestres).
import BasePlanner from "@/components/BasePlanner";
import { NextPage } from "@/components/SiteNav";
import { PageIntro } from "@/components/HowItWorks";

export default function BasePage() {
  return (
    <div className="pt-12">
      <PageIntro step={5} title="Plan a base anywhere. Rehearse it on Earth.">
        Choose any point on the Moon or Mars and we set up a permanent base on its real terrain. Then see the sub-missions that keep it
        running (transport, water, power, exploration…) and, for each one, the places on Earth where you could simulate it.
      </PageIntro>
      <BasePlanner />
      <NextPage href="/method/" label="Does it work?" />
    </div>
  );
}
