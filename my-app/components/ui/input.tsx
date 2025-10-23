import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        "flex h-11 w-full rounded-2xl border border-border/70 bg-surface/98 px-4 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
