"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Share2, Heart, Bookmark, X, ChevronLeft, ChevronRight, Plus, Trash2, ImageIcon, Camera } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Highlight {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface Stat {
  readonly label: string;
  readonly value: string;
}

interface TimelineStep {
  readonly time?: string;
  readonly title: string;
  readonly description?: string;
}

interface EnergyRushConfig {
  readonly showGallery?: boolean;
  readonly showStats?: boolean;
  readonly showTimeline?: boolean;
  readonly showHighlights?: boolean;
  readonly showCTA?: boolean;
  readonly showTagCloud?: boolean;
}

interface EnergyRushProps extends TemplateProps {
  readonly heroBackground?: string;
  readonly heroImages?: string[];
  readonly tags?: string[];
  readonly highlights?: Highlight[];
  readonly stats?: Stat[];
  readonly timeline?: TimelineStep[];
  readonly cta?: { readonly primaryText?: string; readonly secondaryText?: string };
  readonly config?: EnergyRushConfig;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHighlightsChange?: (highlights: Highlight[]) => void;
  readonly onStatsChange?: (stats: Stat[]) => void;
  readonly onTimelineChange?: (timeline: TimelineStep[]) => void;
  readonly onCTAChange?: (cta: { primaryText?: string; secondaryText?: string }) => void;
  /** Called when user clicks the hero background slot to upload/replace image */
  readonly onHeroBackgroundClick?: () => void;
  /** Called when user clicks a hero polaroid slot; index 0 or 1 */
  readonly onHeroImagesClick?: (index: number) => void;
  /** Editable badge label (default: Fun & High-Energy) */
  readonly badgeLabel?: string;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ["Bowling", "Arcade", "Laser Tag", "Go-Karting"];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    icon: "🎳",
    title: "Strike of the Night",
    description: "Three strikes in a row — pure chaos ensued and nobody saw it coming.",
  },
  {
    icon: "🕹️",
    title: "Arcade Domination",
    description: "Ran out of tokens before running out of energy. Had to reload twice.",
  },
  {
    icon: "🏎️",
    title: "Last-Lap Overtake",
    description: "Final go-kart round — pure adrenaline, maximum speed, unforgettable.",
  },
];

const DEFAULT_STATS: Stat[] = [
  { label: "Minutes of Chaos", value: "180+" },
  { label: "Rounds Played", value: "12" },
  { label: "MVP", value: "You" },
  { label: "Chaos Level", value: "11/10" },
];

const DEFAULT_TIMELINE: TimelineStep[] = [
  { time: "7:00 PM", title: "Arrived & Geared Up", description: "Shoes, snacks, and big energy. Game faces on." },
  { time: "8:30 PM", title: "Bowling Showdown", description: "Friendly competition that turned surprisingly intense." },
  { time: "10:00 PM", title: "Arcade Chaos", description: "Racing, fighting games, air hockey — all of it." },
  { time: "11:30 PM", title: "Final Round", description: "Go-karts at max speed to close the night right." },
];

const DEFAULT_CONFIG: Required<EnergyRushConfig> = {
  showGallery: true,
  showStats: true,
  showTimeline: true,
  showHighlights: true,
  showCTA: true,
  showTagCloud: true,
};

// Module-level counter for stable React keys (never used for rendering).
let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Polaroid Stack (hero images) ───────────────────────────────────────────────

