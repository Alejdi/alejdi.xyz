"use client";

import { Sparkles } from "@react-three/drei";
import { PAGE_DEPTH, PAGES } from "@/data/journey";

export default function Dust() {
  const depth = PAGES * PAGE_DEPTH;
  return (
    <Sparkles
      count={220}
      scale={[10, 6, depth]}
      position={[0, 0, -depth / 2 + 5]}
      size={1.4}
      speed={0.15}
      opacity={0.35}
      color="#f3f1ea"
      noise={1}
    />
  );
}
