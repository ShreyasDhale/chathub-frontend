"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChatListItem, ConversationMember } from "@/types/chat.types";
import { CHAT_HEADER_ACTIONS, ChatActionId } from "@/constants/chatActions";
import { useCall } from "@/hooks/useCall";
import { useCallStore } from "@/store/call.store";
import { useChatStore } from "@/store/chat.store";
import { useConversationStore } from "@/store/conversation.store";
import ChatToolbar from "@/components/ui/ChatToolbar";
import ChatIcon from "@/components/ui/ChatIcon";
import ChatMoreMenu from "@/components/ui/ChatMoreMenu";
import { getUserId } from "@/utils/auth.storage";
import {
  archiveConversation,
  leaveConversationRest,
  muteConversation,
  pinConversation,
  getConversationMembers,
} from "@/services/api/chat.api";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";

// Stable empty references so Zustand selectors don't trigger infinite renders
// when the requested key is absent.
type StoredMember = {
  userid: number;
  username: string;
  displayname?: string;
  avatarurl?: string;
  isonline?: number;
};
const EMPTY_MEMBERS_HEADER: StoredMember[] = [];
const EMPTY_TYPING_HEADER: Set<number> = new Set();

type Props = {
  chat?: ChatListItem;
  onBack?: () => void;
  onOpenInfo?: () => void;
  onOpenMembers?: () => void;
  onOpenSearch?: () => void;
  onChatRemoved?: (conversationId: number) => void;
  onChatUpdated?: (conversation: ChatListItem) => void;
};

function formatLastSeen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "recently";
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

/**
 * Active conversation top bar: avatar, title, quick actions
 * (call, info, members, search, more menu).
 */
