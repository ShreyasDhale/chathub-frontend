import { apiRequest } from "./httpClient";
import { DynamicApiResponse } from "../../types/api.types"; 
import { ChatListItem } from "../../types/chat.types";

export function loadchats() {
  return apiRequest<DynamicApiResponse<ChatListItem[],null>>("/Conversations/GetUserConversations", {
    method: "GET",
  });
}