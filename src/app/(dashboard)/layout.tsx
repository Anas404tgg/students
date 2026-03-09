// src/app/(dashboard)/layout.tsx
// Protected layout with sidebar + header — wraps all authenticated pages
"use client";

import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
