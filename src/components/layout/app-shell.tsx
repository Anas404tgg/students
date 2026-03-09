// src/components/layout/app-shell.tsx
"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, overlay on mobile */}
      <div className={cn("hidden lg:block")}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      {mobileOpen && (
        <div className="lg:hidden">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <Header
          sidebarCollapsed={collapsed}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          title={title}
        />
        <main id="main-content" className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
