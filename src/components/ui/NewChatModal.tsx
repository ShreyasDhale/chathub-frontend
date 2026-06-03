"use client";

/**
 * New Chat flow: pick users → optional group name → POST /Conversations/StartChat.
 * Rendered via portal so the modal covers the full viewport on all screen sizes.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { loadusers } from "@/services/api/dashboard.api";
import { startChat } from "@/services/api/chat.api";
import { getUserId } from "@/utils/auth.storage";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";
import { UsersListItem } from "@/types/chat.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

const AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#0ea5e9",
  "#84cc16",
  "#ef4444",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function NewChatModal({ open, onClose, onSuccess }: Props) {
  const [users, setUsers] = useState<UsersListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<"select" | "group-name">("select");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentUserId = Number(getUserId() ?? 0);

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setSelected([]);
    setStep("select");
    setGroupName("");
    setError("");

    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await loadusers();
        if (res.StatusCode !== 0) {
          setError(getApiErrorMessage(res, "Failed to load users."));
          setUsers([]);
          return;
        }
        const all = res.Model ?? [];
        setUsers(all.filter((u) => u.userid !== currentUserId));
      } catch (err) {
        setError(getRequestErrorMessage(err, "Failed to load users."));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [open, currentUserId]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  function toggleUser(userId: number) {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  async function createChat(members: number[], conversationName: string) {
    if (members.length === 0 || starting) return;

    try {
      setStarting(true);
      setError("");
      const res = await startChat({
        conversationid: 0,
        conversationname: conversationName,
        members,
      });

      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not start chat."));
        return;
      }

      onClose();
      await onSuccess();
    } catch (err) {
      setError(getRequestErrorMessage(err, "Could not start chat."));
    } finally {
      setStarting(false);
    }
  }

  function handleRowClick(user: UsersListItem) {
    if (selected.length > 0) return;
    createChat([user.userid], "One To One");
  }

  function handleStartSelected() {
    if (selected.length === 1) {
      createChat(selected, "One To One");
      return;
    }
    if (selected.length > 1) {
      setStep("group-name");
    }
  }

  function handleCreateGroup() {
    const name = groupName.trim();
    if (!name || selected.length < 2) return;
    createChat(selected, name);
  }

  if (!open || !mounted) return null;

  const errorBanner = error ? (
    <div className="alert alert-error" role="alert">
      <span className="alert-icon">!</span>
      <span className="alert-message">{error}</span>
      <button
        type="button"
        className="alert-dismiss"
        onClick={() => setError("")}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  ) : null;

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`new-chat-modal ${step === "group-name" ? "new-chat-modal--group" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={step === "select" ? "new-chat-title" : "group-name-title"}
      >
        {step === "select" ? (
          <>
            <div className="modal-header">
              <div>
                <h2 id="new-chat-title">New Chat</h2>
                <p className="modal-subtitle">
                  Click a user for a direct chat, or select multiple to create a
                  group
                </p>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>

            {errorBanner}

            <div className="modal-search">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-user-list">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="modal-user-row shimmer-row">
                    <div className="shimmer-box" />
                    <div className="shimmer-lines">
                      <div className="shimmer-line" />
                      <div className="shimmer-line short" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="modal-empty">No users found</div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selected.includes(user.userid);
                  return (
                    <div
                      key={user.userid}
                      className={`modal-user-row ${isSelected ? "selected" : ""}`}
                      onClick={() => handleRowClick(user)}
                    >
                      <label
                        className="user-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(user.userid)}
                        />
                        <span className="checkmark" />
                      </label>

                      <div
                        className="modal-avatar"
                        style={{ backgroundColor: avatarColor(user.username) }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="modal-user-info">
                        <span className="modal-user-name">{user.username}</span>
                        <span className="modal-user-email">{user.email}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selected.length > 0 && (
              <div className="modal-footer">
                <span className="selected-count">
                  {selected.length} selected
                </span>
                <div className="modal-footer-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setSelected([])}
                    disabled={starting}
                  >
                    Clear
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleStartSelected}
                    disabled={starting}
                  >
                    {starting
                      ? "Starting..."
                      : selected.length === 1
                        ? "Start Chat"
                        : "Next: Group Name"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2 id="group-name-title">Group Name</h2>
                <p className="modal-subtitle">
                  Name your group with {selected.length} members
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setStep("select")}
                aria-label="Back"
              >
                ×
              </button>
            </div>

            {errorBanner}

            <div className="group-name-form">
              <label htmlFor="group-name">Conversation name</label>
              <input
                id="group-name"
                type="text"
                placeholder="e.g. Project Team, Friends..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                autoFocus
              />

              <div className="selected-members-preview">
                {selected.map((id) => {
                  const user = users.find((u) => u.userid === id);
                  if (!user) return null;
                  return (
                    <span key={id} className="member-chip">
                      {user.username}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer modal-footer--group">
              <div className="modal-footer-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setStep("select")}
                  disabled={starting}
                >
                  Back
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCreateGroup}
                  disabled={starting || !groupName.trim()}
                >
                  {starting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
