"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  ImageIcon,
  BookOpen,
  Mail,
  Users,
  Settings,
  Heart,
  Lock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Star,
  Sparkles,
  UserCircle2,
  Check,
} from "lucide-react";
import type { GroupType, UserGroup } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/moments", label: "Moments", icon: ImageIcon },
  { href: "/chapters", label: "Chapters", icon: BookOpen },
  { href: "/letters", label: "Letters", icon: Mail },
  { href: "/only-us", label: "Only Us", icon: Lock },
  { href: "/invitations", label: "Invitations", icon: Users, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

const GROUP_META: Record<GroupType, { label: string; Icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  lover:   { label: "Lover",   Icon: Heart,        color: "text-[#e4a0a0]", bg: "bg-[#e4a0a0]/10" },
  family:  { label: "Family",  Icon: UserCircle2,  color: "text-[#f0a070]", bg: "bg-[#f0a070]/10" },
  friends: { label: "Friends", Icon: Star,         color: "text-[#70b8e0]", bg: "bg-[#70b8e0]/10" },
  custom:  { label: "Custom",  Icon: Sparkles,     color: "text-[#a0a0e4]", bg: "bg-[#a0a0e4]/10" },
};

function GroupSwitcher({ onClose }: { onClose?: () => void }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const groups: UserGroup[] = session?.user?.groups ?? [];
  const activeTenantId = session?.user?.tenantId;
  const activeGroup = groups.find((g) => g.tenantId === activeTenantId) ?? groups[0];

  async function switchGroup(group: UserGroup) {
    setOpen(false);
    await update({ tenantId: group.tenantId, userId: group.userId, role: group.role });
    // Use router.push instead of direct window location mutation
    router.push("/dashboard");
  }

  function handleNewGroup() {
    setOpen(false);
    onClose?.();
    router.push("/signup?new=1");
  }

  // No active group (first-time user or session predates multi-group) — show create prompt
  if (!activeGroup) {
    return (
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={handleNewGroup}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#141414] border border-dashed border-[#3a3a3a] hover:border-[#e4a0a0]/40 hover:bg-[#1c1c1c] transition-all"
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#2a2a2a]">
            <Plus className="w-3.5 h-3.5 text-[#888]" />
          </div>
          <span className="text-xs text-[#888]">Create a memory lane</span>
        </button>
      </div>
    );
  }

  const { Icon, color, bg } = GROUP_META[activeGroup.groupType] ?? GROUP_META.lover;

  return (
    <div className="px-3 pt-3 pb-2">
      {/* Active group trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] hover:border-[var(--accent-ring)] transition-all"
      >
        <div className={clsx("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", bg)}>
          <Icon className={clsx("w-3.5 h-3.5", color)} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium text-[#f5f5f5] truncate">{activeGroup.name || GROUP_META[activeGroup.groupType]?.label}</p>
          <p className={clsx("text-[10px] capitalize", color)}>{activeGroup.groupType}</p>
        </div>
        <ChevronDown className={clsx("w-3.5 h-3.5 text-[#888] shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-1 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] overflow-hidden"
          >
            {groups.map((g) => {
              const meta = GROUP_META[g.groupType] ?? GROUP_META.lover;
              const GIcon = meta.Icon;
              const isActive = g.tenantId === activeTenantId;
              return (
                <button
                  key={g.tenantId}
                  onClick={() => !isActive && switchGroup(g)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all",
                    isActive ? "bg-[#1c1c1c] cursor-default" : "hover:bg-[#1c1c1c] cursor-pointer"
                  )}
                >
                  <div className={clsx("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", meta.bg)}>
                    <GIcon className={clsx("w-3.5 h-3.5", meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#f5f5f5] truncate">{g.name || meta.label}</p>
                    <p className={clsx("text-[10px] capitalize", meta.color)}>{g.groupType}</p>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#888] shrink-0" />}
                </button>
              );
            })}
            <button
              onClick={handleNewGroup}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-t border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[#2a2a2a]">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs">New memory lane</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible shortcut when dropdown is closed */}
      {!open && (
        <button
          onClick={handleNewGroup}
          className="mt-1.5 w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555] hover:text-[#888] hover:bg-[#141414] transition-all"
        >
          <Plus className="w-3 h-3" />
          <span className="text-[11px]">New memory lane</span>
        </button>
      )}
    </div>
  );
}

interface SidebarContentProps {
  isMobile?: boolean;
  items: typeof navItems;
  pathname: string | null;
  session?: Session | null;
  onClose?: () => void;
}

function SidebarContent({ isMobile = false, items, pathname, session, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-0">
        <Link href="/dashboard" className="flex items-center gap-2 px-1 mb-1" onClick={() => onClose?.()}>
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted,rgba(228,160,160,0.1))] flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-[var(--accent,#e4a0a0)] fill-current" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#f5f5f5]">usly</span>
        </Link>
      </div>

      {/* Group Switcher */}
      <GroupSwitcher onClose={onClose} />

      <div className="mx-3 h-px bg-[#2a2a2a]" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-[var(--accent-muted,rgba(228,160,160,0.1))] text-[var(--accent,#e4a0a0)] font-medium"
                  : "text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--accent-muted,rgba(228,160,160,0.2))] flex items-center justify-center text-xs text-[var(--accent,#e4a0a0)] font-medium">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#f5f5f5] font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-[#888] capitalize">{session?.user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const items = navItems.filter(
    (item) => !item.adminOnly || session?.user?.role === "admin"
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#0d0d0d] border-r border-[#2a2a2a] flex-shrink-0">
        <SidebarContent items={items} pathname={pathname} session={session} onClose={() => setOpen(false)} />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#888]"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d0d] border-r border-[#2a2a2a] md:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#888] hover:text-[#f5f5f5]">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent isMobile items={items} pathname={pathname} session={session} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
