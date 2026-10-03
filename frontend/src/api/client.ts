import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

/**
 * Shared Axios instance. `withCredentials` is required because auth is
 * stored in an httpOnly cookie set by the backend - the browser needs
 * permission to send it on cross-origin requests during local dev
 * (frontend on :5173, backend on :4000).
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Extracts a user-friendly message from any Axios/API error shape. */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (err.message === "Network Error") {
      return "Can't reach the server. Check your connection and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
