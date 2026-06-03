"use client";

import { useState } from "react";
import { CHAT_INPUT_ACTIONS } from "@/constants/chatActions";
import ChatToolbar from "@/components/ui/ChatToolbar";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

/**
 * Message composer with attachment/emoji/voice shortcuts and send button.
 * Send uses the existing SignalR SendMessage hub method.
 */
export default function ChatInput({ onSend, disabled = false }: Props) {
  const [message, setMessage] = useState("");

  function submit() {
    if (!message.trim() || disabled) return;
    onSend(message);
    setMessage("");
  }

  return (
    <div className="chat-input">
      <ChatToolbar actions={CHAT_INPUT_ACTIONS} compact className="chat-input-actions" />

      <input
        type="text"
        className="chat-textbox"
        placeholder="Type a message"
        value={message}
        disabled={disabled}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <button
        type="button"
        className="send-button"
        disabled={disabled || !message.trim()}
        onClick={submit}
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