export default function ChatHeader({
  chat,
  onBack,
  onOpenInfo,
  onOpenMembers,
  onOpenSearch,
  onChatRemoved,
  onChatUpdated,
}: Props) {
  if (!chat) return null;

  const currentUserId = Number(getUserId() ?? 0);
  const [mounted, setMounted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isMuted, setIsMuted] = useState((chat.ismuted ?? 0) === 1);
  const [isPinned, setIsPinned] = useState((chat.ispinned ?? 0) === 1);

  useEffect(() => {
    setIsMuted((chat.ismuted ?? 0) === 1);
    setIsPinned((chat.ispinned ?? 0) === 1);
  }, [chat.conversationid, chat.ismuted, chat.ispinned]);

  const { startCall } = useCall(chat.conversationid, currentUserId);
  const { activeCall } = useCallStore();

  // Preload conversation members so we can resolve names for "X is typing" and
  // surface the other party's online presence in 1:1 chats.
  const setMembers = useConversationStore((s) => s.setMembers);
  const members = useConversationStore(
    (s) => s.members[chat.conversationid] ?? EMPTY_MEMBERS_HEADER
  );
  const presenceByUser = useChatStore((s) => s.presenceByUser);
  const typingSet = useChatStore(
    (s) => s.typingByConversation[chat.conversationid] ?? EMPTY_TYPING_HEADER
  );
  const typingOthers = useMemo(
    () => Array.from(typingSet).filter((u) => u !== currentUserId),
    [typingSet, currentUserId]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!chat.conversationid) return;
    if (members.length > 0) return;
    getConversationMembers(chat.conversationid)
      .then((res) => {
        if (cancelled) return;
        const model = res.Model as unknown;
        const rows: ConversationMember[] = Array.isArray(model)
          ? (model as ConversationMember[])
          : (model && typeof model === "object"
              ? (((model as { Rows?: ConversationMember[] }).Rows ?? []) as ConversationMember[])
              : []);
        if (rows.length > 0) {
          setMembers(chat.conversationid, rows);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chat.conversationid, members.length, setMembers]);

  // Compute the "presence string": typing > online > last seen.
  const otherMember = useMemo(() => {
    if (chat.typecode === "GROUP") return null;
    return members.find((m) => m.userid !== currentUserId) ?? null;
  }, [members, chat.typecode, currentUserId]);

  const presenceText = useMemo(() => {
    if (typingOthers.length > 0) {
      if (chat.typecode === "GROUP") {
        const names = typingOthers
          .map((id) => members.find((m) => m.userid === id))
          .filter(Boolean)
          .map((m) => (m as ConversationMember).displayname || (m as ConversationMember).username);
        if (names.length === 1) return `${names[0]} is typing…`;
        if (names.length > 1) return "Several people are typing…";
        return "Typing…";
      }
      return "typing…";
    }
    if (chat.typecode === "GROUP") {
      const total = members.filter((m) => !m.leftat).length;
      const online = members.filter((m) => {
        const p = presenceByUser[m.userid];
        return p?.isOnline || (m.isonline ?? 0) > 0;
      }).length;
      return `${total} members${online > 0 ? ` · ${online} online` : ""}`;
    }
    if (otherMember) {
      const p = presenceByUser[otherMember.userid];
      const online = p?.isOnline || (otherMember.isonline ?? 0) > 0;
      if (online) return "Online";
      const seen = p?.lastSeenAt || otherMember.lastseenat;
      if (seen) return `Last seen ${formatLastSeen(seen)}`;
      return "Direct message";
    }
    return "Direct message";
  }, [typingOthers, members, otherMember, presenceByUser, chat.typecode]);

  async function handleStartAudioCall() {
    try {
      await startCall("audio");
    } catch (error) {
      console.error("Failed to start audio call:", error);
    }
  }

  async function handleStartVideoCall() {
    try {
      await startCall("video");
    } catch (error) {
      console.error("Failed to start video call:", error);
    }
  }

  async function handleToggleMute() {
    if (busy) return;
    const next = !isMuted;
    setIsMuted(next);
    setMoreOpen(false);
    try {
      setBusy(true);
      const res = await muteConversation(chat.conversationid, next);
      if (res.StatusCode !== 0) {
        setIsMuted(!next);
        toast.error(getApiErrorMessage(res, "Could not update notification settings."));
        return;
      }
      onChatUpdated?.({ ...chat, ismuted: next ? 1 : 0 });
    } catch (err) {
      setIsMuted(!next);
      toast.error(getRequestErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleTogglePin() {
    if (busy) return;
    const next = !isPinned;
    setIsPinned(next);
    setMoreOpen(false);
    try {
      setBusy(true);
      const res = await pinConversation(chat.conversationid, next);
      if (res.StatusCode !== 0) {
        setIsPinned(!next);
        toast.error(getApiErrorMessage(res, "Could not update pin."));
        return;
      }
      onChatUpdated?.({ ...chat, ispinned: next ? 1 : 0 });
    } catch (err) {
      setIsPinned(!next);
      toast.error(getRequestErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (busy) return;
    setMoreOpen(false);
    if (!confirm("Archive this chat? It will move out of your active list.")) return;
    try {
      setBusy(true);
      const res = await archiveConversation(chat.conversationid);
      if (res.StatusCode !== 0) {
        toast.error(getApiErrorMessage(res, "Could not archive chat."));
        return;
      }
      onChatRemoved?.(chat.conversationid);
    } catch (err) {
      toast.error(getRequestErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (busy) return;
    setMoreOpen(false);
    const isGroup = chat.typecode === "GROUP";
    const message = isGroup
      ? "Leave this conversation? You won't receive any new messages."
      : "Remove this chat from your list?";
    if (!confirm(message)) return;
    try {
      setBusy(true);
      const res = await leaveConversationRest(chat.conversationid);
      if (res.StatusCode !== 0) {
        toast.error(getApiErrorMessage(res, "Could not leave conversation."));
        return;
      }
      onChatRemoved?.(chat.conversationid);
    } catch (err) {
      toast.error(getRequestErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleAction(id: ChatActionId) {
    switch (id) {
      case "search-messages":
        onOpenSearch?.();
        break;
      case "conversation-info":
        onOpenInfo?.();
        break;
      case "group-members":
        onOpenMembers?.();
        break;
      case "more-options":
        setMoreOpen((v) => !v);
        break;
      default:
        break;
    }
  }

  const headerActions = CHAT_HEADER_ACTIONS.filter(
    (action) => chat.typecode === "GROUP" || action.id !== "group-members"
  );

  if (!mounted) return null;
  const isGroup = chat.typecode === "GROUP";

  return (
    <div className="chat-header">
      {onBack && (
        <button
          type="button"
          className="chat-back-button"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <ChatIcon name="back" size={18} />
        </button>
      )}

      <div className="chat-header-avatar">
        {chat.chatname.charAt(0).toUpperCase()}
        {!isGroup && otherMember && (
          (() => {
            const p = presenceByUser[otherMember.userid];
            const online = p?.isOnline || (otherMember.isonline ?? 0) > 0;
            if (!online) return null;
            return <span className="presence-dot" aria-label="online" />;
          })()
        )}
      </div>

      <button
        type="button"
        className="chat-header-info"
        onClick={() => onOpenInfo?.()}
        title="View conversation info"
      >
        <div className="chat-header-name">
          {chat.chatname}
          {isPinned && (
            <span className="chat-header-badge" title="Pinned">
              <ChatIcon name="pin" size={12} />
            </span>
          )}
          {isMuted && (
            <span className="chat-header-badge" title="Muted">
              <ChatIcon name="mute" size={12} />
            </span>
          )}
        </div>
        <div
          className={`chat-header-type ${typingOthers.length > 0 ? "is-typing" : ""}`}
        >
          {presenceText}
        </div>
      </button>

      <div className="chat-header-actions">
        <button
          type="button"
          className="chat-icon-button"
          onClick={handleStartAudioCall}
          aria-label="Start audio call"
          title="Voice call"
          disabled={!!activeCall}
        >
          <ChatIcon name="call" size={20} />
        </button>

        <button
          type="button"
          className="chat-icon-button"
          onClick={handleStartVideoCall}
          aria-label="Start video call"
          title="Video call"
          disabled={!!activeCall}
        >
          <ChatIcon name="video" size={20} />
        </button>

        <ChatToolbar
          actions={headerActions}
          compact
          onAction={handleAction}
          activeMap={{
            "more-options": moreOpen,
          }}
        />

        {moreOpen && (
          <ChatMoreMenu
            isMuted={isMuted}
            isPinned={isPinned}
            isGroup={isGroup}
            busy={busy}
            onClose={() => setMoreOpen(false)}
            onToggleMute={handleToggleMute}
            onTogglePin={handleTogglePin}
            onArchive={handleArchive}
            onLeave={handleLeave}
          />
        )}
      </div>
    </div>
  );
}
