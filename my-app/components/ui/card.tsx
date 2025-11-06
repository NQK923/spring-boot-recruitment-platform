import type { JSX, ReactNode } from "react";

import { cx } from "@/lib/cx";

type CardProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function Card({ as: Component = "section", className, title, footer, children }: CardProps) {
  return (
    <Component
      className={cx(
        "relative overflow-hidden rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200",
        className
      )}
    >
      {title ? (
        <header className="text-lg font-bold text-slate-900 border-b-2 border-blue-100 pb-3 mb-4">{title}</header>
      ) : null}
      <div className="space-y-3">{children}</div>
      {footer ? <footer className="border-t-2 border-blue-100 pt-4 mt-4">{footer}</footer> : null}
    </Component>
  );
}
