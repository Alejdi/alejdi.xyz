"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Play, RotateCcw } from "lucide-react";
import type { Flagship, FlagshipChapter } from "@/data/projects";

const PHONE_PORTRAIT = "(max-width: 767px) and (orientation: portrait)";
/** Height reserved under the frame for the chapter rail. */
const RAIL_PX = 54;

type Video = NonNullable<Flagship["video"]>;

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function chapterAt(chapters: FlagshipChapter[], time: number) {
  let i = 0;
  for (let c = 0; c < chapters.length; c++) if (time >= chapters[c].start - 0.05) i = c;
  return i;
}

/**
 * The explainer film. Phones held upright get the 9:16 cut, everything else
 * the 16:9 cut (whichever exists is used everywhere if only one does). The
 * frame is sized from the container's own box (container query units), so
 * the whole film always fits on screen: no cropping, no scrolling.
 *
 * Under it, a chapter rail mirrors the scenes of the edit: segments fill as
 * the film plays, and clicking one jumps straight to that scene. Turning a
 * phone mid-film swaps cuts without losing the place.
 */
export default function FlagshipFilm({
  video,
  accent,
  title,
  active = true,
  autoPlay = false,
}: {
  video: Video;
  accent: string;
  title: string;
  /** False while the film's tab is hidden: the film pauses. */
  active?: boolean;
  /** Start as soon as it mounts (the visitor asked for the film). Falls back to the play button if the browser refuses. */
  autoPlay?: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [duration, setDuration] = useState(video.duration ?? 0);
  const ref = useRef<HTMLVideoElement>(null);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);
  const timeRef = useRef<HTMLSpanElement>(null);
  /** Where to pick up after the source changes (phone rotated mid-film). */
  const resume = useRef<{ time: number; playing: boolean } | null>(null);
  const wantsAutoPlay = useRef(autoPlay);
  const transcriptId = useId();

  const chapters = useMemo(() => video.chapters ?? [], [video.chapters]);

  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(PHONE_PORTRAIT);
    const handler = () => {
      // Remember the place before the cut swaps, so the other cut picks up from here.
      const el = ref.current;
      if (el && el.currentTime > 0) resume.current = { time: el.currentTime, playing: !el.paused };
      onChange();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const phonePortrait = useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(PHONE_PORTRAIT).matches,
    () => null,
  );

  const source =
    phonePortrait === null
      ? null
      : phonePortrait
        ? (video.portrait ?? video.landscape)
        : (video.landscape ?? video.portrait);
  const tall = source === video.portrait;

  /** Paint the rail from the element's clock. Called every frame while playing, and on seeks. */
  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const t = el.currentTime;
    const total = el.duration || duration;
    chapters.forEach((c, i) => {
      const end = chapters[i + 1]?.start ?? total;
      const f = Math.min(1, Math.max(0, (t - c.start) / (end - c.start || 1)));
      const node = fills.current[i];
      if (node) node.style.transform = `scaleX(${f})`;
    });
    if (timeRef.current) timeRef.current.textContent = clock(t);
    setChapter((prev) => {
      const next = chapterAt(chapters, t);
      return prev === next ? prev : next;
    });
  }, [chapters, duration]);

  // Smooth rail while playing (timeupdate only fires ~4 times a second).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, paint]);

  // Hidden tab: pause, keep the place.
  useEffect(() => {
    if (!active) ref.current?.pause();
  }, [active]);

  const play = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    setStarted(true);
    setEnded(false);
    try {
      await el.play();
    } catch {
      // Autoplay refused (or the source failed): hand control back to the play button.
      setStarted(false);
    }
  }, []);

  function onLoadedMetadata() {
    const el = ref.current;
    if (!el) return;
    if (Number.isFinite(el.duration)) setDuration(el.duration);
    const r = resume.current;
    resume.current = null;
    if (r) {
      el.currentTime = Math.min(r.time, el.duration || r.time);
      paint();
      if (r.playing) void play();
      return;
    }
    if (wantsAutoPlay.current) {
      wantsAutoPlay.current = false;
      void play();
    }
  }

  function seek(i: number) {
    const el = ref.current;
    if (!el) return;
    el.currentTime = chapters[i].start;
    paint();
    if (el.paused) void play();
  }

  if (!source) return <div className="h-full w-full" />;

  const ratio = tall ? 9 / 16 : 16 / 9;
  const rail = chapters.length > 1 ? RAIL_PX : 0;
  const shown = hover ?? chapter;
  const current = chapters[shown];
  const numbered = chapters.filter((c) => c.index).length;
  const total = duration || video.duration || 0;

  return (
    <div className="flex h-full w-full items-center justify-center [container-type:size]">
      <div
        className="flex flex-col"
        style={{ width: `min(100cqw, (100cqh - ${rail}px) * ${ratio})` }}
      >
        <div
          className="relative overflow-hidden rounded-xl border border-line bg-black shadow-2xl"
          style={{ aspectRatio: tall ? "9 / 16" : "16 / 9", boxShadow: `0 30px 80px -30px ${accent}55` }}
        >
          <video
            key={source.src}
            ref={ref}
            className="h-full w-full object-contain"
            controls={started}
            playsInline
            preload="metadata"
            poster={source.poster}
            aria-label={title}
            aria-describedby={chapters.length ? transcriptId : undefined}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => {
              setStarted(true);
              setEnded(false);
            }}
            onPlaying={() => setPlaying(true)}
            onPause={() => {
              setPlaying(false);
              paint();
            }}
            onSeeked={paint}
            onEnded={() => {
              setPlaying(false);
              setStarted(false);
              setEnded(true);
              paint();
              // Back to the poster: the credits card has no room for the replay button.
              ref.current?.load();
            }}
          >
            <source src={source.src} type="video/mp4" />
            {video.captions && <track kind="captions" src={video.captions} srcLang="en" label="English" />}
            Your browser can&apos;t play this video.
          </video>

          {!started && (
            <button
              onClick={play}
              aria-label={`${ended ? "Replay" : "Play"} ${title}`}
              // Sits in the empty band under the poster's title card, never over its text.
              className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/0 to-black/0"
              style={{ paddingBottom: tall ? "16%" : "3.6%" }}
            >
              <span className="flex items-center gap-3.5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 group-active:scale-95 sm:h-14 sm:w-14"
                style={{ background: accent, boxShadow: `0 0 0 7px ${accent}33, 0 16px 40px -10px ${accent}` }}
              >
                {ended ? <RotateCcw size={20} /> : <Play size={20} fill="currentColor" className="translate-x-0.5" />}
              </span>
              <span className="text-left text-[11px] font-medium uppercase leading-snug tracking-[0.2em] text-white/90">
                {ended ? "Watch again" : title}
                {!ended && total > 0 && <span className="text-white/55"> · {clock(total)}</span>}
              </span>
              </span>
            </button>
          )}
        </div>

        {rail > 0 && (
          <div className="pt-3" style={{ height: rail }}>
            <div className="flex items-baseline justify-between gap-3 text-[11px] leading-none">
              <p className="min-w-0 truncate text-bone" aria-live="polite">
                {current?.index && (
                  <span className="mr-2 font-mono tabular-nums" style={{ color: accent }}>
                    {String(current.index).padStart(2, "0")}/{String(numbered).padStart(2, "0")}
                  </span>
                )}
                {current?.title}
              </p>
              <span className="shrink-0 font-mono tabular-nums text-bone-dim">
                <span ref={timeRef}>0:00</span> / {clock(total)}
              </span>
            </div>
            <div className="mt-2.5 flex gap-1" role="group" aria-label="Chapters" onPointerLeave={() => setHover(null)}>
              {chapters.map((c, i) => {
                const end = chapters[i + 1]?.start ?? total;
                return (
                  <button
                    key={c.start}
                    onClick={() => seek(i)}
                    onPointerEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    aria-label={`${c.title}, ${clock(c.start)}`}
                    aria-current={i === chapter && started ? "step" : undefined}
                    className="group relative h-4 min-w-0 cursor-pointer"
                    style={{ flexGrow: Math.max(1, end - c.start), flexBasis: 0 }}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-bone/15 transition-[height] duration-200 group-hover:h-[5px] group-focus-visible:h-[5px]">
                      <span
                        ref={(n) => {
                          fills.current[i] = n;
                        }}
                        className="absolute inset-0 origin-left rounded-full"
                        style={{ background: accent, transform: "scaleX(0)" }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {chapters.length > 0 && (
          <div id={transcriptId} className="sr-only">
            {chapters.map((c) => `${c.title}. ${c.line ?? ""}`).join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}
