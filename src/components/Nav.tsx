"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { profile } from "@/data/profile";
import { STOPS } from "@/data/journey";
import { useExperience } from "@/lib/experience-context";

const LINKS = [
  { key: STOPS.find((s) => s.kind === "project")!.key, label: "Work" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "contact", label: "Contact" },
];

export default function Nav() {
  const { jumpToStop } = useExperience();
  const [open, setOpen] = useState(false);

  function go(key: string) {
    setOpen(false);
    jumpToStop(key);
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/60 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <button
          onClick={() => go("hero")}
          className="font-display text-lg font-semibold tracking-tight text-bone"
        >
          {profile.name.split(" ")[0]}
          <span className="text-violet">.</span>
        </button>

        <ul className="hidden items-center gap-10 md:flex">
          {LINKS.map((link) => (
            <li key={link.key}>
              <button
                onClick={() => go(link.key)}
                className="text-xs font-medium uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => go("contact")}
          className="hidden rounded-full border border-line px-5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-bone transition-colors hover:border-violet hover:text-violet md:inline-block"
        >
          Let&apos;s talk
        </button>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-bone md:hidden"
        >
          <Menu size={17} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex h-svh flex-col items-center justify-center gap-3 bg-ink/95 backdrop-blur-xl md:hidden"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-6 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-line text-bone"
            >
              <X size={17} />
            </button>

            {LINKS.map((link, i) => (
              <motion.button
                key={link.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => go(link.key)}
                className="py-2 font-display text-4xl font-semibold text-bone transition-colors active:text-violet"
              >
                {link.label}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={() => go("contact")}
              className="mt-6 rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink"
            >
              Let&apos;s talk
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
