"use client";

import { useState } from "react";
import { ImageCropper } from "@/components/ui/shape-image-cropper";

/**
 * Example usage — not wired into any route. Shows how a page would let a user
 * pick a photo and crop it to a given shape before uploading.
 */
export default function ShapeImageCropperDemo() {
  const [preview, setPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    setCropperOpen(true);
    e.target.value = "";
  };

  return (
    <div className="p-6">
      <input type="file" accept="image/*" onChange={handleFile} className="mb-4 text-sm text-[#f5f5f5]" />

      {preview && (
        <img src={preview} alt="cropped result" className="w-40 h-40 object-cover rounded-xl border border-[#2a2a2a]" />
      )}

      <ImageCropper
        open={cropperOpen}
        image={cropSrc}
        shape="circle"
        fileName="avatar.png"
        onClose={() => setCropperOpen(false)}
        onCropComplete={({ previewUrl }) => setPreview(previewUrl)}
      />
    </div>
  );
}
