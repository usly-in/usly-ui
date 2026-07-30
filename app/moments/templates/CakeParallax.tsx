"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence, useInView } from "framer-motion";
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

interface CakeConfig {
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

interface CakeProps extends TemplateProps {
  readonly heroBackground?: string;
  readonly cakeLayers?: string[];
  readonly tags?: string[];
  readonly highlights?: Highlight[];
  readonly stats?: Stat[];
  readonly timeline?: TimelineStep[];
  readonly cta?: { readonly primaryText?: string; readonly secondaryText?: string };
  readonly config?: CakeConfig;
  readonly onTagsChange?: (tags: string[]) => void;
  readonly onHighlightsChange?: (highlights: Highlight[]) => void;
  readonly onStatsChange?: (stats: Stat[]) => void;
  readonly onTimelineChange?: (timeline: TimelineStep[]) => void;
  readonly onCTAChange?: (cta: { primaryText?: string; secondaryText?: string }) => void;
  readonly onHeroBackgroundClick?: () => void;
  readonly onCakeLayerClick?: (index: number) => void;
  readonly badgeLabel?: string;
  readonly galleryCaptions?: string[];
  readonly onGalleryCaptionsChange?: (captions: string[]) => void;
  readonly wishes?: Wish[];
  readonly onWishesChange?: (wishes: Wish[]) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ["Cake", "Friends", "Candles", "Singing"];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { icon: "🎂", title: "Cutting the cake", description: "That perfect awkward half-second smile before the bite." },
  { icon: "🕯️", title: "Make a wish", description: "Eyes closed, breath held, then the big blow." },
  { icon: "📸", title: "Photo ops", description: "Silly hats, bad singing, and lots of laughs." },
];

const DEFAULT_STATS: Stat[] = [
  { label: "Guests", value: "12" },
  { label: "Candles", value: "1" },
  { label: "Gifts", value: "4" },
  { label: "Songs", value: "3" },
];

const DEFAULT_TIMELINE: TimelineStep[] = [
  { time: "6:00 PM", title: "Guests arrive", description: "Hellos and hugs." },
  { time: "7:30 PM", title: "Dinner", description: "Sharing stories over food." },
  { time: "9:00 PM", title: "Cake time", description: "Candles and wishes." },
];

const DEFAULT_SECTION_CONFIG: Required<CakeConfig> = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeLayers(layers?: readonly string[] | string) {
  if (!layers) return [] as string[];
  return Array.isArray(layers) ? [...layers] : [String(layers)];
}

let _uid = 0;
const genKey = (p: string) => `${p}-${_uid++}`;

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.36 } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

function SectionHeader({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-indigo-300 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-linear-to-r from-indigo-300/30 to-transparent" />
    </div>
  );
}

// ── Hero (3D layered cake with parallax) ──────────────────────────────────────

