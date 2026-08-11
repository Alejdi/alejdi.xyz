import { featuredProjects } from "./projects";

export type Stop = {
  key: string;
  kind: "hero" | "about" | "skills" | "project" | "more" | "contact";
  start: number;
  length: number;
  projectIndex?: number;
};

const PROJECT_LENGTH = 0.95;
const PROJECT_GAP = 0.85;
const PROJECTS_START = 3.0;

const RAW_STOPS: Stop[] = [
  { key: "hero", kind: "hero", start: 0, length: 1.15 },
  { key: "about", kind: "about", start: 1.0, length: 1.15 },
  { key: "skills", kind: "skills", start: 2.0, length: 1.15 },
  ...featuredProjects.map((p, i) => ({
    key: p.id,
    kind: "project" as const,
    start: PROJECTS_START + i * PROJECT_GAP,
    length: PROJECT_LENGTH,
    projectIndex: i,
  })),
  {
    key: "more",
    kind: "more" as const,
    start: PROJECTS_START + featuredProjects.length * PROJECT_GAP - 0.15,
    length: 1.2,
  },
  {
    key: "contact",
    kind: "contact" as const,
    start: PROJECTS_START + featuredProjects.length * PROJECT_GAP + 0.95,
    length: 1.3,
  },
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

export function stopCenterZ(stop: Stop) {
  return -(stop.start + stop.length / 2) * PAGE_DEPTH;
}

export function stopByKey(key: string) {
  const stop = STOPS.find((s) => s.key === key);
  if (!stop) throw new Error(`Unknown journey stop: ${key}`);
  return stop;
}
