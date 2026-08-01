"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Share2, Heart, Bookmark, X, ChevronLeft, ChevronRight, Plus, Trash2, ImageIcon, Camera, Coins } from "lucide-react";
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
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
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

  // Alternate scatter/tilt per ticket so the strip reads like real spooled-out tickets, not a grid
  const TICKET_TILT = [-2.5, 1.5, -1, 2, -1.5, 1] as const;

  return (
    <div className="px-6 md:px-8 py-6" ref={ref}>
      <SectionHeader>🎟️ Prize Tickets</SectionHeader>
      <motion.div
        className="flex flex-wrap gap-x-2 gap-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {items.map((h, i) => (
          <motion.div
            key={h._k}
            variants={fadeUp}
            whileHover={editMode ? {} : { scale: 1.04, rotate: 0, y: -4, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ rotate: `${TICKET_TILT[i % TICKET_TILT.length]}deg` }}
            className="relative w-44 shrink-0"
          >
            {/* Ticket body: perforated notches punched into left/right edges via matching-bg circles */}
            <div className="relative bg-yellow-400/6 border-2 border-dashed border-yellow-400/30 rounded-md pt-3 pb-3 px-3 hover:border-yellow-400/60 hover:bg-yellow-400/10 transition-colors duration-300">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#090909]" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#090909]" />

              {editMode && (
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 text-white/20 hover:text-red-400 transition-colors z-10"
                  aria-label="Remove highlight"
                >
                  <Trash2 size={13} />
                </button>
              )}

              {/* Top stub: icon + ticket number, like a skee-ball redemption ticket header */}
              <div className="flex items-center justify-between mb-1.5">
                {editMode ? (
                  <input
                    value={h.icon}
                    onChange={(e) => updateItem(i, { icon: e.target.value })}
                    className="bg-transparent text-2xl w-10 outline-none focus:ring-1 focus:ring-yellow-400/20 rounded"
                    maxLength={4}
                    aria-label="Icon emoji"
                  />
                ) : (
                  <span className="text-2xl select-none">{h.icon}</span>
                )}
                <span className="font-mono text-[9px] font-bold text-yellow-400/50 tracking-widest tabular-nums">
                  NO.{String(i + 1).padStart(4, "0")}
                </span>
              </div>

              {/* Tear line */}
              <div className="border-t border-dashed border-yellow-400/25 my-1.5" />

              {editMode ? (
                <input
                  value={h.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="Moment title"
                  className="bg-transparent text-xs font-black text-white uppercase tracking-wide w-full outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/20 mb-1 block"
                />
              ) : (
                <div className="text-xs font-black text-white uppercase tracking-wide mb-1">{h.title}</div>
              )}

              {editMode ? (
                <textarea
                  value={h.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder="Short description…"
                  rows={3}
                  className="bg-transparent text-[11px] text-white/50 leading-relaxed w-full outline-none focus:ring-1 focus:ring-yellow-400/20 rounded resize-none placeholder-white/15"
                />
              ) : (
                <div className="text-[11px] text-white/50 leading-relaxed">{h.description}</div>
              )}

              <div className="mt-2 text-center font-mono text-[8px] text-yellow-400/25 tracking-[0.3em] uppercase select-none">
                ✧ Redeem for prizes ✧
              </div>
            </div>
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
            className="w-44 shrink-0 flex flex-col items-center justify-center gap-2 bg-yellow-400/3 border-2 border-dashed border-yellow-400/15 rounded-md p-5 text-yellow-400/50 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors min-h-28"
          >
            <Plus size={16} />
            <span className="text-xs">Add ticket</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Media Gallery ──────────────────────────────────────────────────────────────

const MAX_GALLERY_IMAGES = Math.max(1, Number(process.env.NEXT_PUBLIC_MAX_GALLERY_IMAGES) || 6);

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

  if (images.length === 0 && !editMode) return null;

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Gallery</SectionHeader>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {images.map((src, i) => (
          <motion.div
            key={src}
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col gap-1.5"
          >
            <button
              type="button"
              className="bg-white shadow-xl cursor-pointer text-left w-full"
              style={{
                padding: "6px 6px 22px 6px",
                transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})`,
              }}
              onClick={() => setLightboxIndex(i)}
              aria-label={`View photo ${i + 1} in lightbox`}
            >
              <PhotoSlot
                src={src}
                label={`Photo ${i + 1}`}
                editMode={editMode}
                onSlotClick={() => onImageSlotClick?.(i)}
                className="w-full aspect-square bg-yellow-50"
              />
            </button>
            {/* Per-photo caption */}
            {editMode ? (
              <input
                value={captions[i] ?? ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="Add a caption…"
                className="bg-transparent border-b border-yellow-400/20 focus:border-yellow-400/50 text-[11px] text-white/50 placeholder-yellow-400/25 outline-none py-0.5 px-1 w-full transition-colors"
              />
            ) : (
              captions[i] && (
                <p className="text-[11px] text-white/40 italic text-center px-1 leading-snug">
                  {captions[i]}
                </p>
              )
            )}
          </motion.div>
        ))}

        {/* Add photo button */}
        {canAdd && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => onImageSlotClick?.(images.length)}
            className="flex flex-col items-center justify-center gap-2 bg-yellow-400/5 border-2 border-dashed border-yellow-400/20 hover:border-yellow-400/50 aspect-square text-yellow-400/50 hover:text-yellow-400 transition-colors"
            aria-label="Add photo"
          >
            <Plus size={20} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Add Photo</span>
            <span className="text-[9px] text-yellow-400/30">{images.length} / {MAX_GALLERY_IMAGES}</span>
          </motion.button>
        )}
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

            {captions[lightboxIndex] && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-4 py-2 rounded-full max-w-xs text-center pointer-events-none">
                {captions[lightboxIndex]}
              </div>
            )}

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

  const digitGlow: React.CSSProperties = {
    textShadow: "0 0 6px rgba(250,204,21,0.7), 0 0 18px rgba(250,204,21,0.35)",
  };

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ High Score</SectionHeader>
      {/* Arcade cabinet marquee frame around the score display */}
      <motion.div
        className="relative bg-black border-4 border-yellow-400/25 rounded-md p-4 md:p-5 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Bolt/rivet details on the cabinet frame corners */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400/20" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-y divide-yellow-400/10 md:divide-y-0 md:divide-x">
          {stats.map((s, i) => (
            <motion.div
              key={s._k}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
              }}
              className="relative text-center px-2 py-3 md:py-1 md:first:pl-0 md:last:pr-0"
            >
              {editMode && (
                <button
                  type="button"
                  onClick={() => update(stats.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 text-white/20 hover:text-red-400 transition-colors"
                  aria-label="Remove stat"
                >
                  <Trash2 size={12} />
                </button>
              )}

              <div className="font-mono text-[9px] text-yellow-400/40 uppercase tracking-[0.2em] mb-1">
                P{i + 1}
              </div>

              {editMode ? (
                <input
                  value={s.value}
                  onChange={(e) => updateItem(i, { value: e.target.value })}
                  placeholder="000"
                  style={digitGlow}
                  className="bg-transparent font-mono text-2xl md:text-3xl font-bold text-yellow-400 tabular-nums leading-none w-full text-center outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-yellow-400/20"
                />
              ) : (
                <div
                  style={digitGlow}
                  className="font-mono text-2xl md:text-3xl font-bold text-yellow-400 tabular-nums leading-none"
                >
                  {s.value}
                </div>
              )}

              {editMode ? (
                <input
                  value={s.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder="Label"
                  className="bg-transparent text-[10px] text-yellow-100/40 mt-1.5 font-mono uppercase tracking-wider w-full text-center outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/15"
                />
              ) : (
                <div className="text-[10px] text-yellow-100/40 mt-1.5 font-mono uppercase tracking-wider">
                  {s.label}
                </div>
              )}
            </motion.div>
          ))}

          {editMode && (
            <motion.button
              variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
              type="button"
              onClick={() => update([...stats, { value: "000", label: "New stat", _k: genKey("st") }])}
              className="flex items-center justify-center gap-1.5 text-yellow-400/40 hover:text-yellow-400 transition-colors py-3"
            >
              <Plus size={14} />
              <span className="text-xs font-mono">Add</span>
            </motion.button>
          )}
        </div>
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

  // Cycle of level icons — bowling → arcade → go-kart → repeat, like world-map stage nodes
  const LEVEL_ICONS = ["🎳", "🕹️", "🏎️", "⭐"] as const;

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Level Select</SectionHeader>
      <motion.div
        className="relative overflow-x-auto pb-2"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div className="flex items-start gap-1 min-w-max px-1 pt-6">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const bump = i % 2 === 0 ? "-translate-y-2" : "translate-y-2";
            return (
              <div key={step._k} className="flex items-start">
                <motion.div variants={fadeUp} className={`relative flex flex-col items-center w-32 ${bump}`}>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => update(steps.filter((_, idx) => idx !== i))}
                      className="absolute -top-5 right-0 text-white/20 hover:text-red-400 transition-colors"
                      aria-label="Remove level"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {/* Level node — a game-map stage marker, not a timeline dot */}
                  <div className="relative w-14 h-14 rounded-full bg-[#111] border-2 border-yellow-400/50 flex items-center justify-center shadow-[0_0_14px_rgba(250,204,21,0.15)]">
                    <span className="text-2xl select-none">{LEVEL_ICONS[i % LEVEL_ICONS.length]}</span>
                    <span className="absolute -bottom-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#090909]">
                      {i + 1}
                    </span>
                  </div>

                  {editMode ? (
                    <input
                      value={step.time ?? ""}
                      onChange={(e) => updateItem(i, { time: e.target.value })}
                      placeholder="Time"
                      className="bg-yellow-400/10 border border-yellow-400/20 text-[9px] font-bold text-yellow-400 rounded-full px-2 py-0.5 uppercase tracking-wider mt-2 w-full text-center outline-none focus:border-yellow-400/50"
                    />
                  ) : (
                    step.time && (
                      <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5 uppercase tracking-wider mt-2">
                        {step.time}
                      </span>
                    )
                  )}

                  {editMode ? (
                    <input
                      value={step.title}
                      onChange={(e) => updateItem(i, { title: e.target.value })}
                      placeholder="Level name"
                      className="bg-transparent text-xs font-bold text-white text-center w-full mt-1.5 outline-none focus:ring-1 focus:ring-yellow-400/20 rounded placeholder-white/20"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white text-center mt-1.5">{step.title}</span>
                  )}

                  {editMode ? (
                    <textarea
                      value={step.description ?? ""}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      placeholder="What happened…"
                      rows={2}
                      className="bg-transparent text-[10px] text-white/50 leading-relaxed w-full text-center mt-1 outline-none focus:ring-1 focus:ring-yellow-400/20 rounded resize-none placeholder-white/15"
                    />
                  ) : (
                    step.description && (
                      <p className="text-[10px] text-white/50 leading-relaxed text-center mt-1">
                        {step.description}
                      </p>
                    )
                  )}
                </motion.div>

                {/* Connecting path segment between level nodes */}
                {!isLast && (
                  <div
                    className={`w-10 h-0.5 bg-linear-to-r from-yellow-400/50 to-yellow-400/50 mt-7 shrink-0 ${
                      i % 2 === 0 ? "-translate-y-2" : "translate-y-2"
                    }`}
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, rgba(250,204,21,0.5) 0 4px, transparent 4px 8px)",
                    }}
                  />
                )}
              </div>
            );
          })}

          {editMode && (
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={() =>
                update([
                  ...steps,
                  { time: "", title: "New level", description: "", _k: genKey("tl") },
                ])
              }
              className="flex flex-col items-center justify-center gap-1.5 w-32 text-yellow-400/50 hover:text-yellow-400 transition-colors shrink-0"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-yellow-400/30 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="text-xs">Add level</span>
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
    <div className="relative px-6 md:px-8 py-8 border-t border-yellow-400/10 bg-[repeating-linear-gradient(135deg,rgba(250,204,21,0.02)_0px,rgba(250,204,21,0.02)_10px,transparent_10px,transparent_20px)] text-center overflow-hidden">
      {/* Blinking arcade-cabinet prompt */}
      <motion.div
        animate={{ opacity: [1, 1, 0.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.5, 0.75, 1] }}
        className="font-mono text-[11px] font-bold text-yellow-400 uppercase tracking-[0.35em] mb-4 flex items-center justify-center gap-2"
      >
        <Coins size={13} />
        Insert Coin to Continue
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          className="relative px-8 py-3 bg-yellow-400 text-black text-sm font-black uppercase tracking-widest rounded-sm hover:bg-yellow-300 transition-colors shadow-[0_0_25px_rgba(250,204,21,0.35)]"
        >
          {editMode ? (
            <input
              value={primaryText}
              onChange={(e) => updatePrimary(e.target.value)}
              className="bg-transparent text-black font-black text-sm uppercase tracking-widest text-center w-full outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>▶ {primaryText}</>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          className="text-yellow-400/60 text-xs font-mono uppercase tracking-widest hover:text-yellow-400 transition-colors underline decoration-dashed underline-offset-4"
        >
          {editMode ? (
            <input
              value={secondaryText}
              onChange={(e) => updateSecondary(e.target.value)}
              className="bg-transparent text-yellow-400/60 font-mono text-xs uppercase tracking-widest text-center outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            secondaryText
          )}
        </motion.button>

        <div className="flex items-center gap-3 mt-2">
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
  galleryCaptions,
  onGalleryCaptionsChange,
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
      {cfg.showCTA && <CTASection cta={cta} editMode={editMode} onCTAChange={onCTAChange} />}
    </div>
  );
}
