"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Share2, Heart, Bookmark, X, Plus, Trash2 } from "lucide-react";
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

interface Wish {
  readonly name: string;
  readonly message: string;
}

interface BirthdayConfig {
  readonly showGallery?: boolean;
  readonly showStats?: boolean;
  readonly showTimeline?: boolean;
  readonly showHighlights?: boolean;
  readonly showCTA?: boolean;
  readonly showTagCloud?: boolean;
  readonly showMessage?: boolean;
  readonly showWishes?: boolean;
  readonly showFooter?: boolean;
}

interface BirthdayProps extends TemplateProps {
  readonly heroBackground?: string;
  readonly heroImages?: string[];
  readonly tags?: string[];
  readonly highlights?: Highlight[];
  readonly stats?: Stat[];
  readonly timeline?: TimelineStep[];
  readonly cta?: { readonly primaryText?: string; readonly secondaryText?: string };
  readonly config?: BirthdayConfig;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHighlightsChange?: (highlights: Highlight[]) => void;
  readonly onStatsChange?: (stats: Stat[]) => void;
  readonly onTimelineChange?: (timeline: TimelineStep[]) => void;
  readonly onCTAChange?: (cta: { primaryText?: string; secondaryText?: string }) => void;
  readonly onHeroBackgroundClick?: () => void;
  readonly onHeroImagesClick?: (index: number) => void;
  readonly badgeLabel?: string;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
  readonly wishes?: Wish[];
  readonly onWishesChange?: (wishes: Wish[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ["Cake", "Friends", "Gifts", "Surprise"];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { icon: "🎉", title: "Surprise Scream", description: "The moment when everyone yelled and she covered her face." },
  { icon: "🎂", title: "Cake Time", description: "Candles, wishes, frosting and a crooked smile." },
  { icon: "🎁", title: "Gift Unwrap", description: "Thoughtful, silly, and perfectly unexpected." },
];

const DEFAULT_STATS: Stat[] = [
  { label: "Candles", value: "1" },
  { label: "Guests", value: "12" },
  { label: "Gifts", value: "5" },
  { label: "Songs", value: "3" },
];

const DEFAULT_TIMELINE: TimelineStep[] = [
  { time: "6:00 PM", title: "Guests arrive", description: "Hellos and hugs." },
  { time: "7:30 PM", title: "Dinner", description: "Good food, better company." },
  { time: "9:00 PM", title: "Cake & Wishes", description: "Candles blown, wishes made." },
];

const DEFAULT_CONFIG: Required<BirthdayConfig> = {
  showGallery: true,
  showStats: true,
  showTimeline: true,
  showHighlights: true,
  showCTA: true,
  showTagCloud: true,
  showMessage: true,
  showWishes: true,
  showFooter: true,
};

// Default hero background when none is provided or saved.
const DEFAULT_HERO_BG = "https://usly-media.s3.ap-south-1.amazonaws.com/public/moments/birthday/1.jpg";

let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

// (Confetti removed — kept design elegant and minimal)

// ── Small UI pieces ──────────────────────────────────────────────────────────

function SectionHeader({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-indigo-300 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-linear-to-r from-indigo-300/30 to-transparent" />
    </div>
  );
}

// ── Hero — centered circular hero with playful confetti ──────────────────────

interface HeroProps {
  readonly title: string;
  readonly caption?: string;
  readonly story?: string;
  readonly heroBackground?: string;
  readonly heroImages?: string[];
  readonly tags: string[];
  readonly editMode?: boolean;
  readonly onTitleChange?: (v: string) => void;
  readonly onCaptionChange?: (v: string) => void;
  readonly onStoryChange?: (v: string) => void;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHeroBackgroundClick?: () => void;
  readonly onHeroImagesClick?: (index: number) => void;
  readonly badgeLabel?: string;
}

function HeroSection({ title, story, heroBackground, heroImages = [], editMode, onTitleChange, onStoryChange, onHeroBackgroundClick, onHeroImagesClick, }: HeroProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
      if (!mq) return;
      const onChange = (e: MediaQueryListEvent) => setReducedMotion(!!e.matches);
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      return () => { if (mq.removeEventListener) mq.removeEventListener("change", onChange); };
    } catch {
      /* ignore */
    }
  }, []);

  const openLetter = () => {
    if (editMode && !heroBackground) {
      onHeroBackgroundClick?.();
      return;
    }
    setIsOpen(true);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLetter();
    }
  };

  // Normalize heroImages to an array — templateData may store a single string.
  const heroImagesArr: string[] = Array.isArray(heroImages) ? heroImages : (heroImages ? [String(heroImages)] : []);

  const bgStyle: React.CSSProperties = heroBackground
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(17,24,39,0.55) 100%), url("${heroBackground}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: "linear-gradient(180deg,#0b1220 0%, #111827 100%)" };

  return (
    <div className="relative overflow-hidden rounded-b-2xl" style={bgStyle}>
      <div className="relative z-10 p-8 md:p-12 flex flex-col items-center">
        {editMode && (
          <div className="absolute top-4 right-4">
            <button onClick={() => onHeroBackgroundClick?.()} className="px-3 py-1 rounded-md bg-white/8 text-white text-xs hover:bg-white/12">
              {heroBackground ? "Change background" : "Add background"}
            </button>
          </div>
        )}
        <div className="mb-4 text-sm text-indigo-200">For <EditableText value={title} placeholder="[Name]" editMode={editMode} onUpdate={onTitleChange} className="inline font-semibold text-indigo-100" /></div>

        <div style={{ perspective: 1000 }}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onClick={openLetter}
            onKeyDown={handleKey}
            className="mx-auto relative cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
            style={{ width: 360, maxWidth: "90%" }}
          >
            <div className="relative bg-white/6 rounded-2xl shadow-2xl overflow-hidden" style={{ height: 220 }}>
              <div
                className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/8 to-transparent origin-top"
                style={{
                  transform: isOpen ? "rotateX(-160deg) translateY(-8px)" : "rotateX(0deg)",
                  transformOrigin: "top",
                  transition: reducedMotion ? "none" : "transform 700ms cubic-bezier(.2,.9,.2,1)",
                }}
              />

              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={isOpen ? { y: -18, opacity: 1 } : { y: 120, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.75, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 bg-white rounded-lg shadow p-5 w-[88%] text-left"
                style={{ top: 40 }}
              >
                <EditableText multiline value={story ?? "I wrote something for you..."} placeholder="I wrote something for you..." editMode={editMode} onUpdate={onStoryChange} className="text-sm text-slate-700" />
                <EditableText value={title ?? "Happy Birthday"} placeholder="Happy Birthday" editMode={editMode} onUpdate={onTitleChange} className="text-2xl font-semibold text-slate-900 mt-3" />
                <div className="mt-2 text-sm text-slate-600">— With love</div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={openLetter} type="button" className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white text-slate-900 font-semibold shadow-sm hover:scale-[1.02] transition-transform">
            Open your surprise ↓
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {heroImagesArr.slice(0, 3).map((s, i) => (
            <button key={i} onClick={() => onHeroImagesClick?.(i)} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
          {editMode && heroImagesArr.length < 3 && (
            <button onClick={() => onHeroImagesClick?.(heroImagesArr.length)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/6 text-white/80 border-2 border-dashed border-white/10">
              <Plus size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Message Section (centered card with optional typing) ───────────────────

function MessageSection({ message = "", signature = "— With love", editMode, onMessageChange, typing = false, }: Readonly<{ message?: string; signature?: string; editMode?: boolean; onMessageChange?: (v: string) => void; typing?: boolean; }>) {
  const [local, setLocal] = useState(() => message ?? "");
  const [typed, setTyped] = useState(() => (typing ? "" : (message ?? "")));

  useEffect(() => {
    if (!typing) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      i += 1;
      setTyped(() => (message ?? "").slice(0, i));
      if (i < (message ?? "").length) timer = setTimeout(tick, 20);
    };
    timer = setTimeout(tick, 120);
    return () => { if (timer) clearTimeout(timer); };
  }, [message, typing]);

  const contentToRender = typing ? typed : (message ?? "");
  const isHtml = contentToRender.trim().startsWith("<");

  return (
    <div className="px-6 md:px-8 py-10 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl bg-[#0f0f0f] rounded-2xl p-8 shadow-lg text-white">
        {editMode ? (
          <textarea value={local} onChange={(e) => { setLocal(e.target.value); onMessageChange?.(e.target.value); }} rows={6} className="w-full bg-transparent text-white/90 outline-none resize-none" />
        ) : (
          isHtml ? (
            <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: contentToRender }} />
              <div className="mt-6 text-sm text-white/60">{signature}</div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed">
              {contentToRender.split(/\n\n+/).map((p, i) => (<p key={i}>{p}</p>))}
              <div className="mt-6 text-sm text-white/60">{signature}</div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}

// ── Tag Cloud ──────────────────────────────────────────────────────────────────

function TagCloudSection({ tags: initialTags, editMode, onTagsChange, }: Readonly<{ tags: string[]; editMode?: boolean; onTagsChange?: (tags: string[]) => void; }>) {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");
  const update = (next: string[]) => { setTags(next); onTagsChange?.(next); };
  const addTag = () => { const trimmed = newTag.trim(); if (trimmed && !tags.includes(trimmed)) update([...tags, trimmed]); setNewTag(""); };
  return (
      <div className="px-6 md:px-8 py-5">
      <SectionHeader>✦ Activities</SectionHeader>
      <div className="flex flex-wrap gap-3">
        {tags.map((t) => (
          <div key={t} className="px-4 py-2 rounded-full bg-linear-to-r from-indigo-500/20 to-violet-500/12 text-white/90">{t}</div>
        ))}

        {editMode && (
          <div className="flex items-center gap-2">
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTag(); }} placeholder="Add activity" className="bg-transparent border border-white/8 px-2 py-1 rounded-full text-white/90 outline-none" />
            <button onClick={addTag} className="text-white/80"><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Highlights (compact list) ─────────────────────────────────────────────────

function HighlightsSection({ highlights: initialHighlights, editMode, onHighlightsChange, }: Readonly<{ highlights: Highlight[]; editMode?: boolean; onHighlightsChange?: (highlights: Highlight[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<Highlight & { _k: string }>>(() => initialHighlights.map((h) => ({ ...h, _k: genKey("hl") })));
  const update = (next: Array<Highlight & { _k: string }>) => { setItems(next); onHighlightsChange?.(next.map(({ icon, title, description }) => ({ icon, title, description }))); };
  const updateItem = (i: number, patch: Partial<Highlight>) => update(items.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Highlights</SectionHeader>
      <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {items.map((h, i) => (
          <motion.div key={h._k} variants={fadeUp} className="flex items-start gap-3 bg-[#0f0f0f] rounded-2xl p-4">
            <div className="text-2xl select-none">{h.icon}</div>
            <div className="flex-1">
              {editMode ? (
                <input value={h.title} onChange={(e) => updateItem(i, { title: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-white outline-none" />
              ) : (
                <div className="text-sm font-semibold text-white">{h.title}</div>
              )}
              {editMode ? (
                <textarea value={h.description} onChange={(e) => updateItem(i, { description: e.target.value })} rows={2} className="w-full bg-transparent text-xs text-white/60 mt-1 outline-none resize-none" />
              ) : (
                <div className="text-xs text-white/60 mt-1">{h.description}</div>
              )}
            </div>
            {editMode && <button onClick={() => update(items.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400" aria-label="Remove"><Trash2 size={14} /></button>}
          </motion.div>
        ))}

        {editMode && (
          <motion.button variants={fadeUp} onClick={() => update([...items, { icon: "✨", title: "New", description: "…", _k: genKey("hl") }])} className="flex items-center gap-2 bg-[#0f0f0f] border border-dashed border-white/8 rounded-2xl p-3 text-white/60">
            <Plus size={14} /> Add highlight
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Gallery — cleaner rounded cards ──────────────────────────────────────────

const MAX_GALLERY_IMAGES = Math.max(1, Number(process.env.NEXT_PUBLIC_MAX_GALLERY_IMAGES) || 6);

function GallerySection({ images, editMode, onImageSlotClick, galleryCaptions = [], onGalleryCaptionsChange, }: Readonly<{ images: readonly string[]; editMode?: boolean; onImageSlotClick?: (index: number) => void; galleryCaptions?: string[]; onGalleryCaptionsChange?: (captions: string[]) => void; }>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [captions, setCaptions] = useState<string[]>(galleryCaptions);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const updateCaption = (i: number, val: string) => { const next = [...captions]; next[i] = val; setCaptions(next); onGalleryCaptionsChange?.(next); };
  const canAdd = editMode && images.length < MAX_GALLERY_IMAGES;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxIndex(null); return; }
      if (e.key === "ArrowLeft") setLightboxIndex((p) => (p === null ? null : (p > 0 ? p - 1 : images.length - 1)));
      if (e.key === "ArrowRight") setLightboxIndex((p) => (p === null ? null : (p < images.length - 1 ? p + 1 : 0)));
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [lightboxIndex, images.length]);

  if (images.length === 0 && !editMode) return null;

  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Gallery</SectionHeader>
      <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {images.map((src, i) => (
          <motion.div key={src} variants={fadeUp} className="flex flex-col gap-2">
            <button onClick={() => setLightboxIndex(i)} type="button" className="rounded-2xl overflow-hidden shadow-lg">
              <PhotoSlot src={src} label={`Photo ${i + 1}`} editMode={editMode} onSlotClick={() => onImageSlotClick?.(i)} className="w-full aspect-square" />
            </button>
            {editMode ? (
              <input value={captions[i] ?? ""} onChange={(e) => updateCaption(i, e.target.value)} placeholder="Add a caption…" className="bg-transparent border-b border-white/8 text-[11px] text-white/60 placeholder-white/40 outline-none py-0.5 px-1" />
            ) : (
              captions[i] && <p className="text-[11px] text-white/40 italic text-center px-1">{captions[i]}</p>
            )}
          </motion.div>
        ))}

        {canAdd && (
          <motion.button variants={fadeUp} onClick={() => onImageSlotClick?.(images.length)} type="button" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-2xl aspect-square text-white/60 hover:text-white">
            <Plus size={20} />
            <span className="text-xs">Add Photo</span>
            <span className="text-[10px] text-white/40">{images.length} / {MAX_GALLERY_IMAGES}</span>
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxIndex(null)}>
            <motion.img src={images[lightboxIndex]} key={lightboxIndex} alt={`Gallery ${lightboxIndex}`} className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/60 p-2 rounded-full bg-white/6" aria-label="Close"><X size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stats (circular badges) ─────────────────────────────────────────────────

function StatsSection({ stats: initialStats, editMode, onStatsChange, }: Readonly<{ stats: Stat[]; editMode?: boolean; onStatsChange?: (stats: Stat[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [stats, setStats] = useState<Array<Stat & { _k: string }>>(() => initialStats.map((s) => ({ ...s, _k: genKey("st") })));
  const update = (next: Array<Stat & { _k: string }>) => { setStats(next); onStatsChange?.(next.map(({ label, value }) => ({ label, value }))); };
  const updateItem = (i: number, patch: Partial<Stat>) => update(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Quick Stats</SectionHeader>
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {stats.map((s, i) => (
          <motion.div key={s._k} variants={fadeUp} className="flex flex-col items-center gap-2 bg-[#0f0f0f] rounded-2xl p-4">
            {editMode ? (
              <input value={s.value} onChange={(e) => updateItem(i, { value: e.target.value })} className="bg-transparent text-2xl font-black text-white text-center outline-none" />
            ) : (
              <div className="text-2xl font-black text-white">{s.value}</div>
            )}
            {editMode ? (
              <input value={s.label} onChange={(e) => updateItem(i, { label: e.target.value })} className="bg-transparent text-xs text-white/60 text-center outline-none" />
            ) : (
              <div className="text-xs text-white/60 uppercase">{s.label}</div>
            )}
          </motion.div>
        ))}

        {editMode && (
          <motion.button variants={fadeUp} onClick={() => update([...stats, { value: "—", label: "New", _k: genKey("st") }])} className="flex items-center justify-center gap-2 bg-[#0f0f0f] border border-dashed border-white/8 rounded-2xl p-4 text-white/60">
            <Plus size={14} /> Add stat
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ── Timeline (condensed) ────────────────────────────────────────────────────

function TimelineSection({ timeline: initialTimeline, editMode, onTimelineChange, }: Readonly<{ timeline: TimelineStep[]; editMode?: boolean; onTimelineChange?: (timeline: TimelineStep[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [steps, setSteps] = useState<Array<TimelineStep & { _k: string }>>(() => initialTimeline.map((s) => ({ ...s, _k: genKey("tl") })));
  const update = (next: Array<TimelineStep & { _k: string }>) => { setSteps(next); onTimelineChange?.(next.map(({ time, title, description }) => ({ time, title, description }))); };
  const updateItem = (i: number, patch: Partial<TimelineStep>) => update(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Timeline</SectionHeader>
      <motion.div className="flex flex-col gap-3" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {steps.map((s, i) => (
          <motion.div key={s._k} variants={fadeUp} className="flex items-start gap-3">
            <div className="w-10 text-xs text-white/60">{s.time}</div>
            <div className="flex-1 bg-[#0f0f0f] rounded-2xl p-3">
              {editMode ? (
                <input value={s.title} onChange={(e) => updateItem(i, { title: e.target.value })} className="w-full bg-transparent outline-none text-sm text-white" />
              ) : (
                <div className="text-sm font-semibold text-white">{s.title}</div>
              )}
              {editMode ? (
                <textarea value={s.description ?? ""} onChange={(e) => updateItem(i, { description: e.target.value })} rows={2} className="w-full bg-transparent text-xs text-white/60 mt-1 outline-none resize-none" />
              ) : (
                s.description && <div className="text-xs text-white/60 mt-1">{s.description}</div>
              )}
            </div>
          </motion.div>
        ))}
        {editMode && <motion.button variants={fadeUp} onClick={() => update([...steps, { time: "", title: "New step", description: "", _k: genKey("tl") }])} className="text-white/60 flex items-center gap-2"><Plus size={14} /> Add step</motion.button>}
      </motion.div>
    </div>
  );
}

// ── CTA / Footer ─────────────────────────────────────────────────────────────

const SHARE_ICONS = [ { id: "share", Icon: Share2 }, { id: "heart", Icon: Heart }, { id: "bookmark", Icon: Bookmark } ] as const;

function CTASection({ cta, editMode, onCTAChange, }: Readonly<{ cta?: { readonly primaryText?: string; readonly secondaryText?: string }; editMode?: boolean; onCTAChange?: (cta: { primaryText?: string; secondaryText?: string }) => void; }>) {
  const [primaryText, setPrimaryText] = useState(cta?.primaryText ?? "Relive the celebration");
  const [secondaryText, setSecondaryText] = useState(cta?.secondaryText ?? "Make your own party");
  const updatePrimary = (v: string) => { setPrimaryText(v); onCTAChange?.({ primaryText: v, secondaryText }); };
  const updateSecondary = (v: string) => { setSecondaryText(v); onCTAChange?.({ primaryText, secondaryText: v }); };
  return (
    <div className="px-6 md:px-8 py-6 border-t border-white/8">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="w-full sm:w-auto px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:opacity-90">
          {editMode ? (<input value={primaryText} onChange={(e) => updatePrimary(e.target.value)} className="bg-transparent text-black font-bold text-sm text-center w-full outline-none" />) : primaryText}
        </motion.button>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="w-full sm:w-auto px-6 py-2.5 border border-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/6">
          {editMode ? (<input value={secondaryText} onChange={(e) => updateSecondary(e.target.value)} className="bg-transparent text-white font-semibold text-sm text-center w-full outline-none" />) : secondaryText}
        </motion.button>

        <div className="flex items-center gap-2 sm:ml-auto">
          {SHARE_ICONS.map(({ id, Icon }) => (<motion.button key={id} type="button" whileHover={{ scale: 1.2 }} className="text-white/40 p-1.5"><Icon size={16} /></motion.button>))}
        </div>
      </div>
    </div>
  );
}

// ── Wishes (list + optional add form) ───────────────────────────────────────

function WishesSection({ initialWishes = [], editMode, onWishesChange, }: Readonly<{ initialWishes?: Wish[]; editMode?: boolean; onWishesChange?: (w: Wish[]) => void; }>) {
  const [wishes, setWishes] = useState<Array<Wish & { _k: string }>>(() => (initialWishes ?? []).map((w) => ({ ...w, _k: genKey("w") })));
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const update = (next: Array<Wish & { _k: string }>) => { setWishes(next); onWishesChange?.(next); };
  const add = () => {
    const n = name.trim();
    const m = msg.trim();
    if (!n && !m) return;
    const next = [...wishes, { name: n || "Anonymous", message: m || "🎉", _k: genKey("w") }];
    update(next);
    setName(""); setMsg("");
  };
  const remove = (k: string) => update(wishes.filter((w) => w._k !== k));

  return (
    <div className="px-6 md:px-8 py-6">
      <SectionHeader>✦ Wishes</SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {wishes.map((w) => (
          <div key={w._k} className="bg-[#0f0f0f] rounded-2xl p-4">
            <div className="text-sm font-semibold text-white">{w.name}</div>
            <div className="text-xs text-white/60 mt-2">{w.message}</div>
            {editMode && <button onClick={() => remove(w._k)} className="mt-3 text-white/40" aria-label="Remove wish"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-transparent border border-white/8 px-3 py-2 rounded-lg flex-1 outline-none" />
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your wish" className="bg-transparent border border-white/8 px-3 py-2 rounded-lg flex-2 outline-none" />
        <button onClick={add} className="bg-white text-black px-4 py-2 rounded-full">Add</button>
      </div>
    </div>
  );
}

// ── Footer (minimal) ───────────────────────────────────────────────────────

function FooterSection() {
  return (
    <footer className="px-6 md:px-8 py-8 text-center text-white/60">
      <div>Made with love 💖</div>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function BirthdayBash({ title, caption, story, images = [], editMode, heroBackground, heroImages, tags, highlights, stats, timeline, cta, config, onTitleChange, onCaptionChange, onStoryChange, onImageSlotClick, onTagsChange, onHighlightsChange, onStatsChange, onTimelineChange, onCTAChange, onHeroBackgroundClick, onHeroImagesClick, badgeLabel, galleryCaptions, onGalleryCaptionsChange, wishes, onWishesChange, }: BirthdayProps) {
  const cfg: Required<BirthdayConfig> = { ...DEFAULT_CONFIG, ...config };
  const activeTags = tags ?? DEFAULT_TAGS;

  return (
    <div className="relative w-full font-sans overflow-hidden bg-[#07070a]" style={{ minHeight: 420 }}>
      <HeroSection
        title={title}
        caption={caption}
        story={story}
        heroBackground={(heroBackground && String(heroBackground).trim()) ? heroBackground : DEFAULT_HERO_BG}
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

      <div className="mx-6 md:mx-8 my-1 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />

      {cfg.showMessage && ( (story ?? "").trim().length === 0 ) && (
        <MessageSection message={story} editMode={editMode} onMessageChange={onStoryChange} typing={false} />
      )}

      {cfg.showTagCloud && <TagCloudSection tags={activeTags} editMode={editMode} onTagsChange={onTagsChange} />}
      {cfg.showHighlights && <HighlightsSection highlights={highlights ?? DEFAULT_HIGHLIGHTS} editMode={editMode} onHighlightsChange={onHighlightsChange} />}
      {cfg.showGallery && <GallerySection images={images} editMode={editMode} onImageSlotClick={onImageSlotClick} galleryCaptions={galleryCaptions} onGalleryCaptionsChange={onGalleryCaptionsChange} />}
      {cfg.showStats && <StatsSection stats={stats ?? DEFAULT_STATS} editMode={editMode} onStatsChange={onStatsChange} />}
      {cfg.showTimeline && <TimelineSection timeline={timeline ?? DEFAULT_TIMELINE} editMode={editMode} onTimelineChange={onTimelineChange} />}

      {cfg.showWishes && <WishesSection initialWishes={wishes ?? []} editMode={editMode} onWishesChange={onWishesChange} />}

      {cfg.showCTA && <CTASection cta={cta} editMode={editMode} onCTAChange={onCTAChange} />}

      {cfg.showFooter && <FooterSection />}
    </div>
  );
}
