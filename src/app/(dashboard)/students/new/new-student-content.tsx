// src/app/(dashboard)/students/new/new-student-content.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui";

export function NewStudentContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/students")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Student</h1>
          <p className="text-sm text-slate-500">Fill in the details to register a new student</p>
        </div>
      </div>

      <StudentForm />
    </div>
  );
}
