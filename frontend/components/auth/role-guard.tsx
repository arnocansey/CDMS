"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const routeRoles: Record<string, string[]> = {
  "/dashboard": ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "DEPARTMENT_LEADER", "MEMBER"],
  "/dashboard/members": ["ADMIN", "PASTOR", "SECRETARY"],
  "/dashboard/attendance": ["ADMIN", "PASTOR", "SECRETARY"],
  "/dashboard/finance": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/funds": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/budget": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/pledges": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/goals": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/cash-flow": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/receipts": ["ADMIN", "TREASURER"],
  "/dashboard/analytics": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/reports": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/forecasts": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/health": ["ADMIN", "PASTOR"],
  "/dashboard/users": ["ADMIN"],
  "/dashboard/approvals": ["ADMIN", "PASTOR"],
  "/dashboard/audit": ["ADMIN"],
  "/dashboard/notifications": ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "DEPARTMENT_LEADER", "MEMBER"],
  "/dashboard/subscription": ["ADMIN"],
  "/dashboard/admin": ["PLATFORM_ADMIN"],
  "/dashboard/recurring-donations": ["ADMIN", "TREASURER"],
  "/dashboard/recurring-expenses": ["ADMIN", "TREASURER"],
  "/dashboard/pledge-payments": ["ADMIN", "TREASURER"],
  "/dashboard/expense-approvals": ["ADMIN", "TREASURER", "PASTOR"],
  "/dashboard/bank-reconciliation": ["ADMIN", "TREASURER"],
  "/dashboard/settings": ["ADMIN"],
  "/dashboard/permissions": ["ADMIN"],
  "/dashboard/data-export": ["ADMIN", "TREASURER", "PASTOR"],
  "/dashboard/donor-retention": ["ADMIN", "PASTOR", "TREASURER"],
  "/dashboard/giving-patterns": ["ADMIN", "TREASURER"],
  "/dashboard/budget-forecasting": ["ADMIN", "TREASURER"],
  "/dashboard/calendar": ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "MEMBER"],
  "/dashboard/directory": ["ADMIN", "PASTOR", "MEMBER"],
  "/dashboard/church-comparison": ["PLATFORM_ADMIN"],
  "/dashboard/visitors": ["ADMIN", "PASTOR", "SECRETARY"],
  "/dashboard/church-transfer": ["ADMIN", "PASTOR"],
  "/dashboard/import": ["ADMIN"],
  "/dashboard/api-keys": ["ADMIN"],
  "/dashboard/branding": ["ADMIN"],
  "/dashboard/2fa": ["ADMIN", "PASTOR", "TREASURER", "SECRETARY", "MEMBER"],
};

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const allowedRoles = routeRoles[pathname];
    if (!allowedRoles) return;

    const userRoles = user?.roles ?? [];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      toast.error("You don't have permission to access this page.");
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const allowedRoles = routeRoles[pathname];
  if (allowedRoles) {
    const userRoles = user?.roles ?? [];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) return null;
  }

  return <>{children}</>;
}
