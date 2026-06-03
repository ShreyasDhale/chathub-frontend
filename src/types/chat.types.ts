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
  username: 'GROUP' | 'ONE_TO_ONE';
  email: string;
  userstatusid: number;
  createdby: string; 
  creationdate: string; // ISO string
  updatedby: string;
  updateddate: string; // ISO string
};
