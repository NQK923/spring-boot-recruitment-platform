"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { CHAT_HISTORY_LIMIT, ChatPayloadMessage, encodeContextPayload } from "@/lib/chat";
import { cx } from "@/lib/cx";

const PRESET_FAQ: Array<{ label: string; prompt: string }> = [
  {
    label: "Quy trình tuyển dụng",
    prompt: "Quy trình tuyển dụng hiện tại gồm những vòng nào và mất bao lâu?",
  },
  {
    label: "Trạng thái hồ sơ",
    prompt: "Bạn có thể kiểm tra giúp mình trạng thái hồ sơ ứng tuyển được không?",
  },
  {
    label: "Chuẩn bị phỏng vấn",
    prompt: "Cho mình gợi ý cách chuẩn bị cho vòng phỏng vấn tiếp theo?",
  },
  {
    label: "Phúc lợi",
    prompt: "Các phúc lợi chính và chế độ làm việc linh hoạt của công ty là gì?",
  },
];

const OUT_OF_SCOPE_MESSAGE =
  "Mình chỉ hỗ trợ các câu hỏi liên quan đến tuyển dụng. Bạn có muốn hỏi về vị trí, quy trình ứng tuyển, hoặc cách tối ưu CV/phỏng vấn không?";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const MAX_STREAM_IDLE_MS = 30_000;

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function toPayload(messages: ChatMessage[]): ChatPayloadMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

type ChatWidgetPanelProps = {
  apiBasePath?: string;
  onClose?: () => void;
};

