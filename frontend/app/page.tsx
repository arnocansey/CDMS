"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  Heart,
  BarChart3,
  Building2,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description:
      "Track member profiles, contact information, families, and engagement history in one place.",
  },
  {
    icon: Calendar,
    title: "Events & Scheduling",
    description:
      "Create, manage, and promote church events with RSVP tracking and automated reminders.",
  },
  {
    icon: DollarSign,
    title: "Financial Tracking",
    description:
      "Record donations, manage tithes, track expenses, and generate financial reports with ease.",
  },
  {
    icon: Heart,
    title: "Prayer Requests",
    description:
      "Submit and manage prayer requests, track answers, and build a culture of prayer together.",
  },
  {
    icon: BarChart3,
    title: "Attendance Analytics",
    description:
      "Monitor attendance trends, track growth, and get insights to shepherd your congregation better.",
  },
  {
    icon: Building2,
    title: "Department Management",
    description:
      "Organize departments, assign leaders, manage budgets, and coordinate ministry activities.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create Your Account",
    description:
      "Sign up in seconds. Administrators can invite members and set up roles.",
  },
  {
    number: "2",
    title: "Import Your Data",
    description:
      "Add members, events, and financial records. We make migration simple.",
  },
  {
    number: "3",
    title: "Grow Together",
    description:
      "Use insights and tools to strengthen your community and streamline operations.",
  },
];

const testimonials = [
  {
    quote:
      "CDMS has transformed how we manage our congregation. Everything is organized and accessible.",
    name: "Pastor James Mitchell",
    role: "Senior Pastor, Grace Community Church",
  },
  {
    quote:
      "The financial reporting alone saves us hours every month. Highly recommend for any church.",
    name: "Sarah Thompson",
    role: "Church Administrator",
  },
  {
    quote:
      "Our members love the prayer request feature. It keeps our community connected and caring.",
    name: "Deacon Robert Williams",
    role: "Ministry Leader, New Hope Fellowship",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 flex flex-col items-center gap-5">
                <Image
                  src="/logo.png"
                  alt={`${branding.shortName} logo`}
                  width={88}
                  height={88}
                  className="object-contain"
                  priority
                />
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  {branding.shortName}
                </h1>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {branding.tagline}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="px-8">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="px-8">
                      <Link href="/register">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="px-8">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything Your Church Needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools designed specifically for church administration
                and community building.
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Up and Running in Minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple onboarding so you can focus on what matters most.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Churches Everywhere
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what church leaders are saying about CDMS.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Church?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join churches already using CDMS to strengthen their communities.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="px-8">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="px-8">
                      <Link href="/register">
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      No credit card required
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
