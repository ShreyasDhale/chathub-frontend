import toast from "react-hot-toast";
import {
  getSignalRConnection,
  areEventsRegistered,
  markEventsRegistered,
} from "@/services/socket/signalrClient";
import { registerCallEvents } from "@/services/socket/callEvents";
import { useChatStore } from "@/store/chat.store";
import { useConversationStore } from "@/store/conversation.store";
import { MessagePayload, User } from "@/types/chat.types";

let reconnectToastId: string | null = null;

export function registerChatEvents() {
  const connection = getSignalRConnection();
  if (!connection || areEventsRegistered()) return;

  // ── Inbound messages ────────────────────────────────────────────────────
  // Backend sends BOTH "MessageReceived" and "ReceiveMessage" — use only one
  connection.on("MessageReceived", (payload: MessagePayload) => {
    useChatStore.getState().addMessage(payload);
    useChatStore.getState().incrementUnread(payload.conversationId);
    useConversationStore.getState().updateLastMessage(
      payload.conversationId,
      payload.message,
      payload.sentAt
    );
  });

  // ── Typing indicator ────────────────────────────────────────────────────
  connection.on(
    "UserTyping",
    (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      useChatStore
        .getState()
        .setTyping(data.conversationId, data.userId, data.isTyping);
    }
  );

  // ── Message edit / delete ───────────────────────────────────────────────
  connection.on(
    "MessageEdited",
    (data: { messageId: number; conversationId: number; content: string }) => {
      useChatStore
        .getState()
        .editMessage(data.conversationId, data.messageId, data.content);
    }
  );

  connection.on(
    "MessageDeleted",
    (data: { messageId: number; conversationId: number }) => {
      useChatStore
        .getState()
        .deleteMessage(data.conversationId, data.messageId);
    }
  );

  // ── Read receipts ───────────────────────────────────────────────────────
  connection.on(
    "MessagesRead",
    (data: { conversationId: number; userId: number; lastReadMessageId: number }) => {
      // Could update per-message read status here in future
    }
  );

  // ── Presence ────────────────────────────────────────────────────────────
  connection.on("UserPresenceChanged", (users: User[]) => {
    useChatStore.getState().setOnlineUsers(users);
  });

  // ── Conversation updates ────────────────────────────────────────────────
  connection.on(
    "ConversationUpdated",
    (data: { conversationId: number; chatname: string; updatedAt: string }) => {
      useConversationStore
        .getState()
        .updateConversationName(data.conversationId, data.chatname);
      toast.success("Conversation updated");
    }
  );

  connection.on(
    "MemberAdded",
    (data: {
      conversationId: number;
      user: { userid: number; username: string };
    }) => {
      useConversationStore
        .getState()
        .addMember(data.conversationId, data.user);
      toast.success(`${data.user.username} joined the conversation`);
    }
  );

  connection.on(
    "MemberRemoved",
    (data: { conversationId: number; userId: number; username?: string }) => {
      useConversationStore
        .getState()
        .removeMember(data.conversationId, data.userId);
      toast(
        `${data.username || "User"} left the conversation`
      );
    }
  );

  // ── Calling events (fully implemented in Phase 3) ──────────────────────
  // These are now handled by registerCallEvents() below

  // ── Reconnect lifecycle ─────────────────────────────────────────────────
  connection.onreconnecting(() => {
    useChatStore.getState().setConnectionStatus(false);
    reconnectToastId = toast.loading("Reconnecting to server...");
  });

  connection.onreconnected(() => {
    useChatStore.getState().setConnectionStatus(true);
    if (reconnectToastId) {
      toast.dismiss(reconnectToastId);
      reconnectToastId = null;
    }
    toast.success("Connected");
  });

  connection.onclose(() => {
    useChatStore.getState().setConnectionStatus(false);
    if (reconnectToastId) {
      toast.dismiss(reconnectToastId);
      reconnectToastId = null;
    }
    toast.error("Disconnected from server");
  });

  // Register call events (Phase 3)
  registerCallEvents();

  markEventsRegistered();
}
