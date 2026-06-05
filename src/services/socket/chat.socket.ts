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
import { getUserId } from "@/utils/auth.storage";

let reconnectToastId: string | null = null;

/** Backend MessageReceivedPayload uses these casings; tolerate variations. */
function normalizeMessage(raw: any): MessagePayload {
  return {
    messageId: raw.messageId ?? raw.MessageId ?? raw.messageid,
    conversationId: raw.conversationId ?? raw.ConversationId ?? raw.conversationid,
    senderId: raw.senderId ?? raw.SenderId ?? raw.senderuserid,
    senderName: raw.senderName ?? raw.SenderName,
    message: raw.message ?? raw.Message ?? raw.messagecontent ?? "",
    clientMessageId: raw.clientMessageId ?? raw.ClientMessageId,
    sentAt: raw.sentAt ?? raw.SentAt ?? raw.creationdate ?? new Date().toISOString(),
    isEdited: raw.isEdited ?? raw.IsEdited,
    isDeleted: raw.isDeleted ?? raw.IsDeleted,
  };
}

export function registerChatEvents() {
  const connection = getSignalRConnection();
  if (!connection || areEventsRegistered()) return;

  // ── Inbound messages ────────────────────────────────────────────────────
  // Backend currently emits BOTH "MessageReceived" and "ReceiveMessage" for
  // legacy reasons. We handle only the canonical one and dedup by id in the
  // store anyway.
  connection.on("MessageReceived", (raw: any) => {
    const payload = normalizeMessage(raw);
    if (!payload.conversationId) return;
    const myId = Number(getUserId() ?? 0);
    const state = useChatStore.getState();

    state.addMessage(payload);
    useConversationStore.getState().updateLastMessage(
      payload.conversationId,
      payload.message,
      payload.sentAt
    );

    const isMine = payload.senderId === myId;
    const isActive = state.activeConversationId === payload.conversationId;

    // Only bump unread for non-active conversations and not from self.
    if (!isMine && !isActive) {
      state.incrementUnread(payload.conversationId);
    }
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
  // Backend hub emits "MessagesRead" via MarkMessagesReadAsync.
  connection.on(
    "MessagesRead",
    (data: { conversationId: number; userId: number; lastReadMessageId: number }) => {
      useChatStore
        .getState()
        .setReadReceipt(data.conversationId, data.userId, data.lastReadMessageId);
    }
  );

  // ── Per-message delivered / read fine-grained events (when supported) ───
  connection.on(
    "MessageDelivered",
    (data: { messageId: number; userId: number; conversationId?: number }) => {
      // Treat delivered as "at least delivered up to messageId" for that user
      if (data.conversationId) {
        useChatStore
          .getState()
          .setReadReceipt(data.conversationId, data.userId, data.messageId);
      }
    }
  );

  connection.on(
    "MessageRead",
    (data: { messageId: number; userId: number; conversationId?: number }) => {
      if (data.conversationId) {
        useChatStore
          .getState()
          .setReadReceipt(data.conversationId, data.userId, data.messageId);
      }
    }
  );

  // ── Presence ────────────────────────────────────────────────────────────
  // Bulk push (legacy, server may or may not emit)
  connection.on("UserPresenceChanged", (payload: User[] | { userId: number; isOnline: boolean; lastSeenAt?: string }) => {
    if (Array.isArray(payload)) {
      useChatStore.getState().setOnlineUsers(payload);
    } else if (payload && typeof payload === "object") {
      useChatStore.getState().setPresence(
        payload.userId,
        payload.isOnline,
        payload.lastSeenAt
      );
    }
  });

  // Granular per-user presence update from backend.
  connection.on(
    "UserPresence",
    (data: { userId: number; isOnline: boolean; lastSeenAt?: string }) => {
      useChatStore.getState().setPresence(data.userId, data.isOnline, data.lastSeenAt);
    }
  );

  // ── Conversation updates ────────────────────────────────────────────────
  connection.on(
    "ConversationUpdated",
    (data: { conversationId: number; chatname: string; updatedAt: string }) => {
      useConversationStore
        .getState()
        .updateConversationName(data.conversationId, data.chatname);
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
  });

  registerCallEvents();
  markEventsRegistered();
}
