// src/components/layout/header.tsx
"use client";

import { Bell, Menu, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  title?: string;
}

export function Header({ sidebarCollapsed, onMenuClick, title }: HeaderProps) {
  const { user } = useCurrentUser();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-68"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
      )}

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>

        {/* User avatar */}
        {user && (
          <Avatar
            name={user.name ?? user.email}
            src={user.avatar}
            size="sm"
            className="ml-2"
          />
        )}
      </div>
    </header>
  );
}
