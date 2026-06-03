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
