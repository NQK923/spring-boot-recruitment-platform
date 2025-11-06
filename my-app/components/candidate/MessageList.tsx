"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ChatStatus } from "@/app/providers/chat-widget-provider";
import type { ChatMessage } from "@/lib/chat";
import { cx } from "@/lib/cx";
import { TypingDots } from "@/components/candidate/TypingDots";

type MessageListProps = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  retryAvailable: boolean;
  onRetry: () => void;
  sendMessage: (text: string) => void | Promise<void>;
};

const QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  {
    label: "Quy trình tuyển dụng",
    prompt: "Quy trình tuyển dụng hiện tại gồm những vòng nào và mất bao lâu?",
  },
  {
    label: "Trạng thái hồ sơ",
    prompt: "Bạn có thể kiểm tra giúp mình trạng thái hồ sơ ứng tuyển gần nhất không?",
  },
  {
    label: "Chuẩn bị phỏng vấn",
    prompt: "Mình nên chuẩn bị những gì cho vòng phỏng vấn tiếp theo?",
  },
  {
    label: "Phúc lợi & làm việc",
    prompt: "Các phúc lợi chính và chế độ làm việc linh hoạt của công ty là gì?",
  },
];

const SYSTEM_TEXT_OVERRIDES: Record<string, string> = {
  "Missing chat action.": "Không tìm thấy hành động trò chuyện.",
  "Missing chat action": "Không tìm thấy hành động trò chuyện.",
};

function translateSystemText(text: string) {
  const trimmed = text.trim();
  return SYSTEM_TEXT_OVERRIDES[trimmed] ?? text;
}

export function MessageList({
  messages,
  status,
  error,
  retryAvailable,
  onRetry,
  sendMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = node;
      shouldAutoScrollRef.current = scrollHeight - (scrollTop + clientHeight) < 120;
    };
    handleScroll();
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !shouldAutoScrollRef.current) {
      return;
    }
    requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    });
  }, [messages, status]);

  const visibleMessages = useMemo(() => {
    if (!messages.length) {
      return [];
    }
    const copy = [...messages];
    const last = copy[copy.length - 1];
    if (
      (status === "loading" || status === "streaming") &&
      last?.role === "assistant" &&
      !last.content.trim()
    ) {
      return copy.slice(0, -1);
    }
    return copy;
  }, [messages, status]);

  const showQuickPrompts = messages.length === 0;
  const showTypingDots =
    (status === "loading" || status === "streaming") &&
    (messages.length === 0 || messages[messages.length - 1].role === "assistant");

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto px-5 py-6 sm:px-6 sm:py-7"
      aria-live="polite"
      aria-label="Lịch sử trò chuyện với trợ lý tuyển dụng"
    >
      {showQuickPrompts ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-muted">
          <div className="max-w-xs space-y-1.5">
            <p className="font-semibold text-text">Xin chào! Trợ lý tuyển dụng luôn sẵn sàng.</p>
            <p>Chọn nhanh một chủ đề bên dưới hoặc đặt câu hỏi riêng của bạn để bắt đầu đối thoại.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.prompt}
                type="button"
                onClick={() => sendMessage(item.prompt)}
                disabled={status === "loading" || status === "streaming"}
                className={cx(
                  "cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text shadow-sm transition",
                  "hover:border-accent-500/60 hover:bg-accent-500/10 hover:text-accent-600",
                  (status === "loading" || status === "streaming") && "opacity-60"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {showTypingDots ? (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl border border-border bg-bg/90 px-4 py-2 shadow-lg backdrop-blur-sm">
                <TypingDots />
              </div>
            </div>
          ) : null}
          {status === "error" && error ? (
            <p className="text-center text-xs text-error-600">{translateSystemText(error)}</p>
          ) : null}
          {status === "error" && retryAvailable ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition hover:border-accent-500/60 hover:bg-accent-500/10 hover:text-accent-600"
              >
                Thử lại
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const content = isUser ? message.content : translateSystemText(message.content);

  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-lg",
          isUser
            ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white"
            : "border border-border bg-bg/90 backdrop-blur-sm text-text"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
