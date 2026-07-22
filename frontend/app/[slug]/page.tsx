"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Church,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Megaphone,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ChurchData {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
}

interface AnnouncementData {
  id: number;
  title: string;
  content: string;
  publishDate: string;
  createdAt: string;
}

interface PageData {
  church: ChurchData;
  memberCount: number;
  upcomingEvents: EventData[];
  announcements: AnnouncementData[];
}

export default function ChurchPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/churches/public/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Church not found");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <Church className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-3xl font-bold">Church Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          No church found at &quot;/{slug}&quot; or it has been deactivated.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const { church, memberCount, upcomingEvents, announcements } = data;
  const location = [church.city, church.state].filter(Boolean).join(", ");
  const fullAddress = [church.address, location, church.zipCode].filter(Boolean).join(", ");
  const primary = church.primaryColor || undefined;
  const secondary = church.secondaryColor || undefined;
  const accentStyle = primary ? { color: primary } : undefined;
  const primaryBtnStyle = primary
    ? { backgroundColor: primary, borderColor: primary, color: "#fff" }
    : undefined;
  const secondaryBtnStyle = secondary
    ? { borderColor: secondary, color: secondary }
    : primary
      ? { borderColor: primary, color: primary }
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
              style={primary ? { backgroundColor: primary } : undefined}
            >
              <Church className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CDMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" style={primaryBtnStyle}>
              <Link href="/register">Join Church</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          {primary && (
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: primary }}
              aria-hidden
            />
          )}
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center">
              {church.logoUrl ? (
                <img
                  src={church.logoUrl}
                  alt={church.name}
                  className="mb-6 h-20 w-20 rounded-2xl object-contain shadow-md"
                />
              ) : (
                <div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-md"
                  style={primary ? { backgroundColor: `${primary}1a` } : undefined}
                >
                  <Church className="h-10 w-10 text-primary" style={accentStyle} />
                </div>
              )}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {church.name}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Welcome to our church community. Join us in worship, fellowship, and service.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="px-8" style={primaryBtnStyle}>
                  <Link href="/register">
                    Join Our Church
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {church.website && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-8"
                    style={secondaryBtnStyle}
                  >
                    <a href={church.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5 text-primary" style={accentStyle} />
                <span className="text-sm font-medium">
                  <span className="text-foreground">{memberCount}</span> Members
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" style={accentStyle} />
                <span className="text-sm font-medium">
                  <span className="text-foreground">{upcomingEvents.length}</span> Upcoming Events
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Megaphone className="h-5 w-5 text-primary" style={accentStyle} />
                <span className="text-sm font-medium">
                  <span className="text-foreground">{announcements.length}</span> Announcements
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="border-t py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {fullAddress && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" style={accentStyle} />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{fullAddress}</p>
                  </div>
                </div>
              )}
              {church.phone && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" style={accentStyle} />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={`tel:${church.phone}`} className="text-sm text-muted-foreground hover:text-foreground">
                      {church.phone}
                    </a>
                  </div>
                </div>
              )}
              {church.email && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" style={accentStyle} />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${church.email}`} className="text-sm text-muted-foreground hover:text-foreground">
                      {church.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="border-t bg-muted/30 py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" style={accentStyle} />
                <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{event.title}</h3>
                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="border-t py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-6 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" style={accentStyle} />
                <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
              </div>
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{ann.title}</h3>
                      {ann.publishDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(ann.publishDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Join {church.name}?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Become a part of our community and start your journey with us.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="px-8" style={primaryBtnStyle}>
                <Link href="/register">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8" style={secondaryBtnStyle}>
                <Link href="/login">Sign In to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
                style={primary ? { backgroundColor: primary } : undefined}
              >
                <Church className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">CDMS</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {church.name}. Powered by CDMS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
