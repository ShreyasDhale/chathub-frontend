/**
 * Chat action definitions used by the UI toolbar.
 * Each action maps to a planned or implemented backend capability.
 * Icons are rendered via ChatIcon using the `icon` key.
 */

export type ChatActionPlacement = "header" | "input" | "sidebar";

export type ChatActionStatus = "implemented" | "planned";

export type ChatAction = {
  id: string;
  label: string;
  icon:
    | "search"
    | "call"
    | "video"
    | "info"
    | "members"
    | "mute"
    | "pin"
    | "more"
    | "attach"
    | "emoji"
    | "voice"
    | "newChat"
    | "settings";
  placement: ChatActionPlacement;
  status: ChatActionStatus;
  /** Human-readable backend dependency for Backend_Requirements.txt alignment */
  backendNote: string;
};

/** Actions shown in the active conversation header */
export const CHAT_HEADER_ACTIONS: ChatAction[] = [
  {
    id: "search-messages",
    label: "Search in chat",
    icon: "search",
    placement: "header",
    status: "planned",
    backendNote: "GET /Messages/Search?conversationId=&query=&page=&pageSize=",
  },
  {
    id: "voice-call",
    label: "Voice call",
    icon: "call",
    placement: "header",
    status: "planned",
    backendNote: "SignalR: StartCall / CallOffer / CallAnswer / EndCall",
  },
  {
    id: "video-call",
    label: "Video call",
    icon: "video",
    placement: "header",
    status: "planned",
    backendNote: "SignalR: StartVideoCall / WebRTC signaling events",
  },
  {
    id: "conversation-info",
    label: "Conversation info",
    icon: "info",
    placement: "header",
    status: "planned",
    backendNote: "GET /Conversations/GetConversationDetails/{conversationId}",
  },
  {
    id: "group-members",
    label: "Members",
    icon: "members",
    placement: "header",
    status: "planned",
    backendNote: "GET /Conversations/GetMembers/{conversationId}",
  },
  {
    id: "mute-chat",
    label: "Mute notifications",
    icon: "mute",
    placement: "header",
    status: "planned",
    backendNote: "POST /Conversations/Mute",
  },
  {
    id: "pin-chat",
    label: "Pin chat",
    icon: "pin",
    placement: "header",
    status: "planned",
    backendNote: "POST /Conversations/Pin",
  },
  {
    id: "more-options",
    label: "More options",
    icon: "more",
    placement: "header",
    status: "planned",
    backendNote: "POST /Conversations/Archive, DELETE /Conversations/Leave",
  },
];

/** Actions shown beside the message composer */
export const CHAT_INPUT_ACTIONS: ChatAction[] = [
  {
    id: "attach-file",
    label: "Attach file",
    icon: "attach",
    placement: "input",
    status: "planned",
    backendNote: "POST /Messages/UploadAttachment (multipart)",
  },
  {
    id: "emoji-picker",
    label: "Emoji",
    icon: "emoji",
    placement: "input",
    status: "planned",
    backendNote: "Client-side only; optional GET /Emojis",
  },
  {
    id: "voice-message",
    label: "Voice message",
    icon: "voice",
    placement: "input",
    status: "planned",
    backendNote: "POST /Messages/UploadVoiceNote (multipart)",
  },
];

/** Actions in the sidebar header */
export const SIDEBAR_ACTIONS: ChatAction[] = [
  {
    id: "search-chats",
    label: "Search conversations",
    icon: "search",
    placement: "sidebar",
    status: "planned",
    backendNote: "GET /Conversations/Search?query=&page=&pageSize=",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    placement: "sidebar",
    status: "planned",
    backendNote: "GET /Users/Profile, PUT /Users/UpdateProfile",
  },
];
