"use client";

import toast from "react-hot-toast";
import { ChatAction, ChatActionId } from "@/constants/chatActions";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  actions: ChatAction[];
  className?: string;
  compact?: boolean;
  /** Optional dispatcher; when provided, action ids are routed to the parent. */
  onAction?: (id: ChatActionId) => void;
  /** Map of action ids to "active" — used for toggleable items (mute/pin). */
  activeMap?: Partial<Record<ChatActionId, boolean>>;
};

/**
 * Renders a row of icon buttons for chat features.
 * If a parent passes `onAction`, that callback is invoked with the action id.
 * Otherwise, planned actions show a "coming soon" toast.
 */
export default function ChatToolbar({
  actions,
  className = "",
  compact = false,
  onAction,
  activeMap,
}: Props) {
  function handleAction(action: ChatAction) {
    if (onAction) {
      onAction(action.id);
      return;
    }
    if (action.status === "implemented") return;
    toast(`${action.label} — coming soon`, {
      icon: "🚧",
      duration: 2200,
    });
  }

  return (
    <div
      className={`chat-toolbar ${compact ? "chat-toolbar--compact" : ""} ${className}`.trim()}
    >
      {actions.map((action) => {
        const active = activeMap?.[action.id] ?? false;
        return (
          <button
            key={action.id}
            type="button"
            className={`chat-icon-button ${active ? "is-active" : ""}`.trim()}
            aria-label={action.label}
            aria-pressed={active}
            title={action.label}
            onClick={() => handleAction(action)}
          >
            <ChatIcon name={action.icon} size={compact ? 18 : 20} />
          </button>
        );
      })}
    </div>
  );
}
