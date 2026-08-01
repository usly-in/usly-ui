"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface NightModeRouteMarker {
  readonly distance: string;
  readonly label: string;
}

interface NightModeConfig {
  readonly showRoute?: boolean;
  readonly showNotification?: boolean;
}

interface NightModeProps extends TemplateProps {
  readonly textFrom?: string;
  readonly onTextFromChange?: (v: string) => void;
  readonly routeMarkers?: NightModeRouteMarker[];
  readonly onRouteMarkersChange?: (markers: NightModeRouteMarker[]) => void;
  readonly config?: NightModeConfig;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_ROUTE: NightModeRouteMarker[] = [
  { distance: "0.0 mi", label: "Stepped outside" },
  { distance: "0.6 mi", label: "Streets went quiet" },
  { distance: "1.2 mi", label: "Turned back" },
  { distance: "1.8 mi", label: "Porch light, home" },
];

const DEFAULT_CONFIG: Required<NightModeConfig> = {
  showRoute: true,
  showNotification: true,
};

let _uid = 0;
const genKey = (prefix: string) => `${prefix}-${_uid++}`;

// ── Moon phase — purely decorative, derived from eventDate if present ──────────

const MOON_PHASES = [
  { emoji: "🌑", name: "New Moon" },
  { emoji: "🌒", name: "Waxing Crescent" },
  { emoji: "🌓", name: "First Quarter" },
  { emoji: "🌔", name: "Waxing Gibbous" },
  { emoji: "🌕", name: "Full Moon" },
  { emoji: "🌖", name: "Waning Gibbous" },
  { emoji: "🌗", name: "Last Quarter" },
  { emoji: "🌘", name: "Waning Crescent" },
] as const;

const SYNODIC_MONTH_MS = 29.53058867 * 86400000;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

function getMoonPhase(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const diff = d.getTime() - KNOWN_NEW_MOON_MS;
  let phase = diff % SYNODIC_MONTH_MS;
  if (phase < 0) phase += SYNODIC_MONTH_MS;
  const index = Math.floor((phase / SYNODIC_MONTH_MS) * 8) % 8;
  return MOON_PHASES[index];
}

// ── Animation ──────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Walking route — a dotted path with distance markers, not a generic timeline ─

function RouteSection({
  markers: initialMarkers,
  editMode,
  onMarkersChange,
}: Readonly<{
  markers: NightModeRouteMarker[];
  editMode?: boolean;
  onMarkersChange?: (markers: NightModeRouteMarker[]) => void;
}>) {
  const [items, setItems] = useState<Array<NightModeRouteMarker & { _k: string }>>(() =>
    initialMarkers.map((m) => ({ ...m, _k: genKey("stop") }))
  );

  const update = (next: Array<NightModeRouteMarker & { _k: string }>) => {
    setItems(next);
    onMarkersChange?.(next.map(({ distance, label }) => ({ distance, label })));
  };

  const updateItem = (i: number, patch: Partial<NightModeRouteMarker>) =>
    update(items.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  if (items.length === 0 && !editMode) return null;

  return (
    <div className="px-6 pb-2 pt-1">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[9px] font-mono text-amber-200/30 uppercase tracking-[0.25em]">
          The Route
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="relative ml-1.5">
        {/* dotted path line — the walk itself */}
        <div
          className="absolute left-0 top-1 bottom-1 w-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(217,180,120,0.35) 0 3px, transparent 3px 7px)",
          }}
        />
        <div className="space-y-5">
          {items.map((m, i) => (
            <motion.div
              key={m._k}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="group relative pl-6"
            >
              {/* footstep marker */}
              <span className="absolute -left-0.75 top-1 w-1.75 h-1.75 rounded-full bg-amber-300/70 shadow-[0_0_6px_rgba(217,180,120,0.6)]" />
              <div className="flex items-baseline gap-2.5">
                {editMode ? (
                  <input
                    value={m.distance}
                    onChange={(e) => updateItem(i, { distance: e.target.value })}
                    placeholder="0.0 mi"
                    className="bg-white/5 text-[10px] font-mono text-amber-200/70 rounded-sm px-1.5 py-0.5 w-16 outline-none tabular-nums focus:ring-1 focus:ring-white/20"
                  />
                ) : (
                  <span className="text-[10px] font-mono text-amber-200/50 tabular-nums shrink-0">
                    {m.distance}
                  </span>
                )}
                {editMode ? (
                  <input
                    value={m.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                    placeholder="What happened here…"
                    className="bg-transparent text-sm text-white/60 flex-1 outline-none focus:ring-1 focus:ring-white/10 rounded placeholder-white/15 min-w-20"
                  />
                ) : (
                  <span className="text-sm text-white/55">{m.label}</span>
                )}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => update(items.filter((_, idx) => idx !== i))}
                    className="ml-auto text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove stop"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={() =>
                update([...items, { distance: "", label: "", _k: genKey("stop") }])
              }
              className="relative pl-6 flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors"
            >
              <span className="absolute -left-0.75 top-1 w-1.75 h-1.75 rounded-full border border-dashed border-white/25" />
              <Plus size={13} />
              <span className="text-xs">Add a stop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * NightMode — Late-Night Walk
 * Reframes the moment as the specific ritual of walking alone after dark, not a
 * generic dark card: the photo sits in a warm sodium-vapor pool of streetlamp
 * light with a silhouetted lamppost arm overhead, a quiet monospace HUD reads
 * the moon phase and time-of-night instead of a category pill, the caption
 * appears as an actual lock-screen text notification (the reason you're out
 * walking in the first place), and an optional "Route" section marks the walk
 * as dotted footsteps with distance stops instead of a bordered timeline.
 */
export function NightMode({
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
  textFrom,
  onTextFromChange,
  routeMarkers,
  onRouteMarkersChange,
  config,
}: NightModeProps) {
  const cfg: Required<NightModeConfig> = { ...DEFAULT_CONFIG, ...config };
  const [localFrom, setLocalFrom] = useState(textFrom ?? "Them");

  const moon = useMemo(() => getMoonPhase(eventDate), [eventDate]);

  const timeOfNight = eventDate
    ? new Date(eventDate).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const notifTime = eventDate
    ? new Date(eventDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "now";

  return (
    <div
      className="relative w-full font-sans bg-[#05060c] overflow-hidden"
      style={{ minHeight: 400 }}
    >
      {/* Far-off ambient streetlights — cool dark base, no single loud glow */}
      <div
        className="absolute pointer-events-none inset-x-0 top-0 h-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 15% 0%, rgba(217,180,120,0.05) 0%, transparent 70%), radial-gradient(ellipse 40% 80% at 85% 0%, rgba(120,150,217,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 p-6">
        {/* HUD readout — moon phase + time-of-night, replaces the category pill */}
        <div className="flex items-center gap-2 mb-4 font-mono">
          <span className="text-sm leading-none">{moon.emoji}</span>
          <span className="text-[9px] text-blue-200/40 uppercase tracking-[0.2em]">
            {moon.name}
          </span>
          <span className="text-white/10">·</span>
          <span className="text-[9px] text-blue-200/40 tracking-widest tabular-nums">
            {timeOfNight ?? "after dark"}
          </span>
        </div>

        {/* Photo — a pool of streetlamp light, with a lamppost silhouette overhead */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: images[0]
              ? "0 0 50px rgba(217,180,120,0.10), 0 0 4px rgba(217,180,120,0.15)"
              : undefined,
          }}
        >
          <PhotoSlot
            src={images[0]}
            label="Main photo"
            editMode={editMode}
            onSlotClick={() => onImageSlotClick?.(0)}
            className="w-full rounded-2xl bg-[#0a0c14]"
            style={{ aspectRatio: "4/3" } as React.CSSProperties}
          />

          {/* Pool-of-light vignette — warm center-top, dark edges, like standing under the lamp */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 78% 8%, rgba(255,214,150,0.16) 0%, transparent 55%), radial-gradient(ellipse 130% 100% at 50% 100%, rgba(0,0,0,0.55) 0%, transparent 60%)",
            }}
          />

          {/* Lamppost silhouette — arm + pole reaching into the frame from the top-right */}
          <div className="absolute -top-1 right-6 pointer-events-none" aria-hidden>
            <div className="w-px h-8 bg-black/70" />
            <div className="absolute top-0 right-0 w-10 h-px bg-black/70" />
            <div className="absolute top-6 -left-0.75 w-2 h-2 rounded-full bg-amber-200/70 shadow-[0_0_14px_6px_rgba(255,214,150,0.35)]" />
          </div>
        </motion.div>

        {/* Title — quiet, no accent bar bling */}
        <EditableText
          value={title}
          placeholder="Moment title"
          editMode={editMode}
          onUpdate={onTitleChange}
          className="text-xl font-semibold text-white/90 tracking-tight leading-snug block mb-3"
        />

        {/* Caption as a lock-screen text notification — the reason for the walk */}
        {cfg.showNotification && (caption || editMode) && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-md px-3.5 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 rounded-md bg-linear-to-br from-emerald-400 to-emerald-600 shrink-0" />
              {editMode ? (
                <input
                  value={localFrom}
                  onChange={(e) => {
                    setLocalFrom(e.target.value);
                    onTextFromChange?.(e.target.value);
                  }}
                  placeholder="Them"
                  className="bg-transparent text-[11px] font-semibold text-white/70 outline-none flex-1 focus:ring-1 focus:ring-white/10 rounded"
                />
              ) : (
                <span className="text-[11px] font-semibold text-white/70">{localFrom}</span>
              )}
              <span className="ml-auto text-[10px] text-white/30 tabular-nums">{notifTime}</span>
            </div>
            <EditableText
              value={caption}
              placeholder="what they texted…"
              editMode={editMode}
              onUpdate={onCaptionChange}
              className="text-[13px] text-white/60 leading-snug block truncate"
            />
          </motion.div>
        )}

        {/* Story — a quiet late-night log entry */}
        {(story || editMode) && (
          <div className="pt-4 border-t border-white/5">
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">
              Notes from the walk
            </div>
            <EditableText
              value={story}
              placeholder="Write the story…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="text-sm text-white/50 leading-relaxed block"
              multiline
            />
          </div>
        )}
      </div>

      {cfg.showRoute && (
        <RouteSection
          markers={routeMarkers ?? DEFAULT_ROUTE}
          editMode={editMode}
          onMarkersChange={onRouteMarkersChange}
        />
      )}

      <div className="pb-4" />
    </div>
  );
}
