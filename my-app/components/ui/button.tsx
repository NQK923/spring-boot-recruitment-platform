import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border border-border bg-surface-muted text-foreground hover:bg-surface hover:text-foreground hover:shadow-[0_10px_20px_rgba(15,23,42,0.1)]";
    case "ghost":
      return "border border-border/60 bg-transparent text-foreground/75 hover:border-border/70 hover:text-foreground";
    case "primary":
    default:
      return "bg-[rgb(var(--accent))] text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-[rgba(var(--accent),0.9)]";
  }
}

function sizeClasses(size: Size) {
  switch (size) {
    case "sm":
      return "h-8 px-3 text-xs sm:text-sm";
    case "lg":
      return "h-10 px-5 text-sm sm:text-base";
    case "md":
    default:
      return "h-9 px-4 text-sm";
  }
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variantClasses(variant),
        sizeClasses(size),
        className
      )}
      {...props}
    />
  );
}
