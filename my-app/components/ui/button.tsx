import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cx } from "@/lib/cx";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-400",
  outline:
    "border border-border bg-surface text-text hover:bg-primary-50 dark:hover:bg-white/5 focus-visible:ring-primary-400",
  ghost:
    "text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-white/5 focus-visible:ring-primary-400",
  danger: "bg-error-600 text-white hover:bg-error-600/90 focus-visible:ring-error-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs sm:text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm sm:text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown> & { className?: string }>;
    return cloneElement(child, {
      ...(props as Record<string, unknown>),
      className: cx(child.props.className, classes),
    });
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
