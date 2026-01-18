import { getSignalRConnection } from "./signalrClient";
import { useChatStore } from "../../store/chat.store";
import { Message, User } from "../../types/chat.types";

export function registerChatEvents() {
  const connection = getSignalRConnection();
  if (!connection) return;

  connection.on("ReceiveMessage", (message: Message) => {
    useChatStore.getState().addMessage(message);
  });

  connection.on("UserPresenceChanged", (users: User[]) => {
    useChatStore.getState().setOnlineUsers(users);
  });

  connection.onreconnecting(() => {
    useChatStore.getState().setConnectionStatus(false);
  });

  connection.onreconnected(() => {
    useChatStore.getState().setConnectionStatus(true);
  });
}
