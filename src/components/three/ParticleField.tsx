"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STOPS, stopCenterZ, VIEW_DEPTH, type Stop } from "@/data/journey";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { mulberry32 } from "@/lib/three-utils";
import { clearTextShapeCache, entranceShape, frameShape, shapeForStop } from "@/lib/particle-shapes";
import { useExperience } from "@/lib/experience-context";
import { useLayoutScale } from "@/lib/use-layout-scale";

const COUNT = 40000;

const HERO_TEXT = `${(profile.name.split(" ")[0] ?? "A").toUpperCase()}.`;

type StopMeta = { color: string; x: number; zExtra: number; dim: number; spin: number; amp: number };

const PROJECT_ACCENTS = new Map(projects.map((p) => [p.id, p.accent]));

function metaForStop(stop: Stop): StopMeta {
  if (stop.kind === "project") {
    const side = (stop.projectIndex ?? 0) % 2 === 0 ? 1 : -1;
    return {
      color: PROJECT_ACCENTS.get(stop.key) ?? "#8b7bff",
      x: side * 2.2,
      zExtra: 0,
      dim: 1,
      // icons stay mostly face-on so they read; gentle breathing only
      spin: 0.14,
      amp: 0.15,
    };
  }
  switch (stop.key) {
    case "hero":
      return { color: "#8b7bff", x: 1.7, zExtra: 0, dim: 1, spin: 0.1, amp: 0.08 };
    case "about":
      return { color: "#f3f1ea", x: 2.4, zExtra: 0, dim: 0.85, spin: 0.5, amp: 0.5 };
    case "skills":
      return { color: "#22d3ee", x: 2.2, zExtra: 0, dim: 1, spin: 0.6, amp: 0.5 };
    case "more":
      return { color: "#a78bfa", x: 0, zExtra: -2.6, dim: 0.4, spin: 0.35, amp: 0.45 };
    case "contact":
      return { color: "#8b7bff", x: 0, zExtra: -2.2, dim: 0.5, spin: 0.12, amp: 0.08 };
    default:
      return { color: "#8b7bff", x: 0, zExtra: 0, dim: 1, spin: 0.3, amp: 0.3 };
  }
}

const VERTEX = /* glsl */ `
  attribute vec3 aTo;
  attribute vec4 aRand; // x: morph delay, y: size, z: spark, w: seed
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  varying float vSpark;
  varying float vFade;

  void main() {
    float d = aRand.x * 0.35;
    float e = smoothstep(0.0, 1.0, clamp((uMorph - d) / 0.65, 0.0, 1.0));
    vec3 pos = mix(position, aTo, e);

    // idle organic drift
    pos += 0.05 * vec3(
      sin(uTime * 0.6 + aRand.w * 17.0),
      cos(uTime * 0.5 + aRand.w * 29.0),
      sin(uTime * 0.7 + aRand.w * 11.0)
    );

    // swirl hardest mid-flight, settling as the shape locks in
    float mid = e * (1.0 - e) * 4.0;
    pos += mid * 0.55 * vec3(
      sin(uTime * 2.1 + aRand.w * 40.0),
      cos(uTime * 1.7 + aRand.w * 23.0),
      sin(uTime * 1.3 + aRand.w * 31.0)
    );

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // cursor repulsion in screen space
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 away = ndc - uMouse;
    float dist = length(away);
    float rep = smoothstep(0.38, 0.0, dist);
    mv.xy += normalize(away + vec2(1e-4)) * rep * 0.5;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.2 + aRand.y * 3.4) * uPixelRatio * clamp(5.5 / -mv.z, 0.3, 2.2);

    vSpark = step(0.9, aRand.z) * (0.6 + 0.4 * sin(uTime * 3.0 + aRand.w * 50.0));
    vFade = 0.55 + 0.45 * e;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDim;
  varying float vSpark;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, d);
    vec3 col = mix(uColor, vec3(1.0), vSpark * 0.85);
    gl_FragColor = vec4(col * (1.0 + vSpark), alpha * 0.55 * uDim * vFade);
  }
`;

type Store = {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  fromArr: Float32Array;
  toArr: Float32Array;
  delayArr: Float32Array;
  activeKey: string;
  morph: number;
  colorFrom: THREE.Color;
  colorTo: THREE.Color;
  dimTarget: number;
  spinSpeed: number;
  spinPhase: number;
};

function buildStore(): Store {
  const geometry = new THREE.BufferGeometry();
  const fromArr = new Float32Array(entranceShape(COUNT));
  const toArr = new Float32Array(COUNT * 3);
  const rnd = new Float32Array(COUNT * 4);
  const rand = mulberry32(2026);
  for (let i = 0; i < COUNT; i++) {
    rnd[i * 4] = rand();
    rnd[i * 4 + 1] = Math.pow(rand(), 2.2);
    rnd[i * 4 + 2] = rand();
    rnd[i * 4 + 3] = rand() * 100;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(fromArr, 3));
  geometry.setAttribute("aTo", new THREE.BufferAttribute(toArr, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#8b7bff") },
      uDim: { value: 1 },
    },
  });

  const delayArr = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) delayArr[i] = rnd[i * 4];

  return {
    geometry,
    material,
    fromArr,
    toArr,
    delayArr,
    activeKey: "__none__",
    morph: 0,
    colorFrom: new THREE.Color("#8b7bff"),
    colorTo: new THREE.Color("#8b7bff"),
    dimTarget: 1,
    spinSpeed: 0.1,
    spinPhase: 0,
  };
}

