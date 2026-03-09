// src/app/(dashboard)/students/students-content.tsx
"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Button,
  Input,
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
import { STUDENT_STATUS } from "@/lib/constants";
import { debounce } from "@/lib/utils";
import type { PaginatedResponse, StudentSummary } from "@/types";

const STATUS_COLORS: Record<string, "success" | "error" | "warning" | "secondary"> = {
  ACTIVE: "success",
  GRADUATED: "secondary",
  SUSPENDED: "error",
  INACTIVE: "warning",
};

export function StudentsContent() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0, hasMore: false });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchStudents = useCallback(
    async (p: number, q: string, status: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: "10" });
        if (q) params.set("search", q);
        if (status) params.set("status", status);

        const res = await api.get<PaginatedResponse<StudentSummary>>(
          `/students?${params.toString()}`
        );
        setStudents(res.data);
        setMeta({ total: res.meta.total, totalPages: res.meta.totalPages, hasMore: res.meta.hasMore });
      } catch {
        // error toast handled by api client
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setPage(1);
      fetchStudents(1, q, statusFilter);
    }, 400),
    [statusFilter, fetchStudents]
  );

  useEffect(() => {
    fetchStudents(page, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedSearch(value);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map((s) => s.id)));
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    try {
      await api.post("/students/bulk", { ids: Array.from(selected), action: "delete" });
      toast.success(`${selected.size} student(s) deleted`);
      setSelected(new Set());
      fetchStudents(page, search, statusFilter);
    } catch {
      // handled by api client
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/v1/students/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Failed to export students");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="mt-1 text-sm text-slate-500">{meta.total} total students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/students/new")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All Status</option>
          {Object.values(STUDENT_STATUS).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 dark:border-brand-800 dark:bg-brand-950">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            {selected.size} selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No students found"
                description={
                  search || statusFilter
                    ? "Try changing your search or filters"
                    : "Get started by adding your first student"
                }
                action={
                  !search && !statusFilter ? (
                    <Button onClick={() => router.push("/students/new")}>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add Student
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === students.length && students.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    onClick={() => router.push(`/students/${student.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(student.id)}
                        onChange={() => toggleSelect(student.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="text-slate-500">{student.email}</TableCell>
                    <TableCell>{student.program || "—"}</TableCell>
                    <TableCell>{student.gpa != null ? student.gpa.toFixed(2) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[student.status] || "secondary"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {student.enrollmentDate
                        ? new Date(student.enrollmentDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
