"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowUpRight, Play } from "lucide-react";
import type { Project } from "@/data/projects";
import { pinnedZ, stopArrival, stopProgress, VIEW_DEPTH, type Stop } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";
import { useLayoutScale } from "@/lib/use-layout-scale";
import { BEAT_STARTS, beatFor, CARD_ANCHOR_X, CARD_WIDTH_PX, stepFill } from "@/lib/flagship";
import { stopVisibility } from "@/lib/three-utils";
import PreventivMark from "@/components/PreventivMark";
import HtmlFade from "./HtmlFade";

const COUNT_MS = 1600;

function formatStat(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * The flagship stop. It stays pinned in front of the camera for a stretch of
 * scroll while the particle field tells "how it works" in beats; the step
 * list here tracks the same scroll progress, with a live progress bar per
 * step. Clicking a step scrolls straight to its beat.
 */
export default function FlagshipWaypoint({ project, stop }: { project: Project; stop: Stop }) {
  const flagship = project.flagship!;
  const { openProject, getScrollApi } = useExperience();
  const s = useLayoutScale();
  const side = (stop.projectIndex ?? 0) % 2 === 0 ? 1 : -1;
  const index = (stop.projectIndex ?? 0) + 1;
  const hasFilm = Boolean(flagship.video?.landscape || flagship.video?.portrait);

  const pin = useRef<THREE.Group>(null);
  const beatRef = useRef(0);
  const [beat, setBeat] = useState(0);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);
  const statEls = useRef<Array<HTMLSpanElement | null>>([]);
  const counted = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  function countUp() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - t0) / COUNT_MS);
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // ease-out expo
      flagship.stats.forEach((stat, i) => {
        const el = statEls.current[i];
        if (el) el.textContent = formatStat(stat.value * e);
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Runs after the camera (-2) and before drei's <Html> projects (0).
  useFrame(({ camera }) => {
    if (!pin.current) return;
    const camZ = camera.position.z;
    pin.current.position.z = pinnedZ(camZ, stop);

    const p = stopProgress(camZ, stop);
    const b = beatFor(p);
    if (b !== beatRef.current) {
      beatRef.current = b;
      setBeat(b);
    }
    bars.current.forEach((bar, i) => {
      if (bar) bar.style.transform = `scaleX(${stepFill(p, i)})`;
    });

    if (!counted.current && stopVisibility(camera, stop) > 0.7) {
      counted.current = true;
      countUp();
    }
  }, -1);

  function goToStep(i: number) {
    const { el, pages } = getScrollApi();
    if (!el) return;
    const page = stopArrival(stop) + (BEAT_STARTS[i + 1] + 0.05) * (stop.hold ?? 0);
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: (page / pages) * max, behavior: "smooth" });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <group ref={pin}>
      <group position={[0, 0, -VIEW_DEPTH]}>
        <HtmlFade
          stop={stop}
          position={[-side * CARD_ANCHOR_X * s, 0, 0]}
          alignRight={side === -1}
          style={{ width: `min(88vw, ${CARD_WIDTH_PX}px)`, textShadow: "none" }}
        >
          <div
            ref={card}
            onPointerMove={onPointerMove}
            className="flagship-card relative overflow-hidden md:top-9 rounded-2xl border border-line bg-ink/60 p-4 backdrop-blur-md sm:p-6 short:p-4"
            style={{ ["--accent" as string]: project.accent }}
          >
            <div className="flagship-spotlight pointer-events-none absolute inset-0" aria-hidden="true" />

            <div className="relative">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-bone-dim">
                <span className="font-mono">{String(index).padStart(2, "0")}</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {project.statusLabel}
                <span
                  className="ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-[0.16em]"
                  style={{ borderColor: `${project.accent}66`, color: project.accent }}
                >
                  Flagship
                </span>
              </div>

              <h3 className="mt-3 flex items-center gap-3 font-display text-3xl font-semibold leading-none tracking-tight text-bone sm:mt-4 sm:text-5xl short:mt-2.5 short:text-4xl">
                <PreventivMark size={34} tick={project.accent} className="h-7 w-7 shrink-0 sm:h-10 sm:w-10 short:h-8 short:w-8" />
                {project.name}
              </h3>
              <p className="mt-2 text-xs font-medium leading-snug sm:mt-3 sm:text-sm short:mt-2" style={{ color: project.accent }}>
                {flagship.pitch}
              </p>

              <ol className="mt-3 border-t border-line sm:mt-5 short:mt-3">
                {flagship.steps.map((step, i) => {
                  const active = beat === i + 1;
                  return (
                    <li key={step.title} className="border-b border-line">
                      <button
                        onClick={() => goToStep(i)}
                        aria-current={active ? "step" : undefined}
                        className="group w-full py-2 text-left sm:py-3 short:py-2"
                      >
                        <div className="flex items-baseline gap-3">
                          <span
                            className="font-mono text-[10px] transition-colors duration-500"
                            style={{ color: active ? project.accent : undefined }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`text-sm font-medium transition-colors duration-500 ${
                              active ? "text-bone" : "text-bone-dim group-hover:text-bone"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        <div
                          className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
                          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
                        >
                          <p className="overflow-hidden pl-[1.6rem] text-[11px] leading-relaxed text-bone-dim sm:text-xs">
                            <span className="block pt-1.5">{step.body}</span>
                          </p>
                        </div>
                      </button>
                      <span className="block h-px w-full overflow-hidden">
                        <span
                          ref={(n) => {
                            bars.current[i] = n;
                          }}
                          className="block h-px w-full origin-left"
                          style={{ background: project.accent, transform: "scaleX(0)" }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ol>

              <p
                className="flex items-center gap-2 overflow-hidden text-[10px] uppercase tracking-[0.18em] text-bone-dim transition-all duration-500"
                style={{ maxHeight: beat === 0 ? 36 : 0, opacity: beat === 0 ? 1 : 0, marginTop: beat === 0 ? 10 : 0 }}
                aria-hidden={beat !== 0}
              >
                <span className="flagship-scroll-cue inline-block h-3 w-px" style={{ background: project.accent }} />
                Keep scrolling: the particles tell how it works
              </p>

              <dl className="mt-3 grid grid-cols-3 gap-3 sm:mt-5 short:mt-3">
                {flagship.stats.map((stat, i) => (
                  <div key={stat.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-bone-dim sm:text-[10px]">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-lg font-semibold tabular-nums text-bone sm:text-2xl short:text-xl">
                      <span
                        ref={(n) => {
                          statEls.current[i] = n;
                        }}
                      >
                        0
                      </span>
                      {stat.suffix}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3 short:mt-4">
                <button
                  onClick={() => openProject(project)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98] sm:px-5"
                  style={{ background: project.accent, boxShadow: `0 8px 30px -8px ${project.accent}` }}
                >
                  {hasFilm ? (
                    <>
                      <Play size={13} fill="currentColor" /> Watch the film
                      {flagship.video?.duration && (
                        <span className="font-mono text-[10px] tabular-nums text-white/70">
                          {Math.floor(flagship.video.duration / 60)}:{String(Math.round(flagship.video.duration % 60)).padStart(2, "0")}
                        </span>
                      )}
                    </>
                  ) : (
                    <>Open the case study →</>
                  )}
                </button>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-xs font-medium text-bone transition-colors hover:border-(--accent) hover:text-(--accent) sm:px-5"
                  >
                    {project.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </HtmlFade>
      </group>
    </group>
  );
}
