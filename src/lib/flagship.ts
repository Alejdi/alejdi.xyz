/**
 * The flagship stop is pinned for a stretch of scroll and tells its story in
 * beats: the brand mark on arrival, then one beat per "how it works" step.
 * The particle field and the panel both read the beat from the same scroll
 * progress, so the shape and the highlighted step always change together.
 */

/** Progress (0 → 1 across the hold) where each beat begins. Beat 0 is the intro. */
export const BEAT_STARTS = [0, 0.16, 0.44, 0.72] as const;

export function beatFor(progress: number) {
  let beat = 0;
  for (let i = 0; i < BEAT_STARTS.length; i++) if (progress >= BEAT_STARTS[i]) beat = i;
  return beat;
}

/** 0 → 1 fill of step `i` (0-based, beat i + 1) for its progress bar. */
export function stepFill(progress: number, i: number) {
  const start = BEAT_STARTS[i + 1];
  const end = BEAT_STARTS[i + 2] ?? 1;
  const t = (progress - start) / (end - start);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Card anchor (world units left of center) and its CSS width on desktop. */
export const CARD_ANCHOR_X = 2.6;
export const CARD_WIDTH_PX = 452;
/** Half the width of the widest story shape, in world units at scale 1. */
const SHAPE_HALF_WIDTH = 1.5;
/** Clearance after the card, and before the right edge (the scroll HUD lives there). */
const GUTTER_PX = 32;
const EDGE_PX = 76;

/**
 * Desktop placement for the flagship's particle shape. The card has a fixed
 * pixel width but the shape lives in world units, so a fixed offset either
 * collides with the card on short windows or runs off the edge on tall ones.
 * Instead, centre the shape in the free space between the card and the right
 * edge, shrinking it if that space is narrower than the shape.
 */
export function flagshipShapeLayout(viewWidth: number, viewHeight: number, fovDeg: number, depth: number) {
  const pxPerUnit = viewHeight / (2 * depth * Math.tan((fovDeg * Math.PI) / 360));
  const cardRight = viewWidth / 2 - CARD_ANCHOR_X * pxPerUnit + CARD_WIDTH_PX;
  const freeLeft = cardRight + GUTTER_PX;
  const freeRight = viewWidth - EDGE_PX;
  const x = ((freeLeft + freeRight) / 2 - viewWidth / 2) / pxPerUnit;
  const room = (freeRight - freeLeft) / pxPerUnit;
  const scale = Math.max(0.55, Math.min(1, room / (2 * SHAPE_HALF_WIDTH)));
  return { x, scale };
}
