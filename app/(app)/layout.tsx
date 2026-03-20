"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/Sidebar";
import type { GroupType } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const activeGroup = session?.user?.groups?.find(
    (g) => g.tenantId === session.user.tenantId
  );
  const theme: GroupType = activeGroup?.groupType ?? "lover";

  return (
    <div className="flex min-h-screen bg-[#0b0b0b]" data-theme={theme}>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
