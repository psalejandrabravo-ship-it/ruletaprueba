import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out tap-target disabled:pointer-events-none disabled:opacity-50 active:enabled:scale-[0.96] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-coral text-ink shadow-[0_1px_0_rgba(30,24,48,0.08)] hover:bg-coral-hover",
        secondary:
          "bg-indigo text-cream hover:bg-indigo-hover",
        outline:
          "bg-surface text-indigo shadow-[0_0_0_1px_rgba(43,33,85,0.16)] hover:bg-cream-deep",
        ghost: "bg-transparent text-indigo hover:bg-cream-deep",
        danger:
          "bg-danger-bg text-danger shadow-[0_0_0_1px_rgba(139,53,53,0.18)] hover:bg-[#efd4ce]",
      },
      size: {
        sm: "rounded-md px-3 text-sm",
        md: "rounded-lg px-4 text-base",
        lg: "rounded-xl px-6 min-h-14 text-lg",
        icon: "rounded-lg size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

export { buttonVariants };
