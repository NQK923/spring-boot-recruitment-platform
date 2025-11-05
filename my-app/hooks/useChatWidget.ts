"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {type ChatStatus, useChatWidgetStore} from "@/app/providers/chat-widget-provider";
import {buildPayloadFromHistory, type ChatMessage, type ChatRole, generateMessageId,} from "@/lib/chat";

type SendMessageOptions = {
  stream?: boolean;
};

type StreamContext = {
  prompt: string;
  assistantId: string;
  contextHeader: string | null;
  language: "vi" | "en";
};

type NonStreamContext = {
  prompt: string;
  history: Array<{ role: ChatRole; content: string }>;
  language: "vi" | "en";
  assistantId: string;
};

const STREAM_ENDPOINT = "/api/chat/stream";
const MESSAGE_ENDPOINT = "/api/chat/message";
const RATE_LIMIT_MESSAGE = "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau.";
const STREAM_FALLBACK_MESSAGE =
  "Mình chưa lấy được phản hồi streaming. Bạn có thể thử lại ở chế độ thường nhé!";
const GENERIC_ERROR_MESSAGE = "Không thể gửi tin nhắn. Vui lòng thử lại.";

export function useChatWidget() {
  const { state, dispatch, storageHydrated } = useChatWidgetStore();
  const streamControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>(state.messages);
  const lastAttemptRef = useRef<{
    prompt: string;
    stream: boolean;
    assistantId: string;
    userId: string;
  } | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);

  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  const setStatus = useCallback(
    (status: ChatStatus) => {
      dispatch({ type: "SET_STATUS", status });
    },
    [dispatch]
  );

  const setError = useCallback(
    (message: string | null) => {
      dispatch({ type: "SET_ERROR", error: message });
    },
    [dispatch]
  );

  const setInfo = useCallback(
    (message: string | null) => {
      dispatch({ type: "SET_INFO", info: message });
    },
    [dispatch]
  );

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      messagesRef.current = [...messagesRef.current, message];
      dispatch({ type: "APPEND_MESSAGE", message });
    },
    [dispatch]
  );

  const updateMessageContent = useCallback(
    (id: string, updater: (previous: string) => string) => {
      const current = messagesRef.current.find((entry) => entry.id === id);
      const nextContent = updater(current?.content ?? "");
      messagesRef.current = messagesRef.current.map((entry) =>
        entry.id === id ? { ...entry, content: nextContent } : entry
      );
      dispatch({ type: "UPDATE_MESSAGE", id, content: nextContent });
    },
    [dispatch]
  );

  const createMessage = useCallback(
    (role: ChatRole, content: string): ChatMessage => ({
      id: generateMessageId(),
      role,
      content,
      createdAt: Date.now(),
    }),
    []
  );

  const handleRateLimit = useCallback(() => {
    setError(RATE_LIMIT_MESSAGE);
    setInfo(RATE_LIMIT_MESSAGE);
  }, [setError, setInfo]);

  const closeStream = useCallback(() => {
    streamControllerRef.current?.abort();
    streamControllerRef.current = null;
  }, []);

  const clear = useCallback(() => {
    closeStream();
    messagesRef.current = [];
    dispatch({ type: "CLEAR_MESSAGES" });
    setStatus("idle");
    setError(null);
    setInfo(null);
    lastAttemptRef.current = null;
    setRetryAvailable(false);
  }, [closeStream, dispatch, setError, setInfo, setStatus]);

  const open = useCallback(() => {
    dispatch({ type: "OPEN" });
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, [dispatch]);

  const toggle = useCallback(() => {
    dispatch({ type: "TOGGLE" });
  }, [dispatch]);

  const setLanguage = useCallback(
    (language: "vi" | "en") => {
      dispatch({ type: "SET_LANGUAGE", language });
    },
    [dispatch]
  );

  const setStreamingPreferred = useCallback(
    (value: boolean) => {
      dispatch({ type: "SET_STREAM_PREF", isStreamingPreferred: value });
    },
    [dispatch]
  );

  const getHistoryForUser = useCallback(
    (userId: string) => {
      const entries = messagesRef.current;
      const index = entries.findIndex((entry) => entry.id === userId);
      if (index === -1) {
        return { before: entries, userMessage: null };
      }
      return {
        before: entries.slice(0, index),
        userMessage: entries[index],
      };
    },
    []
  );

  const handleMetadata = useCallback((payload: string) => {
    try {
      const parsed = JSON.parse(payload) as { promptTokens?: number; responseTokens?: number };
      const promptTokens =
        typeof parsed.promptTokens === "number" ? parsed.promptTokens : undefined;
      const responseTokens =
        typeof parsed.responseTokens === "number" ? parsed.responseTokens : undefined;
      if (promptTokens !== undefined || responseTokens !== undefined) {
        console.info("[chat-widget] tokens", {
          ...(promptTokens !== undefined ? { promptTokens } : {}),
          ...(responseTokens !== undefined ? { responseTokens } : {}),
        });
      }
    } catch {
      // ignore malformed metadata payloads
    }
  }, []);

  const streamResponse = useCallback(
    async ({ prompt, assistantId, contextHeader, language }: StreamContext) => {
      closeStream();
      const controller = new AbortController();
      streamControllerRef.current = controller;
      setStatus("streaming");
      setError(null);

      try {
        const url = new URL(STREAM_ENDPOINT, window.location.origin);
        url.searchParams.set("q", prompt);
        url.searchParams.set("language", language);

        const headers: HeadersInit = { Accept: "text/event-stream" };
        if (contextHeader) {
          headers["X-Context"] = contextHeader;
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const body = await safeJson(response);
          const message = extractMessage(body) ?? STREAM_FALLBACK_MESSAGE;
          updateMessageContent(assistantId, () => message);
          if (response.status === 429) {
            handleRateLimit();
          } else {
            setError(message);
          }
          setStatus("error");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedContent = false;
        let shouldStop = false;

        const processEvent = (eventName: string, data: string) => {
          if (eventName === "chunk" || eventName === "message") {
            receivedContent = receivedContent || Boolean(data);
            if (data) {
              updateMessageContent(assistantId, (prev) => `${prev}${data}`);
            }
          } else if (eventName === "done") {
            if (data) {
              handleMetadata(data);
            }
            shouldStop = true;
          } else if (eventName === "metadata") {
            if (data) {
              handleMetadata(data);
            }
          } else if (eventName === "error") {
            const fallback = data || STREAM_FALLBACK_MESSAGE;
            updateMessageContent(assistantId, () => fallback);
            setError(fallback);
            shouldStop = true;
          }
        };

        while (!shouldStop) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          buffer = processSseBuffer(buffer, processEvent);
          if (shouldStop) {
            break;
          }
        }

        if (!shouldStop && buffer) {
          processSseBuffer(buffer, processEvent);
        }

        if (!receivedContent) {
          updateMessageContent(assistantId, () => STREAM_FALLBACK_MESSAGE);
        }

        lastAttemptRef.current = null;
        setRetryAvailable(false);
        setStatus("idle");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("[chat-widget] stream error", error);
        updateMessageContent(assistantId, () => STREAM_FALLBACK_MESSAGE);
        setError(STREAM_FALLBACK_MESSAGE);
        setStatus("error");
      } finally {
        streamControllerRef.current = null;
      }
    },
    [
      closeStream,
      handleMetadata,
      handleRateLimit,
      setError,
      setRetryAvailable,
      setStatus,
      updateMessageContent,
    ]
  );

  const sendMessageNonStream = useCallback(
    async ({history, language, assistantId }: NonStreamContext) => {
      setStatus("loading");
      updateMessageContent(assistantId, () => "");
      try {
        const { payloadMessages } = buildPayloadFromHistory(history);
        const response = await fetch(MESSAGE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            messages: payloadMessages,
            language,
            stream: false,
          }),
        });

        if (response.status === 429) {
          handleRateLimit();
          updateMessageContent(assistantId, () => RATE_LIMIT_MESSAGE);
          setStatus("error");
          return;
        }

        if (!response.ok) {
          const fallback = await safeJson(response);
          const message = extractMessage(fallback) ?? GENERIC_ERROR_MESSAGE;
          setError(message);
          updateMessageContent(assistantId, () => message);
          setStatus("error");
          return;
        }

        const payload = await response.json();
        const text = typeof payload?.text === "string" && payload.text.trim() ? payload.text.trim() : "";

        updateMessageContent(
          assistantId,
          () =>
            text ||
            "Tạm thời mình chưa có câu trả lời phù hợp. Bạn có thể thử hỏi lại sau nhé!"
        );

        if (payload?.metadata) {
          handleMetadata(JSON.stringify(payload.metadata));
        }

        lastAttemptRef.current = null;
        setRetryAvailable(false);
        setStatus("idle");
      } catch (error) {
        console.error("[chat-widget] send error", error);
        setError(GENERIC_ERROR_MESSAGE);
        updateMessageContent(assistantId, () => GENERIC_ERROR_MESSAGE);
        setStatus("error");
      }
    },
    [
      handleMetadata,
      handleRateLimit,
      setError,
      setRetryAvailable,
      setStatus,
      updateMessageContent,
    ]
  );

  const sendMessage = useCallback(
    async (rawText: string, options?: SendMessageOptions) => {
      const prompt = rawText.trim();
      if (!prompt) {
        return;
      }

      const historyBeforeUser: Array<{ role: ChatRole; content: string }> = messagesRef.current.map(({ role, content }) => ({
        role: role as ChatRole,
        content,
      }));
      const userMessage = createMessage("user", prompt);
      appendMessage(userMessage);
      setError(null);
      setInfo(null);

      const assistantMessage = createMessage("assistant", "");
      appendMessage(assistantMessage);

      const preferStream = options?.stream ?? state.isStreamingPreferred;
      lastAttemptRef.current = {
        prompt,
        stream: preferStream,
        assistantId: assistantMessage.id,
        userId: userMessage.id,
      };
      setRetryAvailable(true);

      if (preferStream) {
        const { contextHeader } = buildPayloadFromHistory(historyBeforeUser);
        await streamResponse({
          prompt,
          assistantId: assistantMessage.id,
          contextHeader,
          language: state.language,
        });
        return;
      }

      const historyForPost: Array<{ role: ChatRole; content: string }> = [
        ...historyBeforeUser,
        { role: "user", content: prompt },
      ];
      await sendMessageNonStream({
        prompt,
        history: historyForPost,
        language: state.language,
        assistantId: assistantMessage.id,
      });
    },
    [
      appendMessage,
      createMessage,
      sendMessageNonStream,
      setRetryAvailable,
      setError,
      setInfo,
      state.isStreamingPreferred,
      state.language,
      streamResponse,
    ]
  );

  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  const retryLastAttempt = useCallback(async () => {
    const lastAttempt = lastAttemptRef.current;
    if (!lastAttempt) {
      return;
    }
    closeStream();
    const { before, userMessage } = getHistoryForUser(lastAttempt.userId);
    if (!userMessage) {
      setRetryAvailable(false);
      lastAttemptRef.current = null;
      return;
    }

    const historyBeforeUser: Array<{ role: ChatRole; content: string }> = before.map(({ role, content }) => ({
      role: role as ChatRole,
      content,
    }));
    updateMessageContent(lastAttempt.assistantId, () => "");
    setError(null);
    setInfo(null);

    if (lastAttempt.stream) {
      const { contextHeader } = buildPayloadFromHistory(historyBeforeUser);
      await streamResponse({
        prompt: userMessage.content,
        assistantId: lastAttempt.assistantId,
        contextHeader,
        language: state.language,
      });
      return;
    }

    const historyForPost: Array<{ role: ChatRole; content: string }> = [
      ...historyBeforeUser,
      { role: "user", content: userMessage.content },
    ];
    await sendMessageNonStream({
      prompt: userMessage.content,
      history: historyForPost,
      language: state.language,
      assistantId: lastAttempt.assistantId,
    });
  }, [
    closeStream,
    getHistoryForUser,
    sendMessageNonStream,
    setError,
    setInfo,
    state.language,
    streamResponse,
    updateMessageContent,
  ]);

  return useMemo(
      () => ({
          ...state,
          storageHydrated,
          open,
          close,
          toggle,
          clear,
          setLanguage,
          setStreamingPreferred,
          sendMessage,
          sendMessageNonStream,
          appendMessage,
          retryAvailable,
          retryLastAttempt,
      }),
      [
          appendMessage,
          clear,
          close,
          open,
          sendMessage,
          sendMessageNonStream,
          setLanguage,
          setStreamingPreferred,
          state,
          storageHydrated,
          toggle,
          retryAvailable,
          retryLastAttempt,
      ]
  );
}

function processSseBuffer(
  buffer: string,
  handler: (eventName: string, data: string) => void
): string {
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

    for (const line of lines) {
      if (!line) {
        continue;
      }
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    handler(eventName, dataLines.join("\n"));
  }

  return remainder;
}

async function safeJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

function extractMessage(payload: unknown): string | null {
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
}