function HeroSection({ title, story, heroBackground, cakeLayers = [], editMode, onTitleChange, onStoryChange, onHeroBackgroundClick, onCakeLayerClick, }: Readonly<{ title: string; story?: string; heroBackground?: string; cakeLayers?: string[]; editMode?: boolean; onTitleChange?: (v: string) => void; onStoryChange?: (v: string) => void; onHeroBackgroundClick?: () => void; onCakeLayerClick?: (index: number) => void; }>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref });

  // Always create transforms for three depths to keep hooks stable across renders
  const depth = [1, 0.6, 0.32];
  const t0y = useTransform(scrollYProgress, [0, 1], [0, -120 * depth[0]]);
  const t0rx = useTransform(scrollYProgress, [0, 1], [0, -6 * depth[0]]);
  const t0ry = useTransform(scrollYProgress, [0, 1], [0, 4 * depth[0]]);

  const t1y = useTransform(scrollYProgress, [0, 1], [0, -120 * depth[1]]);
  const t1rx = useTransform(scrollYProgress, [0, 1], [0, -5 * depth[1]]);
  const t1ry = useTransform(scrollYProgress, [0, 1], [0, 3 * depth[1]]);

  const t2y = useTransform(scrollYProgress, [0, 1], [0, -120 * depth[2]]);
  const t2rx = useTransform(scrollYProgress, [0, 1], [0, -4 * depth[2]]);
  const t2ry = useTransform(scrollYProgress, [0, 1], [0, 2 * depth[2]]);

  const transforms = [
    { y: reduced ? 0 : t0y, rotateX: reduced ? 0 : t0rx, rotateY: reduced ? 0 : t0ry },
    { y: reduced ? 0 : t1y, rotateX: reduced ? 0 : t1rx, rotateY: reduced ? 0 : t1ry },
    { y: reduced ? 0 : t2y, rotateX: reduced ? 0 : t2rx, rotateY: reduced ? 0 : t2ry },
  ];

  const layers = normalizeLayers(cakeLayers);

  const bgStyle: React.CSSProperties = heroBackground
    ? { backgroundImage: `linear-gradient(180deg, rgba(11,18,32,0.45) 0%, rgba(17,24,39,0.45) 100%), url("${heroBackground}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(180deg,#0b1220 0%, #111827 100%)" };

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ minHeight: 520, ...bgStyle }}>
      <div className="p-8 md:p-12 flex flex-col items-center" style={{ perspective: 950 }}>
        <div className="mb-4 text-sm text-indigo-200">For <EditableText value={title} placeholder="[Name]" editMode={editMode} onUpdate={onTitleChange} className="inline font-semibold text-indigo-100" /></div>

        {editMode && (
          <div className="absolute top-4 right-4">
            <button onClick={() => onHeroBackgroundClick?.()} className="px-3 py-1 rounded-md bg-white/8 text-white text-xs hover:bg-white/12">{heroBackground ? "Change background" : "Add background"}</button>
          </div>
        )}

        <div className="relative w-full max-w-3xl h-105 flex items-center justify-center">
          <div className="relative w-90 h-90 md:w-105 md:h-105" style={{ transformStyle: "preserve-3d" }}>
            {layers.length === 0 && (
              <div className="absolute inset-0 rounded-2xl bg-white/4 flex items-center justify-center text-white/60">{editMode ? (<button onClick={() => onCakeLayerClick?.(0)} className="px-3 py-2 bg-white/6 rounded">Add cake layer</button>) : (<div className="text-sm">No cake image</div>)}</div>
            )}

            {layers.map((src, i) => {
              const t = transforms[Math.min(i, transforms.length - 1)];
              return (
                <motion.div key={i} style={{ y: t.y, rotateX: t.rotateX, rotateY: t.rotateY }} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <button type="button" onClick={() => onCakeLayerClick?.(i)} className="w-full h-full">
                    <PhotoSlot src={src} label={`Cake layer ${i + 1}`} editMode={editMode} onSlotClick={() => onCakeLayerClick?.(i)} className="w-full h-full object-cover" />
                  </button>
                </motion.div>
              );
            })}

            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 text-center">
              <EditableText value={story ?? "Happy Birthday"} placeholder="Write a short note" editMode={editMode} onUpdate={onStoryChange} className="text-sm text-white/90 bg-black/20 px-4 py-2 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="button" className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white text-slate-900 font-semibold shadow-sm hover:scale-[1.02] transition-transform">Explore the moment</button>
        </div>
      </div>
    </div>
  );
}

// ── Message Section ──────────────────────────────────────────────────────────

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
      if (i < (message ?? "").length) timer = setTimeout(tick, 18);
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
            <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed"><div dangerouslySetInnerHTML={{ __html: contentToRender }} /><div className="mt-6 text-sm text-white/60">{signature}</div></div>
          ) : (
            <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed">{contentToRender.split(/\n\n+/).map((p, i) => (<p key={i}>{p}</p>))}<div className="mt-6 text-sm text-white/60">{signature}</div></div>
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
      <SectionHeader>✦ Moments</SectionHeader>
      <div className="flex flex-wrap gap-3">
        {tags.map((t) => (<div key={t} className="px-4 py-2 rounded-full bg-linear-to-r from-indigo-500/20 to-violet-500/12 text-white/90">{t}</div>))}

        {editMode && (
          <div className="flex items-center gap-2">
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTag(); }} placeholder="Add tag" className="bg-transparent border border-white/8 px-2 py-1 rounded-full text-white/90 outline-none" />
            <button onClick={addTag} className="text-white/80"><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Highlights ─────────────────────────────────────────────────────────────────

function HighlightsSection({ highlights: initialHighlights, editMode, onHighlightsChange, }: Readonly<{ highlights: Highlight[]; editMode?: boolean; onHighlightsChange?: (highlights: Highlight[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [items, setItems] = useState<Array<Highlight & { _k: string }>>(() => (initialHighlights ?? DEFAULT_HIGHLIGHTS).map((h) => ({ ...h, _k: genKey("hl") })));
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
              {editMode ? (<input value={h.title} onChange={(e) => updateItem(i, { title: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-white outline-none" />) : (<div className="text-sm font-semibold text-white">{h.title}</div>)}
              {editMode ? (<textarea value={h.description} onChange={(e) => updateItem(i, { description: e.target.value })} rows={2} className="w-full bg-transparent text-xs text-white/60 mt-1 outline-none resize-none" />) : (<div className="text-xs text-white/60 mt-1">{h.description}</div>)}
            </div>
            {editMode && <button onClick={() => update(items.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400" aria-label="Remove"><Trash2 size={14} /></button>}
          </motion.div>
        ))}

        {editMode && (<motion.button variants={fadeUp} onClick={() => update([...items, { icon: "✨", title: "New", description: "…", _k: genKey("hl") }])} className="flex items-center gap-2 bg-[#0f0f0f] border border-dashed border-white/8 rounded-2xl p-3 text-white/60"><Plus size={14} /> Add highlight</motion.button>)}
      </motion.div>
    </div>
  );
}

// ── Gallery ──────────────────────────────────────────────────────────────────

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
            {editMode ? (<input value={captions[i] ?? ""} onChange={(e) => updateCaption(i, e.target.value)} placeholder="Add a caption…" className="bg-transparent border-b border-white/8 text-[11px] text-white/60 placeholder-white/40 outline-none py-0.5 px-1" />) : (captions[i] && <p className="text-[11px] text-white/40 italic text-center px-1">{captions[i]}</p>)}
          </motion.div>
        ))}

        {canAdd && (<motion.button variants={fadeUp} onClick={() => onImageSlotClick?.(images.length)} type="button" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-2xl aspect-square text-white/60 hover:text-white"><Plus size={20} /><span className="text-xs">Add Photo</span><span className="text-[10px] text-white/40">{images.length} / {MAX_GALLERY_IMAGES}</span></motion.button>)}
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

// ── Stats (compact) ──────────────────────────────────────────────────────────

function StatsSection({ stats: initialStats, editMode, onStatsChange, }: Readonly<{ stats: Stat[]; editMode?: boolean; onStatsChange?: (stats: Stat[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [stats, setStats] = useState<Array<Stat & { _k: string }>>(() => (initialStats ?? DEFAULT_STATS).map((s) => ({ ...s, _k: genKey("st") })));
  const update = (next: Array<Stat & { _k: string }>) => { setStats(next); onStatsChange?.(next.map(({ label, value }) => ({ label, value }))); };
  const updateItem = (i: number, patch: Partial<Stat>) => update(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="px-6 md:px-8 py-5" ref={ref}>
      <SectionHeader>✦ Quick Stats</SectionHeader>
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={staggerContainer} initial="hidden" animate={inView ? "visible" : "hidden"}>
        {stats.map((s, i) => (
          <motion.div key={s._k} variants={fadeUp} className="flex flex-col items-center gap-2 bg-[#0f0f0f] rounded-2xl p-4">
            {editMode ? (<input value={s.value} onChange={(e) => updateItem(i, { value: e.target.value })} className="bg-transparent text-2xl font-black text-white text-center outline-none" />) : (<div className="text-2xl font-black text-white">{s.value}</div>)}
            {editMode ? (<input value={s.label} onChange={(e) => updateItem(i, { label: e.target.value })} className="bg-transparent text-xs text-white/60 text-center outline-none" />) : (<div className="text-xs text-white/60 uppercase">{s.label}</div>)}
          </motion.div>
        ))}

        {editMode && (<motion.button variants={fadeUp} onClick={() => update([...stats, { value: "—", label: "New", _k: genKey("st") }])} className="flex items-center justify-center gap-2 bg-[#0f0f0f] border border-dashed border-white/8 rounded-2xl p-4 text-white/60"><Plus size={14} /> Add stat</motion.button>)}
      </motion.div>
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

function TimelineSection({ timeline: initialTimeline, editMode, onTimelineChange, }: Readonly<{ timeline: TimelineStep[]; editMode?: boolean; onTimelineChange?: (timeline: TimelineStep[]) => void; }>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [steps, setSteps] = useState<Array<TimelineStep & { _k: string }>>(() => (initialTimeline ?? DEFAULT_TIMELINE).map((s) => ({ ...s, _k: genKey("tl") })));
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
              {editMode ? (<input value={s.title} onChange={(e) => updateItem(i, { title: e.target.value })} className="w-full bg-transparent outline-none text-sm text-white" />) : (<div className="text-sm font-semibold text-white">{s.title}</div>)}
              {editMode ? (<textarea value={s.description ?? ""} onChange={(e) => updateItem(i, { description: e.target.value })} rows={2} className="w-full bg-transparent text-xs text-white/60 mt-1 outline-none resize-none" />) : (s.description && <div className="text-xs text-white/60 mt-1">{s.description}</div>)}
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

// ── Wishes ───────────────────────────────────────────────────────────────────

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

// ── Footer ───────────────────────────────────────────────────────────────────

function FooterSection() {
  return (
    <footer className="px-6 md:px-8 py-8 text-center text-white/60">
      <div>Made with love 💖</div>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function CakeParallax({ title, story, images = [], editMode, heroBackground, cakeLayers, tags, highlights, stats, timeline, cta, config, onTitleChange, onStoryChange, onImageSlotClick, onTagsChange, onHighlightsChange, onStatsChange, onTimelineChange, onCTAChange, onHeroBackgroundClick, onCakeLayerClick, galleryCaptions, onGalleryCaptionsChange, wishes, onWishesChange, }: CakeProps) {
  const cfg: Required<CakeConfig> = { ...DEFAULT_SECTION_CONFIG, ...(config ?? {}) };
  const activeTags = tags ?? DEFAULT_TAGS;
  const layers = normalizeLayers(cakeLayers ?? images);

  return (
    <div className="relative w-full font-sans overflow-hidden bg-[#07070a]" style={{ minHeight: 420 }}>
      <HeroSection title={title} story={story} heroBackground={heroBackground} cakeLayers={layers} editMode={editMode} onTitleChange={onTitleChange} onStoryChange={onStoryChange} onHeroBackgroundClick={onHeroBackgroundClick} onCakeLayerClick={onCakeLayerClick} />

      <div className="mx-6 md:mx-8 my-1 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />

      {cfg.showMessage && <MessageSection message={story ?? ""} editMode={editMode} onMessageChange={onStoryChange} typing={false} />}

      {cfg.showTagCloud && <TagCloudSection tags={activeTags} editMode={editMode} onTagsChange={onTagsChange} />}
      {cfg.showHighlights && <HighlightsSection highlights={highlights ?? DEFAULT_HIGHLIGHTS} editMode={editMode} onHighlightsChange={onHighlightsChange} />}
      {cfg.showGallery && <GallerySection images={images} editMode={editMode} onImageSlotClick={onImageSlotClick} galleryCaptions={galleryCaptions ?? []} onGalleryCaptionsChange={onGalleryCaptionsChange} />}
      {cfg.showStats && <StatsSection stats={stats ?? DEFAULT_STATS} editMode={editMode} onStatsChange={onStatsChange} />}
      {cfg.showTimeline && <TimelineSection timeline={timeline ?? DEFAULT_TIMELINE} editMode={editMode} onTimelineChange={onTimelineChange} />}

      {cfg.showWishes && <WishesSection initialWishes={wishes ?? []} editMode={editMode} onWishesChange={onWishesChange} />}

      {cfg.showCTA && <CTASection cta={cta} editMode={editMode} onCTAChange={onCTAChange} />}

      {cfg.showFooter && <FooterSection />}
    </div>
  );
}

export default CakeParallax;
