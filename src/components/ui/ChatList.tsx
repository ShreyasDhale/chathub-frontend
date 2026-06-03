import { ChatListItem } from "@/types/chat.types";

type Props = {
  chats: ChatListItem[];
  loading: boolean;
  activeChatId: number | null;
  onSelect: (id: number) => void;
  onLogout: () => void;
  onNewChat: () => void;
  showMenu: boolean;
  toggleMenu: () => void;
  onCloseMenu?: () => void;
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
  onCloseMenu,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">C</div>
          <h3>Chats</h3>
        </div>
        <button className="menu-button" onClick={toggleMenu} aria-label="Menu">
          ⋮
        </button>
        {showMenu && (
          <>
            <button
              type="button"
              className="menu-backdrop"
              onClick={onCloseMenu}
              aria-label="Close menu"
            />
            <div className="menu-dropdown">
              <button className="menu-item" onClick={onLogout}>
                Logout
              </button>
              <button className="menu-item menu-item-accent" onClick={onNewChat}>
                <span className="menu-item-icon">+</span>
                New Chat
              </button>
            </div>
          </>
        )}
      </div>

      <ul className="user-list">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="user shimmer">
                <div className="shimmer-box" />
                <div className="shimmer-lines">
                  <div className="shimmer-line" />
                  <div className="shimmer-line short" />
                </div>
              </li>
            ))
          : chats.length === 0
            ? (
              <li className="sidebar-empty">
                <div className="sidebar-empty-icon">💬</div>
                <p>No conversations yet</p>
                <span>Use New Chat to get started</span>
              </li>
            )
            : chats.map((chat) => (
                <li
                  key={chat.conversationid}
                  className={`user ${activeChatId === chat.conversationid ? "active" : ""}`}
                  onClick={() => onSelect(chat.conversationid)}
                >
                  <div className="avatar">{chat.chatname[0]?.toUpperCase()}</div>
                  <div className="user-info">
                    <span className="name">{chat.chatname}</span>
                    <span className={`chat-type ${chat.typecode === "GROUP" ? "group" : "direct"}`}>
                      {chat.typecode === "GROUP" ? "Group" : "Direct"}
                    </span>
                  </div>
                </li>
              ))}
      </ul>
    </aside>
  );
}
