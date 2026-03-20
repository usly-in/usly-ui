"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";

const MarkdownEditor = dynamic(
  () => import("@/components/MarkdownEditor").then((m) => m.MarkdownEditor),
  { ssr: false }
);

export default function NewLetterPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [saving, setSaving] = useState(false);

  const isTimeLocked = !!openAt && new Date(openAt) > new Date();

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/letters", {
        title,
        content,
        openAt: openAt || undefined,
      });
      router.push("/letters");
    } catch {
      alert("Failed to save letter.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/letters" className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:border-[#888]/40 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-light tracking-tight text-[#f5f5f5]">Write a letter</h1>
          <p className="text-xs text-[#888] mt-0.5">Seal it for now, or set a future date to open</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <input
          type="text" placeholder="Letter title…"
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-base"
        />

        {/* Open At */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#e4a0a0]" />
            <p className="text-sm text-[#f5f5f5]">Time lock <span className="text-xs text-[#888]">(optional)</span></p>
          </div>
          <p className="text-xs text-[#888]">Set a date — this letter will be sealed until then.</p>
          <input
            type="date" value={openAt}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setOpenAt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-sm [color-scheme:dark]"
          />
          {isTimeLocked && (
            <p className="text-xs text-[#e4a0a0]">
              🔒 This letter will be sealed until {new Date(openAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        <MarkdownEditor value={content} onChange={setContent} height={400} />

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/letters" className="px-4 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">Cancel</Link>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isTimeLocked
              ? <><Lock className="w-4 h-4" /> Seal letter</>
              : <><Mail className="w-4 h-4" /> Save letter</>)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
