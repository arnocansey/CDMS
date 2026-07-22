import { cn } from "@/lib/utils";

interface PageSpinnerProps {
  className?: string;
  label?: string;
}

export function PageSpinner({ className, label = "Loading…" }: PageSpinnerProps) {
  return (
    <div
      className={cn("flex h-full min-h-[12rem] flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-label={label}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
