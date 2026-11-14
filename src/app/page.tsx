"use client";

// 01 · Home: portada, qué es un análogo y cómo funciona, escena Luna → Tierra y el problema.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";
import { HowItWorks } from "@/components/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Story sections={["hero"]} />
      <HowItWorks />
      <Story sections={["contrast"]} />
      <NextPage href="/discover/" label="Find your analog" />
    </>
  );
}
