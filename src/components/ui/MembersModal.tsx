"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChatListItem } from "@/types/chat.types";
import {
  getConversationMembers,
  addMembers,
  removeMember,
} from "@/services/api/chat.api";
import { loadusers } from "@/services/api/dashboard.api";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";
import { getUserId } from "@/utils/auth.storage";
import ChatIcon from "@/components/ui/ChatIcon";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  chat: ChatListItem | null;
  onClose: () => void;
};

type MemberRow = {
  userid: number;
  username: string;
  displayname?: string;
  email?: string;
  avatarurl?: string;
  isadmin?: number;
  isonline?: number;
};

const AVATAR_PALETTE = [
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
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function normaliseMembersResponse(model: unknown): MemberRow[] {
  if (!model) return [];
  if (Array.isArray(model)) return model as MemberRow[];
  if (typeof model === "object" && model !== null) {
    const obj = model as { Rows?: MemberRow[]; rows?: MemberRow[] };
    return (obj.Rows ?? obj.rows ?? []) as MemberRow[];
  }
  return [];
}

/** Members panel with add/remove for groups, view-only for 1:1 chats. */
export default function MembersModal({ open, chat, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [allUsers, setAllUsers] = useState<MemberRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const currentUserId = Number(getUserId() ?? 0);
  const isGroup = chat?.typecode === "GROUP";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !chat) return;
    setShowAdd(false);
    setSearch("");
    setPendingIds([]);
    setError("");

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getConversationMembers(chat.conversationid);
        if (cancelled) return;
        setMembers(normaliseMembersResponse(res.Model));
      } catch (err) {
        if (!cancelled) setError(getRequestErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, chat]);

  useEffect(() => {
    if (!showAdd) return;
    let cancelled = false;
    (async () => {
      try {
        setUsersLoading(true);
        const res = await loadusers();
        if (cancelled) return;
        const list = normaliseMembersResponse(res.Model);
        setAllUsers(list);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showAdd]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.userid)), [members]);

  const filteredAddCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (memberIds.has(u.userid)) return false;
      if (u.userid === currentUserId) return false;
      if (!q) return true;
      return (
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [allUsers, memberIds, search, currentUserId]);

  if (!open || !mounted || !chat) return null;

  function togglePending(id: number) {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleConfirmAdd() {
    if (!chat || pendingIds.length === 0 || busy) return;
    try {
      setBusy(true);
      const res = await addMembers(chat.conversationid, pendingIds);
      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not add members."));
        return;
      }
      toast.success(`Added ${pendingIds.length} member(s)`);
      const refreshed = await getConversationMembers(chat.conversationid);
      setMembers(normaliseMembersResponse(refreshed.Model));
      setPendingIds([]);
      setShowAdd(false);
    } catch (err) {
      setError(getRequestErrorMessage(err, "Could not add members."));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(userId: number) {
    if (!chat || busy) return;
    if (!confirm("Remove this member from the conversation?")) return;
    try {
      setBusy(true);
      const res = await removeMember(chat.conversationid, userId);
      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not remove member."));
        return;
      }
      toast.success("Member removed");
      setMembers((m) => m.filter((x) => x.userid !== userId));
    } catch (err) {
      setError(getRequestErrorMessage(err, "Could not remove member."));
    } finally {
      setBusy(false);
    }
  }

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="members-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="members-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="members-title">
              {showAdd ? "Add members" : "Members"}
            </h2>
            <p className="modal-subtitle">
              {showAdd
                ? "Select people to invite to this conversation"
                : `${members.length} ${members.length === 1 ? "member" : "members"}`}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={() => {
              if (showAdd) setShowAdd(false);
              else onClose();
            }}
            aria-label={showAdd ? "Back" : "Close"}
          >
            <ChatIcon name={showAdd ? "back" : "close"} size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              <ChatIcon name="close" size={14} />
            </button>
          </div>
        )}

        {!showAdd ? (
          <>
            <div className="members-list">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="member-row shimmer-row">
                    <div className="shimmer-box" />
                    <div className="shimmer-lines">
                      <div className="shimmer-line" />
                      <div className="shimmer-line short" />
                    </div>
                  </div>
                ))
              ) : members.length === 0 ? (
                <div className="modal-empty">No members yet</div>
              ) : (
                members.map((m) => {
                  const displayName = m.displayname || m.username || "User";
                  const isMe = m.userid === currentUserId;
                  return (
                    <div key={m.userid} className="member-row">
                      <div
                        className="modal-avatar"
                        style={{ backgroundColor: avatarColor(displayName) }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="modal-user-info">
                        <span className="modal-user-name">
                          {displayName}
                          {isMe && <span className="member-self-tag">You</span>}
                          {m.isadmin === 1 && (
                            <span className="member-admin-tag">Admin</span>
                          )}
                        </span>
                        {m.email && (
                          <span className="modal-user-email">{m.email}</span>
                        )}
                      </div>
                      {isGroup && !isMe && (
                        <button
                          type="button"
                          className="member-remove-button"
                          onClick={() => handleRemove(m.userid)}
                          disabled={busy}
                          title="Remove member"
                        >
                          <ChatIcon name="close" size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {isGroup && (
              <div className="modal-footer">
                <span />
                <div className="modal-footer-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setShowAdd(true)}
                    disabled={busy}
                  >
                    + Add members
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="modal-search">
              <span className="search-icon">
                <ChatIcon name="search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-user-list">
              {usersLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="modal-user-row shimmer-row">
                    <div className="shimmer-box" />
                    <div className="shimmer-lines">
                      <div className="shimmer-line" />
                      <div className="shimmer-line short" />
                    </div>
                  </div>
                ))
              ) : filteredAddCandidates.length === 0 ? (
                <div className="modal-empty">No people available to add</div>
              ) : (
                filteredAddCandidates.map((u) => {
                  const displayName = u.displayname || u.username || "User";
                  const isSelected = pendingIds.includes(u.userid);
                  return (
                    <div
                      key={u.userid}
                      className={`modal-user-row ${isSelected ? "selected" : ""}`}
                      onClick={() => togglePending(u.userid)}
                    >
                      <label
                        className="user-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePending(u.userid)}
                        />
                        <span className="checkmark" />
                      </label>
                      <div
                        className="modal-avatar"
                        style={{ backgroundColor: avatarColor(displayName) }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="modal-user-info">
                        <span className="modal-user-name">{displayName}</span>
                        {u.email && (
                          <span className="modal-user-email">{u.email}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-footer">
              <span className="selected-count">
                {pendingIds.length} selected
              </span>
              <div className="modal-footer-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setPendingIds([])}
                  disabled={busy || pendingIds.length === 0}
                >
                  Clear
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmAdd}
                  disabled={busy || pendingIds.length === 0}
                >
                  {busy ? "Adding..." : "Add to chat"}
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
