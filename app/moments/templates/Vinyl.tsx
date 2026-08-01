"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

interface VinylConfig {
  readonly showTracklist?: boolean;
}

interface VinylProps extends TemplateProps {
  /** Captions for extra photos (images[1..]) rendered as an album tracklist. */
  readonly trackCaptions?: string[];
  readonly onTrackCaptionsChange?: (captions: string[]) => void;
  readonly config?: VinylConfig;
}

const DEFAULT_CONFIG: Required<VinylConfig> = {
  showTracklist: true,
};

// Side A / Side B track numbering: A1, A2… then B1, B2…
const trackLabel = (i: number) => {
  const side = i < 4 ? "A" : "B";
  const n = (i % 4) + 1;
  return `${side}${n}`;
};

// Deterministic-looking "groove counter" derived from the title, purely decorative —
// reads like a tape counter's mechanical digit wheels, not a real timer.
function useGrooveCounter(title: string) {
  return useMemo(() => {
    let seed = 7;
    for (let i = 0; i < title.length; i++) seed = (seed * 31 + title.charCodeAt(i)) % 9973;
    return String(seed).padStart(4, "0");
  }, [title]);
}

/**
 * Vinyl — Music + Sharing
 * Commits fully to the turntable scene rather than a generic dark card:
 * a record that actually spins on a textured plinth, a tonearm/headshell
 * resting on the groove edge with a power LED, a printed album-insert
 * card (not tinted text) for the liner notes, a mechanical tape-counter
 * readout instead of a progress bar, and — when there are extra photos —
 * a Side A / Side B tracklist instead of a generic photo grid.
 */
