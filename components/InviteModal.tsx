"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle } from "lucide-react";
import api from "@/lib/api";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

export function InviteModal({ open, onClose, onInvited }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/invitations", { email: email.toLowerCase().trim() });
      setSuccess(true);
      setEmail("");
      onInvited?.();
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#e4a0a0]/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#e4a0a0]" />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#f5f5f5]">Invite someone</h2>
            <p className="text-xs text-[#888]">They&apos;ll be able to view your memory lane</p>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle className="w-8 h-8 text-[#e4a0a0]" />
            <p className="text-sm text-[#f5f5f5]">Invitation sent!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="their@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-sm"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl font-medium text-sm hover:bg-[#c47a7a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send invitation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
