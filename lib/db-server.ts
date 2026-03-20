/**
 * Auth callbacks bridge — calls the FastAPI internal auth endpoints.
 * No AWS SDK, no DynamoDB credentials needed in the UI environment.
 * Only runs server-side (in auth.ts callbacks).
 */
import type { UserGroup, GroupType } from "@/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

async function internalFetch(path: string, init?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[auth] Internal API error ${res.status} at ${path}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[auth] Could not reach backend at ${API_URL}${path}:`, err);
    return null;
  }
}

// ── Lookup (signIn + jwt callbacks) ───────────────────────────────

/**
 * Returns { users, invitation } for the given email.
 * users      → all existing memberships (one per group), each has tenantId/role/groupType/name
 * invitation → invited first-timer, create user record then attach
 */
export async function lookupByEmail(email: string): Promise<{
  users: UserGroup[];
  invitation: Record<string, string> | null;
}> {
  const params = new URLSearchParams({ email });
  const data = await internalFetch(`/api/internal/auth/lookup?${params}`);
  if (!data) return { users: [], invitation: null };
  // Map raw DynamoDB records → UserGroup shape
  const users: UserGroup[] = (data.users ?? []).map((u: Record<string, string>) => ({
    tenantId: u.tenantId,
    userId: u.userId,
    role: (u.role ?? "member") as "admin" | "member",
    groupType: (u.groupType ?? "lover") as GroupType,
    name: u.tenantName ?? u.name ?? "",
  }));
  return { users, invitation: data.invitation ?? null };
}

// Compat alias — returns first user record (for invited first sign-in path)
export async function getUserByEmail(email: string) {
  const { users } = await lookupByEmail(email);
  return users.length > 0 ? users[0] : null;
}

export async function getTenantByEmail(email: string) {
  const { invitation } = await lookupByEmail(email);
  return invitation;
}

// ── Create user (jwt callback for invited first sign-in) ──────────

export async function createUser({
  email,
  name,
  tenantId,
  role,
}: {
  email: string;
  name: string;
  tenantId: string;
  role: "admin" | "member";
}) {
  return internalFetch("/api/internal/auth/users", {
    method: "POST",
    body: JSON.stringify({ email, name, tenantId, role }),
  });
}

// ── Accept invitation ─────────────────────────────────────────────

export async function acceptInvitation(inviteId: string) {
  await internalFetch("/api/internal/auth/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ inviteId }),
  });
}

// ── Stubs kept for import compatibility (unused at runtime) ───────

export async function getInvitationByEmailAndTenant(_email: string, _tenantId: string) {
  return null;
}

export async function getTenant(_tenantId: string) {
  return null;
}

export async function createTenant(_opts: { name: string; startDate?: string }) {
  return null;
}
