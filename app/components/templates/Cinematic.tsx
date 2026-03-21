"use client";

import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

/**
 * Cinematic — Sunset + Honest Talk
 * Film-like layout: widescreen photo with vignette, editorial typography,
 * subtle film-grain texture, minimal warm accent.
 */
export function Cinematic({
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
}: Readonly<TemplateProps>) {
  const dateLabel = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : null;

  return (
    <div className="w-full font-sans bg-[#050505] overflow-hidden" style={{ minHeight: 400 }}>
      {/* Widescreen photo with vignette */}
      <div className="relative w-full" style={{ aspectRatio: "21/9" }}>
        <PhotoSlot
          src={images[0]}
          label="Widescreen photo"
          editMode={editMode}
          onSlotClick={() => onImageSlotClick?.(0)}
          className="w-full h-full bg-neutral-900"
          style={{ aspectRatio: "21/9" } as React.CSSProperties}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Date badge top-right */}
        {dateLabel && (
          <div className="absolute top-3 right-4 text-[9px] text-white/40 tracking-[0.2em] font-mono pointer-events-none">
            {dateLabel}
          </div>
        )}
        {/* Category */}
        <div className="absolute top-3 left-4 inline-flex items-center gap-1.5 pointer-events-none">
          <span className="text-xs leading-none">🌅</span>
          <span className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest">
            Sunset
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {/* Title — large editorial display */}
        <EditableText
          value={title}
          placeholder="Moment title"
          editMode={editMode}
          onUpdate={onTitleChange}
          className="text-3xl font-thin text-[#f0ece8] tracking-tight leading-tight block mb-3"
        />

        {/* Caption — italic, muted */}
        {(caption || editMode) && (
          <EditableText
            value={caption}
            placeholder="A line about this moment…"
            editMode={editMode}
            onUpdate={onCaptionChange}
            className="text-sm text-rose-200/60 italic block mb-4"
          />
        )}

        {/* Horizontal rule — film strip style */}
        <div className="flex items-center gap-2 my-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-3 h-1 rounded-sm bg-white/10" />
          ))}
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Story */}
        {(story || editMode) && (
          <EditableText
            value={story}
            placeholder="Write the story…"
            editMode={editMode}
            onUpdate={onStoryChange}
            className="text-sm text-[#a09890] leading-loose block"
            multiline
          />
        )}
      </div>
    </div>
  );
}