export function Vinyl({
  title,
  caption,
  story,
  images = [],
  editMode,
  onTitleChange,
  onCaptionChange,
  onStoryChange,
  onImageSlotClick,
  trackCaptions = [],
  onTrackCaptionsChange,
  config,
}: VinylProps) {
  const cfg: Required<VinylConfig> = { ...DEFAULT_CONFIG, ...config };
  const [localTrackCaptions, setLocalTrackCaptions] = useState<string[]>(trackCaptions);
  const groove = useGrooveCounter(title || "vinyl");
  const extraImages = images.slice(1);

  const updateTrackCaption = (i: number, val: string) => {
    const next = [...localTrackCaptions];
    next[i] = val;
    setLocalTrackCaptions(next);
    onTrackCaptionsChange?.(next);
  };

  return (
    <div
      className="w-full font-sans bg-[#0d0010] overflow-hidden relative"
      style={{ minHeight: 420 }}
    >
      {/* Purple radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-1.5 bg-purple-400/15 border border-purple-400/30 rounded-full px-3 py-1">
            <span className="text-sm leading-none">🎵</span>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              Now Playing
            </span>
          </div>
          {/* VU-meter bars — pulse like a signal meter, not a static decoration */}
          <div className="flex items-end gap-0.5">
            {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-purple-400/50 rounded-full"
                style={{ height: h * 2 }}
                animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{
                  duration: 0.9 + (i % 3) * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Turntable scene ── */}
        <div
          className="relative rounded-xl mb-6 mx-auto"
          style={{
            width: 260,
            height: 232,
            background:
              "linear-gradient(155deg, #2a1220 0%, #1c0a15 55%, #150710 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -6px 14px rgba(0,0,0,0.5), 0 10px 26px rgba(0,0,0,0.55)",
          }}
        >
          {/* Plinth texture — faint brushed lines */}
          <div
            className="absolute inset-0 rounded-xl opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(100deg, #fff 0 1px, transparent 1px 5px)",
            }}
          />

          {/* Power LED */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 6px rgba(52,211,153,0.9)" }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[7px] font-mono text-white/25 uppercase tracking-widest">
              Power
            </span>
          </div>

          {/* RPM readout */}
          <div className="absolute top-3 right-3 text-right">
            <span className="text-[9px] font-mono text-purple-300/50 tracking-widest">
              33⅓ RPM
            </span>
          </div>

          {/* Spinning disc */}
          <div
            className="absolute rounded-full overflow-hidden border-4 border-purple-900/60"
            style={{
              width: 172,
              height: 172,
              left: 16,
              bottom: 16,
              boxShadow:
                "0 0 40px rgba(168,85,247,0.2), 0 8px 26px rgba(0,0,0,0.6)",
            }}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <PhotoSlot
                src={images[0]}
                label="Cover photo"
                editMode={editMode}
                onSlotClick={() => onImageSlotClick?.(0)}
                className="w-full h-full bg-purple-900/20"
              />
              {/* Groove rings etched over the photo */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "repeating-radial-gradient(circle at center, transparent 0 6px, rgba(0,0,0,0.35) 6px 7px)",
                }}
              />
              {/* Centre label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-purple-950/70 border border-purple-400/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0d0010] border border-purple-900/60" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tonearm — pivots top-right, headshell resting on the groove edge */}
          <div
            className="absolute z-10"
            style={{ top: 8, right: 22, width: 6, height: 6 }}
          >
            {/* Pivot post */}
            <div className="absolute w-4 h-4 -left-1.5 -top-1.5 rounded-full bg-[#3a1a2c] border border-purple-400/20 shadow-sm" />
            {/* Arm */}
            <div
              className="absolute bg-gradient-to-b from-[#4a2338] to-[#2a1220] rounded-full origin-top"
              style={{
                width: 4,
                height: 118,
                left: 0,
                top: 0,
                transform: "rotate(34deg)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {/* Headshell / needle tip */}
              <div
                className="absolute rounded-sm bg-[#1a0a12] border border-purple-400/25"
                style={{ width: 10, height: 6, left: -3, bottom: -2 }}
              />
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="text-center mb-4">
          <EditableText
            value={title}
            placeholder="Track title"
            editMode={editMode}
            onUpdate={onTitleChange}
            className="text-xl font-semibold text-white tracking-tight block text-center"
          />
          {(caption || editMode) && (
            <div className="mt-1">
              <EditableText
                value={caption}
                placeholder="Artist / vibe…"
                editMode={editMode}
                onUpdate={onCaptionChange}
                className="text-sm text-purple-300/70 block text-center"
              />
            </div>
          )}
        </div>

        {/* Mechanical tape-counter readout, in place of a generic progress bar */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-[8px] text-purple-400/40 font-mono uppercase tracking-widest">
            Counter
          </span>
          <div className="flex bg-[#050005] border border-purple-900/50 rounded-sm px-1 py-0.5 gap-[1px]">
            {groove.split("").map((d, i) => (
              <span
                key={i}
                className="w-3.5 text-center text-[11px] font-mono tabular-nums text-purple-200/70 bg-purple-950/40 rounded-[1px]"
              >
                {d}
              </span>
            ))}
          </div>
          <span className="text-[8px] text-purple-400/40 font-mono uppercase tracking-widest">
            Side A
          </span>
        </div>

        {/* Story — printed liner-notes insert card, contrasted paper tone against the purple */}
        {(story || editMode) && (
          <div
            className="relative rounded-sm p-4 mb-2"
            style={{
              background: "linear-gradient(155deg, #f2e9d8 0%, #e8dcc4 100%)",
              boxShadow:
                "0 6px 18px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(120,90,50,0.15)",
            }}
          >
            {/* Paper grain */}
            <div
              className="absolute inset-0 rounded-sm pointer-events-none opacity-[0.5] mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")",
              }}
            />
            <p className="relative text-[9px] text-[#7a6a45] uppercase tracking-widest mb-2 font-semibold">
              Liner Notes
            </p>
            <EditableText
              value={story}
              placeholder="Write the story…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="relative text-sm text-[#3a2f1f] leading-relaxed block"
              multiline
            />
          </div>
        )}

        {/* Tracklist — extra photos rendered as Side A / Side B listing, not a photo grid */}
        {cfg.showTracklist && (extraImages.length > 0 || editMode) && (
          <div className="pt-4 mt-4 border-t border-purple-900/40">
            <p className="text-[9px] text-purple-400/40 uppercase tracking-widest mb-3">
              Tracklist
            </p>
            <div className="space-y-2">
              {extraImages.map((src, i) => (
                <div key={src} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-purple-400/50 w-6 shrink-0">
                    {trackLabel(i)}
                  </span>
                  <div className="w-9 h-9 rounded-sm overflow-hidden shrink-0 border border-purple-900/50">
                    <PhotoSlot
                      src={src}
                      label=""
                      editMode={editMode}
                      onSlotClick={() => onImageSlotClick?.(i + 1)}
                      className="w-full h-full bg-purple-900/20"
                    />
                  </div>
                  {editMode ? (
                    <input
                      value={localTrackCaptions[i] ?? ""}
                      onChange={(e) => updateTrackCaption(i, e.target.value)}
                      placeholder="Track title…"
                      className="flex-1 bg-transparent text-xs text-purple-100/70 placeholder-purple-400/25 outline-none border-none"
                    />
                  ) : (
                    <span className="flex-1 text-xs text-purple-100/70 truncate">
                      {localTrackCaptions[i] || ""}
                    </span>
                  )}
                </div>
              ))}

              {editMode && (
                <button
                  type="button"
                  onClick={() => onImageSlotClick?.(extraImages.length + 1)}
                  className="flex items-center gap-3 text-purple-400/40 hover:text-purple-300/70 transition-colors"
                >
                  <span className="text-[10px] font-mono w-6 shrink-0">
                    {trackLabel(extraImages.length)}
                  </span>
                  <div className="w-9 h-9 rounded-sm border-2 border-dashed border-purple-900/50 hover:border-purple-400/40 flex items-center justify-center transition-colors">
                    <span className="text-xs">+</span>
                  </div>
                  <span className="text-xs">Add track photo</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
