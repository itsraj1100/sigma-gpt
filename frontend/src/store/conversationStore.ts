import { create } from "zustand";
import { conversationsApi } from "../api/conversations";
import { messagesApi } from "../api/messages";
import { streamChat } from "../api/ai";
import { extractErrorMessage } from "../api/client";
import { Conversation, Message } from "../types";

function makeDraftMessage(id: string, conversationId: string): Message {
  const now = new Date().toISOString();
  return { id, conversationId, role: "assistant", content: "", createdAt: now, updatedAt: now };
}

function makeUserMessage(content: string, conversationId: string): Message {
  const now = new Date().toISOString();
  return {
    id: `temp-user-${Date.now()}`,
    conversationId,
    role: "user",
    content,
    createdAt: now,
    updatedAt: now,
  };
}

interface ConversationState {
  conversations: Conversation[];
  isLoadingConversations: boolean;

  currentConversationId: string | null;
  messages: Message[];
  isLoadingMessages: boolean;

  isStreaming: boolean;
  streamError: string | null;
  abortController: AbortController | null;

  searchQuery: string;
  searchResults: Conversation[] | null;
  isSearching: boolean;

  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  newChat: () => void;

  sendMessage: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  stopGenerating: () => void;

  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  dismissStreamError: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => {
  /** Appends a text delta to the message currently being streamed. */
  function appendDelta(draftId: string, delta: string) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === draftId ? { ...m, content: m.content + delta } : m
      ),
    }));
  }

  function finishStreaming() {
    set({ isStreaming: false, abortController: null });
    get().loadConversations();
  }

  function failStreaming(message: string) {
    set({ isStreaming: false, abortController: null, streamError: message });
  }

  return {
    conversations: [],
    isLoadingConversations: false,

    currentConversationId: null,
    messages: [],
    isLoadingMessages: false,

    isStreaming: false,
    streamError: null,
    abortController: null,

    searchQuery: "",
    searchResults: null,
    isSearching: false,

    loadConversations: async () => {
      set({ isLoadingConversations: true });
      try {
        const conversations = await conversationsApi.list();
        set({ conversations, isLoadingConversations: false });
      } catch {
        set({ isLoadingConversations: false });
      }
    },

    openConversation: async (id: string) => {
      get().abortController?.abort();
      set({
        currentConversationId: id,
        messages: [],
        isLoadingMessages: true,
        streamError: null,
        isStreaming: false,
        abortController: null,
      });
      try {
        const messages = await messagesApi.list(id);
        set({ messages, isLoadingMessages: false });
      } catch (err) {
        set({ isLoadingMessages: false, streamError: extractErrorMessage(err) });
      }
    },

    newChat: () => {
      get().abortController?.abort();
      set({
        currentConversationId: null,
        messages: [],
        isStreaming: false,
        abortController: null,
        streamError: null,
      });
    },

    sendMessage: async (content: string) => {
      set({ streamError: null });
      let conversationId = get().currentConversationId;

      if (!conversationId) {
        try {
          const conversation = await conversationsApi.create();
          conversationId = conversation.id;
          set((s) => ({
            currentConversationId: conversationId,
            conversations: [conversation, ...s.conversations],
          }));
        } catch (err) {
          set({ streamError: extractErrorMessage(err) });
          return;
        }
      }

      const draftId = `temp-assistant-${Date.now()}`;
      set((s) => ({
        messages: [
          ...s.messages,
          makeUserMessage(content, conversationId as string),
          makeDraftMessage(draftId, conversationId as string),
        ],
        isStreaming: true,
      }));

      const controller = new AbortController();
      set({ abortController: controller });

      await streamChat(
        conversationId,
        { content },
        {
          onDelta: (delta) => appendDelta(draftId, delta),
          onDone: () => finishStreaming(),
          onError: (message) => failStreaming(message),
        },
        controller.signal
      );
    },

    regenerate: async () => {
      const conversationId = get().currentConversationId;
      if (!conversationId || get().isStreaming) return;

      const draftId = `temp-assistant-${Date.now()}`;
      set((s) => {
        const trimmed = [...s.messages];
        while (trimmed.length && trimmed[trimmed.length - 1].role === "assistant") {
          trimmed.pop();
        }
        return {
          messages: [...trimmed, makeDraftMessage(draftId, conversationId)],
          isStreaming: true,
          streamError: null,
        };
      });

      const controller = new AbortController();
      set({ abortController: controller });

      await streamChat(
        conversationId,
        { regenerate: true },
        {
          onDelta: (delta) => appendDelta(draftId, delta),
          onDone: () => finishStreaming(),
          onError: (message) => failStreaming(message),
        },
        controller.signal
      );
    },

    editMessage: async (messageId: string, newContent: string) => {
      const conversationId = get().currentConversationId;
      if (!conversationId || get().isStreaming) return;

      const draftId = `temp-assistant-${Date.now()}`;
      set((s) => {
        const idx = s.messages.findIndex((m) => m.id === messageId);
        if (idx === -1) return s;
        const kept = s.messages.slice(0, idx);
        const edited = { ...s.messages[idx], content: newContent };
        return {
          messages: [...kept, edited, makeDraftMessage(draftId, conversationId)],
          isStreaming: true,
          streamError: null,
        };
      });

      const controller = new AbortController();
      set({ abortController: controller });

      await streamChat(
        conversationId,
        { content: newContent, editMessageId: messageId },
        {
          onDelta: (delta) => appendDelta(draftId, delta),
          onDone: () => finishStreaming(),
          onError: (message) => failStreaming(message),
        },
        controller.signal
      );
    },

    stopGenerating: () => {
      get().abortController?.abort();
      set({ isStreaming: false, abortController: null });
    },

    renameConversation: async (id: string, title: string) => {
      const previous = get().conversations;
      set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
      }));
      try {
        await conversationsApi.rename(id, title);
      } catch (err) {
        set({ conversations: previous, streamError: extractErrorMessage(err) });
      }
    },

    deleteConversation: async (id: string) => {
      const previous = get().conversations;
      set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) }));
      try {
        await conversationsApi.remove(id);
        if (get().currentConversationId === id) get().newChat();
      } catch (err) {
        set({ conversations: previous, streamError: extractErrorMessage(err) });
      }
    },

    search: async (query: string) => {
      set({ searchQuery: query });
      if (!query.trim()) {
        set({ searchResults: null, isSearching: false });
        return;
      }
      set({ isSearching: true });
      try {
        const results = await conversationsApi.search(query.trim());
        set({ searchResults: results, isSearching: false });
      } catch {
        set({ searchResults: [], isSearching: false });
      }
    },

    clearSearch: () => set({ searchQuery: "", searchResults: null }),

    dismissStreamError: () => set({ streamError: null }),
  };
});
