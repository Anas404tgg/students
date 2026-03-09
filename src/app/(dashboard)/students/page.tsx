// src/app/(dashboard)/students/page.tsx
import type { Metadata } from "next";

import { StudentsContent } from "./students-content";

export const metadata: Metadata = { title: "Students" };

export default function StudentsPage() {
  return <StudentsContent />;
}
