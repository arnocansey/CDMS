"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
