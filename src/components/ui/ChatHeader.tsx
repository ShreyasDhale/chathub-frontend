import { ChatListItem } from "@/types/chat.types";
import { CHAT_HEADER_ACTIONS } from "@/constants/chatActions";
import ChatToolbar from "@/components/ui/ChatToolbar";

type Props = {
  chat?: ChatListItem;
  onBack?: () => void;
};

/**
 * Active conversation top bar: avatar, title, and quick actions
 * (search, call, info, members, etc.).
 */
export default function ChatHeader({ chat, onBack }: Props) {
  if (!chat) return null;

  const headerActions = CHAT_HEADER_ACTIONS.filter(
    (action) =>
      chat.typecode === "GROUP" || action.id !== "group-members"
  );

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

      <ChatToolbar actions={headerActions} compact className="chat-header-actions" />
    </div>
  );
}
