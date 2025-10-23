import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border border-foreground/15 bg-surface text-foreground shadow-sm hover:border-foreground/25 hover:text-foreground";
    case "ghost":
      return "text-foreground/70 hover:text-foreground";
    case "primary":
    default:
      return "brand-gradient text-white shadow-sm hover:opacity-90";
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
        "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 disabled:pointer-events-none disabled:opacity-50",
        variantClasses(variant),
        sizeClasses(size),
        className
      )}
      {...props}
    />
  );
}
