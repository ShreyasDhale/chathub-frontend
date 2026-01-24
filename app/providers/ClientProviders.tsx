"use client";

import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./SocketProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      {children}
      <Toaster position="top-right" />
    </SocketProvider>
  );
}
