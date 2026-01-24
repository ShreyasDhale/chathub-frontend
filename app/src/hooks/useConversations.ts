// hooks/useConversation.ts
import { useEffect, useRef, useState } from "react";
import { getSignalRConnection } from "../services/socket/signalrClient";
import { joinConversation, leaveConversation } from "../services/socket/chat.actions";

export function useConversation(activeChatId: number | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const previousChatId = useRef<number | null>(null);
  const connection = getSignalRConnection();

  // Join / leave logic
  useEffect(() => {
    if (!activeChatId) return;

    if (previousChatId.current) {
      leaveConversation(previousChatId.current);
    }

    joinConversation(activeChatId);
    previousChatId.current = activeChatId;

    return () => {
      leaveConversation(activeChatId);
    };
  }, [activeChatId]);

  // Message listener
  useEffect(() => {
    if (!connection) return;

    const handler = (data: any) => {
      setMessages(prev => [...prev, data]);
    };

    connection.on("MessageReceived", handler);
    return () => connection.off("MessageReceived", handler);
  }, [connection]);

  function sendMessage(message: string) {
    if (!message.trim() || !activeChatId) return;
    if (!connection) return;
    connection.invoke("SendMessage", activeChatId, Date.now(), message);
  }

  return { messages, sendMessage };
}
