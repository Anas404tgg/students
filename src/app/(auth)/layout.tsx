// src/app/(auth)/layout.tsx
// Auth pages layout — centered card with branding

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
