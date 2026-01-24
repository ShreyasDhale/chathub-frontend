// components/ChatHeader.tsx

import { ChatListItem } from "../../types/chat.types";

type Props = {
  chat?: ChatListItem;
};

export default function ChatHeader({ chat }: Props) {
  if (!chat) return null;

  return (
    <div className="chat-header">
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
