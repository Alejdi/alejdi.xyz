import type { Camera } from "three";
import { PAGE_DEPTH, stopCenterZ, type Stop } from "@/data/journey";

export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** 0-1 visibility for a stop based on how close the camera is to its center. */
export function stopVisibility(camera: Camera, stop: Stop, spread = 0.62) {
  const center = stopCenterZ(stop);
  const halfWindow = stop.length * PAGE_DEPTH * spread;
  const dist = Math.abs(camera.position.z - center);
  return 1 - smoothstep(halfWindow * 0.35, halfWindow, dist);
}

export function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic seeded PRNG (mulberry32) — a pure alternative to Math.random(). */
export function mulberry32(seed: number) {
  let state = seed;
  return function rand() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
