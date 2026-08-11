"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { PAGES, STOPS } from "@/data/journey";
import { featuredProjects } from "@/data/projects";
import CameraRig from "./CameraRig";
import ScrollApiBridge from "./ScrollApiBridge";
import Dust from "./Dust";
import ParticleField from "./ParticleField";
import HeroWaypoint from "./HeroWaypoint";
import AboutWaypoint from "./AboutWaypoint";
import SkillsWaypoint from "./SkillsWaypoint";
import ProjectWaypoint from "./ProjectWaypoint";
import MoreWaypoint from "./MoreWaypoint";
import ContactWaypoint from "./ContactWaypoint";

export default function Experience() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 0], fov: 45 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#08070a"]} />
      <fog attach="fog" args={["#08070a", 4, 13]} />

      <ScrollControls pages={PAGES} damping={0.22}>
        <ScrollApiBridge />
        <CameraRig />
        <Dust />
        <ParticleField />

        <Suspense fallback={null}>
          <HeroWaypoint />
          <AboutWaypoint />
          <SkillsWaypoint />
          {featuredProjects.map((project, i) => {
            const stop = STOPS.find((s) => s.kind === "project" && s.projectIndex === i);
            if (!stop) return null;
            return <ProjectWaypoint key={project.id} project={project} stop={stop} />;
          })}
          <MoreWaypoint />
          <ContactWaypoint />
        </Suspense>
      </ScrollControls>

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.55} mipmapBlur />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
