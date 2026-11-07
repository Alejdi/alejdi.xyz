import { featuredProjects } from "./projects";

export type Stop = {
  key: string;
  kind: "hero" | "about" | "skills" | "project" | "more" | "contact";
  start: number;
  length: number;
  projectIndex?: number;
  /**
   * Pages of scroll the stop stays pinned in front of the camera after it
   * arrives (a "sticky" section). While pinned it is fully visible and its
   * content follows the camera; stopProgress() runs 0 → 1 across the hold.
   */
  hold?: number;
};

const PROJECT_LENGTH = 0.95;
const PROJECT_GAP = 0.85;
const PROJECTS_START = 3.0;
/** Pinned scroll for the flagship's story: four beats of ~0.6 pages each. */
const FLAGSHIP_HOLD = 2.4;

const projectStops: Stop[] = [];
let cursor = PROJECTS_START;
featuredProjects.forEach((p, i) => {
  const hold = p.flagship ? FLAGSHIP_HOLD : 0;
  projectStops.push({
    key: p.id,
    kind: "project",
    start: cursor,
    length: PROJECT_LENGTH,
    projectIndex: i,
    ...(hold ? { hold } : {}),
  });
  cursor += PROJECT_GAP + hold;
});

const RAW_STOPS: Stop[] = [
  { key: "hero", kind: "hero", start: 0, length: 1.15 },
  { key: "about", kind: "about", start: 1.0, length: 1.15 },
  { key: "skills", kind: "skills", start: 2.0, length: 1.15 },
  ...projectStops,
  { key: "more", kind: "more", start: cursor - 0.15, length: 1.2 },
  { key: "contact", kind: "contact", start: cursor + 0.95, length: 1.3 },
];

// Shift the whole schedule so the hero's center sits at page 0 — that's
// where the camera starts (scroll offset 0), so the hero must be at full
// visibility there rather than partway through its own fade-in window.
const HERO_CENTER_SHIFT = RAW_STOPS[0].start + RAW_STOPS[0].length / 2;

export const STOPS: Stop[] = RAW_STOPS.map((s) => ({ ...s, start: s.start - HERO_CENTER_SHIFT }));

const CONTACT = STOPS[STOPS.length - 1];

/**
 * Total scroll "pages". Scroll offset 0 -> 1 sweeps the camera from the
 * hero's center to the contact stop's center, so both ends of the journey
 * land at full visibility instead of fading at the edges.
 */
export const PAGES = CONTACT.start + CONTACT.length / 2;

/** World units of depth the camera travels per "page" of scroll. */
export const PAGE_DEPTH = 6;

/**
 * A stop's visibility fades based on the camera's distance to its group
 * origin (stopCenterZ) — but the actual content inside each group must sit
 * this far further along -Z so the camera is viewing it from a sane
 * distance, not standing on top of it, right when visibility peaks.
 */
export const VIEW_DEPTH = 5.5;

/** Page position where the camera "arrives" at a stop (the start of its hold, if any). */
export function stopArrival(stop: Stop) {
  return stop.start + stop.length / 2;
}

/** Z where the camera arrives at the stop. For pinned stops the hold continues past it. */
export function stopCenterZ(stop: Stop) {
  return -stopArrival(stop) * PAGE_DEPTH;
}

/**
 * World-unit distance from the camera to a stop: zero anywhere inside a
 * pinned stop's hold, otherwise the distance to the nearest end of it.
 */
export function stopDistance(cameraZ: number, stop: Stop) {
  const arrive = stopCenterZ(stop);
  const leave = arrive - (stop.hold ?? 0) * PAGE_DEPTH;
  if (cameraZ > arrive) return cameraZ - arrive;
  if (cameraZ < leave) return leave - cameraZ;
  return 0;
}

/** 0 → 1 across a pinned stop's hold (0 before arriving, 1 after leaving). */
export function stopProgress(cameraZ: number, stop: Stop) {
  const hold = (stop.hold ?? 0) * PAGE_DEPTH;
  if (hold <= 0) return 0;
  const p = (stopCenterZ(stop) - cameraZ) / hold;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/**
 * Where a pinned stop's content sits: it tracks the camera through the hold,
 * and is parked at the matching end of the hold before and after it.
 */
export function pinnedZ(cameraZ: number, stop: Stop) {
  const arrive = stopCenterZ(stop);
  const leave = arrive - (stop.hold ?? 0) * PAGE_DEPTH;
  return Math.min(arrive, Math.max(leave, cameraZ));
}

export function stopByKey(key: string) {
  const stop = STOPS.find((s) => s.key === key);
  if (!stop) throw new Error(`Unknown journey stop: ${key}`);
  return stop;
}
