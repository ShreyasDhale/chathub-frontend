"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadchats } from "@/services/api/dashboard.api";
import { logout } from "@/services/api/auth.api";
import { clearToken } from "@/utils/auth.storage";
import {
  joinConversation,
  leaveConversation,
  typingStarted,
  typingStopped,
} from "@/services/socket/chat.actions";
import { getSignalRConnection } from "@/services/socket/signalrClient";
import { ChatListItem } from "@/types/chat.types";

import ChatList from "@/components/ui/ChatList";
import ChatHeader from "@/components/ui/ChatHeader";
import ChatBody from "@/components/ui/ChatBody";
import ChatInput from "@/components/ui/ChatInput";
import NewChatModal from "@/components/ui/NewChatModal";
import ConversationInfoModal from "@/components/ui/ConversationInfoModal";
import MembersModal from "@/components/ui/MembersModal";
import InChatSearchPanel from "@/components/ui/InChatSearchPanel";
import SettingsModal from "@/components/ui/SettingsModal";
import CallManager from "@/components/ui/CallManager";
import ChatIcon from "@/components/ui/ChatIcon";

/**
 * Main chat dashboard: sidebar list + active conversation panel + global modals.
 * Real-time messages arrive via SignalR "MessageReceived" after JoinConversation.
 */
export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  // Modal/panel visibility
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInChatSearch, setShowInChatSearch] = useState(false);

  const previousChatId = useRef<number | null>(null);
  const connection = getSignalRConnection();

  useEffect(() => {
    fetchChats();
  }, []);

  /** Join/leave SignalR groups when the user switches conversations. */
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

  /** Listen for inbound messages on the active hub connection. */
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

  /** Sends a text message through the SignalR hub. */
  function sendMessage(message: string) {
    if (!message.trim() || !activeChatId) return;
    if (!connection) return;
    connection.invoke("SendMessage", activeChatId, Date.now(), message);
  }

  function handleTypingChange(typing: boolean) {
    if (!activeChatId) return;
    if (typing) typingStarted(activeChatId);
    else typingStopped(activeChatId);
  }

  async function fetchChats() {
    try {
      setLoading(true);
      const res = await loadchats();
      const rows = res.Model as unknown;
      const list: ChatListItem[] = Array.isArray(rows)
        ? (rows as ChatListItem[])
        : (rows && typeof rows === "object"
            ? (((rows as { Rows?: ChatListItem[]; rows?: ChatListItem[] }).Rows ??
                ((rows as { rows?: ChatListItem[] }).rows ?? [])) as ChatListItem[])
            : []);
      setChats(list);
    } finally {
      setLoading(false);
    }
  }

  function onNewChat() {
    setShowMenu(false);
    setShowNewChatModal(true);
  }

  /** After StartChat succeeds: refresh list and return to conversation picker. */
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

  function handleChatRemoved(conversationId: number) {
    setChats((prev) => prev.filter((c) => c.conversationid !== conversationId));
    if (activeChatId === conversationId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }

  function handleChatUpdated(updated: ChatListItem) {
    setChats((prev) =>
      prev.map((c) =>
        c.conversationid === updated.conversationid ? { ...c, ...updated } : c
      )
    );
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
        onOpenSettings={() => {
          setShowMenu(false);
          setShowSettingsModal(true);
        }}
        onChatStarted={fetchChats}
        toggleMenu={() => setShowMenu((v) => !v)}
        onCloseMenu={() => setShowMenu(false)}
      />

      <NewChatModal
        open={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSuccess={handleChatCreated}
      />

      <ConversationInfoModal
        open={showInfoModal}
        chat={activeChat ?? null}
        onClose={() => setShowInfoModal(false)}
        onRenamed={(id, newName) => {
          handleChatUpdated({
            ...(activeChat as ChatListItem),
            conversationid: id,
            chatname: newName,
          });
        }}
      />

      <MembersModal
        open={showMembersModal}
        chat={activeChat ?? null}
        onClose={() => setShowMembersModal(false)}
      />

      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <CallManager />

      <main className="chat-area">
        {activeChat ? (
          showInChatSearch ? (
            <InChatSearchPanel
              conversationId={activeChat.conversationid}
              onClose={() => setShowInChatSearch(false)}
            />
          ) : (
            <>
              <ChatHeader
                chat={activeChat}
                onBack={() => {
                  setActiveChatId(null);
                  setMessages([]);
                }}
                onOpenInfo={() => setShowInfoModal(true)}
                onOpenMembers={() => setShowMembersModal(true)}
                onOpenSearch={() => setShowInChatSearch(true)}
                onChatRemoved={handleChatRemoved}
                onChatUpdated={handleChatUpdated}
              />
              <ChatBody
                messages={messages}
                activeChatId={activeChatId ?? 0}
              />
              <ChatInput
                conversationId={activeChatId ?? 0}
                onSend={sendMessage}
                disabled={!connection}
                onTypingChange={handleTypingChange}
              />
            </>
          )
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">
              <ChatIcon name="newChat" size={36} />
            </div>
            <span className="chat-placeholder-text">
              Welcome to ChatHub
            </span>
            <span className="chat-placeholder-hint">
              Select a chat from the sidebar or start a new conversation
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={onNewChat}
              style={{ marginTop: 18 }}
            >
              + New conversation
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
