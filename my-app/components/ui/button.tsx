import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border border-foreground/20 bg-background text-foreground shadow-sm hover:border-foreground/40 hover:text-foreground";
    case "ghost":
      return "text-foreground/80 hover:text-foreground";
    case "primary":
    default:
      return "bg-foreground text-background shadow-sm hover:bg-foreground/90";
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
        "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60 disabled:pointer-events-none disabled:opacity-50",
        variantClasses(variant),
        sizeClasses(size),
        className
      )}
      {...props}
    />
  );
}
