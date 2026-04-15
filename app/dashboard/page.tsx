"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ImageIcon, BookOpen, Mail, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import TiltCard from "@/app/components/TiltCard";
import type { ContentItem, Tenant } from "@/types";

/* ── Spring-driven animated number counter ── */
function AnimatedCounter({ to }: Readonly<{ to: number }>) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 14 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  useEffect(() => { mv.set(to); }, [to, mv]);
  return <motion.span>{display}</motion.span>;
}

/* ── Magnetic spring zone — element body follows cursor ── */
function MagneticZone({ children, strength = 0.42 }: Readonly<{ children: ReactNode; strength?: number }>) {
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  }
  function onLeave() { x.set(0); y.set(0); }
  return (
    <motion.div style={{ x, y }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.div>
  );
}

const TYPE_ACCENT: Record<string, string> = {
  moment: "bg-blue-400",
  chapter: "bg-emerald-400",
  letter: "bg-[#e4a0a0]",
};

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
    { label: "Add a moment", icon: ImageIcon, href: "/moments/new" },
    { label: "Write a chapter", icon: BookOpen, href: "/chapters/new" },
    { label: "Write a letter", icon: Mail, href: "/letters/new" },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        className="relative mb-10 flex items-center gap-5"
      >
        <div className="shrink-0">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2a2a2a]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#e4a0a0]/20 flex items-center justify-center text-lg text-[#e4a0a0] font-medium">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
        </div>
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

          {/* ── Stats: TiltCard + AnimatedCounter ── */}
          <div className="grid grid-cols-3 gap-3">
            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 28, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.08 + i * 0.08, type: "spring", stiffness: 90, damping: 14 }}
                >
                  <TiltCard className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/30 transition-colors">
                    <Link href={c.href} className="block p-4">
                      <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4 h-4 ${c.color}`} />
                      </div>
                      <p className="text-2xl font-light text-[#f5f5f5] tabular-nums">
                        <AnimatedCounter to={c.count} />
                      </p>
                      <p className="text-xs text-[#888] mt-0.5">{c.label}</p>
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>

          {/* ── Quick Add: magnetic spring buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, type: "spring", stiffness: 80, damping: 14 }}
          >
            <h2 className="text-sm font-medium text-[#555] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e4a0a0]" />
              Quick add
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickAdd.map((q, i) => {
                return (
                  <motion.div
                    key={q.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, type: "spring", stiffness: 100, damping: 16 }}
                  >
                    <MagneticZone>
                      <Link
                        href={q.href}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/40 hover:bg-[#1a1a1a] transition-colors text-sm text-[#888] hover:text-[#f5f5f5] group"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#e4a0a0] shrink-0 transition-all duration-200 group-hover:rotate-12 group-hover:scale-110" />
                        {q.label}
                      </Link>
                    </MagneticZone>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Recent memories: staggered spring slide-in from right ── */}
          {!loading && stats?.recentItems && stats.recentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, type: "spring", stiffness: 80, damping: 14 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#555]">Recent memories</h2>
                <Link href="/moments" className="text-xs text-[#e4a0a0] flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {stats.recentItems.map((item, idx) => (
                  <motion.div
                    key={item.contentId}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ delay: 0.5 + idx * 0.06, type: "spring", stiffness: 100, damping: 18 }}
                  >
                    <Link
                      href={`/memory/${item.contentId}`}
                      className="relative flex items-center gap-3 pl-5 pr-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:border-[#e4a0a0]/20 hover:bg-[#181818] transition-colors overflow-hidden"
                    >
                      {/* Colored type accent bar */}
                      <div className={`absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full ${TYPE_ACCENT[item.type] ?? "bg-[#555]"}`} />
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#f5f5f5] truncate">{item.title}</p>
                        <p className="text-xs text-[#555] capitalize">{item.type}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#555] shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && stats?.moments === 0 && stats.chapters === 0 && stats.letters === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-dashed border-[#2a2a2a] p-8 text-center"
            >
              <p className="text-[#888] text-sm mb-2">Your memory lane is empty</p>
              <p className="text-xs text-[#555]">Start by adding a moment, writing a chapter, or leaving a letter.</p>
            </motion.div>
          )}
        </div>

        {/* ── Sidebar — slides in from right ── */}
        <div className="space-y-4">
          {tenant?.startDate && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, type: "spring", stiffness: 80, damping: 14 }}
            >
              <CountdownTimer startDate={tenant.startDate} label="together since" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.46, type: "spring", stiffness: 80, damping: 14 }}
          >
            <MagneticZone strength={0.25}>
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4">
                <h3 className="text-xs font-medium text-[#888] mb-3">Private space</h3>
                <Link
                  href="/only-us"
                  className="block w-full text-center px-4 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-[#f5f5f5] hover:border-[#e4a0a0]/30 hover:bg-[#1c1c1c] transition-colors"
                >
                  Only Us →
                </Link>
              </div>
            </MagneticZone>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
