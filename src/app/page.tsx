// src/app/page.tsx
// Root page — redirects to dashboard or login
import { redirect } from "next/navigation";

export default function HomePage() {
  // In Phase 3, this will check auth and redirect accordingly
  redirect("/login");
}
