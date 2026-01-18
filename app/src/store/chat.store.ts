import { create } from "zustand";
import { Message, User } from "../types/chat.types";

type ChatState = {
  messages: Message[];
  onlineUsers: User[];
  isConnected: boolean;

  addMessage: (msg: Message) => void;
  setOnlineUsers: (users: User[]) => void;
  setConnectionStatus: (status: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineUsers: [],
  isConnected: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setConnectionStatus: (status) => set({ isConnected: status }),

  reset: () =>
    set({
      messages: [],
      onlineUsers: [],
      isConnected: false,
    }),
}));
