"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import api from "@/lib/api";
import type { Tenant, UploadResponse } from "@/types";
import { UploadZone } from "@/components/UploadZone";
import MessageModal from "@/components/MessageModal";

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", coverPhotoUrl: "", coverPhotoFile: null as File | null });
  const [uploadKey, setUploadKey] = useState(0);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/tenants/me")
      .then((r) => {
        setTenant(r.data);
        setForm({ name: r.data.name, startDate: r.data.startDate ?? "", coverPhotoUrl: r.data.coverPhotoUrl ?? "", coverPhotoFile: null });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let coverPhotoUrl = form.coverPhotoUrl;
      if (form.coverPhotoFile) {
        const fd = new FormData();
        fd.append("files", form.coverPhotoFile);
        fd.append("type", "moment");
        const { data } = await api.post<UploadResponse>("/api/upload", fd);
        coverPhotoUrl = data.images[0]?.fullUrl ?? coverPhotoUrl;
        setUploadKey((k) => k + 1);
      }
      await api.patch("/api/tenants/me", { name: form.name, startDate: form.startDate, coverPhotoUrl });
      setForm((p) => ({ ...p, coverPhotoUrl, coverPhotoFile: null }));
      setPopupMessage("Settings saved!");
      setTimeout(() => setPopupMessage(null), 1500);
    } catch {
      setPopupMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5] mb-1">Settings</h1>
      <p className="text-sm text-[#888] mb-8">Manage your memory lane</p>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-[#888] mb-2 block">Memory lane name</label>
          <input
            type="text" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none focus:border-[#e4a0a0]/60 transition-colors text-base"
          />
        </div>

        {/* Start date */}
        <div>
          <label className="text-xs font-medium text-[#888] mb-2 block">Your anniversary / start date</label>
          <DatePicker
            value={form.startDate}
            onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
            placeholder="Pick a start date"
            placement="down"
          />
        </div>

        {/* Cover photo */}
        <div>
          <label className="text-xs font-medium text-[#888] mb-2 block">Cover photo</label>
          {form.coverPhotoUrl && (
            <img src={form.coverPhotoUrl} alt="Cover" className="w-full h-32 object-cover rounded-2xl mb-3" />
          )}
          <UploadZone key={uploadKey} maxFiles={1} onFilesSelected={(fs) => setForm((p) => ({ ...p, coverPhotoFile: fs[0] ?? null }))} />
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4">
          <p className="text-xs font-medium text-[#888] mb-1">Plan</p>
          <p className="text-sm text-[#f5f5f5] capitalize">{tenant?.subscriptionPlan ?? "free"}</p>
          <p className="text-xs text-[#555] mt-1">Upgrade coming soon.</p>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-xl text-sm font-medium hover:bg-[#c47a7a] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save changes</>}
          </button>
        </div>
      </motion.div>
      <MessageModal open={!!popupMessage} onClose={() => setPopupMessage(null)} title={popupMessage === "Settings saved!" ? "Saved" : "Error"} message={popupMessage ?? ""} />
    </div>
  );
}
