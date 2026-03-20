import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Client-side axios instance — attaches session JWT as bearer token
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  // In browser context, get the session and pass the JWT
  if (typeof window !== "undefined") {
    const session = await getSession();
    if (session) {
      // We pass tenantId and role as headers for the backend to validate
      config.headers["x-tenant-id"] = session.user.tenantId;
      config.headers["x-user-id"] = session.user.id;
      config.headers["x-user-role"] = session.user.role;
      config.headers["x-user-email"] = session.user.email;
    }
  }
  return config;
});

// Auto sign-out on 401 — session is stale or missing tenantId, force re-login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default api;
