import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed";

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "border-2 border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white hover:shadow-lg shadow-sm",
  outline: 
    "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-800 hover:border-gray-800 hover:text-white hover:shadow-md",
  ghost: 
    "text-indigo-600 hover:bg-indigo-600 hover:text-white",
  destructive: 
    "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
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
  const classes = cx(baseClasses, sizeClasses[size], variantClasses[variant], className);

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
