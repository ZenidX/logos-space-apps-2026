"use client";

// 04 · Method: validación con análogos conocidos, dónde se rompe la analogía y fuentes.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";
import { PageIntro } from "@/components/HowItWorks";

export default function MethodPage() {
  return (
    <div className="pt-12">
      <PageIntro step={6} title="Can you trust the ranking?">
        We tested it on 25 analog sites that space agencies already use: if the method is right, they should score high.
        Here is how they score, and where no place on Earth can match the Moon or Mars.
      </PageIntro>
      <Story sections={["validation", "honesty", "closing"]} />
      <NextPage href="/data/" label="See all the data" />
    </div>
  );
}
