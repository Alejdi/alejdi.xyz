"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  Check,
  Code2,
  Landmark,
  Loader2,
  MousePointerClick,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Project } from "@/data/projects";
import PreventivMark from "./PreventivMark";
import FlagshipFilm from "./FlagshipFilm";

type TabId = "film" | "overview" | "live" | "hood";

const DETAIL_ICONS = [Calculator, Sparkles, MousePointerClick, Landmark, Code2, ShieldCheck];

export default function FlagshipCaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const flagship = project.flagship!;
  const accent = project.accent;
  const hasFilm = Boolean(flagship.video?.landscape || flagship.video?.portrait);

  const tabs: { id: TabId; label: string }[] = [
    ...(hasFilm ? [{ id: "film" as const, label: "Film" }] : []),
    { id: "overview", label: "Overview" },
    ...(flagship.demo ? [{ id: "live" as const, label: "Try it live" }] : []),
    { id: "hood", label: "Under the hood" },
  ];
  const [tab, setTab] = useState<TabId>(tabs[0].id);
  // The live demo is only mounted once asked for, then kept alive across tab switches.
  const [liveMounted, setLiveMounted] = useState(false);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [shared, setShared] = useState<"" | "copied" | "shared">("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const uid = useId();

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  function openTab(id: TabId) {
    setTab(id);
    if (id === "live") setLiveMounted(true);
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    openTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  async function share() {
    const url = `${window.location.origin}/#${project.id}`;
    const data = { title: `${project.name} — ${project.tagline}`, url };
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share(data);
        setShared("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShared("copied");
      }
    } catch {
      return;
    }
    window.setTimeout(() => setShared(""), 2200);
  }

  const host = project.url?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <header className="relative flex items-start gap-3 border-b border-line px-4 pb-3 pt-4 sm:items-center sm:px-6 sm:py-5 squat:py-2">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
          style={{ background: `radial-gradient(60% 100% at 15% 0%, ${accent}26, transparent 70%)` }}
          aria-hidden="true"
        />
        <PreventivMark size={40} tick={accent} className="relative mt-0.5 h-9 w-9 shrink-0 text-bone sm:mt-0 sm:h-11 sm:w-11 squat:h-8 squat:w-8" />
        <div className="relative min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-display text-2xl font-semibold leading-none tracking-tight text-bone sm:text-3xl squat:text-2xl">
              {project.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-bone-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {project.statusLabel} · {project.year}
            </span>
          </div>
          <p className="mt-1.5 text-xs font-medium sm:truncate sm:text-sm squat:hidden" style={{ color: accent }}>
            {project.tagline}
          </p>
        </div>
        <div className="relative flex shrink-0 items-center gap-2">
          <button
            onClick={share}
            className="hidden h-9 items-center gap-2 rounded-full border border-line px-3.5 text-xs text-bone transition-colors hover:border-bone/40 sm:inline-flex"
            aria-live="polite"
          >
            {shared ? <Check size={14} /> : <Share2 size={14} />}
            {shared === "copied" ? "Link copied" : shared === "shared" ? "Shared" : "Share"}
          </button>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium text-white transition-transform hover:scale-[1.03] sm:inline-flex"
              style={{ background: accent }}
            >
              Visit {host} <ArrowUpRight size={14} />
            </a>
          )}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink/70 text-bone transition-colors hover:border-bone/40"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* tabs */}
      <div role="tablist" aria-label={`${project.name} case study`} className="flex gap-1 overflow-x-auto border-b border-line px-3 [scrollbar-width:none] sm:px-5">
        {tabs.map((t, i) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              ref={(n) => {
                tabRefs.current[i] = n;
              }}
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => openTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`relative shrink-0 px-3 py-3 text-xs font-medium transition-colors sm:text-sm squat:py-2 ${
                selected ? "text-bone" : "text-bone-dim hover:text-bone"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {t.id === "live" && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: accent }} />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  </span>
                )}
                {t.label}
              </span>
              {selected && (
                <motion.span
                  layoutId={`${uid}-tab-underline`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{ background: accent }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* panels */}
      <div className="relative min-h-0 flex-1">
        {/* Kept mounted so switching tabs pauses the film instead of rewinding it.
            Opening the case study is always a click on "Watch the film", so it starts at once. */}
        {hasFilm && (
          <section
            role="tabpanel"
            id={`${uid}-panel-film`}
            aria-labelledby={`${uid}-tab-film`}
            hidden={tab !== "film"}
            className="absolute inset-0 p-3 sm:p-6 squat:p-2"
          >
            <FlagshipFilm
              video={flagship.video!}
              accent={accent}
              title={`How ${project.name} works`}
              active={tab === "film"}
              autoPlay
            />
          </section>
        )}

        {tab === "overview" && (
          <section
            role="tabpanel"
            id={`${uid}-panel-overview`}
            aria-labelledby={`${uid}-tab-overview`}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
              <div>
                <p className="text-balance text-sm leading-relaxed text-bone-dim sm:text-base">{project.description}</p>

                <h4 className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-bone-dim">How it works</h4>
                <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                  {flagship.steps.map((step, i) => (
                    <li key={step.title} className="rounded-xl border border-line bg-ink/50 p-4">
                      <span className="font-mono text-[11px]" style={{ color: accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h5 className="mt-2 text-sm font-medium text-bone">{step.title}</h5>
                      <p className="mt-1.5 text-xs leading-relaxed text-bone-dim">{step.body}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-bone-dim">
                  <span className="uppercase tracking-[0.12em]">Role</span>
                  <span className="text-bone">{project.role}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-bone-dim">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <aside>
                <dl className="grid grid-cols-3 gap-4 rounded-xl border border-line p-4">
                  {flagship.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse justify-end">
                      <dt className="mt-1 text-[10px] uppercase leading-tight tracking-wide text-bone-dim">{stat.label}</dt>
                      <dd className="font-display text-2xl font-semibold tabular-nums text-bone sm:text-3xl">
                        {stat.value.toLocaleString("en-US")}
                        {stat.suffix}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 rounded-xl border border-line bg-ink/50 font-mono text-[11px] sm:text-xs">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5 uppercase tracking-[0.18em] text-bone-dim">
                    <span>Specification</span>
                    <span style={{ color: accent }}>●</span>
                  </div>
                  <dl className="space-y-2.5 px-4 py-4">
                    {flagship.spec.map((row) => (
                      <div key={row.label} className="flex items-baseline gap-2">
                        <dt className="shrink-0 text-bone-dim">{row.label}</dt>
                        <span className="spec-leader" aria-hidden="true" />
                        <dd className="text-right text-bone">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="grid grid-cols-2 border-t border-line text-[10px] uppercase tracking-[0.14em] text-bone-dim">
                    <div className="border-r border-line px-4 py-2.5">
                      Engine <span className="block normal-case tracking-normal text-bone">@preventiv/calc</span>
                    </div>
                    <div className="px-4 py-2.5">
                      Scale <span className="block normal-case tracking-normal text-bone">1 : 1</span>
                    </div>
                  </div>
                </div>

                {flagship.demo && (
                  <button
                    onClick={() => openTab("live")}
                    className="group mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors"
                    style={{ borderColor: `${accent}55`, background: `${accent}12` }}
                  >
                    <span>
                      <span className="block text-sm font-medium text-bone">Try the real estimator</span>
                      <span className="block text-xs text-bone-dim">Live from preventiv.app, right inside this page</span>
                    </span>
                    <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: accent }} />
                  </button>
                )}
              </aside>
            </div>
          </section>
        )}

        {flagship.demo && liveMounted && (
          <section
            role="tabpanel"
            id={`${uid}-panel-live`}
            aria-labelledby={`${uid}-tab-live`}
            hidden={tab !== "live"}
            className="absolute inset-0 flex flex-col gap-3 p-3 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[11px] leading-snug text-bone-dim sm:text-xs">{flagship.demo.note}</p>
              <a
                href={flagship.demo.url.replace("embed=1&", "")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs text-bone transition-colors hover:text-(--accent)"
                style={{ ["--accent" as string]: accent }}
              >
                Open full screen <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-[#f6f5f1]">
              {!liveLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-raised text-bone-dim">
                  <Loader2 size={20} className="animate-spin" style={{ color: accent }} />
                  <span className="text-xs">Connecting to preventiv.app…</span>
                </div>
              )}
              <iframe
                src={flagship.demo.url}
                title={`${project.name} live estimator`}
                onLoad={() => setLiveLoaded(true)}
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        )}

        {tab === "hood" && (
          <section
            role="tabpanel"
            id={`${uid}-panel-hood`}
            aria-labelledby={`${uid}-tab-hood`}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <div className="p-5 sm:p-8">
              <p className="max-w-2xl text-sm leading-relaxed text-bone-dim">
                The parts nobody sees in a screenshot, and the reason the numbers can be trusted.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {flagship.details.map((d, i) => {
                  const Icon = DETAIL_ICONS[i % DETAIL_ICONS.length];
                  return (
                    <motion.li
                      key={d.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="group rounded-xl border border-line bg-ink/50 p-5 transition-colors hover:border-bone/20"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: `${accent}1a`, color: accent }}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="font-mono text-[10px] text-bone-dim">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h5 className="mt-4 text-sm font-medium text-bone">{d.title}</h5>
                      <p className="mt-2 text-xs leading-relaxed text-bone-dim">{d.body}</p>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* mobile action bar */}
      <div className="flex gap-2 border-t border-line p-3 sm:hidden">
        <button
          onClick={share}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-line text-xs text-bone"
          aria-live="polite"
        >
          {shared ? <Check size={14} /> : <Share2 size={14} />}
          {shared === "copied" ? "Link copied" : shared === "shared" ? "Shared" : "Share"}
        </button>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-full text-xs font-medium text-white"
            style={{ background: accent }}
          >
            Visit {host} <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
