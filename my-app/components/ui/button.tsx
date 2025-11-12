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
    "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg",
  secondary:
    "border-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm",
  outline: 
    "border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  ghost: 
    "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700",
  destructive: 
    "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg",
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
