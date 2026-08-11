"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import ScrollHUD from "@/components/ScrollHUD";
import ProjectModal from "@/components/ProjectModal";
import CanvasErrorBoundary from "@/components/three/CanvasErrorBoundary";
import { ExperienceProvider, useExperience } from "@/lib/experience-context";

const Experience = dynamic(() => import("@/components/three/Experience"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xs uppercase tracking-[0.3em] text-bone-dim">Loading…</span>
    </div>
  ),
});

function Scene() {
  const { activeProject, closeProject } = useExperience();
  return (
    <>
      <div className="fixed inset-0">
        <Experience />
      </div>
      <ProjectModal project={activeProject} onClose={closeProject} />
    </>
  );
}

export default function Home() {
  return (
    <ExperienceProvider>
      <div className="fixed inset-0 overflow-hidden">
        <CanvasErrorBoundary>
          <Scene />
          <Nav />
          <ScrollHUD />
        </CanvasErrorBoundary>
      </div>
    </ExperienceProvider>
  );
}
