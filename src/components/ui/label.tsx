// src/components/ui/label.tsx
"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium text-[#EAEAF0]", className)}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-error-500">*</span>}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
