// src/lib/api-client.ts
// Client-side API helper for making authenticated requests

import { toast } from "sonner";

const API_BASE = "/api/v1";

interface FetchOptions extends RequestInit {
  showErrorToast?: boolean;
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { showErrorToast = true, ...fetchOptions } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message || "Something went wrong";
    if (showErrorToast) {
      toast.error(message);
    }
    throw new Error(message);
  }

  return json;
}

export const api = {
  get: <T>(endpoint: string, opts?: FetchOptions) =>
    request<T>(endpoint, { method: "GET", ...opts }),

  post: <T>(endpoint: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  put: <T>(endpoint: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  delete: <T>(endpoint: string, opts?: FetchOptions) =>
    request<T>(endpoint, { method: "DELETE", ...opts }),
};
