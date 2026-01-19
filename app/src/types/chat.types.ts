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

