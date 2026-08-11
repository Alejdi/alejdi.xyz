"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import type { Project } from "@/data/projects";
import ProjectPreview from "./ProjectPreview";
import { GithubIcon } from "./icons";

const STATUS_DOT: Record<Project["status"], string> = {
  live: "bg-emerald-400",
  building: "bg-amber-400",
  concept: "bg-bone-dim",
};

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/85 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.name}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 grid max-h-[88vh] w-full max-w-5xl grid-cols-1 gap-0 overflow-y-auto rounded-2xl border border-line bg-ink-raised md:grid-cols-2 md:overflow-hidden"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink/70 text-bone backdrop-blur transition-colors hover:border-violet hover:text-violet"
            >
              <X size={16} />
            </button>

            <div className="p-6 md:p-8">
              <ProjectPreview project={project} />
            </div>

            <div className="flex flex-col p-6 md:overflow-y-auto md:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-bone-dim">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
                {project.statusLabel} · {project.year}
              </div>

              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-bone md:text-4xl">
                {project.name}
              </h3>
              <p className="mt-2 text-sm font-medium" style={{ color: project.accent }}>
                {project.tagline}
              </p>

              <p className="mt-6 text-balance leading-relaxed text-bone-dim">
                {project.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs text-bone-dim">
                <span className="uppercase tracking-[0.12em]">Role</span>
                <span className="text-bone">{project.role}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-3 py-1 text-xs text-bone-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
                  >
                    Visit live <ArrowUpRight size={15} />
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-violet hover:text-violet"
                  >
                    <GithubIcon size={15} /> View code
                  </a>
                )}
                {!project.url && !project.github && (
                  <span className="text-xs text-bone-dim">
                    Not public yet — reach out if you&apos;d like a walkthrough.
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
