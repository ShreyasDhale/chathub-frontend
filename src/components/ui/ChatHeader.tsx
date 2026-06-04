"use client";

import { useEffect, useState } from "react";
import { ChatListItem } from "@/types/chat.types";
import { CHAT_HEADER_ACTIONS } from "@/constants/chatActions";
import { useCall } from "@/hooks/useCall";
import { useCallStore } from "@/store/call.store";
import ChatToolbar from "@/components/ui/ChatToolbar";
import { IncomingCallModal } from "@/components/ui/IncomingCallModal";
import { ActiveCallScreen } from "@/components/ui/ActiveCallScreen";
import { getUserId } from "@/utils/auth.storage";

type Props = {
  chat?: ChatListItem;
  onBack?: () => void;
};

/**
 * Active conversation top bar: avatar, title, quick actions (call, info, members, etc.)
 */
export default function ChatHeader({ chat, onBack }: Props) {
  if (!chat) return null;

  const currentUserId = Number(getUserId() ?? 0);
  const [mounted, setMounted] = useState(false);

  // Get first other user in conversation (for direct chats)
  const otherUserId = chat.typecode === "GROUP" ? undefined : chat.conversationid;

  const { startCall, acceptCall, rejectCall, hangUpCall } = useCall(
    chat.conversationid,
    currentUserId
  );

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

  const headerActions = CHAT_HEADER_ACTIONS.filter(
    (action) =>
      chat.typecode === "GROUP" || action.id !== "group-members"
  );

  if (!mounted) return null;

  return (
    <div className="chat-header">
      {onBack && (
        <button
          type="button"
          className="chat-back-button"
          onClick={onBack}
          aria-label="Back to chats"
        >
          ←
        </button>
      )}

      <div className="chat-header-avatar">
        {chat.chatname.charAt(0).toUpperCase()}
      </div>

      <div className="chat-header-info">
        <div className="chat-header-name">{chat.chatname}</div>
        <div className="chat-header-type">
          {chat.typecode === "GROUP" ? "Group" : "Direct"}
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          type="button"
          className="chat-icon-button"
          onClick={handleStartAudioCall}
          aria-label="Start audio call"
          title="Voice call"
          disabled={!!activeCall}
        >
          ☎️
        </button>

        <button
          type="button"
          className="chat-icon-button"
          onClick={handleStartVideoCall}
          aria-label="Start video call"
          title="Video call"
          disabled={!!activeCall}
        >
          📹
        </button>

        <ChatToolbar actions={headerActions} compact />
      </div>

      {/* Call modals */}
      {mounted && (
        <>
          <IncomingCallModal onAccept={acceptCall} onReject={rejectCall} />
          <ActiveCallScreen onHangUp={hangUpCall} />
        </>
      )}
    </div>
  );
}
