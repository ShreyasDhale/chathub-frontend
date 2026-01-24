// hooks/useChats.ts
import { useEffect, useState } from "react";
import { ChatListItem } from "../types/chat.types";
import { loadchats } from "../services/api/dashboard.api";

export function useChats() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);

  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    try {
      setLoading(true);
      const res = await loadchats();
      setChats(res.Model ?? []);
    } finally {
      setLoading(false);
    }
  }

  return { chats, loading };
}
