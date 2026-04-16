"use client";

/**
 * Client-side auth helpers.
 * JWT is issued by FastAPI (/auth/google → /auth/callback/google) and stored
 * in localStorage.  No server-side code — compatible with output: "export".
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UserGroup } from "@/types";

const TOKEN_KEY = "usly_token";
const ACTIVE_TENANT_KEY = "usly_active_tenant";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  tenantId: string;
  role: "admin" | "member";
  groups: UserGroup[];
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    return JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  return !!exp && Date.now() / 1000 > exp;
}

// ── Raw token helpers (safe to call server-side — they guard on typeof window) ─

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACTIVE_TENANT_KEY);
}

export function getAuthUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || isExpired(payload)) {
    clearAuth();
    return null;
  }

  const groups = (payload.groups as UserGroup[]) ?? [];
  const storedTenantId = localStorage.getItem(ACTIVE_TENANT_KEY);
  const activeTenantId = storedTenantId || (payload.tenantId as string) || groups[0]?.tenantId || "";
  const activeGroup = groups.find((g) => g.tenantId === activeTenantId) ?? groups[0];

  return {
    id: (payload.userId as string) ?? "",
    email: (payload.email as string) ?? null,
    name: (payload.name as string) ?? null,
    image: (payload.picture as string) ?? null,
    tenantId: activeGroup?.tenantId ?? "",
    role: ((activeGroup?.role ?? "member") as "admin" | "member"),
    groups,
  };
}

export function setActiveTenant(tenantId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useAuth() {
  // Initializer reads localStorage synchronously on the client.
  // On the server (SSR/build) typeof window is undefined, so starts as null.
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getAuthUser();
  });
  // localStorage is synchronous — there is no async loading phase.
  const isLoading = false;
  const router = useRouter();

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [router]);

  const switchGroup = useCallback((group: UserGroup) => {
    setActiveTenant(group.tenantId);
    setUser(getAuthUser());
  }, []);

  /** Re-fetch a fresh JWT from FastAPI after mutations (e.g. creating a new group). */
  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_URL}/auth/refresh`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { token: newToken } = await res.json();
        setToken(newToken);
        setUser(getAuthUser());
      }
    } catch {
      // non-fatal — user keeps current JWT
    }
  }, []);

  return { user, isLoading, logout, switchGroup, refresh };
}
