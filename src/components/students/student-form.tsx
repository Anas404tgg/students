// src/components/students/student-form.tsx
"use client";

import type { Student } from "@prisma/client";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { api } from "@/lib/api-client";
import { GENDER_OPTIONS, STUDENT_STATUS } from "@/lib/constants";

interface Props {
  student?: Student;
  onSuccess?: (student: Student) => void;
}

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export function StudentForm({ student, onSuccess }: Props) {
  const router = useRouter();
  const isEdit = !!student;

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    gender: student?.gender ?? "",
    dateOfBirth: toDateInput(student?.dateOfBirth),
    address: student?.address ?? "",
    city: student?.city ?? "",
    state: student?.state ?? "",
    zipCode: student?.zipCode ?? "",
    country: student?.country ?? "",
    program: student?.program ?? "",
    year: student?.year != null ? String(student.year) : "",
    gpa: student?.gpa != null ? String(student.gpa) : "",
    status: student?.status ?? "ACTIVE",
    enrollmentDate: toDateInput(student?.enrollmentDate),
    graduationDate: toDateInput(student?.graduationDate),
    notes: student?.notes ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    // Build payload — convert empty strings to null, numbers from strings
    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      status: form.status,
      phone: form.phone || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zipCode: form.zipCode || null,
      country: form.country || null,
      program: form.program || null,
      year: form.year ? Number(form.year) : null,
      gpa: form.gpa ? Number(form.gpa) : null,
      enrollmentDate: form.enrollmentDate || undefined,
      graduationDate: form.graduationDate || null,
      notes: form.notes || null,
    };

    if (isEdit) {
      payload.version = student.version;
    }

    try {
      if (isEdit) {
        const res = await api.put<{ data: Student }>(`/students/${student.id}`, payload);
        onSuccess?.(res.data);
      } else {
        const res = await api.post<{ data: Student }>("/students", payload);
        toast.success("Student created");
        router.push(`/students/${res.data.id}`);
      }
    } catch (err: unknown) {
      // Try to extract validation errors
      if (err instanceof Error && err.message) {
        setErrors({ _form: err.message });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._form && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {errors._form}
        </div>
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" required>
              First Name
            </Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              error={errors.firstName}
            />
          </div>
          <div>
            <Label htmlFor="lastName" required>
              Last Name
            </Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              error={errors.lastName}
            />
          </div>
          <div>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              id="gender"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Select...</option>
              {Object.entries(GENDER_OPTIONS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              value={form.zipCode}
              onChange={(e) => update("zipCode", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              min="1"
              max="8"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gpa">GPA</Label>
            <Input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={form.gpa}
              onChange={(e) => update("gpa", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status" required>
              Status
            </Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              {Object.entries(STUDENT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="enrollmentDate">Enrollment Date</Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={form.enrollmentDate}
              onChange={(e) => update("enrollmentDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="graduationDate">Graduation Date</Label>
            <Input
              id="graduationDate"
              type="date"
              value={form.graduationDate}
              onChange={(e) => update("graduationDate", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          {isEdit ? "Update Student" : "Create Student"}
        </Button>
      </div>
    </form>
  );
}
