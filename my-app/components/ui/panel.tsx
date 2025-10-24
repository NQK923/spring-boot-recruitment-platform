import type { JSX, ReactNode } from "react";
import { cx } from "@/lib/cx";

type PanelProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
  variant?: "surface" | "glass";
  padding?: "sm" | "md" | "lg";
};

const paddingMap = {
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

export function Panel({
  as: Component = "div",
  variant = "surface",
  padding = "md",
  className,
  children,
}: PanelProps) {
  return (
    <Component
      className={cx(
        "relative rounded-2xl border border-border bg-surface shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition-shadow duration-200",
        variant === "glass" ? "glass-panel" : "bg-surface",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
