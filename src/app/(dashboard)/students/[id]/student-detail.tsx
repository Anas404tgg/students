// src/app/(dashboard)/students/[id]/student-detail.tsx
"use client";

import type { Student } from "@prisma/client";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StudentForm } from "@/components/students/student-form";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { api } from "@/lib/api-client";

interface Props {
  id: string;
}

export function StudentDetail({ id }: Props) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api
      .get<{ data: Student }>(`/students/${id}`)
      .then((res) => setStudent(res.data))
      .catch(() => router.push("/students"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDelete() {
    if (!student) return;
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted");
      router.push("/students");
    } catch {
      // handled by api client
    }
  }

  async function handleRestore() {
    try {
      const res = await api.post<{ data: Student }>(`/students/${id}/restore`);
      setStudent(res.data);
      toast.success("Student restored");
    } catch {
      // handled by api client
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/students")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#EAEAF0]">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-[#A0A0B0]">{student.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {student.isDeleted ? (
            <Button variant="outline" size="sm" onClick={handleRestore}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Restore
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <StudentForm
          student={student}
          onSuccess={(updated) => {
            setStudent(updated);
            setEditing(false);
            toast.success("Student updated");
          }}
        />
      ) : (
        <StudentInfo student={student} />
      )}
    </div>
  );
}

function StudentInfo({ student }: { student: Student }) {
  const STATUS_COLORS: Record<string, "success" | "error" | "warning" | "secondary"> = {
    ACTIVE: "success",
    GRADUATED: "secondary",
    SUSPENDED: "error",
    INACTIVE: "warning",
  };

  const fields: { label: string; value: React.ReactNode }[] = [
    {
      label: "Status",
      value: (
        <Badge variant={STATUS_COLORS[student.status] || "secondary"}>
          {student.status}
        </Badge>
      ),
    },
    { label: "Program", value: student.program || "—" },
    { label: "Year", value: student.year ?? "—" },
    { label: "GPA", value: student.gpa != null ? Number(student.gpa).toFixed(2) : "—" },
    { label: "Gender", value: student.gender || "—" },
    { label: "Phone", value: student.phone || "—" },
    {
      label: "Date of Birth",
      value: student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : "—",
    },
    {
      label: "Enrollment Date",
      value: student.enrollmentDate
        ? new Date(student.enrollmentDate).toLocaleDateString()
        : "—",
    },
    {
      label: "Graduation Date",
      value: student.graduationDate
        ? new Date(student.graduationDate).toLocaleDateString()
        : "—",
    },
    {
      label: "Address",
      value:
        [student.address, student.city, student.state, student.zipCode, student.country]
          .filter(Boolean)
          .join(", ") || "—",
    },
    { label: "Notes", value: student.notes || "—" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Student Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm font-medium text-[#A0A0B0]">{field.label}</dt>
              <dd className="mt-1 text-sm text-[#EAEAF0]">{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
