"use client";

import { useThree } from "@react-three/fiber";

/**
 * Waypoint X-offsets are tuned for a widescreen viewport. On a narrow
 * (portrait/mobile) canvas the same world-space offset covers a much larger
 * share of the horizontal FOV and pushes panels off-screen, so scale it down.
 */
export function useLayoutScale() {
  return useThree((s) => (s.size.width < 768 ? 0.34 : 1));
}