export default function ParticleField() {
  const { hasArt } = useExperience();
  const s = useLayoutScale();
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const storeRef = useRef<Store | null>(null);
  // The r3f pointer defaults to (0,0) — dead center in NDC — which would fire
  // phantom repulsion into whatever shape sits near the middle of the screen.
  // Only trust the pointer after the user has actually moved it.
  const pointerActive = useRef(false);

  useEffect(() => {
    const activate = () => {
      pointerActive.current = true;
    };
    window.addEventListener("pointermove", activate, { once: true, passive: true });

    // If the display font loads after the first sampling, glyph shapes were
    // drawn with the fallback — resample and re-morph once fonts are in.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !storeRef.current) return;
      clearTextShapeCache();
      storeRef.current.activeKey = "__refresh__";
    });

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", activate);
    };
  }, []);

  useFrame((state, delta) => {
    if (storeRef.current === null) storeRef.current = buildStore();
    const st = storeRef.current;
    if (!group.current || !points.current) return;

    // attach the shader geometry/material once, imperatively
    if (points.current.geometry !== st.geometry) {
      points.current.geometry = st.geometry;
      points.current.material = st.material;
    }
    const camZ = state.camera.position.z;

    // nearest stop to the camera
    let best: Stop = STOPS[0];
    let bestDist = Infinity;
    for (const stop of STOPS) {
      const dist = Math.abs(stopCenterZ(stop) - camZ);
      if (dist < bestDist) {
        bestDist = dist;
        best = stop;
      }
    }

    if (best.key !== st.activeKey) {
      st.activeKey = best.key;
      const meta = metaForStop(best);
      const framed = best.kind === "project" && hasArt(best.key);
      const target = framed ? frameShape(COUNT) : shapeForStop(best.key, HERO_TEXT, COUNT);

      // bake current interpolated positions into the from-buffer, then aim at the new shape
      const m = st.morph;
      for (let i = 0; i < COUNT; i++) {
        const d = st.delayArr[i] * 0.35;
        let t = (m - d) / 0.65;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const e = t * t * (3 - 2 * t);
        const j = i * 3;
        st.fromArr[j] += (st.toArr[j] - st.fromArr[j]) * e;
        st.fromArr[j + 1] += (st.toArr[j + 1] - st.fromArr[j + 1]) * e;
        st.fromArr[j + 2] += (st.toArr[j + 2] - st.fromArr[j + 2]) * e;
      }
      st.toArr.set(target);
      st.geometry.attributes.position.needsUpdate = true;
      st.geometry.attributes.aTo.needsUpdate = true;
      st.morph = 0;

      st.colorFrom.copy(st.material.uniforms.uColor.value as THREE.Color);
      st.colorTo.set(meta.color);
      st.dimTarget = meta.dim;
      st.spinSpeed = meta.spin;
    }

    const meta = metaForStop(best);

    // advance morph with an ease-out feel
    st.morph = Math.min(1, st.morph + delta * (0.55 + (1 - st.morph) * 0.9));
    st.material.uniforms.uMorph.value = st.morph;
    st.material.uniforms.uTime.value = state.clock.elapsedTime;
    st.material.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);
    if (pointerActive.current) {
      st.material.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
    }

    (st.material.uniforms.uColor.value as THREE.Color)
      .copy(st.colorFrom)
      .lerp(st.colorTo, Math.min(1, st.morph * 1.4));
    st.material.uniforms.uDim.value +=
      (st.dimTarget - st.material.uniforms.uDim.value) * Math.min(1, delta * 3);

    // follow the camera; glide sideways toward the stop's slot.
    // Mobile: shape lives centered in the upper third, text takes the lower half.
    const mobile = s < 1;
    const targetX = mobile ? 0 : meta.x * s;
    const glide = 1 - Math.pow(0.002, delta);
    group.current.position.x += (targetX - group.current.position.x) * glide;
    group.current.position.y = mobile ? 1.32 : 0;
    group.current.position.z = camZ - VIEW_DEPTH + (mobile ? meta.zExtra * 0.4 - 0.6 : meta.zExtra);
    group.current.scale.setScalar(mobile ? 0.58 : 1);

    // gentle oscillating spin — amplitude tuned per shape so glyphs stay readable
    st.spinPhase += delta * st.spinSpeed;
    group.current.rotation.y = Math.sin(st.spinPhase) * meta.amp;
  });

  return (
    <group ref={group}>
      <points ref={points} frustumCulled={false} />
    </group>
  );
}