export function ChatWidgetPanel({ apiBasePath, onClose }: ChatWidgetPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [streamMode, setStreamMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const basePath = apiBasePath ?? "/api/chat";

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      streamControllerRef.current?.abort();
    };
  }, []);

  const handleFaqClick = (prompt: string) => {
    setInput(prompt);
    setInfoMessage(null);
  };

  const resetConversation = () => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
    setMessages([]);
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    setInput("");
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: prompt,
    };

    const historyForPost = [...messages, userMessage];
    const payloadMessages = toPayload(
      historyForPost.slice(Math.max(historyForPost.length - CHAT_HISTORY_LIMIT, 0))
    );

    const contextForStream = messages.slice(Math.max(messages.length - CHAT_HISTORY_LIMIT, 0));

    const assistantTemplate: ChatMessage | null = streamMode
      ? { id: createId(), role: "assistant", content: "" }
      : null;

    setMessages((prev) => {
      const next = [...prev, userMessage];
      if (assistantTemplate) {
        next.push(assistantTemplate);
      }
      return next;
    });

    if (streamMode && assistantTemplate) {
      await streamResponse({
        question: prompt,
        assistantId: assistantTemplate.id,
        context: contextForStream,
      });
    } else {
      await requestResponse(payloadMessages);
    }

    setIsLoading(false);
  };

  const requestResponse = async (payloadMessages: ChatPayloadMessage[]) => {
    try {
      const response = await fetch(`${basePath}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: payloadMessages,
          language,
          stream: false,
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        const message = extractMessage(data) || "Tạm thời không thể phản hồi. Vui lòng thử lại sau.";
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", content: message },
        ]);
        setError(message);
        return;
      }

      const text = typeof data?.text === "string" && data.text.trim() ? data.text.trim() : null;
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content:
            text ?? "Mình chưa có dữ liệu chính xác cho câu hỏi này. Bạn có thể kiểm tra Candidate Portal hoặc liên hệ HR qua email nhé!",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "Kết nối bị gián đoạn. Bạn vui lòng thử lại sau vài phút!",
        },
      ]);
      setError(err instanceof Error ? err.message : "Không thể kết nối tới trợ lý.");
    }
  };

  const streamResponse = async ({
    question,
    assistantId,
    context,
  }: {
    question: string;
    assistantId: string;
    context: ChatMessage[];
  }) => {
    try {
      streamControllerRef.current?.abort();
      const controller = new AbortController();
      streamControllerRef.current = controller;

      const params = new URLSearchParams({
        q: question,
        language,
      });
      const encodedContext = encodeContextPayload(toPayload(context));

      const basePath = apiBasePath ?? "/api/candidate/chat";
      const response = await fetch(`${basePath}/stream?${params.toString()}`, {
        method: "GET",
        headers: encodedContext ? { "X-Context": encodedContext } : undefined,
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const fallback = await safeJson(response);
        const message = extractMessage(fallback) || "Không thể lấy phản hồi streaming. Thử lại chế độ thường nhé!";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: message } : msg
          )
        );
        setError(message);
        streamControllerRef.current = null;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let idleTimer: ReturnType<typeof setTimeout> | null = null;

      const flushIdle = () => {
        if (idleTimer) {
          clearTimeout(idleTimer);
        }
        idleTimer = setTimeout(() => {
          controller.abort();
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content:
                      msg.content ||
                      "Mình không nhận được toàn bộ dữ liệu. Hãy hỏi lại giúp mình nhé!",
                  }
                : msg
            )
          );
          setInfoMessage("Kết nối streaming bị gián đoạn do không có dữ liệu mới.");
        }, MAX_STREAM_IDLE_MS);
      };

      flushIdle();

      let active = true;
      let hasContent = false;

      while (active) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        buffer = processSseBuffer(buffer, (eventName, data) => {
          if (eventName === "message") {
            flushIdle();
            if (data === OUT_OF_SCOPE_MESSAGE) {
              hasContent = true;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: data } : msg
                )
              );
              active = false;
              controller.abort();
              return;
            }
            if (data) {
              hasContent = true;
            }
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: `${msg.content}${data}` }
                  : msg
              )
            );
          }
          if (eventName === "done") {
            active = false;
            controller.abort();
          }
        });
      }

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      if (!hasContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    "Mình chưa có thông tin đầy đủ cho câu hỏi này. Bạn có thể kiểm tra Candidate Portal hoặc email HR nhé!",
                }
              : msg
          )
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "Streaming bị gián đoạn. Bạn có thể thử gửi lại ở chế độ thường.",
              }
            : msg
        )
      );
      setError(err instanceof Error ? err.message : "Streaming bị gián đoạn.");
    } finally {
      streamControllerRef.current = null;
    }
  };

  const processSseBuffer = (
    buffer: string,
    handler: (eventName: string, data: string) => void
  ) => {
    const sanitized = buffer.replace(/\r/g, "");
    const segments = sanitized.split("\n\n");
    const remainder = segments.pop() ?? "";

    for (const segment of segments) {
      if (!segment.trim()) {
        continue;
      }
      const lines = segment.split("\n");
      let eventName = "message";
      const dataLines: string[] = [];

      for (const rawLine of lines) {
        if (!rawLine) {
          continue;
        }
        if (rawLine.startsWith("event:")) {
          eventName = rawLine.slice(6).trim();
        } else if (rawLine.startsWith("data:")) {
          dataLines.push(rawLine.slice(5).trimStart());
        }
      }

      const data = dataLines.join("\n");
      handler(eventName, data);
    }

    return remainder;
  };

  const safeJson = async (response: Response) => {
    try {
      return await response.clone().json();
    } catch {
      return null;
    }
  };

  const extractMessage = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") {
      return null;
    }
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message.trim();
    }
    if (typeof record.text === "string" && record.text.trim()) {
      return record.text.trim();
    }
    return null;
  };

  return (
    <Panel
      variant="surface"
      padding="md"
      className="w-[340px] sm:w-[380px] space-y-4 rounded-3xl border border-foreground/10 bg-surface shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(var(--accent),0.95)] to-[rgba(var(--accent),0.7)] text-xs font-semibold uppercase text-white shadow-md">
            AI
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Recruiting assistant</p>
            <p className="text-xs text-foreground/55">Ask about roles, applications, or interviews.</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 bg-surface transition hover:bg-foreground/10"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-muted/80 p-3 text-[11px] text-foreground/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground/70">Streaming</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={streamMode}
              onChange={(event) => {
                setStreamMode(event.target.checked);
                setInfoMessage(null);
              }}
            />
            <span className="h-4 w-8 rounded-full bg-foreground/20 after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition peer-checked:bg-[rgba(var(--accent),0.6)] peer-checked:after:translate-x-4"></span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground/70">Language</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as "vi" | "en")}
            className="rounded-xl border border-foreground/15 bg-surface px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.4)]"
          >
            <option value="vi">Vietnamese</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          className="text-[11px] font-semibold text-[rgba(var(--accent),0.9)] underline-offset-2 hover:underline"
          disabled={!messages.length}
        >
          Clear chat
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pr-1">
        {PRESET_FAQ.map((faq) => (
          <button
            key={faq.prompt}
            type="button"
            onClick={() => handleFaqClick(faq.prompt)}
            className="rounded-full border border-foreground/15 bg-surface px-3 py-1 text-xs font-medium text-foreground/70 transition hover:bg-[rgba(var(--accent),0.1)] hover:text-[rgba(var(--accent),1)]"
          >
            {faq.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {infoMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {infoMessage}
        </div>
      ) : null}

      <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto rounded-3xl border border-foreground/10 bg-surface px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-surface-muted/70 p-4 text-xs leading-relaxed text-foreground/60">
            Start the conversation with a quick prompt or ask anything about job descriptions, application status, interviews, or benefits.
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={cx(
                  "flex w-full items-end gap-3",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
                  {isUser ? "You" : "AI"}
                </div>
                <div
                  className={cx(
                    "flex max-w-[70%] flex-col gap-1 text-xs leading-relaxed",
                    isUser ? "items-end text-right" : "items-start text-left"
                  )}
                >
                  <div
                    className={cx(
                      "relative w-full rounded-3xl px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.16)]",
                      isUser
                        ? "rounded-br-xl bg-gradient-to-br from-[rgba(var(--accent),0.9)] to-[rgba(var(--accent),0.6)] text-white"
                        : "rounded-bl-xl bg-surface-muted/95 text-foreground"
                    )}
                  >
                    <span
                      className={cx(
                        "absolute bottom-0 h-3 w-3 translate-y-1 rounded-full",
                        isUser ? "right-3 bg-[rgba(var(--accent),0.6)]" : "left-3 bg-surface-muted/95"
                      )}
                    />
                    {message.content.split("\n").map((line, index) => (
                      <p key="${message.id}-${index}" className="whitespace-pre-wrap">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about roles, applications, interviews, or technical support..."
            rows={3}
            className="min-h-[96px] rounded-3xl border border-foreground/10 bg-surface/80 px-5 py-3 text-sm text-foreground placeholder:text-foreground/50 shadow-inner focus:border-[rgba(var(--accent),0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.4)]"
            disabled={isLoading}
          />
          <Button type="submit" size="lg" disabled={isLoading || !input.trim()} className="w-full rounded-full">
            {isLoading ? "Sending..." : streamMode ? "Send & stream" : "Send"}
          </Button>
        </div>
        <div className="text-xs text-foreground/55">
          Chats are stateless. Each request reuses up to four recent turns so the assistant can keep context.
        </div>
      </form>
    </Panel>
  );
}
