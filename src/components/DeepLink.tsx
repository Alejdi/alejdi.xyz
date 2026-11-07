"use client";

import { useEffect } from "react";
import { STOPS } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";

/**
 * Shareable links into the journey: alejdi.xyz/#preventiv lands on that stop
 * (instantly on load, smoothly on later hash changes). Any stop key works.
 */
export default function DeepLink() {
  const { ready, jumpToStop } = useExperience();

  useEffect(() => {
    if (!ready) return;
    const go = (behavior: ScrollBehavior) => {
      const key = decodeURIComponent(window.location.hash.slice(1));
      if (key && STOPS.some((s) => s.key === key)) jumpToStop(key, behavior);
    };
    // wait a frame so the scroll container has its final height
    const raf = requestAnimationFrame(() => go("instant"));
    const onHash = () => go("smooth");
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHash);
    };
  }, [ready, jumpToStop]);

  return null;
}
