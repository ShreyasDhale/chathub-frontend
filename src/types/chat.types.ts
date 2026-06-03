/**
 * Shared domain types for conversations, users, and messages.
 * See Backend_Requirements.txt for the full API contract.
 */

export type User = {
  id: string;
  name: string;
  isOnline: boolean;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export type ChatListItem = {
  conversationid: number;
  typecode: 'GROUP' | 'ONE_TO_ONE';
  chatname: string;
  createdbyuserid: number;
  creationdate: string; // ISO string
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
};

export type StartChatRequest = {
  conversationid: 0;
  conversationname: string;
  members: number[];
};
