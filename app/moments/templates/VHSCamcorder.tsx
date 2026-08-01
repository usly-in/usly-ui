"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface VHSQuote {
  readonly speaker?: string;
  readonly quote: string;
}

interface VHSCastMember {
  readonly name: string;
  readonly role?: string;
}

interface VHSCamcorderConfig {
  readonly showGallery?: boolean;
  readonly showQuotes?: boolean;
  readonly showCredits?: boolean;
}

interface VHSCamcorderProps extends TemplateProps {
  readonly quotes?: VHSQuote[];
  readonly cast?: VHSCastMember[];
  readonly config?: VHSCamcorderConfig;
  readonly onQuotesChange?: (quotes: VHSQuote[]) => void;
  readonly onCastChange?: (cast: VHSCastMember[]) => void;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_QUOTES: VHSQuote[] = [
  { speaker: "", quote: "Say that again — I want to remember it exactly like that." },
];

const DEFAULT_CAST: VHSCastMember[] = [{ name: "You", role: "Lead" }];

const DEFAULT_CONFIG: Required<VHSCamcorderConfig> = {
  showGallery: true,
  showQuotes: true,
  showCredits: true,
};

let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

const MAX_GALLERY_IMAGES = Math.max(1, Number(process.env.NEXT_PUBLIC_MAX_GALLERY_IMAGES) || 6);

const prevPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p > 0 ? p - 1 : len - 1;
const nextPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p < len - 1 ? p + 1 : 0;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// Deterministic "tape counter" derived from the title — mechanical readout, not a real clock
function useTapeCounter(title: string) {
  return useMemo(() => {
    let seed = 11;
    for (let i = 0; i < title.length; i++) seed = (seed * 33 + title.charCodeAt(i)) % 2400;
    const m = Math.floor(seed / 60).toString().padStart(2, "0");
    const s = Math.floor(seed % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [title]);
}

// ── Closed-caption quotes ────────────────────────────────────────────────────

function QuotesSection({
  quotes: initialQuotes,
  editMode,
  onQuotesChange,
}: Readonly<{
  quotes: VHSQuote[];
  editMode?: boolean;
  onQuotesChange?: (quotes: VHSQuote[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<VHSQuote & { _k: string }>>(() =>
    initialQuotes.map((q) => ({ ...q, _k: genKey("qt") }))
  );

  const update = (next: Array<VHSQuote & { _k: string }>) => {
    setItems(next);
    onQuotesChange?.(next.map(({ speaker, quote }) => ({ speaker, quote })));
  };

  const updateItem = (i: number, patch: Partial<VHSQuote>) =>
    update(items.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div ref={ref}>
      <p className="text-[8px] font-mono text-white/25 uppercase tracking-[0.2em] mb-2">Closed Captions</p>
      <motion.div className="flex flex-col gap-1.5" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {items.map((q, i) => (
          <motion.div key={q._k} variants={fadeUp} className="group relative self-start max-w-full bg-black rounded-sm px-2.5 py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] font-mono text-rose-200/60 shrink-0">
                [{String(4 + i * 7).padStart(2, "0")}s]
              </span>
              {editMode ? (
                <input
                  value={q.speaker ?? ""}
                  onChange={(e) => updateItem(i, { speaker: e.target.value })}
                  placeholder="SPEAKER:"
                  className="bg-transparent text-[9px] text-white/50 uppercase outline-none w-16 shrink-0 focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
                />
              ) : (
                q.speaker && <span className="text-[9px] text-white/50 uppercase shrink-0">{q.speaker}:</span>
              )}
              {editMode ? (
                <input
                  value={q.quote}
                  onChange={(e) => updateItem(i, { quote: e.target.value })}
                  placeholder="what was said…"
                  className="bg-transparent text-[11px] text-white outline-none flex-1 min-w-24 focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
                />
              ) : (
                <span className="text-[11px] text-white">&quot;{q.quote}&quot;</span>
              )}
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  className="text-white/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  aria-label="Remove caption"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => update([...items, { speaker: "", quote: "", _k: genKey("qt") }])}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors pt-1 self-start"
          >
            <Plus size={13} />
            <span className="text-xs">Add caption</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Tape-scrubber gallery — spool ends + horizontal reel ───────────────────────

function GallerySection({
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

  const canAdd = editMode && images.length < MAX_GALLERY_IMAGES;

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
      <p className="text-[8px] font-mono text-white/25 uppercase tracking-[0.2em] mb-2">Tape Reel</p>
      <motion.div className="flex items-center gap-2" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <div className="w-4 h-4 rounded-full border-2 border-white/25 shrink-0" />
        <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
          {images.map((src, i) => (
            <motion.div key={src} variants={fadeUp} className="relative shrink-0 w-16">
              <div
                role="button"
                tabIndex={0}
                className="block w-full text-left cursor-pointer focus:outline-none rounded-xs overflow-hidden"
                onClick={() => setLightboxIndex(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxIndex(i); } }}
                aria-label={`View clip ${i + 1} in lightbox`}
              >
                <PhotoSlot
                  src={src}
                  label={`Clip ${i + 1}`}
                  editMode={editMode}
                  onSlotClick={() => onImageSlotClick?.(i)}
                  className="w-full aspect-4/3 bg-neutral-800"
                />
              </div>
              {editMode ? (
                <input
                  value={localCaptions[i] ?? ""}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="label…"
                  className="bg-transparent text-[8px] text-white/40 placeholder-white/15 outline-none w-full text-center py-0.5"
                />
              ) : (
                localCaptions[i] && (
                  <p className="text-[8px] text-white/40 text-center py-0.5 truncate">{localCaptions[i]}</p>
                )
              )}
            </motion.div>
          ))}

          {canAdd && (
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={() => onImageSlotClick?.(images.length)}
              className="shrink-0 w-16 aspect-4/3 rounded-xs border border-dashed border-white/15 hover:border-white/40 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Add clip"
            >
              <Plus size={14} />
              <span className="text-[8px] uppercase tracking-widest">{images.length}/{MAX_GALLERY_IMAGES}</span>
            </motion.button>
          )}
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-white/25 shrink-0" />
      </motion.div>

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
              alt={`Clip ${lightboxIndex + 1}`}
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
                  aria-label="Previous clip"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => nextPhoto(p, images.length)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next clip"
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

// ── OSD credits list ────────────────────────────────────────────────────────

function CastSection({
  cast: initialCast,
  editMode,
  onCastChange,
}: Readonly<{
  cast: VHSCastMember[];
  editMode?: boolean;
  onCastChange?: (cast: VHSCastMember[]) => void;
}>) {
  const [items, setItems] = useState<Array<VHSCastMember & { _k: string }>>(() =>
    initialCast.map((c) => ({ ...c, _k: genKey("cast") }))
  );

  const update = (next: Array<VHSCastMember & { _k: string }>) => {
    setItems(next);
    onCastChange?.(next.map(({ name, role }) => ({ name, role })));
  };

  const updateItem = (i: number, patch: Partial<VHSCastMember>) =>
    update(items.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="pt-3 border-t border-dashed border-white/15">
      <p className="text-[8px] font-mono text-white/25 uppercase tracking-[0.2em] mb-2">On-Screen Display</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {items.map((c, i) => (
          <div key={c._k} className="group inline-flex items-center gap-1">
            {editMode ? (
              <input
                value={c.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                placeholder="NAME"
                className="bg-transparent text-[9px] font-mono text-white/50 uppercase outline-none w-16 focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
              />
            ) : (
              <span className="text-[9px] font-mono text-white/50 uppercase">{c.name}</span>
            )}
            {editMode ? (
              <input
                value={c.role ?? ""}
                onChange={(e) => updateItem(i, { role: e.target.value })}
                placeholder="role"
                className="bg-transparent text-[9px] font-mono text-rose-200/40 outline-none w-14 focus:ring-1 focus:ring-white/10 rounded placeholder-white/15"
              />
            ) : (
              c.role && <span className="text-[9px] font-mono text-rose-200/40">· {c.role}</span>
            )}
            {editMode && (
              <button
                type="button"
                onClick={() => update(items.filter((_, idx) => idx !== i))}
                className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove credit"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <button
            type="button"
            onClick={() => update([...items, { name: "", role: "", _k: genKey("cast") }])}
            className="inline-flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
          >
            <Plus size={11} />
            <span className="text-[9px] font-mono">add</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * VHSCamcorder — Sunset + Honest Talk (VHS Camcorder direction)
 * Leans into home-video warmth instead of theatrical polish: a pinned
 * 4:3 camcorder frame with scanlines, blinking REC dot and a tape
 * counter, quotes rendered as genuine closed captions, a tape-scrubber
 * gallery between two spool ends, and an on-screen-display credits line.
 * Two-column on desktop (frame pinned beside the scrolling tape),
 * single column on mobile.
 */
export function VHSCamcorder({
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
  config,
  onQuotesChange,
  onCastChange,
  galleryCaptions,
  onGalleryCaptionsChange,
}: VHSCamcorderProps) {
  const cfg: Required<VHSCamcorderConfig> = { ...DEFAULT_CONFIG, ...config };
  const counter = useTapeCounter(title || "tape");

  const timeStamp = eventDate
    ? new Date(eventDate).toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  return (
    <div className="w-full font-sans bg-[#050505] overflow-hidden md:flex" style={{ minHeight: 400 }}>
      {/* Left — pinned camcorder frame */}
      <motion.div
        className="relative w-full md:w-[42%] md:shrink-0"
        style={{ aspectRatio: "4/3" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="md:sticky md:top-0 relative w-full h-full">
          <PhotoSlot
            src={images[0]}
            label="Camcorder frame"
            editMode={editMode}
            onSlotClick={() => onImageSlotClick?.(0)}
            className="w-full h-full bg-neutral-900"
            style={{ aspectRatio: "4/3" } as React.CSSProperties}
          />
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
            }}
          />
          {/* Bottom scrim for legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
          />
          {/* REC indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[9px] font-mono text-white/70 tracking-widest">REC {counter}</span>
          </div>
          {/* SP speed indicator */}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="text-[8px] font-mono text-rose-200/60 tracking-widest">SP</span>
          </div>
          {/* Date/time stamp */}
          {timeStamp && (
            <div className="absolute bottom-3 right-3 text-right pointer-events-none">
              <span className="text-[9px] font-mono text-white/60 tracking-widest">{timeStamp}</span>
            </div>
          )}
          {/* Title burned onto frame */}
          <div className="absolute inset-x-3 bottom-3 pointer-events-auto">
            <EditableText
              value={title}
              placeholder="Moment title"
              editMode={editMode}
              onUpdate={onTitleChange}
              className="text-xl md:text-2xl font-light text-white leading-tight block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            />
            {(caption || editMode) && (
              <EditableText
                value={caption}
                placeholder="A line about this moment…"
                editMode={editMode}
                onUpdate={onCaptionChange}
                className="text-[11px] text-white/70 block mt-1"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Right — scrolling tape content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-rose-300/60 uppercase tracking-widest">▶ Play — Tape 01</span>
          <span className="text-[9px] font-mono text-white/30 tabular-nums">00:00 / {counter}</span>
        </div>

        {(story || editMode) && (
          <EditableText
            value={story}
            placeholder="Write the story…"
            editMode={editMode}
            onUpdate={onStoryChange}
            className="text-sm text-[#a09890] leading-relaxed block"
            multiline
          />
        )}

        {cfg.showQuotes && (
          <QuotesSection quotes={quotes ?? DEFAULT_QUOTES} editMode={editMode} onQuotesChange={onQuotesChange} />
        )}

        {cfg.showGallery && (
          <GallerySection
            images={images.slice(1)}
            editMode={editMode}
            onImageSlotClick={onImageSlotClick ? (i) => onImageSlotClick(i + 1) : undefined}
            captions={galleryCaptions}
            onCaptionsChange={onGalleryCaptionsChange}
          />
        )}

        {cfg.showCredits && (
          <CastSection cast={cast ?? DEFAULT_CAST} editMode={editMode} onCastChange={onCastChange} />
        )}
      </div>
    </div>
  );
}
