"use client";

// 02 · Story (antes la portada): qué es un análogo y cómo funciona, escena Luna → Tierra y el problema.
// La portada (/) es ahora la app de misiones: src/app/(logos)/.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";
import { HowItWorks } from "@/components/HowItWorks";

export default function StoryPage() {
  return (
    <>
      <Story sections={["hero"]} />
      <HowItWorks />
      <Story sections={["contrast"]} />
      <NextPage href="/discover/" label="Find your analog" />
    </>
  );
}
