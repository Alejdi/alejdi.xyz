"use client";

import { useEffect } from "react";
import { useScroll } from "@react-three/drei";
import { useExperience } from "@/lib/experience-context";

export default function ScrollApiBridge() {
  const scroll = useScroll();
  const { registerScrollApi, setReady } = useExperience();

  useEffect(() => {
    registerScrollApi({ el: scroll.el, pages: scroll.pages });
    setReady(true);
  }, [scroll.el, scroll.pages, registerScrollApi, setReady]);

  return null;
}
