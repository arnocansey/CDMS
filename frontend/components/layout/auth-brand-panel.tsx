import Image from "next/image";
import type { ReactNode } from "react";

interface AuthBrandPanelProps {
  imageSrc: string;
  imageAlt?: string;
  children: ReactNode;
}

/** Full-height left branding panel with a real photo background + readable overlay. */
export function AuthBrandPanel({
  imageSrc,
  imageAlt = "Church atmosphere",
  children,
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-primary/75 to-slate-900/80"
        aria-hidden
      />
      <div className="relative z-10 max-w-md px-8 text-center text-white">
        {children}
      </div>
    </div>
  );
}
