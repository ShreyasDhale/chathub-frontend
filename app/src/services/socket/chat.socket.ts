import toast from "react-hot-toast";
import {
  getSignalRConnection,
  areEventsRegistered,
  markEventsRegistered,
} from "./signalrClient";
import { useChatStore } from "../../store/chat.store";
import { Message, User } from "../../types/chat.types";

let reconnectToastId: string | null = null;

export function registerChatEvents() {
  const connection = getSignalRConnection();
  if (!connection || areEventsRegistered()) return;

  connection.on("ReceiveMessage", (message: Message) => {
    useChatStore.getState().addMessage(message);
  });

  connection.on("UserPresenceChanged", (users: User[]) => {
    useChatStore.getState().setOnlineUsers(users);
  });

  connection.onreconnecting(() => {
    useChatStore.getState().setConnectionStatus(false);

    reconnectToastId = toast.loading("Reconnecting to server...");
  });

  connection.onreconnected(() => {
    useChatStore.getState().setConnectionStatus(true);

    if (reconnectToastId) {
      toast.dismiss(reconnectToastId);
      reconnectToastId = null;
    }

    toast.success("Connected");
  });

  connection.onclose(() => {
    useChatStore.getState().setConnectionStatus(false);

    if (reconnectToastId) {
      toast.dismiss(reconnectToastId);
      reconnectToastId = null;
    }

    toast.error("Disconnected from server");
  });

  markEventsRegistered();
}
