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
        "relative rounded-2xl border-2 border-blue-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200",
        variant === "glass" ? "backdrop-blur-md bg-white/95" : null,
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
