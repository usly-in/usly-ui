"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Mail, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import type { Invitation } from "@/types";
import { InviteModal } from "@/components/InviteModal";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const res = await api.get("/api/invitations");
      setInvitations(res.data.items ?? []);
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvitations(); }, []);

  const handleRevoke = async (inviteId: string) => {
    if (!confirm("Revoke this invitation?")) return;
    setRevoking(inviteId);
    try {
      await api.delete(`/api/invitations/${inviteId}`);
      fetchInvitations();
    } catch {
      alert("Failed to revoke invitation.");
    } finally {
      setRevoking(null);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    accepted: { icon: CheckCircle, label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    revoked: { icon: XCircle, label: "Revoked", color: "text-[#555]", bg: "bg-[#2a2a2a]" },
  };

  return (
    <div className="p-6 md:p-8">
      <InviteModal open={showModal} onClose={() => setShowModal(false)} onInvited={fetchInvitations} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5]">Invitations</h1>
          <p className="text-sm text-[#888] mt-1">Manage who can view your memory lane</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all">
          <Plus className="w-4 h-4" /> Invite someone
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-[#141414] animate-pulse border border-[#2a2a2a]" />)}
        </div>
      ) : invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#e4a0a0]/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#e4a0a0]" />
          </div>
          <p className="text-[#888] text-sm mb-1">No invitations yet</p>
          <p className="text-xs text-[#555]">Invite someone special to view your memory lane.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invitations.map((inv, i) => {
            const config = statusConfig[inv.status];
            const Icon = config.icon;
            return (
              <motion.div key={inv.inviteId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-[#2a2a2a] bg-[#141414]">
                <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f5f5f5] truncate">{inv.email}</p>
                  <p className="text-xs text-[#888]">
                    {config.label} · Expires {format(new Date(inv.expiresAt), "MMM d, yyyy")}
                  </p>
                </div>
                {inv.status === "pending" && (
                  <button onClick={() => handleRevoke(inv.inviteId)} disabled={revoking === inv.inviteId}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#888] hover:text-red-400 hover:bg-red-400/10 transition-all border border-[#2a2a2a]">
                    {revoking === inv.inviteId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Revoke
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
