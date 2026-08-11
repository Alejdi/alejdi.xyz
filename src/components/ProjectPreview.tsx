"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const STATUS_COPY: Record<Project["status"], string> = {
  live: "live in production",
  building: "actively in development",
  concept: "early concept — pre-build",
};

export default function ProjectPreview({ project }: { project: Project }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [imageFailed, setImageFailed] = useState(false);
  const hash = hashString(project.id);
  const durationA = 16 + (hash % 9);
  const durationB = 12 + ((hash >> 3) % 7);
  const delay = (hash % 5) * -1.3;
  const showImage = Boolean(project.previewImage) && !imageFailed;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -8, ry: px * 8 });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  return (
    <div style={{ perspective: "1200px" }}>
      <div
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-ink-raised shadow-2xl"
      >
        <div className="relative z-10 flex items-center gap-2 border-b border-line/80 bg-ink-raised/90 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-bone-dim/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone-dim/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone-dim/30" />
          <span className="ml-3 truncate rounded-md bg-ink px-3 py-1 text-[11px] text-bone-dim">
            {project.url ? project.url.replace(/^https?:\/\//, "") : `${STATUS_COPY[project.status]}`}
          </span>
        </div>

        <div className="absolute inset-0 top-10 overflow-hidden">
          {showImage && project.previewImage && (
            <Image
              src={project.previewImage}
              alt={`${project.name} concept preview`}
              fill
              sizes="(max-width: 768px) 90vw, 480px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          )}

          {!showImage && (
            <>
              <div
                className="absolute -inset-1/2 opacity-70 blur-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${project.accent}aa, transparent 60%), radial-gradient(circle at 70% 70%, ${project.accent}55, transparent 55%)`,
                  animation: `drift-a ${durationA}s ease-in-out ${delay}s infinite alternate`,
                }}
              />
              <div
                className="absolute -inset-1/2 opacity-50 blur-3xl"
                style={{
                  background: `radial-gradient(circle at 65% 25%, #ffffff33, transparent 50%)`,
                  animation: `drift-b ${durationB}s ease-in-out ${delay}s infinite alternate`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="select-none font-display text-[9rem] font-semibold leading-none opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.22]"
                  style={{ color: project.accent }}
                >
                  {project.name.charAt(0)}
                </span>
              </div>
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(243,241,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,234,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
            </>
          )}
        </div>

        <div className="absolute right-3 top-16 z-10 rounded-full border border-line bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-wide text-bone-dim backdrop-blur">
          {project.statusLabel}
        </div>
      </div>

      <style>{`
        @keyframes drift-a {
          from { transform: translate(-5%, -5%) scale(1); }
          to { transform: translate(5%, 8%) scale(1.15); }
        }
        @keyframes drift-b {
          from { transform: translate(4%, -6%) scale(1.05); }
          to { transform: translate(-6%, 4%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
