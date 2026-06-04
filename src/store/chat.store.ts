import { create } from "zustand";
import { MessagePayload, User } from "@/types/chat.types";

type ChatState = {
  /** All messages keyed by conversationId — never cleared on tab switch */
  messagesByConversation: Record<number, MessagePayload[]>;
  /** Per-conversation: set of userIds currently typing */
  typingByConversation: Record<number, Set<number>>;
  /** Online presence list */
  onlineUsers: User[];
  /** Hub connection status */
  isConnected: boolean;
  /** Unread count per conversation */
  unreadByConversation: Record<number, number>;

  // ── Message actions ──────────────────────────────────────────────────────
  /** Append a single new message (from SignalR or optimistic) */
  addMessage: (msg: MessagePayload) => void;
  /** Bulk-set messages for a conversation (initial REST load) */
  setMessages: (conversationId: number, msgs: MessagePayload[]) => void;
  /** Prepend older messages for infinite scroll */
  prependMessages: (conversationId: number, msgs: MessagePayload[]) => void;
  /** Update content after server confirms edit */
  editMessage: (conversationId: number, messageId: number, content: string) => void;
  /** Soft-delete a message bubble */
  deleteMessage: (conversationId: number, messageId: number) => void;

  // ── Typing ───────────────────────────────────────────────────────────────
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;

  // ── Presence & connection ────────────────────────────────────────────────
  setOnlineUsers: (users: User[]) => void;
  setConnectionStatus: (status: boolean) => void;

  // ── Unread ───────────────────────────────────────────────────────────────
  incrementUnread: (conversationId: number) => void;
  markConversationRead: (conversationId: number) => void;

  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messagesByConversation: {},
  typingByConversation: {},
  onlineUsers: [],
  isConnected: false,
  unreadByConversation: {},

  addMessage: (msg) =>
    set((state) => {
      const prev = state.messagesByConversation[msg.conversationId] ?? [];
      // Replace optimistic message if clientMessageId matches
      const idx = msg.clientMessageId
        ? prev.findIndex(
            (m) =>
              m.isOptimistic && m.clientMessageId === msg.clientMessageId
          )
        : -1;
      const updated =
        idx >= 0
          ? prev.map((m, i) => (i === idx ? { ...msg, isOptimistic: false } : m))
          : [...prev, msg];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [msg.conversationId]: updated,
        },
      };
    }),

  setMessages: (conversationId, msgs) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: msgs,
      },
    })),

  prependMessages: (conversationId, msgs) =>
    set((state) => {
      const prev = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...msgs, ...prev],
        },
      };
    }),

  editMessage: (conversationId, messageId, content) =>
    set((state) => {
      const prev = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: prev.map((m) =>
            m.messageId === messageId
              ? { ...m, message: content, isEdited: true }
              : m
          ),
        },
      };
    }),

  deleteMessage: (conversationId, messageId) =>
    set((state) => {
      const prev = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: prev.map((m) =>
            m.messageId === messageId ? { ...m, isDeleted: true } : m
          ),
        },
      };
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = new Set(
        state.typingByConversation[conversationId] ?? []
      );
      if (isTyping) current.add(userId);
      else current.delete(userId);
      return {
        typingByConversation: {
          ...state.typingByConversation,
          [conversationId]: current,
        },
      };
    }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setConnectionStatus: (status) => set({ isConnected: status }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]: (state.unreadByConversation[conversationId] ?? 0) + 1,
      },
    })),

  markConversationRead: (conversationId) =>
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]: 0,
      },
    })),

  reset: () =>
    set({
      messagesByConversation: {},
      typingByConversation: {},
      onlineUsers: [],
      isConnected: false,
      unreadByConversation: {},
    }),
}));
