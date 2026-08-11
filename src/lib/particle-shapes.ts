import { mulberry32 } from "./three-utils";

/**
 * Every shape is a Float32Array of xyz targets the particle field morphs
 * into. Icon shapes are drawn onto an offscreen canvas and sampled from
 * filled pixels — one visual system, any silhouette. Module-level cache so
 * each shape is computed once per session.
 */

const CANVAS_W = 480;
const CANVAS_H = 300;

const cache = new Map<string, Float32Array>();

function sampleCanvas(
  cacheKey: string,
  count: number,
  worldHeight: number,
  depth: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): Float32Array {
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx, CANVAS_W, CANVAS_H);

  const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
  const pts: number[] = [];
  for (let y = 0; y < CANVAS_H; y += 2) {
    for (let x = 0; x < CANVAS_W; x += 2) {
      if (data[(y * CANVAS_W + x) * 4 + 3] > 100) pts.push(x, y);
    }
  }

  const out = new Float32Array(count * 3);
  const rand = mulberry32(hashKey(cacheKey));
  const unit = worldHeight / CANVAS_H;
  const n = pts.length / 2;
  if (n === 0) return fallbackSphere(count);
  for (let i = 0; i < count; i++) {
    const p = (i * 7919) % n;
    const px = pts[p * 2] + (rand() - 0.5) * 2.4;
    const py = pts[p * 2 + 1] + (rand() - 0.5) * 2.4;
    out[i * 3] = (px - CANVAS_W / 2) * unit;
    out[i * 3 + 1] = -(py - CANVAS_H / 2) * unit;
    out[i * 3 + 2] = (rand() - 0.5) * depth;
  }
  cache.set(cacheKey, out);
  return out;
}

/** Drop cached text samplings — call once web fonts finish loading so glyphs re-render in the real typeface. */
export function clearTextShapeCache() {
  for (const key of [...cache.keys()]) {
    if (key.startsWith("text:")) cache.delete(key);
  }
}

function hashKey(value: string) {
  let hash = 7;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash) || 1;
}

function fallbackSphere(count: number) {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(99);
  for (let i = 0; i < count; i++) {
    const t = Math.acos(2 * rand() - 1);
    const p = rand() * Math.PI * 2;
    out[i * 3] = Math.sin(t) * Math.cos(p) * 1.3;
    out[i * 3 + 1] = Math.cos(t) * 1.3;
    out[i * 3 + 2] = Math.sin(t) * Math.sin(p) * 1.3;
  }
  return out;
}

/* ------------------------------- shapes -------------------------------- */

export function textShape(text: string, count: number): Float32Array {
  return sampleCanvas(`text:${text}`, count, 2.4, 0.35, (ctx, w, h) => {
    const fontStack = `900 ${text.length > 4 ? 118 : text.length > 2 ? 190 : 250}px "Bricolage Grotesque", "Arial Black", sans-serif`;
    ctx.font = fontStack;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2, w - 30);
  });
}

export function houseShape(count: number): Float32Array {
  return sampleCanvas("house", count, 2.9, 0.4, (ctx, w) => {
    const cx = w / 2;
    // roof
    ctx.beginPath();
    ctx.moveTo(cx - 130, 118);
    ctx.lineTo(cx, 22);
    ctx.lineTo(cx + 130, 118);
    ctx.closePath();
    ctx.fill();
    // body
    ctx.fillRect(cx - 104, 118, 208, 152);
    // cut door + windows
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(cx - 22, 196, 44, 74);
    ctx.fillRect(cx - 82, 140, 44, 40);
    ctx.fillRect(cx + 38, 140, 44, 40);
    ctx.globalCompositeOperation = "source-over";
  });
}

export function bubbleShape(count: number): Float32Array {
  return sampleCanvas("bubble", count, 2.7, 0.4, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 16;
    ctx.beginPath();
    ctx.roundRect(cx - 150, cy - 84, 300, 168, 44);
    ctx.fill();
    // tail
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 78);
    ctx.lineTo(cx - 40, cy + 132);
    ctx.lineTo(cx - 8, cy + 80);
    ctx.closePath();
    ctx.fill();
    // typing dots cut out
    ctx.globalCompositeOperation = "destination-out";
    for (const dx of [-62, 0, 62]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy, 19, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  });
}

