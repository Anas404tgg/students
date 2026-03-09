// src/middleware.ts
// Next.js Edge Middleware — protects routes that require authentication
// Runs on the Edge runtime before page/api rendering

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/students", "/settings", "/profile", "/audit-logs", "/users"];

// Routes that should redirect to dashboard if already logged in
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (
    !isAuthenticated &&
    protectedPaths.some((p) => pathname.startsWith(p))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected and auth paths, exclude static files and API
    "/dashboard/:path*",
    "/students/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/audit-logs/:path*",
    "/users/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
