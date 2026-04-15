"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RooftopHighlight {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface RooftopStat {
  readonly label: string;
  readonly value: string;
}

interface RooftopTimelineStep {
  readonly time?: string;
  readonly title: string;
  readonly description?: string;
}

interface RooftopGlowConfig {
  readonly showTags?: boolean;
  readonly showHighlights?: boolean;
  readonly showGallery?: boolean;
  readonly showStats?: boolean;
  readonly showTimeline?: boolean;
}

interface RooftopGlowProps extends TemplateProps {
  readonly tags?: string[];
  readonly highlights?: RooftopHighlight[];
  readonly stats?: RooftopStat[];
  readonly timeline?: RooftopTimelineStep[];
  readonly config?: RooftopGlowConfig;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHighlightsChange?: (highlights: RooftopHighlight[]) => void;
  readonly onStatsChange?: (stats: RooftopStat[]) => void;
  readonly onTimelineChange?: (timeline: RooftopTimelineStep[]) => void;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ["Thai Food", "Rooftop Vibes", "Golden Hour", "Street Food"];

const DEFAULT_HIGHLIGHTS: RooftopHighlight[] = [
  {
    icon: "🍜",
    title: "Best Dish of the Night",
    description: "That spicy noodle bowl hit different — zero leftovers, maximum regret.",
  },
  {
    icon: "🌇",
    title: "Golden Hour View",
    description: "We caught the last light perfectly. Nobody planned it but everyone felt it.",
  },
  {
    icon: "🥂",
    title: "The Toast",
    description: "Someone said something real and the whole table went quiet for a second.",
  },
];

const DEFAULT_STATS: RooftopStat[] = [
  { label: "Hours Together", value: "3+" },
  { label: "Dishes Tried", value: "8" },
  { label: "Vibe Rating", value: "10/10" },
  { label: "Leftovers", value: "0" },
];

const DEFAULT_TIMELINE: RooftopTimelineStep[] = [
  { time: "6:30 PM", title: "Arrived & Settled In", description: "Found the perfect spot and claimed the view." },
  { time: "7:00 PM", title: "First Round Ordered", description: "Menus studied like textbooks. Way too much ordered." },
  { time: "8:30 PM", title: "Golden Hour Moment", description: "Everything glowed. Nobody checked their phones." },
  { time: "10:00 PM", title: "Last Order, Long Talks", description: "The kind of conversation that makes time disappear." },
];

const DEFAULT_CONFIG: Required<RooftopGlowConfig> = {
  showTags: true,
  showHighlights: true,
  showGallery: true,
  showStats: true,
  showTimeline: true,
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

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Left rule */}
      <div className="w-5 h-px bg-[#a07040]/50" />
      <span className="text-[#c0a882] text-[9px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap opacity-70">
        {children}
      </span>
      <div className="flex-1 h-px bg-linear-to-r from-[#a07040]/30 to-transparent" />
    </div>
  );
}

// ── Vibe Tags ──────────────────────────────────────────────────────────────────

