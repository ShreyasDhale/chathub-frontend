import { useEffect, useRef } from "react";
import {
  joinConversation,
  leaveConversation,
} from "@/services/socket/chat.actions";
import { useConversationStore } from "@/store/conversation.store";
import { loadchats } from "@/services/api/dashboard.api";

export function useConversations() {
  const { conversations, setConversations, setActiveConversation, activeConversationId } =
    useConversationStore();
  const previousIdRef = useRef<number | null>(null);

  async function fetchConversations() {
    try {
      const res = await loadchats();
      setConversations(res.Model ?? []);
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return { conversations, activeConversationId, setActiveConversation, fetchConversations };
}
