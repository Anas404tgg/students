// src/app/(dashboard)/students/[id]/page.tsx
import type { Metadata } from "next";

import { StudentDetail } from "./student-detail";

export const metadata: Metadata = { title: "Student Detail" };

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return <StudentDetail id={params.id} />;
}
