"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadchats } from "../../services/api/dashboard.api";
import { logout } from "../../services/api/auth.api";
import { clearToken } from "../../utils/auth.storage";
import { joinConversation, leaveConversation } from "../../services/socket/chat.actions";
import { getSignalRConnection } from "../../services/socket/signalrClient";
import { ChatListItem } from "../../types/chat.types";

import ChatList from "../../components/ui/ChatList";
import ChatHeader from "../../components/ui/ChatHeadder";
import ChatBody from "../../components/ui/ChatBody";
import ChatInput from "../../components/ui/ChatInput";

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const previousChatId = useRef<number | null>(null);
  const connection = getSignalRConnection();

  /* ------------------ Load chats ------------------ */
  useEffect(() => {
    fetchChats();
  }, []);


  /* ---------------- Join / Leave conversation ---------------- */
  useEffect(() => {
    if (!activeChatId) return;
    const prev = previousChatId.current;
    if (prev) leaveConversation(prev);
    joinConversation(activeChatId);
    previousChatId.current = activeChatId;
    return () => {
      leaveConversation(activeChatId);
    };
  }, [activeChatId]);


  /* ---------------- Message listener ---------------- */
  useEffect(() => {
    if (!connection) return;

    const handler = (data: any) => {
      console.log("Message received:", data);
      setMessages(prev => [...prev, data]);
    };

    connection.on("MessageReceived", handler);
    return () => connection.off("MessageReceived", handler);
  }, [connection]);

  /* ---------------- Actions ---------------- */
  function sendMessage(message: string) {
    if (!message.trim() || !activeChatId) return;
    if (!connection) return;
    connection.invoke("SendMessage", activeChatId, Date.now(), message);
  }

  async function fetchChats() {
    try {
      setLoading(true);
      const res = await loadchats();
      setChats(res.Model ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setShowMenu(false);
    await logout();
    clearToken();
    router.replace("/login");
  }

  const activeChat = chats.find(c => c.conversationid === activeChatId);

  return (
    <div className="dashboard">
      <ChatList
        chats={chats}
        loading={loading}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onLogout={handleLogout}
        showMenu={showMenu}
        toggleMenu={() => setShowMenu(v => !v)}
      />

      <main className="chat-area">
        {activeChat ? (
          <>
            <ChatHeader chat={activeChat} />
            <ChatBody messages={messages} activeChatId={activeChatId ?? 0} />
            <ChatInput onSend={sendMessage} />
          </>
        ) : (
          <div className="chat-placeholder">Select a chat to start messaging</div>
        )}
      </main>
    </div>
  );
}
