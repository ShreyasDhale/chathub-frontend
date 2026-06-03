import { apiRequest } from "@/services/api/httpClient";
import { DynamicApiResponse } from "@/types/api.types";
import { ChatListItem, UsersListItem } from "@/types/chat.types";

/** Loads the authenticated user's conversation sidebar list. */
export function loadchats() {
  return apiRequest<DynamicApiResponse<ChatListItem[], null>>(
    "/Conversations/GetUserConversations",
    { method: "GET" }
  );
}

/** Loads all users for the New Chat picker (current user filtered client-side). */
export function loadusers() {
  return apiRequest<DynamicApiResponse<UsersListItem[], null>>(
    "/Users/GetAllUsers",
    { method: "GET" }
  );
}
