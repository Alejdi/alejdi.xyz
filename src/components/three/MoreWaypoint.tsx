"use client";

import { otherProjects, type Project } from "@/data/projects";
import { stopByKey, stopCenterZ, VIEW_DEPTH } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";
import HtmlFade from "./HtmlFade";

const STATUS_DOT: Record<Project["status"], string> = {
  live: "bg-emerald-400",
  building: "bg-amber-400",
  concept: "bg-bone-dim",
};

export default function MoreWaypoint() {
  const stop = stopByKey("more");
  const z = stopCenterZ(stop);
  const { openProject } = useExperience();

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      <HtmlFade stop={stop} position={[0, 0.2, 0]} center style={{ width: "min(92vw, 720px)" }}>
        <h3 className="text-center text-xs font-medium uppercase tracking-[0.2em] text-bone-dim">
          More on the workbench
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {otherProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => openProject(project)}
              className="rounded-xl border border-line bg-ink/70 p-4 text-left backdrop-blur-sm transition-colors hover:border-violet/60"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-semibold text-bone">{project.name}</h4>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-bone-dim">{project.tagline}</p>
            </button>
          ))}
        </div>
      </HtmlFade>
    </group>
    </group>
  );
}
