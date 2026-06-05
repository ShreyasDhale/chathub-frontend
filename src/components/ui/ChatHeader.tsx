"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChatListItem } from "@/types/chat.types";
import { CHAT_HEADER_ACTIONS, ChatActionId } from "@/constants/chatActions";
import { useCall } from "@/hooks/useCall";
import { useCallStore } from "@/store/call.store";
import ChatToolbar from "@/components/ui/ChatToolbar";
import ChatIcon from "@/components/ui/ChatIcon";
import ChatMoreMenu from "@/components/ui/ChatMoreMenu";
import { getUserId } from "@/utils/auth.storage";
import {
  archiveConversation,
  leaveConversationRest,
  muteConversation,
  pinConversation,
} from "@/services/api/chat.api";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";

type Props = {
  chat?: ChatListItem;
  onBack?: () => void;
  onOpenInfo?: () => void;
  onOpenMembers?: () => void;
  onOpenSearch?: () => void;
  onChatRemoved?: (conversationId: number) => void;
  onChatUpdated?: (conversation: ChatListItem) => void;
};

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="chat-header-type">
          {isGroup ? "Group conversation" : "Direct message"}
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
