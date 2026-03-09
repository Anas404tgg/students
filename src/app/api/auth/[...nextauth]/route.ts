// src/app/api/auth/[...nextauth]/route.ts
// NextAuth.js catch-all route handler

import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
