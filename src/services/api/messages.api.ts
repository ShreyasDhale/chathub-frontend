import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { MessageRow } from "@/types/chat.types";

export type GetByConversationParams = {
  conversationId: number;
  beforeMessageId?: number;
  pageSize?: number;
};

/** GET /Messages/GetByConversation?conversationId=&beforeMessageId=&pageSize= */
export function getByConversation({
  conversationId,
  beforeMessageId,
  pageSize = 50,
}: GetByConversationParams) {
  const params = new URLSearchParams({
    conversationId: conversationId.toString(),
    pageSize: pageSize.toString(),
  });
  if (beforeMessageId) params.set("beforeMessageId", beforeMessageId.toString());

  return apiRequest<DynamicApiResponse<MessageRow[], null>>(
    `/Messages/GetByConversation?${params}`,
    { method: "GET", showToast: false }
  );
}

/** GET /Messages/Search?conversationId=&query=&page=&pageSize= */
export function searchMessages(
  conversationId: number,
  query: string,
  page = 1,
  pageSize = 20
) {
  const params = new URLSearchParams({
    conversationId: conversationId.toString(),
    query,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return apiRequest<DynamicApiResponse<MessageRow[], null>>(
    `/Messages/Search?${params}`,
    { method: "GET", showToast: false }
  );
}

/** POST /Messages/Send — REST fallback (normally send via SignalR) */
export function sendMessageRest(payload: {
  ConversationId: number;
  Message: string;
  ClientMessageId?: number;
  MessageTypeId?: number;
  ReplyToMessageId?: number;
}) {
  return apiRequest<DynamicApiResponse<null, null>>("/Messages/Send", {
    method: "POST",
    body: payload,
    showToast: false,
  });
}

/** PUT /Messages/Edit */
export function editMessage(messageId: number, content: string) {
  return apiRequest<DynamicApiResponse<null, null>>("/Messages/Edit", {
    method: "PUT",
    body: { MessageId: messageId, Content: content },
    showToast: true,
  });
}

/** DELETE /Messages/Delete */
export function deleteMessage(messageId: number) {
  return apiRequest<DynamicApiResponse<null, null>>("/Messages/Delete", {
    method: "DELETE",
    body: { MessageId: messageId },
    showToast: true,
  });
}

/** POST /Messages/MarkAsRead */
export function markAsRead(conversationId: number, lastReadMessageId: number) {
  return apiRequest<DynamicApiResponse<null, null>>("/Messages/MarkAsRead", {
    method: "POST",
    body: { ConversationId: conversationId, LastReadMessageId: lastReadMessageId },
    showToast: false,
  });
}
