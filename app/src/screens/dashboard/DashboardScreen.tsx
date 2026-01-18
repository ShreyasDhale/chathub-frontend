"use client";

export default function DashboardScreen() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>
        </div>

        <ul className="user-list">
          <li className="user active">
            <div className="avatar">S</div>
            <div className="user-info">
              <span className="name">Shreyas</span>
              <span className="status online">Online</span>
            </div>
          </li>

          <li className="user">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="name">Amit</span>
              <span className="status offline">Offline</span>
            </div>
          </li>

          <li className="user">
            <div className="avatar">R</div>
            <div className="user-info">
              <span className="name">Rahul</span>
              <span className="status online">Online</span>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="chat-area">
        <div className="chat-placeholder">
          Select a chat to start messaging
        </div>
      </main>
    </div>
  );
}
