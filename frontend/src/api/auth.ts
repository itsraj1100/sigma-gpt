import { apiClient } from "./client";
import { User } from "../types";

export const authApi = {
  async register(name: string, email: string, password: string) {
    const res = await apiClient.post<{ data: { user: User } }>("/auth/register", {
      name,
      email,
      password,
    });
    return res.data.data.user;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post<{ data: { user: User } }>("/auth/login", {
      email,
      password,
    });
    return res.data.data.user;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async me() {
    const res = await apiClient.get<{ data: { user: User } }>("/auth/me");
    return res.data.data.user;
  },
};
