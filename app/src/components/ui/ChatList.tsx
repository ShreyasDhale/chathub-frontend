import { ChatListItem, UsersListItem } from "../../types/chat.types";


type Props = {
  chats: ChatListItem[];
  users: UsersListItem[];
  loading: boolean;
  activeChatId: number | null;
  onSelect: (id: number) => void;
  onLogout: () => void;
  onNewChat: () => void;
  showMenu: boolean;
  toggleMenu: () => void;
};

export default function ChatList({
  chats,
  loading,
  activeChatId,
  onSelect,
  onLogout,
  onNewChat,
  showMenu,
  toggleMenu,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Chats</h3>
        <button className="menu-button" onClick={toggleMenu}>⋮</button>
        {showMenu && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={onLogout}>Logout</button>
            <button className="menu-item" onClick={onNewChat}>New Chat</button>
          </div>
        )}
      </div>

      <ul className="user-list">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <li key={i} className="user shimmer" />
            ))
          : chats.map(chat => (
              <li
                key={chat.conversationid}
                className={`user ${activeChatId === chat.conversationid ? "active" : ""}`}
                onClick={() => onSelect(chat.conversationid)}
              >
                <div className="avatar">{chat.chatname[0]}</div>
                <div className="user-info">
                  <span>{chat.chatname}</span>
                  <span>{chat.typecode}</span>
                </div>
              </li>
            ))}
      </ul>
    </aside>
  );
}
