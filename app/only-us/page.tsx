"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Heart, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import api from "@/lib/api";
import type { ContentItem } from "@/types";

export default function OnlyUsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all content types for the mood-board
    Promise.all([
      api.get("/api/moments?limit=6"),
      api.get("/api/chapters?limit=4"),
      api.get("/api/letters?limit=4"),
    ])
      .then(([m, c, l]) => {
        const all = [
          ...(m.data.items ?? []),
          ...(c.data.items ?? []),
          ...(l.data.items ?? []),
        ].sort(() => Math.random() - 0.5); // Shuffle for mood-board feel
        setItems(all);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4a0a0]/10 mb-4">
          <Lock className="w-5 h-5 text-[#e4a0a0]" />
        </div>
        <h1 className="text-3xl font-light tracking-tight text-[#f5f5f5] mb-2">Only Us</h1>
        <p className="text-sm text-[#888]">Your private space — no one else sees this</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="w-8 h-8 text-[#e4a0a0] fill-current mb-4 opacity-40" />
          <p className="text-[#888] text-sm">Your story hasn&apos;t started yet</p>
          <p className="text-xs text-[#555] mt-1">Add moments, chapters, and letters to fill this space.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.contentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="break-inside-avoid"
            >
              <ContentCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
