export type ChatRole = "user" | "assistant";

export type ChatPayloadMessage = {
  role: ChatRole;
  content: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export const CHAT_HISTORY_LIMIT = 4;

export function capHistory<T>(history: T[]): T[] {
  if (history.length <= CHAT_HISTORY_LIMIT) {
    return history;
  }
  return history.slice(history.length - CHAT_HISTORY_LIMIT);
}

export function toPayloadMessages(messages: { role: ChatRole; content: string }[]): ChatPayloadMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

export function encodeContextPayload(history: ChatPayloadMessage[]): string | null {
  if (!history.length) {
    return null;
  }
  const json = JSON.stringify(
    history.map((message) => ({
      role: message.role,
      content: message.content,
    }))
  );

  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64");
  }

  try {
    return window.btoa(unescape(encodeURIComponent(json)));
  } catch {
    return window.btoa(json);
  }
}

export function buildPayloadFromHistory(messages: Array<{ role: ChatRole; content: string }>) {
  const payloadMessages = capHistory(toPayloadMessages(messages));
  const contextHeader = encodeContextPayload(payloadMessages);
  return {
    payloadMessages,
    contextHeader,
  };
}

export function generateMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
