"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatStatus } from "@/app/providers/chat-widget-provider";
import { cx } from "@/lib/cx";

type ComposerProps = {
  status: ChatStatus;
  language: "vi" | "en";
  sendMessage: (text: string) => void | Promise<void>;
  retryAvailable: boolean;
  onRetry: () => void;
};

const PLACEHOLDER = {
  vi: "Đặt câu hỏi về tuyển dụng, JD hoặc tiến trình ứng tuyển...",
  en: "Đặt câu hỏi về tuyển dụng, JD hoặc tiến trình ứng tuyển...",
} as const;

const SEND_LABEL = { vi: "Gửi", en: "Gửi" } as const;
const RETRY_LABEL = { vi: "Thử lại", en: "Thử lại" } as const;

export function Composer({ status, language, sendMessage, retryAvailable, onRetry }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const disabled = status === "loading" || status === "streaming";
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  const adjustHeight = useCallback(() => {
    const node = textareaRef.current;
    if (!node) {
      return;
    }
    node.style.height = "auto";
    const nextHeight = Math.min(node.scrollHeight, 160);
    node.style.height = `${nextHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, value]);

  const resetComposer = useCallback(() => {
    setValue("");
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const submitCurrentValue = useCallback(() => {
    if (!canSend) {
      return;
    }
    const text = trimmed;
    resetComposer();
    void sendMessage(text);
  }, [canSend, resetComposer, sendMessage, trimmed]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitCurrentValue();
    },
    [submitCurrentValue]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="chat-widget-input" className="sr-only">
            Nhập tin nhắn
          </label>
          <textarea
            id="chat-widget-input"
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitCurrentValue();
              }
            }}
            placeholder={PLACEHOLDER[language]}
            disabled={disabled}
            rows={1}
            className={cx(
              "w-full resize-none overflow-hidden rounded-2xl border border-transparent bg-background/90 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/50",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/25",
              disabled && "opacity-60"
            )}
            aria-disabled={disabled}
            autoComplete="off"
            autoCorrect="on"
          />
        </div>
        <div className="flex items-center gap-2">
          {status === "error" && retryAvailable ? (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-[rgba(var(--accent),0.6)] hover:bg-[rgba(var(--accent),0.08)] hover:text-[rgb(var(--accent))]"
            >
              {RETRY_LABEL[language]}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={!canSend}
            aria-label={SEND_LABEL[language]}
            className={cx(
              "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgba(var(--accent),0.85)] text-white shadow-[0_12px_24px_rgba(var(--accent),0.3)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]/35",
              canSend ? "hover:scale-105 focus-visible:scale-105" : "opacity-50"
            )}
          >
            {disabled ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end text-[11px] text-foreground/60">
        <span aria-live="polite">
          {disabled ? "Đang xử lý..." : "\u00A0"}
        </span>
      </div>
    </form>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
    >
      <path
        fill="currentColor"
        d="M3.4 20.6a1 1 0 0 0 1.05.23l16-6a1 1 0 0 0 .02-1.88l-16-6A1 1 0 0 0 3.4 7.4L8.56 12 3.4 16.6a1 1 0 0 0 0 1.4Zm6.1-5.99 2.56-2.33L18.11 12l-6.05 1.72Z"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
        fill="none"
      />
      <path
        fill="currentColor"
        d="M22 12a10 10 0 0 0-10-10v3a7 7 0 0 1 7 7h3Z"
      />
    </svg>
  );
}