function VibeTagsSection({
  tags: initialTags,
  editMode,
  onTagsChange,
}: Readonly<{
  tags: string[];
  editMode?: boolean;
  onTagsChange?: (tags: string[]) => void;
}>) {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");

  const update = (next: string[]) => {
    setTags(next);
    onTagsChange?.(next);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) update([...tags, trimmed]);
    setNewTag("");
  };

  return (
    <div className="px-6 pb-5">
      <SectionHeader>✦ Vibe Tags</SectionHeader>
      <div className="flex flex-wrap gap-2 items-center">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ delay: editMode ? 0 : i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.08 }}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#d4a96a] bg-[#2a1c0e] border border-[#a07040]/25 rounded-sm px-4 py-1.5 cursor-default select-none"
            >
              {tag}
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(tags.filter((t) => t !== tag))}
                  className="text-[#a07040]/50 hover:text-[#d4a96a] transition-colors ml-0.5"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={12} />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>

        {editMode && (
          <div className="flex items-center gap-1.5">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
              placeholder="Add tag…"
              className="bg-[#2a1c0e] border border-dashed border-[#a07040]/25 text-[#d4a96a] placeholder-[#a07040]/30 text-sm rounded-sm px-3 py-1.5 outline-none focus:border-[#a07040]/60 w-28"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-[#a07040]/50 hover:text-[#d4a96a] transition-colors"
              aria-label="Add tag"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Food & Moment Highlights ───────────────────────────────────────────────────

function HighlightsSection({
  highlights: initialHighlights,
  editMode,
  onHighlightsChange,
}: Readonly<{
  highlights: RooftopHighlight[];
  editMode?: boolean;
  onHighlightsChange?: (highlights: RooftopHighlight[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<RooftopHighlight & { _k: string }>>(() =>
    initialHighlights.map((h) => ({ ...h, _k: genKey("hl") }))
  );

  const update = (next: Array<RooftopHighlight & { _k: string }>) => {
    setItems(next);
    onHighlightsChange?.(next.map(({ icon, title, description }) => ({ icon, title, description })));
  };

  const updateItem = (i: number, patch: Partial<RooftopHighlight>) =>
    update(items.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));

  return (
    <div className="px-6 pb-5" ref={ref}>
      <SectionHeader>✦ Food & Moment Highlights</SectionHeader>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {items.map((h, i) => (
          <motion.div
            key={h._k}
            variants={fadeUp}
            whileHover={editMode ? {} : { scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-[#15100a] border border-[#2a1f14] rounded-sm p-5 hover:border-[#a07040]/30 hover:shadow-lg hover:shadow-amber-900/20 transition-shadow duration-300"
          >
            {editMode && (
              <button
                type="button"
                onClick={() => update(items.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors"
                aria-label="Remove highlight"
              >
                <Trash2 size={14} />
              </button>
            )}

            {editMode ? (
              <input
                value={h.icon}
                onChange={(e) => updateItem(i, { icon: e.target.value })}
                className="bg-transparent text-3xl w-12 mb-3 outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded"
                maxLength={4}
                aria-label="Icon emoji"
              />
            ) : (
              <div className="text-3xl mb-3 select-none">{h.icon}</div>
            )}

            {editMode ? (
              <input
                value={h.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                placeholder="Moment title"
                className="bg-transparent text-sm font-bold text-[#f0e8dc] w-full outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded placeholder-white/20 mb-1.5 block"
              />
            ) : (
              <div className="text-sm font-bold text-white mb-1.5">{h.title}</div>
            )}

            {editMode ? (
              <textarea
                value={h.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Short description…"
                rows={3}
                className="bg-transparent text-xs text-[#9e8060] leading-relaxed w-full outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded resize-none placeholder-white/15"
              />
            ) : (
              <div className="text-xs text-[#9e8060] leading-relaxed">{h.description}</div>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() =>
              update([
                ...items,
                { icon: "✨", title: "New moment", description: "Describe it…", _k: genKey("hl") },
              ])
            }
            className="flex items-center justify-center gap-2 bg-[#15100a] border border-dashed border-[#a07040]/15 rounded-sm p-5 text-[#a07040]/50 hover:text-[#d4a96a] hover:border-[#a07040]/40 transition-colors min-h-30"
          >
            <Plus size={16} />
            <span className="text-sm">Add highlight</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// Deterministic per-slot polaroid rotations — varied, not just alternating
const POLAROID_ROTATIONS = [-2.8, 1.6, -1.2, 2.4, -0.8, 3.1, -2.2, 1.0];
const polaroidRot = (i: number) => POLAROID_ROTATIONS[i % POLAROID_ROTATIONS.length];

// ── Photo Gallery ──────────────────────────────────────────────────────────────

function GallerySection({
  images,
  editMode,
  onImageSlotClick,
  galleryCaptions = [],
  onGalleryCaptionsChange,
}: Readonly<{
  images: readonly string[];
  editMode?: boolean;
  onImageSlotClick?: (index: number) => void;
  galleryCaptions?: string[];
  onGalleryCaptionsChange?: (captions: string[]) => void;
}>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [captions, setCaptions] = useState<string[]>(galleryCaptions);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const updateCaption = (i: number, val: string) => {
    const next = [...captions];
    next[i] = val;
    setCaptions(next);
    onGalleryCaptionsChange?.(next);
  };

  const canAdd = editMode && images.length < MAX_GALLERY_IMAGES;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxIndex(null); return; }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((p) => prevPhoto(p, images.length));
        return;
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((p) => nextPhoto(p, images.length));
      }
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [lightboxIndex, images.length]);

  if (images.length === 0 && !editMode) return null;

  return (
    <div className="px-4 pb-8" ref={ref}>
      <SectionHeader>✦ Polaroids</SectionHeader>

      {/* Scattered polaroid wall — flex-wrap gives organic fill, not a rigid grid */}
      <motion.div
        className="flex flex-wrap justify-center gap-5 md:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {images.map((src, i) => {
          const rot = polaroidRot(i);
          const caption = captions[i] ?? "";
          return (
            <motion.div
              key={src}
              variants={{
                hidden: { opacity: 0, scale: 0.8, rotate: rot - 6 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  rotate: rot,
                  transition: { type: "spring", stiffness: 220, damping: 18, delay: i * 0.07 },
                },
              }}
              whileHover={editMode ? {} : { scale: 1.06, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
              style={{ originX: "50%", originY: "100%" }}
              className="relative flex-shrink-0 w-36 md:w-44"
            >
              {/* Polaroid card */}
              <div
                className="relative bg-[#fdf8f2] shadow-[0_4px_20px_rgba(0,0,0,0.55)] cursor-pointer"
                style={{ padding: "6px 6px 0 6px" }}
              >
                {/* Photo area */}
                <button
                  type="button"
                  className="block w-full text-left focus:outline-none"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`View photo ${i + 1} in lightbox`}
                >
                  <PhotoSlot
                    src={src}
                    label={`Photo ${i + 1}`}
                    editMode={editMode}
                    onSlotClick={() => onImageSlotClick?.(i)}
                    className="w-full aspect-square bg-amber-50"
                  />
                </button>

                {/* Polaroid label strip — always visible, warm paper colour */}
                <div className="px-1 pt-2 pb-3 min-h-[2.8rem] flex items-center justify-center">
                  {editMode ? (
                    <input
                      value={caption}
                      onChange={(e) => updateCaption(i, e.target.value)}
                      placeholder="write something…"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-[11px] text-[#7a5c3a] placeholder-[#c0a882]/50 outline-none w-full text-center leading-snug font-[cursive] border-b border-[#d4b896]/40 focus:border-[#c0a882]/80 transition-colors"
                    />
                  ) : (
                    caption && (
                      <p className="text-[11px] text-[#7a5c3a] italic text-center leading-snug font-[cursive] select-none">
                        {caption}
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* Tape strip at top — warm decorative touch */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-amber-100/70 border border-amber-200/60"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}
              />
            </motion.div>
          );
        })}

        {/* Add photo tile — matches polaroid footprint */}
        {canAdd && (
          <motion.div
            variants={fadeUp}
            className="relative flex-shrink-0 w-36 md:w-44"
            style={{ transform: `rotate(${polaroidRot(images.length)}deg)` }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onImageSlotClick?.(images.length)}
              className="w-full bg-[#15100a] border-2 border-dashed border-[#a07040]/25 hover:border-[#a07040]/60 aspect-[3/4] flex flex-col items-center justify-center gap-2 text-[#a07040]/40 hover:text-[#d4a96a] transition-colors"
              aria-label="Add photo"
            >
              <Plus size={22} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Add Photo</span>
              <span className="text-[9px] text-[#a07040]/25 mt-0.5">{images.length} / {MAX_GALLERY_IMAGES}</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* Polaroid-framed lightbox image */}
            <motion.div
              key={lightboxIndex}
              className="relative bg-[#fdf8f2] shadow-2xl"
              style={{ padding: "10px 10px 52px 10px", maxWidth: "min(88vw, 500px)" }}
              initial={{ scale: 0.82, opacity: 0, rotate: polaroidRot(lightboxIndex) * 2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxIndex]}
                alt={`Gallery photo ${lightboxIndex + 1}`}
                className="w-full object-cover"
                style={{ maxHeight: "70vh" }}
              />
              {/* Caption in polaroid strip */}
              <div className="absolute bottom-0 left-0 right-0 pb-3 pt-2 flex items-center justify-center px-3">
                {captions[lightboxIndex] ? (
                  <p className="text-[13px] text-[#7a5c3a] italic text-center leading-snug font-[cursive]">
                    {captions[lightboxIndex]}
                  </p>
                ) : (
                  <span className="text-[10px] text-[#c0a882]/30 select-none">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Counter when caption present */}
            {captions[lightboxIndex] && (
              <div className="absolute bottom-5 text-white/30 text-xs select-none">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}

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
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => prevPhoto(p, images.length));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => nextPhoto(p, images.length));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Quick Stats ────────────────────────────────────────────────────────────────

function StatsSection({
  stats: initialStats,
  editMode,
  onStatsChange,
}: Readonly<{
  stats: RooftopStat[];
  editMode?: boolean;
  onStatsChange?: (stats: RooftopStat[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [stats, setStats] = useState<Array<RooftopStat & { _k: string }>>(() =>
    initialStats.map((s) => ({ ...s, _k: genKey("st") }))
  );

  const update = (next: Array<RooftopStat & { _k: string }>) => {
    setStats(next);
    onStatsChange?.(next.map(({ label, value }) => ({ label, value })));
  };

  const updateItem = (i: number, patch: Partial<RooftopStat>) =>
    update(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="px-6 pb-5" ref={ref}>
      <SectionHeader>✦ Quick Stats</SectionHeader>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s._k}
            variants={{
              hidden: { opacity: 0, scale: 0.85 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
            }}
            whileHover={editMode ? {} : { scale: 1.05, y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-[#15100a] border border-[#2a1f14] rounded-sm p-5 text-center hover:border-[#a07040]/30 hover:shadow-lg hover:shadow-amber-900/15 transition-shadow duration-300"
          >
            {editMode && (
              <button
                type="button"
                onClick={() => update(stats.filter((_, idx) => idx !== i))}
                className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors"
                aria-label="Remove stat"
              >
                <Trash2 size={12} />
              </button>
            )}

            {editMode ? (
              <input
                value={s.value}
                onChange={(e) => updateItem(i, { value: e.target.value })}
                placeholder="Value"
                className="bg-transparent text-2xl font-black text-[#d4a96a] leading-none w-full text-center outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded placeholder-[#a07040]/20"
              />
            ) : (
              <div className="text-2xl font-black text-[#d4a96a] leading-none">{s.value}</div>
            )}

            {editMode ? (
              <input
                value={s.label}
                onChange={(e) => updateItem(i, { label: e.target.value })}
                placeholder="Label"
                className="bg-transparent text-[11px] text-[#9e8060] mt-2 font-medium uppercase tracking-wider w-full text-center outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded placeholder-white/15"
              />
            ) : (
              <div className="text-[11px] text-white/40 mt-2 font-medium uppercase tracking-wider">
                {s.label}
              </div>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button
            variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } }}
            type="button"
            onClick={() => update([...stats, { value: "—", label: "New stat", _k: genKey("st") }])}
            className="flex items-center justify-center gap-1.5 bg-[#15100a] border border-dashed border-[#a07040]/15 rounded-sm p-5 text-[#a07040]/50 hover:text-[#d4a96a] hover:border-[#a07040]/40 transition-colors"
          >
            <Plus size={14} />
            <span className="text-xs">Add stat</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Evening Timeline ───────────────────────────────────────────────────────────

function TimelineSection({
  timeline: initialTimeline,
  editMode,
  onTimelineChange,
}: Readonly<{
  timeline: RooftopTimelineStep[];
  editMode?: boolean;
  onTimelineChange?: (timeline: RooftopTimelineStep[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [steps, setSteps] = useState<Array<RooftopTimelineStep & { _k: string }>>(() =>
    initialTimeline.map((s) => ({ ...s, _k: genKey("tl") }))
  );

  const update = (next: Array<RooftopTimelineStep & { _k: string }>) => {
    setSteps(next);
    onTimelineChange?.(next.map(({ time, title, description }) => ({ time, title, description })));
  };

  const updateItem = (i: number, patch: Partial<RooftopTimelineStep>) =>
    update(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="px-6 pb-8" ref={ref}>
      <SectionHeader>✦ How the Evening Unfolded</SectionHeader>
      <motion.div
        className="relative ml-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-[#a07040]/20" />
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div key={step._k} variants={fadeUp} className="relative pl-7">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 -translate-x-1/2 w-2 h-2 rounded-full bg-[#d4a96a] ring-4 ring-[#a07040]/10" />

              <div className="flex flex-wrap items-center gap-2 mb-1">
                {editMode ? (
                  <input
                    value={step.time ?? ""}
                    onChange={(e) => updateItem(i, { time: e.target.value })}
                    placeholder="Time"
                    className="bg-[#2a1c0e] border border-[#a07040]/20 text-[10px] font-semibold text-[#d4a96a] rounded-sm px-2 py-0.5 uppercase tracking-wider w-24 outline-none focus:border-[#a07040]/50"
                  />
                ) : (
                  step.time && (
                    <span className="text-[10px] font-semibold text-[#d4a96a] bg-[#2a1c0e] border border-[#a07040]/20 rounded-sm px-2 py-0.5 uppercase tracking-wider">
                      {step.time}
                    </span>
                  )
                )}

                {editMode ? (
                  <input
                    value={step.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    placeholder="Step title"
                    className="bg-transparent text-sm font-bold text-[#f0e8dc] flex-1 outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded placeholder-white/20 min-w-20"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">{step.title}</span>
                )}

                {editMode && (
                  <button
                    type="button"
                    onClick={() => update(steps.filter((_, idx) => idx !== i))}
                    className="ml-auto text-white/20 hover:text-red-400 transition-colors"
                    aria-label="Remove step"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {editMode ? (
                <textarea
                  value={step.description ?? ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder="What happened here…"
                  rows={2}
                  className="bg-transparent text-xs text-[#9e8060] leading-relaxed w-full outline-none focus:ring-1 focus:ring-[#a07040]/20 rounded resize-none placeholder-white/15"
                />
              ) : (
                step.description && (
                  <p className="text-xs text-[#9e8060] leading-relaxed">{step.description}</p>
                )
              )}
            </motion.div>
          ))}

          {editMode && (
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={() =>
                update([
                  ...steps,
                  { time: "", title: "New step", description: "", _k: genKey("tl") },
                ])
              }
              className="relative pl-7 flex items-center gap-2 text-[#a07040]/50 hover:text-[#d4a96a] transition-colors"
            >
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-[#a07040]/40" />
              <Plus size={14} />
              <span className="text-sm">Add step</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * RooftopGlow — Chill Hangout + Food
 * Warm dark bg, full-bleed hero photo with amber gradient overlay,
 * soft orange accents and relaxed typography.
 * Config-driven sections: Vibe Tags, Food & Moment Highlights, Gallery, Quick Stats, Evening Timeline.
 * All new sections are optional and individually toggleable via the `config` prop.
 */
export function RooftopGlow({
  title,
  caption,
  story,
  images = [],
  editMode,
  onTitleChange,
  onCaptionChange,
  onStoryChange,
  onImageSlotClick,
  tags,
  highlights,
  stats,
  timeline,
  config,
  onTagsChange,
  onHighlightsChange,
  onStatsChange,
  onTimelineChange,
  galleryCaptions,
  onGalleryCaptionsChange,
}: RooftopGlowProps) {
  const cfg: Required<RooftopGlowConfig> = { ...DEFAULT_CONFIG, ...config };

  return (
    <div className="w-full font-sans overflow-hidden" style={{ minHeight: 400, background: "#0d0905" }}>
      {/* Hero — full-bleed photo with warm film overlay */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <PhotoSlot
          src={images[0]}
          label="Hero photo"
          editMode={editMode}
          onSlotClick={() => onImageSlotClick?.(0)}
          className="w-full h-full bg-amber-950/30"
          style={{ aspectRatio: "16/9" } as React.CSSProperties}
        />
        {/* Film-grain warm overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, rgba(180,100,20,0.10) 0%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(13,9,5,0.9) 100%)",
          }}
        />
        {/* Film-border — thin dark edge */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/30 pointer-events-none" />

        {/* Date / category stamp — bottom-left over hero */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 pointer-events-none">
          <span className="text-[9px] font-mono font-bold text-amber-300/60 uppercase tracking-[0.22em] bg-black/30 px-2 py-1 backdrop-blur-sm">
            🌆 Chill Hangout
          </span>
        </div>
      </div>

      {/* Hero content — inset journal card */}
      <div className="mx-4 -mt-6 relative z-10">
        <div
          className="bg-[#15100a] border border-[#2a1f14] px-5 pt-5 pb-6"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,200,100,0.04)" }}
        >
          {/* Title */}
          <EditableText
            value={title}
            placeholder="Moment title"
            editMode={editMode}
            onUpdate={onTitleChange}
            className="text-[1.6rem] font-extralight text-[#f0e8dc] tracking-tight leading-snug block mb-1"
          />

          {/* Caption italic */}
          {(caption || editMode) && (
            <EditableText
              value={caption}
              placeholder="Short caption…"
              editMode={editMode}
              onUpdate={onCaptionChange}
              className="text-[13px] text-[#c0a882]/75 italic block mb-3"
            />
          )}

          {/* Thin rule */}
          <div className="my-3 h-px bg-linear-to-r from-[#a07040]/25 via-[#c0a882]/20 to-transparent" />

          {/* Story */}
          {(story || editMode) && (
            <EditableText
              value={story}
              placeholder="Write the story of this evening…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="text-[13px] text-[#9e8060] leading-relaxed block"
              multiline
            />
          )}
        </div>
      </div>

      {/* Section separator */}
      {(cfg.showTags || cfg.showHighlights || cfg.showGallery || cfg.showStats || cfg.showTimeline) && (
        <div className="mx-6 my-6 h-px bg-linear-to-r from-transparent via-[#a07040]/20 to-transparent" />
      )}

      {/* ── Optional sections ── */}
      {cfg.showTags && (
        <VibeTagsSection
          tags={tags ?? DEFAULT_TAGS}
          editMode={editMode}
          onTagsChange={onTagsChange}
        />
      )}

      {cfg.showHighlights && (
        <HighlightsSection
          highlights={highlights ?? DEFAULT_HIGHLIGHTS}
          editMode={editMode}
          onHighlightsChange={onHighlightsChange}
        />
      )}

      {cfg.showGallery && (
        <GallerySection
          images={images.slice(1)}
          editMode={editMode}
          onImageSlotClick={onImageSlotClick ? (i) => onImageSlotClick(i + 1) : undefined}
          galleryCaptions={galleryCaptions}
          onGalleryCaptionsChange={onGalleryCaptionsChange}
        />
      )}

      {cfg.showStats && (
        <StatsSection
          stats={stats ?? DEFAULT_STATS}
          editMode={editMode}
          onStatsChange={onStatsChange}
        />
      )}

      {cfg.showTimeline && (
        <TimelineSection
          timeline={timeline ?? DEFAULT_TIMELINE}
          editMode={editMode}
          onTimelineChange={onTimelineChange}
        />
      )}
    </div>
  );
}
