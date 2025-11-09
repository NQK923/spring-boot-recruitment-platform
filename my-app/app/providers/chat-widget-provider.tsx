"use client";

import React, { Dispatch, createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ChatMessage } from "@/lib/chat";

export type ChatStatus = "idle" | "loading" | "streaming" | "error";

const CHAT_HISTORY_STORAGE_KEY = "candidate-chat-history";
const CHAT_LANGUAGE_STORAGE_KEY = "candidate-chat-lang";
const CHAT_STREAM_PREF_STORAGE_KEY = "candidate-chat-streaming";

type ChatWidgetState = {
  isOpen: boolean;
  hasUnread: boolean;
  language: "vi" | "en";
  status: ChatStatus;
  error: string | null;
  info: string | null;
  messages: ChatMessage[];
  isStreamingPreferred: boolean;
  storageHydrated: boolean;
};

type HydratePayload = Partial<Pick<ChatWidgetState, "language" | "messages" | "isStreamingPreferred">>;

type ChatWidgetAction =
  | { type: "HYDRATE"; payload: HydratePayload }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "SET_LANGUAGE"; language: "vi" | "en" }
  | { type: "SET_MESSAGES"; messages: ChatMessage[] }
  | { type: "APPEND_MESSAGE"; message: ChatMessage }
  | { type: "UPDATE_MESSAGE"; id: string; content: string }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_STATUS"; status: ChatStatus }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_INFO"; info: string | null }
  | { type: "SET_STREAM_PREF"; isStreamingPreferred: boolean }
  | { type: "MARK_UNREAD"; hasUnread: boolean };

const initialState: ChatWidgetState = {
  isOpen: false,
  hasUnread: false,
  language: "vi",
  status: "idle",
  error: null,
  info: null,
  messages: [],
  isStreamingPreferred: true,
  storageHydrated: false,
};

function reducer(state: ChatWidgetState, action: ChatWidgetAction): ChatWidgetState {
  switch (action.type) {
    case "HYDRATE": {
      return {
        ...state,
        ...action.payload,
        storageHydrated: true,
      };
    }
    case "OPEN": {
      if (state.isOpen) {
        return state;
      }
      return { ...state, isOpen: true, hasUnread: false };
    }
    case "CLOSE": {
      if (!state.isOpen) {
        return state;
      }
      return { ...state, isOpen: false };
    }
    case "TOGGLE": {
      if (state.isOpen) {
        return { ...state, isOpen: false };
      }
      return { ...state, isOpen: true, hasUnread: false };
    }
    case "SET_LANGUAGE": {
      return { ...state, language: action.language };
    }
    case "SET_MESSAGES": {
      return { ...state, messages: action.messages };
    }
    case "APPEND_MESSAGE": {
      const shouldMarkUnread = !state.isOpen && action.message.role === "assistant";
      return {
        ...state,
        messages: [...state.messages, action.message],
        hasUnread: state.hasUnread || shouldMarkUnread,
      };
    }
    case "UPDATE_MESSAGE": {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.id ? { ...msg, content: action.content } : msg
        ),
      };
    }
    case "CLEAR_MESSAGES": {
      return { ...state, messages: [], hasUnread: false };
    }
    case "SET_STATUS": {
      return { ...state, status: action.status };
    }
    case "SET_ERROR": {
      return { ...state, error: action.error };
    }
    case "SET_INFO": {
      return { ...state, info: action.info };
    }
    case "SET_STREAM_PREF": {
      return { ...state, isStreamingPreferred: action.isStreamingPreferred };
    }
    case "MARK_UNREAD": {
      return { ...state, hasUnread: action.hasUnread };
    }
    default:
      return state;
  }
}

type ChatWidgetStoreValue = {
  state: ChatWidgetState;
  dispatch: Dispatch<ChatWidgetAction>;
  storageHydrated: boolean;
  storageKeys: {
    messages: string;
    language: string;
    streaming: string;
  };
};

const ChatWidgetContext = createContext<ChatWidgetStoreValue | null>(null);

export function ChatWidgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hydratedRef.current) {
      return;
    }

    const payload: HydratePayload = {};

    const storedLanguage = window.localStorage.getItem(CHAT_LANGUAGE_STORAGE_KEY);
    if (storedLanguage === "vi" || storedLanguage === "en") {
      payload.language = storedLanguage;
    }

    const storedStreamingPref = window.localStorage.getItem(CHAT_STREAM_PREF_STORAGE_KEY);
    if (storedStreamingPref === "0") {
      payload.isStreamingPreferred = false;
    } else if (storedStreamingPref === "1") {
      payload.isStreamingPreferred = true;
    }

    const storedMessages = window.sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages) as ChatMessage[];
        if (Array.isArray(parsed)) {
          payload.messages = parsed.filter(
            (msg): msg is ChatMessage =>
              typeof msg === "object" &&
              msg !== null &&
              (msg.role === "user" || msg.role === "assistant") &&
              typeof (msg as { content?: unknown }).content === "string" &&
              typeof (msg as { createdAt?: unknown }).createdAt === "number"
          );
        }
      } catch {
        window.sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      }
    }

    dispatch({ type: "HYDRATE", payload });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !state.storageHydrated) {
      return;
    }
    window.sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(state.messages));
  }, [state.messages, state.storageHydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !state.storageHydrated) {
      return;
    }
    window.localStorage.setItem(CHAT_LANGUAGE_STORAGE_KEY, state.language);
  }, [state.language, state.storageHydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !state.storageHydrated) {
      return;
    }
    window.localStorage.setItem(CHAT_STREAM_PREF_STORAGE_KEY, state.isStreamingPreferred ? "1" : "0");
  }, [state.isStreamingPreferred, state.storageHydrated]);

  const value = useMemo<ChatWidgetStoreValue>(
    () => ({
      state,
      dispatch,
      storageHydrated: state.storageHydrated,
      storageKeys: {
        messages: CHAT_HISTORY_STORAGE_KEY,
        language: CHAT_LANGUAGE_STORAGE_KEY,
        streaming: CHAT_STREAM_PREF_STORAGE_KEY,
      },
    }),
    [state]
  );

  return <ChatWidgetContext.Provider value={value}>{children}</ChatWidgetContext.Provider>;
}

export function useChatWidgetStore() {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error("useChatWidgetStore must be used within ChatWidgetProvider");
  }
  return context;
}
