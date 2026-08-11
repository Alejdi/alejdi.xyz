"use client";

import { useEffect, useRef } from "react";
import { PAGES, STOPS } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";

const MARKERS = [
  { label: "Hero", jumpKey: "hero", at: 0 },
  { label: "About", jumpKey: "about", at: STOPS.find((s) => s.key === "about")!.start },
  { label: "Skills", jumpKey: "skills", at: STOPS.find((s) => s.key === "skills")!.start },
  {
    label: "Work",
    jumpKey: STOPS.find((s) => s.kind === "project")!.key,
    at: STOPS.find((s) => s.kind === "project")!.start,
  },
  { label: "Contact", jumpKey: "contact", at: STOPS.find((s) => s.key === "contact")!.start },
];

export default function ScrollHUD() {
  const { jumpToStop, getScrollApi } = useExperience();
  const fillRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    function tick() {
      const { el } = getScrollApi();
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        const progress = max > 0 ? el.scrollTop / max : 0;
        if (fillRef.current) fillRef.current.style.height = `${progress * 100}%`;
        const pageProgress = progress * PAGES;
        dotsRef.current.forEach((dot, i) => {
          if (!dot) return;
          const marker = MARKERS[i];
          const next = MARKERS[i + 1];
          const active = pageProgress >= marker.at && (!next || pageProgress < next.at);
          dot.style.opacity = active ? "1" : "0.4";
          dot.style.transform = active ? "scale(1.4)" : "scale(1)";
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getScrollApi]);

  return (
    <div className="pointer-events-none fixed inset-y-0 right-3 z-40 flex items-center sm:right-4 md:right-8">
      <div className="pointer-events-auto relative flex h-56 flex-col items-center justify-between">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line" />
        <div
          ref={fillRef}
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-violet"
          style={{ height: "0%" }}
        />
        {MARKERS.map((m, i) => (
          <button
            key={m.label}
            ref={(node) => {
              dotsRef.current[i] = node;
            }}
            onClick={() => jumpToStop(m.jumpKey)}
            aria-label={`Jump to ${m.label}`}
            title={m.label}
            className="relative z-10 h-2 w-2 rounded-full bg-bone-dim transition-all"
            style={{ opacity: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}
