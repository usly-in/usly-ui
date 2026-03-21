"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Camera } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { UploadZone } from "@/components/UploadZone";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import type { UploadResponse } from "@/types";

const TipTapEditor = dynamic(
  () => import("@/components/TipTapEditor").then((m) => m.TipTapEditor),
  { ssr: false },
);

export default function NewMomentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let uploadData: UploadResponse | undefined;
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        fd.append("type", "moment");
        const { data } = await api.post<UploadResponse>("/api/upload", fd);
        uploadData = data;
      }

      await api.post("/api/moments", {
        title,
        caption: caption || undefined,
        content: content || undefined,
        eventDate: eventDate || undefined,
        imageUrl: uploadData?.images?.[0]?.fullUrl,
        images: uploadData?.images ?? undefined,
        spriteUrl: uploadData?.sprite?.sheetUrl,
        spriteManifest: uploadData?.sprite,
      });

      router.push("/moments");
    } catch {
      setUploadKey((k) => k + 1);
      alert("Failed to save moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/moments"
          className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:border-[#888]/40 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-light tracking-tight text-[#f5f5f5]">
            Capture a moment
          </h1>
          <p className="text-xs text-[#888] mt-0.5">
            Photos, a caption, and the story behind it
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5 sm:p-6 gap-6 lg:gap-0 items-start">
          {/* ── Left: photo drop zone ── */}
          <div className="space-y-4 lg:pr-6">
            <p className="text-xs font-medium text-[#555] uppercase tracking-widest px-0.5">
              Photos{" "}
              <span className="normal-case tracking-normal font-normal text-[#555]">
                · optional
              </span>
            </p>
            <UploadZone key={uploadKey} onFilesSelected={setFiles} />

            {/* Divider */}
            <div className="border-t border-[#1e1e1e]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label
                  htmlFor="moment-title"
                  className="text-xs font-medium text-[#555] uppercase tracking-widest"
                >
                  Name
                </label>
                <input
                  id="moment-title"
                  type="text"
                  placeholder="Give this moment a name…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#444] focus:outline-none focus:border-[#e4a0a0]/50 transition-colors text-sm"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[#555] uppercase tracking-widest">
                  Date{" "}
                  <span className="normal-case tracking-normal font-normal">
                    · optional
                  </span>
                </p>
                <DatePicker
                  value={eventDate}
                  onChange={setEventDate}
                  placeholder="When did this happen?"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <label
                htmlFor="moment-caption"
                className="text-xs font-medium text-[#555] uppercase tracking-widest"
              >
                Caption{" "}
                <span className="normal-case tracking-normal font-normal">
                  · optional
                </span>
              </label>
              <textarea
                id="moment-caption"
                placeholder="A short caption…"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#444] focus:outline-none focus:border-[#e4a0a0]/50 transition-colors text-sm resize-none"
              />
            </div>
          </div>

          {/* ── Right: story + actions ── */}
          <div className="space-y-4 lg:border-l lg:border-[#2a2a2a] lg:pl-6">
            {/* Story */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#555] uppercase tracking-widest">
                Story{" "}
                <span className="normal-case tracking-normal font-normal">
                  · optional
                </span>
              </p>
              <TipTapEditor
                value={content}
                onChange={setContent}
                placeholder="What made this moment special…"
                height={430}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Link
                href="/moments"
                className="inline-flex items-center min-h-11 px-4 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex items-center gap-2 px-5 py-3 min-h-11 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-4 h-4" /> Save moment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
