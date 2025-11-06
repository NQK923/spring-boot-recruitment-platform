import type { JSX, ReactNode } from "react";
import { cx } from "@/lib/cx";

type PanelProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
  variant?: "surface" | "glass";
  padding?: "sm" | "md" | "lg";
  id?: string;
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
  id,
}: PanelProps) {
  return (
    <Component
      id={id}
      className={cx(
        "relative rounded-2xl border border-primary-300/30 bg-gradient-to-br from-white/90 via-slate-50/85 to-blue-50/80 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary-400/50",
        variant === "glass" ? "glass-panel backdrop-blur-md" : null,
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
