// src/app/(dashboard)/audit-logs/audit-logs-content.tsx
"use client";

import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Select,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { AUDIT_ACTIONS } from "@/lib/constants";
import type { AuditLogEntry, PaginatedResponse } from "@/types";

const ACTION_COLORS: Record<string, "success" | "error" | "warning" | "secondary" | "default"> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "error",
  RESTORE: "warning",
  HARD_DELETE: "error",
  EXPORT: "secondary",
  IMPORT: "secondary",
  LOGIN: "default",
};

export function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0, hasMore: false });
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async (p: number, action: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (action) params.set("action", action);
      const res = await api.get<PaginatedResponse<AuditLogEntry>>(
        `/audit-logs?${params.toString()}`
      );
      setLogs(res.data);
      setMeta({ total: res.meta.total, totalPages: res.meta.totalPages, hasMore: res.meta.hasMore });
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, actionFilter);
  }, [page, actionFilter, fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">{meta.total} total entries</p>
        </div>
        <Select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        >
          <option value="">All Actions</option>
          {Object.values(AUDIT_ACTIONS).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<FileText className="h-10 w-10 text-slate-400" />}
                title="No audit logs found"
                description={actionFilter ? "Try changing the filter" : "No activity recorded yet"}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={ACTION_COLORS[log.action] || "secondary"}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700 dark:text-slate-300">{log.entity}</span>
                      {log.entityId && (
                        <span className="ml-1 text-xs text-slate-400">
                          #{log.entityId.slice(0, 8)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">{log.userName || "System"}</TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
