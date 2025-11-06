import type { JSX, ReactNode } from "react";

import { cx } from "@/lib/cx";

type CardProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
};

export function Card({ as: Component = "div", className, children }: CardProps) {
  return (
    <Component className={cx("rounded-2xl border border-border bg-surface p-6 shadow-sm", className)}>
      {children}
    </Component>
  );
}
