"use client";

import { skillGroups } from "@/data/skills";
import { stopByKey, stopCenterZ, VIEW_DEPTH } from "@/data/journey";
import { useLayoutScale } from "@/lib/use-layout-scale";
import HtmlFade from "./HtmlFade";

export default function SkillsWaypoint() {
  const stop = stopByKey("skills");
  const z = stopCenterZ(stop);
  const ls = useLayoutScale();

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      <HtmlFade stop={stop} position={[-2.6 * ls, 0, 0]} style={{ width: "min(90vw, 480px)" }}>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-violet">
          02 — Skills
        </span>
        <h2 className="mt-4 max-w-sm text-balance font-display text-3xl font-semibold leading-tight text-bone sm:text-4xl">
          A toolkit that spans training data to production UI.
        </h2>
        <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-[11px] font-medium uppercase tracking-wide text-bone">
                {group.category}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line px-2.5 py-0.5 text-[10px] text-bone-dim"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </HtmlFade>
    </group>
    </group>
  );
}
