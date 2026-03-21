"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ImageIcon, BookOpen, Mail, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import type { ContentItem, Tenant } from "@/types";

interface DashboardStats {
  moments: number;
  chapters: number;
  letters: number;
  recentItems: ContentItem[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tenantRes, momentsRes, chaptersRes, lettersRes] = await Promise.all([
          api.get("/api/tenants/me"),
          api.get("/api/moments?limit=3"),
          api.get("/api/chapters?limit=3"),
          api.get("/api/letters?limit=3"),
        ]);
        setTenant(tenantRes.data);
        const moments = momentsRes.data.items ?? [];
        const chapters = chaptersRes.data.items ?? [];
        const letters = lettersRes.data.items ?? [];
        const recent = [...moments, ...chapters, ...letters]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setStats({
          moments: momentsRes.data.total ?? moments.length,
          chapters: chaptersRes.data.total ?? chapters.length,
          letters: lettersRes.data.total ?? letters.length,
          recentItems: recent,
        });
      } catch {
        // API not yet connected — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Moments", count: stats?.moments ?? 0, icon: ImageIcon, href: "/moments", color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Chapters", count: stats?.chapters ?? 0, icon: BookOpen, href: "/chapters", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Letters", count: stats?.letters ?? 0, icon: Mail, href: "/letters", color: "text-[#e4a0a0]", bg: "bg-[#e4a0a0]/10" },
  ];

  const quickAdd = [
    { label: "Add a moment", icon: ImageIcon, href: "/moments" },
    { label: "Write a chapter", icon: BookOpen, href: "/chapters/new" },
    { label: "Write a letter", icon: Mail, href: "/letters/new" },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-4">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? ""}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2a2a2a] flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#e4a0a0]/20 flex items-center justify-center text-lg text-[#e4a0a0] font-medium flex-shrink-0">
            {session?.user?.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#f5f5f5]">
            {tenant?.name ?? "Your memory lane"}
          </h1>
          <p className="text-sm text-[#888] mt-0.5">
            {session?.user?.name ? `Welcome back, ${session.user.name.split(" ")[0]}` : "Welcome back"}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.label} href={c.href}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#e4a0a0]/30 transition-all group">
                  <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <p className="text-2xl font-light text-[#f5f5f5]">{c.count}</p>
                  <p className="text-xs text-[#888] mt-0.5">{c.label}</p>
                </Link>
              );
            })}
          </motion.div>

          {/* Quick Add */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-sm font-medium text-[#888] mb-3">Quick add</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickAdd.map((q) => {
                const Icon = q.icon;
                return (
                  <Link key={q.label} href={q.href}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/30 hover:bg-[#1c1c1c] transition-all text-sm text-[#888] hover:text-[#f5f5f5]">
                    <Plus className="w-3.5 h-3.5 text-[#e4a0a0]" />
                    {q.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Recent */}
          {!loading && stats?.recentItems && stats.recentItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#888]">Recent memories</h2>
                <Link href="/moments" className="text-xs text-[#e4a0a0] flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {stats.recentItems.map((item) => (
                  <Link key={item.contentId} href={`/memory/${item.contentId}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/20 transition-all">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f5f5f5] truncate">{item.title}</p>
                      <p className="text-xs text-[#888] capitalize">{item.type}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && stats?.moments === 0 && stats.chapters === 0 && stats.letters === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-dashed border-[#2a2a2a] p-8 text-center">
              <p className="text-[#888] text-sm mb-2">Your memory lane is empty</p>
              <p className="text-xs text-[#555]">Start by adding a moment, writing a chapter, or leaving a letter.</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar panel */}
        <div className="space-y-4">
          {tenant?.startDate && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <CountdownTimer startDate={tenant.startDate} label="together since" />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4">
            <h3 className="text-xs font-medium text-[#888] mb-3">Private space</h3>
            <Link href="/only-us"
              className="block w-full text-center px-4 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-[#f5f5f5] hover:border-[#e4a0a0]/30 hover:bg-[#1c1c1c] transition-all">
              Only Us →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
