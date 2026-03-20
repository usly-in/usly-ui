"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImagePlus } from "lucide-react";

interface UploadZoneProps {
  /** Called whenever the file list changes. */
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export function UploadZone({ onFilesSelected, maxFiles = 6, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid = arr.filter((f) => {
        if (!f.type.startsWith("image/")) { alert(`"${f.name}" is not an image.`); return false; }
        if (f.size > 10 * 1024 * 1024)    { alert(`"${f.name}" exceeds 10 MB.`);   return false; }
        return true;
      });
      if (!valid.length) return;

      setFiles((prev) => {
        const merged = [...prev, ...valid].slice(0, maxFiles);
        onFilesSelected(merged);

        // Generate previews for new files
        valid.slice(0, maxFiles - prev.length).forEach((f) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews((pp) => [...pp, e.target?.result as string].slice(0, maxFiles));
          };
          reader.readAsDataURL(f);
        });

        return merged;
      });
    },
    [maxFiles, onFilesSelected]
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      onFilesSelected(next);
      return next;
    });
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={className}>
      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#2a2a2a]">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — shown only when more files can be added */}
      {canAddMore && (
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? "border-[#e4a0a0]/60 bg-[#e4a0a0]/5"
              : "border-[#2a2a2a] hover:border-[#888]/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <label className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#e4a0a0]/10 flex items-center justify-center">
              {files.length > 0 ? (
                <ImagePlus className="w-5 h-5 text-[#e4a0a0]" />
              ) : (
                <Upload className="w-5 h-5 text-[#e4a0a0]" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-[#f5f5f5] font-medium">
                {files.length > 0 ? "Add more photos" : "Drop photos here"}
              </p>
              <p className="text-xs text-[#888] mt-1">
                up to {maxFiles} photos · JPG, PNG, WEBP up to 10 MB each
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
