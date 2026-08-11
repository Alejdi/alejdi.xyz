"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Loads a texture imperatively instead of via drei's suspense-based
 * useTexture. A missing/failed image just resolves to null so callers can
 * skip rendering — it never throws and never takes down the whole canvas.
 */
export function useSafeTexture(url: string | undefined) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        // Missing or failed to load — leave texture as null.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
