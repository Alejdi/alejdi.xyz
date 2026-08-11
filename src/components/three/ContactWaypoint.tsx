"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { profile } from "@/data/profile";
import { stopByKey, stopCenterZ, VIEW_DEPTH } from "@/data/journey";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import HtmlFade from "./HtmlFade";

export default function ContactWaypoint() {
  const stop = stopByKey("contact");
  const z = stopCenterZ(stop);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — link below still works
    }
  }

  return (
    <group position={[0, 0, z]}>
    <group position={[0, 0, -VIEW_DEPTH]}>
      <HtmlFade stop={stop} position={[0, 0.1, 0]} center style={{ width: "min(92vw, 640px)", textAlign: "center" }}>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-violet">
          04 — Contact
        </span>
        <h2 className="mx-auto mt-6 max-w-lg text-balance font-display text-3xl font-semibold leading-[1.05] text-bone sm:text-5xl">
          Got something worth building? Let&apos;s talk.
        </h2>

        <div className="mt-10 flex flex-col items-center gap-6">
          <button
            onClick={copyEmail}
            className="group inline-flex items-center gap-3 border-b border-line pb-2 text-lg font-medium text-bone transition-colors hover:border-violet hover:text-violet sm:text-2xl"
          >
            {profile.email}
            {copied ? (
              <Check size={18} className="text-emerald-400" />
            ) : (
              <Copy size={18} className="opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>

          <div className="flex items-center gap-4">
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

        <p className="mt-14 text-[11px] text-bone-dim">
          © 2026 {profile.name}. All rights reserved.
        </p>
      </HtmlFade>
    </group>
    </group>
  );
}
