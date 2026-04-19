"use client";

import { X, XCircle } from "lucide-react";

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function MessageModal({ open, onClose, title = "", message = "" }: MessageModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#e4a0a0]/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-[#e4a0a0]" />
          </div>
          <div>
            {title ? (
              <h2 className="text-base font-medium text-[#f5f5f5]">{title}</h2>
            ) : null}
            {message ? <p className="text-xs text-[#888] mt-0.5">{message}</p> : null}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl font-medium text-sm hover:bg-[#c47a7a] transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
