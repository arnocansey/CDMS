"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Church } from "lucide-react";

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{branding.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
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
              <Button asChild variant="ghost" size="sm">
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
