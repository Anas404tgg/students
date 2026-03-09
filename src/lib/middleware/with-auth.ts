// src/lib/middleware/with-auth.ts
// Authentication & RBAC middleware for API routes
// Full implementation depends on Phase 3 (NextAuth),
// but the middleware shape is defined here for use in routes.

import { type NextRequest, NextResponse } from "next/server";

import type { SessionUser } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthOptions = any;

async function getAuthOptions(): Promise<AuthOptions | null> {
  try {
    // Dynamic import — replaced with full implementation in Phase 3
    const mod = await import("@/lib/auth/auth-options");
    return mod.authOptions;
  } catch {
    return null;
  }
}

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
    const authOptions = await getAuthOptions();

    if (!authOptions) {
      // Auth not yet configured — allow through in dev with a mock user
      if (process.env.NODE_ENV === "development") {
        const devUser: SessionUser = {
          id: "dev-user",
          email: "admin@sms.dev",
          name: "Dev Admin",
          role: "ADMIN",
          avatar: null,
        };
        return handler(request, { params: context.params, user: devUser });
      }
      return NextResponse.json(
        { success: false, error: { code: "AUTH_NOT_CONFIGURED", message: "Authentication not configured" } },
        { status: 500 }
      );
    }

    const { getServerSession } = await import("next-auth");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(authOptions);

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
