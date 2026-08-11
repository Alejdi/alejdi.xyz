"use client";

import { useRef, useMemo, type ReactNode, type CSSProperties } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useScroll } from "@react-three/drei";
import type { Stop } from "@/data/journey";
import { stopVisibility } from "@/lib/three-utils";

export default function HtmlFade({
  stop,
  position,
  children,
  style,
  className,
  rise = 24,
  center = false,
  alignRight = false,
}: {
  stop: Stop;
  position: [number, number, number];
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  rise?: number;
  /** Horizontally centers the panel on its 3D anchor instead of the default left-anchor. */
  center?: boolean;
  /** Extends the panel leftward from its anchor — for panels on the right side of the screen. */
  alignRight?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { camera } = useThree();
  const viewportWidth = useThree((state) => state.size.width);
  const mobile = viewportWidth < 768;
  const scroll = useScroll();
  // Bare <Html> portals via events.connected, which ScrollControls points at
  // its scrolling element — that double-applies scroll offset on top of our
  // own camera-driven projection. Force the portal target to the sticky,
  // scroll-stable div instead (the same one drei's own <Scroll html> uses).
  const portal = useMemo(() => ({ current: scroll.fixed }), [scroll.fixed]);

  // On mobile every panel centers on screen and sits in the lower half,
  // leaving the upper half to the particle shape.
  const anchor: [number, number, number] = mobile
    ? [0, position[1] - 0.62, position[2]]
    : position;

  useFrame(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const v = stopVisibility(camera, stop);
    el.style.opacity = String(v);
    const xShift = mobile || center ? "translateX(-50%) " : alignRight ? "translateX(-100%) " : "";
    // translateY combines vertical centering on the anchor with the rise-in animation
    el.style.transform = `${xShift}translateY(calc(-50% + ${(1 - v) * rise}px))`;
    el.style.pointerEvents = v > 0.6 ? "auto" : "none";
  });

  return (
    <Html position={anchor} center={false} zIndexRange={[10, 0]} portal={portal}>
      <div
        ref={wrapperRef}
        className={className}
        style={{
          opacity: 0,
          willChange: "opacity, transform",
          textShadow: "0 2px 24px rgba(8,7,10,0.85)",
          ...style,
        }}
      >
        {children}
      </div>
    </Html>
  );
}
