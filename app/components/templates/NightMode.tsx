"use client";

import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

/**
 * NightMode — Late-Night Walk
 * Near-black bg, single photo card with neon cyan glow, clean minimal type.
 */
export function NightMode({
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
      className="w-full font-sans bg-[#050810] overflow-hidden"
      style={{ minHeight: 400 }}
    >
      {/* Subtle cyan radial glow top-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          top: -60,
          left: -60,
          background:
            "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <div className="relative z-10 p-6">
        {/* Category pill */}
        <div className="inline-flex items-center gap-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-4">
          <span className="text-sm leading-none">🌙</span>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            Late-Night
          </span>
        </div>

        {/* Primary photo card with cyan shadow */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{
            boxShadow: images[0]
              ? "0 0 40px rgba(34,211,238,0.12)"
              : undefined,
          }}
        >
          <PhotoSlot
            src={images[0]}
            label="Main photo"
            editMode={editMode}
            onSlotClick={() => onImageSlotClick?.(0)}
            className="w-full rounded-2xl bg-cyan-900/10"
            style={{ aspectRatio: "4/3" } as React.CSSProperties}
          />
        </div>

        {/* Text block with cyan left accent bar */}
        <div className="flex gap-4">
          <div className="w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-cyan-400/10 self-stretch shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <EditableText
              value={title}
              placeholder="Moment title"
              editMode={editMode}
              onUpdate={onTitleChange}
              className="text-xl font-semibold text-white tracking-tight leading-snug block"
            />
            {(caption || editMode) && (
              <EditableText
                value={caption}
                placeholder="Short caption…"
                editMode={editMode}
                onUpdate={onCaptionChange}
                className="text-sm text-cyan-400/80 block"
              />
            )}
          </div>
        </div>

        {/* Story */}
        {(story || editMode) && (
          <div className="mt-5 pt-4 border-t border-white/5">
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
    </div>
  );
}
