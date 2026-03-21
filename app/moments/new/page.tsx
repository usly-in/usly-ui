"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Camera, Sparkles, LayoutTemplate, X } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { UploadZone } from "@/components/UploadZone";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import type { UploadResponse } from "@/types";
import { TEMPLATE_LIST, TEMPLATE_MAP } from "@/app/components/templates";

const TipTapEditor = dynamic(
  () => import("@/components/TipTapEditor").then((m) => m.TipTapEditor),
  { ssr: false },
);

export default function NewMomentPage() {
  const router = useRouter();
  const [momentId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  // Blob preview URLs for template image slots (generated from File objects)
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Regenerate preview URLs whenever files change
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Called by template image slots — opens system file picker
  const handleImageSlotClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  function selectTemplate(id: string) {
    const entry = TEMPLATE_LIST.find((t) => t.id === id);
    if (!entry) return;
    // Switching to a different template: pre-fill only if fields are empty
    if (activeTemplate !== id) {
      if (!title) setTitle(entry.placeholders.title);
      if (!caption) setCaption(entry.placeholders.caption);
      if (!content) setContent(entry.placeholders.story);
    }
    setActiveTemplate(id);
  }

  function clearTemplate() {
    setActiveTemplate(null);
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let uploadData: UploadResponse | undefined;
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        fd.append("type", "moment");
        fd.append("moment_id", momentId);
        const { data } = await api.post<UploadResponse>("/api/upload", fd);
        uploadData = data;
      }

      await api.post("/api/moments", {
        title,
        caption: caption || undefined,
        // Wrap plain text in <p> so content is always HTML-compatible
        content: (() => {
          if (!content) return undefined;
          return content.trim().startsWith("<") ? content : `<p>${content}</p>`;
        })(),
        eventDate: eventDate || undefined,
        imageUrl: uploadData?.images?.[0]?.fullUrl,
        images: uploadData?.images ?? undefined,
        spriteUrl: uploadData?.sprite?.sheetUrl,
        spriteManifest: uploadData?.sprite,
        templateId: activeTemplate ?? undefined,
      });

      router.push("/moments");
    } catch {
      setUploadKey((k) => k + 1);
      alert("Failed to save moment.");
    } finally {
      setSaving(false);
    }
  };

  const ActiveTemplateComponent = activeTemplate ? TEMPLATE_MAP[activeTemplate] : null;

  return (
    <div className="p-6 md:p-8">
      {/* ── Hidden file input for template image slots ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileInputChange}
      />

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

      {/* ── Template Picker — visual thumbnail previews ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[#555] flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-[#e4a0a0]" />
            Choose a template
          </p>
          <AnimatePresence>
            {activeTemplate && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearTemplate}
                className="flex items-center gap-1 text-xs text-[#555] hover:text-[#888] transition-colors"
              >
                <X className="w-3 h-3" /> Exit template
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* "No template" blank slot */}
          <motion.button
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0, type: "spring", stiffness: 110, damping: 16 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={clearTemplate}
            className={[
              "relative flex-none w-32 h-48 rounded-2xl border transition-colors duration-200 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1.5",
              activeTemplate
                ? "border-[#2a2a2a] bg-[#141414] hover:border-[#3a3a3a]"
                : "border-[#e4a0a0]/50 bg-[#e4a0a0]/5",
            ].join(" ")}
          >
            {activeTemplate ? null : (
              <motion.div
                layoutId="template-selection-ring"
                className="absolute inset-0 rounded-2xl border-2 border-[#e4a0a0]/50 pointer-events-none"
              />
            )}
            <Sparkles className="w-5 h-5 text-[#555]" />
            <span className="text-[10px] text-[#555]">No template</span>
          </motion.button>

          {/* Thumbnail cards — actual template renders scaled to fit the card */}
          {TEMPLATE_LIST.map((entry, i) => {
            const selected = activeTemplate === entry.id;
            const Comp = TEMPLATE_MAP[entry.id];
            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: (i + 1) * 0.06, type: "spring", stiffness: 110, damping: 16 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectTemplate(entry.id)}
                className={[
                  "relative flex-none w-32 h-48 rounded-2xl border overflow-hidden cursor-pointer transition-colors duration-200",
                  selected ? "border-[#e4a0a0]/60" : "border-[#2a2a2a] hover:border-[#3a3a3a]",
                ].join(" ")}
                title={entry.name}
              >
                {/* Scaled-down real template render */}
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: 512,
                    height: 768,
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                  }}
                >
                  <Comp
                    title={entry.placeholders.title}
                    caption={entry.placeholders.caption}
                    story={entry.placeholders.story}
                    images={[]}
                    editMode={false}
                  />
                </div>
                {/* Overlay: template name */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/80 to-transparent text-left">
                  <p className="text-[10px] font-medium text-[#f5f5f5] leading-none">{entry.name}</p>
                  <p className="text-[9px] text-[#888] mt-0.5 leading-none">{entry.emoji} {entry.tag}</p>
                </div>
                {selected && (
                  <motion.div
                    layoutId="template-selection-ring"
                    className="absolute inset-0 rounded-2xl border-2 border-[#e4a0a0]/60 pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Main editing area ── */}
      <AnimatePresence mode="wait">
        {ActiveTemplateComponent ? (
          /* ── Template edit mode ── */
          <motion.div
            key="template-mode"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          >
            <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
              <ActiveTemplateComponent
                title={title}
                caption={caption}
                story={content}
                images={previewUrls}
                eventDate={eventDate}
                editMode
                onTitleChange={setTitle}
                onCaptionChange={setCaption}
                onStoryChange={setContent}
                onImageSlotClick={handleImageSlotClick}
              />
            </div>

            {/* Floating action bar */}
            <div className="mt-4 flex items-center gap-3">
              {/* Date picker inline */}
              <div className="flex-1 max-w-xs">
                <DatePicker value={eventDate} onChange={setEventDate} placeholder="When did this happen?" />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Link
                  href="/moments"
                  className="inline-flex items-center min-h-10 px-4 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 min-h-10 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Camera className="w-4 h-4" /> Save moment</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Standard 2-col form (no template) ── */
          <motion.div
            key="form-mode"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
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

                <div className="border-t border-[#1e1e1e]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[#555] uppercase tracking-widest">
                      Date{" "}
                      <span className="normal-case tracking-normal font-normal">· optional</span>
                    </p>
                    <DatePicker value={eventDate} onChange={setEventDate} placeholder="When did this happen?" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="moment-caption"
                    className="text-xs font-medium text-[#555] uppercase tracking-widest"
                  >
                    Caption{" "}
                    <span className="normal-case tracking-normal font-normal">· optional</span>
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
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#555] uppercase tracking-widest">
                    Story{" "}
                    <span className="normal-case tracking-normal font-normal">· optional</span>
                  </p>
                  <TipTapEditor
                    value={content}
                    onChange={setContent}
                    placeholder="What made this moment special…"
                    height={430}
                  />
                </div>

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
                      <><Camera className="w-4 h-4" /> Save moment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