export function chipShape(count: number): Float32Array {
  return sampleCanvas("chip", count, 2.7, 0.4, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillRect(cx - 92, cy - 92, 184, 184);
    // pins
    for (let i = 0; i < 5; i++) {
      const off = -80 + i * 40;
      ctx.fillRect(cx + off - 8, cy - 128, 16, 30);
      ctx.fillRect(cx + off - 8, cy + 98, 16, 30);
      ctx.fillRect(cx - 128, cy + off - 8, 30, 16);
      ctx.fillRect(cx + 98, cy + off - 8, 30, 16);
    }
    // inner die cut
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(cx - 48, cy - 48, 96, 96);
    ctx.globalCompositeOperation = "source-over";
    // small core back in
    ctx.fillRect(cx - 20, cy - 20, 40, 40);
  });
}

export function qrShape(count: number): Float32Array {
  return sampleCanvas("qr", count, 2.6, 0.35, (ctx, w, h) => {
    const size = 220;
    const cell = size / 11;
    const ox = w / 2 - size / 2;
    const oy = h / 2 - size / 2;
    const rand = mulberry32(4242);
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const finder = (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
        if (finder) continue;
        if (rand() > 0.52) ctx.fillRect(ox + c * cell, oy + r * cell, cell - 2, cell - 2);
      }
    }
    // finder squares
    for (const [fr, fc] of [
      [0, 0],
      [0, 8],
      [8, 0],
    ]) {
      ctx.fillRect(ox + fc * cell, oy + fr * cell, cell * 3 - 2, cell * 3 - 2);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(ox + fc * cell + cell * 0.6, oy + fr * cell + cell * 0.6, cell * 1.8, cell * 1.8);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(ox + fc * cell + cell, oy + fr * cell + cell, cell - 2, cell - 2);
    }
  });
}

export function shieldShape(count: number): Float32Array {
  return sampleCanvas("shield", count, 2.8, 0.4, (ctx, w) => {
    const cx = w / 2;
    ctx.beginPath();
    ctx.moveTo(cx, 26);
    ctx.lineTo(cx + 118, 66);
    ctx.bezierCurveTo(cx + 118, 170, cx + 96, 236, cx, 282);
    ctx.bezierCurveTo(cx - 96, 236, cx - 118, 170, cx - 118, 66);
    ctx.closePath();
    ctx.fill();
    // checkmark cut
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 52, 148);
    ctx.lineTo(cx - 12, 192);
    ctx.lineTo(cx + 62, 96);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  });
}

