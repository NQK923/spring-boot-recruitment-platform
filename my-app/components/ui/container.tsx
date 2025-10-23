import type { ReactNode } from "react";

type ContainerProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
};

export function Container({ as: Component = "div", className, children }: ContainerProps) {
  return (
    <Component
      className={[
        "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
