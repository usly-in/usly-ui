"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Check, X, ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "@/lib/cropImage";

/** Named shapes the app crops images into. Add new ones here as new surfaces need them. */
export type CropShapeName = "square" | "circle" | "wide" | "portrait" | "cinematic" | "classic";

interface ShapePreset {
  aspect: number;
  cropShape: "rect" | "round";
  label: string;
}

export const CROP_SHAPES: Record<CropShapeName, ShapePreset> = {
  square: { aspect: 1, cropShape: "rect", label: "Square · 1:1 (moment tile)" },
  circle: { aspect: 1, cropShape: "round", label: "Circle (avatar / profile)" },
  wide: { aspect: 16 / 9, cropShape: "rect", label: "Wide · 16:9 (hero background)" },
  portrait: { aspect: 4 / 5, cropShape: "rect", label: "Portrait · 4:5 (polaroid)" },
  cinematic: { aspect: 21 / 9, cropShape: "rect", label: "Cinematic · 21:9" },
  classic: { aspect: 4 / 3, cropShape: "rect", label: "Classic · 4:3" },
};

interface ImageCropperProps {
  /** Controls visibility. Component renders nothing when false. */
  open: boolean;
  /** Object URL or remote URL of the source image to crop. */
  image: string | null;
  /** Which shape to crop to — pass a preset name or a custom {aspect, cropShape}. */
  shape: CropShapeName | ShapePreset;
  onClose: () => void;
  /** Called with the cropped result once the user saves. */
  onCropComplete: (result: { file: File; previewUrl: string }) => void;
  /** Used as the output File's name. Defaults to "cropped.png". */
  fileName?: string;
}

export function ImageCropper({
  open,
  image,
  shape,
  onClose,
  onCropComplete,
  fileName = "cropped.png",
}: ImageCropperProps) {
  const preset = typeof shape === "string" ? CROP_SHAPES[shape] : shape;

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset crop/zoom state whenever a new image is opened for cropping.
  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, image]);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const result = await getCroppedImageFile(image, croppedAreaPixels, {
        round: preset.cropShape === "round",
        fileName,
      });
      onCropComplete(result);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium text-[#f5f5f5]">Crop photo</h2>
            <p className="text-xs text-[#888] mt-0.5">{preset.label}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all"
            aria-label="Cancel crop"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-72 rounded-xl overflow-hidden bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={preset.aspect}
            cropShape={preset.cropShape}
            showGrid={preset.cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <ZoomIn className="w-4 h-4 text-[#888] shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#e4a0a0]"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-medium text-sm text-[#f5f5f5] border border-[#2a2a2a] hover:bg-[#1c1c1c] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!croppedAreaPixels || saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl font-medium text-sm hover:bg-[#c47a7a] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : "Save crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
