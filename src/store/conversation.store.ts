import { create } from "zustand";
import { ChatListItem } from "@/types/chat.types";

type ConversationState = {
  conversations: ChatListItem[];
  activeConversationId: number | null;
  members: Record<number, Array<{ userid: number; username: string; displayname?: string; avatarurl?: string; isonline?: number }>>;

  setConversations: (list: ChatListItem[]) => void;
  setActiveConversation: (id: number | null) => void;

  /** Insert or update a single conversation in the list */
  upsertConversation: (item: ChatListItem) => void;

  /** Update last message preview for sidebar display */
  updateLastMessage: (
    conversationId: number,
    lastmessage: string,
    lastmessageat: string
  ) => void;

  /** Update conversation name in real-time */
  updateConversationName: (conversationId: number, chatname: string) => void;

  /** Add a member to a conversation in real-time */
  addMember: (conversationId: number, member: { userid: number; username: string }) => void;

  /** Remove a member from a conversation in real-time */
  removeMember: (conversationId: number, userId: number) => void;

  /** Set members for a conversation */
  setMembers: (conversationId: number, members: Array<{ userid: number; username: string; displayname?: string; avatarurl?: string; isonline?: number }>) => void;

  /** Remove from list after archive/leave */
  removeConversation: (conversationId: number) => void;
};

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  activeConversationId: null,
  members: {},

  setConversations: (list) => set({ conversations: list }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  upsertConversation: (item) =>
    set((state) => {
      const exists = state.conversations.find(
        (c) => c.conversationid === item.conversationid
      );
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c.conversationid === item.conversationid ? { ...c, ...item } : c
          ),
        };
      }
      return { conversations: [item, ...state.conversations] };
    }),

  updateLastMessage: (conversationId, lastmessage, lastmessageat) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationid === conversationId
          ? { ...c, lastmessage, lastmessageat }
          : c
      ),
    })),

  updateConversationName: (conversationId, chatname) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationid === conversationId
          ? { ...c, chatname }
          : c
      ),
    })),

  addMember: (conversationId, member) =>
    set((state) => {
      const existing = state.members[conversationId] ?? [];
      return {
        members: {
          ...state.members,
          [conversationId]: [...existing, member],
        },
      };
    }),

  removeMember: (conversationId, userId) =>
    set((state) => ({
      members: {
        ...state.members,
        [conversationId]: (state.members[conversationId] ?? []).filter(
          (m) => m.userid !== userId
        ),
      },
    })),

  setMembers: (conversationId, members) =>
    set((state) => ({
      members: {
        ...state.members,
        [conversationId]: members,
      },
    })),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => c.conversationid !== conversationId
      ),
      members: Object.fromEntries(
        Object.entries(state.members).filter(
          ([key]) => Number(key) !== conversationId
        )
      ),
    })),
}));
