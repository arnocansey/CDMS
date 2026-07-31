import Image from "next/image";
import { Church } from "lucide-react";
import { cn } from "@/lib/utils";
import { branding } from "@/lib/branding";

type LandingLoaderVariant = "page" | "inline" | "button";

interface LandingLoaderProps {
  variant?: LandingLoaderVariant;
  label?: string;
  className?: string;
  /** Dark/hero surfaces (white accents). */
  inverted?: boolean;
}

/**
 * Branded loader for landing/auth public surfaces — soft steeple pulse, not a spinner circle.
 */
export function LandingLoader({
  variant = "page",
  label = "Loading…",
  className,
  inverted = false,
}: LandingLoaderProps) {
  if (variant === "button") {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5", className)}
        role="status"
        aria-label={label}
      >
        <span className="landing-loader-bars landing-loader-bars--sm" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-3 py-6", className)}
        role="status"
        aria-label={label}
      >
        <LoaderMark inverted={inverted} size="md" />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950",
        className
      )}
      role="status"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.18),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <LoaderMark inverted size="lg" />
        <p className="text-sm font-medium tracking-wide text-white/70">{branding.shortName}</p>
        <span className="landing-loader-bars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function LoaderMark({
  inverted,
  size,
}: {
  inverted?: boolean;
  size: "md" | "lg";
}) {
  const box = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const icon = size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <div className={cn("landing-loader-mark relative flex items-center justify-center", box)}>
      <span
        className={cn(
          "landing-loader-ring absolute inset-0 rounded-2xl",
          inverted ? "bg-white/10 ring-1 ring-white/20" : "bg-primary/10 ring-1 ring-primary/20"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "landing-loader-ring-delayed absolute -inset-2 rounded-[1.25rem]",
          inverted ? "bg-white/5" : "bg-primary/5"
        )}
        aria-hidden
      />
      {branding.logo ? (
        <Image
          src={branding.logo}
          alt=""
          width={size === "lg" ? 40 : 28}
          height={size === "lg" ? 40 : 28}
          className="relative z-10 object-contain drop-shadow-md"
          priority
        />
      ) : (
        <Church
          className={cn(
            "relative z-10",
            icon,
            inverted ? "text-white" : "text-primary"
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
