// src/hooks/use-current-user.ts
"use client";

import { useSession } from "next-auth/react";

import type { SessionUser } from "@/types";

export function useCurrentUser(): {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data: session, status } = useSession();

  return {
    user: (session?.user as SessionUser) ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
