"use client";

type TypingDotsProps = {
  ariaLabel?: string;
};

const DOT_STYLE = "h-2.5 w-2.5 rounded-full bg-foreground/60";

export function TypingDots({ ariaLabel = "Đang nhập..." }: TypingDotsProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center"
    >
      <span className="sr-only">{ariaLabel}</span>
      <div
        aria-hidden="true"
        className="flex items-center gap-1 rounded-full bg-border/60 px-3 py-1.5"
      >
        <span
          className={`${DOT_STYLE} animate-pulse`}
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className={`${DOT_STYLE} animate-pulse`}
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span
          className={`${DOT_STYLE} animate-pulse`}
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
    </div>
  );
}
