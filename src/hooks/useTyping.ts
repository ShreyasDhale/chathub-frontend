import { useEffect, useRef } from "react";
import { typingStarted, typingStopped } from "@/services/socket/chat.actions";
import { useChatStore } from "@/store/chat.store";

const TYPING_DEBOUNCE_MS = 2000;

export function useTyping(conversationId: number | null) {
  const isTypingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onKeyDown() {
    if (!conversationId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      typingStarted(conversationId);
    }
    // Reset debounce on each keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
      typingStopped(conversationId);
    }, TYPING_DEBOUNCE_MS);
  }

  function onBlur() {
    if (!conversationId) return;
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      typingStopped(conversationId);
    }
  }

  // Cleanup on conversation change
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [conversationId]);

  return { onKeyDown, onBlur };
}

/** Returns display names of users currently typing in a conversation */
export function useTypingDisplay(
  conversationId: number | null,
  currentUserId: number | null,
  members: Record<number, string> = {}
): string {
  const typingSet = useChatStore(
    (s) =>
      conversationId
        ? s.typingByConversation[conversationId] ?? new Set<number>()
        : new Set<number>()
  );

  const others = [...typingSet].filter((uid) => uid !== currentUserId);
  if (others.length === 0) return "";
  if (others.length === 1) {
    const name = members[others[0]] ?? "Someone";
    return `${name} is typing…`;
  }
  return "Several people are typing…";
}
