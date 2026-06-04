import { getSignalRConnection } from "@/services/socket/signalrClient";

/** Subscribe the socket connection to a conversation room for live messages. */
export async function joinConversation(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;
  await connection.invoke("JoinConversation", conversationId);
}

/** Unsubscribe when switching chats or unmounting the dashboard. */
export async function leaveConversation(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;
  await connection.invoke("LeaveConversation", conversationId);
}

/** Send a message through SignalR hub. */
export async function sendMessageSignalR(
  conversationId: number,
  clientMessageId: number,
  message: string
) {
  const connection = getSignalRConnection();
  if (!connection) return;
  await connection.invoke("SendMessage", conversationId, clientMessageId, message);
}

/** Notify others that the current user started typing. */
export async function typingStarted(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;
  try {
    await connection.invoke("TypingStarted", conversationId);
  } catch {
    // non-fatal — typing indicators are best-effort
  }
}

/** Notify others that the current user stopped typing. */
export async function typingStopped(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;
  try {
    await connection.invoke("TypingStopped", conversationId);
  } catch {
    // non-fatal
  }
}

/** Mark all messages in a conversation as read up to lastReadMessageId. */
export async function markMessagesReadSignalR(
  conversationId: number,
  lastReadMessageId: number
) {
  const connection = getSignalRConnection();
  if (!connection) return;
  try {
    await connection.invoke("MarkMessagesRead", conversationId, lastReadMessageId);
  } catch {
    // non-fatal
  }
}
