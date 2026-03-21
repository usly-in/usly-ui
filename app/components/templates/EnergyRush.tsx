"use client";

import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

/**
 * EnergyRush — Fun & High-Energy
 * Dark bg, yellow dot-grid, dual polaroid photos, bold typography.
 */
export function EnergyRush({
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
    <div
      className="relative w-full font-sans overflow-hidden bg-[#090909]"
      style={{ minHeight: 400 }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(250,204,21,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Yellow slash top-right */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400/10 rotate-45 pointer-events-none" />

      <div className="relative z-10 p-6">
        {/* Category pill */}
        <div className="inline-flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/30 rounded-full px-3 py-1 mb-5">
          <span className="text-sm leading-none">🎳</span>
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
            Fun &amp; High-Energy
          </span>
        </div>

        {/* Dual polaroid photos */}
        <div className="flex gap-3 mb-6 justify-center">
          {([0, 1] as const).map((idx) => (
            <div
              key={idx}
              className="bg-white shadow-2xl"
              style={{
                padding: "8px 8px 28px 8px",
                transform: `rotate(${idx === 0 ? "-3deg" : "2.5deg"})`,
                width: 140,
                flexShrink: 0,
              }}
            >
              <PhotoSlot
                src={images[idx]}
                label={`Photo ${idx + 1}`}
                editMode={editMode}
                onSlotClick={() => onImageSlotClick?.(idx)}
                className="w-full aspect-square bg-yellow-100"
              />
            </div>
          ))}
        </div>

        {/* Title */}
        <EditableText
          value={title}
          placeholder="Moment title"
          editMode={editMode}
          onUpdate={onTitleChange}
          className="text-2xl font-extrabold text-white tracking-tight leading-tight block"
        />

        {/* Caption */}
        {(caption || editMode) && (
          <div className="mt-2">
            <EditableText
              value={caption}
              placeholder="Short caption…"
              editMode={editMode}
              onUpdate={onCaptionChange}
              className="text-sm font-semibold text-yellow-400 block"
            />
          </div>
        )}

        {/* Story */}
        {(story || editMode) && (
          <div className="mt-4 pt-4 border-t border-yellow-400/15">
            <EditableText
              value={story}
              placeholder="Write the story…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="text-sm text-white/60 leading-relaxed block"
              multiline
            />
          </div>
        )}
      </div>
    </div>
  );
}
