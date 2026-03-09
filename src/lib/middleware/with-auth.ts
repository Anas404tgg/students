// src/lib/middleware/with-auth.ts
// Authentication & RBAC middleware for API routes

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import type { SessionUser } from "@/types";

/**
 * Require authentication. Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; user: SessionUser }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    return handler(request, { params: context.params, user });
  };
}

/**
 * Require a specific role. Must be used after withAuth.
 */
export function withRole(
  role: string,
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; user: SessionUser }
  ) => Promise<NextResponse>
) {
  return withAuth(async (request, context: { params: Record<string, string>; user: SessionUser }) => {
    if (context.user.role !== role && context.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Insufficient permissions" },
        },
        { status: 403 }
      );
    }
    return handler(request, context);
  });
}
