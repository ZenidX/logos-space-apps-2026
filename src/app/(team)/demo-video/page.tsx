// Demo video for the Space Apps submission. Hidden page: not linked from the navigation.
// To update the video, replace the files in public/demo/ (built with video/scripts/build.sh on the `video` branch).
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const src = (f: string) => `${BASE}/demo/${f}`;
// Versioned file names: a new version gets new URLs, so no browser plays a cached older cut (video/scripts/publish-demo.sh).
const V = "terravista-demo-v6";

export const metadata: Metadata = {
  title: "Demo video",
  description: "30-second demo of TerraVista for the NASA Space Apps Challenge 2026.",
  robots: { index: false, follow: false },
};

export default function DemoVideoPage() {
  return (
    <div className="pt-12">
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 pb-24 md:pt-20">
        <p className="font-mono text-xs uppercase tracking-[.16em] text-[var(--acc)]">NASA Space Apps 2026 · Team Logos</p>
        <h1 className="mt-4 text-[clamp(34px,5.5vw,72px)] font-medium leading-[1.02] tracking-[-0.02em]">
          TerraVista <span className="text-[var(--acc)]">— Down to Earth</span>
        </h1>
        <p className="mt-5 max-w-[56ch] text-[clamp(16px,1.5vw,19px)] text-[var(--mut)]">30-second demo, with English captions.</p>

        <div className="mt-10 border border-[var(--line2)] bg-black">
          <video
            className="block aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            poster={src(`${V}-poster.jpg`)}
            aria-label="TerraVista demo video, 30 seconds, with burned-in English captions"
          >
            <source src={src(`${V}.mp4`)} type="video/mp4" />
            <source src={src(`${V}.webm`)} type="video/webm" />
            Your browser cannot play this video. <a href={src(`${V}.mp4`)}>Download the MP4</a>.
          </video>
        </div>

        <p className="mt-4 font-mono text-xs uppercase tracking-[.08em] text-[var(--dim)]">
          SI use: editing assisted by SI · voice generated with ElevenLabs ·{" "}
          <a className="text-[var(--acc)] underline" href={src(`${V}.mp4`)}>
            direct MP4 link
          </a>
        </p>
      </section>
    </div>
  );
}
