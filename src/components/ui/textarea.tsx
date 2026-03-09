// src/components/ui/textarea.tsx
"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-error-600 dark:text-error-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
