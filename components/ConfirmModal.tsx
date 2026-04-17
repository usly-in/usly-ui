"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h2 className="text-base font-medium text-[#f5f5f5]">{title}</h2>
          {description ? <p className="text-xs text-[#888] mt-1">{description}</p> : null}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent text-[#f5f5f5] border border-[#2a2a2a] rounded-xl text-sm hover:bg-[#1c1c1c] transition-all"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              danger
                ? "px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-all disabled:opacity-60"
                : "px-4 py-2 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl font-medium text-sm hover:bg-[#c47a7a] transition-all disabled:opacity-60"
            }
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
