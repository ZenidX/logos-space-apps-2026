"use client";

// 02 · Discover: elegir destino, globo con candidatos y deslizador ciencia ↔ logística.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";
import { PageIntro } from "@/components/HowItWorks";

export default function DiscoverPage() {
  return (
    <div className="pt-12">
      <PageIntro kicker="Appendix · A2 · Earlier prototype" title="Find Earth's twins of the Moon and Mars.">
        Choose the Moon or Mars. The globe marks the Earth places that match it best. Then move the slider to weigh how
        similar a place is against how easy it is to reach.
      </PageIntro>
      <Story sections={["destination", "tradeoff"]} />
      <NextPage href="/appendix/3d/" label="Step inside in 3D" />
    </div>
  );
}
