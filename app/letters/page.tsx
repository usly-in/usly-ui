"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, Lock, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import api from "@/lib/api";
import type { ContentItem } from "@/types";

export default function LettersPage() {
  const [letters, setLetters] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/letters")
      .then((r) => setLetters(r.data.items ?? []))
      .catch(() => setLetters([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this letter?")) return;
    try {
      await api.delete(`/api/letters/${id}`);
      setLetters((prev) => prev.filter((l) => l.contentId !== id));
    } catch {
      alert("Failed to delete letter.");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5]">Letters</h1>
          <p className="text-sm text-[#888] mt-1">Words meant to be found at the right time</p>
        </div>
        <Link href="/letters/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all">
          <Plus className="w-4 h-4" /> Write a letter
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#141414] animate-pulse border border-[#2a2a2a]" />)}
        </div>
      ) : letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#e4a0a0]/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#e4a0a0]" />
          </div>
          <p className="text-[#888] text-sm mb-1">No letters yet</p>
          <p className="text-xs text-[#555]">Write a letter — seal it for a future date.</p>
          <Link href="/letters/new" className="mt-4 text-sm text-[#e4a0a0] hover:underline">Write your first letter →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {letters.map((letter, i) => (
            <motion.div key={letter.contentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="relative group/row">
              <Link href={`/letters/${letter.contentId}`}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/30 hover:bg-[#1a1a1a] transition-all">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${letter.locked ? "bg-[#2a2a2a]" : "bg-[#e4a0a0]/10"}`}>
                  {letter.locked
                    ? <Lock className="w-4 h-4 text-[#555]" />
                    : <Mail className="w-4 h-4 text-[#e4a0a0]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#f5f5f5] truncate">
                      {letter.locked ? "Sealed letter" : letter.title}
                    </h3>
                    {letter.locked && (
                      <span className="text-xs text-[#555] border border-[#2a2a2a] rounded-full px-2 py-0.5 flex-shrink-0">locked</span>
                    )}
                  </div>
                  {letter.openAt && (
                    <p className="text-xs text-[#888]">
                      {letter.locked
                        ? `Opens ${format(new Date(letter.openAt), "MMMM d, yyyy")}`
                        : `Opened ${format(new Date(letter.openAt), "MMMM d, yyyy")}`}
                    </p>
                  )}
                  {!letter.openAt && (
                    <p className="text-xs text-[#888]">{format(new Date(letter.createdAt), "MMMM d, yyyy")}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e4a0a0] flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
              <button
                onClick={() => handleDelete(letter.contentId)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover/row:opacity-100 transition-all z-10"
                aria-label="Delete letter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
