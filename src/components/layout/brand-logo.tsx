import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "color" | "white";
  className?: string;
}

export function BrandLogo({ variant = "color", className }: BrandLogoProps) {
  const src =
    variant === "white"
      ? "/assets/brand/MIRARIM-horizontal-blanco.svg"
      : "/assets/brand/MIRARIM-horizontal-color.svg";

  return (
    <img
      src={src}
      alt="MIRARIM"
      className={cn("h-7 w-auto max-w-[180px] sm:h-9 sm:max-w-[220px]", className)}
      draggable={false}
    />
  );
}
