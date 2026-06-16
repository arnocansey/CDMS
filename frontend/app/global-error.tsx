"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-7xl font-bold tracking-tighter text-destructive">500</h1>
              <h2 className="text-2xl font-semibold tracking-tight">Something Went Wrong</h2>
              <p className="mx-auto max-w-md text-muted-foreground">
                {error.message || "An unexpected error occurred. Please try again."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={reset}>
                Try Again
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
