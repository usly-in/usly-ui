"use client";

import React from "react";
import { Camera } from "lucide-react";

/**
 * Inline-editable text slot.
 * Edit mode → transparent input/textarea blending into the template.
 * View mode → renders the value, handles HTML from TipTap (dangerouslySetInnerHTML).
 */
export function EditableText({
  value,
  placeholder,
  editMode,
  onUpdate,
  className = "",
  multiline = false,
}: {
  value?: string;
  placeholder: string;
  editMode?: boolean;
  onUpdate?: (v: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const base = `bg-transparent border-none outline-none resize-none w-full placeholder-current/30 focus:ring-1 focus:ring-white/20 rounded-sm ${className}`;

  if (editMode) {
    if (multiline) {
      return (
        <textarea
          className={base}
          value={value ?? ""}
          rows={4}
          onChange={(e) => onUpdate?.(e.target.value)}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        className={base}
        value={value ?? ""}
        onChange={(e) => onUpdate?.(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (!value) return null;

  if (multiline) {
    const isHtml = value.trim().startsWith("<");
    return isHtml ? (
      <div className={className} dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
      <p className={className}>{value}</p>
    );
  }

  return <span className={className}>{value}</span>;
}

/**
 * Image slot — shows uploaded/saved image or a placeholder drop zone.
 * In edit mode shows a hover overlay with camera icon to replace.
 */
export function PhotoSlot({
  src,
  label = "Add photo",
  editMode,
  onSlotClick,
  className = "",
  style,
}: {
  src?: string;
  label?: string;
  editMode?: boolean;
  onSlotClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) {
    if (!editMode) return null;
    return (
      <button
        type="button"
        onClick={onSlotClick}
        style={style}
        className={`flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-white/50 transition-colors cursor-pointer ${className}`}
      >
        <Camera className="w-5 h-5 text-white/30" />
        <span className="text-[10px] text-white/30 mt-1 pointer-events-none">{label}</span>
      </button>
    );
  }

  return (
    <div style={style} className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt="" className="w-full h-full object-cover" />
      {editMode && (
        <button
          type="button"
          onClick={onSlotClick}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
