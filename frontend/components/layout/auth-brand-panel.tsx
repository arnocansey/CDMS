import type { ReactNode } from "react";
import { BackgroundImage } from "@/components/layout/background-image";

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
      <BackgroundImage src={imageSrc} alt={imageAlt} priority />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/80 via-primary/70 to-slate-900/75"
        aria-hidden
      />
      <div className="relative z-10 max-w-md px-8 text-center text-white">
        {children}
      </div>
    </div>
  );
}
