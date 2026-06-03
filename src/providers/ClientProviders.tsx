"use client";

import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/providers/SocketProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12)",
            color: "#0f172a",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#6366f1", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </SocketProvider>
  );
}
