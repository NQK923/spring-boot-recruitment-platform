import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "border-2 border-border bg-white dark:bg-surface text-text shadow-md hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-primary-300 dark:hover:border-primary-500";
    case "ghost":
      return "text-primary-600 dark:text-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-accent-900/30";
    case "outline":
      return "border-2 border-primary-300 dark:border-primary-500 text-text hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-accent-900/30 hover:border-primary-400 dark:hover:border-primary-400";
    case "primary":
    default:
      return "bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-lg hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 hover:shadow-xl";
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
  const baseClasses = cx(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
    variantClasses(variant),
    sizeClasses(size)
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown> & { className?: string }>;
    const existingClassName =
      typeof child.props.className === "string" ? child.props.className : undefined;
    return cloneElement(child, {
      ...(props as Record<string, unknown>),
      className: cx(baseClasses, existingClassName, className),
    });
  }

  return (
    <button
      type={type}
      className={cx(baseClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}
