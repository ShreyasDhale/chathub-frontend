"use client";

import { ChatListItem } from "@/types/chat.types";
import { SIDEBAR_ACTIONS, ChatActionId } from "@/constants/chatActions";
import ChatToolbar from "@/components/ui/ChatToolbar";
import ChatIcon from "@/components/ui/ChatIcon";
import SidebarSearchPanel from "@/components/ui/SidebarSearchPanel";
import { useState } from "react";

type Props = {
  chats: ChatListItem[];
  loading: boolean;
  activeChatId: number | null;
  onSelect: (id: number) => void;
  onLogout: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onChatStarted?: () => void;
  showMenu: boolean;
  toggleMenu: () => void;
  onCloseMenu?: () => void;
};

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 7 * 86400) return `${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function sortChats(chats: ChatListItem[]) {
  return [...chats].sort((a, b) => {
    const ap = (a.ispinned ?? 0) === 1 ? 1 : 0;
    const bp = (b.ispinned ?? 0) === 1 ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const at = a.lastmessageat ? new Date(a.lastmessageat).getTime() : 0;
    const bt = b.lastmessageat ? new Date(b.lastmessageat).getTime() : 0;
    if (at !== bt) return bt - at;
    return a.chatname.localeCompare(b.chatname);
  });
}

export default function ChatList({
  chats,
  loading,
  activeChatId,
  onSelect,
  onLogout,
  onNewChat,
  onOpenSettings,
  onChatStarted,
  showMenu,
  toggleMenu,
  onCloseMenu,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  function handleSidebarAction(id: ChatActionId) {
    if (id === "search-chats") setSearchOpen(true);
    if (id === "settings") onOpenSettings();
  }

  const sorted = sortChats(chats);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">C</div>
          <h3>Chats</h3>
        </div>
        <div className="sidebar-header-actions">
          <ChatToolbar
            actions={SIDEBAR_ACTIONS}
            compact
            onAction={handleSidebarAction}
          />
          <button
            type="button"
            className="menu-button"
            onClick={toggleMenu}
            aria-label="Menu"
            aria-expanded={showMenu}
          >
            <ChatIcon name="more" size={18} />
          </button>
        </div>
        {showMenu && (
          <>
            <button
              type="button"
              className="menu-backdrop"
              onClick={onCloseMenu}
              aria-label="Close menu"
            />
            <div className="menu-dropdown">
              <button
                type="button"
                className="menu-item menu-item-accent"
                onClick={onNewChat}
              >
                <span className="menu-item-icon">
                  <ChatIcon name="newChat" size={14} />
                </span>
                New Chat
              </button>
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  onCloseMenu?.();
                  onOpenSettings();
                }}
              >
                <span className="menu-item-icon">
                  <ChatIcon name="settings" size={14} />
                </span>
                Settings
              </button>
              <div className="menu-divider" />
              <button
                type="button"
                className="menu-item menu-item-danger"
                onClick={onLogout}
              >
                <span className="menu-item-icon">
                  <ChatIcon name="leave" size={14} />
                </span>
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      <SidebarSearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectConversation={(id) => {
          onSelect(id);
          setSearchOpen(false);
        }}
        onChatStarted={() => {
          setSearchOpen(false);
          onChatStarted?.();
        }}
      />

      <ul className="user-list">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="user shimmer">
                <div className="shimmer-box" />
                <div className="shimmer-lines">
                  <div className="shimmer-line" />
                  <div className="shimmer-line short" />
                </div>
              </li>
            ))
          : sorted.length === 0
            ? (
              <li className="sidebar-empty">
                <div className="sidebar-empty-icon">
                  <ChatIcon name="newChat" size={28} />
                </div>
                <p>No conversations yet</p>
                <span>Tap “New Chat” to get started</span>
                <button
                  type="button"
                  className="btn-primary btn-small"
                  onClick={onNewChat}
                  style={{ marginTop: 14 }}
                >
                  + Start a chat
                </button>
              </li>
            )
            : sorted.map((chat) => {
                const isActive = activeChatId === chat.conversationid;
                const unread = chat.unreadcount ?? 0;
                const isPinned = (chat.ispinned ?? 0) === 1;
                const isMuted = (chat.ismuted ?? 0) === 1;
                return (
                  <li
                    key={chat.conversationid}
                    className={`user ${isActive ? "active" : ""}`}
                    onClick={() => onSelect(chat.conversationid)}
                  >
                    <div className="avatar">
                      {chat.chatname[0]?.toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name-row">
                        <span className="name">{chat.chatname}</span>
                        <span className="user-time">
                          {formatRelativeTime(chat.lastmessageat)}
                        </span>
                      </div>
                      <div className="user-preview-row">
                        <span className="user-preview">
                          {chat.lastmessage ? (
                            chat.lastmessage
                          ) : (
                            <span
                              className={`chat-type ${chat.typecode === "GROUP" ? "group" : "direct"}`}
                            >
                              {chat.typecode === "GROUP" ? "Group" : "Direct"}
                            </span>
                          )}
                        </span>
                        <div className="user-badges">
                          {isPinned && (
                            <span className="user-badge" title="Pinned">
                              <ChatIcon name="pin" size={11} />
                            </span>
                          )}
                          {isMuted && (
                            <span className="user-badge" title="Muted">
                              <ChatIcon name="mute" size={11} />
                            </span>
                          )}
                          {unread > 0 && (
                            <span className="user-unread">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
      </ul>
    </aside>
  );
}
