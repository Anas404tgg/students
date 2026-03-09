// src/app/(dashboard)/users/users-content.tsx
"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Button,
  Badge,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  Avatar,
} from "@/components/ui";
import { api } from "@/lib/api-client";

interface UserEntry {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
}

export function UsersContent() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: UserEntry[] }>("/users")
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(userId: string) {
    try {
      const res = await api.post<{ data: UserEntry }>(`/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: res.data.isActive } : u))
      );
      toast.success(`User ${res.data.isActive ? "activated" : "deactivated"}`);
    } catch {
      // handled by api client
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">Manage system users and their access</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name || user.email} src={user.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.name || "Unnamed"}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "error"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(user.id)}
                      >
                        {user.isActive ? (
                          <>
                            <ShieldOff className="mr-1 h-3.5 w-3.5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
