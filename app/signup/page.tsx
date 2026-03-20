"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Loader2, Star, Sparkles, UserCircle2, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import type { GroupType, UserGroup } from "@/types";

type Step = "welcome" | "group" | "names" | "date" | "done";

const GROUP_OPTIONS: { type: GroupType; label: string; desc: string; Icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }[] = [
  { type: "lover",   label: "Lover",   desc: "Your partner, soulmate, or loved one", Icon: Heart,        color: "text-[#e4a0a0]", bg: "bg-[#e4a0a0]/10", border: "border-[#e4a0a0]/40" },
  { type: "family",  label: "Family",  desc: "Parents, siblings, relatives",         Icon: UserCircle2,  color: "text-[#f0a070]", bg: "bg-[#f0a070]/10", border: "border-[#f0a070]/40" },
  { type: "friends", label: "Friends", desc: "Best friends, your crew",              Icon: Star,         color: "text-[#70b8e0]", bg: "bg-[#70b8e0]/10", border: "border-[#70b8e0]/40" },
  { type: "custom",  label: "Custom",  desc: "Any group that matters to you",        Icon: Sparkles,     color: "text-[#a0a0e4]", bg: "bg-[#a0a0e4]/10", border: "border-[#a0a0e4]/40" },
];

export default function SignupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewGroup = searchParams.get("new") === "1";

  const [step, setStep] = useState<Step>(isNewGroup ? "group" : "welcome");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", groupType: "lover" as GroupType });

  // If coming back as new-group and already signed in, skip to group selection
  useEffect(() => {
    if (isNewGroup && session && step === "welcome") setStep("group");
  }, [session, isNewGroup, step]);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/signup?onboarding=1" });
  };

  const handleCreateTenant = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/tenants", {
        name: form.name,
        startDate: form.startDate || new Date().toISOString().split("T")[0],
        groupType: form.groupType,
      });
      const newGroup: UserGroup = {
        tenantId: res.data.tenantId,
        userId: session?.user?.id ?? "",
        role: "admin",
        groupType: form.groupType,
        name: form.name,
      };
      const existingGroups: UserGroup[] = session?.user?.groups ?? [];
      await update({
        tenantId: res.data.tenantId,
        role: "admin",
        groups: [...existingGroups, newGroup],
      });
      setStep("done");
      setTimeout(() => { globalThis.location.href = "/dashboard"; }, 1500);
    } catch {
      alert("Failed to create your memory lane. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Accent color driven by selected group type
  const selectedMeta = GROUP_OPTIONS.find((g) => g.type === form.groupType) ?? GROUP_OPTIONS[0];
  const accentHex = /^#[0-9a-fA-F]+/.exec(selectedMeta.color)?.[0] ?? "#e4a0a0";

  const NAME_HINTS: Record<string, string> = {
    lover: 'Usually your names — e.g. "Arjun & Meera"',
    family: 'e.g. "The Sharma Family" or "Mum & Dad"',
    friends: 'e.g. "College Squad" or "The Crew"',
    custom: "Give your group a name",
  };
  const NAME_PLACEHOLDERS: Record<string, string> = {
    lover: "Arjun & Meera",
    family: "The Sharma Family",
    friends: "College Squad",
    custom: "My Group",
  };
  const nameSectionHint = NAME_HINTS[form.groupType] ?? NAME_HINTS.custom;
  const nameSectionPlaceholder = NAME_PLACEHOLDERS[form.groupType] ?? NAME_PLACEHOLDERS.custom;

  // If not signed in yet (and not a new-group flow), show the initial sign-in step
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center px-6">
        <button onClick={() => router.push("/")} className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4a0a0]/10 mb-6">
            <Heart className="w-6 h-6 text-[#e4a0a0] fill-current" />
          </div>
          <h1 className="text-2xl font-light tracking-tight mb-2">Create your memory lane</h1>
          <p className="text-[#888] text-sm mb-8 max-w-xs mx-auto">A private space to capture moments, write chapters, and leave letters for each other.</p>
          <button onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-[#2a2a2a] rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] hover:border-[#888]/40 transition-all text-sm text-[#f5f5f5] font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
          <p className="mt-6 text-xs text-[#888]">Already have an account? <a href="/login" className="text-[#e4a0a0] hover:underline">Sign in</a></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center px-6">
      <button onClick={() => router.push("/dashboard")} className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <AnimatePresence mode="wait">

        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4a0a0]/10 mb-6">
              <Heart className="w-6 h-6 text-[#e4a0a0] fill-current" />
            </div>
            <h1 className="text-2xl font-light tracking-tight mb-2">Hi, {session.user.name?.split(" ")[0]} 👋</h1>
            <p className="text-[#888] text-sm mb-8">Let&apos;s set up your first memory lane.</p>
            <button onClick={() => setStep("group")}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-2xl font-medium hover:bg-[#c47a7a] transition-all">
              Get started <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === "group" && (
          <motion.div key="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm">
            {isNewGroup && (
              <p className="text-xs text-[#888] capitalize mb-1">Hi, {session.user.name?.split(" ")[0]} 👋</p>
            )}
            <h2 className="text-xl font-light tracking-tight mb-1">What type of group is this?</h2>
            <p className="text-[#888] text-sm mb-6">Each group gets its own theme and memories.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GROUP_OPTIONS.map(({ type, label, desc, Icon, color, bg, border }) => (
                <button
                  key={type}
                  onClick={() => setForm((p) => ({ ...p, groupType: type }))}
                  className={clsx(
                    "flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all",
                    form.groupType === type
                      ? `${bg} ${border} border`
                      : "bg-[#141414] border-[#2a2a2a] hover:border-[#555]"
                  )}
                >
                  <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={clsx("w-5 h-5", color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f5f5f5]">{label}</p>
                    <p className="text-[10px] text-[#888] leading-tight mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("names")}
              className={clsx(
                "w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-medium transition-all",
                `bg-[${selectedMeta.color.replace("text-[","").replace("]","")}] text-[#0b0b0b]`
              )}
              style={{ backgroundColor: accentHex }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            {isNewGroup && (
              <button onClick={() => router.push("/dashboard")} className="w-full text-center text-sm text-[#888] hover:text-[#f5f5f5] mt-3 transition-colors">← Cancel</button>
            )}
          </motion.div>
        )}

        {step === "names" && (
          <motion.div key="names" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm">
            <h2 className="text-xl font-light tracking-tight mb-1">What&apos;s this memory lane called?</h2>
            <p className="text-[#888] text-sm mb-6">
              {nameSectionHint}
            </p>
            <input
              type="text"
              placeholder={nameSectionPlaceholder}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#555] focus:outline-none transition-colors text-base mb-4"
              style={{ borderColor: form.name.trim() ? accentHex + "99" : undefined }}
            />
            <button onClick={() => form.name.trim() && setStep("date")} disabled={!form.name.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[#0b0b0b]"
              style={{ backgroundColor: accentHex }}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setStep("group")} className="w-full text-center text-sm text-[#888] hover:text-[#f5f5f5] mt-3 transition-colors">← Back</button>
          </motion.div>
        )}

        {step === "date" && (
          <motion.div key="date" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm">
            <h2 className="text-xl font-light tracking-tight mb-1">
              {form.groupType === "lover" ? "When did your story begin?" : "Any special start date?"}
            </h2>
            <p className="text-[#888] text-sm mb-6">
              {form.groupType === "lover" ? "Your anniversary or the day you met." : "A founding date, birthday, or anything special."} (Optional)
            </p>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] focus:outline-none transition-colors text-base mb-4 scheme-dark"
            />
            <button onClick={handleCreateTenant} disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-medium transition-all disabled:opacity-60 text-[#0b0b0b]"
              style={{ backgroundColor: accentHex }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><selectedMeta.Icon className="w-4 h-4" /> Create memory lane</>}
            </button>
            <button onClick={() => setStep("names")} className="w-full text-center text-sm text-[#888] hover:text-[#f5f5f5] mt-3 transition-colors">← Back</button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-light tracking-tight mb-2">Your memory lane is ready</h2>
            <p className="text-[#888] text-sm">Taking you there now…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

