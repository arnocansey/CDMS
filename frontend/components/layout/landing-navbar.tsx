"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  /** Transparent over a photo hero; solid glass otherwise. */
  variant?: "default" | "hero";
}

export function LandingNavbar({ variant = "default" }: LandingNavbarProps) {
  const { isAuthenticated } = useAuth();
  const isHero = variant === "hero";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isHero
          ? "border-white/10 bg-slate-950/35 text-white"
          : "bg-background/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{branding.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className={cn(
              "text-sm font-medium transition-colors",
              isHero
                ? "text-white/75 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={cn(
              "text-sm font-medium transition-colors",
              isHero
                ? "text-white/75 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className={cn(
              "text-sm font-medium transition-colors",
              isHero
                ? "text-white/75 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Testimonials
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={isHero ? "text-white hover:bg-white/10 hover:text-white" : undefined}
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
