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
      className="h-full overflow-y-auto px-4 py-6"
      aria-live="polite"
      aria-label="Lịch sử trò chuyện với trợ lý tuyển dụng"
    >
      {showQuickPrompts ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-foreground/70">
          <div className="max-w-xs space-y-1">
            <p className="font-semibold text-foreground">
              Chào bạn! Trợ lý tuyển dụng luôn sẵn sàng hỗ trợ.
            </p>
            <p>Chọn nhanh một chủ đề bên dưới hoặc đặt câu hỏi của riêng bạn.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.prompt}
                type="button"
                onClick={() => sendMessage(item.prompt)}
                disabled={status === "loading" || status === "streaming"}
                className={cx(
                  "rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-foreground transition",
                  "hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]",
                  (status === "loading" || status === "streaming") && "opacity-60"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {showTypingDots ? (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl border border-border/60 bg-background px-4 py-2 shadow-sm">
                <TypingDots />
              </div>
            </div>
          ) : null}
          {status === "error" && error ? (
            <p className="text-center text-xs text-red-500">{error}</p>
          ) : null}
          {status === "error" && retryAvailable ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground transition hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
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

  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-[rgb(var(--accent))] text-white"
            : "border border-border/70 bg-surface text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
