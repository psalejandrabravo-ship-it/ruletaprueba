import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  trailing?: ReactNode;
  className?: string;
}

export function AppHeader({ trailing, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center">
        <BrandLogo variant="color" />
      </div>
      {trailing ? <div className="flex min-w-0 shrink items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
