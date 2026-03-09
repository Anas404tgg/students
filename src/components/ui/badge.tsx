// src/components/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
        success: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500",
        warning: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-500",
        error: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-500",
        secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
