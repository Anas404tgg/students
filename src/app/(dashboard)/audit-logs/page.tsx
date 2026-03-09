// src/app/(dashboard)/audit-logs/page.tsx
import type { Metadata } from "next";

import { AuditLogsContent } from "./audit-logs-content";

export const metadata: Metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  return <AuditLogsContent />;
}
