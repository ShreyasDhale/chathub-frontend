import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { ChatListItem, StartChatRequest } from "@/types/chat.types";

export function startChat(payload: StartChatRequest) {
  return apiRequest<DynamicApiResponse<ChatListItem, null>>(
    "/Conversations/StartChat",
    { method: "POST", body: payload, showToast: false }
  );
}
