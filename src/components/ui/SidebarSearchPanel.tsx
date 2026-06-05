"use client";

import { useEffect, useRef, useState } from "react";
import { searchConversations } from "@/services/api/chat.api";
import { searchUsers } from "@/services/api/user.api";
import { ChatListItem, UsersListItem } from "@/types/chat.types";
import { getRequestErrorMessage } from "@/utils/api.utils";
import { startChat } from "@/services/api/chat.api";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectConversation: (id: number) => void;
  onChatStarted?: () => void;
};

function normaliseList<T>(model: unknown): T[] {
  if (!model) return [];
  if (Array.isArray(model)) return model as T[];
  if (typeof model === "object" && model !== null) {
    const obj = model as { Rows?: T[]; rows?: T[] };
    return (obj.Rows ?? obj.rows ?? []) as T[];
  }
  return [];
}

/**
 * Inline panel that overlays the sidebar's user list while searching across
 * existing conversations and all users.
 */
export default function SidebarSearchPanel({
  open,
  onClose,
  onSelectConversation,
  onChatStarted,
}: Props) {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [users, setUsers] = useState<UsersListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setConversations([]);
      setUsers([]);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const [convRes, userRes] = await Promise.all([
          searchConversations(query.trim()),
          searchUsers(query.trim()),
        ]);
        setConversations(normaliseList<ChatListItem>(convRes.Model));
        setUsers(normaliseList<UsersListItem>(userRes.Model));
      } catch (err) {
        setError(getRequestErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  if (!open) return null;

  async function handleStartDirect(user: UsersListItem) {
    if (busyUserId) return;
    try {
      setBusyUserId(user.userid);
      const res = await startChat({
        conversationid: 0,
        conversationname: "One To One",
        members: [user.userid],
      });
      if (res.StatusCode !== 0) {
        setError(res.Message ?? "Could not start chat");
        return;
      }
      onChatStarted?.();
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="sidebar-search-panel" role="region" aria-label="Search">
      <div className="sidebar-search-header">
        <div className="sidebar-search-input-wrap">
          <span className="search-icon">
            <ChatIcon name="search" size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chats and people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              <ChatIcon name="close" size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          className="chat-icon-button"
          onClick={onClose}
          aria-label="Close"
        >
          <ChatIcon name="close" size={18} />
        </button>
      </div>

      <div className="sidebar-search-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
        )}

        {!query.trim() && (
          <div className="search-empty">
            <ChatIcon name="search" size={32} />
            <p>Find chats and people</p>
            <span>Type a name or message to search</span>
          </div>
        )}

        {query.trim() && loading && (
          <div className="search-loading">
            <div className="shimmer-line" style={{ width: "60%" }} />
            <div className="shimmer-line" style={{ width: "80%" }} />
            <div className="shimmer-line" style={{ width: "40%" }} />
          </div>
        )}

        {query.trim() && !loading && conversations.length === 0 && users.length === 0 && (
          <div className="search-empty">
            <ChatIcon name="search" size={32} />
            <p>No matches</p>
            <span>Try a different query</span>
          </div>
        )}

        {conversations.length > 0 && (
          <section className="search-section">
            <h4 className="search-section-title">Conversations</h4>
            <ul className="search-results">
              {conversations.map((c) => (
                <li
                  key={c.conversationid}
                  className="search-result-row clickable"
                  onClick={() => {
                    onSelectConversation(c.conversationid);
                    onClose();
                  }}
                >
                  <div className="search-result-avatar">
                    {c.chatname.charAt(0).toUpperCase()}
                  </div>
                  <div className="search-result-body">
                    <div className="search-result-meta">
                      <span className="search-result-name">{c.chatname}</span>
                      <span
                        className={`chat-type ${c.typecode === "GROUP" ? "group" : "direct"}`}
                      >
                        {c.typecode === "GROUP" ? "Group" : "Direct"}
                      </span>
                    </div>
                    {c.lastmessage && (
                      <p className="search-result-text">{c.lastmessage}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {users.length > 0 && (
          <section className="search-section">
            <h4 className="search-section-title">People</h4>
            <ul className="search-results">
              {users.map((u) => (
                <li
                  key={u.userid}
                  className="search-result-row clickable"
                  onClick={() => handleStartDirect(u)}
                >
                  <div className="search-result-avatar">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="search-result-body">
                    <div className="search-result-meta">
                      <span className="search-result-name">{u.username}</span>
                      {busyUserId === u.userid && (
                        <span className="search-result-date">Starting...</span>
                      )}
                    </div>
                    {u.email && (
                      <p className="search-result-text">{u.email}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
