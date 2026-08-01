"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PolaroidQuote {
  readonly speaker?: string;
  readonly quote: string;
}

interface PolaroidCastMember {
  readonly name: string;
  readonly role?: string;
}

interface PolaroidCorkboardConfig {
  readonly showGallery?: boolean;
  readonly showQuotes?: boolean;
  readonly showCredits?: boolean;
}

interface PolaroidCorkboardProps extends TemplateProps {
  readonly quotes?: PolaroidQuote[];
  readonly cast?: PolaroidCastMember[];
  readonly config?: PolaroidCorkboardConfig;
  readonly onQuotesChange?: (quotes: PolaroidQuote[]) => void;
  readonly onCastChange?: (cast: PolaroidCastMember[]) => void;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_QUOTES: PolaroidQuote[] = [
  { speaker: "", quote: "Say that again — I want to remember it exactly like that." },
];

const DEFAULT_CAST: PolaroidCastMember[] = [{ name: "You", role: "photographer" }];

const DEFAULT_CONFIG: Required<PolaroidCorkboardConfig> = {
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

// Deterministic per-slot rotations — varied, not just alternating
const ROTATIONS = [-6, 5, -3, 4, -8, 2, -4, 6];
const rotFor = (i: number) => ROTATIONS[i % ROTATIONS.length];

// Section rule with a hand-drawn label pill
function SectionRule({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-medium text-[#8a7f68] bg-[#f3ecd8] px-2.5 py-0.5 rounded-sm">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#d8d0bd]" />
    </div>
  );
}

// ── Quotes — pinned sticky notes ────────────────────────────────────────────

function QuotesSection({
  quotes: initialQuotes,
  editMode,
  onQuotesChange,
}: Readonly<{
  quotes: PolaroidQuote[];
  editMode?: boolean;
  onQuotesChange?: (quotes: PolaroidQuote[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<PolaroidQuote & { _k: string }>>(() =>
    initialQuotes.map((q) => ({ ...q, _k: genKey("qt") }))
  );

  const update = (next: Array<PolaroidQuote & { _k: string }>) => {
    setItems(next);
    onQuotesChange?.(next.map(({ speaker, quote }) => ({ speaker, quote })));
  };

  const updateItem = (i: number, patch: Partial<PolaroidQuote>) =>
    update(items.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-5 pb-3" ref={ref}>
      <SectionRule>honest talk</SectionRule>
      <motion.div
        className="flex flex-wrap gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {items.map((q, i) => (
          <motion.div
            key={q._k}
            variants={fadeUp}
            style={{ transform: `rotate(${rotFor(i)}deg)` }}
            className="group relative bg-[#fff6d5] shadow-[1px_2px_6px_rgba(0,0,0,0.15)] px-3 py-2.5 flex-1 min-w-[160px] max-w-[240px]"
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#c4506f]" />
            {editMode ? (
              <input
                value={q.speaker ?? ""}
                onChange={(e) => updateItem(i, { speaker: e.target.value })}
                placeholder="who said it…"
                className="bg-transparent text-[10px] text-[#8a7f68] outline-none w-full mb-0.5"
              />
            ) : (
              q.speaker && <div className="text-[10px] text-[#8a7f68] mb-0.5">{q.speaker}</div>
            )}
            {editMode ? (
              <textarea
                value={q.quote}
                onChange={(e) => updateItem(i, { quote: e.target.value })}
                placeholder="what was said…"
                rows={2}
                className="bg-transparent text-[13px] text-[#3a3226] leading-snug w-full outline-none resize-none"
              />
            ) : (
              <p className="text-[13px] text-[#3a3226] leading-snug">&quot;{q.quote}&quot;</p>
            )}
            {editMode && (
              <button
                type="button"
                onClick={() => update(items.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 text-[#8a7f68]/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove note"
              >
                <Trash2 size={12} />
              </button>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => update([...items, { speaker: "", quote: "", _k: genKey("qt") }])}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-[#d8d0bd] text-[#8a7f68]/60 hover:text-[#8a7f68] hover:border-[#8a7f68]/50 transition-colors px-4 py-2.5 min-w-[160px]"
          >
            <Plus size={14} />
            <span className="text-xs">Add note</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Gallery — scattered pile, tap to spread into a grid ────────────────────────

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
  const [spread, setSpread] = useState(false);
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
    <div className="px-5 pb-3" ref={ref}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-medium text-[#8a7f68] bg-[#f3ecd8] px-2.5 py-0.5 rounded-sm">the pile</span>
        <div className="flex-1 h-px bg-[#d8d0bd]" />
        <button
          type="button"
          onClick={() => setSpread((v) => !v)}
          className="text-[11px] text-[#8a7f68] hover:text-[#3a3226] transition-colors underline decoration-dotted underline-offset-2"
        >
          {spread ? "stack them up" : "spread out →"}
        </button>
      </div>

      <motion.div
        layout
        className={spread ? "flex flex-wrap gap-4 justify-center py-2" : "relative py-2"}
        style={spread ? undefined : { height: 130 }}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {images.map((src, i) => {
          const rot = rotFor(i);
          const caption = localCaptions[i] ?? "";
          return (
            <motion.div
              key={src}
              layout
              variants={fadeUp}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={
                spread
                  ? { transform: `rotate(${rot}deg)` }
                  : { position: "absolute", left: `${i * 34}px`, top: `${(i % 2) * 12}px`, transform: `rotate(${rot}deg)`, zIndex: i }
              }
              whileHover={{ scale: 1.06, zIndex: 20, rotate: 0, transition: { duration: 0.2 } }}
              className="w-24 flex-shrink-0"
            >
              <div className="bg-white p-1.5 pb-4 shadow-[1px_3px_8px_rgba(0,0,0,0.25)]">
                <div
                  role="button"
                  tabIndex={0}
                  className="block w-full text-left cursor-pointer focus:outline-none"
                  onClick={() => setLightboxIndex(i)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxIndex(i); } }}
                  aria-label={`View photo ${i + 1} in lightbox`}
                >
                  <PhotoSlot
                    src={src}
                    label={`Photo ${i + 1}`}
                    editMode={editMode}
                    onSlotClick={() => onImageSlotClick?.(i)}
                    className="w-full aspect-square bg-[#d8d2c4]"
                  />
                </div>
                {editMode ? (
                  <input
                    value={caption}
                    onChange={(e) => updateCaption(i, e.target.value)}
                    placeholder="note…"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-[9px] text-[#7a5c3a] placeholder-[#c0a882]/60 outline-none w-full text-center mt-1"
                  />
                ) : (
                  caption && <p className="text-[9px] text-[#7a5c3a] text-center mt-1 truncate">{caption}</p>
                )}
              </div>
            </motion.div>
          );
        })}

        {canAdd && (
          <motion.button
            variants={fadeUp}
            type="button"
            layout
            style={spread ? undefined : { position: "absolute", left: `${images.length * 34}px`, top: 4, zIndex: images.length }}
            onClick={() => onImageSlotClick?.(images.length)}
            className="w-24 aspect-square flex-shrink-0 border-2 border-dashed border-[#d8d0bd] hover:border-[#8a7f68]/50 flex flex-col items-center justify-center gap-1 text-[#8a7f68]/50 hover:text-[#8a7f68] transition-colors bg-[#f3ecd8]/40"
          >
            <Plus size={16} />
            <span className="text-[9px]">{images.length}/{MAX_GALLERY_IMAGES}</span>
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              key={lightboxIndex}
              className="relative bg-[#fdfbf5] shadow-2xl"
              style={{ padding: "10px 10px 44px 10px", maxWidth: "min(88vw, 480px)" }}
              initial={{ scale: 0.85, opacity: 0, rotate: rotFor(lightboxIndex) }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex]}
                alt={`Photo ${lightboxIndex + 1}`}
                className="w-full object-cover"
                style={{ maxHeight: "70vh" }}
              />
              {localCaptions[lightboxIndex] && (
                <p className="absolute bottom-2 left-0 right-0 text-center text-sm text-[#7a5c3a]">
                  {localCaptions[lightboxIndex]}
                </p>
              )}
            </motion.div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => prevPhoto(p, images.length)); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => nextPhoto(p, images.length)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next photo"
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

// ── Credits — flip-through stack, one card at a time ───────────────────────────

function CastSection({
  cast: initialCast,
  editMode,
  onCastChange,
}: Readonly<{
  cast: PolaroidCastMember[];
  editMode?: boolean;
  onCastChange?: (cast: PolaroidCastMember[]) => void;
}>) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<Array<PolaroidCastMember & { _k: string }>>(() =>
    initialCast.map((c) => ({ ...c, _k: genKey("cast") }))
  );

  const update = (next: Array<PolaroidCastMember & { _k: string }>) => {
    setItems(next);
    onCastChange?.(next.map(({ name, role }) => ({ name, role })));
    if (index >= next.length) setIndex(Math.max(0, next.length - 1));
  };

  const updateItem = (i: number, patch: Partial<PolaroidCastMember>) =>
    update(items.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  if (items.length === 0 && !editMode) return null;

  const current = items[index];

  return (
    <div className="px-5 pb-6">
      <SectionRule>who was there</SectionRule>

      {!editMode && current && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            className="relative w-40 h-16 cursor-pointer"
            aria-label="Show next person"
          >
            {items.length > 1 && (
              <div className="absolute inset-0 translate-x-1.5 translate-y-1 bg-white border border-[#d8d0bd] shadow-sm" style={{ transform: "rotate(3deg)" }} />
            )}
            <div className="absolute inset-0 bg-white border border-[#d8d0bd] shadow-md flex items-center justify-center px-3">
              <span className="text-sm text-[#3a3226]">
                {current.name}
                {current.role && <span className="text-xs text-[#8a7f68]"> · {current.role}</span>}
              </span>
            </div>
          </button>
          {items.length > 1 && (
            <span className="text-[10px] text-[#8a7f68]/70">tap to flip · {index + 1} / {items.length}</span>
          )}
        </div>
      )}

      {editMode && (
        <div className="flex flex-col gap-2">
          {items.map((c, i) => (
            <div key={c._k} className="group flex items-center gap-2 bg-white/60 px-3 py-2 border border-[#d8d0bd]">
              <input
                value={c.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                placeholder="Name"
                className="bg-transparent text-sm text-[#3a3226] outline-none flex-1"
              />
              <input
                value={c.role ?? ""}
                onChange={(e) => updateItem(i, { role: e.target.value })}
                placeholder="role"
                className="bg-transparent text-xs text-[#8a7f68] italic outline-none w-28"
              />
              <button
                type="button"
                onClick={() => update(items.filter((_, idx) => idx !== i))}
                className="text-[#8a7f68]/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove person"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update([...items, { name: "", role: "", _k: genKey("cast") }])}
            className="inline-flex items-center gap-2 text-[#8a7f68]/60 hover:text-[#8a7f68] transition-colors self-start"
          >
            <Plus size={14} />
            <span className="text-xs">Add person</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * PolaroidCorkboard — Sunset + Honest Talk (Polaroid & Corkboard direction)
 * Warm alternate mood with no film hardware at all: a polaroid hero with
 * a handwritten caption, the story as a "written on the back" note card,
 * quotes as pinned sticky notes, a scattered photo pile you can tap to
 * spread into a grid, and credits as a flip-through card stack instead
 * of a scrolling crawl.
 */
export function PolaroidCorkboard({
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
}: PolaroidCorkboardProps) {
  const cfg: Required<PolaroidCorkboardConfig> = { ...DEFAULT_CONFIG, ...config };

  const dateStamp = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
    : null;

  return (
    <div
      className="w-full font-sans overflow-hidden"
      style={{
        minHeight: 400,
        background: "repeating-linear-gradient(0deg, #e9e2d3, #e9e2d3 3px, #e4dccb 3px, #e4dccb 4px)",
      }}
    >
      <div className="p-5 flex flex-col gap-5">
        {/* Polaroid hero */}
        <motion.div
          className="self-center bg-white p-2.5 pb-6 shadow-[2px_4px_12px_rgba(0,0,0,0.2)]"
          style={{ transform: "rotate(-2deg)", width: "min(100%, 300px)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PhotoSlot
            src={images[0]}
            label="Add photo"
            editMode={editMode}
            onSlotClick={() => onImageSlotClick?.(0)}
            className="w-full aspect-square bg-[#d8d2c4]"
          />
          <div className="mt-2 text-center">
            <EditableText
              value={title}
              placeholder="Moment title"
              editMode={editMode}
              onUpdate={onTitleChange}
              className="text-lg text-[#3a3226] block text-center"
            />
            {dateStamp && <span className="text-xs text-[#8a7f68]">— {dateStamp}</span>}
          </div>
        </motion.div>

        {(caption || editMode) && (
          <div className="self-center max-w-full">
            <EditableText
              value={caption}
              placeholder="A line about this moment…"
              editMode={editMode}
              onUpdate={onCaptionChange}
              className="text-sm text-[#8a7f68] italic block text-center"
            />
          </div>
        )}

        {/* Story — written on the back */}
        {(story || editMode) && (
          <div className="relative bg-[#fdfbf5] rounded-sm px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div
              className="absolute -top-1.5 left-0 right-0 h-1.5"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, #e9e2d3 4px, #e9e2d3 6px)" }}
            />
            <p className="text-[11px] text-[#8a7f68] mb-1.5">written on the back —</p>
            <EditableText
              value={story}
              placeholder="Write the story…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="text-sm text-[#3a3226] leading-relaxed block"
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
    </div>
  );
}
