import type { ReactNode } from "react";
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
        "relative rounded-3xl border border-border/70 shadow-[0_16px_40px_rgba(var(--shadow-soft),0.28)]",
        variant === "glass" ? "glass-panel" : "bg-surface/96",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
