"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChatListItem } from "@/types/chat.types";
import {
  getConversationDetails,
  renameConversation,
} from "@/services/api/chat.api";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";
import ChatIcon from "@/components/ui/ChatIcon";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  chat: ChatListItem | null;
  onClose: () => void;
  onRenamed?: (conversationId: number, newName: string) => void;
};

type ConversationDetailRow = {
  conversationid: number;
  conversationname: string;
  conversationtypeid: number;
  createdbyuserid: number;
  creationdate: string;
  membercount?: number;
};

/**
 * Read-only conversation info card with rename support.
 * Backed by GET /Conversations/GetConversationDetails/{id} and PUT /Conversations/Rename.
 */
export default function ConversationInfoModal({
  open,
  chat,
  onClose,
  onRenamed,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ConversationDetailRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !chat) return;
    setEditing(false);
    setNewName(chat.chatname);
    setError("");

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getConversationDetails(chat.conversationid);
        if (cancelled) return;
        const rows = (res.Model as unknown as { Rows?: ConversationDetailRow[]; rows?: ConversationDetailRow[] } | ConversationDetailRow[] | null);
        const first = Array.isArray(rows)
          ? rows[0]
          : (rows?.Rows ?? rows?.rows ?? [])[0];
        setDetails(first ?? null);
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

  if (!open || !mounted || !chat) return null;

  async function handleSaveRename() {
    if (!chat) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === chat.chatname) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      const res = await renameConversation(chat.conversationid, trimmed);
      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not rename conversation."));
        return;
      }
      onRenamed?.(chat.conversationid, trimmed);
      setEditing(false);
      toast.success("Renamed");
    } catch (err) {
      setError(getRequestErrorMessage(err, "Could not rename conversation."));
    } finally {
      setSaving(false);
    }
  }

  const created = details?.creationdate ?? chat.creationdate;
  const createdLabel = created
    ? new Date(created).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
  const isGroup = chat.typecode === "GROUP";

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="info-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conv-info-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="conv-info-title">Conversation info</h2>
            <p className="modal-subtitle">
              {isGroup ? "Group chat details" : "Direct chat details"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <ChatIcon name="close" size={18} />
          </button>
        </div>

        <div className="info-hero">
          <div className="info-hero-avatar">
            {chat.chatname.charAt(0).toUpperCase()}
          </div>
          <div className="info-hero-name-row">
            {editing ? (
              <input
                className="info-rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
            ) : (
              <h3 className="info-hero-name">{chat.chatname}</h3>
            )}
            {isGroup && !editing && (
              <button
                type="button"
                className="info-edit-button"
                onClick={() => setEditing(true)}
                aria-label="Rename"
              >
                <ChatIcon name="edit" size={16} />
              </button>
            )}
            {editing && (
              <div className="info-edit-actions">
                <button
                  type="button"
                  className="btn-secondary btn-small"
                  onClick={() => {
                    setEditing(false);
                    setNewName(chat.chatname);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary btn-small"
                  onClick={handleSaveRename}
                  disabled={saving || !newName.trim()}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          <span className="info-hero-type">{isGroup ? "Group" : "Direct"}</span>
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

        <div className="info-list">
          <InfoRow
            label="Created"
            value={loading ? "Loading..." : createdLabel}
          />
          <InfoRow
            label="Members"
            value={
              loading
                ? "Loading..."
                : details?.membercount != null
                  ? String(details.membercount)
                  : "—"
            }
          />
          <InfoRow
            label="Conversation ID"
            value={`#${chat.conversationid}`}
            mono
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className={`info-row-value ${mono ? "is-mono" : ""}`}>{value}</span>
    </div>
  );
}
