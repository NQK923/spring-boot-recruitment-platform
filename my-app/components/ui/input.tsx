import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        "flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}
