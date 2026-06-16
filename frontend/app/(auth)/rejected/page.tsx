"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { XCircle } from "lucide-react";

export default function RejectedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Not Approved</h1>
          <p className="mt-2 text-muted-foreground">
            Your registration was not approved. Please contact your church
            administrator for more information.
          </p>
        </div>
        <Button onClick={() => router.push("/register")} className="w-full">
          Try Registering Again
        </Button>
      </div>
    </div>
  );
}
