/**
 * Shared domain types for conversations, users, and messages.
 * Aligned with backend MessageReceivedPayload and ChatFeatureDtos.
 */

export type Attachment = {
  attachmentId: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
};

export type User = {
  id: number;
  name: string;
  isOnline: boolean;
};

/** Matches backend MessageReceivedPayload exactly */
export type MessagePayload = {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName?: string;       // enriched client-side
  message: string;
  clientMessageId?: number;
  sentAt: string;            // ISO 8601
  isOptimistic?: boolean;    // true = not yet confirmed by server
  isEdited?: boolean;
  isDeleted?: boolean;
  attachments?: Attachment[]; // NEW: file/voice attachments
};

/** Shape returned by GET /Messages/GetByConversation */
export type MessageRow = {
  messageid: number;
  conversationid: number;
  senderuserid: number;
  username?: string;
  messagecontent: string;
  clientmessageid?: number;
  creationdate: string;
  isedited?: number;
  isdeleted?: number;
};

export type ChatListItem = {
  conversationid: number;
  typecode: "GROUP" | "ONE_TO_ONE";
  chatname: string;
  createdbyuserid: number;
  creationdate: string;
  ispinned?: number;
  ismuted?: number;
  lastmessage?: string;
  lastmessageat?: string;
  unreadcount?: number;
};

export type ConversationDetail = {
  conversationid: number;
  conversationname: string;
  typecode: "GROUP" | "ONE_TO_ONE";
  createdbyuserid: number;
  creationdate: string;
  membercount?: number;
};

export type ConversationMember = {
  userid: number;
  username: string;
  displayname?: string;
  avatarurl?: string;
  isadmin?: number;
  isonline?: number;
  lastseenat?: string;
};

export type UsersListItem = {
  userid: number;
  username: string;
  email: string;
  userstatusid: number;
  createdby: number;
  creationdate: string;
  updatedby: number;
  updatedate: string;
  isonline?: number;
};

export type StartChatRequest = {
  conversationid: 0;
  conversationname: string;
  members: number[];
};

export type UserProfile = {
  userid: number;
  username: string;
  email: string;
  displayname?: string;
  avatarurl?: string;
  bio?: string;
  lastseenat?: string;
  isonline?: number;
};

export type Notification = {
  notificationid: number;
  userid: number;
  notificationtypeid: number;
  title?: string;
  body?: string;
  isread: number;
  creationdate: string;
  relatedconversationid?: number;
};
