import { create } from "zustand";
import { MessagePayload, User } from "@/types/chat.types";

type Presence = {
  userId: number;
  isOnline: boolean;
  lastSeenAt?: string;
};

type ChatState = {
  /** All messages keyed by conversationId — never cleared on tab switch */
  messagesByConversation: Record<number, MessagePayload[]>;
  /** Per-conversation: set of userIds currently typing */
  typingByConversation: Record<number, Set<number>>;
  /** Online presence list (legacy bulk push) */
  onlineUsers: User[];
  /** userId -> presence info (per-user). Used for ✓ online dot, "last seen". */
  presenceByUser: Record<number, Presence>;
  /** Hub connection status */
  isConnected: boolean;
  /** Unread count per conversation (kept in sync with backend f_get_conversations_by_user) */
  unreadByConversation: Record<number, number>;
  /** Per-conversation per-user lastReadMessageId for ✓✓ receipts. */
  readReceiptsByConversation: Record<number, Record<number, number>>;
  /** Currently focused conversation (used so background messages bump unread) */
  activeConversationId: number | null;

  // ── Message actions ──────────────────────────────────────────────────────
  addMessage: (msg: MessagePayload) => void;
  setMessages: (conversationId: number, msgs: MessagePayload[]) => void;
  prependMessages: (conversationId: number, msgs: MessagePayload[]) => void;
  editMessage: (conversationId: number, messageId: number, content: string) => void;
  deleteMessage: (conversationId: number, messageId: number) => void;

  // ── Typing ───────────────────────────────────────────────────────────────
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;

  // ── Presence & connection ────────────────────────────────────────────────
  setOnlineUsers: (users: User[]) => void;
  setPresence: (userId: number, isOnline: boolean, lastSeenAt?: string) => void;
  setConnectionStatus: (status: boolean) => void;

  // ── Unread ───────────────────────────────────────────────────────────────
  setUnread: (conversationId: number, count: number) => void;
  incrementUnread: (conversationId: number) => void;
  markConversationRead: (conversationId: number) => void;

  // ── Read receipts ────────────────────────────────────────────────────────
  setReadReceipt: (conversationId: number, userId: number, lastReadMessageId: number) => void;

  // ── Active conversation ──────────────────────────────────────────────────
  setActiveConversation: (conversationId: number | null) => void;

  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messagesByConversation: {},
  typingByConversation: {},
  onlineUsers: [],
  presenceByUser: {},
  isConnected: false,
  unreadByConversation: {},
  readReceiptsByConversation: {},
  activeConversationId: null,

  addMessage: (msg) =>
    set((state) => {
      const prev = state.messagesByConversation[msg.conversationId] ?? [];
      let updated: MessagePayload[];
      // Prefer matching by clientMessageId (resolves optimistic placeholder)
      const optimisticIdx = msg.clientMessageId
        ? prev.findIndex(
            (m) => m.isOptimistic && m.clientMessageId === msg.clientMessageId
          )
        : -1;
      if (optimisticIdx >= 0) {
        updated = prev.map((m, i) =>
          i === optimisticIdx ? { ...msg, isOptimistic: false } : m
        );
      } else if (prev.some((m) => m.messageId === msg.messageId)) {
        // Already have this message (server echo after we added it). Skip dup.
        updated = prev;
      } else {
        updated = [...prev, msg];
      }
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
      // Filter out duplicates by messageId
      const existingIds = new Set(prev.map((m) => m.messageId));
      const filtered = msgs.filter((m) => !existingIds.has(m.messageId));
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...filtered, ...prev],
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

  setOnlineUsers: (users) =>
    set((state) => {
      const next = { ...state.presenceByUser };
      for (const u of users) {
        next[u.id] = { userId: u.id, isOnline: u.isOnline };
      }
      return { onlineUsers: users, presenceByUser: next };
    }),

  setPresence: (userId, isOnline, lastSeenAt) =>
    set((state) => ({
      presenceByUser: {
        ...state.presenceByUser,
        [userId]: { userId, isOnline, lastSeenAt },
      },
    })),

  setConnectionStatus: (status) => set({ isConnected: status }),

  setUnread: (conversationId, count) =>
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]: count,
      },
    })),

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

  setReadReceipt: (conversationId, userId, lastReadMessageId) =>
    set((state) => {
      const conv = state.readReceiptsByConversation[conversationId] ?? {};
      const current = conv[userId] ?? 0;
      if (lastReadMessageId <= current) return {};
      return {
        readReceiptsByConversation: {
          ...state.readReceiptsByConversation,
          [conversationId]: { ...conv, [userId]: lastReadMessageId },
        },
      };
    }),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  reset: () =>
    set({
      messagesByConversation: {},
      typingByConversation: {},
      onlineUsers: [],
      presenceByUser: {},
      isConnected: false,
      unreadByConversation: {},
      readReceiptsByConversation: {},
      activeConversationId: null,
    }),
}));
