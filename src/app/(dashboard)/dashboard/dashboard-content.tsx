// src/app/(dashboard)/dashboard/dashboard-content.tsx
"use client";

import {
  GraduationCap,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { DashboardStats } from "@/types";

interface StatsCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DashboardStats }>("/students/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const cards: StatsCard[] = stats
    ? [
        {
          title: "Total Students",
          value: stats.totalStudents,
          description: "All registered students",
          icon: <Users className="h-5 w-5 text-brand-600" />,
        },
        {
          title: "Active Students",
          value: stats.activeStudents,
          description: `${stats.totalStudents ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% of total`,
          icon: <UserCheck className="h-5 w-5 text-success-600" />,
        },
        {
          title: "Graduated",
          value: stats.graduatedStudents,
          description: "Successfully completed",
          icon: <GraduationCap className="h-5 w-5 text-accent-600" />,
        },
        {
          title: "New This Month",
          value: stats.newThisMonth,
          description: "Enrolled this month",
          icon: <UserPlus className="h-5 w-5 text-brand-500" />,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of your student management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                {card.icon}
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Average GPA + Status Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Average GPA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              Average GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-brand-600">
              {stats?.averageGpa != null ? stats.averageGpa.toFixed(2) : "N/A"}
            </p>
            <p className="mt-1 text-sm text-slate-500">Across all active students</p>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats &&
                Object.entries(stats.statusDistribution).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <Badge
                      variant={
                        status === "ACTIVE"
                          ? "success"
                          : status === "GRADUATED"
                            ? "default"
                            : status === "SUSPENDED"
                              ? "error"
                              : "secondary"
                      }
                    >
                      {status}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Distribution */}
      {stats && stats.programDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.programDistribution.map((item) => {
                const pct = stats.totalStudents
                  ? Math.round((item.count / stats.totalStudents) * 100)
                  : 0;
                return (
                  <div key={item.program} className="flex items-center gap-4">
                    <span className="w-32 truncate text-sm text-slate-700 dark:text-slate-300">
                      {item.program || "Unassigned"}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
