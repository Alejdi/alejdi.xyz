"use client";

import { Component, type ReactNode } from "react";
import { profile } from "@/data/profile";
import { GithubIcon, LinkedinIcon } from "@/components/icons";

type Props = { children: ReactNode };
type State = { failed: boolean };

/**
 * WebGL isn't guaranteed — disabled hardware acceleration, locked-down
 * corporate browsers, some privacy modes, or a stale context after a dev
 * hot-reload can all make the canvas throw. This keeps the site usable
 * (and the contact info reachable) instead of a blank crashed page.
 */
export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D experience failed to load, showing fallback:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center bg-ink px-6 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-violet">
          {profile.role} — {profile.location}
        </span>
        <h1 className="mt-6 max-w-xl text-balance font-display text-4xl font-semibold leading-tight text-bone sm:text-5xl">
          {profile.name}
        </h1>
        <p className="mt-6 max-w-md text-balance text-sm leading-relaxed text-bone-dim">
          {profile.summary}
        </p>
        <p className="mt-4 text-xs text-bone-dim">
          The interactive 3D view couldn&apos;t load in this browser — here&apos;s the essentials
          instead.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-8 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
        >
          {profile.email}
        </a>
        <div className="mt-6 flex items-center gap-4">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone-dim transition-colors hover:border-violet hover:text-violet"
            aria-label="GitHub"
          >
            <GithubIcon size={16} />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone-dim transition-colors hover:border-violet hover:text-violet"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={16} />
          </a>
        </div>
      </div>
    );
  }
}
