"use client";

import { Billboard } from "@react-three/drei";
import { profile } from "@/data/profile";
import { stopByKey, stopCenterZ, VIEW_DEPTH } from "@/data/journey";
import { useLayoutScale } from "@/lib/use-layout-scale";
import { useSafeTexture } from "@/lib/use-safe-texture";
import HtmlFade from "./HtmlFade";

const FACTS = [
  { label: "Based in", value: profile.location },
  { label: "Focus", value: "AI training, full-stack products, 3D capture" },
  { label: "Currently", value: "Validating new ventures before scaling them" },
  { label: "Approach", value: "Ship fast, prove demand, then go deep" },
];

export default function AboutWaypoint() {
  const stop = stopByKey("about");
  const z = stopCenterZ(stop);
  const s = useLayoutScale();
  const portrait = useSafeTexture("/images/profile.jpg");

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      {/* Portrait floats at the center of the particle sphere's orbit. */}
      {portrait && (
        <Billboard
          position={s < 1 ? [0, 1.32, -0.6] : [2.4 * s, 0, 0]}
          scale={s < 1 ? 0.62 : 1}
        >
          <mesh>
            <circleGeometry args={[0.78, 48]} />
            <meshBasicMaterial map={portrait} toneMapped={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.78, 0.83, 48]} />
            <meshBasicMaterial color="#f3f1ea" toneMapped={false} transparent opacity={0.85} />
          </mesh>
        </Billboard>
      )}

      <HtmlFade stop={stop} position={[-2.5 * s, 0, 0]} style={{ width: "min(90vw, 460px)" }}>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-violet">
          01 — About
        </span>
        <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-bone sm:text-4xl">
          Business first. Code second — but code that actually ships.
        </h2>
        <p className="mt-5 max-w-md text-balance text-sm leading-relaxed text-bone-dim">
          {profile.summary}
        </p>
        <dl className="mt-8 grid max-w-md grid-cols-2 gap-5 border-t border-line pt-5">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[10px] uppercase tracking-[0.15em] text-bone-dim">
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-xs text-bone">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </HtmlFade>
    </group>
    </group>
  );
}
