"use client";

import toast from "react-hot-toast";
import { ChatAction } from "@/constants/chatActions";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  actions: ChatAction[];
  className?: string;
  compact?: boolean;
};

/**
 * Renders a row of icon buttons for chat features.
 * Planned actions show a toast until the backend endpoint is available.
 */
export default function ChatToolbar({
  actions,
  className = "",
  compact = false,
}: Props) {
  function handleAction(action: ChatAction) {
    if (action.status === "implemented") return;

    toast(`${action.label} — coming soon`, {
      icon: "🚧",
      duration: 2500,
    });
  }

  return (
    <div className={`chat-toolbar ${compact ? "chat-toolbar--compact" : ""} ${className}`.trim()}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="chat-icon-button"
          aria-label={action.label}
          title={action.label}
          onClick={() => handleAction(action)}
        >
          <ChatIcon name={action.icon} size={compact ? 18 : 20} />
        </button>
      ))}
    </div>
  );
}
