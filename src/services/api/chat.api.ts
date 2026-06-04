import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import {
  ChatListItem,
  ConversationDetail,
  ConversationMember,
  StartChatRequest,
} from "@/types/chat.types";

/** Creates a new 1:1 or group conversation. Toast suppressed — modal shows errors. */
export function startChat(payload: StartChatRequest) {
  return apiRequest<DynamicApiResponse<ChatListItem, null>>(
    "/Conversations/StartChat",
    { method: "POST", body: payload, showToast: false }
  );
}

/** GET /Conversations/GetConversationDetails/{id} */
export function getConversationDetails(conversationId: number) {
  return apiRequest<DynamicApiResponse<ConversationDetail, null>>(
    `/Conversations/GetConversationDetails/${conversationId}`,
    { method: "GET", showToast: false }
  );
}

/** GET /Conversations/GetMembers/{id} */
export function getConversationMembers(conversationId: number) {
  return apiRequest<DynamicApiResponse<ConversationMember[], null>>(
    `/Conversations/GetMembers/${conversationId}`,
    { method: "GET", showToast: false }
  );
}

/** GET /Conversations/Search?query=&cursor=&pageSize= */
export function searchConversations(
  query: string,
  cursor?: string,
  pageSize = 30
) {
  const params = new URLSearchParams({ query, pageSize: pageSize.toString() });
  if (cursor) params.set("cursor", cursor);
  return apiRequest<DynamicApiResponse<ChatListItem[], null>>(
    `/Conversations/Search?${params}`,
    { method: "GET", showToast: false }
  );
}

/** POST /Conversations/Mute */
export function muteConversation(conversationId: number, muted: boolean) {
  return apiRequest<DynamicApiResponse<null, null>>("/Conversations/Mute", {
    method: "POST",
    body: { ConversationId: conversationId, Muted: muted },
    showToast: true,
  });
}

/** POST /Conversations/Pin */
export function pinConversation(conversationId: number, pinned: boolean) {
  return apiRequest<DynamicApiResponse<null, null>>("/Conversations/Pin", {
    method: "POST",
    body: { ConversationId: conversationId, Pinned: pinned },
    showToast: true,
  });
}

/** POST /Conversations/Archive */
export function archiveConversation(conversationId: number) {
  return apiRequest<DynamicApiResponse<null, null>>("/Conversations/Archive", {
    method: "POST",
    body: { ConversationId: conversationId },
    showToast: true,
  });
}

/** DELETE /Conversations/Leave */
export function leaveConversationRest(conversationId: number) {
  return apiRequest<DynamicApiResponse<null, null>>("/Conversations/Leave", {
    method: "DELETE",
    body: { ConversationId: conversationId },
    showToast: true,
  });
}

/** PUT /Conversations/Rename */
export function renameConversation(conversationId: number, name: string) {
  return apiRequest<DynamicApiResponse<null, null>>("/Conversations/Rename", {
    method: "PUT",
    body: { ConversationId: conversationId, ConversationName: name },
    showToast: true,
  });
}

/** POST /Conversations/AddMembers */
export function addMembers(conversationId: number, members: number[]) {
  return apiRequest<DynamicApiResponse<null, null>>(
    "/Conversations/AddMembers",
    {
      method: "POST",
      body: { ConversationId: conversationId, Members: members },
      showToast: true,
    }
  );
}

/** DELETE /Conversations/RemoveMember */
export function removeMember(conversationId: number, userId: number) {
  return apiRequest<DynamicApiResponse<null, null>>(
    "/Conversations/RemoveMember",
    {
      method: "DELETE",
      body: { ConversationId: conversationId, UserId: userId },
      showToast: true,
    }
  );
}
