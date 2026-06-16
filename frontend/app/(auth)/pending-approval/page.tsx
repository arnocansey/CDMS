"use client";

import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church, Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Pending Approval</h1>
          <p className="mt-2 text-muted-foreground">
            Your account is awaiting approval from your church administrator.
            You&apos;ll receive a notification once approved.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          If you have questions, contact your church office.
        </p>
        <Button variant="outline" onClick={() => logout()} className="w-full">
          Log out
        </Button>
      </div>
    </div>
  );
}
