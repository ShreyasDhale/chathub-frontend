"use client";

import { useEffect, useRef } from "react";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  isMuted: boolean;
  isPinned: boolean;
  isGroup: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onArchive: () => void;
  onLeave: () => void;
  busy?: boolean;
};

/** Dropdown menu under the "more" button in chat header. */
export default function ChatMoreMenu({
  isMuted,
  isPinned,
  isGroup,
  onClose,
  onToggleMute,
  onTogglePin,
  onArchive,
  onLeave,
  busy = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <div className="chat-more-menu" ref={ref} role="menu">
      <button
        type="button"
        className="chat-more-item"
        role="menuitem"
        onClick={onTogglePin}
        disabled={busy}
      >
        <ChatIcon name="pin" size={16} />
        <span>{isPinned ? "Unpin chat" : "Pin chat"}</span>
      </button>
      <button
        type="button"
        className="chat-more-item"
        role="menuitem"
        onClick={onToggleMute}
        disabled={busy}
      >
        <ChatIcon name={isMuted ? "unmute" : "mute"} size={16} />
        <span>{isMuted ? "Unmute notifications" : "Mute notifications"}</span>
      </button>
      <button
        type="button"
        className="chat-more-item"
        role="menuitem"
        onClick={onArchive}
        disabled={busy}
      >
        <ChatIcon name="archive" size={16} />
        <span>Archive chat</span>
      </button>
      <div className="chat-more-divider" />
      <button
        type="button"
        className="chat-more-item is-danger"
        role="menuitem"
        onClick={onLeave}
        disabled={busy}
      >
        <ChatIcon name="leave" size={16} />
        <span>{isGroup ? "Leave conversation" : "Delete chat"}</span>
      </button>
    </div>
  );
}
