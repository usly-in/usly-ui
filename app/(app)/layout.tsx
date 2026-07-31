"use client";

import { useAuth } from "@/lib/auth-client";
import { Sidebar } from "@/components/Sidebar";
import type { GroupType } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const activeGroup = user?.groups?.find((g) => g.tenantId === user.tenantId);
  const theme: GroupType = activeGroup?.groupType ?? "lover";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0b]" data-theme={theme}>
      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
