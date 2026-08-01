"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CinematicQuote {
  readonly speaker?: string;
  readonly quote: string;
}

interface CinematicCastMember {
  readonly name: string;
  readonly role?: string;
}

interface CinematicScene {
  readonly act?: string;
  readonly title: string;
  readonly description?: string;
}

interface CinematicConfig {
  readonly showFilmstrip?: boolean;
  readonly showQuotes?: boolean;
  readonly showCredits?: boolean;
  readonly showScenes?: boolean;
}

interface CinematicProps extends TemplateProps {
  readonly quotes?: CinematicQuote[];
  readonly cast?: CinematicCastMember[];
  readonly scenes?: CinematicScene[];
  readonly config?: CinematicConfig;
  readonly onQuotesChange?: (quotes: CinematicQuote[]) => void;
  readonly onCastChange?: (cast: CinematicCastMember[]) => void;
  readonly onScenesChange?: (scenes: CinematicScene[]) => void;
  readonly filmstripCaptions?: string[];
  readonly onFilmstripCaptionsChange?: (captions: string[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_QUOTES: CinematicQuote[] = [
  { speaker: "", quote: "Say that again — I want to remember it exactly like that." },
];

const DEFAULT_CAST: CinematicCastMember[] = [{ name: "You", role: "Lead" }];

const DEFAULT_SCENES: CinematicScene[] = [
  { act: "SCENE 01", title: "The Setup", description: "How the evening began." },
  { act: "SCENE 02", title: "The Moment", description: "What actually happened." },
  { act: "SCENE 03", title: "The Afterglow", description: "How it felt after." },
];

const DEFAULT_CONFIG: Required<CinematicConfig> = {
  showFilmstrip: true,
  showQuotes: true,
  showCredits: true,
  showScenes: true,
};

// Module-level counter for stable React keys
let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

// Max filmstrip images — falls back to 6 if env var is absent or invalid
const MAX_FILMSTRIP_IMAGES = Math.max(1, Number(process.env.NEXT_PUBLIC_MAX_GALLERY_IMAGES) || 6);

// Lightbox navigation helpers
const prevPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p > 0 ? p - 1 : len - 1;
const nextPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p < len - 1 ? p + 1 : 0;

// Fake SRT-style timecode for the Nth subtitle line — purely decorative rhythm, not a real clock
const timecodeFor = (i: number) => {
  const totalSeconds = 4 + i * 11;
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `00:${m}:${s}`;
};

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Film-leader countdown divider ──────────────────────────────────────────────
// Reads as an actual projectionist's countdown circle between reels, not a generic rule.

function ReelDivider({ n, label }: Readonly<{ n: number; label: string }>) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 px-6">
      <div className="flex-1 h-px bg-white/10" />
      <div className="relative w-8 h-8 rounded-full border border-white/15 flex items-center justify-center shrink-0">
        <div className="absolute w-full h-px bg-white/15" />
        <div className="absolute h-full w-px bg-white/15" />
        <span className="relative text-[10px] font-mono text-white/40 bg-[#050505] px-0.5">{n}</span>
      </div>
      <span className="text-[9px] font-mono text-white/25 uppercase tracking-[0.25em] shrink-0">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Filmstrip Gallery — continuous 35mm tape, not a card row ───────────────────

const sprocketTape = {
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.12) 6px 10px)",
  backgroundSize: "16px 3px",
  backgroundRepeat: "repeat-x",
};

function FilmstripSection({
  images,
  editMode,
  onImageSlotClick,
  captions = [],
  onCaptionsChange,
}: Readonly<{
  images: readonly string[];
  editMode?: boolean;
  onImageSlotClick?: (index: number) => void;
  captions?: string[];
  onCaptionsChange?: (captions: string[]) => void;
}>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [localCaptions, setLocalCaptions] = useState<string[]>(captions);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const updateCaption = (i: number, val: string) => {
    const next = [...localCaptions];
    next[i] = val;
    setLocalCaptions(next);
    onCaptionsChange?.(next);
  };

  const canAdd = editMode && images.length < MAX_FILMSTRIP_IMAGES;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxIndex(null); return; }
      if (e.key === "ArrowLeft") { setLightboxIndex((p) => prevPhoto(p, images.length)); return; }
      if (e.key === "ArrowRight") { setLightboxIndex((p) => nextPhoto(p, images.length)); }
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [lightboxIndex, images.length]);

  if (images.length === 0 && !editMode) return null;

  return (
    <div ref={ref}>
      {/* Top sprocket tape — bleeds full width */}
      <div className="h-2.5 bg-[#0a0a0a]" style={sprocketTape} />

      <motion.div
        className="flex gap-0.5 overflow-x-auto bg-[#0a0a0a] py-1"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {images.map((src, i) => (
          <motion.div key={src} variants={fadeUp} className="relative flex-shrink-0 w-32 border-x border-black/60">
            <button
              type="button"
              className="block w-full text-left focus:outline-none"
              onClick={() => setLightboxIndex(i)}
              aria-label={`View frame ${i + 1} in lightbox`}
            >
              <PhotoSlot
                src={src}
                label={`Frame ${i + 1}`}
                editMode={editMode}
                onSlotClick={() => onImageSlotClick?.(i)}
                className="w-full aspect-square bg-neutral-900 grayscale-[0.15] contrast-[1.05]"
              />
            </button>
            {/* Frame number burned into the corner like a print edge-code */}
            <span className="absolute bottom-1 left-1.5 text-[8px] font-mono text-white/50 bg-black/50 px-1 pointer-events-none">
              FR.{String(i + 1).padStart(2, "0")}
            </span>
            {editMode ? (
              <input
                value={localCaptions[i] ?? ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="caption…"
                className="bg-[#0a0a0a] text-[9px] text-rose-200/50 placeholder-white/15 outline-none w-full text-center py-1"
              />
            ) : (
              localCaptions[i] && (
                <p className="text-[9px] text-rose-200/50 text-center py-1 truncate bg-[#0a0a0a]">
                  {localCaptions[i]}
                </p>
              )
            )}
          </motion.div>
        ))}

        {canAdd && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => onImageSlotClick?.(images.length)}
            className="flex-shrink-0 w-32 aspect-square border-x border-dashed border-white/15 hover:border-white/40 flex flex-col items-center justify-center gap-1.5 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Add frame"
          >
            <Plus size={18} />
            <span className="text-[9px] uppercase tracking-widest">{images.length}/{MAX_FILMSTRIP_IMAGES}</span>
          </motion.button>
        )}
      </motion.div>

      {/* Bottom sprocket tape */}
      <div className="h-2.5 bg-[#0a0a0a]" style={sprocketTape} />

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`Frame ${lightboxIndex + 1}`}
              className="object-contain"
              style={{ maxWidth: "88vw", maxHeight: "80vh" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => prevPhoto(p, images.length)); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Previous frame"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => nextPhoto(p, images.length)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next frame"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Honest Talk — rendered as an actual subtitle track (.srt-style), not quote cards ──

function QuotesSection({
  quotes: initialQuotes,
  editMode,
  onQuotesChange,
}: Readonly<{
  quotes: CinematicQuote[];
  editMode?: boolean;
  onQuotesChange?: (quotes: CinematicQuote[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<CinematicQuote & { _k: string }>>(() =>
    initialQuotes.map((q) => ({ ...q, _k: genKey("qt") }))
  );

  const update = (next: Array<CinematicQuote & { _k: string }>) => {
    setItems(next);
    onQuotesChange?.(next.map(({ speaker, quote }) => ({ speaker, quote })));
  };

  const updateItem = (i: number, patch: Partial<CinematicQuote>) =>
    update(items.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-6 pb-2" ref={ref}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em]">01 · Honest Talk</span>
        <span className="text-[9px] font-mono text-white/15">[subtitles.srt]</span>
      </div>
      <motion.div className="space-y-px" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {items.map((q, i) => (
          <motion.div
            key={q._k}
            variants={fadeUp}
            className="group relative bg-black/40 border-l-2 border-rose-300/25 px-4 py-3 hover:border-rose-300/50 transition-colors"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[9px] font-mono text-rose-300/40 tabular-nums">{timecodeFor(i)}</span>
              {editMode ? (
                <input
                  value={q.speaker ?? ""}
                  onChange={(e) => updateItem(i, { speaker: e.target.value })}
                  placeholder="SPEAKER"
                  className="bg-transparent text-[9px] text-white/40 uppercase tracking-widest outline-none flex-1 focus:ring-1 focus:ring-white/10 rounded placeholder-white/15"
                />
              ) : (
                q.speaker && <span className="text-[9px] text-white/40 uppercase tracking-widest">{q.speaker}</span>
              )}
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  className="ml-auto text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove line"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {editMode ? (
              <textarea
                value={q.quote}
                onChange={(e) => updateItem(i, { quote: e.target.value })}
                placeholder="What was said…"
                rows={2}
                className="bg-transparent text-[15px] text-center text-[#f4f0ec] leading-snug w-full outline-none resize-none focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
              />
            ) : (
              <p className="text-[15px] text-center text-[#f4f0ec] leading-snug">{q.quote}</p>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => update([...items, { speaker: "", quote: "", _k: genKey("qt") }])}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors pt-3"
          >
            <Plus size={14} />
            <span className="text-xs">Add line</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Cast — an actual end-credits crawl, not a bordered list ────────────────────

function CastSection({
  cast: initialCast,
  editMode,
  onCastChange,
}: Readonly<{
  cast: CinematicCastMember[];
  editMode?: boolean;
  onCastChange?: (cast: CinematicCastMember[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<CinematicCastMember & { _k: string }>>(() =>
    initialCast.map((c) => ({ ...c, _k: genKey("cast") }))
  );

  const update = (next: Array<CinematicCastMember & { _k: string }>) => {
    setItems(next);
    onCastChange?.(next.map(({ name, role }) => ({ name, role })));
  };

  const updateItem = (i: number, patch: Partial<CinematicCastMember>) =>
    update(items.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  // Auto-scrolling crawl only kicks in once there's enough cast to actually look like credits
  const shouldCrawl = !editMode && items.length > 4;
  const crawlDuration = Math.max(8, items.length * 2.2);

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="pb-2" ref={ref}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em]">02 · Cast</span>
      </div>
      <div
        className="relative overflow-hidden"
        style={{ maxHeight: shouldCrawl ? 220 : undefined }}
      >
        <motion.div
          className="space-y-4 text-center px-6"
          variants={staggerContainer}
          initial="hidden"
          animate={shouldCrawl ? { y: ["4%", "-104%"] } : inView ? "visible" : "hidden"}
          transition={shouldCrawl ? { duration: crawlDuration, repeat: Infinity, ease: "linear" } : undefined}
          whileHover={shouldCrawl ? { transitionDuration: "0.2s" } : undefined}
        >
          {items.map((c, i) => (
            <motion.div key={c._k} variants={fadeUp} className="group relative">
              {editMode ? (
                <input
                  value={c.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="NAME"
                  className="bg-transparent text-sm font-light text-[#f0ece8] uppercase tracking-[0.15em] outline-none w-full text-center focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
                />
              ) : (
                <div className="text-sm font-light text-[#f0ece8] uppercase tracking-[0.15em]">{c.name}</div>
              )}
              {editMode ? (
                <input
                  value={c.role ?? ""}
                  onChange={(e) => updateItem(i, { role: e.target.value })}
                  placeholder="role"
                  className="bg-transparent text-[11px] text-rose-200/45 italic outline-none w-full text-center mt-0.5 focus:ring-1 focus:ring-white/10 rounded placeholder-white/15"
                />
              ) : (
                c.role && <div className="text-[11px] text-rose-200/45 italic mt-0.5">{c.role}</div>
              )}
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  className="absolute -right-1 top-0 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove cast member"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        {shouldCrawl && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-[#050505] to-transparent" />
          </>
        )}
      </div>

      {editMode && (
        <div className="px-6 pt-2 text-center">
          <button
            type="button"
            onClick={() => update([...items, { name: "", role: "", _k: genKey("cast") }])}
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <Plus size={14} />
            <span className="text-xs">Add cast member</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Scenes — slate markers on a sprocket-dash reel line ────────────────────────

function ScenesSection({
  scenes: initialScenes,
  editMode,
  onScenesChange,
}: Readonly<{
  scenes: CinematicScene[];
  editMode?: boolean;
  onScenesChange?: (scenes: CinematicScene[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<CinematicScene & { _k: string }>>(() =>
    initialScenes.map((s) => ({ ...s, _k: genKey("scene") }))
  );

  const update = (next: Array<CinematicScene & { _k: string }>) => {
    setItems(next);
    onScenesChange?.(next.map(({ act, title, description }) => ({ act, title, description })));
  };

  const updateItem = (i: number, patch: Partial<CinematicScene>) =>
    update(items.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-6 pb-2" ref={ref}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.25em]">03 · The Reel</span>
      </div>
      <motion.div
        className="relative ml-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Sprocket-dash reel line instead of a plain rail */}
        <div
          className="absolute left-0 top-1 bottom-1 w-px"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 4px, transparent 4px 8px)" }}
        />
        <div className="space-y-6">
          {items.map((s, i) => (
            <motion.div key={s._k} variants={fadeUp} className="relative pl-7">
              <Clapperboard size={13} className="absolute -left-1.5 top-0.5 text-rose-300/60 bg-[#050505]" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {editMode ? (
                  <input
                    value={s.act ?? ""}
                    onChange={(e) => updateItem(i, { act: e.target.value })}
                    placeholder="SCENE 0N"
                    className="bg-white/5 text-[9px] font-mono font-bold text-rose-300/70 rounded-sm px-1.5 py-0.5 uppercase tracking-widest w-20 outline-none focus:ring-1 focus:ring-white/20"
                  />
                ) : (
                  s.act && (
                    <span className="text-[9px] font-mono font-bold text-rose-300/70 bg-white/5 rounded-sm px-1.5 py-0.5 uppercase tracking-widest">
                      {s.act}
                    </span>
                  )
                )}
                {editMode ? (
                  <input
                    value={s.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    placeholder="Scene title"
                    className="bg-transparent text-sm font-medium text-[#f0ece8] flex-1 outline-none focus:ring-1 focus:ring-white/10 rounded placeholder-white/20 min-w-20"
                  />
                ) : (
                  <span className="text-sm font-medium text-[#f0ece8]">{s.title}</span>
                )}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => update(items.filter((_, idx) => idx !== i))}
                    className="ml-auto text-white/20 hover:text-red-400 transition-colors"
                    aria-label="Remove scene"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              {editMode ? (
                <textarea
                  value={s.description ?? ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder="What happened in this scene…"
                  rows={2}
                  className="bg-transparent text-xs text-[#a09890] leading-relaxed w-full outline-none resize-none focus:ring-1 focus:ring-white/10 rounded placeholder-white/15"
                />
              ) : (
                s.description && <p className="text-xs text-[#a09890] leading-relaxed">{s.description}</p>
              )}
            </motion.div>
          ))}

          {editMode && (
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={() => update([...items, { act: "", title: "New scene", description: "", _k: genKey("scene") }])}
              className="relative pl-7 flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
            >
              <Clapperboard size={13} className="absolute -left-1.5 top-0.5" />
              <Plus size={14} />
              <span className="text-sm">Add scene</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Cinematic — Sunset + Honest Talk
 * Treats the moment as an actual film reel rather than a photo-plus-text card:
 * poster-style title card burned onto the hero photo, subtitle-style caption,
 * a timecode/REC readout, film-leader countdown dividers between reels, a
 * continuous 35mm filmstrip gallery, an .srt-style "Honest Talk" subtitle track,
 * a scrolling end-credits cast crawl, and slate-marked scene breakdown.
 */
export function Cinematic({
  title,
  caption,
  story,
  images = [],
  eventDate,
  editMode,
  onTitleChange,
  onCaptionChange,
  onStoryChange,
  onImageSlotClick,
  quotes,
  cast,
  scenes,
  config,
  onQuotesChange,
  onCastChange,
  onScenesChange,
  filmstripCaptions,
  onFilmstripCaptionsChange,
}: CinematicProps) {
  const cfg: Required<CinematicConfig> = { ...DEFAULT_CONFIG, ...config };

  const timecode = useMemo(() => {
    if (!eventDate) return "00:00:00:00";
    const d = new Date(eventDate);
    const seed = (d.getDate() + d.getMonth()) % 24;
    return `${String(seed).padStart(2, "0")}:${String((d.getMonth() + 1) * 3 % 60).padStart(2, "0")}:14:22`;
  }, [eventDate]);

  const dateStamp = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
    : null;

  return (
    <div className="w-full font-sans bg-[#050505] overflow-hidden" style={{ minHeight: 400 }}>
      {/* Letterbox bar — top */}
      <div className="h-2 bg-black" />

      {/* Widescreen photo — doubles as the poster/title card */}
      <motion.div
        className="relative w-full"
        style={{ aspectRatio: "21/9" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <PhotoSlot
          src={images[0]}
          label="Widescreen photo"
          editMode={editMode}
          onSlotClick={() => onImageSlotClick?.(0)}
          className="w-full h-full bg-neutral-900"
          style={{ aspectRatio: "21/9" } as React.CSSProperties}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        {/* Bottom scrim so poster text stays legible over any photo */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}
        />
        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* REC / timecode readout — top-left, like an on-camera HUD */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 pointer-events-none">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[9px] font-mono text-white/50 tracking-widest">REC {timecode}</span>
        </div>

        {/* Category + date stamp — top-right */}
        <div className="absolute top-3 right-4 flex flex-col items-end gap-0.5 pointer-events-none">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-xs leading-none">🌅</span>
            <span className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest">Sunset</span>
          </span>
          {dateStamp && <span className="text-[8px] font-mono text-white/30 tracking-widest">{dateStamp}</span>}
        </div>

        {/* Poster title card — burned onto the photo, bottom-left */}
        <div className="absolute inset-x-6 bottom-8 pointer-events-none">
          <div className="pointer-events-auto">
            <EditableText
              value={title}
              placeholder="Moment title"
              editMode={editMode}
              onUpdate={onTitleChange}
              className="text-3xl md:text-4xl font-thin text-white tracking-tight leading-tight block drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-10 h-px bg-rose-300/50 mt-2 mb-2" />
        </div>

        {/* Caption rendered as a genuine subtitle bar, lower-third, centered */}
        {(caption || editMode) && (
          <div className="absolute inset-x-6 bottom-2 flex justify-center pointer-events-auto">
            <div className="bg-black/55 backdrop-blur-sm px-3 py-1 rounded-sm max-w-full">
              <EditableText
                value={caption}
                placeholder="A line about this moment…"
                editMode={editMode}
                onUpdate={onCaptionChange}
                className="text-xs text-white/85 text-center block"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Letterbox bar — bottom */}
      <div className="h-2 bg-black" />

      {/* Screenplay-style story block */}
      {(story || editMode) && (
        <div className="px-6 pt-6 pb-2">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-[0.25em] mb-2">
            FADE IN — CONTINUOUS
          </div>
          <EditableText
            value={story}
            placeholder="Write the story…"
            editMode={editMode}
            onUpdate={onStoryChange}
            className="text-sm text-[#a09890] leading-loose block"
            multiline
          />
        </div>
      )}

      {/* ── Optional reels ── */}
      {cfg.showQuotes && (
        <>
          <ReelDivider n={3} label="Reel 1" />
          <QuotesSection quotes={quotes ?? DEFAULT_QUOTES} editMode={editMode} onQuotesChange={onQuotesChange} />
        </>
      )}

      {cfg.showFilmstrip && (
        <>
          <ReelDivider n={2} label="Reel 2" />
          <FilmstripSection
            images={images.slice(1)}
            editMode={editMode}
            onImageSlotClick={onImageSlotClick ? (i) => onImageSlotClick(i + 1) : undefined}
            captions={filmstripCaptions}
            onCaptionsChange={onFilmstripCaptionsChange}
          />
        </>
      )}

      {cfg.showScenes && (
        <>
          <ReelDivider n={1} label="Reel 3" />
          <ScenesSection scenes={scenes ?? DEFAULT_SCENES} editMode={editMode} onScenesChange={onScenesChange} />
        </>
      )}

      {cfg.showCredits && (
        <>
          <ReelDivider n={0} label="Reel 4" />
          <CastSection cast={cast ?? DEFAULT_CAST} editMode={editMode} onCastChange={onCastChange} />
          <div className="pb-6" />
        </>
      )}
    </div>
  );
}
