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

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [streamMode, setStreamMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
      const response = await fetch("/api/candidate/chat/message", {
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

      const response = await fetch(`/api/candidate/chat/stream?${params.toString()}`, {
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
    <Panel variant="surface" padding="lg" className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Trợ lý ứng viên</h1>
          <p className="max-w-xl text-sm text-foreground/70">
            Trao đổi nhanh với trợ lý AI để hiểu rõ JD, quy trình tuyển dụng và những bước tiếp theo trong hành trình ứng tuyển.
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-foreground/70"
          title="Chat chỉ trả lời các câu hỏi liên quan đến tuyển dụng, hồ sơ và phỏng vấn."
        >
          Recruitment-only
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-foreground/20 bg-surface-muted/60 p-4 text-xs text-foreground/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(var(--accent),0.15)] text-[rgba(var(--accent),1)]">
            ⚡
          </span>
          <span>Streaming</span>
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
            <span className="h-5 w-9 rounded-full bg-foreground/20 after:absolute after:left-1 after:top-1 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition peer-checked:bg-[rgba(var(--accent),0.45)] peer-checked:after:translate-x-4"></span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground/70">Ngôn ngữ:</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as "vi" | "en")}
            className="rounded-lg border border-foreground/20 bg-transparent px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.35)]"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-foreground/60">
          <Button variant="ghost" size="sm" onClick={resetConversation} disabled={!messages.length}>
            Làm mới hội thoại
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_FAQ.map((faq) => (
          <button
            key={faq.prompt}
            type="button"
            onClick={() => handleFaqClick(faq.prompt)}
            className="rounded-full border border-foreground/15 bg-surface px-3 py-1 text-xs text-foreground/70 transition hover:border-[rgba(var(--accent),0.4)] hover:text-[rgba(var(--accent),1)]"
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

      <div
        ref={scrollRef}
        className="max-h-[480px] space-y-4 overflow-y-auto rounded-2xl border border-foreground/10 bg-surface/90 p-4"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-surface-muted/60 p-6 text-sm text-foreground/60">
            Bắt đầu hội thoại bằng cách chọn một câu hỏi gợi ý hoặc nhập thắc mắc của bạn về JD, trạng thái hồ sơ, phỏng vấn hay phúc lợi.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cx(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cx(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-[rgba(var(--accent),0.12)] text-[rgba(var(--accent),1)]"
                    : "bg-foreground/5 text-foreground"
                )}
              >
                {message.content.split("\n").map((line, index) => (
                  <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Đặt câu hỏi về JD, quy trình tuyển dụng, trạng thái hồ sơ hoặc hỗ trợ kỹ thuật..."
          rows={3}
          className="w-full rounded-2xl border border-foreground/15 bg-surface px-4 py-3 text-sm text-foreground shadow-sm focus:border-[rgba(var(--accent),0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.35)]"
          disabled={isLoading}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-foreground/50">
            Hệ thống không lưu hội thoại. Mỗi lần gửi, lịch sử 4 lượt gần nhất sẽ được truyền kèm để giữ ngữ cảnh.
          </p>
          <Button type="submit" size="lg" disabled={isLoading || !input.trim()}>
            {isLoading ? "Đang gửi..." : streamMode ? "Gửi & Stream" : "Gửi"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
