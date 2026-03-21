"use client";

import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

/**
 * RooftopGlow — Chill Hangout + Food
 * Warm dark bg, full-bleed hero photo with amber gradient overlay,
 * soft orange accents and relaxed typography.
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
}: TemplateProps) {
  return (
    <div className="w-full font-sans bg-[#0e0a06] overflow-hidden" style={{ minHeight: 400 }}>
      {/* Hero photo */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <PhotoSlot
          src={images[0]}
          label="Hero photo"
          editMode={editMode}
          onSlotClick={() => onImageSlotClick?.(0)}
          className="w-full h-full bg-orange-900/20"
          style={{ aspectRatio: "16/9" } as React.CSSProperties}
        />
        {/* Warm gradient fadeout to bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #0e0a06)",
          }}
        />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 -mt-2 relative z-10">
        {/* Category pill */}
        <div className="inline-flex items-center gap-1.5 bg-orange-400/15 border border-orange-400/30 rounded-full px-3 py-1 mb-4">
          <span className="text-sm leading-none">🌆</span>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
            Chill Hangout
          </span>
        </div>

        {/* Title */}
        <EditableText
          value={title}
          placeholder="Moment title"
          editMode={editMode}
          onUpdate={onTitleChange}
          className="text-2xl font-light text-[#f5f0ea] tracking-tight leading-tight block"
        />

        {/* Caption */}
        {(caption || editMode) && (
          <div className="mt-2">
            <EditableText
              value={caption}
              placeholder="Short caption…"
              editMode={editMode}
              onUpdate={onCaptionChange}
              className="text-sm text-orange-300/80 italic block"
            />
          </div>
        )}

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-orange-400/30 to-transparent" />

        {/* Story */}
        {(story || editMode) && (
          <EditableText
            value={story}
            placeholder="Write the story…"
            editMode={editMode}
            onUpdate={onStoryChange}
            className="text-sm text-[#c0a882] leading-relaxed block"
            multiline
          />
        )}

        {/* Second photo if available */}
        {(images[1] || editMode) && (
          <div className="mt-5">
            <PhotoSlot
              src={images[1]}
              label="Second photo"
              editMode={editMode}
              onSlotClick={() => onImageSlotClick?.(1)}
              className="w-full rounded-2xl bg-orange-900/20"
              style={{ aspectRatio: "16/9" } as React.CSSProperties}
            />
          </div>
        )}
      </div>
    </div>
  );
}
