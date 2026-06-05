"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logout } from "@/services/api/auth.api";
import { clearToken, getUserId } from "@/utils/auth.storage";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useChatStore } from "@/store/chat.store";
import { useConversationStore } from "@/store/conversation.store";
import {
  typingStarted,
  typingStopped,
  sendMessageSignalR,
  markMessagesReadSignalR,
} from "@/services/socket/chat.actions";
import { sendMessageRest, markAsRead } from "@/services/api/messages.api";
import { ChatListItem, MessagePayload } from "@/types/chat.types";

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
 * Main chat dashboard. Sources of truth:
 *  - useConversations()  → sidebar list + activeConversationId
 *  - useMessages()       → REST history for active chat (paged)
 *  - useChatStore        → realtime updates (typing, presence, receipts)
 *
 * SignalR events themselves are wired in registerChatEvents() at app startup.
 */
export default function DashboardScreen() {
  const router = useRouter();

  const myUserId = useMemo(() => Number(getUserId() ?? 0), []);
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    fetchConversations,
  } = useConversations();

  const isConnected = useChatStore((s) => s.isConnected);
  const markRead = useChatStore((s) => s.markConversationRead);

  const { messages, loading, loadingOlder, hasMore, loadOlder } =
    useMessages(activeConversationId);

  const [showMenu, setShowMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInChatSearch, setShowInChatSearch] = useState(false);

  // Send: optimistic add to store, then SignalR (with REST fallback).
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activeConversationId) return;

      const clientMessageId = Date.now();
      const optimistic: MessagePayload = {
        messageId: -clientMessageId,
        conversationId: activeConversationId,
        senderId: myUserId,
        message: trimmed,
        clientMessageId,
        sentAt: new Date().toISOString(),
        isOptimistic: true,
      };
      useChatStore.getState().addMessage(optimistic);

      let delivered = false;
      try {
        await sendMessageSignalR(activeConversationId, clientMessageId, trimmed);
        delivered = true;
      } catch {
        // fall through to REST
      }
      if (!delivered) {
        try {
          await sendMessageRest({
            ConversationId: activeConversationId,
            Message: trimmed,
            ClientMessageId: clientMessageId,
            MessageTypeId: 1,
          });
        } catch {
          toast.error("Couldn't send your message — please retry.");
        }
      }
    },
    [activeConversationId, myUserId]
  );

  function handleTypingChange(typing: boolean) {
    if (!activeConversationId) return;
    if (typing) typingStarted(activeConversationId);
    else typingStopped(activeConversationId);
  }

  // When the user opens or returns to a conversation, push a "read" pointer.
  useEffect(() => {
    if (!activeConversationId || messages.length === 0) return;
    const lastId = messages[messages.length - 1].messageId;
    if (lastId <= 0) return;
    markRead(activeConversationId);
    markAsRead(activeConversationId, lastId).catch(() => {});
    markMessagesReadSignalR(activeConversationId, lastId).catch(() => {});
  }, [activeConversationId, messages, markRead]);

  function onNewChat() {
    setShowMenu(false);
    setShowNewChatModal(true);
  }

  async function handleChatCreated() {
    setShowNewChatModal(false);
    setActiveConversation(null);
    await fetchConversations();
    router.refresh();
  }

  async function handleLogout() {
    setShowMenu(false);
    await logout();
    clearToken();
    useChatStore.getState().reset();
    useConversationStore.getState().setConversations([]);
    router.replace("/login");
  }

  function handleChatRemoved(conversationId: number) {
    useConversationStore.getState().removeConversation(conversationId);
    if (activeConversationId === conversationId) {
      setActiveConversation(null);
    }
  }

  function handleChatUpdated(updated: ChatListItem) {
    useConversationStore.getState().upsertConversation(updated);
  }

  const activeChat = conversations.find(
    (c) => c.conversationid === activeConversationId
  );

  return (
    <div
      className={`dashboard ${activeConversationId ? "dashboard--chat-open" : ""}`}
    >
      <div className="dashboard-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <ChatList
        chats={conversations}
        loading={loading && conversations.length === 0}
        activeChatId={activeConversationId}
        onSelect={(id) => setActiveConversation(id)}
        onLogout={handleLogout}
        showMenu={showMenu}
        onNewChat={onNewChat}
        onOpenSettings={() => {
          setShowMenu(false);
          setShowSettingsModal(true);
        }}
        onChatStarted={fetchConversations}
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
                onBack={() => setActiveConversation(null)}
                onOpenInfo={() => setShowInfoModal(true)}
                onOpenMembers={() => setShowMembersModal(true)}
                onOpenSearch={() => setShowInChatSearch(true)}
                onChatRemoved={handleChatRemoved}
                onChatUpdated={handleChatUpdated}
              />
              <ChatBody
                conversationId={activeChat.conversationid}
                messages={messages}
                currentUserId={myUserId}
                loading={loading}
                loadingOlder={loadingOlder}
                hasMore={hasMore}
                onLoadOlder={loadOlder}
              />
              <ChatInput
                conversationId={activeChat.conversationid}
                onSend={sendMessage}
                disabled={!isConnected}
                onTypingChange={handleTypingChange}
              />
            </>
          )
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">
              <ChatIcon name="newChat" size={36} />
            </div>
            <span className="chat-placeholder-text">Welcome to ChatHub</span>
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
