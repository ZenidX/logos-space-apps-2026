"use client";

// 01 · Home: portada, escena Luna → Tierra y el problema.
import Story from "@/components/Story";
import { NextPage } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <>
      <Story sections={["hero", "contrast"]} />
      <NextPage href="/discover/" label="Find your analog" />
    </>
  );
}
