import { useEffect } from "react";
import {
  createSignalRConnection,
  stopSignalRConnection,
} from "../services/socket/signalrClient";
import { registerChatEvents } from "../services/socket/chat.socket";
import { useChatStore } from "../store/chat.store";

export function useSignalR(token: string | null) {
  const setConnectionStatus = useChatStore(
    (state) => state.setConnectionStatus
  );

  useEffect(() => {
    if (!token) return;

    const connection = createSignalRConnection(token);

    connection
      .start()
      .then(() => {
        setConnectionStatus(true);
        registerChatEvents();
      })
      .catch(() => {
        setConnectionStatus(false);
      });

    return () => {
      stopSignalRConnection();
    };
  }, [token, setConnectionStatus]);
}
