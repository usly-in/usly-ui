"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth-client";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

    if (token) {
      setToken(token);
    }
    router.replace(callbackUrl);
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
      <p className="text-[#888] text-sm">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
