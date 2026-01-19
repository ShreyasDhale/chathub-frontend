"use client";

import { useEffect, useState } from "react";
import { loadchats } from "../../services/api/dashboard.api";
import { DynamicApiResponse } from "../../types/api.types";
import { ChatListItem } from "../../types/chat.types";
import { clearToken } from "../../utils/auth.storage";
import { useRouter } from "next/router";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    try {
      setLoading(true);
      const response: DynamicApiResponse<ChatListItem[], null> =
        await loadchats();

      setChats(response.Model ?? []);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    const router = useRouter();
    clearToken();      
    router.push("/login");
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>

          <div className="sidebar-menu">
            <button
              className="menu-button"
              onClick={() => setShowMenu((v) => !v)}
            >
              ⋮
            </button>

            {showMenu && (
              <div className="menu-dropdown">
                <button
                  className="menu-item"
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <ul className="user-list">
          {loading
            ? Array.from({ length: 11 }).map((_, i) => (
                <li key={i} className="user shimmer">
                  <div className="avatar shimmer-box" />
                  <div className="user-info">
                    <div className="shimmer-line short" />
                    <div className="shimmer-line" />
                  </div>
                </li>
              ))
            : chats.map((chat) => (
                <li
                  key={chat.conversationid}
                  className={`user ${
                    activeChatId === chat.conversationid ? "active" : ""
                  }`}
                  onClick={() => setActiveChatId(chat.conversationid)}
                >
                  <div className="avatar">
                    {chat.chatname.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="name">{chat.chatname}</span>
                    <span className="status">
                      {chat.typecode === "GROUP" ? "Group" : "Direct"}
                    </span>
                  </div>
                </li>
              ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="chat-area">
        {chats.find(chat => chat.conversationid == activeChatId) ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-header-avatar">
                {chats.find(chat => chat.conversationid == activeChatId)!.chatname.charAt(0).toUpperCase()}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">
                  {chats.find(chat => chat.conversationid == activeChatId)!.chatname}
                </div>
                <div className="chat-header-type">
                  {chats.find(chat => chat.conversationid == activeChatId)!.typecode === "GROUP" ? "Group" : "Direct"}
                </div>
              </div>
            </div>

            {/* Chat body */}
            <div className="chat-body">
              <div className="message-placeholder">
                {/* Messages will appear here */}
              </div>
            </div>

            {/* Chat input */}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message"
                className="chat-textbox"
              />
              <button className="send-button">
                Send
              </button>
            </div>

          </>
        ) : (
          <div className="chat-placeholder">
            Select a chat to start messaging
          </div>
        )}
      </main>

    </div>
  );
}
