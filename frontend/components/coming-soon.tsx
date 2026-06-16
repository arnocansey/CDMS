"use client";

import { CalendarClock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarClock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description || "This feature is coming soon. Stay tuned!"}
      </p>
    </div>
  );
}
