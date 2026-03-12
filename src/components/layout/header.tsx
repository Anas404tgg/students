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
        "sticky top-0 z-30 flex h-16 items-center border-b border-dark-border bg-dark-surface/80 px-4 backdrop-blur-md",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-68"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="mr-4 rounded-lg p-2 text-[#A0A0B0] hover:bg-dark-hover lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold tracking-tight text-[#EAEAF0]">
        <span className="text-gradient bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-transparent">Student</span>{" "}
        Management System
      </h1>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <button className="rounded-lg p-2 text-[#A0A0B0] hover:bg-dark-hover">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-[#A0A0B0] hover:bg-dark-hover">
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
