"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import MessageModal from "@/components/MessageModal";

const TipTapEditor = dynamic(
  () => import("@/components/TipTapEditor").then((m) => m.TipTapEditor),
  { ssr: false }
);

export default function NewChapterPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/chapters", {
        title,
        content,
        eventDate: eventDate || undefined,
      });
      router.push("/chapters");
    } catch {
      setPopupMessage("Failed to save chapter.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/chapters" className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:border-[#888]/40 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-light tracking-tight text-[#f5f5f5]">Write a chapter</h1>
          <p className="text-xs text-[#888] mt-0.5">Tell the story of a moment that mattered</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <input
          type="text" placeholder="Chapter title…"
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-base"
        />

        <DatePicker
          value={eventDate}
          onChange={setEventDate}
          placeholder="When did this happen? (optional)"
        />

        <TipTapEditor value={content} onChange={setContent} placeholder="Tell your story…" height={450} />

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/chapters" className="px-4 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">Cancel</Link>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save chapter</>}
          </button>
        </div>
      </motion.div>
      <MessageModal open={!!popupMessage} onClose={() => setPopupMessage(null)} title="Error" message={popupMessage ?? ""} />
    </div>
  );
}
