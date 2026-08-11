"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "@/data/projects";
import { stopCenterZ, VIEW_DEPTH, type Stop } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";
import { useLayoutScale } from "@/lib/use-layout-scale";
import { useSafeTexture } from "@/lib/use-safe-texture";
import HtmlFade from "./HtmlFade";

const STATUS_DOT: Record<Project["status"], string> = {
  live: "bg-emerald-400",
  building: "bg-amber-400",
  concept: "bg-bone-dim",
};

/** Concept art floating inside the particle frame the field forms around it. */
function FramedArt({ texture }: { texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const width = 1.9;
  const height = 1.425;

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
  });

  return (
    <Billboard>
      <group ref={group}>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </Billboard>
  );
}

export default function ProjectWaypoint({ project, stop }: { project: Project; stop: Stop }) {
  const z = stopCenterZ(stop);
  const { openProject, markArt } = useExperience();
  const s = useLayoutScale();
  const side = (stop.projectIndex ?? 0) % 2 === 0 ? 1 : -1;
  const index = (stop.projectIndex ?? 0) + 1;
  const texture = useSafeTexture(project.previewImage);

  useEffect(() => {
    if (texture) markArt(project.id);
  }, [texture, markArt, project.id]);

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      {texture && (
        <group
          position={s < 1 ? [0, 1.32, -0.6] : [side * 2.2 * s, 0, 0]}
          scale={s < 1 ? 0.62 : 1}
        >
          <FramedArt texture={texture} />
        </group>
      )}

      <HtmlFade
        stop={stop}
        position={[-side * 2.3 * s, 0, 0]}
        alignRight={side === -1}
        style={{ width: "min(90vw, 420px)" }}
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-bone-dim">
          <span className="font-mono">{String(index).padStart(2, "0")}</span>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
          {project.statusLabel}
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-bone sm:text-3xl">
          {project.name}
        </h3>
        <p className="mt-1.5 text-sm font-medium" style={{ color: project.accent }}>
          {project.tagline}
        </p>
        <p className="mt-4 max-w-sm text-xs leading-relaxed text-bone-dim">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[10px] text-bone-dim">
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={() => openProject(project)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-xs font-medium text-ink transition-transform hover:scale-[1.03]"
        >
          Open interactive preview →
        </button>
      </HtmlFade>
    </group>
    </group>
  );
}
