import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border border-border/70 bg-surface/95 text-foreground shadow-[0_12px_26px_rgba(var(--shadow-soft),0.32)]";
    case "ghost":
      return "border border-border/50 bg-transparent text-foreground/75";
    case "primary":
    default:
      return "brand-gradient text-white shadow-[0_16px_32px_rgba(var(--shadow-strong),0.32)]";
  }
}

function sizeClasses(size: Size) {
  switch (size) {
    case "sm":
      return "h-9 px-4 text-sm";
    case "lg":
      return "h-12 px-6 text-base";
    case "md":
    default:
      return "h-10 px-5 text-sm";
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
        "inline-flex cursor-pointer items-center justify-center rounded-full font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 disabled:pointer-events-none disabled:opacity-50",
        variantClasses(variant),
        sizeClasses(size),
        className
      )}
      {...props}
    />
  );
}
