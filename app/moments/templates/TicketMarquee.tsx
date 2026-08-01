"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TicketQuote {
  readonly speaker?: string;
  readonly quote: string;
}

interface TicketCastMember {
  readonly name: string;
  readonly role?: string;
}

interface TicketMarqueeConfig {
  readonly showGallery?: boolean;
  readonly showQuotes?: boolean;
  readonly showCredits?: boolean;
}

interface TicketMarqueeProps extends TemplateProps {
  readonly quotes?: TicketQuote[];
  readonly cast?: TicketCastMember[];
  readonly config?: TicketMarqueeConfig;
  readonly onQuotesChange?: (quotes: TicketQuote[]) => void;
  readonly onCastChange?: (cast: TicketCastMember[]) => void;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_QUOTES: TicketQuote[] = [
  { speaker: "", quote: "Say that again — I want to remember it exactly like that." },
];

const DEFAULT_CAST: TicketCastMember[] = [{ name: "You", role: "Lead" }];

const DEFAULT_CONFIG: Required<TicketMarqueeConfig> = {
  showGallery: true,
  showQuotes: true,
  showCredits: true,
};

// Module-level counter for stable React keys
let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

// Max gallery images — falls back to 6 if env var is absent or invalid
const MAX_GALLERY_IMAGES = Math.max(1, Number(process.env.NEXT_PUBLIC_MAX_GALLERY_IMAGES) || 6);

// Lightbox navigation helpers
const prevPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p > 0 ? p - 1 : len - 1;
const nextPhoto = (p: number | null, len: number): number | null =>
  p === null ? null : p < len - 1 ? p + 1 : 0;

// Fake timecode for a quote line — decorative rhythm, not a real clock
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

// ── Ticket-stub divider — perforated notch circles + dashed rule ──────────────

function TicketDivider({ dateStamp, location }: Readonly<{ dateStamp: string | null; location?: string }>) {
  return (
    <div className="relative bg-[#151515] px-5 py-3 flex items-center justify-between border-t-2 border-b-2 border-dashed border-white/15">
      <div className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-[#050505] -translate-y-1/2" />
      <div className="absolute -right-2 top-1/2 w-4 h-4 rounded-full bg-[#050505] -translate-y-1/2" />
      <span className="text-[10px] font-mono font-bold text-rose-300/70 uppercase tracking-[0.2em]">
        Admit Two
      </span>
      <span className="text-[9px] font-mono text-white/35 uppercase tracking-[0.15em]">
        {[dateStamp, location].filter(Boolean).join(" · ") || "Opening Night"}
      </span>
    </div>
  );
}

// ── Marquee slug line — "NOW SHOWING" style section rule ──────────────────────

function MarqueeSlug({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[9px] font-mono text-rose-300/50 uppercase tracking-[0.25em]">{children}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Honest Talk — quotes rendered as torn ticket stubs ─────────────────────────

function QuotesSection({
  quotes: initialQuotes,
  editMode,
  onQuotesChange,
}: Readonly<{
  quotes: TicketQuote[];
  editMode?: boolean;
  onQuotesChange?: (quotes: TicketQuote[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<TicketQuote & { _k: string }>>(() =>
    initialQuotes.map((q) => ({ ...q, _k: genKey("qt") }))
  );

  const update = (next: Array<TicketQuote & { _k: string }>) => {
    setItems(next);
    onQuotesChange?.(next.map(({ speaker, quote }) => ({ speaker, quote })));
  };

  const updateItem = (i: number, patch: Partial<TicketQuote>) =>
    update(items.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-5 pb-2" ref={ref}>
      <MarqueeSlug>Showing 01 · Honest Talk</MarqueeSlug>
      <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {items.map((q, i) => (
          <motion.div
            key={q._k}
            variants={fadeUp}
            className="group relative bg-[#151515] border-l-[3px] border-rose-300/40 rounded-sm px-3 py-2.5"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-white/35 tabular-nums shrink-0">{timecodeFor(i)}</span>
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
                className="bg-transparent text-[13px] text-[#f4f0ec] leading-snug w-full outline-none resize-none focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
              />
            ) : (
              <p className="text-[13px] text-[#f4f0ec] leading-snug">{q.quote}</p>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => update([...items, { speaker: "", quote: "", _k: genKey("qt") }])}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors pt-1"
          >
            <Plus size={14} />
            <span className="text-xs">Add line</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Gallery — row of ticket-stub thumbnails, frame-numbered ────────────────────

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
    <div className="px-5 pb-2" ref={ref}>
      <MarqueeSlug>Showing 02 · The Reel</MarqueeSlug>
      <motion.div
        className="flex gap-2.5 overflow-x-auto pb-1"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {images.map((src, i) => (
          <motion.div key={src} variants={fadeUp} className="relative flex-shrink-0 w-24">
            <div
              role="button"
              tabIndex={0}
              className="block w-full text-left cursor-pointer focus:outline-none rounded-sm overflow-hidden"
              onClick={() => setLightboxIndex(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxIndex(i); } }}
              aria-label={`View frame ${i + 1} in lightbox`}
            >
              <PhotoSlot
                src={src}
                label={`Frame ${i + 1}`}
                editMode={editMode}
                onSlotClick={() => onImageSlotClick?.(i)}
                className="w-full aspect-[3/4] bg-neutral-900"
              />
            </div>
            <span className="absolute bottom-1 left-1.5 text-[8px] font-mono text-rose-200/70 bg-black/60 px-1 rounded-sm pointer-events-none">
              FR.{String(i + 1).padStart(2, "0")}
            </span>
            {editMode ? (
              <input
                value={localCaptions[i] ?? ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="caption…"
                className="bg-transparent text-[9px] text-white/40 placeholder-white/15 outline-none w-full text-center py-1"
              />
            ) : (
              localCaptions[i] && (
                <p className="text-[9px] text-white/40 text-center py-1 truncate">{localCaptions[i]}</p>
              )
            )}
          </motion.div>
        ))}

        {canAdd && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => onImageSlotClick?.(images.length)}
            className="flex-shrink-0 w-24 aspect-[3/4] rounded-sm border border-dashed border-white/15 hover:border-white/40 flex flex-col items-center justify-center gap-1.5 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Add frame"
          >
            <Plus size={16} />
            <span className="text-[9px] uppercase tracking-widest">{images.length}/{MAX_GALLERY_IMAGES}</span>
          </motion.button>
        )}
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

// ── Cast & Crew — collapsed by default, tap to expand ──────────────────────────

function CastSection({
  cast: initialCast,
  editMode,
  onCastChange,
}: Readonly<{
  cast: TicketCastMember[];
  editMode?: boolean;
  onCastChange?: (cast: TicketCastMember[]) => void;
}>) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<Array<TicketCastMember & { _k: string }>>(() =>
    initialCast.map((c) => ({ ...c, _k: genKey("cast") }))
  );

  const update = (next: Array<TicketCastMember & { _k: string }>) => {
    setItems(next);
    onCastChange?.(next.map(({ name, role }) => ({ name, role })));
  };

  const updateItem = (i: number, patch: Partial<TicketCastMember>) =>
    update(items.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-5 pb-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between border border-dashed border-white/15 hover:border-white/30 rounded-sm px-3 py-2.5 transition-colors"
      >
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">
          Cast &amp; Crew ({items.length})
        </span>
        <ChevronDown size={13} className={`text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {(expanded || editMode) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 grid grid-cols-2 gap-3">
              {items.map((c, i) => (
                <div key={c._k} className="group relative">
                  {editMode ? (
                    <input
                      value={c.name}
                      onChange={(e) => updateItem(i, { name: e.target.value })}
                      placeholder="NAME"
                      className="bg-transparent text-xs font-medium text-[#f0ece8] uppercase tracking-wide outline-none w-full focus:ring-1 focus:ring-white/10 rounded placeholder-white/20"
                    />
                  ) : (
                    <div className="text-xs font-medium text-[#f0ece8] uppercase tracking-wide">{c.name}</div>
                  )}
                  {editMode ? (
                    <input
                      value={c.role ?? ""}
                      onChange={(e) => updateItem(i, { role: e.target.value })}
                      placeholder="role"
                      className="bg-transparent text-[10px] text-rose-200/50 italic outline-none w-full mt-0.5 focus:ring-1 focus:ring-white/10 rounded placeholder-white/15"
                    />
                  ) : (
                    c.role && <div className="text-[10px] text-rose-200/50 italic mt-0.5">{c.role}</div>
                  )}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => update(items.filter((_, idx) => idx !== i))}
                      className="absolute -right-1 -top-1 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove cast member"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <button
                type="button"
                onClick={() => update([...items, { name: "", role: "", _k: genKey("cast") }])}
                className="mt-3 inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
              >
                <Plus size={13} />
                <span className="text-xs">Add cast member</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * TicketMarquee — Sunset + Honest Talk (Ticket & Marquee direction)
 * Leans into the physical theatre-going ritual rather than film hardware:
 * a portrait poster hero (2:3), a ticket-stub divider with punch-hole
 * notches, "NOW SHOWING" marquee slug lines between sections, quotes as
 * torn ticket stubs, a frame-numbered filmstrip gallery, and a collapsed
 * "Cast & Crew" ticket you tap to unfold.
 */
export function TicketMarquee({
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
}: TicketMarqueeProps) {
  const cfg: Required<TicketMarqueeConfig> = { ...DEFAULT_CONFIG, ...config };

  const dateStamp = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
    : null;

  return (
    <div className="w-full font-sans bg-[#050505] overflow-hidden" style={{ minHeight: 400 }}>
      {/* Portrait poster hero */}
      <motion.div
        className="relative w-full"
        style={{ aspectRatio: "2/3", maxHeight: 560 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <PhotoSlot
          src={images[0]}
          label="Poster photo"
          editMode={editMode}
          onSlotClick={() => onImageSlotClick?.(0)}
          className="w-full h-full bg-neutral-900"
          style={{ aspectRatio: "2/3" } as React.CSSProperties}
        />
        {/* Inset rose frame */}
        <div className="absolute inset-2.5 border-2 border-rose-300/40 pointer-events-none" />
        {/* Vignette + bottom scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.7) 100%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }}
        />
        {/* Marquee bulb row */}
        <div className="absolute top-3 left-4 right-4 flex justify-between pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-rose-200/70"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
        {/* Category stamp */}
        <div className="absolute top-8 right-4 pointer-events-none">
          <span className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest bg-black/30 px-2 py-1 backdrop-blur-sm">
            🌅 Sunset
          </span>
        </div>
        {/* Poster title */}
        <div className="absolute inset-x-6 bottom-16 pointer-events-none">
          <div className="pointer-events-auto">
            <EditableText
              value={title}
              placeholder="Moment title"
              editMode={editMode}
              onUpdate={onTitleChange}
              className="text-3xl font-thin text-white tracking-tight leading-tight text-center block drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
        {/* Caption pill */}
        {(caption || editMode) && (
          <div className="absolute inset-x-6 bottom-6 flex justify-center pointer-events-auto">
            <div className="bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-full max-w-full">
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

      {/* Ticket stub divider */}
      <TicketDivider dateStamp={dateStamp} />

      {/* Story */}
      {(story || editMode) && (
        <div className="px-5 pt-5 pb-2">
          <MarqueeSlug>Now Showing · Continuous</MarqueeSlug>
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
  );
}
