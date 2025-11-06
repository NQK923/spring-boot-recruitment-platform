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
        "relative overflow-hidden rounded-2xl border border-primary-400/30 bg-gradient-to-br from-white/95 via-primary-50/90 to-blue-50/85 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-500/50",
        className
      )}
    >
      {title ? (
        <header className="text-h3 text-gray-900 border-b border-gray-200 pb-4 mb-4">{title}</header>
      ) : null}
      <div className="space-y-3">{children}</div>
      {footer ? <footer className="border-t border-gray-200 pt-4 mt-4">{footer}</footer> : null}
    </Component>
  );
}
