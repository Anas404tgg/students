// src/app/(dashboard)/students/new/page.tsx
import type { Metadata } from "next";

import { NewStudentContent } from "./new-student-content";

export const metadata: Metadata = { title: "Add Student" };

export default function NewStudentPage() {
  return <NewStudentContent />;
}