function PolaroidSlot({
  src,
  bgClass,
  label,
  editMode,
  onClick,
}: Readonly<{
  src?: string;
  bgClass: string;
  label: string;
  editMode?: boolean;
  onClick?: () => void;
}>) {
  if (src) {
    return (
      <div className="relative group w-full aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover" />
        {editMode && (
          <button
            type="button"
            onClick={onClick}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Change ${label}`}
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    );
  }
  if (editMode) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full aspect-square ${bgClass} border-2 border-dashed border-yellow-300 hover:border-yellow-400 transition-colors`}
        aria-label={`Add ${label}`}
      >
        <Camera className="w-5 h-5 text-yellow-500/60" />
        <span className="text-[9px] text-yellow-700/50 mt-1">Add</span>
      </button>
    );
  }
  return <div className={`w-full aspect-square ${bgClass}`} />;
}

function PolaroidStack({
  heroImages,
  editMode,
  onHeroImagesClick,
}: Readonly<{
  heroImages: string[];
  editMode?: boolean;
  onHeroImagesClick?: (index: number) => void;
}>) {
  return (
    <div className="relative" style={{ width: 160, height: 180 }}>
      {/* Back polaroid — slot index 1 */}
      <div
        className="absolute bg-white shadow-xl"
        style={{
          padding: "8px 8px 28px 8px",
          transform: "rotate(4deg) translateX(12px) translateY(-6px)",
          width: 140,
          zIndex: 0,
        }}
      >
        <PolaroidSlot
          src={heroImages[1]}
          bgClass="bg-yellow-50"
          label="hero moment 2"
          editMode={editMode}
          onClick={() => onHeroImagesClick?.(1)}
        />
      </div>
      {/* Front polaroid — slot index 0 */}
      <div
        className="absolute bg-white shadow-2xl"
        style={{
          padding: "8px 8px 28px 8px",
          transform: "rotate(-3deg)",
          width: 140,
          zIndex: 1,
        }}
      >
        <PolaroidSlot
          src={heroImages[0]}
          bgClass="bg-yellow-100"
          label="hero moment 1"
          editMode={editMode}
          onClick={() => onHeroImagesClick?.(0)}
        />
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-yellow-400 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-linear-to-r from-yellow-400/30 to-transparent" />
    </div>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────────

interface HeroProps {
  readonly title: string;
  readonly caption?: string;
  readonly story?: string;
  readonly heroBackground?: string;
  readonly heroImages?: string[];
  readonly tags: string[];
  readonly editMode?: boolean;
  readonly badgeLabel?: string;
  readonly onTitleChange?: (v: string) => void;
  readonly onCaptionChange?: (v: string) => void;
  readonly onStoryChange?: (v: string) => void;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHeroBackgroundClick?: () => void;
  readonly onHeroImagesClick?: (index: number) => void;
}

function HeroSection({
  title,
  caption,
  story,
  heroBackground,
  heroImages = [],
  tags: initialTags,
  editMode,
  badgeLabel: initialBadgeLabel = "🎳 Fun & High-Energy",
  onTitleChange,
  onCaptionChange,
  onStoryChange,
  onTagsChange,
  onHeroBackgroundClick,
  onHeroImagesClick,
}: HeroProps) {
  const [badgeLabel, setBadgeLabel] = useState(initialBadgeLabel);
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");

  const updateTags = (next: string[]) => {
    setTags(next);
    onTagsChange?.(next);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) updateTags([...tags, trimmed]);
    setNewTag("");
  };
  let heroBgSlot: React.ReactNode;
  if (heroBackground) {
    heroBgSlot = (
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroBackground} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
      </div>
    );
  } else if (editMode) {
    // Passive visual hint — the clickable button is rendered at z-20 below
    heroBgSlot = (
      <div className="absolute inset-0 z-0 border-2 border-dashed border-yellow-400/15 bg-yellow-400/3" />
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Cinematic background image / upload slot */}
      {heroBgSlot}

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(250,204,21,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Diagonal accent slashes */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400/10 rotate-45 pointer-events-none z-1" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-yellow-400/5 rotate-12 pointer-events-none z-1" />

      <motion.div
        className="relative z-10 p-6 md:p-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge pill */}
        <motion.div variants={fadeUp} className="mb-5">
          <motion.div
            whileHover={editMode ? {} : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/30 rounded-full px-3 py-1"
          >
            {editMode ? (
              <input
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-yellow-400 uppercase tracking-widest outline-none w-44 placeholder-yellow-400/30"
                placeholder="e.g. 🎳 Fun & High-Energy"
                aria-label="Badge label"
              />
            ) : (
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
                {badgeLabel}
              </span>
            )}
          </motion.div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            <motion.div variants={fadeUp}>
              <EditableText
                value={title}
                placeholder="Bowling night chaos"
                editMode={editMode}
                onUpdate={onTitleChange}
                className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight block"
              />
            </motion.div>

            {/* Inline tag row under title */}
            {(tags.length > 0 || editMode) && (
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-3 items-center">
                <AnimatePresence mode="popLayout">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2.5 py-0.5"
                    >
                      {tag}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => updateTags(tags.filter((t) => t !== tag))}
                          className="text-yellow-400/50 hover:text-yellow-400 transition-colors ml-0.5"
                          aria-label={`Remove ${tag}`}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </motion.span>
                  ))}
                </AnimatePresence>

                {editMode && (
                  <div className="flex items-center gap-1">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                      placeholder="Add tag…"
                      className="bg-yellow-400/10 border border-dashed border-yellow-400/25 text-yellow-300 placeholder-yellow-400/30 text-[11px] rounded-full px-2.5 py-0.5 outline-none focus:border-yellow-400/60 w-24"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="text-yellow-400/50 hover:text-yellow-400 transition-colors"
                      aria-label="Add tag"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {(caption || editMode) && (
              <motion.div variants={fadeUp} className="mt-3">
                <EditableText
                  value={caption}
                  placeholder="Short caption — the vibe in one line…"
                  editMode={editMode}
                  onUpdate={onCaptionChange}
                  className="text-base text-yellow-400/80 font-semibold block"
                />
              </motion.div>
            )}

            {(story || editMode) && (
              <motion.div variants={fadeUp} className="mt-4 pt-4 border-t border-yellow-400/15">
                <EditableText
                  value={story}
                  placeholder="Write the story — what made this night unforgettable…"
                  editMode={editMode}
                  onUpdate={onStoryChange}
                  className="text-sm text-white/60 leading-relaxed block"
                  multiline
                />
              </motion.div>
            )}
          </div>

          {/* Right: polaroid stack or decorative element */}
          <motion.div
            variants={fadeUp}
            className="hidden md:flex items-center justify-center shrink-0 self-center"
          >
            {(heroImages.length > 0 || editMode) ? (
              <PolaroidStack
                heroImages={heroImages}
                editMode={editMode}
                onHeroImagesClick={onHeroImagesClick}
              />
            ) : (
              /* Decorative glow ring when no heroImages provided */
              <div className="relative flex items-center justify-center w-36 h-36">
                <div className="absolute inset-0 rounded-full bg-yellow-400/10 animate-ping [animation-duration:2.5s]" />
                <div className="absolute inset-3 rounded-full bg-yellow-400/15 border border-yellow-400/25" />
                <span className="relative text-5xl z-10 select-none">🎳</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Background edit button — z-20 sibling of z-10 content so it's always clickable */}
      {editMode && (
        <button
          type="button"
          onClick={onHeroBackgroundClick}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 border border-white/15 hover:border-yellow-400/40 text-white/50 hover:text-yellow-400 text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 backdrop-blur-sm transition-all"
        >
          <ImageIcon size={11} />
          {heroBackground ? "Change background" : "Set background"}
        </button>
      )}
    </div>
  );
}

// ── Tag Cloud ──────────────────────────────────────────────────────────────────

function TagCloudSection({
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
    if (trimmed && !tags.includes(trimmed)) {
      update([...tags, trimmed]);
    }
    setNewTag("");
  };

  return (
    <div className="px-6 md:px-8 py-5">
      <SectionHeader>✦ Activities</SectionHeader>
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
              className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-300 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1.5 cursor-default select-none"
            >
              {tag}
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(tags.filter((t) => t !== tag))}
                  className="text-yellow-400/50 hover:text-yellow-400 transition-colors ml-0.5"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag();
              }}
              placeholder="Add activity…"
              className="bg-yellow-400/10 border border-dashed border-yellow-400/25 text-yellow-300 placeholder-yellow-400/30 text-sm rounded-full px-3 py-1.5 outline-none focus:border-yellow-400/60 w-32"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-yellow-400/50 hover:text-yellow-400 transition-colors"
              aria-label="Add activity"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Memory Highlights ──────────────────────────────────────────────────────────

function HighlightsSection({
  highlights: initialHighlights,
  editMode,
  onHighlightsChange,
}: Readonly<{
  highlights: Highlight[];
  editMode?: boolean;
  onHighlightsChange?: (highlights: Highlight[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<Highlight & { _k: string }>>(() =>
    initialHighlights.map((h) => ({ ...h, _k: genKey("hl") }))
  );

  const update = (next: Array<Highlight & { _k: string }>) => {
    setItems(next);
    onHighlightsChange?.(next.map(({ icon, title, description }) => ({ icon, title, description })));
  };

  const updateItem = (i: number, patch: Partial<Highlight>) =>
    update(items.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Memory Highlights</SectionHeader>
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
            className="relative bg-[#111] border border-yellow-400/10 rounded-2xl p-5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/10 transition-shadow duration-300"
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
                className="bg-transparent text-3xl w-12 mb-3 outline-none focus:ring-1 focus:ring-yellow-400/20 rounded"
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
                className="bg-transparent text-sm font-bold text-white w-full outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/20 mb-1.5 block"
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
                className="bg-transparent text-xs text-white/50 leading-relaxed w-full outline-none focus:ring-1 focus:ring-yellow-400/20 rounded resize-none placeholder-white/15"
              />
            ) : (
              <div className="text-xs text-white/50 leading-relaxed">{h.description}</div>
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
            className="flex items-center justify-center gap-2 bg-[#111] border border-dashed border-yellow-400/15 rounded-2xl p-5 text-yellow-400/50 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors min-h-30"
          >
            <Plus size={16} />
            <span className="text-sm">Add highlight</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Media Gallery ──────────────────────────────────────────────────────────────

function GallerySection({
  images,
  editMode,
  onImageSlotClick,
}: Readonly<{
  images: readonly string[];
  editMode?: boolean;
  onImageSlotClick?: (index: number) => void;
}>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  let slots: (string | undefined)[];
  if (images.length > 0) {
    slots = [...images];
  } else if (editMode === true) {
    slots = new Array<string | undefined>(4).fill(undefined);
  } else {
    slots = [];
  }

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((p) => {
          if (p === null) return null;
          return p > 0 ? p - 1 : images.length - 1;
        });
        return;
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((p) => {
          if (p === null) return null;
          return p < images.length - 1 ? p + 1 : 0;
        });
      }
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [lightboxIndex, images.length]);

  if (slots.length === 0) return null;

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Gallery</SectionHeader>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {slots.map((src, i) => (
          <motion.div
            key={src ?? `empty-slot-${i}`}
            variants={fadeUp}
            whileHover={{ scale: 1.04, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white shadow-xl"
            style={{
              padding: "6px 6px 22px 6px",
              transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})`,
            }}
            onClick={() => { if (src) setLightboxIndex(i); }}
          >
            <PhotoSlot
              src={src}
              label={`Photo ${i + 1}`}
              editMode={editMode}
              onSlotClick={() => onImageSlotClick?.(i)}
              className="w-full aspect-square bg-yellow-50"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`Gallery photo ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => {
                      if (p === null) return null;
                      return p > 0 ? p - 1 : images.length - 1;
                    });
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => {
                      if (p === null) return null;
                      return p < images.length - 1 ? p + 1 : 0;
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div className="absolute bottom-4 text-white/40 text-xs select-none">
              {lightboxIndex + 1} / {images.length}
            </div>
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
  stats: Stat[];
  editMode?: boolean;
  onStatsChange?: (stats: Stat[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [stats, setStats] = useState<Array<Stat & { _k: string }>>(() =>
    initialStats.map((s) => ({ ...s, _k: genKey("st") }))
  );

  const update = (next: Array<Stat & { _k: string }>) => {
    setStats(next);
    onStatsChange?.(next.map(({ label, value }) => ({ label, value })));
  };

  const updateItem = (i: number, patch: Partial<Stat>) =>
    update(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
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
            className="relative bg-[#111] border border-yellow-400/10 rounded-2xl p-5 text-center hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/10 transition-shadow duration-300"
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
                className="bg-transparent text-2xl font-black text-yellow-400 leading-none w-full text-center outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-yellow-400/20"
              />
            ) : (
              <div className="text-2xl font-black text-yellow-400 leading-none">{s.value}</div>
            )}

            {editMode ? (
              <input
                value={s.label}
                onChange={(e) => updateItem(i, { label: e.target.value })}
                placeholder="Label"
                className="bg-transparent text-[11px] text-white/40 mt-2 font-medium uppercase tracking-wider w-full text-center outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/15"
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
            className="flex items-center justify-center gap-1.5 bg-[#111] border border-dashed border-yellow-400/15 rounded-2xl p-5 text-yellow-400/50 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors"
          >
            <Plus size={14} />
            <span className="text-xs">Add stat</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────────

function TimelineSection({
  timeline: initialTimeline,
  editMode,
  onTimelineChange,
}: Readonly<{
  timeline: TimelineStep[];
  editMode?: boolean;
  onTimelineChange?: (timeline: TimelineStep[]) => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [steps, setSteps] = useState<Array<TimelineStep & { _k: string }>>(() =>
    initialTimeline.map((s) => ({ ...s, _k: genKey("tl") }))
  );

  const update = (next: Array<TimelineStep & { _k: string }>) => {
    setSteps(next);
    onTimelineChange?.(next.map(({ time, title, description }) => ({ time, title, description })));
  };

  const updateItem = (i: number, patch: Partial<TimelineStep>) =>
    update(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ How the Night Unfolded</SectionHeader>
      <motion.div
        className="relative ml-3"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-yellow-400/20" />
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div key={step._k} variants={fadeUp} className="relative pl-7">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 ring-4 ring-yellow-400/10" />

              <div className="flex flex-wrap items-center gap-2 mb-1">
                {editMode ? (
                  <input
                    value={step.time ?? ""}
                    onChange={(e) => updateItem(i, { time: e.target.value })}
                    placeholder="Time"
                    className="bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-bold text-yellow-400 rounded-full px-2 py-0.5 uppercase tracking-wider w-24 outline-none focus:border-yellow-400/50"
                  />
                ) : (
                  step.time && (
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                      {step.time}
                    </span>
                  )
                )}

                {editMode ? (
                  <input
                    value={step.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    placeholder="Step title"
                    className="bg-transparent text-sm font-bold text-white flex-1 outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/20 min-w-20"
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
                  className="bg-transparent text-xs text-white/50 leading-relaxed w-full outline-none focus:ring-1 focus:ring-yellow-400/20 rounded resize-none placeholder-white/15"
                />
              ) : (
                step.description && (
                  <p className="text-xs text-white/50 leading-relaxed">{step.description}</p>
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
              className="relative pl-7 flex items-center gap-2 text-yellow-400/50 hover:text-yellow-400 transition-colors"
            >
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-yellow-400/40" />
              <Plus size={14} />
              <span className="text-sm">Add step</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── CTA / Footer ───────────────────────────────────────────────────────────────

const SHARE_ICONS = [
  { id: "share", Icon: Share2 },
  { id: "heart", Icon: Heart },
  { id: "bookmark", Icon: Bookmark },
] as const;

function CTASection({
  cta,
  editMode,
  onCTAChange,
}: Readonly<{
  cta?: { readonly primaryText?: string; readonly secondaryText?: string };
  editMode?: boolean;
  onCTAChange?: (cta: { primaryText?: string; secondaryText?: string }) => void;
}>) {
  const [primaryText, setPrimaryText] = useState(cta?.primaryText ?? "Relive this moment");
  const [secondaryText, setSecondaryText] = useState(cta?.secondaryText ?? "Create your own");

  const updatePrimary = (v: string) => {
    setPrimaryText(v);
    onCTAChange?.({ primaryText: v, secondaryText });
  };
  const updateSecondary = (v: string) => {
    setSecondaryText(v);
    onCTAChange?.({ primaryText, secondaryText: v });
  };

  return (
    <div className="px-6 md:px-8 py-6 border-t border-yellow-400/10">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-black text-sm font-bold rounded-full hover:bg-yellow-300 transition-colors"
        >
          {editMode ? (
            <input
              value={primaryText}
              onChange={(e) => updatePrimary(e.target.value)}
              className="bg-transparent text-black font-bold text-sm text-center w-full outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            primaryText
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          className="w-full sm:w-auto px-6 py-2.5 border border-yellow-400/30 text-yellow-400 text-sm font-semibold rounded-full hover:border-yellow-400/60 hover:bg-yellow-400/5 transition-colors"
        >
          {editMode ? (
            <input
              value={secondaryText}
              onChange={(e) => updateSecondary(e.target.value)}
              className="bg-transparent text-yellow-400 font-semibold text-sm text-center w-full outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            secondaryText
          )}
        </motion.button>

        <div className="flex items-center gap-2 sm:ml-auto">
          {SHARE_ICONS.map(({ id, Icon }) => (
            <motion.button
              key={id}
              type="button"
              whileHover={{ scale: 1.2 }}
              className="text-white/30 hover:text-yellow-400 transition-colors p-1.5"
            >
              <Icon size={16} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

/**
 * EnergyRush — Fun & High-Energy
 * Config-driven memory template: bowling / arcade / laser tag / go-karting.
 * All sections are togglable via the `config` prop; defaults to fully visible.
 * Extends TemplateProps with all new fields optional for backward compatibility.
 */
export function EnergyRush({
  title,
  caption,
  story,
  images = [],
  editMode,
  heroBackground,
  heroImages,
  tags,
  highlights,
  stats,
  timeline,
  cta,
  config,
  onTitleChange,
  onCaptionChange,
  onStoryChange,
  onImageSlotClick,
  onTagsChange,
  onHighlightsChange,
  onStatsChange,
  onTimelineChange,
  onCTAChange,
  onHeroBackgroundClick,
  onHeroImagesClick,
  badgeLabel,
}: EnergyRushProps) {
  const cfg: Required<EnergyRushConfig> = { ...DEFAULT_CONFIG, ...config };
  const activeTags = tags ?? DEFAULT_TAGS;

  return (
    <div
      className="relative w-full font-sans overflow-hidden bg-[#090909]"
      style={{ minHeight: 400 }}
    >
      {/* ── Hero (always rendered) ── */}
      <HeroSection
        title={title}
        caption={caption}
        story={story}
        heroBackground={heroBackground}
        heroImages={heroImages}
        tags={activeTags}
        editMode={editMode}
        onTitleChange={onTitleChange}
        onCaptionChange={onCaptionChange}
        onStoryChange={onStoryChange}
        onTagsChange={onTagsChange}
        onHeroBackgroundClick={onHeroBackgroundClick}
        onHeroImagesClick={onHeroImagesClick}
        badgeLabel={badgeLabel}
      />

      {/* Section divider */}
      <div className="mx-6 md:mx-8 my-1 h-px bg-linear-to-r from-transparent via-yellow-400/20 to-transparent" />

      {/* ── Optional sections ── */}
      {cfg.showTagCloud && (
        <TagCloudSection tags={activeTags} editMode={editMode} onTagsChange={onTagsChange} />
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
          images={images}
          editMode={editMode}
          onImageSlotClick={onImageSlotClick}
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
      {cfg.showCTA && <CTASection cta={cta} editMode={editMode} onCTAChange={onCTAChange} />}
    </div>
  );
}
