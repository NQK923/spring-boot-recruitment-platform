export type ChatRole = "user" | "assistant";

export type ChatPayloadMessage = {
  role: ChatRole;
  content: string;
};

export const CHAT_HISTORY_LIMIT = 4;

export function capHistory(history: ChatPayloadMessage[]): ChatPayloadMessage[] {
  if (history.length <= CHAT_HISTORY_LIMIT) {
    return history;
  }
  return history.slice(history.length - CHAT_HISTORY_LIMIT);
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
