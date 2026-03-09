// src/components/ui/select.tsx
"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          className={cn(
            "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="mt-1 text-xs text-error-600 dark:text-error-500">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
