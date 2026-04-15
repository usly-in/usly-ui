"use client";

import { EditableText, PhotoSlot } from "./_shared";
import type { TemplateProps } from "./types";

/**
 * Vinyl — Music + Sharing
 * Deep purple bg, circular vinyl-disc photo, cassette/track-list typography.
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
}: TemplateProps) {
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
          {/* Decorative bars */}
          <div className="flex items-end gap-0.5">
            {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-purple-400/50 rounded-full"
                style={{ height: h * 2 }}
              />
            ))}
          </div>
        </div>

        {/* Vinyl disc — circular photo */}
        <div className="flex justify-center mb-6">
          <div
            className="relative rounded-full overflow-hidden border-4 border-purple-900/60"
            style={{
              width: 180,
              height: 180,
              boxShadow: "0 0 40px rgba(168,85,247,0.2), 0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            <PhotoSlot
              src={images[0]}
              label="Cover photo"
              editMode={editMode}
              onSlotClick={() => onImageSlotClick?.(0)}
              className="w-full h-full bg-purple-900/20"
            />
            {/* Centre hole */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-[#0d0010] border border-purple-900/60 z-10" />
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="text-center mb-5">
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

        {/* Progress bar decoration */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] text-purple-400/40 font-mono">0:00</span>
          <div className="flex-1 h-0.5 bg-purple-900/60 rounded-full relative">
            <div className="absolute left-0 top-0 bottom-0 w-2/5 bg-purple-400/70 rounded-full" />
          </div>
          <span className="text-[10px] text-purple-400/40 font-mono">♾</span>
        </div>

        {/* Story — styled as liner notes */}
        {(story || editMode) && (
          <div className="pt-4 border-t border-purple-900/40">
            <p className="text-[9px] text-purple-400/40 uppercase tracking-widest mb-2">
              Liner Notes
            </p>
            <EditableText
              value={story}
              placeholder="Write the story…"
              editMode={editMode}
              onUpdate={onStoryChange}
              className="text-sm text-purple-100/50 leading-relaxed block"
              multiline
            />
          </div>
        )}
      </div>
    </div>
  );
}
