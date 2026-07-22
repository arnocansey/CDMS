export function QueryError({
  message = "Failed to load data. Please try again.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
