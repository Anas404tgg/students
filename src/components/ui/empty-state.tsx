// src/components/ui/empty-state.tsx
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-[#6B6B80]">{icon}</div>}
      <h3 className="text-lg font-medium text-[#EAEAF0]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[#A0A0B0]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
