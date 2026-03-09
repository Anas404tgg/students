// src/app/(dashboard)/users/page.tsx
import type { Metadata } from "next";

import { UsersContent } from "./users-content";

export const metadata: Metadata = { title: "User Management" };

export default function UsersPage() {
  return <UsersContent />;
}
