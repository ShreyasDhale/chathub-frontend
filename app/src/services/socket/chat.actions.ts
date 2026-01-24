import { getSignalRConnection } from "./signalrClient";

export async function joinConversation(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;

  await connection.invoke("JoinConversation", conversationId);
}

export async function leaveConversation(conversationId: number) {
  const connection = getSignalRConnection();
  if (!connection) return;

  await connection.invoke("LeaveConversation", conversationId);
}

