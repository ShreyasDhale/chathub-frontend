import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { ChatListItem, UsersListItem } from "@/types/chat.types";

export function loadchats() {
  return apiRequest<DynamicApiResponse<ChatListItem[], null>>(
    "/Conversations/GetUserConversations",
    { method: "GET" }
  );
}

export function loadusers() {
  return apiRequest<DynamicApiResponse<UsersListItem[], null>>(
    "/Users/GetAllUsers",
    { method: "GET" }
  );
}
