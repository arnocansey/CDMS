import { cn } from "@/lib/utils";

type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

const toneClasses: Record<StatusTone, string> = {
  success:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  warning:
    "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  danger:
    "bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-red-300",
  info: "bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
};

const statusToneMap: Record<string, StatusTone> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  answered: "success",
  closed: "neutral",
  in_progress: "info",
  published: "success",
  draft: "neutral",
  completed: "success",
  overdue: "danger",
  cancelled: "danger",
  canceled: "danger",
  failed: "danger",
  paused: "warning",
  income: "success",
  expense: "danger",
  create: "success",
  update: "warning",
  delete: "danger",
  first_time: "info",
  returning: "warning",
  regular: "success",
  member_convert: "primary",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
  const resolvedTone = tone ?? statusToneMap[normalized] ?? "neutral";
  const display =
    label ??
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        toneClasses[resolvedTone],
        className
      )}
    >
      {display}
    </span>
  );
}
