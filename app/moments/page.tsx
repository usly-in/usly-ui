"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, ImageIcon } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { ContentCard } from "@/components/ContentCard";
import api from "@/lib/api";
import type { ContentItem, UploadResponse } from "@/types";

interface NewMomentForm {
  title: string;
  caption: string;
  eventDate: string;
  files: File[];
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewMomentForm>({ title: "", caption: "", eventDate: "", files: [] });
  const [uploadKey, setUploadKey] = useState(0);

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

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let uploadData: UploadResponse | undefined;
      if (form.files.length > 0) {
        const fd = new FormData();
        form.files.forEach((f) => fd.append("files", f));
        fd.append("type", "moment");
        const { data } = await api.post<UploadResponse>("/api/upload", fd);
        uploadData = data;
      }

      await api.post("/api/moments", {
        title: form.title,
        caption: form.caption || undefined,
        eventDate: form.eventDate || undefined,
        imageUrl:       uploadData?.images?.[0]?.fullUrl,
        images:         uploadData?.images ?? undefined,
        spriteUrl:      uploadData?.sprite.sheetUrl,
        spriteManifest: uploadData?.sprite,
      });

      setShowForm(false);
      setForm({ title: "", caption: "", eventDate: "", files: [] });
      setUploadKey((k) => k + 1);
      fetchMoments();
    } catch {
      alert("Failed to save moment.");
    } finally {
      setSaving(false);
    }
  };

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
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all"
        >
          <Plus className="w-4 h-4" /> Add moment
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#f5f5f5]">New moment</h2>
                <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#f5f5f5]"><X className="w-4 h-4" /></button>
              </div>
              <UploadZone key={uploadKey} onFilesSelected={(f) => setForm((p) => ({ ...p, files: f }))} />
              <input
                type="text" placeholder="Give this moment a name…"
                value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-sm"
              />
              <textarea
                placeholder="A little caption… (optional)"
                rows={2} value={form.caption}
                onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-sm resize-none"
              />
              <input
                type="date" value={form.eventDate}
                onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-sm [color-scheme:dark]"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save moment"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
