import { ChatListItem } from "@/types/chat.types";

type Props = {
  chat?: ChatListItem;
  onBack?: () => void;
};

export default function ChatHeader({ chat, onBack }: Props) {
  if (!chat) return null;

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
    </div>
  );
}
