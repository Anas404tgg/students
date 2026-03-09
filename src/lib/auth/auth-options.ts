// src/lib/auth/auth-options.ts
// NextAuth.js configuration — Credentials provider + session callbacks

import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/auth/password";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export const authOptions: NextAuthOptions = {
  // ─── Session strategy ────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ─── Pages ───────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ─── Providers ───────────────────────────────────────────
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              avatar: true,
              isActive: true,
            },
          });

          if (!user || !user.isActive) {
            return null;
          }

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            return null;
          }

          // Update last login timestamp (fire-and-forget)
          prisma.user
            .update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
            .catch((err) =>
              logger.error("Failed to update lastLoginAt", {
                userId: user.id,
                error: String(err),
              })
            );

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          } as NextAuthUser & { role: string; avatar: string | null };
        } catch (error) {
          logger.error("authorize error", { error: String(error) });
          return null;
        }
      },
    }),
  ],

  // ─── Callbacks ───────────────────────────────────────────
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser & { role?: string; avatar?: string | null } }) {
      // First sign-in: copy user fields into the JWT
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
        token.avatar = user.avatar ?? null;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id as string;
        (session.user as Record<string, unknown>).role = token.role as string;
        (session.user as Record<string, unknown>).avatar = token.avatar as string | null;
      }
      return session;
    },
  },

  // ─── Events ──────────────────────────────────────────────
  events: {
    async signIn({ user }) {
      logger.info("User signed in", { userId: user.id });
    },
    async signOut({ token }) {
      logger.info("User signed out", { userId: token.sub });
    },
  },

  // Security
  secret: process.env.NEXTAUTH_SECRET,
};
