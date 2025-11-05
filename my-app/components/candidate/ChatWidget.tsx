"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import { useChatWidget } from "@/hooks/useChatWidget";
import { MessageList } from "@/components/candidate/MessageList";
import { Composer } from "@/components/candidate/Composer";

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 520;
const EDGE_PADDING = 16;
const BOTTOM_SHEET_HEIGHT_PERCENT = 70;

type Position = {
  top: number;
  left: number;
};

export function ChatWidget() {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setPortalElement(document.body);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!portalElement) {
    return null;
  }

  return createPortal(<ChatWidgetInner />, portalElement);
}

function ChatWidgetInner() {
  const {
    isOpen,
    hasUnread,
    status,
    error,
    info,
    messages,
    language,
    storageHydrated,
    isStreamingPreferred,
    retryAvailable,
      close,
    toggle,
    clear,
    setLanguage,
    setStreamingPreferred,
    sendMessage,
    retryLastAttempt,
  } = useChatWidget();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < 640;
  });
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window === "undefined") {
      return { top: EDGE_PADDING, left: EDGE_PADDING };
    }
    return {
      top: Math.max(EDGE_PADDING, window.innerHeight - PANEL_HEIGHT - EDGE_PADDING),
      left: Math.max(EDGE_PADDING, window.innerWidth - PANEL_WIDTH - EDGE_PADDING),
    };
  });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragDataRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const desktopPositionInitializedRef = useRef(false);
  const positionFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!storageHydrated) {
      return;
    }
    const updateIsMobile = () => {
      const nextMobile = window.innerWidth < 640;
      setIsMobile((previous) => (previous === nextMobile ? previous : nextMobile));
    };
    window.addEventListener("resize", updateIsMobile);
    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, [storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) {
      return;
    }
    if (isMobile) {
      if (positionFrameRef.current !== null) {
        cancelAnimationFrame(positionFrameRef.current);
        positionFrameRef.current = null;
      }
      desktopPositionInitializedRef.current = false;
      return;
    }

    const clampWithinViewport = () => {
      const maxTop = Math.max(EDGE_PADDING, window.innerHeight - PANEL_HEIGHT - EDGE_PADDING);
      const maxLeft = Math.max(EDGE_PADDING, window.innerWidth - PANEL_WIDTH - EDGE_PADDING);
      setPosition((previous) => {
        const next = desktopPositionInitializedRef.current
          ? {
              top: clamp(previous.top, EDGE_PADDING, maxTop),
              left: clamp(previous.left, EDGE_PADDING, maxLeft),
            }
          : {
              top: maxTop,
              left: maxLeft,
            };
        desktopPositionInitializedRef.current = true;
        if (next.top === previous.top && next.left === previous.left) {
          return previous;
        }
        return next;
      });
    };

    const scheduleClamp = () => {
      if (positionFrameRef.current !== null) {
        cancelAnimationFrame(positionFrameRef.current);
      }
      positionFrameRef.current = requestAnimationFrame(() => {
        positionFrameRef.current = null;
        clampWithinViewport();
      });
    };

    scheduleClamp();
    window.addEventListener("resize", scheduleClamp);
    return () => {
      if (positionFrameRef.current !== null) {
        cancelAnimationFrame(positionFrameRef.current);
        positionFrameRef.current = null;
      }
      window.removeEventListener("resize", scheduleClamp);
    };
  }, [isMobile, storageHydrated]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragDataRef.current || !panelRef.current) {
        return;
      }
      const { offsetX, offsetY } = dragDataRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nextLeft = clamp(
        event.clientX - offsetX,
        EDGE_PADDING,
        Math.max(EDGE_PADDING, width - PANEL_WIDTH - EDGE_PADDING)
      );
      const nextTop = clamp(
        event.clientY - offsetY,
        EDGE_PADDING,
        Math.max(EDGE_PADDING, height - PANEL_HEIGHT - EDGE_PADDING)
      );
      setPosition({ top: nextTop, left: nextLeft });
    },
    []
  );

  const handlePointerUpRef = useRef<(() => void) | null>(null);

  const handlePointerUp = useCallback(() => {
    dragDataRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    if (handlePointerUpRef.current) {
      window.removeEventListener("pointerup", handlePointerUpRef.current);
      window.removeEventListener("pointercancel", handlePointerUpRef.current);
    }
    handlePointerUpRef.current = null;
  }, [handlePointerMove]);

  const startDragging = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isMobile) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest("[data-no-drag='true']")) {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const rect = panel.getBoundingClientRect();
      dragDataRef.current = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      window.addEventListener("pointermove", handlePointerMove);
      handlePointerUpRef.current = handlePointerUp;
      window.addEventListener("pointerup", handlePointerUpRef.current, { once: true });
      window.addEventListener("pointercancel", handlePointerUpRef.current, { once: true });
    },
    [handlePointerMove, handlePointerUp, isMobile]
  );

  useEffect(() => {
    return () => {
      handlePointerUp();
    };
  }, [handlePointerUp]);

  useFocusTrap({ enabled: isOpen, ref: panelRef, onEscape: close });

  const panelStyles = useMemo(() => {
    if (isMobile) {
      return {
        inset: `auto 0 0 0`,
        height: `${BOTTOM_SHEET_HEIGHT_PERCENT}vh`,
      } satisfies CSSProperties;
    }
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: `${PANEL_WIDTH}px`,
      height: `${PANEL_HEIGHT}px`,
    } satisfies CSSProperties;
  }, [isMobile, position]);

  if (!storageHydrated) {
    return null;
  }

  return (
    <>
      <FloatingLauncher
        isOpen={isOpen}
        hasUnread={hasUnread}
        toggle={toggle}
      />
      {isOpen ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Trợ lý tuyển dụng"
          tabIndex={-1}
          style={panelStyles}
          className={cx(
            "chat-widget-panel fixed z-[9999] flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/98 via-surface/95 to-background/98 text-foreground shadow-[0_28px_56px_rgba(15,23,42,0.28)] backdrop-blur-xl transition duration-200",
            isMobile
              ? "mx-auto w-full max-w-none rounded-t-[36px] border-t border-border/60"
              : "w-[420px]"
          )}
        >
          <WidgetPanelHeader
            language={language}
            isStreamingPreferred={isStreamingPreferred}
            onPointerDown={startDragging}
            setLanguage={setLanguage}
            setStreamingPreferred={setStreamingPreferred}
            clear={clear}
            close={close}
          />
          <div className="flex flex-1 min-h-0 flex-col px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-border/40 bg-gradient-to-br from-background/99 via-background/95 to-background/98 shadow-[0_24px_52px_rgba(15,23,42,0.22)]">
              <div className="flex-1 min-h-0">
                <MessageList
                  messages={messages}
                  status={status}
                  error={error}
                  retryAvailable={retryAvailable}
                  onRetry={retryLastAttempt}
                  sendMessage={sendMessage}
                />
              </div>
              {info ? <Toast message={info} /> : null}
              <div className="border-t border-border/50 bg-background/94">
                <Composer
                  status={status}
                  language={language}
                  sendMessage={sendMessage}
                  retryAvailable={retryAvailable}
                  onRetry={retryLastAttempt}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FloatingLauncher({
  isOpen,
  hasUnread,
  toggle,
}: {
  isOpen: boolean;
  hasUnread: boolean;
  toggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Thu nhỏ trợ lý tuyển dụng" : "Mở trợ lý tuyển dụng"}
      onClick={toggle}
          className={cx(
            "fixed bottom-5 right-5 z-[9998] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--accent))] via-[rgba(var(--accent),0.88)] to-[rgba(var(--accent),0.66)] text-white shadow-[0_20px_38px_rgba(15,23,42,0.28)] transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(var(--accent),0.85)] sm:bottom-6 sm:right-6",
            isOpen ? "scale-95 opacity-80" : "scale-100"
          )}
    >
      <ChatBubbleIcon />
      {hasUnread ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/60 bg-white text-[9px] font-semibold text-[rgb(var(--accent))] shadow-[0_6px_12px_rgba(15,23,42,0.2)]">
          ●
        </span>
      ) : null}
    </button>
  );
}

function WidgetPanelHeader({
  language,
  isStreamingPreferred,
  onPointerDown,
  setLanguage,
  setStreamingPreferred,
  clear,
  close,
}: {
  language: "vi" | "en";
  isStreamingPreferred: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  setLanguage: (lang: "vi" | "en") => void;
  setStreamingPreferred: (value: boolean) => void;
  clear: () => void;
  close: () => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="cursor-grab select-none border-b border-border/50 bg-gradient-to-br from-[rgba(var(--accent),0.14)] via-background/98 to-background/96 px-6 py-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--accent),0.16)] text-[rgb(var(--accent))] shadow-[0_10px_20px_rgba(var(--accent),0.18)]">
              <ChatBubbleIcon />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold tracking-wide text-foreground">Trợ lý tuyển dụng</span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/60">
                <span>Hỗ trợ tức thì cho mọi câu hỏi tuyển dụng</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                  <span aria-hidden="true">●</span>
                  <span>Trực tuyến</span>
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground/60 transition hover:border-[rgba(var(--accent),0.6)] hover:bg-[rgba(var(--accent),0.08)] hover:text-foreground"
            aria-label="Đóng trợ lý"
            data-no-drag="true"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium" data-no-drag="true">
          <div className="relative flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1.5">
            <label htmlFor="chat-lang" className="sr-only">
              Ngôn ngữ
            </label>
            <select
              id="chat-lang"
              value={language}
              onChange={(event) => setLanguage(event.target.value === "en" ? "en" : "vi")}
              className="peer cursor-pointer appearance-none rounded-full border border-border/60 bg-background/95 px-3 py-1 text-xs font-medium text-foreground outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/30"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/60">
              ▾
            </span>
          </div>
          <div className="flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/85 px-3 py-1.5">
            <span className="text-[11px] text-foreground/60">Trả lời trực tiếp</span>
            <input
              id="chat-streaming-switch"
              type="checkbox"
              className="peer sr-only"
              checked={isStreamingPreferred}
              onChange={(event) => setStreamingPreferred(event.target.checked)}
            />
            <label
              htmlFor="chat-streaming-switch"
              className="relative block h-5 w-9 cursor-pointer rounded-full bg-border transition peer-checked:bg-[rgb(var(--accent))]"
            >
              <span className="absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition peer-checked:translate-x-3.5" />
            </label>
          </div>
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-[11px] text-foreground/70 transition hover:border-[rgba(var(--accent),0.6)] hover:bg-[rgba(var(--accent),0.08)] hover:text-[rgb(var(--accent))]"
          >
            Xóa hội thoại
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-[10000]">
      <div className="rounded-xl border border-amber-400/70 bg-amber-50 px-4 py-2 text-xs text-amber-800 shadow-lg">
        {message}
      </div>
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
    >
      <path
        fill="currentColor"
        d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-2.382l-2.894 2.895A1 1 0 0 1 10 17.586V15H7a3 3 0 0 1-3-3V5Z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
    >
      <path
        fill="currentColor"
        d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 1 1-1.414-1.414L10.586 10.586l-4.361-4.361a1 1 0 0 1 0-1.414Z"
      />
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useFocusTrap({
  enabled,
  ref,
  onEscape,
}: {
  enabled: boolean;
  ref: MutableRefObject<HTMLDivElement | null>;
  onEscape: () => void;
}) {
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }
    const container = ref.current;
    const focusableSelectors = [
      "button",
      "a[href]",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden")
      );

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [enabled, onEscape, ref]);
}
