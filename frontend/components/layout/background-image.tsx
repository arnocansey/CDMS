import { cn } from "@/lib/utils";

interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/** Full-bleed decorative photo behind section content (avoids next/image fill quirks). */
export function BackgroundImage({
  src,
  alt = "",
  className,
  imgClassName,
  priority = false,
}: BackgroundImageProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)} aria-hidden={!alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
}
