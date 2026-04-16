import axios from "axios";
import { getAuthUser, clearAuth } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Client-side axios instance — attaches auth headers from localStorage JWT
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const user = getAuthUser();
    if (user) {
      config.headers["x-tenant-id"] = user.tenantId;
      config.headers["x-user-id"] = user.id;
      config.headers["x-user-role"] = user.role;
      config.headers["x-user-email"] = user.email ?? "";
    }
  }
  return config;
});

// Auto-logout on 401 — token expired or missing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuth();
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      window.location.href = `${base}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;
