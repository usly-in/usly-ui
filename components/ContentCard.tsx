"use client";

import { formatDistanceToNow, format } from "date-fns";
import {
  ImageIcon,
  BookOpen,
  Mail,
  Lock,
  Calendar,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { ContentItem } from "@/types";

interface ContentCardProps {
  item: ContentItem;
  onClick?: () => void;
  onDelete?: () => void;
}

const typeConfig = {
  moment: {
    icon: ImageIcon,
    label: "Moment",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  chapter: {
    icon: BookOpen,
    label: "Chapter",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  letter: {
    icon: Mail,
    label: "Letter",
    color: "text-[#e4a0a0]",
    bg: "bg-[#e4a0a0]/10",
  },
};

export function ContentCard({ item, onClick, onDelete }: ContentCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;
  const isLocked = item.locked && item.type === "letter";

  return (
    <div className="relative group/card">
      <Link
        href={item.type === "moment" ? `/moments/${item.contentId}` : `/memory/${item.contentId}`}
        onClick={onClick}
        className="group block rounded-2xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/30 transition-all overflow-hidden"
      >
        {/* Image — always rendered via sprite (even 1 image = 1-cell sprite) */}
        {!isLocked && item.spriteManifest ? (
          <div className="relative h-44 overflow-hidden">
            <div
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              style={{
                backgroundImage: `url(${item.spriteManifest.sheetUrl})`,
                backgroundPosition: `${-item.spriteManifest.cells[0].x}px ${-item.spriteManifest.cells[0].y}px`,
                backgroundSize: `${item.spriteManifest.cols * item.spriteManifest.thumbW}px auto`,
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 to-transparent" />
            {item.images && item.images.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                {item.images.length} photos
              </span>
            )}
          </div>
        ) : !isLocked && item.type === "moment" ? (
          <div className="h-44 bg-[#1c1c1c] flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-[#2a2a2a]" />
          </div>
        ) : null}

        {/* Locked letter overlay */}
        {isLocked && (
          <div className="h-32 bg-[#1c1c1c] flex flex-col items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-[#e4a0a0]" />
            <p className="text-xs text-[#888]">
              Opens{" "}
              {item.openAt
                ? format(new Date(item.openAt), "MMM d, yyyy")
                : "soon"}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center`}
            >
              <Icon className={`w-3 h-3 ${config.color}`} />
            </div>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#f5f5f5] leading-snug mb-1.5 line-clamp-2">
            {isLocked ? "A letter waiting to be opened" : item.title}
          </h3>

          {item.caption && !isLocked && (
            <p className="text-xs text-[#888] line-clamp-2 mb-2">
              {item.caption}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-xs text-[#666]">
            <Calendar className="w-3 h-3" />
            <span>
              {item.eventDate
                ? format(new Date(item.eventDate), "MMM d, yyyy")
                : formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
            </span>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#141414]/80 text-[#555] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover/card:opacity-100 transition-all z-10"
          aria-label="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
