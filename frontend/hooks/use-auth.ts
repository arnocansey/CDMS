"use client";

import { create } from "zustand";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  accountStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  churchId?: number;
}

function clearLegacyTokens() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function storeFallbackTokens(accessToken?: string, refreshToken?: string) {
  if (typeof window === "undefined" || !accessToken) return;
  // Short-lived sessionStorage fallback; primary auth is httpOnly cookies
  sessionStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    sessionStorage.setItem("refreshToken", refreshToken);
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Migrate any legacy localStorage tokens into sessionStorage once
      if (typeof window !== "undefined") {
        const legacyAccess = localStorage.getItem("accessToken");
        const legacyRefresh = localStorage.getItem("refreshToken");
        if (legacyAccess) {
          sessionStorage.setItem("accessToken", legacyAccess);
          localStorage.removeItem("accessToken");
        }
        if (legacyRefresh) {
          sessionStorage.setItem("refreshToken", legacyRefresh);
          localStorage.removeItem("refreshToken");
        }
      }

      const response = await api.get("/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      clearLegacyTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;
    storeFallbackTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    const { accessToken, refreshToken, user } = response.data;
    storeFallbackTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearLegacyTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.success("Logged out successfully");
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
