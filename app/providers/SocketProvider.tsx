"use client";

import { useEffect } from "react";
import {
  createSignalRConnection,
  startSignalRConnection,
  stopSignalRConnection,
} from "../src/services/socket/signalrClient";
import { registerChatEvents } from "../src/services/socket/chat.socket";
import { getToken } from "../src/utils/auth.storage";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = getToken();

    if (!token) {
      stopSignalRConnection();
      return;
    }

    createSignalRConnection(token);

    startSignalRConnection()
      .then(() => registerChatEvents())
      .catch(console.error);

    return () => {
      stopSignalRConnection();
    };
  }, []);

  return <>{children}</>;
}