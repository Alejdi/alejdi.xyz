"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";
import type { Project } from "@/data/projects";
import { PAGES, stopByKey } from "@/data/journey";

type ScrollApi = {
  el: HTMLElement | null;
  pages: number;
};

type ExperienceContextValue = {
  openProject: (project: Project) => void;
  activeProject: Project | null;
  closeProject: () => void;
  registerScrollApi: (api: ScrollApi) => void;
  getScrollApi: () => ScrollApi;
  jumpToStop: (key: string) => void;
  ready: boolean;
  setReady: (v: boolean) => void;
  /** Stops whose concept art loaded — the particle field frames these instead of forming an icon. */
  markArt: (key: string) => void;
  hasArt: (key: string) => boolean;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [ready, setReady] = useState(false);
  const scrollApiRef = useRef<ScrollApi>({ el: null, pages: PAGES });

  const registerScrollApi = useCallback((api: ScrollApi) => {
    scrollApiRef.current = api;
  }, []);

  const getScrollApi = useCallback(() => scrollApiRef.current, []);

  const artRef = useRef<Set<string>>(new Set());
  const markArt = useCallback((key: string) => {
    artRef.current.add(key);
  }, []);
  const hasArt = useCallback((key: string) => artRef.current.has(key), []);

  const jumpToStop = useCallback((key: string) => {
    const { el, pages } = scrollApiRef.current;
    if (!el) return;
    const stop = stopByKey(key);
    const targetOffset = (stop.start + stop.length / 2) / pages;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: Math.max(0, targetOffset) * max, behavior: "smooth" });
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        openProject: setActiveProject,
        activeProject,
        closeProject: () => setActiveProject(null),
        registerScrollApi,
        getScrollApi,
        jumpToStop,
        ready,
        setReady,
        markArt,
        hasArt,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used within ExperienceProvider");
  return ctx;
}
