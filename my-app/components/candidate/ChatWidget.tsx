"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setPortalElement(document.body);
    });
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  if (!isMounted || !portalElement) {
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

  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: EDGE_PADDING,
    left: EDGE_PADDING,
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
    updateIsMobile();
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
            "chat-widget-panel fixed z-[9999] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300",
            isMobile
              ? "mx-auto w-full max-w-none rounded-t-3xl"
              : "w-[420px]"
          )}
        >
          <WidgetPanelHeader
            onPointerDown={startDragging}
            close={close}
          />
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex-1 min-h-0 bg-gradient-to-b from-slate-50 to-white">
              <MessageList
                messages={messages}
                status={status}
                error={error}
                retryAvailable={retryAvailable}
                retryAction={retryLastAttempt}
                sendMessageAction={sendMessage}
              />
            </div>
            {info ? <Toast message={info} /> : null}
            <div className="border-t border-slate-200 bg-white">
              <Composer
                status={status}
                language={language}
                sendMessageAction={sendMessage}
                retryAvailable={retryAvailable}
                retryAction={retryLastAttempt}
              />
            </div>
            <WidgetFooter
              language={language}
              isStreamingPreferred={isStreamingPreferred}
              setLanguage={setLanguage}
              setStreamingPreferred={setStreamingPreferred}
              clear={clear}
            />
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
        "fixed bottom-5 right-5 z-[9998] flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6",
        isOpen ? "scale-95 opacity-90" : "scale-100"
      )}
    >
      <ChatBubbleIcon />
      {hasUnread ? (
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
          ●
        </span>
      ) : null}
    </button>
  );
}

function WidgetPanelHeader({
  onPointerDown,
  close,
}: {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  close: () => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="cursor-grab select-none bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ChatBubbleIcon />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white">Trợ lý tuyển dụng</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-white/90">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Trực tuyến
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
          aria-label="Đóng trợ lý"
          data-no-drag="true"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function WidgetFooter({
  language,
  isStreamingPreferred,
  setLanguage,
  setStreamingPreferred,
  clear,
}: {
  language: "vi" | "en";
  isStreamingPreferred: boolean;
  setLanguage: (lang: "vi" | "en") => void;
  setStreamingPreferred: (value: boolean) => void;
  clear: () => void;
}) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3" data-no-drag="true">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <select
            id="chat-lang"
            value={language}
            onChange={(event) => setLanguage(event.target.value === "en" ? "en" : "vi")}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-indigo-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="vi">🇻🇳 VI</option>
            <option value="en">🇬🇧 EN</option>
          </select>
          
          <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 transition hover:border-indigo-400">
            <input
              id="chat-streaming-toggle"
              type="checkbox"
              className="sr-only"
              checked={isStreamingPreferred}
              onChange={(event) => setStreamingPreferred(event.target.checked)}
            />
            <label 
              htmlFor="chat-streaming-toggle" 
              className={cx(
                "relative flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors duration-200",
                isStreamingPreferred ? "bg-indigo-500" : "bg-slate-300"
              )}
            >
              <span className={cx(
                "absolute left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200",
                isStreamingPreferred ? "translate-x-3" : "translate-x-0"
              )} />
            </label>
            <label htmlFor="chat-streaming-toggle" className="cursor-pointer text-xs font-semibold text-slate-700">
              Stream
            </label>
          </div>
        </div>
        
        <button
          type="button"
          onClick={clear}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-[10000]">
      <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg">
        ⚠️ {message}
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
