import { useEffect, useRef, useCallback } from "react";
import {
  joinConversation,
  leaveConversation,
} from "@/services/socket/chat.actions";
import { useConversationStore } from "@/store/conversation.store";
import { useChatStore } from "@/store/chat.store";
import { loadchats } from "@/services/api/dashboard.api";
import { ChatListItem } from "@/types/chat.types";

/** Backend may return DataTable as array OR `{ Rows: [...] }`. */
function extractRows<T>(model: unknown): T[] {
  if (Array.isArray(model)) return model as T[];
  if (model && typeof model === "object") {
    const obj = model as { Rows?: T[]; rows?: T[] };
    if (Array.isArray(obj.Rows)) return obj.Rows;
    if (Array.isArray(obj.rows)) return obj.rows;
  }
  return [];
}

export function useConversations() {
  const {
    conversations,
    setConversations,
    setActiveConversation,
    activeConversationId,
  } = useConversationStore();
  const setUnread = useChatStore((s) => s.setUnread);
  const setActiveInChat = useChatStore((s) => s.setActiveConversation);
  const previousIdRef = useRef<number | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await loadchats();
      const rows = extractRows<ChatListItem>(res.Model);
      // Normalize lastmessage field — backend returns lastmessagepreview.
      const normalized: ChatListItem[] = rows.map((c) => ({
        ...c,
        lastmessage:
          (c as ChatListItem & { lastmessagepreview?: string })
            .lastmessagepreview ?? c.lastmessage,
      }));
      setConversations(normalized);
      // Hydrate the unread store from the backend snapshot.
      for (const c of normalized) {
        setUnread(c.conversationid, c.unreadcount ?? 0);
      }
    } catch {
      // silently fail
    }
  }, [setConversations, setUnread]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Keep chat-store in sync with the active conversation id (used by socket
  // handlers to decide whether to bump unread).
  useEffect(() => {
    setActiveInChat(activeConversationId);
  }, [activeConversationId, setActiveInChat]);

  // Join/leave SignalR groups when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const prev = previousIdRef.current;
    if (prev && prev !== activeConversationId) {
      leaveConversation(prev);
    }
    joinConversation(activeConversationId);
    previousIdRef.current = activeConversationId;

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId]);

  return {
    conversations,
    activeConversationId,
    setActiveConversation,
    fetchConversations,
  };
}
