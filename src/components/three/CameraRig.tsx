"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PAGE_DEPTH, PAGES } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";

/**
 * Reads scroll progress straight off the ScrollControls DOM element instead
 * of trusting drei's useScroll().offset. That value only updates via a
 * listener ScrollControls attaches gated on `events.connected === el` —
 * connect() happens a frame later (rAF), so the gate gets checked before
 * it's true and, since nothing re-triggers the effect afterward, the
 * listener never attaches. Reading el.scrollTop directly sidesteps it.
 */
export default function CameraRig() {
  const { getScrollApi } = useExperience();
  const smoothed = useRef(0);
  const targetZ = useRef(0);

  useFrame(({ camera }, delta) => {
    const { el } = getScrollApi();
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const raw = max > 0 ? el.scrollTop / max : 0;

    const lerpSpeed = 1 - Math.pow(0.0005, delta);
    smoothed.current += (raw - smoothed.current) * lerpSpeed;

    targetZ.current = -smoothed.current * PAGES * PAGE_DEPTH;
    camera.position.set(0, 0, targetZ.current);
    camera.lookAt(0, 0, targetZ.current - 9);
  });

  return null;
}
