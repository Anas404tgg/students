// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Student Management System",
    template: "%s | SMS",
  },
  description:
    "A modern, production-ready student management system built with Next.js, Prisma, and TypeScript.",
  keywords: ["student management", "education", "admin", "next.js"],
  authors: [{ name: "SMS Team" }],
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: false, // Internal app — no indexing
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121212",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-dark font-sans antialiased">
        <SessionProvider>
          {/* Skip to main content — accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
