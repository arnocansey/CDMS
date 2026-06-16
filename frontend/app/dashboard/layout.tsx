"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RoleGuard } from "@/components/auth/role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.accountStatus === "PENDING") {
      router.push("/pending-approval");
    } else if (user?.accountStatus === "REJECTED") {
      router.push("/rejected");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.accountStatus === "PENDING" || user?.accountStatus === "REJECTED") {
    return null;
  }

  return (
    <RoleGuard>
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 glass-subtle">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
