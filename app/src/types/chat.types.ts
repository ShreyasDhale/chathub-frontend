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
