// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-gradient text-8xl font-bold">404</h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
          Page not found
        </p>
        <p className="mt-2 text-slate-500 dark:text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
