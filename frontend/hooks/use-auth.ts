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

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await api.get("/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.success("Logged out successfully");
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
