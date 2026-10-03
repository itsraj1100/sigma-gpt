import { create } from "zustand";
import { authApi } from "../api/auth";
import { extractErrorMessage } from "../api/client";
import { User } from "../types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  init: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  init: async () => {
    set({ status: "loading" });
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  register: async (name, email, password) => {
    set({ status: "loading", error: null });
    try {
      const user = await authApi.register(name, email, password);
      set({ user, status: "authenticated" });
    } catch (err) {
      set({ status: "unauthenticated", error: extractErrorMessage(err) });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const user = await authApi.login(email, password);
      set({ user, status: "authenticated" });
    } catch (err) {
      set({ status: "unauthenticated", error: extractErrorMessage(err) });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  },

  clearError: () => set({ error: null }),
}));
