/**
 * Chat action definitions used by the UI toolbar.
 * Each action maps to a backend capability (REST or SignalR) and is dispatched
 * by id through ChatToolbar's `onAction` handler.
 */

export type ChatActionPlacement = "header" | "input" | "sidebar";

export type ChatActionStatus = "implemented" | "planned";

export type ChatActionId =
  | "search-messages"
  | "voice-call"
  | "video-call"
  | "conversation-info"
  | "group-members"
  | "mute-chat"
  | "unmute-chat"
  | "pin-chat"
  | "unpin-chat"
  | "more-options"
  | "archive-chat"
  | "leave-chat"
  | "rename-chat"
  | "attach-file"
  | "emoji-picker"
  | "voice-message"
  | "search-chats"
  | "settings"
  | "new-chat";

export type ChatActionIcon =
  | "search"
  | "call"
  | "video"
  | "info"
  | "members"
  | "mute"
  | "unmute"
  | "pin"
  | "more"
  | "attach"
  | "emoji"
  | "voice"
  | "newChat"
  | "settings"
  | "archive"
  | "leave"
  | "edit";

export type ChatAction = {
  id: ChatActionId;
  label: string;
  icon: ChatActionIcon;
  placement: ChatActionPlacement;
  status: ChatActionStatus;
  /** Human-readable backend dependency for documentation alignment */
  backendNote: string;
};

/** Actions shown in the active conversation header */
export const CHAT_HEADER_ACTIONS: ChatAction[] = [
  {
    id: "search-messages",
    label: "Search in chat",
    icon: "search",
    placement: "header",
    status: "implemented",
    backendNote: "GET /Messages/Search?conversationId=&query=&page=&pageSize=",
  },
  {
    id: "conversation-info",
    label: "Conversation info",
    icon: "info",
    placement: "header",
    status: "implemented",
    backendNote: "GET /Conversations/GetConversationDetails/{conversationId}",
  },
  {
    id: "group-members",
    label: "Members",
    icon: "members",
    placement: "header",
    status: "implemented",
    backendNote: "GET /Conversations/GetMembers/{conversationId}",
  },
  {
    id: "more-options",
    label: "More options",
    icon: "more",
    placement: "header",
    status: "implemented",
    backendNote: "Mute, Pin, Archive, Leave",
  },
];

/** Actions shown beside the message composer */
export const CHAT_INPUT_ACTIONS: ChatAction[] = [
  {
    id: "emoji-picker",
    label: "Emoji",
    icon: "emoji",
    placement: "input",
    status: "implemented",
    backendNote: "Client-side emoji picker",
  },
];

/** Actions in the sidebar header */
export const SIDEBAR_ACTIONS: ChatAction[] = [
  {
    id: "search-chats",
    label: "Search conversations & people",
    icon: "search",
    placement: "sidebar",
    status: "implemented",
    backendNote: "GET /Conversations/Search and GET /Users/Search",
  },
  {
    id: "settings",
    label: "Settings & profile",
    icon: "settings",
    placement: "sidebar",
    status: "implemented",
    backendNote: "GET /Users/Profile, PUT /Users/UpdateProfile, PUT /Users/ChangePassword",
  },
];
