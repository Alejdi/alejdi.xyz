"use client";

import { profile } from "@/data/profile";
import { stopByKey, stopCenterZ, STOPS, VIEW_DEPTH } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";
import { useLayoutScale } from "@/lib/use-layout-scale";
import HtmlFade from "./HtmlFade";

export default function HeroWaypoint() {
  const stop = stopByKey("hero");
  const z = stopCenterZ(stop);
  const { jumpToStop } = useExperience();
  const s = useLayoutScale();

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      <HtmlFade stop={stop} position={[-2.6 * s, -0.08, 0]} style={{ width: "min(90vw, 480px)" }}>
        <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-bone-dim">
          <span className="h-px w-8 bg-violet" />
          {profile.role} — {profile.location}
        </p>
        <h1 className="text-balance font-display text-4xl font-semibold leading-[1.03] tracking-tight text-bone sm:text-5xl lg:text-6xl">
          I build what
          <br />
          others just <span className="text-violet">imagine.</span>
        </h1>
        <p className="mt-5 max-w-md text-balance text-sm leading-relaxed text-bone-dim sm:text-base">
          {profile.summary.split(". ")[0]}. The full story unfolds as you scroll.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => jumpToStop(STOPS.find((st) => st.kind === "project")?.key ?? "about")}
            className="rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start the journey ↓
          </button>
          <button
            onClick={() => jumpToStop("contact")}
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-bone transition-colors hover:border-violet hover:text-violet"
          >
            Get In Touch
          </button>
        </div>
        <div className="mt-10 grid max-w-sm grid-cols-3 gap-6 border-t border-line pt-5">
          {profile.stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-xl font-semibold text-bone">{stat.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-bone-dim">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </HtmlFade>
    </group>
    </group>
  );
}
