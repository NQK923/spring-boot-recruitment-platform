"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ChatStatus } from "@/app/providers/chat-widget-provider";
import type { ChatMessage } from "@/lib/chat";
import { cx } from "@/lib/cx";
import { TypingDots } from "@/components/candidate/TypingDots";

type MessageListProps = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  retryAvailable: boolean;
  retryAction: () => void;
  sendMessageAction: (text: string) => void | Promise<void>;
};

const QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  {
    label: "Quy trình tuyển dụng",
    prompt: "Quy trình tuyển dụng hiện tại gồm những vòng nào và mất bao lâu?",
  },
  {
    label: "Gợi ý việc làm",
    prompt: "Bạn có thể gợi ý vài vị trí đang tuyển phù hợp với kỹ năng và kinh nghiệm của mình không?",
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
  retryAction,
  sendMessageAction,
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
      className="h-full overflow-y-auto px-4 py-5"
      aria-live="polite"
      aria-label="Lịch sử trò chuyện với trợ lý tuyển dụng"
    >
      {showQuickPrompts ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <div className="max-w-xs space-y-2">
            <p className="text-lg font-bold text-slate-900">👋 Xin chào!</p>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Chọn nhanh một chủ đề bên dưới hoặc đặt câu hỏi riêng của bạn để bắt đầu đối thoại.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.prompt}
                type="button"
              onClick={() => sendMessageAction(item.prompt)}
                disabled={status === "loading" || status === "streaming"}
                className={cx(
                  "cursor-pointer rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-700 hover:shadow-md",
                  (status === "loading" || status === "streaming") && "opacity-50 cursor-not-allowed"
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
              <div className="max-w-[75%] rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 shadow-sm">
                <TypingDots />
              </div>
            </div>
          ) : null}
          {status === "error" && error ? (
            <p className="text-center text-sm font-semibold text-rose-600">❌ {translateSystemText(error)}</p>
          ) : null}
          {status === "error" && retryAvailable ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={retryAction}
                className="cursor-pointer rounded-xl border-2 border-blue-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-700 hover:shadow-md"
              >
                🔄 Thử lại
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
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white font-medium"
            : "border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 text-slate-800 font-medium"
        )}
      >
        <FormattedMessage content={content} />
      </div>
    </div>
  );
}

type ParsedBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; ordered: boolean; items: string[]; start?: number };

const INLINE_PATTERNS: Array<{ type: "strong" | "em" | "code"; regex: RegExp }> = [
  { type: "code", regex: /`([^`]+)`/ },
  { type: "strong", regex: /\*\*(.+?)\*\*/ },
  { type: "strong", regex: /__(.+?)__/ },
  { type: "em", regex: /\*(.+?)\*/ },
  { type: "em", regex: /_(.+?)_/ },
];
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;

function FormattedMessage({ content }: { content: string }) {
  const blocks = useMemo(() => parseMessageContent(content), [content]);

  if (!blocks.length) {
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return block.ordered ? (
            <ol
              key={`list-${index}`}
              className="list-inside list-decimal space-y-1 pl-4 marker:text-current"
              start={block.start ?? 1}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-item-${itemIndex}`} className="pl-1">
                  {renderInlineNodes(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          ) : (
            <ul key={`list-${index}`} className="list-inside list-disc space-y-1 pl-4 marker:text-current">
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-item-${itemIndex}`} className="pl-1">
                  {renderInlineNodes(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="whitespace-pre-wrap break-words">
            {renderInlineNodes(block.content, `paragraph-${index}`)}
          </p>
        );
      })}
    </div>
  );
}

function parseMessageContent(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = content.split(/\r?\n/);
  let currentList: { ordered: boolean; items: string[]; start?: number } | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }
    const text = paragraphBuffer.join("\n").trim();
    if (text) {
      blocks.push({ type: "paragraph", content: text });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!currentList) {
      return;
    }
    blocks.push({
      type: "list",
      ordered: currentList.ordered,
      items: currentList.items,
      start: currentList.start,
    });
    currentList = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [], start: Number(orderedMatch[1]) };
      } else if (currentList.items.length === 0) {
        currentList.start = Number(orderedMatch[1]);
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; url: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;

  while (remaining.length) {
    const match = findNextInlineMatch(remaining);
    if (!match) {
      tokens.push({ type: "text", value: remaining });
      break;
    }

    if (match.index > 0) {
      tokens.push({ type: "text", value: remaining.slice(0, match.index) });
    }

    if (match.type === "link") {
      tokens.push({
        type: "link",
        value: match.value,
        url: match.url ?? match.value,
      });
    } else if (match.type === "strong") {
      tokens.push({ type: "strong", value: match.value });
    } else if (match.type === "em") {
      tokens.push({ type: "em", value: match.value });
    } else {
      tokens.push({ type: "code", value: match.value });
    }
    remaining = remaining.slice(match.index + match.length);
  }

  return tokens;
}

type InlineMatch = {
  type: "strong" | "em" | "code" | "link";
  value: string;
  index: number;
  length: number;
  url?: string;
};

function findNextInlineMatch(text: string): InlineMatch | null {
  let bestMatch: InlineMatch | null = null;
  let bestPriority = Number.POSITIVE_INFINITY;

  const linkMatch = LINK_PATTERN.exec(text);
  if (linkMatch) {
    bestMatch = {
      type: "link",
      value: linkMatch[1],
      url: linkMatch[2],
      index: linkMatch.index,
      length: linkMatch[0].length,
    };
    bestPriority = -1;
  }

  INLINE_PATTERNS.forEach((pattern, priority) => {
    const match = pattern.regex.exec(text);
    if (!match) {
      return;
    }

    const candidate: InlineMatch = {
      type: pattern.type,
      value: match[1],
      index: match.index,
      length: match[0].length,
    };

    const isBetterIndex = !bestMatch || candidate.index < bestMatch.index;
    const isSameIndexWithHigherPriority =
      bestMatch && candidate.index === bestMatch.index && priority < bestPriority;

    if (isBetterIndex || isSameIndexWithHigherPriority) {
      bestMatch = candidate;
      bestPriority = priority;
    }
  });

  return bestMatch;
}

function renderInlineNodes(text: string, keyPrefix: string): ReactNode[] {
  return tokenizeInline(text).map((token, index) => {
    if (!token.value) {
      return null;
    }

    if (token.type === "text") {
      return token.value;
    }

    if (token.type === "strong") {
      return (
        <strong key={`${keyPrefix}-strong-${index}`} className="font-semibold">
          {token.value}
        </strong>
      );
    }

    if (token.type === "em") {
      return (
        <em key={`${keyPrefix}-em-${index}`} className="italic">
          {token.value}
        </em>
      );
    }

    if (token.type === "link" && token.url) {
      return (
        <a
          key={`${keyPrefix}-link-${index}`}
          href={token.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-indigo-600 underline decoration-indigo-400 decoration-2 underline-offset-2 hover:text-indigo-700"
        >
          {token.value}
        </a>
      );
    }

    return (
      <code
        key={`${keyPrefix}-code-${index}`}
        className="rounded bg-black/10 px-1 py-px font-mono text-[0.85em] text-current"
      >
        {token.value}
      </code>
    );
  });
}
