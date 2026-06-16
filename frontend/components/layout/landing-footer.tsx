import Link from "next/link";
import { branding } from "@/lib/branding";
import { Church } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Church className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">{branding.shortName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A comprehensive church management platform for modern congregations.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
              <li><a href="#testimonials" className="hover:text-foreground">Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span>Privacy Policy</span></li>
              <li><span>Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {branding.churchName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
