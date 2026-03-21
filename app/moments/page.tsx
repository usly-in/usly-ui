"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ImageIcon } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem } from "@/types";

export default function MomentsPage() {
  const [moments, setMoments] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMoments = async () => {
    try {
      const res = await api.get("/api/moments");
      setMoments(res.data.items ?? []);
    } catch {
      setMoments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMoments(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this moment?")) return;
    try {
      await api.delete(`/api/moments/${id}`);
      setMoments((prev) => prev.filter((m) => m.contentId !== id));
    } catch {
      alert("Failed to delete moment.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5]">Moments</h1>
          <p className="text-sm text-[#888] mt-1">Your private photo gallery</p>
        </div>
        <Link
          href="/moments/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all"
        >
          <Plus className="w-4 h-4" /> Add moment
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] h-64 animate-pulse" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-[#888] text-sm mb-1">No moments yet</p>
          <p className="text-xs text-[#555]">Click &ldquo;Add moment&rdquo; to save your first memory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moments.map((item, i) => (
            <motion.div key={item.contentId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ContentCard item={item} onDelete={() => handleDelete(item.contentId)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
