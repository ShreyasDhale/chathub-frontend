"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadchats } from "@/services/api/dashboard.api";
import { logout } from "@/services/api/auth.api";
import { clearToken } from "@/utils/auth.storage";
import {
  joinConversation,
  leaveConversation,
} from "@/services/socket/chat.actions";
import { getSignalRConnection } from "@/services/socket/signalrClient";
import { ChatListItem } from "@/types/chat.types";

import ChatList from "@/components/ui/ChatList";
import ChatHeader from "@/components/ui/ChatHeader";
import ChatBody from "@/components/ui/ChatBody";
import ChatInput from "@/components/ui/ChatInput";
import NewChatModal from "@/components/ui/NewChatModal";

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const previousChatId = useRef<number | null>(null);
  const connection = getSignalRConnection();

  useEffect(() => {
    fetchChats();
  }, []);

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

  useEffect(() => {
    if (!connection) return;

    const handler = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    connection.on("MessageReceived", handler);
    return () => {
      connection.off("MessageReceived", handler);
    };
  }, [connection]);

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

  function onNewChat() {
    setShowMenu(false);
    setShowNewChatModal(true);
  }

  async function handleChatCreated() {
    setShowNewChatModal(false);
    setMessages([]);
    setActiveChatId(null);
    await fetchChats();
    router.refresh();
  }

  async function handleLogout() {
    setShowMenu(false);
    await logout();
    clearToken();
    router.replace("/login");
  }

  const activeChat = chats.find((c) => c.conversationid === activeChatId);

  return (
    <div className={`dashboard ${activeChatId ? "dashboard--chat-open" : ""}`}>
      <div className="dashboard-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <ChatList
        chats={chats}
        loading={loading}
        activeChatId={activeChatId}
        onSelect={(id) => {
          setMessages([]);
          setActiveChatId(id);
        }}
        onLogout={handleLogout}
        showMenu={showMenu}
        onNewChat={onNewChat}
        toggleMenu={() => setShowMenu((v) => !v)}
        onCloseMenu={() => setShowMenu(false)}
      />

      <NewChatModal
        open={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSuccess={handleChatCreated}
      />

      <main className="chat-area">
        {activeChat ? (
          <>
            <ChatHeader
              chat={activeChat}
              onBack={() => {
                setActiveChatId(null);
                setMessages([]);
              }}
            />
            <ChatBody messages={messages} activeChatId={activeChatId ?? 0} />
            <ChatInput onSend={sendMessage} />
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">💬</div>
            <span className="chat-placeholder-text">Select a chat to start messaging</span>
            <span className="chat-placeholder-hint">Or create a new chat from the menu</span>
          </div>
        )}
      </main>
    </div>
  );
}
