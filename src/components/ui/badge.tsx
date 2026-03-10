// src/components/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-500/15 text-brand-400",
        success: "bg-green-500/15 text-green-400",
        warning: "bg-amber-500/15 text-amber-400",
        error: "bg-red-500/15 text-red-400",
        secondary: "bg-dark-hover text-[#A0A0B0]",
        outline: "border border-dark-border text-[#A0A0B0]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
