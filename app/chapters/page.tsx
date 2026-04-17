"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import api from "@/lib/api";
import type { ContentItem } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import MessageModal from "@/components/MessageModal";

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/chapters")
      .then((r) => setChapters(r.data.items ?? []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const doDeleteConfirmed = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await api.delete(`/api/chapters/${confirmTarget}`);
      setChapters((prev) => prev.filter((c) => c.contentId !== confirmTarget));
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch {
      setPopupMessage("Failed to delete chapter.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5]">Chapters</h1>
          <p className="text-sm text-[#888] mt-1">Your shared story</p>
        </div>
        <Link href="/chapters/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all">
          <Plus className="w-4 h-4" /> Write a chapter
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#141414] animate-pulse border border-[#2a2a2a]" />)}
        </div>
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-[#888] text-sm mb-1">No chapters yet</p>
          <p className="text-xs text-[#555]">Write your first chapter — your story deserves to be told.</p>
          <Link href="/chapters/new" className="mt-4 text-sm text-[#e4a0a0] hover:underline">Start writing →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, i) => (
            <motion.div key={chapter.contentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="relative group/row">
              <Link href={`/chapters/${chapter.contentId}`}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/30 hover:bg-[#1a1a1a] transition-all">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#f5f5f5] mb-1 truncate">{chapter.title}</h3>
                  {chapter.content && (
                    <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
                      {chapter.content.replace(/[#*_`]/g, "").slice(0, 120)}…
                    </p>
                  )}
                  <p className="text-xs text-[#555] mt-2">
                    {chapter.eventDate
                      ? format(new Date(chapter.eventDate), "MMMM d, yyyy")
                      : format(new Date(chapter.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e4a0a0] flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
              <button
                onClick={() => handleDelete(chapter.contentId)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover/row:opacity-100 transition-all z-10"
                aria-label="Delete chapter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Delete chapter?"
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={doDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
      <MessageModal open={!!popupMessage} onClose={() => setPopupMessage(null)} title="Error" message={popupMessage ?? ""} />
    </div>
  );
}
