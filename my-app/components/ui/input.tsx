import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        "flex h-11 w-full rounded-xl border border-foreground/20 bg-background px-4 text-sm text-foreground shadow-sm transition placeholder:text-foreground/40 focus:border-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