export function skylineShape(count: number): Float32Array {
  return sampleCanvas("skyline", count, 2.8, 0.4, (ctx, w, h) => {
    const base = h - 26;
    const towers: Array<[number, number, number]> = [
      [92, 120, 150],
      [188, 90, 220],
      [286, 110, 180],
      [368, 70, 120],
    ];
    for (const [x, tw, th] of towers) ctx.fillRect(x, base - th, tw, th);
    ctx.globalCompositeOperation = "destination-out";
    for (const [x, tw, th] of towers) {
      for (let wy = base - th + 16; wy < base - 18; wy += 30) {
        for (let wx = x + 12; wx < x + tw - 14; wx += 26) {
          ctx.fillRect(wx, wy, 12, 16);
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
  });
}

export function sphereShape(count: number): Float32Array {
  const hit = cache.get("sphere");
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(777);
  const R = 1.45;
  for (let i = 0; i < count; i++) {
    if (i % 4 === 0) {
      // dense equator band
      const a = rand() * Math.PI * 2;
      const rr = R * (1.25 + rand() * 0.12);
      out[i * 3] = Math.cos(a) * rr;
      out[i * 3 + 1] = (rand() - 0.5) * 0.06;
      out[i * 3 + 2] = Math.sin(a) * rr;
    } else {
      const t = Math.acos(2 * rand() - 1);
      const p = rand() * Math.PI * 2;
      out[i * 3] = Math.sin(t) * Math.cos(p) * R;
      out[i * 3 + 1] = Math.cos(t) * R;
      out[i * 3 + 2] = Math.sin(t) * Math.sin(p) * R;
    }
  }
  cache.set("sphere", out);
  return out;
}

export function galaxyShape(count: number): Float32Array {
  const hit = cache.get("galaxy");
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(555);
  const ARMS = 3;
  for (let i = 0; i < count; i++) {
    const arm = i % ARMS;
    const t = rand();
    const r = 0.25 + t * 1.9;
    const spin = t * 3.2;
    const a = (arm / ARMS) * Math.PI * 2 + spin + (rand() - 0.5) * (0.7 - t * 0.4);
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = Math.sin(a) * r * 0.62;
    out[i * 3 + 2] = (rand() - 0.5) * (0.4 - t * 0.25);
  }
  cache.set("galaxy", out);
  return out;
}

export function scatterShape(count: number): Float32Array {
  const hit = cache.get("scatter");
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(888);
  const clusters = 7;
  for (let i = 0; i < count; i++) {
    const c = i % clusters;
    const ca = (c / clusters) * Math.PI * 2;
    const cx = Math.cos(ca) * 1.6;
    const cy = Math.sin(ca) * 1.0;
    out[i * 3] = cx + (rand() - 0.5) * 1.1;
    out[i * 3 + 1] = cy + (rand() - 0.5) * 0.8;
    out[i * 3 + 2] = (rand() - 0.5) * 1.4;
  }
  cache.set("scatter", out);
  return out;
}

/** Border band around the framed concept art. */
export function frameShape(count: number): Float32Array {
  const hit = cache.get("frame");
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(333);
  const W = 2.5;
  const H = 1.95;
  const band = 0.14;
  const perim = 2 * (W + H);
  for (let i = 0; i < count; i++) {
    let d = rand() * perim;
    let x: number;
    let y: number;
    if (d < W) {
      x = -W / 2 + d;
      y = H / 2;
    } else if (d < W + H) {
      d -= W;
      x = W / 2;
      y = H / 2 - d;
    } else if (d < 2 * W + H) {
      d -= W + H;
      x = W / 2 - d;
      y = -H / 2;
    } else {
      d -= 2 * W + H;
      x = -W / 2;
      y = -H / 2 + d;
    }
    out[i * 3] = x + (rand() - 0.5) * band;
    out[i * 3 + 1] = y + (rand() - 0.5) * band;
    out[i * 3 + 2] = (rand() - 0.5) * band * 2;
  }
  cache.set("frame", out);
  return out;
}

/** Big loose shell the field assembles from on first load. */
export function entranceShape(count: number): Float32Array {
  const hit = cache.get("entrance");
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(1);
  for (let i = 0; i < count; i++) {
    const t = Math.acos(2 * rand() - 1);
    const p = rand() * Math.PI * 2;
    const r = 5 + rand() * 4;
    out[i * 3] = Math.sin(t) * Math.cos(p) * r;
    out[i * 3 + 1] = Math.cos(t) * r * 0.7;
    out[i * 3 + 2] = Math.sin(t) * Math.sin(p) * r - 2;
  }
  cache.set("entrance", out);
  return out;
}

export function shapeForStop(key: string, heroText: string, count: number): Float32Array {
  switch (key) {
    case "hero":
      return textShape(heroText, count);
    case "about":
      return sphereShape(count);
    case "skills":
      return galaxyShape(count);
    case "ai-training":
      return chipShape(count);
    case "italy-3dgs":
      return houseShape(count);
    case "randochat":
      return bubbleShape(count);
    case "qp-link":
      return qrShape(count);
    case "constructshield":
      return shieldShape(count);
    case "realtix":
      return skylineShape(count);
    case "more":
      return scatterShape(count);
    case "contact":
      return textShape("@", count);
    default:
      return sphereShape(count);
  }
}
